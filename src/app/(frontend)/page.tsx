import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { PlaceCard } from '@/components/PlaceCard'
import { SplitHero } from '@/components/SplitHero'
import { ScrollReveal } from '@/components/ScrollReveal'
import { StaggerGrid, StaggerItem } from '@/components/StaggerGrid'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { IntroSection } from '@/components/IntroSection'
import { AtmosphereSection } from '@/components/AtmosphereSection'
import { MapTeaser } from '@/components/MapTeaser'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import { BlogCard } from '@/components/BlogCard'
import type { Place, Collection as CollectionType, Homepage, Region, BlogPost } from '@/payload-types'

export const metadata: Metadata = {
  title: 'STILL — Kuratierte stille Orte im Alpenraum',
  alternates: { canonical: '/' },
}

export const revalidate = 60

export default async function HomePage() {
  let places: Place[] = []
  let collections: CollectionType[] = []
  let homepage: Homepage | null = null
  let regions: Region[] = []
  let totalPlaces = 0
  let blogPosts: BlogPost[] = []

  try {
    const payload = await getPayload({ config })
    const [placesResult, collectionsResult, homepageResult, regionsResult, blogResult] = await Promise.all([
      payload.find({
        collection: 'places',
        where: { _status: { equals: 'published' } },
        limit: 9,
        sort: '-createdAt',
        depth: 2,
      }),
      payload.find({
        collection: 'collections',
        limit: 6,
        depth: 2,
      }),
      payload.findGlobal({ slug: 'homepage', depth: 1 }),
      payload.find({
        collection: 'regions',
        limit: 20,
        sort: 'title',
      }),
      payload.find({
        collection: 'blog-posts',
        where: { _status: { equals: 'published' } },
        limit: 3,
        sort: '-createdAt',
        depth: 1,
      }),
    ])
    places = placesResult.docs as Place[]
    totalPlaces = placesResult.totalDocs
    collections = collectionsResult.docs as CollectionType[]
    homepage = homepageResult as Homepage
    regions = regionsResult.docs as Region[]
    blogPosts = blogResult.docs as BlogPost[]
  } catch {
    // Payload unavailable — render empty state
  }

  // Hero image: CMS field first, fallback to first place/collection
  const heroMedia = homepage?.heroImage ?? places[0]?.heroImage ?? collections[0]?.heroImage ?? null

  return (
    <main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'STILL',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place',
          description: 'Eine kuratierte Sammlung der ruhigsten Orte im Alpenraum.',
        }}
      />

      {/* Split-Screen Hero */}
      <SplitHero
        media={heroMedia}
        priority
        label={homepage?.heroLabel ?? undefined}
        headline={homepage?.heroHeadline ?? undefined}
        subheadline={homepage?.heroSubheadline ?? undefined}
        ctaLabel={homepage?.heroCTALabel ?? undefined}
        regions={regions.map((r) => ({ title: r.title, slug: r.slug }))}
        collections={collections.map((c) => ({ title: c.title, slug: c.slug }))}
        counts={{ places: totalPlaces, regions: regions.length, collections: collections.length }}
      />

      {/* Intro */}
      {homepage?.introText && (
        <ScrollReveal>
          <IntroSection text={homepage.introText} />
        </ScrollReveal>
      )}

      {/* Places — Editorial Grid */}
      {places.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">{homepage?.placesLabel ?? 'Entdecken'}</p>
              <h2 className="heading-accent mt-3 font-serif text-3xl sm:text-4xl md:text-5xl">
                {homepage?.placesHeading ?? 'Ausgewählte Orte'}
              </h2>
            </ScrollReveal>

            <div className="mt-12 md:mt-16">
              {/* Feature: first place large, 2+3 stacked beside it */}
              {places.length >= 3 && (
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
              )}

              {/* Second row: 3-column grid */}
              {places.length > 3 && (
                <StaggerGrid className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {places.slice(3, 6).map((place) => (
                    <StaggerItem key={place.id}>
                      <PlaceCard place={place} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              )}

              {/* Third row: 3-column grid */}
              {places.length > 6 && (
                <StaggerGrid className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {places.slice(6, 9).map((place) => (
                    <StaggerItem key={place.id}>
                      <PlaceCard place={place} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              )}
            </div>

            <ScrollReveal className="mt-12 text-center">
              <Link
                href="/orte"
                className="inline-block h-12 rounded-full border border-stone-200 px-8 text-sm font-medium leading-[3rem] tracking-wide text-stone-700 transition-all duration-300 hover:bg-stone-100"
              >
                {homepage?.placesCTALabel ?? 'Alle Orte entdecken'}
              </Link>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* Map Teaser */}
      <ScrollReveal>
        <MapTeaser
          coordinates={places
            .filter((p) => p.coordinates)
            .map((p) => p.coordinates as [number, number])}
        />
      </ScrollReveal>

      {/* Collections — Horizontal Scroll */}
      {collections.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">{homepage?.collectionsLabel ?? 'Kuratiert'}</p>
              <h2 className="heading-accent mt-3 font-serif text-3xl sm:text-4xl md:text-5xl">
                {homepage?.collectionsHeading ?? 'Sammlungen'}
              </h2>
            </ScrollReveal>
          </Container>

          <div className="mt-12 md:mt-16">
            <div className="relative">
              {/* Fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-stone-50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-stone-50 to-transparent" />

              <div className="flex gap-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide md:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
                {collections.map((collection) => {
                  const imageUrl = getImageUrl(collection.heroImage, 'card')
                  return (
                    <Link
                      key={collection.id}
                      href={`/sammlungen/${collection.slug}`}
                      className="group flex-shrink-0 snap-start"
                      style={{ width: 'min(340px, 80vw)' }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-stone-200">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={getImageAlt(collection.heroImage)}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
                            sizes="340px"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />
                      </div>
                      <h3 className="mt-3 font-serif text-lg text-stone-900">
                        {collection.title}
                      </h3>
                      {collection.intro && (
                        <p className="mt-1 text-sm text-stone-500 line-clamp-2">
                          {collection.intro}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Journal */}
      {blogPosts.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Journal</p>
              <h2 className="heading-accent mt-3 font-serif text-3xl sm:text-4xl md:text-5xl">
                Aus dem Journal
              </h2>
            </ScrollReveal>

            <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <BlogCard post={post} />
                </StaggerItem>
              ))}
            </StaggerGrid>

            <ScrollReveal className="mt-12 text-center">
              <Link
                href="/journal"
                className="inline-block h-12 rounded-full border border-stone-200 px-8 text-sm font-medium leading-[3rem] tracking-wide text-stone-700 transition-all duration-300 hover:bg-stone-100"
              >
                Zum Journal
              </Link>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* Atmosphere */}
      <ScrollReveal>
        <AtmosphereSection
          media={homepage?.atmosphereImage ?? null}
          text={homepage?.atmosphereText ?? undefined}
        />
      </ScrollReveal>

      {/* Newsletter */}
      <ScrollReveal>
        <NewsletterSignup />
      </ScrollReveal>
    </main>
  )
}
