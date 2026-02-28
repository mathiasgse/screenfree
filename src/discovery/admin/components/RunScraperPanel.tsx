'use client'

import React, { useState, useMemo } from 'react'

interface RunScraperPanelProps {
  onStart: (runId: string) => void
}

function parseUrls(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

export const RunScraperPanel: React.FC<RunScraperPanelProps> = ({ onStart }) => {
  const [urlText, setUrlText] = useState('')
  const [dryRun, setDryRun] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedUrls = useMemo(() => parseUrls(urlText), [urlText])

  const handleSubmit = async () => {
    if (parsedUrls.length === 0) {
      setError('Mindestens eine URL eingeben')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/scrape-huetten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: parsedUrls, dryRun }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }

      const data = await res.json()
      onStart(data.runId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const panelStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid var(--theme-border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--theme-elevation-50)',
    marginBottom: '16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--theme-elevation-500)',
    textTransform: 'uppercase',
    marginBottom: '4px',
    display: 'block',
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-elevation-800)', marginBottom: '12px' }}>
        Hütten Import
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          URLs ({parsedUrls.length} erkannt)
        </label>
        <textarea
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          placeholder={'Eine URL pro Zeile...\nhttps://www.huetten.com/huette/beispiel\nhttps://www.huettenland.com/huette/beispiel\n\n# Kommentare mit # werden ignoriert'}
          rows={8}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', color: 'var(--theme-elevation-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
          />
          Dry Run (kein Schreiben in DB)
        </label>
      </div>

      {error && (
        <div style={{ color: 'var(--theme-error-500, #dc2626)', fontSize: '13px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || parsedUrls.length === 0}
          style={{
            padding: '8px 20px',
            border: '1px solid var(--theme-elevation-800)',
            borderRadius: '4px',
            backgroundColor: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: loading || parsedUrls.length === 0 ? 'not-allowed' : 'pointer',
            opacity: loading || parsedUrls.length === 0 ? 0.6 : 1,
          }}
        >
          {loading ? 'Starting...' : 'Hütten Import starten'}
        </button>

        <span style={{ fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
          Max. 50 URLs pro Run. Nur huetten.com / huettenland.com.
        </span>
      </div>
    </div>
  )
}
