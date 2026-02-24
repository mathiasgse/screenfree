'use client'

import { MAP_FILTER_TAGS } from '@/lib/constants'

export function MapFilterBar({
  tagFilter,
  onTagChange,
}: {
  tagFilter: string
  onTagChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {MAP_FILTER_TAGS.map((tag) => {
        const isActive = tagFilter === tag.value
        return (
          <button
            key={tag.value}
            onClick={() => onTagChange(isActive ? '' : tag.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              isActive
                ? 'border-accent bg-accent text-white'
                : 'border-stone-300 text-stone-600 hover:border-accent hover:text-accent'
            }`}
          >
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
