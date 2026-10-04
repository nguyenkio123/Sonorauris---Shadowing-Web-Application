import { DEMO_CONFIG } from '../config/demo'
import { REWARDS } from '../config/scoring'
import type { Attempt } from '../types/attempt'
import type { BattleRoom } from '../types/battle'
import type { Clip } from '../types/clip'
import type { UserProfile } from '../types/user'
import { generateAssessmentResult, syncRoomState } from './mockServer'
import { SHOP_ITEMS } from '../data/shopItems'
import type { CosmeticType } from '../types/shop'
import { assessPronunciation } from './azureSpeech'
import {
  broadcastRoomRealtime,
  requestRemoteRoomState,
  saveRoomToSupabase,
} from './realtimeRoom'
import type { DailyQuest } from '../types/quest'
import {
  addRewardTransactions,
  buyShopItem,
  canRestoreStreak,
  claimDailyQuest,
  equipShopItem,
  getAttemptById,
  getAttempts,
  getDailyQuestsState,
  getRoomByCode,
  getStoredClips,
  getUserInventory,
  getUserProfile,
  resetAllStorage,
  restoreStreak,
  saveAttempt,
  saveRoom,
  updateDisplayName,
} from './storage'
export * from './admin'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * SRS Baseline API: GET /api/me
 * Retrieves user profile with dynamically derived XP, Coins, and Streak.
 */
export async function getMe(): Promise<UserProfile> {
  await delay(80)
  return getUserProfile()
}

/**
 * SRS Baseline API: GET /api/clips
 * Retrieves curated list of shadowing clips.
 */
export async function getClips(): Promise<Clip[]> {
  await delay(60)
  return getStoredClips()
}

/**
 * SRS Baseline API: GET /api/clips/:id
 * Retrieves details and reference transcript for a specific clip.
 */
export async function getClip(id: string): Promise<Clip | null> {
  await delay(40)
  const clips = getStoredClips()
  const clip = clips.find((c) => c.id === id)
  return clip || null
}

/**
 * SRS Baseline API: POST /api/attempts
 * Submits an audio recording for solo pronunciation assessment.
 * Calculates scores, generates word-level miscues, and rewards XP/Coins via ledger.
 */
