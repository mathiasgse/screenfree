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
 * Extract object ID from huettenland.com URL.
 * URL pattern: /huette/{id}/Name/
 */
function extractObjectId(url: string): string | null {
  const match = url.match(/\/huette\/(\d+)\//i)
  return match?.[1] ?? null
}

/**
 * Fetch gallery images from huettenland.com's dynamic image API.
 */
async function fetchGalleryImages(objectId: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://www.huettenland.com/services/myservices.php?todo=getimgs&objektID=${objectId}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json, text/html',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    )

    if (!response.ok) return []

    const text = await response.text()

    // The API may return JSON or HTML with image URLs
    // Try JSON first
    try {
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        return data
          .map((item: { src?: string; url?: string; image?: string }) =>
            item.src ?? item.url ?? item.image,
          )
          .filter((url): url is string => typeof url === 'string')
      }
    } catch {
      /* not JSON, try HTML */
    }

    // Extract image URLs from HTML response
    const imgMatches = text.matchAll(
      /(?:src|data-src)=["'](https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    )
    const images: string[] = []
    for (const match of imgMatches) {
      if (match[1]) images.push(match[1])
    }
    return images
  } catch {
    return []
  }
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

      if (hostname.includes(platformDomain)) continue
      if (SOCIAL_AND_AGGREGATOR_DOMAINS.some((d) => hostname.includes(d))) continue
      if (hostname.includes('maps.google') || hostname.includes('goo.gl')) continue

      candidates.push(href)
    } catch {
      /* invalid URL */
    }
  }

  // Check for links near "Website" / "Homepage" context
  const reversePattern =
    /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*(?:website|homepage|vermieter|www\.|eigene\s*seite)[^<]*<\/a>/gi
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
 * Scrape a huettenland.com detail page and extract structured hut data.
 */
export async function scrapeHuettenland(url: string): Promise<ScrapedHut> {
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

  // Region: from text pattern like "ÖSTERREICH | Steiermark | Murau-Kreischberg"
  let region = ''
  const regionMatch = plainText.match(
    /(?:ÖSTERREICH|DEUTSCHLAND|SCHWEIZ|ITALIEN|AUSTRIA|GERMANY|SWITZERLAND|ITALY)\s*\|\s*([^|]+(?:\|[^|]+)?)/i,
  )
  if (regionMatch) {
    region = regionMatch[1]
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ')
  }
  if (!region) {
    // Fallback: look for location text
    const locationMatch = plainText.match(
      /(?:Region|Lage|Ort|Gebiet)\s*[:]\s*([^.;\n]+)/i,
    )
    if (locationMatch) {
      region = locationMatch[1].trim()
    }
  }

  // Elevation
  const elevationMatch = plainText.match(
    /(?:[\d.,]+)\s*m\s*(?:Seehöhe|ü\.?\s*(?:d\.?\s*)?M\.?|Höhe)/i,
  )
  const elevationMatch2 = plainText.match(
    /(?:Seehöhe|Höhe|Höhenlage)\s*[:]\s*([\d.,]+\s*m)/i,
  )
  let elevation: string | null = null
  if (elevationMatch) {
    elevation = elevationMatch[0].trim()
  } else if (elevationMatch2) {
    elevation = elevationMatch2[1].trim()
  } else {
    // Common pattern on huettenland: just "1.030 m" near the top
    const simpleElevation = plainText.match(/([\d.]+)\s*m\b/i)
    if (simpleElevation) {
      const val = parseInt(simpleElevation[1].replace(/\./g, ''), 10)
      if (val >= 300 && val <= 4000) {
        elevation = `${simpleElevation[1]} m`
      }
    }
  }

  // Capacity
  const capacityMatch = plainText.match(
    /(?:für\s+)?(\d[\d\s–\-]*\d?)\s*(?:Personen|Pers\.|Gäste|persons?|guests?)/i,
  )
  const capacity = capacityMatch
    ? capacityMatch[0].trim()
    : null

  // Images: try dynamic API first, then fallback to page images
  const objectId = extractObjectId(url)
  let images: string[] = []

  if (objectId) {
    images = await fetchGalleryImages(objectId)
  }

  // Fallback: extract images from the page HTML
  if (images.length === 0) {
    const imgMatches = html.matchAll(
      /(?:src|data-src|data-lazy-src)=["'](https?:\/\/[^"']*(?:huettenland|uploads|media)[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    )
    for (const match of imgMatches) {
      if (match[1] && !images.includes(match[1])) {
        images.push(match[1])
      }
    }
  }

  // Extra fallback: any image on the page
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

  // Own website
  const ownWebsiteUrl = findOwnWebsite(html, 'huettenland.com')

  // Description
  const descMatch = html.match(
    /<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i,
  )
  let description = descMatch?.[1]?.trim() ?? ''
  if (!description) {
    const paraMatch = html.match(
      /<p[^>]*class=["'][^"']*(?:description|intro|text|inhalt)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
    )
    description = paraMatch ? stripHtml(paraMatch[1]).slice(0, 500) : plainText.slice(0, 500)
  }

  return {
    name,
    platformUrl: url,
    ownWebsiteUrl,
    region,
    coordinates: null, // huettenland.com does not expose coordinates
    elevation,
    capacity,
    price: null, // price extraction is unreliable on huettenland
    description,
    images: images.slice(0, 10),
    rating: null,
    reviewCount: null,
    source: 'huettenland.com',
  }
}
