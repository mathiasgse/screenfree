import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Place } from '@/payload-types'
import type { MapPlace } from '@/lib/map-types'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { MapViewLoader } from '@/components/map/MapViewLoader'

export const metadata: Metadata = {
  title: 'Karte',
  description: 'Stille Orte im Alpenraum auf der Karte entdecken.',
  alternates: { canonical: '/karte' },
  openGraph: {
    title: 'Karte',
    description: 'Stille Orte im Alpenraum auf der Karte entdecken.',
    url: '/karte',
  },
}

export const revalidate = 60

function placeToMapPlace(place: Place): MapPlace | null {
  if (!place.coordinates || !Array.isArray(place.coordinates)) return null

  const region = typeof place.region === 'object' ? place.region : null
  if (!region) return null

  const gallery = (place.gallery ?? [])
    .map((media) => {
      const url = getImageUrl(media, 'card')
      if (!url) return null
      return { url, alt: getImageAlt(media) }
    })
    .filter((item): item is { url: string; alt: string } => item !== null)

  return {
    id: place.id,
    title: place.title,
    slug: place.slug,
    coordinates: place.coordinates as [number, number],
    region: { title: region.title, slug: region.slug },
    attributes: place.attributes ?? [],
    heroImageUrl: getImageUrl(place.heroImage, 'card'),
    heroImageAlt: getImageAlt(place.heroImage),
    gallery,
    priceRange: place.priceRange ?? null,
    outboundUrl: place.outboundUrl ?? null,
    whyDisconnect: place.whyDisconnect?.map((item) => item.reason) ?? [],
  }
}

export default async function KartePage() {
  let mapPlaces: MapPlace[] = []

  try {
    const payload = await getPayload({ config })

    const placesResult = await payload.find({
      collection: 'places',
      where: {
        _status: { equals: 'published' },
        coordinates: { exists: true },
      },
      limit: 500,
      depth: 2,
    })

    mapPlaces = (placesResult.docs as Place[])
      .map(placeToMapPlace)
      .filter((p): p is MapPlace => p !== null)
  } catch {
    // Payload unavailable — render empty map
  }

  return (
    <main>
      <MapViewLoader places={mapPlaces} />
    </main>
  )
}
