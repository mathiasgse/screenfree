'use client'

import React, { useState } from 'react'
import { PRESET_OPTIONS, COUNTRY_OPTIONS } from '@/discovery/shared/presets-client'

interface RunDiscoveryPanelProps {
  onStart: (runId: string) => void
}

export const RunDiscoveryPanel: React.FC<RunDiscoveryPanelProps> = ({ onStart }) => {
  const [preset, setPreset] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [limit, setLimit] = useState(50)
  const [dryRun, setDryRun] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePresetChange = (value: string) => {
    setPreset(value)
    if (value) {
      const match = PRESET_OPTIONS.find((p) => p.key === value)
      if (match) setCountry(match.country)
    }
  }

  const handleCountryChange = (value: string) => {
    setCountry(value)
    if (value) {
      // Clear preset when manually selecting a country
      setPreset('')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = { limit, dryRun }
      if (preset) body.preset = preset
      else if (country) body.country = country

      const res = await fetch('/api/discovery-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid var(--theme-border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    minWidth: '160px',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-elevation-800)', marginBottom: '12px' }}>
        Start Discovery Run
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Preset</label>
          <select value={preset} onChange={(e) => handlePresetChange(e.target.value)} style={selectStyle}>
            <option value="">-- Alle / Kein Preset --</option>
            {PRESET_OPTIONS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.country})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Country</label>
          <select value={country} onChange={(e) => handleCountryChange(e.target.value)} style={selectStyle}>
            <option value="">-- Alle --</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Limit: {limit}
        </label>
        <input
          type="range"
          min={1}
          max={200}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ width: '240px', cursor: 'pointer' }}
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
          disabled={loading}
          style={{
            padding: '8px 20px',
            border: '1px solid var(--theme-elevation-800)',
            borderRadius: '4px',
            backgroundColor: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Starting...' : 'Start Discovery Run'}
        </button>

        <span style={{ fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
          Hinweis: Auf Vercel kann bei &gt; 100 Candidates ein Timeout auftreten. Für große Runs CLI nutzen.
        </span>
      </div>
    </div>
  )
}
