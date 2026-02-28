'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from './Container'

// Static map parameters (must match Mapbox Static URL)
const MAP_CENTER: [number, number] = [13.35, 47.5]
const MAP_ZOOM = 7
const MAP_WIDTH = 1280  // max allowed by Mapbox Static Images API
const MAP_HEIGHT = 548  // ≈ 21:9 ratio matching md:aspect-[21/9] container

function geoToPercent(lon: number, lat: number): { left: string; top: string } | null {
  const worldSize = 256 * Math.pow(2, MAP_ZOOM)

  // Mercator projection: Geo → World pixel
  const toPixelX = (lng: number) => ((lng + 180) / 360) * worldSize
  const toPixelY = (lt: number) => {
    const sinLat = Math.sin((lt * Math.PI) / 180)
    return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldSize
  }

  // Center → pixel
  const cx = toPixelX(MAP_CENTER[0])
  const cy = toPixelY(MAP_CENTER[1])

  // Point → pixel
  const px = toPixelX(lon)
  const py = toPixelY(lat)

  // Offset from image origin (top-left)
  const x = px - (cx - MAP_WIDTH / 2)
  const y = py - (cy - MAP_HEIGHT / 2)

  // Outside visible area → don't render
  if (x < 0 || x > MAP_WIDTH || y < 0 || y > MAP_HEIGHT) return null

  return {
    left: `${(x / MAP_WIDTH) * 100}%`,
    top: `${(y / MAP_HEIGHT) * 100}%`,
  }
}

interface MapTeaserProps {
  coordinates: [number, number][]
  heading?: string
  subheading?: string
  ctaLabel?: string
}

export function MapTeaser({
  coordinates,
  heading = 'Stille Orte, verteilt im Alpenraum.',
  subheading = 'Manchmal hilft es, sie zu sehen.',
  ctaLabel = 'Karte entdecken',
}: MapTeaserProps) {
  const [isHovered, setIsHovered] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) return null

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${MAP_CENTER[0]},${MAP_CENTER[1]},${MAP_ZOOM},0/${MAP_WIDTH}x${MAP_HEIGHT}@2x?access_token=${token}&attribution=false&logo=false`

  return (
    <section className="py-20 md:py-28">
      <Container>
        {/* Map preview */}
        <Link
          href="/karte"
          className="group block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-stone-200 md:aspect-[21/9]">
            <Image
              src={mapUrl}
              alt="Karte stiller Orte im Alpenraum"
              fill
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered
                  ? 'scale-[1.02] grayscale-0 saturate-100'
                  : 'grayscale-[20%] saturate-[80%]'
              }`}
              sizes="(max-width: 768px) 100vw, 1280px"
            />

            {/* Text overlay — visible by default, fades on desktop hover */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
                isHovered ? '[@media(hover:hover)]:opacity-0' : ''
              }`}
            >
              <span className="rounded-full bg-stone-50/80 backdrop-blur-sm px-6 py-3 font-serif text-lg md:text-2xl text-stone-600 tracking-wide">
                <span className="font-semibold text-stone-800">{coordinates.length}</span> ausgewählte stille Orte
              </span>
            </div>

            {/* Pins projected from real coordinates — appear on hover */}
            {coordinates
              .map(([lon, lat]) => geoToPercent(lon, lat))
              .filter((p): p is { left: string; top: string } => p !== null)
              .map((pin, i) => (
                <span
                  key={i}
                  className={`absolute h-2.5 w-2.5 rounded-full bg-accent ring-[3px] ring-accent/20 transition-all duration-500 ${
                    isHovered
                      ? 'scale-100 opacity-100'
                      : 'scale-75 opacity-60 [@media(hover:hover)]:scale-50 [@media(hover:hover)]:opacity-0'
                  }`}
                  style={{
                    left: pin.left,
                    top: pin.top,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              ))}

            {/* "Zur Karte" CTA — hidden by default on desktop, appears on hover */}
            <span
              className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-1.5 rounded-full bg-stone-800/90 backdrop-blur-sm px-4 py-2 text-xs md:text-sm font-medium text-stone-50 transition-opacity duration-500 pointer-events-none ${
                isHovered
                  ? '[@media(hover:hover)]:opacity-100'
                  : '[@media(hover:hover)]:opacity-0'
              }`}
            >
              Zur Karte
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>

        {/* Editorial text + CTA */}
        <div className="mt-10 text-center md:mt-14">
          <h2 className="font-serif text-3xl leading-tight text-stone-900 sm:text-4xl md:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-500 sm:text-lg">
            {subheading}
          </p>
          <div className="mt-8">
            <Link
              href="/karte"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-stone-200 px-8 text-sm font-medium tracking-wide text-stone-700 transition-colors duration-300 hover:bg-stone-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
              </svg>
              {ctaLabel}
              <span className="ml-auto" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
