'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MapPlace } from '@/lib/map-types'

export function MapPin({
  place,
  isActive,
  isHovered = false,
  onClick,
}: {
  place: MapPlace
  isActive: boolean
  isHovered?: boolean
  onClick: () => void
}) {
  const [localHovered, setLocalHovered] = useState(false)

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
    >
      <div
        className={`rounded-full transition-all duration-200 ${
          isActive
            ? 'h-5 w-5 border-2 border-white bg-accent shadow-md'
            : isHovered
              ? 'h-4 w-4 border-2 border-white bg-accent shadow-md ring-4 ring-accent/20'
              : 'h-3.5 w-3.5 border border-white/80 bg-accent hover:scale-125'
        }`}
      />
      <div className={`absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-lg bg-stone-50/95 text-xs shadow-sm backdrop-blur-sm transition-opacity duration-150 ${
        (localHovered || isHovered) && !isActive
          ? 'opacity-100'
          : 'pointer-events-none opacity-0'
      }`}>
        {place.heroImageUrl && (
          <div className="relative aspect-[3/2]">
            <Image
              src={place.heroImageUrl}
              alt={place.heroImageAlt || place.title}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        )}
        <div className="px-3 py-1.5">
          <p className="font-serif text-sm text-stone-900">{place.title}</p>
          <p className="text-stone-500">{place.region.title}</p>
        </div>
      </div>
    </div>
  )
}
