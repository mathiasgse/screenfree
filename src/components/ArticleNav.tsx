'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/richtext'

export function ArticleNav({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    function onScroll() {
      let current = ''
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100) {
            current = h.id
          }
        }
      }
      setActiveId(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [headings])

  return (
    <nav className="sticky top-24 w-44">
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">
        Inhalt
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-0.5 text-[13px] leading-snug transition-colors duration-200 ${
                h.level === 3 ? 'pl-5' : 'pl-3'
              } ${
                activeId === h.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
