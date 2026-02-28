'use client'
import { useState } from 'react'

/**
 * Detects whether the current page was loaded directly (URL/refresh)
 * or via SPA navigation (View Transition).
 *
 * On direct load, performance.timeOrigin is recent (< 5s ago).
 * On SPA nav, timeOrigin is from the initial page load (seconds/minutes old).
 */
export function useIsDirectLoad(): boolean {
  const [isDirectLoad] = useState(() => {
    if (typeof window === 'undefined') return true
    return (Date.now() - performance.timeOrigin) < 5000
  })
  return isDirectLoad
}
