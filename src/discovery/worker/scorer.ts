import type { SerperResult, EnrichmentResult, ScoringResult } from '@/discovery/shared/types'
import {
  OFFGRID_KEYWORDS,
  RESORT_PENALTIES,
  SMALL_ACCOMMODATION_BONUS,
  GOOD_RATING_BONUS,
  RATING_THRESHOLD,
  REVIEW_COUNT_MIN,
  BASE_SCORE,
  MAX_OFFGRID_BONUS,
  MAX_RESORT_PENALTY,
  ACCOMMODATION_SCHEMA_BONUS,
  BOOKING_SIGNALS_BONUS,
  NO_ACCOMMODATION_PENALTY,
  SNIPPET_WEIGHT,
  MAX_SNIPPET_BONUS,
  MAX_SNIPPET_PENALTY,
} from '@/discovery/shared/scoring-rubric'
import { matchesKeyword } from '@/discovery/shared/keyword-matching'

/**
 * Deterministic scoring of a candidate based on SERP data and website enrichment.
 *
 * Scoring breakdown:
 * - Base: 50
 * - Snippet keywords: up to +10 / -15
 * - Offgrid keywords: up to +30
 * - Resort penalties: up to -40
 * - Accommodation schema confirmed: +8
 * - Booking signals found: +5
 * - No accommodation signals: -15
 * - Small accommodation (<=25 rooms): +10
 * - Good rating (>=4.5 with >=10 reviews): +8
 * - Final score clamped to 0-100
 */
export function scoreCandidate(
  serpResult: SerperResult,
  enrichment: EnrichmentResult,
): ScoringResult {
  let score = BASE_SCORE
  const reasons: string[] = []
  const riskFlags: string[] = []

  // --- Snippet keyword scoring (pre-enrichment signal) ---
  const snippetText = (serpResult.snippet || '').toLowerCase()
  let snippetBonus = 0
  for (const [keyword, weight] of Object.entries(OFFGRID_KEYWORDS)) {
    if (matchesKeyword(snippetText, keyword)) {
      snippetBonus += Math.round(weight * SNIPPET_WEIGHT)
    }
  }
  for (const [keyword, weight] of Object.entries(RESORT_PENALTIES)) {
    if (matchesKeyword(snippetText, keyword)) {
      snippetBonus += Math.round(weight * SNIPPET_WEIGHT)
    }
  }
  snippetBonus = Math.max(MAX_SNIPPET_PENALTY, Math.min(snippetBonus, MAX_SNIPPET_BONUS))
  if (snippetBonus !== 0) {
    score += snippetBonus
    const label = snippetBonus > 0 ? `+${snippetBonus}` : `${snippetBonus}`
    reasons.push(`Snippet keyword signals (${label})`)
  }

  // --- Offgrid keyword bonus ---
  let offgridBonus = 0
  for (const cue of enrichment.offgridCues) {
    const weight = OFFGRID_KEYWORDS[cue]
    if (weight !== undefined) {
      offgridBonus += weight
    }
  }
  offgridBonus = Math.min(offgridBonus, MAX_OFFGRID_BONUS)
  if (offgridBonus > 0) {
    score += offgridBonus
    reasons.push(
      `Offgrid cues found: ${enrichment.offgridCues.join(', ')} (+${offgridBonus})`,
    )
  }

  // --- Resort penalty ---
  let resortPenalty = 0
  for (const penalty of enrichment.resortPenalties) {
    const weight = RESORT_PENALTIES[penalty]
    if (weight !== undefined) {
      resortPenalty += weight
    }
  }
  resortPenalty = Math.max(resortPenalty, MAX_RESORT_PENALTY)
  if (resortPenalty < 0) {
    score += resortPenalty
    riskFlags.push(
      `Resort indicators: ${enrichment.resortPenalties.join(', ')} (${resortPenalty})`,
    )
  }

  // --- Accommodation verification ---
  if (enrichment.isAccommodation === true) {
    score += ACCOMMODATION_SCHEMA_BONUS
    reasons.push(
      `Accommodation confirmed via Schema.org: ${enrichment.accommodationType} (+${ACCOMMODATION_SCHEMA_BONUS})`,
    )
  }

  if (enrichment.hasBookingSignals) {
    score += BOOKING_SIGNALS_BONUS
    reasons.push(
      `Booking signals found (Preise/Buchen/Verfügbarkeit) (+${BOOKING_SIGNALS_BONUS})`,
    )
  }

  // Penalty when NO accommodation signals found at all
  if (
    enrichment.isAccommodation === false &&
    !enrichment.hasBookingSignals &&
    enrichment.fetchError === null
  ) {
    score += NO_ACCOMMODATION_PENALTY
    riskFlags.push(
      `No accommodation signals found — might not be a lodging (${NO_ACCOMMODATION_PENALTY})`,
    )
  }

  // --- Small accommodation bonus ---
  if (enrichment.roomCount !== null && enrichment.roomCount <= 25) {
    score += SMALL_ACCOMMODATION_BONUS
    reasons.push(
      `Small accommodation: ${enrichment.roomCount} rooms (+${SMALL_ACCOMMODATION_BONUS})`,
    )
  }

  // --- Good rating bonus ---
  if (
    serpResult.rating !== undefined &&
    serpResult.rating >= RATING_THRESHOLD &&
    serpResult.ratingCount !== undefined &&
    serpResult.ratingCount >= REVIEW_COUNT_MIN
  ) {
    score += GOOD_RATING_BONUS
    reasons.push(
      `Good rating: ${serpResult.rating}/5 (${serpResult.ratingCount} reviews) (+${GOOD_RATING_BONUS})`,
    )
  }

  // --- Clamp score to 0-100 ---
  score = Math.max(0, Math.min(100, score))

  // --- Calculate confidence ---
  let confidence = 0.5
  if (!enrichment.fetchError) {
    confidence += 0.2
  }
  if (enrichment.coordinates !== null) {
    confidence += 0.1
  }
  if (enrichment.roomCount !== null) {
    confidence += 0.1
  }
  if (serpResult.rating !== undefined) {
    confidence += 0.1
  }
  confidence = Math.min(confidence, 1.0)

  return {
    score,
    reasons,
    riskFlags,
    confidence,
  }
}
