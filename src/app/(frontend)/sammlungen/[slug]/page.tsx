import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { ParallaxHero } from '@/components/ParallaxHero'
import { ScrollReveal } from '@/components/ScrollReveal'
import { StaggerGrid, StaggerItem } from '@/components/StaggerGrid'
import { PlaceCard } from '@/components/PlaceCard'
import { getImageUrl } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import type { Place } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const collections = await payload.find({
      collection: 'collections',
      limit: 1000,
    })

    return collections.docs.map((collection) => ({
      slug: collection.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const collection = result.docs[0]
  if (!collection) return { title: 'Sammlung nicht gefunden' }

  const heroUrl = getImageUrl(collection.heroImage, 'hero')

  const description = collection.intro || `${collection.title} — Eine kuratierte Sammlung stiller Orte.`

  return {
    title: collection.title,
    description,
    alternates: { canonical: `/sammlungen/${slug}` },
    openGraph: {
      title: collection.title,
      description,
      url: `/sammlungen/${slug}`,
      ...(heroUrl ? { images: [{ url: heroUrl }] } : {}),
    },
  }
}

export default async function CollectionPage({ params }: Args) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: isDraft,
  })

  const collection = result.docs[0]
  if (!collection) notFound()

  const places = (collection.places?.filter(
    (p): p is Place => typeof p === 'object',
  ) ?? [])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'

  return (
    <main>
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm text-white">
          Entwurfsvorschau &mdash;{' '}
          <a href={`/api/exit-draft?path=/sammlungen/${slug}`} className="underline">
            Beenden
          </a>
        </div>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: collection.title,
          numberOfItems: places.length,
          itemListElement: places.map((place, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteUrl}/orte/${place.slug}`,
            name: place.title,
          })),
        }}
      />

      {/* Full-Viewport Hero */}
      <ParallaxHero media={collection.heroImage} priority>
        <Container>
          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {collection.title}
          </h1>
        </Container>
      </ParallaxHero>

      <Container className="py-16 md:py-24">
        {collection.intro && (
          <ScrollReveal>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-stone-500">
              {collection.intro}
            </p>
          </ScrollReveal>
        )}

        {/* Editorial Grid */}
        {places.length > 0 && (
          <div className="mt-16">
            {/* Feature first place + 2 stacked if enough places */}
            {places.length >= 3 ? (
              <>
                <StaggerGrid className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
                  <StaggerItem className="md:col-span-2 md:row-span-2">
                    <PlaceCard place={places[0]} variant="featured" />
                  </StaggerItem>
                  <StaggerItem>
                    <PlaceCard place={places[1]} />
                  </StaggerItem>
                  <StaggerItem>
                    <PlaceCard place={places[2]} />
                  </StaggerItem>
                </StaggerGrid>

                {places.length > 3 && (
                  <StaggerGrid className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {places.slice(3).map((place) => (
                      <StaggerItem key={place.id}>
                        <PlaceCard place={place} />
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                )}
              </>
            ) : (
              <StaggerGrid className="grid gap-6 sm:grid-cols-2">
                {places.map((place) => (
                  <StaggerItem key={place.id}>
                    <PlaceCard place={place} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}
          </div>
        )}
      </Container>
    </main>
  )
}
