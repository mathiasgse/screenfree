import type { SerperResponse, SerperResult } from '@/discovery/shared/types'
import { SERPER_BASE_URL } from '@/discovery/shared/constants'

/**
 * Search via Serper.dev Google SERP API.
 * Returns organic results mapped to our SerperResult type.
 */
export async function searchSerper(
  query: string,
  gl: string,
  num: number = 20,
): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    throw new Error('SERPER_API_KEY environment variable is not set')
  }

  const body = JSON.stringify({
    q: query,
    gl,
    hl: 'de',
    num,
  })

  let response: Response

  try {
    response = await fetch(SERPER_BASE_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Serper API request failed: ${message}`)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown')
    throw new Error(
      `Serper API returned ${response.status}: ${text}`,
    )
  }

  const data = (await response.json()) as SerperResponse

  if (!data.organic || !Array.isArray(data.organic)) {
    return []
  }

  return data.organic.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    position: item.position,
    sitelinks: item.sitelinks,
    rating: item.rating,
    ratingCount: item.ratingCount,
  }))
}
