'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { MapPlace } from '@/lib/map-types'
import { AttributeTag } from '@/components/AttributeTag'
import { PriceRange } from '@/components/PriceRange'

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

            {/* Attributes + price */}
            {(place.attributes.length > 0 || place.priceRange) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {place.attributes.map((attr) => (
                  <AttributeTag key={attr} attribute={attr} />
                ))}
                {place.priceRange && <PriceRange range={place.priceRange} />}
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

            {/* Gallery */}
            {place.gallery.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {place.gallery.map((img, i) => (
                  <div key={i} className="relative aspect-[3/2] overflow-hidden rounded-lg">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Action links */}
            <div className="mt-6 flex flex-col gap-3">
              {place.outboundUrl && (
                <a
                  href={place.outboundUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-dark"
                >
                  Website besuchen &rarr;
                </a>
              )}
              <Link
                href={`/orte/${place.slug}`}
                className="inline-flex items-center gap-1 text-sm text-stone-600 transition-colors hover:text-stone-900"
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
            <div className="relative mx-4 mt-3 aspect-[3/2] overflow-hidden rounded-xl">
              <Image
                src={place.heroImageUrl}
                alt={place.heroImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          ) : (
            <div className="mx-4 mt-3 aspect-[3/2] rounded-xl bg-stone-200" />
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

            {(place.attributes.length > 0 || place.priceRange) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {place.attributes.map((attr) => (
                  <AttributeTag key={attr} attribute={attr} />
                ))}
                {place.priceRange && <PriceRange range={place.priceRange} />}
              </div>
            )}

            {place.whyDisconnect.length > 0 && (
              <div className="mt-4">
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

            {place.gallery.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {place.gallery.map((img, i) => (
                  <div key={i} className="relative aspect-[3/2] overflow-hidden rounded-lg">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="45vw"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3">
              {place.outboundUrl && (
                <a
                  href={place.outboundUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-dark"
                >
                  Website besuchen &rarr;
                </a>
              )}
              <Link
                href={`/orte/${place.slug}`}
                className="inline-flex items-center gap-1 text-sm text-stone-600 transition-colors hover:text-stone-900"
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
