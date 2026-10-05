import { DEFAULT_DAILY_QUESTS } from '../data/quests'
import {
  DEFAULT_AVATAR_ID,
  DEFAULT_FRAME_ID,
  DEFAULT_TITLE_ID,
  SHOP_ITEMS,
} from '../data/shopItems'
import { SAMPLE_CLIPS } from '../data/clips'
import type { Attempt } from '../types/attempt'
import type { BattleRoom } from '../types/battle'
import type { Clip } from '../types/clip'
import type { DailyQuest } from '../types/quest'
import type { CosmeticType, UserInventory } from '../types/shop'
import type { ReferenceType, RewardTransaction, RewardType } from '../types/transaction'
import type { UserProfile } from '../types/user'
import type { UserRole } from '../types/auth'

const STORAGE_KEYS = {
  USER_BASE: 'shadowing_user_base',
  TRANSACTIONS: 'shadowing_reward_transactions',
  ATTEMPTS: 'shadowing_attempts',
  ROOMS: 'shadowing_rooms',
  INVENTORY: 'shadowing_user_inventory',
  CLIPS: 'shadowing_clips',
} as const

interface UserBase {
  id: string
  displayName: string
  avatarUrl: string
  streak: number
  role?: UserRole
  lastPracticeDate: string | null
  lastStreakRestoreDate: string | null
  brokenStreak?: number
}

function getYesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

const DEFAULT_USER_BASE: UserBase = {
  id: 'user-demo-player',
  displayName: 'Demo Player',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  streak: 3,
  role: 'user',
  lastPracticeDate: getYesterdayDateString(),
  lastStreakRestoreDate: null,
  brokenStreak: 0,
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

export function notifyUserUpdated(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      if (typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shadowing_user_updated'))
      }
      if (typeof Event !== 'undefined') {
        window.dispatchEvent(new Event('storage'))
      }
    } catch {
      // ignore in test / headless environments
    }
  }
}

