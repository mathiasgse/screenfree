'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from './Container'

// Static map parameters (must match Mapbox Static URL)
const MAP_CENTER: [number, number] = [13.35, 47.5]
const MAP_ZOOM = 7
const MAP_WIDTH = 1400
const MAP_HEIGHT = 600

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
}

export function MapTeaser({ coordinates }: MapTeaserProps) {
  const [isHovered, setIsHovered] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) return null

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/13.35,47.5,7,0/1400x600@2x?access_token=${token}&attribution=false&logo=false`

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
                  ? 'scale-[1.03] blur-0 grayscale-0 saturate-100'
                  : 'blur-[2px] grayscale-[30%] saturate-[70%]'
              }`}
              sizes="(max-width: 768px) 100vw, 1280px"
            />

            {/* Pins projected from real coordinates — appear on hover */}
            {coordinates
              .map(([lon, lat]) => geoToPercent(lon, lat))
              .filter((p): p is { left: string; top: string } => p !== null)
              .map((pin, i) => (
                <span
                  key={i}
                  className={`absolute h-2.5 w-2.5 rounded-full bg-accent ring-[3px] ring-accent/20 transition-all duration-500 ${
                    isHovered ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                  style={{
                    left: pin.left,
                    top: pin.top,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              ))}
          </div>
        </Link>

        {/* Editorial text + CTA */}
        <div className="mt-10 text-center md:mt-14">
          <h2 className="font-serif text-3xl leading-tight text-stone-900 sm:text-4xl md:text-5xl">
            Stille Orte, verteilt im Alpenraum.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-500 sm:text-lg">
            Manchmal hilft es, sie zu sehen.
          </p>
          <div className="mt-8">
            <Link
              href="/karte"
              className="inline-flex h-12 items-center rounded-full border border-stone-200 px-8 text-sm font-medium tracking-wide text-stone-700 transition-colors duration-300 hover:bg-stone-100"
            >
              Karte entdecken
              <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
