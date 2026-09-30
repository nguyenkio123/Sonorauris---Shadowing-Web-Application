import { DEMO_CONFIG } from '../config/demo'
import { REWARDS } from '../config/scoring'
import { SAMPLE_CLIPS } from '../data/clips'
import type { Attempt } from '../types/attempt'
import type { BattleRoom } from '../types/battle'
import type { Clip } from '../types/clip'
import type { UserProfile } from '../types/user'
import { generateAssessmentResult, syncRoomState } from './mockServer'
import {
  addRewardTransactions,
  getAttemptById,
  getRoomByCode,
  getUserProfile,
  resetAllStorage,
  saveAttempt,
  saveRoom,
} from './storage'

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
  await delay(120)
  return [...SAMPLE_CLIPS]
}

/**
 * SRS Baseline API: GET /api/clips/:id
 * Retrieves details and reference transcript for a specific clip.
 */
export async function getClip(id: string): Promise<Clip | null> {
  await delay(80)
  const clip = SAMPLE_CLIPS.find((c) => c.id === id)
  return clip || null
}

/**
 * SRS Baseline API: POST /api/attempts
 * Submits an audio recording for solo pronunciation assessment.
 * Calculates scores, generates word-level miscues, and rewards XP/Coins via ledger.
 */
export async function submitAttempt(
  clipId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _audioBlob?: Blob
): Promise<Attempt> {
  // Simulate AI assessment latency (~1.5s as specified in SRS / demo requirements)
  await delay(DEMO_CONFIG.assessmentDelayMs)

  const clip = await getClip(clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'
  const user = await getMe()

  const result = generateAssessmentResult(refText)
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
 * SRS Baseline API: POST /api/battles/rooms
 * Creates a new private 1v1 battle room with a 5-character room code.
 */
export async function createRoom(clipId: string): Promise<BattleRoom> {
  await delay(150)
  const user = await getMe()
  const code = generateRoomCode()
  const now = Date.now()

  const room: BattleRoom = {
    id: `room-${now}-${code}`,
    code,
    clipId,
    hostUserId: user.id,
    status: 'WAITING',
    player: {
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isBot: false,
      isReady: false,
      hasSubmitted: false,
    },
    opponent: null,
    createdAt: now,
    botJoinAt: now + DEMO_CONFIG.botJoinDelayMs,
  }

  saveRoom(room)
  return room
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/join
 * Joins an existing battle room using its 5-character code.
 */
export async function joinRoom(code: string): Promise<BattleRoom> {
  await delay(120)
  const normalizedCode = code.trim().toUpperCase()
  const existing = getRoomByCode(normalizedCode)

  if (!existing) {
    throw new Error(`Room code "${normalizedCode}" not found.`)
  }

  return syncRoomState(existing)
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/ready
 * Updates the user's ready status.
 */
export async function setReady(code: string, ready = true): Promise<BattleRoom> {
  await delay(80)
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room not found: ${normalizedCode}`)
  }

  room.player.isReady = ready
  const updated = syncRoomState(room)
  saveRoom(updated)
  return updated
}

/**
 * SRS Baseline API: GET /api/battles/rooms/:code
 * Retrieves current room snapshot. Automatically synchronizes status based on Date.now().
 */
export async function getRoom(code: string): Promise<BattleRoom | null> {
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) return null

  return syncRoomState(room)
}

/**
 * SRS Baseline API: POST /api/battles/rooms/:code/submit
 * Submits the player's battle recording for independent assessment.
 */
export async function submitBattleAttempt(
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _audioBlob?: Blob
): Promise<BattleRoom> {
  await delay(100)
  const normalizedCode = code.trim().toUpperCase()
  const room = getRoomByCode(normalizedCode)
  if (!room) {
    throw new Error(`Room not found: ${normalizedCode}`)
  }

  room.player.hasSubmitted = true
  room.player.submittedAt = Date.now()

  const updated = syncRoomState(room)
  saveRoom(updated)
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
