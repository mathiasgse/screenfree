import type { CandidateData, RunStats, SerperResult } from '@/discovery/shared/types'
import {
  REGION_PRESETS,
  QUERY_TEMPLATES,
  ENRICHMENT_DELAY_MS,
  AI_SCORE_THRESHOLD,
} from '@/discovery/shared/constants'
import { searchSerper } from '@/discovery/worker/serper'
import { enrichWebsite } from '@/discovery/worker/enricher'
import { scoreCandidate } from '@/discovery/worker/scorer'
import { aiScoreCandidate } from '@/discovery/worker/ai-scorer'
import { generateDedupeKey, deduplicateResults } from '@/discovery/worker/dedup'
import { upsertCandidate } from '@/discovery/worker/upsert'
import { applyQualityGates } from '@/discovery/worker/quality-gates'

import type { BasePayload } from 'payload'

interface DiscoveryOptions {
  preset?: string
  country?: string
  limit: number
  dryRun: boolean
  existingRunId?: string
  existingPayload?: BasePayload
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Non-fatal helper to update progress on the discovery run record.
 * Swallows errors so a failed DB write never aborts the run.
 */
async function updateRunProgress(
  payload: BasePayload | null,
  runId: string | null,
  data: {
    phase?: 'searching' | 'processing' | 'finalizing'
    processed?: number
    total?: number
    stats?: Partial<RunStats>
  },
): Promise<void> {
  if (!payload || !runId) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      progress: {
        phase: data.phase,
        processed: data.processed,
        total: data.total,
      },
    }
    if (data.stats) {
      updateData.stats = data.stats
    }
    await payload.update({
      collection: 'discovery-runs',
      id: runId,
      data: updateData,
    })
  } catch (err) {
    console.warn(`[runner] Failed to update progress (non-fatal):`, err)
  }
}

/**
 * Build search queries from presets by combining QUERY_TEMPLATES with
 * microregions and keywords from the selected presets.
 */
function buildQueries(
  presets: typeof REGION_PRESETS,
  maxQueries: number,
): { query: string; region: string; country: string }[] {
  const queries: { query: string; region: string; country: string }[] = []

  for (const preset of presets) {
    for (const template of QUERY_TEMPLATES) {
      for (const microregion of preset.microregions) {
        for (const keyword of preset.keywords) {
          const query = template
            .replace('{keyword}', keyword)
            .replace('{microregion}', microregion)

          queries.push({
            query,
            region: `${preset.label} / ${microregion}`,
            country: preset.country,
          })

          if (queries.length >= maxQueries) {
            return queries
          }
        }
      }
    }
  }

  return queries
}

/**
 * Main discovery orchestrator.
 *
 * Flow:
 * 1. Resolve presets from options
 * 2. Build search queries from templates x microregions x keywords
 * 3. Execute searches via Serper API
 * 4. Domain-deduplicate results
 * 5. For each result: enrich, score, apply quality gates, optional AI scoring, upsert
 * 6. Track and return stats
 */
