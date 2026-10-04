import type { AdminClipInput, AdminDashboardStats, AdminUserSummary } from '../types/admin'
import type { Clip } from '../types/clip'
import type { UserRole } from '../types/auth'
import {
  getLocalAccounts,
  saveLocalAccounts,
} from './auth'
import {
  addRewardTransactions,
  addStoredClip,
  deleteStoredClip,
  getAttempts,
  getStoredClips,
  getTransactions,
  getUserBase,
  getUserInventory,
  getUserProfile,
  grantUserCosmetic,
  resetStoredClips,
  revokeUserCosmetic,
  saveUserBase,
  updateStoredClip,
} from './storage'

function delay(ms = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Returns top-level system metrics for Admin Dashboard
 */
export async function getAdminStats(): Promise<AdminDashboardStats> {
  await delay()
  const users = await getAdminUsers()
  const clips = getStoredClips()
  const attempts = getAttempts()
  const txs = getTransactions()

  const circulatingXp = txs
    .filter((t) => t.type === 'XP')
    .reduce((sum, t) => sum + t.amount, 0)

  const circulatingCoins = txs
    .filter((t) => t.type === 'COINS')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalUsers: users.length,
    totalAdmins: users.filter((u) => u.role === 'admin').length,
    totalClips: clips.length,
    totalAttempts: attempts.length,
    totalCirculatingXp: Math.max(0, circulatingXp),
    totalCirculatingCoins: Math.max(0, circulatingCoins),
  }
}

/**
 * Retrieves all registered users and local accounts
 */
export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  await delay()
  const localAccounts = getLocalAccounts()
  const demoBase = getUserBase()
  const attempts = getAttempts()

  const result: AdminUserSummary[] = []

  // 1. Add Demo Player
  const demoProfile = getUserProfile('user-demo-player')
  const demoInv = getUserInventory('user-demo-player')
  const demoAttempts = attempts.filter((a) => a.userId === 'user-demo-player').length

  result.push({
    id: demoBase.id || 'user-demo-player',
    email: 'guest@sonorauris.com',
    displayName: demoBase.displayName || 'Demo Player',
    avatarUrl: demoBase.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    role: (demoBase as { role?: UserRole }).role || 'user',
    xp: demoProfile.xp,
    coins: demoProfile.coins,
    streak: demoBase.streak,
    attemptsCount: demoAttempts,
    ownedItemCount: demoInv.ownedItemIds.length,
    createdAt: '2026-09-01T00:00:00.000Z',
    isGuest: true,
  })

  // 2. Add Local Accounts
  for (const acc of localAccounts) {
    // Avoid duplicate if demo user id equals account id
    if (acc.id === demoBase.id) continue

    const prof = getUserProfile(acc.id)
    const inv = getUserInventory(acc.id)
    const attCount = attempts.filter((a) => a.userId === acc.id).length

    result.push({
      id: acc.id,
      email: acc.email,
      displayName: acc.displayName,
      avatarUrl: acc.avatarUrl,
      role: acc.role || 'user',
      xp: prof.xp,
      coins: prof.coins,
      streak: 0,
      attemptsCount: attCount,
      ownedItemCount: inv.ownedItemIds.length,
      createdAt: acc.createdAt,
      isGuest: false,
    })
  }

  return result
}

/**
 * Creates a new user or administrator from Admin Panel
 */
