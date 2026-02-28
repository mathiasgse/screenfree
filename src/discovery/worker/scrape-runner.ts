import type { ScrapedHut } from './scrapers/types'
import type { CandidateData, RunStats } from '@/discovery/shared/types'
import type { BasePayload } from 'payload'

const SCRAPE_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Determine which platform a URL belongs to.
 */
function detectPlatform(url: string): 'huetten.com' | 'huettenland.com' | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes('huetten.com') && !hostname.includes('huettenland')) {
      return 'huetten.com'
    }
    if (hostname.includes('huettenland.com')) {
      return 'huettenland.com'
    }
  } catch {
    /* invalid URL */
  }
  return null
}

/**
 * Non-fatal helper to update progress on the discovery run record.
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
    console.warn(`[scraper] Failed to update progress (non-fatal):`, err)
  }
}

export interface HuettenScraperOptions {
  urls: string[]
  dryRun: boolean
  existingRunId?: string
  existingPayload?: BasePayload
}

/**
 * Core Hütten scraper logic.
 *
 * Scrapes URLs from huetten.com / huettenland.com, enriches with own website data,
 * and upserts candidates into the CMS.
 */
export async function runHuettenScraper(options: HuettenScraperOptions): Promise<RunStats> {
  const { urls, dryRun } = options

  const stats: RunStats = {
    candidatesFound: urls.length,
    newCandidates: 0,
    duplicatesSkipped: 0,
    errors: 0,
  }

  // Lazy-import scrapers to keep startup fast
  const { scrapeHuettenCom } = await import('./scrapers/huetten-com')
  const { scrapeHuettenland } = await import('./scrapers/huettenland')
  const { enrichWebsite } = await import('./enricher')
  const { generateDedupeKey } = await import('./dedup')
  const { upsertCandidate } = await import('./upsert')

  // Initialize Payload
  let payload: BasePayload | null = options.existingPayload ?? null
  let runId: string | null = options.existingRunId ?? null

  if (!dryRun && !payload) {
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
            preset: 'scraper:huetten-import',
            progress: {
              phase: 'processing',
              processed: 0,
              total: urls.length,
            },
          },
        })
        runId = String(run.id)
        console.log(`[scraper] Created discovery run: ${runId}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[scraper] Failed to initialize Payload: ${message}`)
      console.log('[scraper] Falling back to dry-run mode')
    }
  }

  // Update initial progress
  await updateRunProgress(payload, runId, {
    phase: 'processing',
    processed: 0,
    total: urls.length,
    stats,
  })

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const progress = `[${i + 1}/${urls.length}]`
    const platform = detectPlatform(url)

    if (!platform) {
      console.error(`${progress} Unknown platform, skipping: ${url}`)
      stats.errors++
      continue
    }

    try {
      // Step 1: Scrape platform page
      console.log(`${progress} Scraping (${platform}): ${url}`)
      let hut: ScrapedHut

      if (platform === 'huetten.com') {
        hut = await scrapeHuettenCom(url)
      } else {
        hut = await scrapeHuettenland(url)
      }

      console.log(`${progress}   Name: ${hut.name}`)
      if (hut.region) console.log(`${progress}   Region: ${hut.region}`)
      if (hut.ownWebsiteUrl) console.log(`${progress}   Own website: ${hut.ownWebsiteUrl}`)

      // Step 2: Enrich own website (if found)
      let enrichment: Awaited<ReturnType<typeof enrichWebsite>> | null = null
      if (hut.ownWebsiteUrl) {
        console.log(`${progress}   Enriching own website...`)
        enrichment = await enrichWebsite(hut.ownWebsiteUrl)
        if (enrichment.contactEmail) {
          console.log(`${progress}   Email: ${enrichment.contactEmail}`)
        }
        if (enrichment.coordinates) {
          console.log(`${progress}   Coordinates (from website): ${enrichment.coordinates.join(', ')}`)
        }
      }

      // Step 3: Build CandidateData
      const websiteUrl = hut.ownWebsiteUrl ?? hut.platformUrl
      const dedupeKey = generateDedupeKey(websiteUrl, hut.name)

      const reasons: string[] = []
      if (hut.elevation) reasons.push(`Höhe: ${hut.elevation}`)
      if (hut.capacity) reasons.push(`Kapazität: ${hut.capacity}`)
      if (hut.price) reasons.push(`Preis: ${hut.price}`)
      if (hut.rating) reasons.push(`Bewertung: ${hut.rating}${hut.reviewCount ? ` (${hut.reviewCount} Reviews)` : ''}`)
      if (enrichment?.offgridCues?.length) {
        reasons.push(`Offgrid-Signale: ${enrichment.offgridCues.join(', ')}`)
      }

      const riskFlags: string[] = []
      if (!hut.ownWebsiteUrl) riskFlags.push('Keine eigene Website gefunden')
      if (enrichment?.resortPenalties?.length) {
        riskFlags.push(`Resort-Signale: ${enrichment.resortPenalties.join(', ')}`)
      }

      const candidateData: CandidateData = {
        name: hut.name,
        websiteUrl,
        mapsUrl: null,
        contactEmail: enrichment?.contactEmail ?? null,
        snippet: hut.description.slice(0, 500),
        coordinates: hut.coordinates ?? enrichment?.coordinates ?? null,
        regionGuess: hut.region,
        source: `scraper:${hut.source}`,
        qualityScore: 70,
        reasons,
        riskFlags,
        confidence: 0.6,
        ratingValue: hut.rating,
        reviewCount: hut.reviewCount,
        images: hut.images,
        rawData: {
          scrapedHut: hut,
          enrichment: enrichment
            ? {
                offgridCues: enrichment.offgridCues,
                resortPenalties: enrichment.resortPenalties,
                roomCount: enrichment.roomCount,
                isAccommodation: enrichment.isAccommodation,
                accommodationType: enrichment.accommodationType,
                hasBookingSignals: enrichment.hasBookingSignals,
              }
            : null,
        },
        dedupeKey,
      }

      // Step 4: Upsert or log
      if (payload && runId) {
        const result = await upsertCandidate(candidateData, runId, payload)
        console.log(`${progress}   Upsert: ${result}`)
        if (result === 'created') stats.newCandidates++
        else if (result === 'updated') stats.newCandidates++
        else stats.duplicatesSkipped++
      } else {
        console.log(`${progress}   [dry-run] Would upsert: ${candidateData.name} (score: ${candidateData.qualityScore})`)
        console.log(`${progress}   [dry-run] Dedupe key: ${dedupeKey}`)
        stats.newCandidates++
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`${progress} Error: ${message}`)
      stats.errors++
    }

    // Update progress every 5 candidates or on last one
    if ((i + 1) % 5 === 0 || i === urls.length - 1) {
      await updateRunProgress(payload, runId, {
        phase: 'processing',
        processed: i + 1,
        total: urls.length,
        stats,
      })
    }

    // Delay between requests
    if (i < urls.length - 1) {
      await sleep(SCRAPE_DELAY_MS)
    }
  }

  // Finalize discovery run
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
            processed: urls.length,
            total: urls.length,
          },
          stats: {
            candidatesFound: stats.candidatesFound,
            newCandidates: stats.newCandidates,
            duplicatesSkipped: stats.duplicatesSkipped,
            errors: stats.errors,
          },
        },
      })
      console.log(`[scraper] Discovery run ${runId} completed`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[scraper] Failed to finalize run: ${message}`)
    }
  }

  return stats
}
