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
  saveStoredClips,
  updateDisplayName,
} from './storage'
import {
  fetchRemoteClips,
  recordRemoteAttempt,
  recordRemoteRewardTransactions,
} from './supabaseSync'
export * from './admin'
export * from './supabaseSync'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const getMe = async (): Promise<UserProfile> => getUserProfile()
export const getAttempt = async (id: string): Promise<Attempt | null> => getAttemptById(id)
export const getUserAttempts = async (): Promise<Attempt[]> => getAttempts()
export const resetDemo = async (): Promise<void> => resetAllStorage()
export const getShopCatalog = async () => [...SHOP_ITEMS]
export const getInventory = async () => getUserInventory()
export const purchaseItem = async (itemId: string) => buyShopItem(itemId)
export const equipItem = async (type: CosmeticType, itemId: string) => equipShopItem(type, itemId)
export const attemptStreakRestore = async () => restoreStreak()
export const checkStreakRestoreEligibility = async () => canRestoreStreak()
export const setDisplayName = async (name: string) => updateDisplayName(name)
export const getDailyQuests = async (): Promise<DailyQuest[]> => getDailyQuestsState()
export const claimQuest = async (questId: string) => claimDailyQuest(questId)

export async function getClips(): Promise<Clip[]> {
  const remote = await fetchRemoteClips()
  if (remote && remote.length > 0) {
    saveStoredClips(remote)
    return remote
  }
  return getStoredClips()
}

export async function getClip(id: string): Promise<Clip | null> {
  const clips = await getClips()
  return clips.find((c) => c.id === id) || null
}

const attemptAudioCache = new Map<string, string>()

export function getAttemptAudioUrl(attemptId: string): string | null {
  return attemptAudioCache.get(attemptId) || null
}

export async function submitAttempt(
  clipId: string,
  audioBlob?: Blob
): Promise<Attempt> {
  const clip = await getClip(clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'
  const user = await getMe()

  const result = audioBlob
    ? await assessPronunciation(audioBlob, refText)
    : generateAssessmentResult(refText)

  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  if (audioBlob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      attemptAudioCache.set(attemptId, URL.createObjectURL(audioBlob))
    } catch {
      // ignore in non-browser environments
    }
  }

  const rewardItems = [
    {
      userId: user.id,
      type: 'XP' as const,
      amount: REWARDS.soloPractice.xp,
      referenceType: 'ATTEMPT' as const,
      referenceId: attemptId,
    },
    {
      userId: user.id,
      type: 'COINS' as const,
      amount: REWARDS.soloPractice.coins,
      referenceType: 'ATTEMPT' as const,
      referenceId: attemptId,
    },
  ]

  addRewardTransactions(rewardItems)
  void recordRemoteRewardTransactions(rewardItems)

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
  void recordRemoteAttempt(attempt)

  return attempt
}

export async function createRoom(clipId: string, maxPlayers: number = 2): Promise<BattleRoom> {
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

export async function joinRoom(code: string): Promise<BattleRoom> {
  const normalizedCode = code.trim().toUpperCase()
  let existing = getRoomByCode(normalizedCode)

  if (!existing) {
    existing = await requestRemoteRoomState(normalizedCode, 3000)
  }

  if (!existing) {
    throw new Error(`Room code "${normalizedCode}" not found. Ensure host is waiting in lobby.`)
  }

  const user = await getMe()
  const maxPlayers = existing.maxPlayers || 2

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

export async function setReady(code: string, ready = true): Promise<BattleRoom> {
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

export async function submitBattleAttempt(
  code: string,
  audioBlob?: Blob
): Promise<BattleRoom> {
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room not found: ${normalizedCode}`)
  }

  const clip = await getClip(room.clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'
  const user = await getMe()

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
