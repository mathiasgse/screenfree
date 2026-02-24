import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '@/components/Container'
import { PlaceCard } from '@/components/PlaceCard'
import { FilterBar } from '@/components/FilterBar'
import type { Place, Region } from '@/payload-types'
import type { Where } from 'payload'

export const metadata: Metadata = {
  title: 'Alle Orte',
  description: 'Entdecke kuratierte stille Orte im Alpenraum — Unterkünfte zum Abschalten.',
  alternates: { canonical: '/orte' },
  openGraph: {
    title: 'Alle Orte',
    description: 'Entdecke kuratierte stille Orte im Alpenraum — Unterkünfte zum Abschalten.',
    url: '/orte',
  },
}

export const revalidate = 60

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function OrtePage({ searchParams }: Props) {
  const { region, preis, tag } = await searchParams

  let regions: Region[] = []
  let places: Place[] = []

  try {
    const payload = await getPayload({ config })

    // Load all regions for filter dropdown
    const regionsResult = await payload.find({
      collection: 'regions',
      limit: 100,
      sort: 'title',
    })
    regions = regionsResult.docs as Region[]

    // Build where clause based on filters
    const where: Where = {
      _status: { equals: 'published' },
    }

    if (region) {
      const regionDoc = regions.find((r) => r.slug === region)
      if (regionDoc) {
        where.region = { equals: regionDoc.id }
      }
    }

    if (preis) {
      where.priceRange = { equals: preis }
    }

    if (tag) {
      where.attributes = { contains: tag }
    }

    const placesResult = await payload.find({
      collection: 'places',
      where,
      limit: 100,
      sort: 'title',
      depth: 2,
    })
    places = placesResult.docs as Place[]
  } catch {
    // Payload unavailable — render empty state
  }

  const hasFilters = !!(region || preis || tag)

  return (
    <main>
      <section className="pt-28 pb-16">
        <Container>
          <h1 className="heading-accent font-serif text-3xl sm:text-4xl">Alle Orte</h1>
          <p className="mt-3 text-stone-500">
            {places.length} {places.length === 1 ? 'Ort' : 'Orte'}{hasFilters ? ' gefunden' : ''}
          </p>

          <div className="mt-8">
            <Suspense>
              <FilterBar regions={regions} />
            </Suspense>
          </div>

          {places.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-stone-400">
              Keine Orte gefunden. Versuche andere Filter.
            </p>
          )}
        </Container>
      </section>
    </main>
  )
}
