'use client'

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useMap } from 'react-map-gl/mapbox'

import type { MapPlace } from '@/lib/map-types'
import { ATTRIBUTE_OPTIONS } from '@/lib/constants'
import { MapFilterBar } from './MapFilterBar'

const attributeLabelMap = Object.fromEntries(
  ATTRIBUTE_OPTIONS.map((a) => [a.value, a.label]),
)

export function MapSidebar({
  places,
  tagFilter,
  onTagChange,
  selectedPlaceId,
  onPlaceHover,
  onPlaceSelect,
}: {
  places: MapPlace[]
  tagFilter: string
  onTagChange: (v: string) => void
  selectedPlaceId: string | null
  onPlaceHover: (id: string | null) => void
  onPlaceSelect: (place: MapPlace) => void
}) {
  const { default: mapRef } = useMap()
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll to selected place when pin is clicked
  useEffect(() => {
    if (!selectedPlaceId) return
    const el = itemRefs.current.get(selectedPlaceId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedPlaceId])

  // Scroll to top when filters change
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tagFilter])

  const handlePlaceClick = useCallback((place: MapPlace) => {
    onPlaceSelect(place)
    if (mapRef) {
      mapRef.flyTo({
        center: [place.coordinates[0], place.coordinates[1]],
        zoom: Math.max(mapRef.getZoom(), 10),
        duration: 800,
      })
    }
  }, [mapRef, onPlaceSelect])

  const handleMouseEnter = useCallback((place: MapPlace) => {
    onPlaceHover(place.id)
    if (selectedPlaceId) return
    hoverTimerRef.current = setTimeout(() => {
      if (mapRef) {
        const currentZoom = mapRef.getZoom()
        mapRef.flyTo({
          center: [place.coordinates[0], place.coordinates[1]],
          zoom: Math.max(currentZoom, 9),
          duration: 800,
        })
      }
    }, 150)
  }, [mapRef, onPlaceHover, selectedPlaceId])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    onPlaceHover(null)
  }, [onPlaceHover])

  return (
    <div className="flex h-full w-[360px] flex-col border-r border-stone-200 bg-stone-50">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-stone-900">Orte</h2>
          <span className="text-xs text-stone-500">
            {places.length} {places.length === 1 ? 'Ort' : 'Orte'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-stone-200 px-5 pb-4">
        <MapFilterBar
          tagFilter={tagFilter}
          onTagChange={onTagChange}
        />
      </div>

      {/* Listing list */}
      <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {places.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-stone-400">
            Keine Orte gefunden.
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              role="button"
              tabIndex={0}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(place.id, el)
                }
              }}
              onClick={() => handlePlaceClick(place)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePlaceClick(place)
                }
              }}
              onMouseEnter={() => handleMouseEnter(place)}
              onMouseLeave={handleMouseLeave}
              className={`flex cursor-pointer gap-4 border-b border-stone-100 px-5 py-4 transition-colors hover:bg-stone-100 ${
                selectedPlaceId === place.id
                  ? 'border-l-2 border-l-accent bg-stone-100'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              {/* Thumbnail */}
              {place.heroImageUrl ? (
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={place.heroImageUrl}
                    alt={place.heroImageAlt}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="h-16 w-24 flex-shrink-0 rounded-lg bg-stone-200" />
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-base text-stone-900">
                  {place.title}
                </h3>
                <p className="text-sm text-stone-500">{place.region.title}</p>
                {place.attributes.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {place.attributes.slice(0, 2).map((attr) => (
                      <span
                        key={attr}
                        className="rounded-full border border-stone-200 px-2 py-0.5 text-xs text-stone-500"
                      >
                        {attributeLabelMap[attr] ?? attr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