export async function createAdminUser(data: {
  email: string
  displayName: string
  password?: string
  role: UserRole
  initialXp?: number
  initialCoins?: number
}): Promise<AdminUserSummary> {
  await delay()
  const trimmedEmail = data.email.trim().toLowerCase()
  const trimmedName = data.displayName.trim() || trimmedEmail.split('@')[0]

  if (!trimmedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }

  const accounts = getLocalAccounts()
  if (accounts.some((a) => a.email === trimmedEmail)) {
    throw new Error('A user with this email already exists.')
  }

  const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`
  const createdAt = new Date().toISOString()

  accounts.push({
    id: newId,
    email: trimmedEmail,
    displayName: trimmedName,
    passwordHash: btoa(data.password || 'password123'),
    avatarUrl,
    role: data.role,
    createdAt,
  })
  saveLocalAccounts(accounts)

  // Seed initial rewards into immutable ledger if specified
  const initialXp = data.initialXp || 0
  const initialCoins = data.initialCoins || 0
  if (initialXp > 0 || initialCoins > 0) {
    addRewardTransactions([
      ...(initialXp > 0
        ? [
            {
              userId: newId,
              type: 'XP' as const,
              amount: initialXp,
              referenceType: 'ADMIN_GRANT' as const,
              referenceId: `seed-${Date.now()}`,
            },
          ]
        : []),
      ...(initialCoins > 0
        ? [
            {
              userId: newId,
              type: 'COINS' as const,
              amount: initialCoins,
              referenceType: 'ADMIN_GRANT' as const,
              referenceId: `seed-${Date.now()}`,
            },
          ]
        : []),
    ])
  }

  return {
    id: newId,
    email: trimmedEmail,
    displayName: trimmedName,
    avatarUrl,
    role: data.role,
    xp: initialXp,
    coins: initialCoins,
    streak: 0,
    attemptsCount: 0,
    ownedItemCount: 3,
    createdAt,
    isGuest: false,
  }
}

/**
 * Updates a user's details and role
 */
export async function updateAdminUser(
  id: string,
  updates: { displayName?: string; email?: string; role?: UserRole; streak?: number }
): Promise<AdminUserSummary> {
  await delay()
  const demoBase = getUserBase()

  // Case 1: Updating Demo Player
  if (id === demoBase.id || id === 'user-demo-player') {
    const updatedBase = {
      ...demoBase,
      displayName: updates.displayName?.trim() || demoBase.displayName,
      role: updates.role || (demoBase as { role?: UserRole }).role || 'user',
      streak: updates.streak !== undefined ? updates.streak : demoBase.streak,
    }
    saveUserBase(updatedBase)
    const prof = getUserProfile('user-demo-player')
    const inv = getUserInventory('user-demo-player')
    return {
      id: demoBase.id,
      email: 'guest@sonorauris.com',
      displayName: updatedBase.displayName,
      avatarUrl: updatedBase.avatarUrl,
      role: updatedBase.role,
      xp: prof.xp,
      coins: prof.coins,
      streak: updatedBase.streak,
      attemptsCount: getAttempts().filter((a) => a.userId === demoBase.id).length,
      ownedItemCount: inv.ownedItemIds.length,
      createdAt: '2026-09-01T00:00:00.000Z',
      isGuest: true,
    }
  }

  // Case 2: Updating Local Account
  const accounts = getLocalAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx < 0) {
    throw new Error('User not found.')
  }

  const acc = accounts[idx]
  const updatedAcc = {
    ...acc,
    displayName: updates.displayName?.trim() || acc.displayName,
    email: updates.email?.trim().toLowerCase() || acc.email,
    role: updates.role || acc.role || 'user',
  }
  accounts[idx] = updatedAcc
  saveLocalAccounts(accounts)

  const prof = getUserProfile(id)
  const inv = getUserInventory(id)

  return {
    id,
    email: updatedAcc.email,
    displayName: updatedAcc.displayName,
    avatarUrl: updatedAcc.avatarUrl,
    role: updatedAcc.role,
    xp: prof.xp,
    coins: prof.coins,
    streak: updates.streak || 0,
    attemptsCount: getAttempts().filter((a) => a.userId === id).length,
    ownedItemCount: inv.ownedItemIds.length,
    createdAt: updatedAcc.createdAt,
    isGuest: false,
  }
}

/**
 * Deletes a user account
 */
export async function deleteAdminUser(id: string): Promise<boolean> {
  await delay()
  const demoBase = getUserBase()
  if (id === demoBase.id) {
    throw new Error('Cannot delete active guest session.')
  }

  const accounts = getLocalAccounts()
  const filtered = accounts.filter((a) => a.id !== id)
  if (filtered.length === accounts.length) return false

  saveLocalAccounts(filtered)
  return true
}

/**
 * Grants or deducts XP and Coins for a user via the Immutable Ledger
 */
export async function grantUserCurrency(
  userId: string,
  xpDelta: number,
  coinsDelta: number,
  _reason = 'Admin adjustment'
): Promise<{ success: boolean; newXp: number; newCoins: number }> {
  await delay()
  const items: Array<{
    userId: string
    type: 'XP' | 'COINS'
    amount: number
    referenceType: 'ADMIN_GRANT'
    referenceId: string
  }> = []

  const timestamp = Date.now()
  if (xpDelta !== 0) {
    items.push({
      userId,
      type: 'XP',
      amount: xpDelta,
      referenceType: 'ADMIN_GRANT',
      referenceId: `admin-grant-xp-${timestamp}-${Math.random().toString(36).slice(2, 6)}`,
    })
  }

  if (coinsDelta !== 0) {
    items.push({
      userId,
      type: 'COINS',
      amount: coinsDelta,
      referenceType: 'ADMIN_GRANT',
      referenceId: `admin-grant-coins-${timestamp}-${Math.random().toString(36).slice(2, 6)}`,
    })
  }

  if (items.length > 0) {
    addRewardTransactions(items)
  }

  const updatedProfile = getUserProfile(userId)
  return {
    success: true,
    newXp: updatedProfile.xp,
    newCoins: updatedProfile.coins,
  }
}

/**
 * Grants a cosmetic item to a user without coin expenditure
 */
export async function grantUserItem(userId: string, itemId: string): Promise<boolean> {
  await delay()
  return grantUserCosmetic(userId, itemId)
}

/**
 * Revokes a cosmetic item from a user's inventory
 */
export async function revokeUserItem(userId: string, itemId: string): Promise<boolean> {
  await delay()
  return revokeUserCosmetic(userId, itemId)
}

/**
 * Retrieves all clips for Admin Management
 */
export async function getAdminClips(): Promise<Clip[]> {
  await delay()
  return getStoredClips()
}

/**
 * Creates a new clip/video
 */
export async function createAdminClip(input: AdminClipInput): Promise<Clip> {
  await delay()
  const durationSec = Math.max(1, input.endTimeSec - input.startTimeSec)
  const videoId = input.youtubeVideoId.trim()
  const thumb =
    input.thumbnailUrl?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const source =
    input.sourceUrl?.trim() || `https://www.youtube.com/watch?v=${videoId}`

  return addStoredClip({
    youtubeVideoId: videoId,
    title: input.title.trim(),
    sourceUrl: source,
    channelName: input.channelName.trim(),
    thumbnailUrl: thumb,
    startTimeSec: input.startTimeSec,
    endTimeSec: input.endTimeSec,
    durationSec,
    referenceText: input.referenceText.trim(),
    topic: input.topic,
    difficulty: input.difficulty,
    locale: 'en-US',
  })
}

/**
 * Updates an existing clip
 */
export async function updateAdminClip(id: string, updates: Partial<Clip>): Promise<Clip | null> {
  await delay()
  const clips = getStoredClips()
  const existing = clips.find((c) => c.id === id)
  if (existing && (updates.startTimeSec !== undefined || updates.endTimeSec !== undefined)) {
    const start = updates.startTimeSec !== undefined ? updates.startTimeSec : existing.startTimeSec
    const end = updates.endTimeSec !== undefined ? updates.endTimeSec : existing.endTimeSec
    updates.durationSec = Math.max(1, end - start)
  }
  return updateStoredClip(id, updates)
}

/**
 * Deletes a clip
 */
export async function deleteAdminClip(id: string): Promise<boolean> {
  await delay()
  return deleteStoredClip(id)
}

/**
 * Resets clips to standard 20 curated clips
 */
export async function resetAdminClips(): Promise<Clip[]> {
  await delay()
  return resetStoredClips()
}
