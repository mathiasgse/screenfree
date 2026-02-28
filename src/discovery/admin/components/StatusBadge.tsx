'use client'

import React from 'react'

interface StatusBadgeProps {
  status: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#3b82f6', text: '#fff' },
  maybe: { bg: '#eab308', text: '#fff' },
  accepted: { bg: '#22c55e', text: '#fff' },
  rejected: { bg: '#9ca3af', text: '#fff' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = STATUS_COLORS[status] || { bg: 'var(--theme-elevation-200, #e5e7eb)', text: 'var(--theme-elevation-800, #374151)' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '1.4',
        backgroundColor: colors.bg,
        color: colors.text,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}
