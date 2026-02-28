import type { CandidateData, EnrichmentResult, AIScoringResult } from '@/discovery/shared/types'

interface AIResponsePayload {
  score: number
  reasons: string[]
  riskFlags: string[]
  confidence: number
  summary: string
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no'
}

const SYSTEM_PROMPT = `You are a travel curator for Stille Orte, a publication about quiet, disconnection-focused boutique accommodations in the Alpine region.

FIRST: Determine if this is actually a bookable accommodation (hotel, B&B, chalet, pension, Almhütte, Refugium). If it's a tourism board, blog, booking aggregator, restaurant, or any non-accommodation — set score to 0 and recommendation to "no".

If it IS an accommodation, evaluate on these criteria:
1. SIZE: Ideally under 20 rooms. Under 10 is excellent. Over 50 is disqualifying.
2. LOCATION: Secluded, Alpine, away from mass tourism. Alleinlage is ideal.
3. CHARACTER: Design-conscious, architecturally interesting, or authentically rustic. Family-run and locally rooted is preferred over corporate.
4. DISCONNECTION: Any signal of digital detox, no WiFi, off-grid, Funkloch is a strong positive. But absence of this isn't disqualifying if other criteria are strong.
5. ATMOSPHERE: Calm, quiet, intimate. No animation programs, no kids clubs, no party vibes.

HARD DISQUALIFIERS (score = 0):
- Not an accommodation
- Chain hotel (Hilton, Marriott, Accor, Best Western, etc.)
- All-inclusive family resort with kids club
- Hostel or party hotel
- Over 100 rooms

Return your evaluation as JSON with exactly this structure:
{
  "score": <number 0-100>,
  "reasons": [<string array of positive signals>],
  "riskFlags": [<string array of concerns>],
  "confidence": <number 0-1>,
  "summary": "<one sentence editorial summary>",
  "recommendation": "<strong_yes|yes|maybe|no>"
}`

/**
 * AI-powered scoring pass using GPT-4o-mini.
 * Only called for candidates above AI_SCORE_THRESHOLD.
 * Returns null if OpenAI API key is missing or the call fails (graceful degradation).
 */
export async function aiScoreCandidate(
  candidate: CandidateData,
  enrichment: EnrichmentResult,
): Promise<AIScoringResult | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.log('[ai-scorer] OPENAI_API_KEY not set, skipping AI scoring')
    return null
  }

  const userPrompt = `Evaluate this accommodation candidate:

Name: ${candidate.name}
Website: ${candidate.websiteUrl}
Search snippet: ${candidate.snippet}
Region guess: ${candidate.regionGuess}
Current deterministic score: ${candidate.qualityScore}
Discovered cues: ${candidate.reasons.join('; ') || 'none'}
Risk flags: ${candidate.riskFlags.join('; ') || 'none'}
Rating: ${candidate.ratingValue ?? 'unknown'} (${candidate.reviewCount ?? 0} reviews)

Schema.org type: ${enrichment.accommodationType ?? 'not detected'}
Booking signals: ${enrichment.hasBookingSignals ? 'yes' : 'no'}
Room count: ${enrichment.roomCount ?? 'unknown'}
Offgrid cues: ${enrichment.offgridCues.join(', ') || 'none'}
Resort penalties: ${enrichment.resortPenalties.join(', ') || 'none'}

Website text (excerpt):
${enrichment.aboutText.slice(0, 2500)}

Return your evaluation as JSON only, no markdown fences.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown')
      console.error(`[ai-scorer] OpenAI API error ${response.status}: ${errorText}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[ai-scorer] No content in OpenAI response')
      return null
    }

    const parsed = JSON.parse(content) as AIResponsePayload

    // Validate the parsed response has required fields
    if (
      typeof parsed.score !== 'number' ||
      !Array.isArray(parsed.reasons) ||
      !Array.isArray(parsed.riskFlags) ||
      typeof parsed.confidence !== 'number' ||
      typeof parsed.summary !== 'string' ||
      !['strong_yes', 'yes', 'maybe', 'no'].includes(parsed.recommendation)
    ) {
      console.error('[ai-scorer] Invalid response structure from OpenAI')
      return null
    }

    // Merge AI score with existing deterministic score (average)
    const mergedScore = Math.round((candidate.qualityScore + parsed.score) / 2)

    return {
      score: Math.max(0, Math.min(100, mergedScore)),
      reasons: [...candidate.reasons, ...parsed.reasons],
      riskFlags: [...candidate.riskFlags, ...parsed.riskFlags],
      confidence: Math.min(1.0, (candidate.confidence + parsed.confidence) / 2),
      aiSummary: parsed.summary,
      aiRecommendation: parsed.recommendation,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ai-scorer] Failed: ${message}`)
    return null
  }
}
