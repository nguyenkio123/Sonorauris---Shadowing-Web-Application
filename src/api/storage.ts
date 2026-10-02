import {
  DEFAULT_AVATAR_ID,
  DEFAULT_FRAME_ID,
  DEFAULT_TITLE_ID,
  SHOP_ITEMS,
} from '../data/shopItems'
import type { Attempt } from '../types/attempt'
import type { BattleRoom } from '../types/battle'
import type { CosmeticType, UserInventory } from '../types/shop'
import type { ReferenceType, RewardTransaction, RewardType } from '../types/transaction'
import type { UserProfile } from '../types/user'

const STORAGE_KEYS = {
  USER_BASE: 'shadowing_user_base',
  TRANSACTIONS: 'shadowing_reward_transactions',
  ATTEMPTS: 'shadowing_attempts',
  ROOMS: 'shadowing_rooms',
  INVENTORY: 'shadowing_user_inventory',
} as const

interface UserBase {
  id: string
  displayName: string
  avatarUrl: string
  streak: number
  lastPracticeDate: string | null
  lastStreakRestoreDate: string | null
}

const DEFAULT_USER_BASE: UserBase = {
  id: 'user-demo-player',
  displayName: 'Demo Player',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  streak: 3,
  lastPracticeDate: '2026-09-28',
  lastStreakRestoreDate: null,
}

