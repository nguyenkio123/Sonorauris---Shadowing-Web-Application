import type { BattleOutcome } from '../types/battle'

export const DEMO_CONFIG = {
  botJoinDelayMs: 45000,
  botReadyDelayMs: 1500,
  countdownSeconds: 3,
  assessmentDelayMs: 1500,
} as const

export function getForcedOutcome(): BattleOutcome | null {
  if (typeof window === 'undefined') return null

  const searchStr = window.location ? window.location.search : ''
  const queryOutcome = new URLSearchParams(searchStr).get('outcome')?.toUpperCase()
  if (queryOutcome === 'WIN' || queryOutcome === 'LOSE' || queryOutcome === 'DRAW') {
    return queryOutcome as BattleOutcome
  }

  const stored = localStorage.getItem('shadowing_forced_outcome')
  if (stored === 'WIN' || stored === 'LOSE' || stored === 'DRAW') {
    return stored as BattleOutcome
  }
  return null
}
