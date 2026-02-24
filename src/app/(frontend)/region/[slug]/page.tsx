import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { PlaceCard } from '@/components/PlaceCard'
import type { Place } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const regions = await payload.find({
      collection: 'regions',
      limit: 1000,
    })

    return regions.docs.map((region) => ({
      slug: region.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'regions',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const region = result.docs[0]
  if (!region) return { title: 'Region nicht gefunden' }

  const description = region.intro || `${region.title} — Stille Orte in der Region.`

  return {
    title: region.title,
    description,
    alternates: { canonical: `/region/${slug}` },
    openGraph: {
      title: region.title,
      description,
      url: `/region/${slug}`,
    },
  }
}

export default async function RegionPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'regions',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const region = result.docs[0]
  if (!region) notFound()

  const placesResult = await payload.find({
    collection: 'places',
    where: {
      region: { equals: region.id },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 100,
    sort: '-createdAt',
  })

  const places = placesResult.docs as Place[]

  return (
    <main>
      <Container className="pt-28 pb-12 md:pb-16">
        <h1 className="heading-accent font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          {region.title}
        </h1>

        {region.intro && (
          <p className="mt-4 max-w-2xl text-lg text-stone-500">{region.intro}</p>
        )}

        {/* Places Grid */}
        {places.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-stone-400">
            Bald mehr Orte in dieser Region.
          </p>
        )}
      </Container>
    </main>
  )
}
