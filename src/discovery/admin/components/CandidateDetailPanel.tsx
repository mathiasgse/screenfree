'use client'

import React, { useState } from 'react'
import { ScoreBadge } from './ScoreBadge'
import { StatusBadge } from './StatusBadge'

interface CandidateDetailPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidate: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAction: (action: string, data?: any) => void
  onClose: () => void
}

export const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({
  candidate,
  onAction,
  onClose,
}) => {
  const [showRawData, setShowRawData] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  const reasons: string[] = Array.isArray(candidate.reasons) ? candidate.reasons : []
  const riskFlags: string[] = Array.isArray(candidate.riskFlags) ? candidate.riskFlags : []
  const images: string[] = Array.isArray(candidate.images) ? candidate.images : []

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '560px',
        maxWidth: '100vw',
        backgroundColor: 'var(--theme-elevation-0)',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--theme-border-color)',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
          {candidate.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--theme-elevation-500)',
            padding: '4px 8px',
            borderRadius: '4px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Links */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
          {candidate.websiteUrl && (
            <a
              href={candidate.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3b82f6',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Website &rarr;
            </a>
          )}
          {candidate.mapsUrl && (
            <a
              href={candidate.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3b82f6',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Maps &rarr;
            </a>
          )}
        </div>

        {/* Status & Region */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusBadge status={candidate.status || 'new'} />
          {candidate.regionGuess && (
            <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>{candidate.regionGuess}</span>
          )}
        </div>

        {/* Snippet */}
        {candidate.snippet && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Snippet
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-elevation-600)', lineHeight: '1.5' }}>
              {candidate.snippet}
            </p>
          </div>
        )}

        {/* Score & Confidence */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Score
            </h4>
            <ScoreBadge score={candidate.qualityScore ?? 0} />
          </div>
          {candidate.confidence != null && (
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confidence
              </h4>
              <span style={{ fontSize: '14px', color: 'var(--theme-elevation-600)' }}>
                {Math.round(candidate.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Score Reasons */}
        {reasons.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Score Reasons
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--theme-elevation-600)', lineHeight: '1.6' }}>
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Flags */}
        {riskFlags.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-error-500, #ef4444)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Flags
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--theme-error-500, #ef4444)', lineHeight: '1.6' }}>
              {riskFlags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating */}
        {(candidate.ratingValue != null || candidate.reviewCount != null) && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
            {candidate.ratingValue != null && (
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rating
                </h4>
                <span style={{ fontSize: '14px', color: 'var(--theme-elevation-600)' }}>
                  {candidate.ratingValue} / 5
                </span>
              </div>
            )}
            {candidate.reviewCount != null && (
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Reviews
                </h4>
                <span style={{ fontSize: '14px', color: 'var(--theme-elevation-600)' }}>
                  {candidate.reviewCount}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Discovered Images */}
        {images.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Discovered Images
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {images.slice(0, 6).map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Discovered ${i + 1}`}
                    style={{
                      width: '80px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid var(--theme-border-color)',
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Outreach Email */}
        {candidate.status === 'accepted' && candidate.generatedEmail && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Outreach Email
            </h4>
            <pre
              style={{
                margin: '0 0 8px',
                padding: '12px',
                backgroundColor: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px',
                lineHeight: '1.5',
                color: 'var(--theme-elevation-600)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'inherit',
              }}
            >
              {candidate.generatedEmail}
            </pre>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(candidate.generatedEmail)
                  setEmailCopied(true)
                  setTimeout(() => setEmailCopied(false), 2000)
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: emailCopied ? '#22c55e' : 'var(--theme-elevation-0)',
                  color: emailCopied ? '#fff' : 'var(--theme-elevation-600)',
                  border: '1px solid var(--theme-border-color)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {emailCopied ? 'Kopiert!' : 'Kopieren'}
              </button>
              {candidate.contactEmail ? (
                <a
                  href={`mailto:${candidate.contactEmail}?subject=${encodeURIComponent(`Stille Orte Magazin — Ihr Haus «${candidate.name}» in unserer Sammlung`)}&body=${encodeURIComponent(candidate.generatedEmail.replace(/^Betreff:.*\n\n/, ''))}`}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--theme-elevation-0)',
                    color: 'var(--theme-elevation-600)',
                    border: '1px solid var(--theme-border-color)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  In Mail öffnen
                </a>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--theme-elevation-400)', fontStyle: 'italic' }}>
                  Keine Kontakt-Email — bitte manuell recherchieren
                </span>
              )}
            </div>
          </div>
        )}

        {/* Raw Data Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setShowRawData(!showRawData)}
            style={{
              background: 'none',
              border: '1px solid var(--theme-border-color)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'var(--theme-elevation-500)',
            }}
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </button>
          {showRawData && (
            <pre
              style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: '4px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '300px',
                lineHeight: '1.4',
                color: 'var(--theme-elevation-600)',
              }}
            >
              {JSON.stringify(candidate.rawData || candidate, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--theme-border-color)',
          flexShrink: 0,
          backgroundColor: 'var(--theme-elevation-50)',
        }}
      >
        {showRejectInput ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Rejection reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--theme-border-color)',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--theme-input-bg)',
                color: 'var(--theme-elevation-800)',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  onAction('reject', { id: candidate.id, reason: rejectReason })
                  setShowRejectInput(false)
                  setRejectReason('')
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectInput(false)
                  setRejectReason('')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--theme-elevation-0)',
                  color: 'var(--theme-elevation-600)',
                  border: '1px solid var(--theme-border-color)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onAction('accept', { id: candidate.id })}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Accept
            </button>
            <button
              onClick={() => onAction('maybe', { id: candidate.id })}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#eab308',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Maybe
            </button>
            <button
              onClick={() => setShowRejectInput(true)}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
