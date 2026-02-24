'use client'

import dynamic from 'next/dynamic'
import type { MapPlace } from '@/lib/map-types'

const MapView = dynamic(
  () => import('./MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 top-[60px] flex items-center justify-center bg-stone-100">
        <p className="text-sm text-stone-400">Karte wird geladen…</p>
      </div>
    ),
  },
)

export function MapViewLoader({
  places,
}: {
  places: MapPlace[]
}) {
  return <MapView places={places} />
}
