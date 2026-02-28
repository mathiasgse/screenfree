'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Gutter } from '@payloadcms/ui'
import { ScoreBadge } from './ScoreBadge'
import { StatusBadge } from './StatusBadge'
import { CandidateDetailPanel } from './CandidateDetailPanel'
import { RunDiscoveryPanel } from './RunDiscoveryPanel'
import { RunScraperPanel } from './RunScraperPanel'
import { RunStatusBanner } from './RunStatusBanner'

interface DiscoveryInboxClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCandidates: any[]
  totalCount: number
}

type SortOption = 'score_desc' | 'score_asc' | 'newest' | 'name'

export const DiscoveryInboxClient: React.FC<DiscoveryInboxClientProps> = ({
  initialCandidates,
  totalCount: initialTotal,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [candidates, setCandidates] = useState<any[]>(initialCandidates)
  const [totalCount, setTotalCount] = useState(initialTotal)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Discovery Run
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [showRunPanel, setShowRunPanel] = useState(false)
  const [showScraperPanel, setShowScraperPanel] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('new,maybe')
  const [minScore, setMinScore] = useState<string>('')
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [sort, setSort] = useState<SortOption>('score_desc')

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 50

  const fetchCandidates = useCallback(
    async (resetPage = true) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()

        // Build where clause
        if (statusFilter && statusFilter !== 'all') {
          const statuses = statusFilter.split(',')
          if (statuses.length === 1) {
            params.set('where[status][equals]', statuses[0])
          } else {
            statuses.forEach((s) => {
              params.append('where[status][in][]', s)
            })
          }
        }

        if (minScore) {
          params.set('where[qualityScore][greater_than_equal]', minScore)
        }

        if (regionFilter) {
          params.set('where[regionGuess][contains]', regionFilter)
        }

        // Sort
        let sortParam = '-qualityScore'
        if (sort === 'score_asc') sortParam = 'qualityScore'
        else if (sort === 'newest') sortParam = '-createdAt'
        else if (sort === 'name') sortParam = 'name'
        params.set('sort', sortParam)

        const currentPage = resetPage ? 1 : page
        params.set('limit', String(limit))
        params.set('page', String(currentPage))

        const res = await fetch(`/api/candidate-places?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        if (resetPage) {
          setCandidates(data.docs || [])
          setPage(1)
        } else {
          setCandidates((prev) => [...prev, ...(data.docs || [])])
        }
        setTotalCount(data.totalDocs || 0)
      } catch (err) {
        console.error('Failed to fetch candidates:', err)
      } finally {
        setLoading(false)
      }
    },
    [statusFilter, minScore, regionFilter, sort, page],
  )

  // Refetch when filters change
  useEffect(() => {
    fetchCandidates(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, minScore, regionFilter, sort])

  const handleLoadMore = () => {
    setPage((p) => p + 1)
    fetchCandidates(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAction = async (action: string, data?: any) => {
    try {
      const res = await fetch('/api/candidate-places-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Action failed:', err)
        return
      }

      // Close panel and refresh
      setSelectedCandidate(null)
      await fetchCandidates(true)
    } catch (err) {
      console.error('Action error:', err)
    }
  }

  const handleQuickAction = async (e: React.MouseEvent, action: string, id: string) => {
    e.stopPropagation()
    await handleAction(action, { id })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTopReasons = (candidate: any): string => {
    const reasons: string[] = Array.isArray(candidate.reasons) ? candidate.reasons : []
    return reasons.slice(0, 2).join('; ') || '-'
  }

  return (
    <Gutter>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, color: 'var(--theme-elevation-800)' }}>
            Discovery Inbox
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-elevation-500)' }}>
            {totalCount} candidate{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setShowRunPanel((v) => !v)
              setShowScraperPanel(false)
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--theme-elevation-800)',
              borderRadius: '4px',
              backgroundColor: showRunPanel ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-0)',
              color: showRunPanel ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-800)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {showRunPanel ? 'Close' : 'New Discovery Run'}
          </button>
          <button
            onClick={() => {
              setShowScraperPanel((v) => !v)
              setShowRunPanel(false)
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--theme-elevation-800)',
              borderRadius: '4px',
              backgroundColor: showScraperPanel ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-0)',
              color: showScraperPanel ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-800)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {showScraperPanel ? 'Close' : 'Hütten Import'}
          </button>
        </div>
      </div>

      {/* Run Panel */}
      {showRunPanel && (
        <RunDiscoveryPanel
          onStart={(runId) => {
            setActiveRunId(runId)
            setShowRunPanel(false)
          }}
        />
      )}

      {/* Scraper Panel */}
      {showScraperPanel && (
        <RunScraperPanel
          onStart={(runId) => {
            setActiveRunId(runId)
            setShowScraperPanel(false)
          }}
        />
      )}

      {/* Run Status Banner */}
      {activeRunId && (
        <RunStatusBanner
          runId={activeRunId}
          onComplete={() => {
            fetchCandidates(true)
          }}
          onDismiss={() => {
            setActiveRunId(null)
          }}
        />
      )}

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-elevation-800)',
              minWidth: '120px',
            }}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="maybe">Maybe</option>
            <option value="new,maybe">New + Maybe</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>
            Min Score
          </label>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="0"
            min={0}
            max={100}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-elevation-800)',
              width: '80px',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>
            Region
          </label>
          <input
            type="text"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            placeholder="Filter by region..."
            style={{
              padding: '6px 10px',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-elevation-800)',
              width: '160px',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>
            Sort
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-elevation-800)',
              minWidth: '140px',
            }}
          >
            <option value="score_desc">Score (high first)</option>
            <option value="score_asc">Score (low first)</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          border: '1px solid var(--theme-border-color)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-0)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-elevation-50)' }}>
              {['Name', 'Region', 'Score', 'Top Reasons', 'Source', 'Status', 'Actions'].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-800)',
                      borderBottom: '1px solid var(--theme-border-color)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--theme-border-color)',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--theme-elevation-50)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--theme-elevation-800)' }}>
                  {c.name}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--theme-elevation-500)' }}>
                  {c.regionGuess || '-'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <ScoreBadge score={c.qualityScore ?? 0} />
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: 'var(--theme-elevation-500)',
                    maxWidth: '250px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getTopReasons(c)}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--theme-elevation-500)' }}>{c.source || '-'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <StatusBadge status={c.status || 'new'} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {c.websiteUrl && (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Website öffnen"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--theme-border-color)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--theme-elevation-0)',
                          color: 'var(--theme-elevation-500)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: 1,
                          textDecoration: 'none',
                        }}
                      >
                        &#8599;
                      </a>
                    )}
                    {c.status !== 'accepted' && (
                      <button
                        onClick={(e) => handleQuickAction(e, 'accept', c.id)}
                        title="Accept"
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--theme-success-200, #d1fae5)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--theme-success-50, #f0fdf4)',
                          color: 'var(--theme-success-500, #16a34a)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: 1,
                        }}
                      >
                        &#10003;
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button
                        onClick={(e) => handleQuickAction(e, 'reject', c.id)}
                        title="Reject"
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--theme-error-200, #fee2e2)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--theme-error-50, #fef2f2)',
                          color: 'var(--theme-error-500, #dc2626)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: 1,
                        }}
                      >
                        &#10007;
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '40px 12px',
                    textAlign: 'center',
                    color: 'var(--theme-elevation-400)',
                    fontSize: '14px',
                  }}
                >
                  {loading ? 'Loading...' : 'No candidates found matching your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {candidates.length < totalCount && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: '8px 24px',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-elevation-0)',
              color: 'var(--theme-elevation-800)',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : `Load more (${candidates.length} of ${totalCount})`}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && candidates.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '8px',
            right: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          Loading...
        </div>
      )}

      {/* Detail Panel */}
      {selectedCandidate && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedCandidate(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--theme-overlay, rgba(0, 0, 0, 0.3))',
              zIndex: 9999,
            }}
          />
          <CandidateDetailPanel
            candidate={selectedCandidate}
            onAction={handleAction}
            onClose={() => setSelectedCandidate(null)}
          />
        </>
      )}
    </Gutter>
  )
}
