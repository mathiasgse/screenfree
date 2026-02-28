import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  const payload = await getPayload({ config: configPromise })

  // Auth check
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { runId } = await params

  try {
    const run = await payload.findByID({
      collection: 'discovery-runs',
      id: runId,
    })

    return NextResponse.json({
      status: run.status,
      preset: run.preset,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      stats: run.stats,
      progress: run.progress,
      errorMessage: run.errorMessage,
    })
  } catch {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }
}
