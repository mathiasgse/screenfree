'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { getImageUrl, getImageAlt } from '@/lib/media'

export function ParallaxHero({
  media,
  priority = false,
  overlay = true,
  transitionName,
  children,
}: {
  media: string | Media | null | undefined
  priority?: boolean
  overlay?: boolean
  transitionName?: string
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function handleScroll() {
      const rect = el!.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      setOffsetY(Math.max(0, Math.min(1, -rect.top / rect.height)) * 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const url = getImageUrl(media, 'hero')
  if (!url) return null

  return (
    <div
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
      style={transitionName ? { viewTransitionName: transitionName, contain: 'layout' } : undefined}
    >
      <div
        style={{ transform: `translateY(${offsetY}%)` }}
        className="absolute inset-0 -top-[10%] h-[120%]"
      >
        <Image
          src={url}
          alt={getImageAlt(media)}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
        />
      </div>

      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      )}

      {children && (
        <div className="absolute inset-0 flex items-end">
          <div className="w-full pb-16 md:pb-20">
            {children}
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-bounce">
        <div className="h-10 w-[1px] bg-white/60" />
      </div>
    </div>
  )
}
