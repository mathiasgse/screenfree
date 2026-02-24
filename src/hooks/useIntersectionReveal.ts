'use client'

import { useEffect, useRef, useState } from 'react'

export function useIntersectionReveal(rootMargin = '-50px') {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, isVisible }
}
