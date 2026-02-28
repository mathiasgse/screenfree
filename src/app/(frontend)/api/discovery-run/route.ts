import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { REGION_PRESETS } from '@/discovery/shared/constants'
import { runDiscovery } from '@/discovery/worker/runner'

export const maxDuration = 300

const VALID_COUNTRIES = ['AT', 'CH', 'DE', 'IT']

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Auth check
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: { preset?: string; country?: string; limit?: number; dryRun?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { preset, country, dryRun = false } = body
  const limit = Math.min(Math.max(body.limit ?? 50, 1), 200)

  // Validate preset
  if (preset) {
    const validPresets = REGION_PRESETS.map((p) => p.key)
    if (!validPresets.includes(preset)) {
      return NextResponse.json(
        { error: `Invalid preset: ${preset}. Valid: ${validPresets.join(', ')}` },
        { status: 400 },
      )
    }
  }

  // Validate country
  if (country) {
    if (!VALID_COUNTRIES.includes(country.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid country: ${country}. Valid: ${VALID_COUNTRIES.join(', ')}` },
        { status: 400 },
      )
    }
  }

  // Create discovery-run doc immediately
  const presetLabel = preset
    ? REGION_PRESETS.find((p) => p.key === preset)?.label ?? preset
    : country
      ? `Country: ${country.toUpperCase()}`
      : 'All regions'

  const run = await payload.create({
    collection: 'discovery-runs',
    data: {
      startedAt: new Date().toISOString(),
      status: 'running',
      preset: presetLabel,
    },
  })

  const runId = String(run.id)

  // Fire-and-forget: run discovery in the background after response
  after(async () => {
    try {
      await runDiscovery({
        preset: preset || undefined,
        country: country || undefined,
        limit,
        dryRun,
        existingRunId: runId,
        existingPayload: payload,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[discovery-run] Run ${runId} failed: ${message}`)
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
        console.error('[discovery-run] Failed to update run status:', updateError)
      }
    }
  })

  return NextResponse.json({ success: true, runId })
}
