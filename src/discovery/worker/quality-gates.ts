import { AUTO_REJECT_THRESHOLD, AUTO_PROMOTE_THRESHOLD } from '@/discovery/shared/constants'

interface QualityGateResult {
  action: 'auto-reject' | 'pass' | 'auto-promote'
  reason: string
}

/**
 * Apply quality gates to a candidate's score.
 *
 * - score <= 25: auto-reject (clearly not a match)
 * - score >= 85: auto-promote (mark as "maybe" for quick human review)
 * - otherwise: pass (requires manual review)
 */
export function applyQualityGates(score: number): QualityGateResult {
  if (score <= AUTO_REJECT_THRESHOLD) {
    return {
      action: 'auto-reject',
      reason: `Score ${score} is below auto-reject threshold (${AUTO_REJECT_THRESHOLD})`,
    }
  }

  if (score >= AUTO_PROMOTE_THRESHOLD) {
    return {
      action: 'auto-promote',
      reason: `Score ${score} meets auto-promote threshold (${AUTO_PROMOTE_THRESHOLD})`,
    }
  }

  return {
    action: 'pass',
    reason: `Score ${score} requires manual review`,
  }
}
