import type { CandidateData } from '@/discovery/shared/types'
import type { BasePayload } from 'payload'

/**
 * Upsert a candidate into the candidate-places collection.
 *
 * Logic:
 * - If a candidate with the same dedupeKey exists and status !== 'new': skip (preserve human decisions)
 * - If exists and status === 'new': update with fresh data
 * - If not exists: create with status 'new'
 */
export async function upsertCandidate(
  candidate: CandidateData,
  runId: string,
  payload: BasePayload,
): Promise<'created' | 'skipped' | 'updated'> {
  const existing = await payload.find({
    collection: 'candidate-places',
    where: {
      dedupeKey: {
        equals: candidate.dedupeKey,
      },
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]

    // Preserve human decisions — only update if still in 'new' status
    if (doc.status !== 'new') {
      return 'skipped'
    }

    // Update with fresh data
    await payload.update({
      collection: 'candidate-places',
      id: doc.id,
      data: {
        name: candidate.name,
        websiteUrl: candidate.websiteUrl,
        mapsUrl: candidate.mapsUrl,
        contactEmail: candidate.contactEmail,
        snippet: candidate.snippet,
        coordinates: candidate.coordinates,
        regionGuess: candidate.regionGuess,
        source: candidate.source,
        qualityScore: candidate.qualityScore,
        reasons: candidate.reasons,
        riskFlags: candidate.riskFlags,
        confidence: candidate.confidence,
        ratingValue: candidate.ratingValue,
        reviewCount: candidate.reviewCount,
        images: candidate.images,
        rawData: candidate.rawData,
        discoveryRunId: runId,
      },
    })

    return 'updated'
  }

  // Create new candidate
  await payload.create({
    collection: 'candidate-places',
    data: {
      name: candidate.name,
      websiteUrl: candidate.websiteUrl,
      mapsUrl: candidate.mapsUrl,
      contactEmail: candidate.contactEmail,
      snippet: candidate.snippet,
      coordinates: candidate.coordinates,
      regionGuess: candidate.regionGuess,
      source: candidate.source,
      qualityScore: candidate.qualityScore,
      reasons: candidate.reasons,
      riskFlags: candidate.riskFlags,
      confidence: candidate.confidence,
      ratingValue: candidate.ratingValue,
      reviewCount: candidate.reviewCount,
      images: candidate.images,
      rawData: candidate.rawData,
      dedupeKey: candidate.dedupeKey,
      status: 'new',
      discoveryRunId: runId,
    },
  })

  return 'created'
}
