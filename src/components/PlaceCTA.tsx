'use client'

import { useState } from 'react'
import { InquiryDrawer } from './InquiryDrawer'
import type { Media } from '@/payload-types'

interface PlaceCTAProps {
  placeId: string
  placeTitle: string
  heroImage?: Media | string | null
  outboundUrl?: string | null
  ctaLabel?: string | null
}

export function PlaceCTA({ placeId, placeTitle, heroImage, outboundUrl, ctaLabel }: PlaceCTAProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          onClick={() => setDrawerOpen(true)}
          className="group inline-flex items-center gap-3 rounded-sm bg-accent-dark px-8 py-4 text-sm tracking-wide text-white transition-all duration-300 hover:bg-accent"
        >
          Anfrage senden
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </button>

        {outboundUrl && (
          <a
            href={outboundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm tracking-wide text-stone-500 underline underline-offset-4 transition-colors hover:text-accent"
          >
            {ctaLabel || 'Website besuchen'}
          </a>
        )}
      </div>

      <InquiryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placeId={placeId}
        placeTitle={placeTitle}
        heroImage={heroImage}
      />
    </>
  )
}
