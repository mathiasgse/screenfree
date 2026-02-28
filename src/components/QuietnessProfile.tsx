'use client'

import { useState } from 'react'
import { QUIETNESS_LEVELS, QUIETNESS_TRAIT_OPTIONS } from '@/lib/constants'

const traitLabelMap = new Map<string, string>(
  QUIETNESS_TRAIT_OPTIONS.map((t) => [t.value, t.label]),
)

const priceMap: Record<string, number> = {
  budget: 1,
  mid: 2,
  premium: 3,
  luxury: 4,
}

export function QuietnessProfile({
  level,
  traits,
  priceRange,
  size = 'default',
}: {
  level: number
  traits: string[]
  priceRange?: string | null
  size?: 'default' | 'large'
}) {
  const [hovered, setHovered] = useState(false)

  const label = QUIETNESS_LEVELS.find((l) => l.value === level)?.label ?? ''
  const barSize = size === 'large' ? 'h-3 w-5' : 'h-2.5 w-4'
  const priceCount = priceRange ? (priceMap[priceRange] || 1) : 0

  return (
    <div className="relative">
      <div className="flex items-center gap-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Stille Orte Ruheprofil
        </p>
        {priceCount > 0 && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
            Preisklasse
          </p>
        )}
      </div>
      <div
        className="mt-1.5 flex items-start gap-6"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`${barSize} ${
                  i <= level ? 'bg-accent' : 'border border-stone-200 bg-transparent'
                }`}
              />
            ))}
          </div>
          <span
            className={`font-medium tracking-wide text-stone-600 ${
              size === 'large' ? 'text-sm' : 'text-xs'
            }`}
          >
            {label}
          </span>
        </div>

        {priceCount > 0 && (
          <span className={`text-stone-500 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
            {'€'.repeat(priceCount)}
            <span className="text-stone-300">{'€'.repeat(4 - priceCount)}</span>
          </span>
        )}
      </div>

      {traits.length > 0 && (
        <div
          className={`absolute left-0 top-full z-50 mt-1.5 w-56 border border-stone-200 bg-stone-50 px-3 py-2.5 shadow-sm transition-opacity duration-150 ${
            hovered ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="mb-2 flex items-center gap-2 border-b border-stone-200 pb-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-4 ${
                    i <= level ? 'bg-accent' : 'border border-stone-200 bg-transparent'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium tracking-wide text-stone-600">
              {label}
            </span>
          </div>
          <ul className="space-y-1">
            {traits.map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-stone-600">
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                {traitLabelMap.get(t) ?? t}
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-stone-200 pt-2 text-[10px] font-medium text-accent">
            ✓ Verifiziert
          </p>
        </div>
      )}
    </div>
  )
}
