'use client'

import { Children, cloneElement, isValidElement } from 'react'
import { useIntersectionReveal } from '@/hooks/useIntersectionReveal'

export function StaggerGrid({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  const { ref, isVisible } = useIntersectionReveal()

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement<{ _isVisible?: boolean; _delay?: number }>(child)) {
          return cloneElement(child, {
            _isVisible: isVisible,
            _delay: index * staggerDelay,
          })
        }
        return child
      })}
    </div>
  )
}

export function StaggerItem({
  children,
  className = '',
  _isVisible = false,
  _delay = 0,
}: {
  children: React.ReactNode
  className?: string
  _isVisible?: boolean
  _delay?: number
}) {
  return (
    <div
      className={`reveal-hidden ${_isVisible ? 'reveal-visible' : ''} ${className}`}
      style={_delay ? { transitionDelay: `${_delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