const DEFAULT_INVENTORY: UserInventory = {
  ownedItemIds: [DEFAULT_AVATAR_ID, DEFAULT_FRAME_ID, DEFAULT_TITLE_ID],
  equippedAvatarId: DEFAULT_AVATAR_ID,
  equippedFrameId: DEFAULT_FRAME_ID,
  equippedTitleId: DEFAULT_TITLE_ID,
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

export function getUserInventory(): UserInventory {
  return readJson<UserInventory>(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY)
}

export function saveUserInventory(inv: UserInventory): void {
  writeJson(STORAGE_KEYS.INVENTORY, inv)
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
  const inventory = getUserInventory()
  const txs = getTransactions().filter((t) => t.userId === base.id)

  const xp = txs
    .filter((t) => t.type === 'XP')
    .reduce((sum, t) => sum + t.amount, 0)

  const coins = txs
    .filter((t) => t.type === 'COINS')
    .reduce((sum, t) => sum + t.amount, 0)

  const titleItem = SHOP_ITEMS.find((i) => i.id === inventory.equippedTitleId)

  return {
    ...base,
    xp,
    coins,
    equippedAvatarId: inventory.equippedAvatarId,
    equippedFrameId: inventory.equippedFrameId,
    equippedTitleId: inventory.equippedTitleId,
    equippedTitle: titleItem ? titleItem.name : 'Shadowing Learner',
    lastStreakRestoreDate: base.lastStreakRestoreDate,
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
    // Only increment when user completes an attempt or battle (positive gain), not on purchases
    const hasLearningActivity = items.some(
      (i) => i.amount > 0 && (i.referenceType === 'ATTEMPT' || i.referenceType === 'BATTLE')
    )
    if (hasLearningActivity) {
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
 * Purchases an item from the cosmetic shop using Coins.
 * Follows atomic transaction ledger pattern.
 */
export function buyShopItem(itemId: string): { success: boolean; message: string } {
  const item = SHOP_ITEMS.find((i) => i.id === itemId)
  if (!item) return { success: false, message: 'Item not found in shop' }

  const inventory = getUserInventory()
  if (inventory.ownedItemIds.includes(itemId)) {
    return { success: false, message: 'You already own this item' }
  }

  const profile = getUserProfile()
  if (profile.coins < item.price) {
    return { success: false, message: `Insufficient coins. Need ${item.price} coins.` }
  }

  // Deduct coins via immutable ledger
  const added = addRewardTransactions([
    {
      userId: profile.id,
      type: 'COINS',
      amount: -item.price,
      referenceType: 'SHOP',
      referenceId: `${itemId}-${Date.now()}`,
    },
  ])

  if (!added) {
    return { success: false, message: 'Transaction could not be recorded.' }
  }

  // Add to owned inventory
  const updatedInv: UserInventory = {
    ...inventory,
    ownedItemIds: [...inventory.ownedItemIds, itemId],
  }
  saveUserInventory(updatedInv)

  return { success: true, message: `Successfully purchased ${item.name}!` }
}

/**
 * Equips an owned cosmetic item.
 */
export function equipShopItem(type: CosmeticType, itemId: string): boolean {
  const inventory = getUserInventory()
  if (!inventory.ownedItemIds.includes(itemId)) return false

  const item = SHOP_ITEMS.find((i) => i.id === itemId)
  if (!item || item.type !== type) return false

  const updatedInv = { ...inventory }
  const base = getUserBase()

  if (type === 'AVATAR') {
    updatedInv.equippedAvatarId = itemId
    base.avatarUrl = item.assetValue
    saveUserBase(base)
  } else if (type === 'FRAME') {
    updatedInv.equippedFrameId = itemId
  } else if (type === 'TITLE') {
    updatedInv.equippedTitleId = itemId
  }

  saveUserInventory(updatedInv)
  return true
}

export const STREAK_RESTORE_COST = 30

/**
 * Checks if user is eligible to restore a broken streak (once per 7 days).
 */
export function canRestoreStreak(): { canRestore: boolean; reason?: string } {
  const profile = getUserProfile()
  if (profile.coins < STREAK_RESTORE_COST) {
    return { canRestore: false, reason: `Need ${STREAK_RESTORE_COST} Coins to restore streak.` }
  }

  if (profile.lastStreakRestoreDate) {
    const lastRestore = new Date(profile.lastStreakRestoreDate).getTime()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - lastRestore < sevenDaysMs) {
      const daysLeft = Math.ceil((sevenDaysMs - (Date.now() - lastRestore)) / (24 * 60 * 60 * 1000))
      return { canRestore: false, reason: `Restore on cooldown (${daysLeft}d left). Limit 1 restore per 7 days.` }
    }
  }

  return { canRestore: true }
}

/**
 * Restores streak using Coins (FR-PROG-04).
 */
export function restoreStreak(): { success: boolean; message: string } {
  const check = canRestoreStreak()
  if (!check.canRestore) {
    return { success: false, message: check.reason || 'Cannot restore streak.' }
  }

  const profile = getUserProfile()
  const nowStr = new Date().toISOString()

  // Deduct coins atomically via ledger
  addRewardTransactions([
    {
      userId: profile.id,
      type: 'COINS',
      amount: -STREAK_RESTORE_COST,
      referenceType: 'STREAK_RESTORE',
      referenceId: `streak-restore-${Date.now()}`,
    },
  ])

  // Increment streak by 1 and record restore date
  const base = getUserBase()
  saveUserBase({
    ...base,
    streak: base.streak + 1,
    lastStreakRestoreDate: nowStr,
  })

  return {
    success: true,
    message: `Streak restored to ${base.streak + 1} days! (-${STREAK_RESTORE_COST} Coins)`,
  }
}

/**
 * Updates user display name (FR-AUTH-02).
 */
export function updateDisplayName(name: string): boolean {
  if (!name.trim()) return false
  const base = getUserBase()
  saveUserBase({
    ...base,
    displayName: name.trim().slice(0, 24),
  })
  return true
}

/**
 * Resets all stored data to pristine initial state:
 * - UserBase: Demo Player, streak 3, lastPracticeDate '2026-09-28'
 * - Inventory: Default items
 * - Transactions: Seeded with exactly 120 XP and 45 Coins via SEED reference
 * - Attempts: Cleared
 * - Rooms: Cleared
 */
export function resetAllStorage(): void {
  if (typeof window === 'undefined') return
  writeJson(STORAGE_KEYS.USER_BASE, DEFAULT_USER_BASE)
  writeJson(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY)
  writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS)
  writeJson(STORAGE_KEYS.ATTEMPTS, [])
  writeJson(STORAGE_KEYS.ROOMS, {})
  localStorage.removeItem('shadowing_forced_outcome')
}