export async function runDiscovery(options: DiscoveryOptions): Promise<RunStats> {
  const stats: RunStats = {
    candidatesFound: 0,
    newCandidates: 0,
    duplicatesSkipped: 0,
    errors: 0,
  }

  // --- Initialize Payload early (for progress tracking) ---
  let payload: Awaited<ReturnType<typeof import('payload')['getPayload']>> | null =
    options.existingPayload ?? null
  let runId: string | null = options.existingRunId ?? null

  // --- Resolve presets ---
  let selectedPresets = REGION_PRESETS

  if (options.preset) {
    selectedPresets = REGION_PRESETS.filter((p) => p.key === options.preset)
    if (selectedPresets.length === 0) {
      throw new Error(
        `Unknown preset: ${options.preset}. Available: ${REGION_PRESETS.map((p) => p.key).join(', ')}`,
      )
    }
  } else if (options.country) {
    selectedPresets = REGION_PRESETS.filter(
      (p) => p.country === options.country!.toUpperCase(),
    )
    if (selectedPresets.length === 0) {
      throw new Error(
        `No presets found for country: ${options.country}. Available: AT, CH, DE, IT`,
      )
    }
  }

  console.log(
    `[runner] Using ${selectedPresets.length} preset(s): ${selectedPresets.map((p) => p.label).join(', ')}`,
  )

  // --- Build queries ---
  // Limit total queries to keep API usage reasonable
  const maxQueries = Math.min(options.limit * 2, 50)
  const queries = buildQueries(selectedPresets, maxQueries)
  console.log(`[runner] Built ${queries.length} search queries`)

  // --- Execute searches ---
  const allResults: (SerperResult & { regionGuess: string; source: string })[] = []

  // Update progress: searching phase
  await updateRunProgress(payload, runId, {
    phase: 'searching',
    processed: 0,
    total: queries.length,
  })

  let searchesCompleted = 0
  for (const { query, region, country } of queries) {
    try {
      console.log(`[runner] Searching: "${query}" (${country})`)
      const results = await searchSerper(query, country, 10)

      for (const result of results) {
        allResults.push({
          ...result,
          regionGuess: region,
          source: query,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[runner] Search error for "${query}": ${message}`)
      stats.errors++
    }

    searchesCompleted++
    if (searchesCompleted % 5 === 0 || searchesCompleted === queries.length) {
      await updateRunProgress(payload, runId, {
        phase: 'searching',
        processed: searchesCompleted,
        total: queries.length,
      })
    }
  }

  console.log(`[runner] Total raw results: ${allResults.length}`)

  // --- Domain-deduplicate ---
  const dedupedSerper = deduplicateResults(allResults)
  console.log(`[runner] After domain dedup: ${dedupedSerper.length}`)

  // Re-attach the regionGuess and source from the original results
  const deduped = dedupedSerper.map((r) => {
    const original = allResults.find((a) => a.link === r.link)
    return {
      ...r,
      regionGuess: original?.regionGuess ?? 'Unknown',
      source: original?.source ?? 'Unknown',
    }
  })

  // --- Limit results ---
  const limited = deduped.slice(0, options.limit)
  stats.candidatesFound = limited.length
  console.log(`[runner] Processing ${limited.length} candidates (limit: ${options.limit})`)

  // Update progress: processing phase
  await updateRunProgress(payload, runId, {
    phase: 'processing',
    processed: 0,
    total: limited.length,
    stats,
  })

  // --- Initialize Payload for CLI usage (fallback if not provided) ---
  if (!options.dryRun && !payload) {
    try {
      const { getPayload } = await import('payload')
      const config = (await import('@payload-config')).default
      payload = await getPayload({ config })

      if (!runId) {
        const run = await payload.create({
          collection: 'discovery-runs',
          data: {
            startedAt: new Date().toISOString(),
            status: 'running',
            preset: selectedPresets.map((p) => p.key).join(', '),
          },
        })
        runId = String(run.id)
        console.log(`[runner] Created discovery run: ${runId}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[runner] Failed to initialize Payload: ${message}`)
      console.log('[runner] Falling back to dry-run mode')
      payload = null
    }
  }

  // --- Process each candidate ---
  for (let i = 0; i < limited.length; i++) {
    const result = limited[i]
    const progress = `[${i + 1}/${limited.length}]`

    try {
      console.log(`${progress} Processing: ${result.title}`)

      // Generate dedupe key
      const dedupeKey = generateDedupeKey(result.link, result.title)

      // Enrich website
      const enrichment = await enrichWebsite(result.link)

      if (enrichment.fetchError) {
        console.log(`${progress}   Fetch warning: ${enrichment.fetchError}`)
      }

      // Score candidate
      let scoring = scoreCandidate(result, enrichment)

      // Apply quality gates
      const gate = applyQualityGates(scoring.score)
      console.log(
        `${progress}   Score: ${scoring.score} | Confidence: ${scoring.confidence.toFixed(2)} | Gate: ${gate.action}`,
      )

      // AI scoring for candidates above threshold
      let aiResult = null
      if (
        scoring.score >= AI_SCORE_THRESHOLD &&
        process.env.OPENAI_API_KEY
      ) {
        console.log(`${progress}   Running AI scoring...`)
        aiResult = await aiScoreCandidate(
          {
            name: result.title,
            websiteUrl: result.link,
            mapsUrl: null,
            snippet: result.snippet,
            coordinates: enrichment.coordinates,
            regionGuess: result.regionGuess,
            source: result.source,
            qualityScore: scoring.score,
            reasons: scoring.reasons,
            riskFlags: scoring.riskFlags,
            confidence: scoring.confidence,
            ratingValue: result.rating ?? null,
            reviewCount: result.ratingCount ?? null,
            contactEmail: enrichment.contactEmail,
            images: enrichment.images,
            rawData: {},
            dedupeKey,
          },
          enrichment,
        )

        if (aiResult) {
          scoring = {
            score: aiResult.score,
            reasons: aiResult.reasons,
            riskFlags: aiResult.riskFlags,
            confidence: aiResult.confidence,
          }
          console.log(
            `${progress}   AI score: ${aiResult.score} | Recommendation: ${aiResult.aiRecommendation}`,
          )
        }
      }

      // Build candidate data
      const candidateData: CandidateData = {
        name: result.title,
        websiteUrl: result.link,
        mapsUrl: null,
        snippet: result.snippet,
        coordinates: enrichment.coordinates,
        regionGuess: result.regionGuess,
        source: result.source,
        qualityScore: scoring.score,
        reasons: scoring.reasons,
        riskFlags: scoring.riskFlags,
        confidence: scoring.confidence,
        ratingValue: result.rating ?? null,
        reviewCount: result.ratingCount ?? null,
        contactEmail: enrichment.contactEmail,
        images: enrichment.images,
        rawData: {
          serperPosition: result.position,
          enrichment: {
            offgridCues: enrichment.offgridCues,
            resortPenalties: enrichment.resortPenalties,
            roomCount: enrichment.roomCount,
            isAccommodation: enrichment.isAccommodation,
            accommodationType: enrichment.accommodationType,
            hasBookingSignals: enrichment.hasBookingSignals,
          },
          ...(aiResult
            ? {
                aiSummary: aiResult.aiSummary,
                aiRecommendation: aiResult.aiRecommendation,
              }
            : {}),
        },
        dedupeKey,
      }

      // Upsert to Payload (if not dry-run)
      if (payload && runId) {
        // If auto-rejected, set status accordingly
        if (gate.action === 'auto-reject') {
          candidateData.rawData.autoRejected = true
        }

        const upsertResult = await upsertCandidate(candidateData, runId, payload)
        console.log(`${progress}   Upsert: ${upsertResult}`)

        if (upsertResult === 'created') {
          stats.newCandidates++
        } else if (upsertResult === 'skipped') {
          stats.duplicatesSkipped++
        }

        // If auto-rejected after creation, update the status
        if (gate.action === 'auto-reject' && upsertResult === 'created') {
          const existing = await payload.find({
            collection: 'candidate-places',
            where: { dedupeKey: { equals: dedupeKey } },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            await payload.update({
              collection: 'candidate-places',
              id: existing.docs[0].id,
              data: { status: 'rejected' },
            })
          }
        }

        // If auto-promoted, set status to 'maybe' for quick review
        if (gate.action === 'auto-promote' && upsertResult === 'created') {
          const existing = await payload.find({
            collection: 'candidate-places',
            where: { dedupeKey: { equals: dedupeKey } },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            await payload.update({
              collection: 'candidate-places',
              id: existing.docs[0].id,
              data: { status: 'maybe' },
            })
          }
        }
      } else {
        // Dry-run: just log
        console.log(
          `${progress}   [dry-run] Would upsert: ${candidateData.name} (score: ${candidateData.qualityScore}, gate: ${gate.action})`,
        )
        stats.newCandidates++
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`${progress} Error: ${message}`)
      stats.errors++
    }

    // Update progress every 5 candidates or on last one
    if ((i + 1) % 5 === 0 || i === limited.length - 1) {
      await updateRunProgress(payload, runId, {
        phase: 'processing',
        processed: i + 1,
        total: limited.length,
        stats,
      })
    }

    // Delay between enrichment calls to be respectful
    if (i < limited.length - 1) {
      await sleep(ENRICHMENT_DELAY_MS)
    }
  }

  // --- Finalize discovery run ---
  if (payload && runId) {
    try {
      await payload.update({
        collection: 'discovery-runs',
        id: runId,
        data: {
          completedAt: new Date().toISOString(),
          status: 'completed',
          progress: {
            phase: 'finalizing',
            processed: limited.length,
            total: limited.length,
          },
          stats: {
            candidatesFound: stats.candidatesFound,
            newCandidates: stats.newCandidates,
            duplicatesSkipped: stats.duplicatesSkipped,
            errors: stats.errors,
          },
        },
      })
      console.log(`[runner] Discovery run ${runId} completed`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[runner] Failed to update discovery run: ${message}`)
    }
  }

  return stats
}
