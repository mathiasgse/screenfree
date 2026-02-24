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
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { FaqSection } from '@/components/FaqSection'
import { PlaceCard } from '@/components/PlaceCard'
import { JsonLd } from '@/components/JsonLd'
import { BLOG_CATEGORIES } from '@/lib/constants'
import { getImageUrl, getImageAlt } from '@/lib/media'
import type { Place, Collection as CollectionType, Region } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

const categoryLabel = (val: string) =>
  BLOG_CATEGORIES.find((c) => c.value === val)?.label ?? val

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
      limit: 1000,
    })

    return posts.docs.map((post) => ({
      slug: post.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })

  const post = result.docs[0]
  if (!post) return { title: 'Artikel nicht gefunden' }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || `${post.title} — STILL Journal`
  const heroUrl = getImageUrl(post.heroImage, 'hero')

  return {
    title,
    description,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title,
      description,
      url: `/journal/${slug}`,
      type: 'article',
      ...(heroUrl ? { images: [{ url: heroUrl }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: { equals: slug },
      ...(isDraft ? {} : { _status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
    draft: isDraft,
  })

  const post = result.docs[0]
  if (!post) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'
  const heroUrl = getImageUrl(post.heroImage, 'hero')

  const relatedPlaces = (post.relatedPlaces ?? []).filter(
    (p): p is Place => typeof p === 'object',
  )
  const relatedCollections = (post.relatedCollections ?? []).filter(
    (c): c is CollectionType => typeof c === 'object',
  )
  const relatedRegions = (post.relatedRegions ?? []).filter(
    (r): r is Region => typeof r === 'object',
  )

  const faqItems = (post.faq ?? []).map((f) => ({
    question: f.question,
    answer: f.answer,
  }))

  return (
    <main>
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm text-white">
          Entwurfsvorschau &mdash;{' '}
          <a href={`/api/exit-draft?path=/journal/${slug}`} className="underline">
            Beenden
          </a>
        </div>
      )}

      {/* Article JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          ...(heroUrl ? { image: heroUrl } : {}),
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          author: {
            '@type': 'Organization',
            name: 'STILL',
          },
          publisher: {
            '@type': 'Organization',
            name: 'STILL',
          },
          url: `${siteUrl}/journal/${slug}`,
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

      {/* Hero */}
      <ParallaxHero media={post.heroImage} priority transitionName={`blog-hero-${slug}`}>
        <Container>
          {post.category && (
            <span className="inline-block text-sm tracking-[0.18em] text-white/70 uppercase">
              {categoryLabel(post.category)}
            </span>
          )}
          <h1 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {post.title}
          </h1>
        </Container>
      </ParallaxHero>

      <Container className="py-16 md:py-24">
        {/* Excerpt */}
        {post.excerpt && (
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <p className="text-lg leading-relaxed text-stone-600 md:text-xl">
                {post.excerpt}
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Content */}
        {post.content && (
          <ScrollReveal>
            <div className="mx-auto mt-12 max-w-3xl">
              <RichTextRenderer data={post.content} />
            </div>
          </ScrollReveal>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl">
              <FaqSection items={faqItems} />
            </div>
          </ScrollReveal>
        )}

        {/* Related Places */}
        {relatedPlaces.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
                Verknüpfte Orte
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Related Collections */}
        {relatedCollections.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
                Passende Sammlungen
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

        {/* Related Regions */}
        {relatedRegions.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-12 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {relatedRegions.map((region) => (
                  <Link
                    key={region.id}
                    href={`/region/${region.slug}`}
                    className="rounded-full border border-stone-200 px-4 py-1.5 text-xs tracking-wide text-stone-500 transition-colors hover:border-accent hover:text-accent"
                  >
                    {region.title}
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Back link */}
        <ScrollReveal>
          <div className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-10">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-stone-500 transition-colors hover:text-accent"
            >
              <span aria-hidden="true">&larr;</span>
              Zurück zum Journal
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </main>
  )
}
