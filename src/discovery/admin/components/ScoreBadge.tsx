'use client'

import React from 'react'

interface ScoreBadgeProps {
  score: number
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let backgroundColor: string
  let color: string

  if (score >= 75) {
    backgroundColor = '#22c55e'
    color = '#fff'
  } else if (score >= 50) {
    backgroundColor = '#eab308'
    color = '#fff'
  } else {
    backgroundColor = '#ef4444'
    color = '#fff'
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '1.4',
        backgroundColor,
        color,
        minWidth: '32px',
      }}
    >
      {score}
    </span>
  )
}
