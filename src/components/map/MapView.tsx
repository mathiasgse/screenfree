'use client'

import { useState, useMemo, useCallback } from 'react'
import Map, { Marker, NavigationControl, MapProvider } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import type { MapPlace } from '@/lib/map-types'
import { MapPin } from './MapPin'
import { MapFilterBar } from './MapFilterBar'
import { PlaceDetailOverlay } from './PlaceDetailOverlay'
import { MapSidebar } from './MapSidebar'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

const INITIAL_VIEW = {
  longitude: 13.35,
  latitude: 47.5,
  zoom: 7,
} as const

// Alpenraum-Bounds: Österreich + etwas Rand für DACH/Norditalien
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [8.5, 45.5], // Südwest (Vorarlberg/Norditalien)
  [18.0, 49.5], // Nordost (Burgenland/Tschechien)
]

export function MapView({
  places,
}: {
  places: MapPlace[]
}) {
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null)
  const [tagFilter, setTagFilter] = useState('')
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null)

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (tagFilter && !place.attributes.includes(tagFilter)) return false
      return true
    })
  }, [places, tagFilter])

  const handlePinClick = useCallback((place: MapPlace) => {
    setSelectedPlace((prev) => (prev?.id === place.id ? null : place))
  }, [])

  const handleClose = useCallback(() => {
    setSelectedPlace(null)
  }, [])

  const handleSidebarSelect = useCallback((place: MapPlace) => {
    setSelectedPlace(place)
  }, [])

  const handlePlaceHover = useCallback((id: string | null) => {
    setHoveredPlaceId(id)
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-100 pt-16">
        <p className="text-stone-500">Mapbox Token fehlt. Bitte NEXT_PUBLIC_MAPBOX_TOKEN setzen.</p>
      </div>
    )
  }

  return (
    <MapProvider>
      <div className="fixed inset-0 top-[60px] flex">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <MapSidebar
            places={filteredPlaces}
            tagFilter={tagFilter}
            onTagChange={setTagFilter}
            selectedPlaceId={selectedPlace?.id ?? null}
            onPlaceHover={handlePlaceHover}
            onPlaceSelect={handleSidebarSelect}
          />
        </div>

        {/* Map */}
        <div className="relative flex-1">
          <Map
            id="default"
            initialViewState={INITIAL_VIEW}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
            minZoom={6}
            maxBounds={MAX_BOUNDS}
          >
            <NavigationControl position="top-right" showCompass={false} />

            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                longitude={place.coordinates[0]}
                latitude={place.coordinates[1]}
                anchor="center"
              >
                <MapPin
                  place={place}
                  isActive={selectedPlace?.id === place.id}
                  isHovered={hoveredPlaceId === place.id}
                  onClick={() => handlePinClick(place)}
                />
              </Marker>
            ))}
          </Map>

          {/* Filter bar — mobile only */}
          <div className="absolute left-4 top-4 z-10 max-w-[calc(100vw-2rem)] md:hidden">
            <MapFilterBar
              tagFilter={tagFilter}
              onTagChange={setTagFilter}
            />
          </div>

          {/* Counter badge — mobile only */}
          <div className="absolute bottom-6 right-6 z-10 rounded-full bg-stone-50/90 px-3 py-1.5 text-xs text-stone-600 shadow-sm backdrop-blur-sm md:hidden">
            {filteredPlaces.length} {filteredPlaces.length === 1 ? 'Ort' : 'Orte'}
          </div>

          {/* Place detail overlay */}
          {selectedPlace && (
            <PlaceDetailOverlay place={selectedPlace} onClose={handleClose} />
          )}
        </div>
      </div>
    </MapProvider>
  )
}
