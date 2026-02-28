import type { ScrapedHut } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const SOCIAL_AND_AGGREGATOR_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'youtube.com',
  'tiktok.com',
  'pinterest.com',
  'linkedin.com',
  'booking.com',
  'airbnb.com',
  'tripadvisor.com',
  'expedia.com',
  'hrs.de',
  'trivago.com',
  'google.com',
  'google.at',
  'google.de',
  'google.ch',
]

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract coordinates from JSON-LD GeoCoordinates on huetten.com.
 */
function extractCoordinates(html: string): [number, number] | null {
  const jsonLdBlocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  for (const match of jsonLdBlocks) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const geo = item.geo ?? item.GeoCoordinates
        if (geo?.latitude && geo?.longitude) {
          const lat = parseFloat(geo.latitude)
          const lng = parseFloat(geo.longitude)
          if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
        }
        // Check nested address.geo
        if (item.address?.geo?.latitude && item.address?.geo?.longitude) {
          const lat = parseFloat(item.address.geo.latitude)
          const lng = parseFloat(item.address.geo.longitude)
          if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
        }
      }
    } catch {
      /* invalid JSON-LD, skip */
    }
  }

  // Fallback: look for lat/lng in inline JS (common on map widgets)
  const latMatch = html.match(/["']?latitude["']?\s*[:=]\s*["']?([\d.]+)["']?/i)
  const lngMatch = html.match(/["']?longitude["']?\s*[:=]\s*["']?([\d.]+)["']?/i)
  if (latMatch && lngMatch) {
    const lat = parseFloat(latMatch[1])
    const lng = parseFloat(lngMatch[1])
    if (!isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 55 && lng > 5 && lng < 20) {
      return [lat, lng]
    }
  }

  return null
}

/**
 * Extract aggregate rating from JSON-LD.
 */
function extractRating(html: string): { rating: number | null; reviewCount: number | null } {
  const jsonLdBlocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  for (const match of jsonLdBlocks) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const agg = item.aggregateRating
        if (agg?.ratingValue) {
          return {
            rating: parseFloat(agg.ratingValue),
            reviewCount: agg.reviewCount ? parseInt(agg.reviewCount, 10) : null,
          }
        }
      }
    } catch {
      /* skip */
    }
  }

  return { rating: null, reviewCount: null }
}

/**
 * Find the hut's own website URL by scanning external links on the page.
 */
function findOwnWebsite(html: string, platformDomain: string): string | null {
  const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)
  const candidates: string[] = []

  for (const match of linkMatches) {
    const href = match[1]
    if (!href || !href.startsWith('http')) continue

    try {
      const hostname = new URL(href).hostname.toLowerCase()

      // Skip platform-own links
      if (hostname.includes(platformDomain)) continue

      // Skip social media and aggregators
      if (SOCIAL_AND_AGGREGATOR_DOMAINS.some((d) => hostname.includes(d))) continue

      // Skip common non-website links
      if (hostname.includes('maps.google') || hostname.includes('goo.gl')) continue

      candidates.push(href)
    } catch {
      /* invalid URL */
    }
  }

  // Prefer links with "website" context in surrounding HTML
  // Look for links near text like "Website", "Homepage", "Vermieter"
  const websitePattern =
    /(?:website|homepage|vermieter|eigene\s*seite|zur\s*website|zur\s*homepage)[^<]*<\/[^>]+>\s*<a[^>]+href=["']([^"']+)["']/gi
  const contextMatch = websitePattern.exec(html)
  if (contextMatch?.[1]) {
    try {
      const hostname = new URL(contextMatch[1]).hostname.toLowerCase()
      if (
        !hostname.includes(platformDomain) &&
        !SOCIAL_AND_AGGREGATOR_DOMAINS.some((d) => hostname.includes(d))
      ) {
        return contextMatch[1]
      }
    } catch {
      /* skip */
    }
  }

  // Also check reverse pattern: <a href="...">Website des Vermieters</a>
  const reversePattern =
    /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:website|homepage|vermieter|eigene\s*seite)[^<]*<\/a>/gi
  const reverseMatch = reversePattern.exec(html)
  if (reverseMatch?.[1]) {
    try {
      const hostname = new URL(reverseMatch[1]).hostname.toLowerCase()
      if (
        !hostname.includes(platformDomain) &&
        !SOCIAL_AND_AGGREGATOR_DOMAINS.some((d) => hostname.includes(d))
      ) {
        return reverseMatch[1]
      }
    } catch {
      /* skip */
    }
  }

  return candidates[0] ?? null
}

