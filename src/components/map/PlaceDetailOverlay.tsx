'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { MapPlace } from '@/lib/map-types'
import { AttributeTag } from '@/components/AttributeTag'

import { PriceRange } from '@/components/PriceRange'
import { QuietnessProfile } from '@/components/QuietnessProfile'

export function PlaceDetailOverlay({
  place,
  onClose,
}: {
  place: MapPlace
  onClose: () => void
}) {
  const [isClosing, setIsClosing] = useState(false)

  const triggerClose = useCallback(() => {
    setIsClosing(true)
  }, [])

  // Escape key closes overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') triggerClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [triggerClose])

  const handleAnimationEnd = () => {
    if (isClosing) onClose()
  }

  return (
    <div className="absolute inset-0 z-20 flex pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto md:pointer-events-none"
        onClick={triggerClose}
        aria-hidden="true"
      />

      {/* Desktop: right panel */}
      <div
        className={`pointer-events-auto relative ml-auto hidden h-full w-[480px] flex-col border-l border-stone-200 bg-stone-50 md:flex ${
          isClosing
            ? 'animate-overlay-slide-out-right'
            : 'animate-overlay-slide-in-right'
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Hero image */}
          {place.heroImageUrl ? (
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={place.heroImageUrl}
                alt={place.heroImageAlt}
                fill
                className="object-cover"
                sizes="480px"
              />
            </div>
          ) : (
            <div className="aspect-[3/2] w-full bg-stone-200" />
          )}

          {/* Close button */}
          <button
            onClick={triggerClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/40 text-white transition-colors hover:bg-stone-900/60"
            aria-label="Schließen"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Title + region */}
            <h3 className="font-serif text-2xl text-stone-900">{place.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{place.region.title}</p>

            {/* Quietness profile */}
            {place.quietnessLevel && (
              <div className="mt-3">
                <QuietnessProfile level={place.quietnessLevel} traits={place.quietnessTraits} priceRange={place.priceRange} />
              </div>
            )}

            {/* Attributes + price */}
            {(place.attributes.length > 0 || (!place.quietnessLevel && place.priceRange)) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {place.attributes.map((attr) => (
                  <AttributeTag key={attr} attribute={attr} />
                ))}
                {!place.quietnessLevel && place.priceRange && <PriceRange range={place.priceRange} />}
              </div>
            )}

            {/* Why disconnect */}
            {place.whyDisconnect.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  Warum hier abschalten
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {place.whyDisconnect.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action links */}
            <div className="mt-6 flex flex-col gap-3">
              {place.outboundUrl && (
                <a
                  href={place.outboundUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-1.5 rounded-sm bg-accent-dark px-5 py-2.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-accent"
                >
                  Website besuchen
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                </a>
              )}
              <Link
                href={`/orte/${place.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-stone-300 px-5 py-2.5 text-sm font-medium tracking-wide text-stone-600 transition-all duration-300 hover:border-stone-500 hover:text-stone-700"
              >
                Mehr erfahren &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className={`pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl border-t border-stone-200 bg-stone-50 md:hidden ${
          isClosing
            ? 'animate-overlay-slide-out-up'
            : 'animate-overlay-slide-in-up'
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 px-4 pt-3 pb-0">
          <div className="mx-auto h-1 w-10 rounded-full bg-stone-300" />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Hero image */}
          {place.heroImageUrl ? (
            <div className="relative mx-4 mt-3 aspect-[3/2] overflow-hidden rounded-md">
              <Image
                src={place.heroImageUrl}
                alt={place.heroImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          ) : (
            <div className="mx-4 mt-3 aspect-[3/2] rounded-md bg-stone-200" />
          )}

          {/* Close button */}
          <button
            onClick={triggerClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:text-stone-900"
            aria-label="Schließen"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Content */}
          <div className="px-5 py-4 pb-8">
            <h3 className="font-serif text-2xl text-stone-900">{place.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{place.region.title}</p>

            {place.quietnessLevel && (
              <div className="mt-3">
                <QuietnessProfile level={place.quietnessLevel} traits={place.quietnessTraits} priceRange={place.priceRange} />
              </div>
            )}

            {(place.attributes.length > 0 || (!place.quietnessLevel && place.priceRange)) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {place.attributes.map((attr) => (
                  <AttributeTag key={attr} attribute={attr} />
                ))}
                {!place.quietnessLevel && place.priceRange && <PriceRange range={place.priceRange} />}
              </div>
            )}

            {place.whyDisconnect.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  Warum hier abschalten
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {place.whyDisconnect.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {place.outboundUrl && (
                <a
                  href={place.outboundUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-1.5 rounded-sm bg-accent-dark px-5 py-2.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-accent"
                >
                  Website besuchen
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                </a>
              )}
              <Link
                href={`/orte/${place.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-stone-300 px-5 py-2.5 text-sm font-medium tracking-wide text-stone-600 transition-all duration-300 hover:border-stone-500 hover:text-stone-700"
              >
                Mehr erfahren &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
