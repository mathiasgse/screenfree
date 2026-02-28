import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { ParallaxHero } from '@/components/ParallaxHero'
import { ScrollReveal } from '@/components/ScrollReveal'
import { StaggerGrid, StaggerItem } from '@/components/StaggerGrid'
import { PlaceCard } from '@/components/PlaceCard'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { FaqSection } from '@/components/FaqSection'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import type { Place, Collection as CollectionType } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const collections = await payload.find({
      collection: 'collections',
      where: { _status: { equals: 'published' } },
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
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })

  const collection = result.docs[0]
  if (!collection) return { title: 'Sammlung nicht gefunden' }

  const heroUrl = getImageUrl(collection.heroImage, 'hero')

  const meta = collection.meta
  const title = meta?.title || (collection as unknown as Record<string, unknown>).seoTitle as string || collection.title
  const description = meta?.description || (collection as unknown as Record<string, unknown>).seoDescription as string || collection.excerpt || collection.intro || `${collection.title} — Eine kuratierte Sammlung stiller Orte.`
  const ogImage = meta?.image && typeof meta.image === 'object' ? getImageUrl(meta.image, 'hero') : heroUrl

  return {
    title,
    description,
    alternates: { canonical: `/sammlungen/${slug}` },
    openGraph: {
      title,
      description,
      url: `/sammlungen/${slug}`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function CollectionPage({ params }: Args) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'collections',
    where: {
      slug: { equals: slug },
      ...(isDraft ? {} : { _status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
    draft: isDraft,
  })

  const collection = result.docs[0]
  if (!collection) notFound()

  const places = (collection.places?.filter(
    (p): p is Place => typeof p === 'object',
  ) ?? [])

  const relatedCollections = (collection.relatedCollections?.filter(
    (c): c is CollectionType => typeof c === 'object',
  ) ?? [])

  const faqItems = (collection.faq ?? []).map((f) => ({
    question: f.question,
    answer: f.answer,
  }))

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

      {/* CollectionPage + ItemList JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: collection.title,
          ...(collection.excerpt || collection.intro
            ? { description: collection.excerpt || collection.intro }
            : {}),
          url: `${siteUrl}/sammlungen/${slug}`,
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

      {/* FAQ JSON-LD */}
      {faqItems.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }}
        />
      )}

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
              name: 'Sammlungen',
              item: `${siteUrl}/sammlungen`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: collection.title,
              item: `${siteUrl}/sammlungen/${slug}`,
            },
          ],
        }}
      />

      {/* Full-Viewport Hero */}
      <ParallaxHero media={collection.heroImage} priority animate>
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

        {/* Editorial Content */}
        {collection.content && (
          <ScrollReveal>
            <div className="mx-auto mt-12 max-w-3xl">
              <RichTextRenderer data={collection.content} />
            </div>
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

        {/* FAQ */}
        {faqItems.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl">
              <FaqSection items={faqItems} />
            </div>
          </ScrollReveal>
        )}

        {/* Related Collections */}
        {relatedCollections.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
                Verwandte Sammlungen
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedCollections.map((col) => (
                  <Link key={col.id} href={`/sammlungen/${col.slug}`} className="group block">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-stone-200">
                      {getImageUrl(col.heroImage, 'card') && (
                        <Image
                          src={getImageUrl(col.heroImage, 'card')!}
                          alt={getImageAlt(col.heroImage)}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h3 className="mt-2 font-serif text-sm text-stone-700 transition-colors group-hover:text-accent">
                      {col.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Back Link */}
        <ScrollReveal>
          <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
            <Link
              href="/sammlungen"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-stone-500 transition-colors hover:text-accent"
            >
              <span aria-hidden="true">&larr;</span>
              Zurück zu allen Sammlungen
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </main>
  )
}
