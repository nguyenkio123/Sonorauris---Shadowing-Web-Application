import type { Attempt } from '../types/attempt'
import type { BattleRoom } from '../types/battle'
import type { ReferenceType, RewardTransaction, RewardType } from '../types/transaction'
import type { UserProfile } from '../types/user'

const STORAGE_KEYS = {
  USER_BASE: 'shadowing_user_base',
  TRANSACTIONS: 'shadowing_reward_transactions',
  ATTEMPTS: 'shadowing_attempts',
  ROOMS: 'shadowing_rooms',
} as const

interface UserBase {
  id: string
  displayName: string
  avatarUrl: string
  streak: number
  lastPracticeDate: string | null
}

const DEFAULT_USER_BASE: UserBase = {
  id: 'user-demo-player',
  displayName: 'Demo Player',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  streak: 3,
  lastPracticeDate: '2026-09-28',
}

export const SEED_TRANSACTIONS: RewardTransaction[] = [
  {
    id: 'tx-seed-xp',
    userId: 'user-demo-player',
    type: 'XP',
    amount: 120,
    referenceType: 'SEED',
    referenceId: 'initial-balance',
    createdAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'tx-seed-coins',
    userId: 'user-demo-player',
    type: 'COINS',
    amount: 45,
    referenceType: 'SEED',
    referenceId: 'initial-balance',
    createdAt: '2026-09-28T08:00:00.000Z',
  },
]

function readJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : defaultValue
  } catch (err) {
    console.error(`[Storage] Failed to read ${key}:`, err)
    return defaultValue
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[Storage] Failed to write ${key}:`, err)
  }
}

export function getUserBase(): UserBase {
  return readJson<UserBase>(STORAGE_KEYS.USER_BASE, DEFAULT_USER_BASE)
}

export function saveUserBase(base: UserBase): void {
  writeJson(STORAGE_KEYS.USER_BASE, base)
}

export function getTransactions(): RewardTransaction[] {
  return readJson<RewardTransaction[]>(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS)
}

export function saveTransactions(txs: RewardTransaction[]): void {
  writeJson(STORAGE_KEYS.TRANSACTIONS, txs)
}

/**
 * Derives full UserProfile where XP and Coins are purely calculated from the ledger.
 */
export function getUserProfile(): UserProfile {
  const base = getUserBase()
  const txs = getTransactions().filter((t) => t.userId === base.id)

  const xp = txs
    .filter((t) => t.type === 'XP')
    .reduce((sum, t) => sum + t.amount, 0)

  const coins = txs
    .filter((t) => t.type === 'COINS')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    ...base,
    xp,
    coins,
  }
}

/**
 * Adds reward transactions atomically with strict idempotency by (referenceType, referenceId, type).
 * Returns true if new rewards were recorded, false if already claimed.
 */
export function addRewardTransactions(
  items: Array<{
    userId: string
    type: RewardType
    amount: number
    referenceType: ReferenceType
    referenceId: string
  }>
): boolean {
  const currentTxs = getTransactions()
  let hasNew = false
  const updated = [...currentTxs]

  for (const item of items) {
    const exists = currentTxs.some(
      (t) =>
        t.referenceType === item.referenceType &&
        t.referenceId === item.referenceId &&
        t.type === item.type
    )

    if (!exists) {
      hasNew = true
      updated.push({
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: item.userId,
        type: item.type,
        amount: item.amount,
        referenceType: item.referenceType,
        referenceId: item.referenceId,
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (hasNew) {
    saveTransactions(updated)

    // Calendar day streak logic:
    // +1 each calendar day on valid practice. Multiple practices on the same day do NOT increment streak.
    const today = new Date().toISOString().split('T')[0]
    const base = getUserBase()
    if (base.lastPracticeDate !== today) {
      saveUserBase({
        ...base,
        streak: base.streak + 1,
        lastPracticeDate: today,
      })
    }
  }

  return hasNew
}

export function getAttempts(): Attempt[] {
  return readJson<Attempt[]>(STORAGE_KEYS.ATTEMPTS, [])
}

export function getAttemptById(id: string): Attempt | null {
  const attempts = getAttempts()
  return attempts.find((a) => a.id === id) || null
}

export function saveAttempt(attempt: Attempt): void {
  const attempts = getAttempts()
  const idx = attempts.findIndex((a) => a.id === attempt.id)
  if (idx >= 0) {
    attempts[idx] = attempt
  } else {
    attempts.unshift(attempt)
  }
  writeJson(STORAGE_KEYS.ATTEMPTS, attempts)
}

export function getRooms(): Record<string, BattleRoom> {
  return readJson<Record<string, BattleRoom>>(STORAGE_KEYS.ROOMS, {})
}

export function getRoomByCode(code: string): BattleRoom | null {
  const rooms = getRooms()
  return rooms[code.toUpperCase()] || null
}

export function saveRoom(room: BattleRoom): void {
  const rooms = getRooms()
  rooms[room.code.toUpperCase()] = room
  writeJson(STORAGE_KEYS.ROOMS, rooms)
}

/**
 * Resets all stored data to pristine initial state:
 * - UserBase: Demo Player, streak 3, lastPracticeDate '2026-09-28'
 * - Transactions: Seeded with exactly 120 XP and 45 Coins via SEED reference
 * - Attempts: Cleared
 * - Rooms: Cleared
 */
export function resetAllStorage(): void {
  if (typeof window === 'undefined') return
  writeJson(STORAGE_KEYS.USER_BASE, DEFAULT_USER_BASE)
  writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS)
  writeJson(STORAGE_KEYS.ATTEMPTS, [])
  writeJson(STORAGE_KEYS.ROOMS, {})
  localStorage.removeItem('shadowing_forced_outcome')
}
