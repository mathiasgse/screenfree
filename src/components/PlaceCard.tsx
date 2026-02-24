import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { PriceRange } from './PriceRange'
import { ATTRIBUTE_OPTIONS } from '@/lib/constants'
import type { Place } from '@/payload-types'

const attrLabel = (val: string) =>
  ATTRIBUTE_OPTIONS.find((o) => o.value === val)?.label ?? val

export function PlaceCard({
  place,
  variant = 'default',
}: {
  place: Place
  variant?: 'default' | 'featured'
}) {
  const imageUrl = getImageUrl(place.heroImage, variant === 'featured' ? 'hero' : 'card')
  const region = typeof place.region === 'object' ? place.region : null
  const chips = (place.attributes ?? []).slice(0, 2)

  if (variant === 'featured') {
    return (
      <Link href={`/orte/${place.slug}`} className="group flex h-full flex-col">
        <div
          className="relative min-h-[350px] flex-1 overflow-hidden rounded-md bg-stone-200"
          style={{ viewTransitionName: `place-hero-${place.slug}`, contain: 'layout' }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={getImageAlt(place.heroImage)}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent transition-opacity duration-500" />
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-6 transition-transform duration-500 group-hover:translate-y-0 md:p-8">
            <div className="mb-3 h-[2px] w-8 bg-accent" />
            <h3 className="font-serif text-2xl text-white md:text-3xl">{place.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              {region && <span>{region.title}</span>}
              {region && place.priceRange && <span>&middot;</span>}
              {place.priceRange && <PriceRange range={place.priceRange} />}
            </div>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-stone-400">Merkmale</span>
            {chips.map((attr) => (
              <span
                key={attr}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500"
              >
                {attrLabel(attr)}
              </span>
            ))}
          </div>
        )}
      </Link>
    )
  }

  return (
    <Link href={`/orte/${place.slug}`} className="group block">
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-md bg-stone-200"
        style={{ viewTransitionName: `place-hero-${place.slug}`, contain: 'layout' }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={getImageAlt(place.heroImage)}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />
      </div>
      <div className="mt-3">
        <h3 className="font-serif text-lg text-stone-900 transition-colors group-hover:text-accent">{place.title}</h3>
        <div className="mt-3 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-8" />
        <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
          {region && <span>{region.title}</span>}
          {region && place.priceRange && <span>&middot;</span>}
          {place.priceRange && <PriceRange range={place.priceRange} />}
        </div>
        {chips.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {chips.map((attr) => (
              <span
                key={attr}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500"
              >
                {attrLabel(attr)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
