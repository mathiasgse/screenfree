import type { SerperResult } from '@/discovery/shared/types'
import { slugify } from '@/lib/slugify'

/**
 * Generate a deduplication key from a URL and name.
 * Format: "domain--slugified-name"
 */
export function generateDedupeKey(url: string, name: string): string {
  let domain: string
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    domain = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'unknown'
  }

  const slugifiedName = slugify(name)
  return `${domain}--${slugifiedName}`
}

/**
 * Remove results with duplicate domains from a list of SERP results.
 * Keeps the first occurrence (highest ranked).
 */
export function deduplicateResults(results: SerperResult[]): SerperResult[] {
  const seenDomains = new Set<string>()
  const unique: SerperResult[] = []

  for (const result of results) {
    let domain: string
    try {
      domain = new URL(result.link).hostname.replace(/^www\./, '')
    } catch {
      domain = result.link
    }

    if (!seenDomains.has(domain)) {
      seenDomains.add(domain)
      unique.push(result)
    }
  }

  return unique
}

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Use a single-row DP approach for memory efficiency
  const prev = Array.from({ length: n + 1 }, (_, i) => i)
  const curr = new Array<number>(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      )
    }
    // Copy curr to prev
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j]
    }
  }

  return prev[n]
}

/**
 * Check if two strings are fuzzy matches based on Levenshtein distance.
 * threshold = 0.2 means strings must be at least 80% similar.
 */
export function isFuzzyMatch(
  a: string,
  b: string,
  threshold: number = 0.2,
): boolean {
  const normalizedA = a.toLowerCase().trim()
  const normalizedB = b.toLowerCase().trim()

  if (normalizedA === normalizedB) return true

  const maxLen = Math.max(normalizedA.length, normalizedB.length)
  if (maxLen === 0) return true

  const distance = levenshteinDistance(normalizedA, normalizedB)
  return distance / maxLen < threshold
}

/**
 * Calculate the Haversine distance between two coordinate pairs.
 * Returns distance in meters.
 */
export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const R = 6_371_000 // Earth's radius in meters
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if two coordinate pairs are within a proximity threshold.
 * Default threshold is 500 meters.
 */
export function isProximityDuplicate(
  coord1: [number, number],
  coord2: [number, number],
  thresholdMeters: number = 500,
): boolean {
  return haversineDistance(coord1, coord2) < thresholdMeters
}
