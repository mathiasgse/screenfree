'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const OpenWebsiteButton: React.FC = () => {
  const websiteUrl = useFormFields(([fields]) => fields.websiteUrl?.value as string | undefined)

  if (!websiteUrl) return null

  return (
    <div style={{ marginBottom: '1rem' }}>
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: '1px solid var(--theme-border-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--theme-elevation-0)',
          color: 'var(--theme-elevation-800)',
          fontSize: '13px',
          fontWeight: 500,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        Website öffnen ↗
      </a>
    </div>
  )
}

export default OpenWebsiteButton