export function checkAndApplyStreakDecay(base: UserBase): UserBase {
  if (base.streak <= 0) return base
  if (!base.lastPracticeDate) {
    const updated: UserBase = { ...base, brokenStreak: base.streak, streak: 0 }
    writeJson(STORAGE_KEYS.USER_BASE, updated)
    return updated
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = getYesterdayDateString()

  // If user practiced today or yesterday, streak is active
  if (base.lastPracticeDate === today || base.lastPracticeDate === yesterday) {
    return base
  }

  // Missed practicing yesterday and today -> streak is completely lost (reset to 0)
  const updated: UserBase = {
    ...base,
    brokenStreak: base.streak,
    streak: 0,
  }
  writeJson(STORAGE_KEYS.USER_BASE, updated)
  return updated
}

export function getUserBase(): UserBase {
  const base = readJson<UserBase>(STORAGE_KEYS.USER_BASE, DEFAULT_USER_BASE)
  return checkAndApplyStreakDecay(base)
}

export function saveUserBase(base: UserBase): void {
  writeJson(STORAGE_KEYS.USER_BASE, base)

  // Sync to local accounts list if applicable
  const accounts = readJson<Array<{ id: string; email: string; displayName: string; avatarUrl: string; role?: UserRole; streak?: number; lastPracticeDate?: string | null; lastStreakRestoreDate?: string | null; brokenStreak?: number }>>(
    'shadowing_local_accounts',
    []
  )
  const idx = accounts.findIndex((a) => a.id === base.id)
  if (idx >= 0) {
    accounts[idx] = {
      ...accounts[idx],
      displayName: base.displayName,
      avatarUrl: base.avatarUrl,
      role: (base as { role?: UserRole }).role || accounts[idx].role || 'user',
      streak: base.streak,
      lastPracticeDate: base.lastPracticeDate,
      lastStreakRestoreDate: base.lastStreakRestoreDate,
      brokenStreak: base.brokenStreak,
    }
    writeJson('shadowing_local_accounts', accounts)
  }
}

export function getUserInventory(userId?: string): UserInventory {
  const currentUserId = userId || getUserBase().id
  if (currentUserId === 'user-demo-player') {
    return readJson<UserInventory>(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY)
  }
  const key = `shadowing_inventory_${currentUserId}`
  return readJson<UserInventory>(key, DEFAULT_INVENTORY)
}

export function saveUserInventory(inv: UserInventory, userId?: string): void {
  const currentUserId = userId || getUserBase().id
  const key = `shadowing_inventory_${currentUserId}`
  writeJson(key, inv)
  if (currentUserId === 'user-demo-player') {
    writeJson(STORAGE_KEYS.INVENTORY, inv)
  }
}

export function grantUserCosmetic(userId: string, itemId: string): boolean {
  const inv = getUserInventory(userId)
  if (!inv.ownedItemIds.includes(itemId)) {
    inv.ownedItemIds.push(itemId)
    saveUserInventory(inv, userId)
    return true
  }
  return false
}

export function revokeUserCosmetic(userId: string, itemId: string): boolean {
  const inv = getUserInventory(userId)
  const idx = inv.ownedItemIds.indexOf(itemId)
  if (idx >= 0) {
    inv.ownedItemIds.splice(idx, 1)
    if (inv.equippedAvatarId === itemId) inv.equippedAvatarId = DEFAULT_AVATAR_ID
    if (inv.equippedFrameId === itemId) inv.equippedFrameId = DEFAULT_FRAME_ID
    if (inv.equippedTitleId === itemId) inv.equippedTitleId = DEFAULT_TITLE_ID
    saveUserInventory(inv, userId)
    return true
  }
  return false
}

export function getStoredClips(): Clip[] {
  return readJson<Clip[]>(STORAGE_KEYS.CLIPS, SAMPLE_CLIPS)
}

export function saveStoredClips(clips: Clip[]): void {
  writeJson(STORAGE_KEYS.CLIPS, clips)
}

export function addStoredClip(clipData: Omit<Clip, 'id'>): Clip {
  const clips = getStoredClips()
  const newClip: Clip = {
    ...clipData,
    id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  clips.unshift(newClip)
  saveStoredClips(clips)
  return newClip
}

export function updateStoredClip(id: string, updates: Partial<Clip>): Clip | null {
  const clips = getStoredClips()
  const idx = clips.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const updated = { ...clips[idx], ...updates, id }
  clips[idx] = updated
  saveStoredClips(clips)
  return updated
}

export function deleteStoredClip(id: string): boolean {
  const clips = getStoredClips()
  const filtered = clips.filter((c) => c.id !== id)
  if (filtered.length === clips.length) return false
  saveStoredClips(filtered)
  return true
}

export function resetStoredClips(): Clip[] {
  saveStoredClips(SAMPLE_CLIPS)
  return [...SAMPLE_CLIPS]
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
export function getUserProfile(targetUserId?: string): UserProfile {
  const base = getUserBase()
  const currentUserId = targetUserId || base.id
  const inventory = getUserInventory(currentUserId)
  const txs = getTransactions().filter((t) => t.userId === currentUserId)

  const xp = txs
    .filter((t) => t.type === 'XP')
    .reduce((sum, t) => sum + t.amount, 0)

  const coins = txs
    .filter((t) => t.type === 'COINS')
    .reduce((sum, t) => sum + t.amount, 0)

  const titleItem = SHOP_ITEMS.find((i) => i.id === inventory.equippedTitleId)

  if (targetUserId && targetUserId !== base.id) {
    const accounts = readJson<Array<{ id: string; email: string; displayName: string; avatarUrl: string; role?: UserRole; streak?: number; lastPracticeDate?: string | null; lastStreakRestoreDate?: string | null }>>(
      'shadowing_local_accounts',
      []
    )
    const acc = accounts.find((a) => a.id === targetUserId)
    if (acc) {
      return {
        id: acc.id,
        displayName: acc.displayName,
        avatarUrl: acc.avatarUrl,
        xp,
        coins,
        streak: acc.streak ?? 0,
        role: acc.role || 'user',
        equippedAvatarId: inventory.equippedAvatarId,
        equippedFrameId: inventory.equippedFrameId,
        equippedTitleId: inventory.equippedTitleId,
        equippedTitle: titleItem ? titleItem.name : 'Shadowing Learner',
        lastPracticeDate: acc.lastPracticeDate || null,
        lastStreakRestoreDate: acc.lastStreakRestoreDate || null,
      }
    }
  }

  return {
    ...base,
    role: (base as { role?: UserRole }).role || 'user',
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

    notifyUserUpdated()
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
  notifyUserUpdated()

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
  notifyUserUpdated()
  return true
}

export const STREAK_RESTORE_COST = 30

/**
 * Checks if user is eligible to restore a broken streak (once per 7 days).
 * Prevents spending coins if streak is already active and intact.
 */
export function canRestoreStreak(): { canRestore: boolean; reason?: string } {
  const profile = getUserProfile()
  const base = getUserBase()

  // 1. Check if user's streak is already active and intact
  const today = new Date().toISOString().split('T')[0]
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yesterday = d.toISOString().split('T')[0]

  const isStreakIntact =
    base.streak > 0 &&
    (base.lastPracticeDate === today || base.lastPracticeDate === yesterday)

  if (isStreakIntact) {
    return {
      canRestore: false,
      reason: 'Streak Active — No restore needed',
    }
  }

  // 2. Check if user has sufficient coins
  if (profile.coins < STREAK_RESTORE_COST) {
    return { canRestore: false, reason: `Need ${STREAK_RESTORE_COST} Coins to restore streak.` }
  }

  // 3. Check 7-day cooldown
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
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yesterday = d.toISOString().split('T')[0]

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

  // Recover streak and set lastPracticeDate to yesterday so it can continue today
  const base = getUserBase()
  const newStreak = Math.max(1, base.brokenStreak || (base.streak + 1))
  saveUserBase({
    ...base,
    streak: newStreak,
    brokenStreak: 0,
    lastPracticeDate: yesterday,
    lastStreakRestoreDate: nowStr,
  })

  notifyUserUpdated()

  return {
    success: true,
    message: `Streak recovered to ${newStreak} days! (-${STREAK_RESTORE_COST} Coins)`,
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
  writeJson(STORAGE_KEYS.CLIPS, SAMPLE_CLIPS)
  localStorage.removeItem('shadowing_forced_outcome')
}

/**
 * SRS FR-QUEST-01: Derives today's 3 daily quests and their real-time progress.
 */
export function getDailyQuestsState(): DailyQuest[] {
  const today = new Date().toISOString().split('T')[0]
  const attempts = getAttempts()
  const rooms = Object.values(getRooms())

  // Activity performed today
  const todayAttempts = attempts.filter((a) => a.createdAt.startsWith(today))
  const soloCount = todayAttempts.length
  const highScoreCount = todayAttempts.filter((a) => a.result.battleScore >= 80).length
  const battleCount = rooms.filter((r) => r.player.hasSubmitted && r.status === 'RESULT').length

  const claimedKey = `shadowing_claimed_quests_${today}`
  const claimedIds = readJson<string[]>(claimedKey, [])

  return DEFAULT_DAILY_QUESTS.map((q) => {
    let currentValue = 0
    if (q.type === 'SOLO_PRACTICE') currentValue = soloCount
    else if (q.type === 'HIGH_SCORE') currentValue = highScoreCount
    else if (q.type === 'BATTLE_MATCH') currentValue = battleCount

    const completed = currentValue >= q.targetValue
    const claimed = claimedIds.includes(q.id)

    return {
      ...q,
      currentValue: Math.min(q.targetValue, currentValue),
      completed,
      claimed,
    }
  })
}

/**
 * Claims rewards for a completed daily quest via atomic ledger transaction.
 */
export function claimDailyQuest(questId: string): { success: boolean; message: string } {
  const today = new Date().toISOString().split('T')[0]
  const quests = getDailyQuestsState()
  const quest = quests.find((q) => q.id === questId)

  if (!quest) return { success: false, message: 'Quest not found.' }
  if (!quest.completed) return { success: false, message: 'Quest objectives not yet completed.' }
  if (quest.claimed) return { success: false, message: 'Quest rewards already claimed today.' }

  const profile = getUserProfile()

  // Idempotently add reward to immutable ledger
  addRewardTransactions([
    {
      userId: profile.id,
      type: 'XP',
      amount: quest.rewardXp,
      referenceType: 'QUEST',
      referenceId: `${questId}-${today}`,
    },
    {
      userId: profile.id,
      type: 'COINS',
      amount: quest.rewardCoins,
      referenceType: 'QUEST',
      referenceId: `${questId}-${today}`,
    },
  ])

  // Mark as claimed for today
  const claimedKey = `shadowing_claimed_quests_${today}`
  const claimedIds = readJson<string[]>(claimedKey, [])
  writeJson(claimedKey, [...claimedIds, questId])

  return {
    success: true,
    message: `Claimed +${quest.rewardXp} XP and +${quest.rewardCoins} Coins!`,
  }
}
