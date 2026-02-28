import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { slugify } from '@/lib/slugify'
import {
  matchRegion,
  generateWhyDisconnect,
  suggestAttributes,
  generateSeo,
} from '@/discovery/admin/helpers/mapToPlace'
import { generateOutreachEmail } from '@/discovery/admin/helpers/generateOutreachEmail'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Auth check: verify the request is from an authenticated Payload user
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { action: string; id: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { action, id, reason } = body

  if (!action || !id) {
    return NextResponse.json({ error: 'Missing required fields: action, id' }, { status: 400 })
  }

  try {
    switch (action) {
      case 'accept': {
        // Fetch the candidate
        const candidate = await payload.findByID({
          collection: 'candidate-places',
          id,
        })

        if (!candidate) {
          return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
        }

        // Generate slug from the name
        const slug = slugify(candidate.name)

        // Match region from regionGuess
        const regionId = await matchRegion(candidate.regionGuess || '', payload)

        // Generate editorial content from scoring data
        const rawData = candidate.rawData as Record<string, unknown> | null
        const enrichmentData = rawData?.enrichment as Record<string, unknown> | null
        const offgridCues: string[] = Array.isArray(enrichmentData?.offgridCues) ? (enrichmentData.offgridCues as string[]) : []
        const reasons: string[] = Array.isArray(candidate.reasons) ? (candidate.reasons as string[]) : []
        const whyDisconnect = generateWhyDisconnect(reasons, offgridCues)
        const attributes = suggestAttributes(offgridCues)
        const seo = generateSeo(candidate.name, candidate.regionGuess || '', offgridCues)

        // Create a draft Place with enriched data
        const placeData: Record<string, unknown> = {
          title: candidate.name,
          slug,
          outboundUrl: candidate.websiteUrl || undefined,
          coordinates: candidate.coordinates || undefined,
          whyDisconnect,
          seoTitle: seo.seoTitle,
          seoDescription: seo.seoDescription,
          _status: 'draft',
        }

        if (regionId) {
          placeData.region = regionId
        }

        if (attributes.length > 0) {
          placeData.attributes = attributes
        }

        const newPlace = await payload.create({
          collection: 'places',
          draft: true,
          data: placeData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        })

        // Generate outreach email
        const generatedEmail = generateOutreachEmail(candidate)

        // Update candidate status
        await payload.update({
          collection: 'candidate-places',
          id,
          data: {
            status: 'accepted',
            acceptedPlaceId: newPlace.id,
            generatedEmail,
          },
        })

        return NextResponse.json({ success: true, placeId: newPlace.id })
      }

      case 'reject': {
        await payload.update({
          collection: 'candidate-places',
          id,
          data: {
            status: 'rejected',
            rejectionReason: reason || undefined,
          },
        })

        return NextResponse.json({ success: true })
      }

      case 'maybe': {
        await payload.update({
          collection: 'candidate-places',
          id,
          data: {
            status: 'maybe',
          },
        })

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        )
    }
  } catch (err) {
    console.error('Candidate action error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