export async function submitAttempt(
  clipId: string,
  audioBlob?: Blob
): Promise<Attempt> {
  const clip = await getClip(clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'
  const user = await getMe()

  // Assess pronunciation through Azure Speech adapter (or deterministic fallback)
  const result = audioBlob
    ? await assessPronunciation(audioBlob, refText)
    : generateAssessmentResult(refText)

  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  // Atomically record rewards into ledger with strict idempotency
  addRewardTransactions([
    {
      userId: user.id,
      type: 'XP',
      amount: REWARDS.soloPractice.xp,
      referenceType: 'ATTEMPT',
      referenceId: attemptId,
    },
    {
      userId: user.id,
      type: 'COINS',
      amount: REWARDS.soloPractice.coins,
      referenceType: 'ATTEMPT',
      referenceId: attemptId,
    },
  ])

  const attempt: Attempt = {
    id: attemptId,
    userId: user.id,
    clipId,
    result,
    earnedXp: REWARDS.soloPractice.xp,
    earnedCoins: REWARDS.soloPractice.coins,
    createdAt: new Date().toISOString(),
  }

  saveAttempt(attempt)
  return attempt
}

/**
 * SRS Baseline API: GET /api/attempts/:id
 * Retrieves a past attempt result.
 */
export async function getAttempt(id: string): Promise<Attempt | null> {
  await delay(80)
  return getAttemptById(id)
}

/**
 * Retrieves all past attempts for performance stats.
 */
export async function getUserAttempts(): Promise<Attempt[]> {
  await delay(40)
  return getAttempts()
}

/**
 * SRS Baseline API: POST /api/battles/rooms (FR-BAT-01, FR-BAT-07)
 * Creates a new battle room (2 to 5 players) with a 5-character room code.
 */
export async function createRoom(clipId: string, maxPlayers: number = 2): Promise<BattleRoom> {
  await delay(150)
  const user = await getMe()
  const code = generateRoomCode()
  const now = Date.now()

  const hostParticipant = {
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isBot: false,
    isReady: false,
    hasSubmitted: false,
  }

  const room: BattleRoom = {
    id: `room-${now}-${code}`,
    code,
    clipId,
    hostUserId: user.id,
    status: 'WAITING',
    maxPlayers,
    player: hostParticipant,
    opponent: null,
    participants: [hostParticipant],
    createdAt: now,
    botJoinAt: now + DEMO_CONFIG.botJoinDelayMs,
  }

  saveRoom(room)
  void broadcastRoomRealtime(room)
  void saveRoomToSupabase(room)
  return room
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/join (FR-BAT-02, FR-BAT-07)
 * Joins an existing battle room using its 5-character code.
 * Supports up to maxPlayers (2 to 5).
 */
export async function joinRoom(code: string): Promise<BattleRoom> {
  await delay(120)
  const normalizedCode = code.trim().toUpperCase()
  let existing = getRoomByCode(normalizedCode)

  if (!existing) {
    // Discover room state across computers/browsers via Supabase Realtime Broadcast or DB
    existing = await requestRemoteRoomState(normalizedCode, 3000)
  }

  if (!existing) {
    throw new Error(`Room code "${normalizedCode}" not found. Ensure host is waiting in lobby.`)
  }

  const user = await getMe()
  const maxPlayers = existing.maxPlayers || 2

  // Support separate players even if both are default guests without collision
  let participantUserId = user.id
  let participantDisplayName = user.displayName

  if (existing.hostUserId === user.id) {
    participantUserId = `user-peer-${Math.random().toString(36).slice(2, 7)}`
    participantDisplayName = `${user.displayName} (P2)`
  }

  if (!existing.participants) {
    existing.participants = [existing.player]
    if (existing.opponent) existing.participants.push(existing.opponent)
  }

  const alreadyIn = existing.participants.some((p) => p.userId === participantUserId)
  if (!alreadyIn && existing.participants.length < maxPlayers) {
    const newParticipant = {
      userId: participantUserId,
      displayName: participantDisplayName,
      avatarUrl: user.avatarUrl,
      isBot: false,
      isReady: false,
      hasSubmitted: false,
    }
    const firstBotIdx = existing.participants.findIndex((p) => p.isBot)
    if (firstBotIdx !== -1) {
      existing.participants[firstBotIdx] = newParticipant
    } else {
      existing.participants.push(newParticipant)
    }

    if (existing.hostUserId !== participantUserId && (!existing.opponent || existing.opponent.isBot)) {
      existing.opponent = newParticipant
    }

    saveRoom(existing)
    void broadcastRoomRealtime(existing)
    void saveRoomToSupabase(existing)
  }

  return syncRoomState(existing)
}

/**
 * Manually summons bot sparring partner into the room immediately.
 */
export async function addBotToRoom(code: string): Promise<BattleRoom> {
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room "${normalizedCode}" not found.`)
  }
  room.botJoinAt = Date.now() - 1000
  room.botReadyAt = Date.now() + DEMO_CONFIG.botReadyDelayMs
  const updated = syncRoomState(room)
  saveRoom(updated)
  void broadcastRoomRealtime(updated)
  void saveRoomToSupabase(updated)
  return updated
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/ready
 * Updates the user's ready status and broadcasts change.
 */
export async function setReady(code: string, ready = true): Promise<BattleRoom> {
  await delay(80)
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room not found: ${normalizedCode}`)
  }

  const user = await getMe()
  const myParticipant = room.participants?.find(
    (p) => !p.isBot && (p.userId === user.id || (room.hostUserId !== user.id && p.userId !== room.hostUserId))
  )
  const myUserId = myParticipant ? myParticipant.userId : user.id

  if (room.hostUserId === myUserId) {
    room.player.isReady = ready
  } else if (room.opponent && room.opponent.userId === myUserId) {
    room.opponent.isReady = ready
  } else {
    room.player.isReady = ready
  }

  if (room.participants) {
    const p = room.participants.find((item) => item.userId === myUserId)
    if (p) p.isReady = ready
  }

  const updated = syncRoomState(room)
  saveRoom(updated)
  void broadcastRoomRealtime(updated)
  void saveRoomToSupabase(updated)
  return updated
}

/**
 * SRS Baseline API: GET /api/battles/rooms/:code
 * Retrieves current room snapshot. Automatically synchronizes status based on Date.now().
 */
