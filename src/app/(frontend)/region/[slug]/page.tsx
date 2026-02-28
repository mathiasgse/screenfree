import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { PlaceCard } from '@/components/PlaceCard'
import { JsonLd } from '@/components/JsonLd'
import { getImageUrl } from '@/lib/media'
import type { Place, Homepage } from '@/payload-types'

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

  const meta = region.meta
  const title = meta?.title || (region as unknown as Record<string, unknown>).seoTitle as string || region.title
  const description = meta?.description || (region as unknown as Record<string, unknown>).seoDescription as string || region.intro || `${region.title} — Stille Orte in der Region.`
  const heroUrl = getImageUrl(region.heroImage, 'hero')
  const ogImage = meta?.image && typeof meta.image === 'object' ? getImageUrl(meta.image, 'hero') : heroUrl

  return {
    title,
    description,
    alternates: { canonical: `/region/${slug}` },
    openGraph: {
      title,
      description,
      url: `/region/${slug}`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
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

  const [placesResult, homepageResult] = await Promise.all([
    payload.find({
      collection: 'places',
      where: {
        region: { equals: region.id },
        _status: { equals: 'published' },
      },
      depth: 2,
      limit: 100,
      sort: '-createdAt',
    }),
    payload.findGlobal({ slug: 'homepage' }),
  ])

  const places = placesResult.docs as Place[]
  const homepage = homepageResult as Homepage

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'

  return (
    <main>
      {/* CollectionPage + ItemList JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: region.title,
          ...(region.intro ? { description: region.intro } : {}),
          url: `${siteUrl}/region/${slug}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: places.length,
            itemListElement: places.map((place, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${siteUrl}/orte/${place.slug}`,
              name: place.title,
            })),
          },
        }}
      />

      {/* BreadcrumbList JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Stille Orte',
              item: siteUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Regionen',
              item: `${siteUrl}/region`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: region.title,
              item: `${siteUrl}/region/${slug}`,
            },
          ],
        }}
      />

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
            {homepage?.regionEmptyMessage || 'Bald mehr Orte in dieser Region.'}
          </p>
        )}
      </Container>
    </main>
  )
}
