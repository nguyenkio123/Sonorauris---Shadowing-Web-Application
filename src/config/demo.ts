import type { BattleOutcome } from '../types/battle'

export const DEMO_CONFIG = {
  botJoinDelayMs: 45000,
  botReadyDelayMs: 1500,
  countdownSeconds: 3,
  assessmentDelayMs: 1500,
} as const

const STORAGE_KEYS = {
  FORCED_OUTCOME: 'shadowing_forced_outcome',
  DEMO_MODE: 'shadowing_demo_mode_visible',
}

export function getForcedOutcome(): BattleOutcome | null {
  if (typeof window === 'undefined') return null

  // Check URL query override first: ?outcome=win|lose|draw
  const searchStr = typeof window !== 'undefined' && window.location ? window.location.search : ''
  const params = new URLSearchParams(searchStr)
  const queryOutcome = params.get('outcome')?.toUpperCase()
  if (queryOutcome === 'WIN' || queryOutcome === 'LOSE' || queryOutcome === 'DRAW') {
    return queryOutcome as BattleOutcome
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEYS.FORCED_OUTCOME)
  if (stored === 'WIN' || stored === 'LOSE' || stored === 'DRAW') {
    return stored as BattleOutcome
  }
  return null
}

export function setForcedOutcome(outcome: BattleOutcome | null): void {
  if (typeof window === 'undefined') return
  if (!outcome) {
    localStorage.removeItem(STORAGE_KEYS.FORCED_OUTCOME)
  } else {
    localStorage.setItem(STORAGE_KEYS.FORCED_OUTCOME, outcome)
  }
}

export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const searchStr = typeof window !== 'undefined' && window.location ? window.location.search : ''
  const params = new URLSearchParams(searchStr)
  if (params.get('demo') === '1' || params.get('demo') === 'true') {
    return true
  }

  return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true'
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false')
}

export { isDemoModeEnabled as isDemoMode, setDemoModeEnabled as setDemoMode }

