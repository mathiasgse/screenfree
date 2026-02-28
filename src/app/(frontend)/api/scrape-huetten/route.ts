import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { runHuettenScraper } from '@/discovery/worker/scrape-runner'

export const maxDuration = 300

const ALLOWED_DOMAINS = ['huetten.com', 'huettenland.com']
const MAX_URLS = 50

function isAllowedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return ALLOWED_DOMAINS.some((d) => hostname.includes(d))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Auth check
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: { urls?: string[]; dryRun?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { urls, dryRun = false } = body

  // Validate URLs
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 })
  }

  if (urls.length > MAX_URLS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_URLS} URLs allowed per run` },
      { status: 400 },
    )
  }

  const invalidUrls = urls.filter((u) => !isAllowedUrl(u))
  if (invalidUrls.length > 0) {
    return NextResponse.json(
      {
        error: `Invalid URLs (only ${ALLOWED_DOMAINS.join(', ')} allowed): ${invalidUrls.slice(0, 3).join(', ')}${invalidUrls.length > 3 ? '...' : ''}`,
      },
      { status: 400 },
    )
  }

  // Create discovery-run doc immediately
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

  const runId = String(run.id)

  // Fire-and-forget: run scraper in the background after response
  after(async () => {
    try {
      await runHuettenScraper({
        urls,
        dryRun,
        existingRunId: runId,
        existingPayload: payload,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[scrape-huetten] Run ${runId} failed: ${message}`)
      try {
        await payload.update({
          collection: 'discovery-runs',
          id: runId,
          data: {
            status: 'failed',
            completedAt: new Date().toISOString(),
            errorMessage: message.slice(0, 2000),
          },
        })
      } catch (updateError) {
        console.error('[scrape-huetten] Failed to update run status:', updateError)
      }
    }
  })

  return NextResponse.json({ success: true, runId })
}
