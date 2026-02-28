'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export function SplitHeroImage({
  url,
  alt,
  priority = false,
  sizes = '(max-width: 1024px) calc(100vw - 3rem), 72rem',
}: {
  url: string
  alt: string
  priority?: boolean
  sizes?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ticking = false

    function handleScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect()
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          setOffsetY(Math.max(0, Math.min(1, -rect.top / rect.height)) * 8)
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={ref} className="relative aspect-[3/2] overflow-hidden rounded-lg bg-stone-200 md:rounded-xl">
      <div
        style={{ transform: `translateY(${offsetY}%)` }}
        className="absolute inset-0 -top-[4%] h-[115%]"
      >
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      </div>
    </div>
  )
}
