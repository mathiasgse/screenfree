import type { EnrichmentResult } from '@/discovery/shared/types'
import { OFFGRID_KEYWORDS, RESORT_PENALTIES } from '@/discovery/shared/scoring-rubric'
import { ENRICHMENT_TIMEOUT_MS, BLOCKED_DOMAINS } from '@/discovery/shared/constants'
import { matchesKeyword } from '@/discovery/shared/keyword-matching'

/**
 * Strip HTML tags and return plain text content.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Try to extract room count from page text.
 * Matches patterns like "12 Zimmer", "8 rooms", "5 Suiten".
 */
function extractRoomCount(text: string): number | null {
  const patterns = [
    /(\d{1,3})\s*(?:zimmer|rooms?|suiten|chambres?|camere)/i,
    /(?:zimmer|rooms?|suiten|chambres?|camere)\s*[:]\s*(\d{1,3})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const count = parseInt(match[1], 10)
      if (count > 0 && count < 500) {
        return count
      }
    }
  }

  return null
}

/**
 * Try to extract geo coordinates from HTML meta tags.
 */
function extractCoordinates(html: string): [number, number] | null {
  // Try geo.position meta tag (format: "lat;lng")
  const geoPosition = html.match(
    /<meta[^>]+name=["']geo\.position["'][^>]+content=["']([^"']+)["']/i,
  )
  if (geoPosition) {
    const parts = geoPosition[1].split(';').map((s) => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]]
    }
  }

  // Try Open Graph place:location tags
  const latMatch = html.match(
    /<meta[^>]+(?:property|name)=["']place:location:latitude["'][^>]+content=["']([^"']+)["']/i,
  )
  const lngMatch = html.match(
    /<meta[^>]+(?:property|name)=["']place:location:longitude["'][^>]+content=["']([^"']+)["']/i,
  )
  if (latMatch && lngMatch) {
    const lat = parseFloat(latMatch[1])
    const lng = parseFloat(lngMatch[1])
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng]
    }
  }

  // Try ICBM meta tag (format: "lat, lng")
  const icbm = html.match(
    /<meta[^>]+name=["']ICBM["'][^>]+content=["']([^"']+)["']/i,
  )
  if (icbm) {
    const parts = icbm[1].split(',').map((s) => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]]
    }
  }

  return null
}

/**
 * Extract images from HTML (og:image and first few img src).
 */
function extractImages(html: string): string[] {
  const images: string[] = []

  // og:image
  const ogImages = html.matchAll(
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
  )
  for (const match of ogImages) {
    if (match[1]) images.push(match[1])
  }

  // First few img src attributes
  const imgTags = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  let imgCount = 0
  for (const match of imgTags) {
    if (match[1] && imgCount < 5) {
      images.push(match[1])
      imgCount++
    }
  }

  // Deduplicate
  return [...new Set(images)]
}

/**
 * Detect accommodation Schema.org types from JSON-LD blocks.
 */
function detectAccommodationSchema(html: string): { isAccommodation: boolean; type: string | null } {
  const jsonLdBlocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )
  const accommodationTypes = [
    'Hotel',
    'LodgingBusiness',
    'BedAndBreakfast',
    'Motel',
    'Resort',
    'Hostel',
    'VacationRental',
  ]

  for (const match of jsonLdBlocks) {
    try {
      const data = JSON.parse(match[1])
      const types = Array.isArray(data) ? data : [data]
      for (const item of types) {
        const type = item['@type']
        if (accommodationTypes.includes(type)) {
          return { isAccommodation: true, type }
        }
      }
    } catch {
      /* invalid JSON-LD, skip */
    }
  }
  return { isAccommodation: false, type: null }
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const BLOCKED_EMAIL_PREFIXES = [
  'noreply',
  'no-reply',
  'mailer-daemon',
  'webmaster',
  'postmaster',
]

const BLOCKED_EMAIL_DOMAINS = ['@example.com', '@test.com', '@localhost']

const PREFERRED_EMAIL_PREFIXES = [
  'info@',
  'kontakt@',
  'contact@',
  'hotel@',
  'office@',
  'rezeption@',
  'reception@',
  'anfrage@',
  'buchung@',
  'booking@',
]

/**
 * Extract a contact email from HTML.
 * Prefers mailto: links, falls back to regex scan of visible text.
 * Filters out spam traps, placeholders, and asset URLs.
 */
function extractEmail(html: string): string | null {
  const candidates: string[] = []

  // 1. Extract from mailto: links (most reliable)
  const mailtoMatches = html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)
  for (const match of mailtoMatches) {
    if (match[1]) candidates.push(match[1].toLowerCase())
  }

  // 2. Regex scan of plain text (fallback)
  const plainText = stripHtml(html)
  const textMatches = plainText.matchAll(EMAIL_REGEX)
  for (const match of textMatches) {
    candidates.push(match[0].toLowerCase())
  }

  // Deduplicate
  const unique = [...new Set(candidates)]

  // Filter out blocked emails
  const filtered = unique.filter((email) => {
    const prefix = email.split('@')[0]
    if (BLOCKED_EMAIL_PREFIXES.includes(prefix)) return false
    if (BLOCKED_EMAIL_DOMAINS.some((d) => email.endsWith(d))) return false
    // Filter asset-like patterns (e.g. image.png@2x)
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(prefix)) return false
    return true
  })

  if (filtered.length === 0) return null

  // Prefer domain-own addresses with hospitality prefixes
  const preferred = filtered.find((email) =>
    PREFERRED_EMAIL_PREFIXES.some((p) => email.startsWith(p)),
  )

  return preferred ?? filtered[0]
}

