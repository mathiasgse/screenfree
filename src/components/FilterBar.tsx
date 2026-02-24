'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Region } from '@/payload-types'
import { ATTRIBUTE_OPTIONS, PRICE_OPTIONS } from '@/lib/constants'

export function FilterBar({ regions }: { regions: Region[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentRegion = searchParams.get('region') ?? ''
  const currentPreis = searchParams.get('preis') ?? ''
  const currentTag = searchParams.get('tag') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      router.replace(qs ? `/orte?${qs}` : '/orte', { scroll: false })
    },
    [router, searchParams],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Region Dropdown */}
        <select
          value={currentRegion}
          onChange={(e) => updateFilter('region', e.target.value)}
          className="rounded-md border border-stone-300 bg-transparent px-3 py-1.5 text-sm text-stone-700 focus:border-accent focus:outline-none"
        >
          <option value="">Alle Regionen</option>
          {regions.map((region) => (
            <option key={region.id} value={region.slug}>
              {region.title}
            </option>
          ))}
        </select>

        {/* Price Dropdown */}
        <select
          value={currentPreis}
          onChange={(e) => updateFilter('preis', e.target.value)}
          className="rounded-md border border-stone-300 bg-transparent px-3 py-1.5 text-sm text-stone-700 focus:border-accent focus:outline-none"
        >
          <option value="">Alle Preisklassen</option>
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Attribute Chips */}
      <div className="flex flex-wrap gap-2">
        {ATTRIBUTE_OPTIONS.map((attr) => {
          const isActive = currentTag === attr.value
          return (
            <button
              key={attr.value}
              onClick={() => updateFilter('tag', isActive ? '' : attr.value)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                isActive
                  ? 'border-accent bg-accent text-white'
                  : 'border-stone-300 text-stone-600 hover:border-accent hover:text-accent'
              }`}
            >
              {attr.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
