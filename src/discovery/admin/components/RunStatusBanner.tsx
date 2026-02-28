'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface RunStatusBannerProps {
  runId: string
  onComplete: () => void
  onDismiss: () => void
}

interface RunData {
  status: 'running' | 'completed' | 'failed'
  preset?: string
  startedAt?: string
  completedAt?: string
  stats?: {
    candidatesFound?: number
    newCandidates?: number
    duplicatesSkipped?: number
    errors?: number
  }
  progress?: {
    phase?: 'searching' | 'processing' | 'finalizing' | null
    processed?: number | null
    total?: number | null
  }
  errorMessage?: string | null
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

function getPhaseLabel(phase?: string | null): string {
  switch (phase) {
    case 'searching':
      return 'Suche läuft...'
    case 'processing':
      return 'Kandidaten werden verarbeitet...'
    case 'finalizing':
      return 'Wird abgeschlossen...'
    default:
      return 'Discovery Run läuft...'
  }
}

export const RunStatusBanner: React.FC<RunStatusBannerProps> = ({ runId, onComplete, onDismiss }) => {
  const [runData, setRunData] = useState<RunData | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const hasNotifiedComplete = useRef(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/discovery-runs/${runId}`)
      if (!res.ok) return
      const data = await res.json()
      setRunData(data)
    } catch (err) {
      console.error('Failed to fetch run status:', err)
    }
  }, [runId])

  // Poll every 3s
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // Live timer (1s tick, independent of polling)
  useEffect(() => {
    if (!runData?.startedAt) return
    const startTime = new Date(runData.startedAt).getTime()

    const tick = () => {
      if (runData.completedAt) {
        setElapsed(new Date(runData.completedAt).getTime() - startTime)
      } else {
        setElapsed(Date.now() - startTime)
      }
    }

    tick()
    if (runData.status === 'running') {
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }
  }, [runData?.startedAt, runData?.completedAt, runData?.status])

  // Notify parent once when run completes
  useEffect(() => {
    if (
      runData &&
      (runData.status === 'completed' || runData.status === 'failed') &&
      !hasNotifiedComplete.current
    ) {
      hasNotifiedComplete.current = true
      onComplete()
    }
  }, [runData?.status, onComplete, runData])

  if (!runData) return null

  const isRunning = runData.status === 'running'
  const isCompleted = runData.status === 'completed'
  const isFailed = runData.status === 'failed'

  const processed = runData.progress?.processed ?? 0
  const total = runData.progress?.total ?? 0
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0

  const bannerStyle: React.CSSProperties = {
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
    border: '1px solid',
    overflow: 'hidden',
    ...(isRunning && {
      backgroundColor: 'var(--theme-success-50, #eff6ff)',
      borderColor: 'var(--theme-success-200, #bfdbfe)',
      color: 'var(--theme-success-500, #1e40af)',
    }),
    ...(isCompleted && {
      backgroundColor: 'var(--theme-warning-50, #f0fdf4)',
      borderColor: 'var(--theme-warning-200, #bbf7d0)',
      color: 'var(--theme-warning-500, #166534)',
    }),
    ...(isFailed && {
      backgroundColor: 'var(--theme-error-50, #fef2f2)',
      borderColor: 'var(--theme-error-200, #fecaca)',
      color: 'var(--theme-error-500, #991b1b)',
    }),
  }

  const dismissBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px solid currentColor',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: '12px',
    opacity: 0.8,
    flexShrink: 0,
  }

  return (
    <div style={bannerStyle}>
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isRunning && (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                    flexShrink: 0,
                  }}
                >
                  &#8635;
                </span>
                <span style={{ fontWeight: 500 }}>{getPhaseLabel(runData.progress?.phase)}</span>
                {runData.preset && (
                  <span style={{ opacity: 0.7 }}>| {runData.preset}</span>
                )}
                <span style={{ opacity: 0.7 }}>| {formatDuration(elapsed)}</span>
              </>
            )}
            {isCompleted && (
              <>
                <span>&#10003;</span>
                <span style={{ fontWeight: 500 }}>
                  Fertig in {formatDuration(elapsed)}
                </span>
                {runData.preset && (
                  <span style={{ opacity: 0.7 }}>| {runData.preset}</span>
                )}
              </>
            )}
            {isFailed && (
              <>
                <span>&#10007;</span>
                <span style={{ fontWeight: 500 }}>Discovery Run fehlgeschlagen</span>
              </>
            )}
          </div>

          {/* Progress bar (running only) */}
          {isRunning && total > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  height: '6px',
                  backgroundColor: 'currentColor',
                  opacity: 0.15,
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: 'currentColor',
                    opacity: 1,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.8 }}>
                {processed} / {total}
              </div>
            </div>
          )}

          {/* Live stats during running */}
          {isRunning && runData.stats && (runData.stats.newCandidates ?? 0) > 0 && (
            <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.8 }}>
              {runData.stats.candidatesFound ?? 0} gefunden
              {' \u00b7 '}{runData.stats.newCandidates ?? 0} neu
              {' \u00b7 '}{runData.stats.duplicatesSkipped ?? 0} Duplikate
              {(runData.stats.errors ?? 0) > 0 && (
                <>{' \u00b7 '}{runData.stats.errors} Fehler</>
              )}
            </div>
          )}

          {/* Completed stats */}
          {isCompleted && runData.stats && (
            <div style={{ marginTop: '6px', fontSize: '12px', opacity: 0.8 }}>
              {runData.stats.candidatesFound ?? 0} gefunden
              {' \u00b7 '}{runData.stats.newCandidates ?? 0} neu
              {' \u00b7 '}{runData.stats.duplicatesSkipped ?? 0} Duplikate
              {' \u00b7 '}{runData.stats.errors ?? 0} Fehler
            </div>
          )}

          {/* Error message */}
          {isFailed && runData.errorMessage && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {runData.errorMessage}
            </div>
          )}
        </div>

        {/* Dismiss button (visible when not running) */}
        {!isRunning && (
          <button style={dismissBtnStyle} onClick={onDismiss}>
            Schließen
          </button>
        )}
      </div>
    </div>
  )
}