const BOOKING_SIGNALS = [
  'jetzt buchen',
  'anfragen',
  'verfügbarkeit prüfen',
  'zimmer buchen',
  'preise',
  'ab €',
  'pro nacht',
  'pro person',
  'übernachtung',
  'anreise',
  'abreise',
  'freie zimmer',
  'buchungsanfrage',
  'book now',
  'check availability',
  'rates',
  'per night',
]

/**
 * Detect booking/pricing signals in page text.
 */
function detectBookingSignals(lowerText: string): boolean {
  return BOOKING_SIGNALS.some((signal) => lowerText.includes(signal))
}

/**
 * Check if a URL belongs to a blocked aggregator domain.
 */
function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return BLOCKED_DOMAINS.some((domain) => hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * Enrich a website URL by fetching its homepage and extracting
 * offgrid cues, resort penalties, room count, coordinates, images,
 * and accommodation verification signals.
 */
export async function enrichWebsite(url: string): Promise<EnrichmentResult> {
  const defaults: EnrichmentResult = {
    offgridCues: [],
    resortPenalties: [],
    roomCount: null,
    coordinates: null,
    images: [],
    aboutText: '',
    fetchError: null,
    isAccommodation: null,
    accommodationType: null,
    hasBookingSignals: false,
    contactEmail: null,
  }

  // Domain blocklist pre-filter
  if (isBlockedDomain(url)) {
    return {
      ...defaults,
      isAccommodation: false,
      fetchError: 'Blocked aggregator domain',
    }
  }

  let html: string

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ENRICHMENT_TIMEOUT_MS)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; StilleOrteBot/1.0; +https://still-magazin.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return {
        ...defaults,
        fetchError: `HTTP ${response.status}`,
      }
    }

    html = await response.text()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      ...defaults,
      fetchError: message,
    }
  }

  const plainText = stripHtml(html)
  const lowerText = plainText.toLowerCase()

  // Find offgrid cues (word-boundary matching)
  const offgridCues: string[] = []
  for (const keyword of Object.keys(OFFGRID_KEYWORDS)) {
    if (matchesKeyword(lowerText, keyword)) {
      offgridCues.push(keyword)
    }
  }

  // Find resort penalties (word-boundary matching)
  const resortPenalties: string[] = []
  for (const keyword of Object.keys(RESORT_PENALTIES)) {
    if (matchesKeyword(lowerText, keyword)) {
      resortPenalties.push(keyword)
    }
  }

  // Extract room count
  const roomCount = extractRoomCount(plainText)

  // Extract coordinates
  const coordinates = extractCoordinates(html)

  // Extract images
  const images = extractImages(html)

  // Accommodation verification: Schema.org
  const schema = detectAccommodationSchema(html)

  // Accommodation verification: Booking signals
  const hasBookingSignals = detectBookingSignals(lowerText)

  // Determine isAccommodation: true if schema confirms, null if neither confirmed nor denied
  const isAccommodation = schema.isAccommodation ? true : null

  // Extract contact email
  const contactEmail = extractEmail(html)

  // Truncate about text to a reasonable length
  const aboutText = plainText.slice(0, 2000)

  return {
    offgridCues,
    resortPenalties,
    roomCount,
    coordinates,
    images,
    aboutText,
    fetchError: null,
    isAccommodation,
    accommodationType: schema.type,
    hasBookingSignals,
    contactEmail,
  }
}
