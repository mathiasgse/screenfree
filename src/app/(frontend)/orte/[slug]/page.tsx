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
import { AttributeTag } from '@/components/AttributeTag'
import { AudienceTag } from '@/components/AudienceTag'
import { PriceRange } from '@/components/PriceRange'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import { QuietnessProfile } from '@/components/QuietnessProfile'
import { PlaceCTA } from '@/components/PlaceCTA'
import type { Region } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const places = await payload.find({
      collection: 'places',
      where: { _status: { equals: 'published' } },
      limit: 1000,
    })

    return places.docs.map((place) => ({
      slug: place.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'places',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })

  const place = result.docs[0]
  if (!place) return { title: 'Ort nicht gefunden' }

  const region = typeof place.region === 'object' ? (place.region as Region) : null
  const heroUrl = getImageUrl(place.heroImage, 'hero')

  const meta = place.meta
  const title = meta?.title || (place as unknown as Record<string, unknown>).seoTitle as string || place.title
  const description = meta?.description || (place as unknown as Record<string, unknown>).seoDescription as string || `${place.title}${region ? ` in ${region.title}` : ''} — Ein ruhiger Ort im Alpenraum.`
  const ogImage = meta?.image && typeof meta.image === 'object' ? getImageUrl(meta.image, 'hero') : heroUrl

  return {
    title,
    description,
    alternates: { canonical: `/orte/${slug}` },
    openGraph: {
      title,
      description,
      url: `/orte/${slug}`,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function PlacePage({ params }: Args) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'places',
    where: {
      slug: { equals: slug },
      ...(isDraft ? {} : { _status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
    draft: isDraft,
  })

  const place = result.docs[0]
  if (!place) notFound()

  const region = typeof place.region === 'object' ? (place.region as Region) : null

  const collectionsResult = await payload.find({
    collection: 'collections',
    where: {
      places: { contains: place.id },
      _status: { equals: 'published' },
    },
    limit: 3,
    depth: 1,
  })
  const relatedCollections = collectionsResult.docs

  const priceSymbols: Record<string, string> = {
    budget: '\u20AC',
    mid: '\u20AC\u20AC',
    premium: '\u20AC\u20AC\u20AC',
    luxury: '\u20AC\u20AC\u20AC\u20AC',
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'

  return (
    <main>
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm text-white">
          Entwurfsvorschau &mdash;{' '}
          <a href={`/api/exit-draft?path=/orte/${slug}`} className="underline">
            Beenden
          </a>
        </div>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LodgingBusiness',
          name: place.title,
          url: `${siteUrl}/orte/${slug}`,
          ...(getImageUrl(place.heroImage, 'hero') ? { image: getImageUrl(place.heroImage, 'hero') } : {}),
          ...(place.outboundUrl ? { sameAs: place.outboundUrl } : {}),
          ...(region ? { address: { '@type': 'PostalAddress', addressRegion: region.title } } : {}),
          ...(place.coordinates ? {
            geo: {
              '@type': 'GeoCoordinates',
              longitude: place.coordinates[0],
              latitude: place.coordinates[1],
            },
          } : {}),
          ...(place.priceRange ? { priceRange: priceSymbols[place.priceRange] || '' } : {}),
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
              name: 'Orte',
              item: `${siteUrl}/orte`,
            },
            ...(region ? [{
              '@type': 'ListItem',
              position: 3,
              name: region.title,
              item: `${siteUrl}/region/${region.slug}`,
            }] : []),
            {
              '@type': 'ListItem',
              position: region ? 4 : 3,
              name: place.title,
              item: `${siteUrl}/orte/${slug}`,
            },
          ],
        }}
      />

      {/* Full-Viewport Hero */}
      <ParallaxHero media={place.heroImage} priority animate>
        <Container>
          {region && (
            <Link
              href={`/region/${region.slug}`}
              className="inline-block text-sm tracking-[0.18em] text-white/70 uppercase transition-colors hover:text-white"
            >
              {region.title}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {place.title}
          </h1>
        </Container>
      </ParallaxHero>

      <Container className="py-16 md:py-24">
        {/* Quietness profile */}
        {place.quietnessLevel && (
          <ScrollReveal>
            <div className="mx-auto mb-12 max-w-3xl">
              <QuietnessProfile
                level={Number(place.quietnessLevel)}
                traits={place.quietnessTraits ?? []}
                priceRange={place.priceRange ?? null}
                size="large"
              />
            </div>
          </ScrollReveal>
        )}

        {/* Short Story with Pull Quote */}
        {place.shortStory && (
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <div className="text-lg leading-relaxed text-stone-600 md:text-xl">
                <RichTextRenderer data={place.shortStory} />
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Why Disconnect */}
        {place.whyDisconnect && place.whyDisconnect.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl rounded-md bg-stone-100 px-8 py-10 md:px-12 md:py-14">
              <h2 className="heading-accent font-serif text-2xl">{place.whyDisconnectHeading || 'Warum hier abschalten'}</h2>
              <ul className="mt-6 space-y-3">
                {place.whyDisconnect.map((item) => (
                  <li
                    key={item.id || item.reason}
                    className="flex items-start gap-3 text-stone-600"
                  >
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        )}

        {/* Attributes + Price */}
        {((place.attributes && place.attributes.length > 0) || (!place.quietnessLevel && place.priceRange)) && (
          <ScrollReveal>
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center gap-3">
              {place.attributes?.map((attr) => (
                <AttributeTag key={attr} attribute={attr} />
              ))}
              {!place.quietnessLevel && place.priceRange && (
                <span className="ml-2 text-sm">
                  <PriceRange range={place.priceRange} />
                </span>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Audience */}
        {place.audience && place.audience.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-6 max-w-3xl">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-400">
                Für wen geeignet
              </p>
              <div className="flex flex-wrap gap-2">
                {place.audience.map((a) => (
                  <AudienceTag key={a} value={a} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* CTA: Anfrage senden + Website */}
        <ScrollReveal>
          <div className="mx-auto mt-12 max-w-3xl">
            <PlaceCTA
              placeId={place.id}
              placeTitle={place.title}
              heroImage={place.heroImage}
              outboundUrl={place.outboundUrl}
              ctaLabel={place.ctaLabel}
            />
          </div>
        </ScrollReveal>

        {/* Gallery — Mixed Aspect Ratios */}
        {place.gallery && place.gallery.length > 0 && (
          <ScrollReveal>
            <div className="mt-20 border-t border-stone-200 pt-16">
              <p className="mb-8 text-xs font-medium uppercase tracking-widest text-accent">Galerie</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {place.gallery.map((media, i) => {
                  const url = getImageUrl(media, 'card')
                  if (!url) return null
                  const isWide = i === 0
                  const isPortrait = i % 3 === 2
                  return (
                    <div
                      key={i}
                      className={`relative overflow-hidden bg-stone-200 ${
                        isWide
                          ? 'aspect-[16/10] sm:col-span-2'
                          : isPortrait
                            ? 'aspect-[3/4]'
                            : 'aspect-[3/2]'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={getImageAlt(media)}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                        sizes={isWide ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>
        )}
        {/* Related Collections */}
        {relatedCollections.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
                Enthalten in
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
              href="/orte"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-stone-500 transition-colors hover:text-accent"
            >
              <span aria-hidden="true">&larr;</span>
              Zurück zu allen Orten
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </main>
  )
}
