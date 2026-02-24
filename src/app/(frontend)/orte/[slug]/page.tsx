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
import { PriceRange } from '@/components/PriceRange'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
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

  const description = `${place.title}${region ? ` in ${region.title}` : ''} — Ein ruhiger Ort im Alpenraum.`

  return {
    title: place.title,
    description,
    alternates: { canonical: `/orte/${slug}` },
    openGraph: {
      title: place.title,
      description,
      url: `/orte/${slug}`,
      type: 'article',
      ...(heroUrl ? { images: [{ url: heroUrl }] } : {}),
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
    where: { places: { contains: place.id } },
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
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'}/orte/${slug}`,
          ...(getImageUrl(place.heroImage, 'hero') ? { image: getImageUrl(place.heroImage, 'hero') } : {}),
          ...(place.outboundUrl ? { sameAs: place.outboundUrl } : {}),
          ...(region ? { address: { '@type': 'PostalAddress', addressRegion: region.title } } : {}),
          ...(place.priceRange ? { priceRange: priceSymbols[place.priceRange] || '' } : {}),
        }}
      />

      {/* Full-Viewport Hero */}
      <ParallaxHero media={place.heroImage} priority transitionName={`place-hero-${slug}`}>
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
              <h2 className="heading-accent font-serif text-2xl">Warum hier abschalten</h2>
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
        {((place.attributes && place.attributes.length > 0) || place.priceRange) && (
          <ScrollReveal>
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center gap-3">
              {place.attributes?.map((attr) => (
                <AttributeTag key={attr} attribute={attr} />
              ))}
              {place.priceRange && (
                <span className="ml-2 text-sm">
                  <PriceRange range={place.priceRange} />
                </span>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Outbound Link */}
        {place.outboundUrl && (
          <ScrollReveal>
            <div className="mx-auto mt-12 max-w-3xl">
              <a
                href={place.outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-accent-dark px-8 py-4 text-sm tracking-wide text-white transition-all duration-300 hover:bg-accent"
              >
                Website besuchen
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </div>
          </ScrollReveal>
        )}

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
