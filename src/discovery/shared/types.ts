export type CandidateStatus = 'new' | 'maybe' | 'accepted' | 'rejected'

export type DiscoveryRunStatus = 'running' | 'completed' | 'failed'

export type CalibrationLabel = 'perfect' | 'good' | 'borderline' | 'wrong'

export interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
  sitelinks?: { title: string; link: string }[]
  rating?: number
  ratingCount?: number
}

export interface SerperResponse {
  searchParameters: { q: string; gl?: string; hl?: string; num?: number }
  organic: SerperResult[]
  credits?: number
}

export interface EnrichmentResult {
  offgridCues: string[]
  resortPenalties: string[]
  roomCount: number | null
  coordinates: [number, number] | null
  images: string[]
  aboutText: string
  fetchError: string | null
  isAccommodation: boolean | null
  accommodationType: string | null
  hasBookingSignals: boolean
  contactEmail: string | null
}

export interface ScoringResult {
  score: number
  reasons: string[]
  riskFlags: string[]
  confidence: number
}

export interface AIScoringResult extends ScoringResult {
  aiSummary: string
  aiRecommendation: 'strong_yes' | 'yes' | 'maybe' | 'no'
}

export interface CandidateData {
  name: string
  websiteUrl: string
  mapsUrl: string | null
  snippet: string
  coordinates: [number, number] | null
  regionGuess: string
  source: string
  qualityScore: number
  reasons: string[]
  riskFlags: string[]
  confidence: number
  ratingValue: number | null
  reviewCount: number | null
  images: string[]
  contactEmail: string | null
  rawData: Record<string, unknown>
  dedupeKey: string
}

export interface RegionPreset {
  key: string
  label: string
  country: string
  microregions: string[]
  keywords: string[]
}

export interface RunStats {
  candidatesFound: number
  newCandidates: number
  duplicatesSkipped: number
  errorCount: number
}
