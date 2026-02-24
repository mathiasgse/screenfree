'use client'

import { useIntersectionReveal } from '@/hooks/useIntersectionReveal'

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'none'
  className?: string
}) {
  const { ref, isVisible } = useIntersectionReveal()

  return (
    <div
      ref={ref}
      className={`reveal-hidden ${direction === 'none' ? 'reveal-none' : ''} ${isVisible ? 'reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