export async function getRoom(code: string): Promise<BattleRoom | null> {
  const normalizedCode = code.trim().toUpperCase()
  let room = getRoomByCode(normalizedCode)
  if (!room) {
    room = await requestRemoteRoomState(normalizedCode, 800)
    if (room) {
      saveRoom(room)
    }
  }
  if (!room) return null

  return syncRoomState(room)
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/submit
 * Submits the player's battle recording for independent assessment.
 */
export async function submitBattleAttempt(
  code: string,
  audioBlob?: Blob
): Promise<BattleRoom> {
  await delay(100)
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room not found: ${normalizedCode}`)
  }

  const clip = await getClip(room.clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'
  const user = await getMe()

  // Evaluate via Azure Speech adapter if audioBlob is provided
  const assessment = audioBlob
    ? await assessPronunciation(audioBlob, refText)
    : undefined

  if (room.hostUserId === user.id) {
    room.player.hasSubmitted = true
    room.player.submittedAt = Date.now()
    if (assessment) room.player.assessment = assessment
  } else if (room.opponent && room.opponent.userId === user.id) {
    room.opponent.hasSubmitted = true
    room.opponent.submittedAt = Date.now()
    if (assessment) room.opponent.assessment = assessment
  } else {
    room.player.hasSubmitted = true
    room.player.submittedAt = Date.now()
    if (assessment) room.player.assessment = assessment
  }

  if (room.participants) {
    const p = room.participants.find((item) => item.userId === user.id)
    if (p) {
      p.hasSubmitted = true
      p.submittedAt = Date.now()
      if (assessment) p.assessment = assessment
    }
  }

  const updated = syncRoomState(room)
  saveRoom(updated)
  void broadcastRoomRealtime(updated)
  void saveRoomToSupabase(updated)
  return updated
}

/**
 * Reset all demo data to pristine state.
 * Re-seeds initial balance of 120 XP and 45 Coins via SEED ledger entries.
 */
export async function resetDemo(): Promise<void> {
  await delay(100)
  resetAllStorage()
}

/**
 * SRS Baseline API: GET /api/shop/items (FR-SHOP-01)
 * Retrieves cosmetic catalog (Avatars, Frames, Titles).
 */
export async function getShopCatalog() {
  await delay(60)
  return [...SHOP_ITEMS]
}

/**
 * SRS Baseline API: GET /api/shop/inventory
 * Retrieves user's owned and equipped items.
 */
export async function getInventory() {
  await delay(40)
  return getUserInventory()
}

/**
 * SRS Baseline API: POST /api/shop/purchase (FR-SHOP-01)
 * Purchases cosmetic item using Coins via atomic ledger transaction.
 */
export async function purchaseItem(itemId: string) {
  await delay(120)
  return buyShopItem(itemId)
}

/**
 * SRS Baseline API: POST /api/shop/equip (FR-SHOP-01)
 * Equips an owned cosmetic item.
 */
export async function equipItem(type: CosmeticType, itemId: string) {
  await delay(60)
  return equipShopItem(type, itemId)
}

/**
 * SRS Baseline API: POST /api/streak/restore (FR-PROG-04)
 * Restores broken streak by paying 30 coins (max once per 7 days).
 */
export async function attemptStreakRestore() {
  await delay(100)
  return restoreStreak()
}

/**
 * Check if streak restore is available.
 */
export async function checkStreakRestoreEligibility() {
  return canRestoreStreak()
}

/**
 * SRS Baseline API: POST /api/me/profile (FR-AUTH-02)
 * Updates user display name.
 */
export async function setDisplayName(name: string) {
  await delay(60)
  return updateDisplayName(name)
}

/**
 * SRS Baseline API: GET /api/quests (FR-QUEST-01)
 * Retrieves today's 3 daily quests and their real-time progress.
 */
export async function getDailyQuests(): Promise<DailyQuest[]> {
  await delay(60)
  return getDailyQuestsState()
}

/**
 * SRS Baseline API: POST /api/quests/:id/claim (FR-QUEST-01)
 * Claims rewards for a completed daily quest via atomic ledger transaction.
 */
export async function claimQuest(questId: string): Promise<{ success: boolean; message: string }> {
  await delay(80)
  return claimDailyQuest(questId)
}