/**
 * Scrape a huetten.com detail page and extract structured hut data.
 */
export async function scrapeHuettenCom(url: string): Promise<ScrapedHut> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }

  const html = await response.text()
  const plainText = stripHtml(html)

  // Name: from <h1> or <title>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const name = h1Match?.[1]?.trim() ?? titleMatch?.[1]?.split('|')[0]?.trim() ?? 'Unknown'

  // Region: from breadcrumb or address text
  let region = ''
  const breadcrumbMatch = html.match(
    /<(?:nav|ol|ul)[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/(?:nav|ol|ul)>/i,
  )
  if (breadcrumbMatch) {
    const crumbs = stripHtml(breadcrumbMatch[1])
    // Take last meaningful breadcrumb parts
    const parts = crumbs.split(/[›>\/|]/).map((s) => s.trim()).filter(Boolean)
    region = parts.slice(1, -1).join(', ') // skip first (Home) and last (current page)
  }
  if (!region) {
    // Fallback: look for location patterns like "Ort, Bundesland"
    const locationMatch = plainText.match(
      /(?:Ort|Region|Lage|Standort)\s*[:]\s*([^.;\n]+)/i,
    )
    if (locationMatch) {
      region = locationMatch[1].trim()
    }
  }

  // Coordinates
  const coordinates = extractCoordinates(html)

  // Elevation
  const elevationMatch = plainText.match(
    /(?:Höhe|Seehöhe|Höhenlage|Altitude)\s*[:]\s*([\d.,]+\s*m)/i,
  )
  const elevation = elevationMatch?.[1]?.trim() ?? null

  // Capacity
  const capacityMatch = plainText.match(
    /(?:Max\.?\s*Personen|Personen|Schlafplätze|Betten|persons?|sleeps?)\s*[:]\s*(\d[\d\s–\-]*\d?)/i,
  )
  const capacity = capacityMatch?.[1]?.trim() ?? null

  // Price
  const priceMatch = plainText.match(
    /(?:ab\s*)?(?:€|EUR)\s*[\d.,]+(?:\s*[–\-]\s*(?:€|EUR)?\s*[\d.,]+)?(?:\s*\/?\s*(?:Woche|Nacht|Tag|week|night))?/i,
  )
  const price = priceMatch?.[0]?.trim() ?? null

  // Images: CDN images from gallery
  const imageMatches = html.matchAll(
    /(?:src|data-src|data-lazy-src)=["'](https?:\/\/[^"']*(?:cst-media|viomassl|huetten\.com\/media)[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
  )
  const images: string[] = []
  for (const match of imageMatches) {
    if (match[1] && !images.includes(match[1])) {
      images.push(match[1])
    }
  }

  // Fallback: any large images on the page
  if (images.length === 0) {
    const allImgMatches = html.matchAll(
      /(?:src|data-src)=["'](https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    )
    for (const match of allImgMatches) {
      if (match[1] && !images.includes(match[1]) && images.length < 10) {
        images.push(match[1])
      }
    }
  }

  // Rating
  const { rating, reviewCount } = extractRating(html)

  // Own website
  const ownWebsiteUrl = findOwnWebsite(html, 'huetten.com')

  // Description
  const descMatch = html.match(
    /<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i,
  )
  let description = descMatch?.[1]?.trim() ?? ''
  if (!description) {
    // Fallback: first paragraph-like text
    const paraMatch = html.match(/<p[^>]*class=["'][^"']*(?:description|intro|text)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)
    description = paraMatch ? stripHtml(paraMatch[1]).slice(0, 500) : plainText.slice(0, 500)
  }

  return {
    name,
    platformUrl: url,
    ownWebsiteUrl,
    region,
    coordinates,
    elevation,
    capacity,
    price,
    description,
    images: images.slice(0, 10),
    rating,
    reviewCount,
    source: 'huetten.com',
  }
}
