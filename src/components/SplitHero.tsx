import Link from 'next/link'
import type { Media } from '@/payload-types'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { SplitHeroImage } from './SplitHeroImage'

export function SplitHero({
  media,
  priority = false,
  label = 'Still — Alpenraum',
  headline = 'Orte, an denen\ndein Kopf\nleise wird.',
  subheadline = 'Eine kuratierte Sammlung stiller Unterkünfte im Alpenraum.',
  ctaLabel = 'Entdecken',
  mapCtaLabel = 'Karte',
  regions,
  collections,
  counts,
}: {
  media: string | Media | null | undefined
  priority?: boolean
  label?: string
  headline?: string
  subheadline?: string
  ctaLabel?: string
  mapCtaLabel?: string
  regions?: { title: string; slug: string }[]
  collections?: { title: string; slug: string }[]
  counts?: { places: number; regions: number; collections: number }
}) {
  const url = getImageUrl(media, 'hero')
  const hasRegions = regions && regions.length > 0
  const hasCollections = collections && collections.length > 0

  return (
    <section className="bg-stone-50">
      {/* Text area — centered, takes ~65svh */}
      <div className="flex min-h-[65svh] flex-col items-center justify-center px-6 pt-28 text-center md:pt-32">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          {label}
        </p>

        <h1 className="mt-6 font-serif text-[clamp(3rem,5.5vw,5.5rem)] leading-[0.95] text-stone-900">
          {headline.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-stone-500 sm:text-lg">
          {subheadline}
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/orte"
            className="inline-flex h-12 items-center rounded-full border border-stone-200 px-8 text-sm font-medium tracking-wide text-stone-700 transition-colors duration-300 hover:bg-stone-100"
          >
            {ctaLabel}
            <span className="ml-2" aria-hidden="true">→</span>
          </Link>
          <Link
            href="/karte"
            className="inline-flex h-12 items-center rounded-full border border-stone-200 px-8 text-sm font-medium tracking-wide text-stone-400 transition-colors duration-300 hover:text-stone-700 hover:bg-stone-100"
          >
            {mapCtaLabel}
          </Link>
        </div>

        {counts && counts.places > 0 && (
          <p className="mt-8 text-sm tracking-wide text-stone-400">
            <span className="font-medium text-stone-700">{counts.places}</span> handverlesene Orte
            <span className="text-stone-300"> · </span>
            <span className="font-medium text-stone-700">{counts.regions}</span> Regionen
            <span className="text-stone-300"> · </span>
            <span className="font-medium text-stone-700">{counts.collections}</span> Sammlungen
          </p>
        )}

        {(hasCollections || hasRegions) && (
          <nav className="mt-14 flex flex-wrap items-center justify-center gap-2">
            {collections?.map((collection) => (
              <Link
                key={`c-${collection.slug}`}
                href={`/sammlungen/${collection.slug}`}
                className="rounded-full bg-stone-100 px-3.5 py-1.5 text-xs tracking-wide text-stone-400 transition-colors duration-200 hover:bg-stone-200 hover:text-stone-600"
              >
                {collection.title}
              </Link>
            ))}
            {regions?.map((region) => (
              <Link
                key={`r-${region.slug}`}
                href={`/region/${region.slug}`}
                className="rounded-full bg-stone-100 px-3.5 py-1.5 text-xs tracking-wide text-stone-400 transition-colors duration-200 hover:bg-stone-200 hover:text-stone-600"
              >
                {region.title}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Image peek — starts in viewport, extends below fold */}
      {url && (
        <div className="mx-6 mt-4 md:mx-10 lg:mx-auto lg:max-w-6xl">
          <SplitHeroImage
            url={url}
            alt={getImageAlt(media)}
            priority={priority}
          />
        </div>
      )}
    </section>
  )
}
