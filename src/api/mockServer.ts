import { DEMO_CONFIG, getForcedOutcome } from '../config/demo'
import {
  calculateBattleScore,
  REWARDS,
  SCORE_RANGE,
} from '../config/scoring'
import { SAMPLE_CLIPS } from '../data/clips'
import type { AssessmentResult, MiscueWord } from '../types/attempt'
import type { BattleParticipant, BattleRoom } from '../types/battle'
import { addRewardTransactions, saveRoom } from './storage'

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generates realistic mock miscues from the reference text.
 * Selects 1-2 words to be mispronunciations, omissions, or insertions.
 */
export function generateMockMiscues(referenceText: string): MiscueWord[] {
  const cleanTokens = referenceText
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  if (cleanTokens.length === 0) return []

  const words: MiscueWord[] = cleanTokens.map((w) => ({ word: w }))

  // Pick 1-2 indices for miscues
  const targetIdx1 = Math.min(2, words.length - 1)
  const targetIdx2 = words.length > 5 ? Math.min(5, words.length - 1) : -1

  if (targetIdx1 >= 0 && words[targetIdx1]) {
    words[targetIdx1] = {
      word: words[targetIdx1].word,
      type: 'mispronunciation',
      phoneticHint: `/ˈ${words[targetIdx1].word.toLowerCase()}/`,
    }
  }

  if (targetIdx2 >= 0 && words[targetIdx2]) {
    words[targetIdx2] = {
      word: words[targetIdx2].word,
      type: 'omission',
    }
  }

  return words
}

/**
 * Generates an AssessmentResult with Accuracy, Fluency, Completeness, Prosody.
 */
export function generateAssessmentResult(
  referenceText: string,
  targetScore?: number
): AssessmentResult {
  let accuracy = randomBetween(SCORE_RANGE.min, SCORE_RANGE.max)
  let fluency = randomBetween(SCORE_RANGE.min, SCORE_RANGE.max)
  let completeness = randomBetween(SCORE_RANGE.min, SCORE_RANGE.max)
  let prosody = randomBetween(SCORE_RANGE.min, SCORE_RANGE.max)

  if (targetScore !== undefined) {
    accuracy = Math.min(99, Math.max(50, targetScore))
    fluency = Math.min(98, Math.max(50, targetScore + randomBetween(-2, 2)))
    completeness = Math.min(98, Math.max(50, targetScore + randomBetween(-3, 1)))
    prosody = Math.min(98, Math.max(50, targetScore + randomBetween(-2, 2)))
  }

  const battleScore = calculateBattleScore(accuracy, fluency, completeness, prosody)
  const words = generateMockMiscues(referenceText)

  return {
    accuracy,
    fluency,
    completeness,
    prosody,
    battleScore,
    words,
  }
}

const BOT_ROSTER = [
  {
    userId: 'bot-shadow-ai',
    displayName: 'ShadowBot AI',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowBot',
  },
  {
    userId: 'bot-echo-ai',
    displayName: 'EchoBot Neo',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=EchoBot',
  },
  {
    userId: 'bot-cadence-ai',
    displayName: 'CadenceBot Max',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CadenceBot',
  },
  {
    userId: 'bot-prosody-ai',
    displayName: 'ProsodyBot Iris',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProsodyBot',
  },
]

/**
 * Calculates current room status purely from Date.now() and stored timestamps.
 * Guarantees that room state survives page refresh (F5).
 * Supports 2–5 players arena multiplayer (FR-BAT-07).
 */
export function syncRoomState(room: BattleRoom): BattleRoom {
  const now = Date.now()
  let modified = false
  const maxPlayers = room.maxPlayers || 2

  // Ensure participants array is initialized
  let currentParticipants: BattleParticipant[] = room.participants
    ? room.participants.map((p) => ({ ...p }))
    : [{ ...room.player }]

  if (room.opponent && !currentParticipants.some((p) => p.userId === room.opponent?.userId)) {
    currentParticipants.push({ ...room.opponent })
  }

  const updated: BattleRoom = {
    ...room,
    player: { ...room.player },
    opponent: room.opponent ? { ...room.opponent } : null,
    maxPlayers,
    participants: currentParticipants,
  }

  const clip = SAMPLE_CLIPS.find((c) => c.id === updated.clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'

  // 1. WAITING state: populate bot opponents up to maxPlayers
  if (updated.status === 'WAITING') {
    if (updated.botJoinAt && now >= updated.botJoinAt) {
      let botIdx = 0
      while (updated.participants!.length < maxPlayers && botIdx < BOT_ROSTER.length) {
        const botData = BOT_ROSTER[botIdx]
        if (!updated.participants!.some((p) => p.userId === botData.userId)) {
          updated.participants!.push({
            userId: botData.userId,
            displayName: botData.displayName,
            avatarUrl: botData.avatarUrl,
            isBot: true,
            isReady: false,
            hasSubmitted: false,
          })
          modified = true
        }
        botIdx++
      }

      if (!updated.opponent && updated.participants!.length > 1) {
        updated.opponent = updated.participants![1]
      }
      if (!updated.botReadyAt) {
        updated.botReadyAt = now + DEMO_CONFIG.botReadyDelayMs
      }
    }

    if (updated.botReadyAt && now >= updated.botReadyAt) {
      for (const p of updated.participants!) {
        if (p.isBot && !p.isReady) {
          p.isReady = true
          modified = true
        }
      }
      if (updated.opponent && !updated.opponent.isReady) {
        updated.opponent.isReady = true
      }
    }

    // All participants ready and room full? Transition to READY
    const allReady =
      updated.participants!.length >= maxPlayers &&
      updated.participants!.every((p) => p.isReady)

    if (allReady) {
      updated.status = 'READY'
      updated.countdownEndsAt = now + DEMO_CONFIG.countdownSeconds * 1000
      modified = true
    }
  }

  // 2. READY state: auto advance to COUNTDOWN
  if (updated.status === 'READY') {
    if (!updated.countdownEndsAt) {
      updated.countdownEndsAt = now + DEMO_CONFIG.countdownSeconds * 1000
    }
    updated.status = 'COUNTDOWN'
    modified = true
  }

  // 3. COUNTDOWN state: check if countdown has elapsed -> transition to RECORDING
  if (updated.status === 'COUNTDOWN') {
    if (updated.countdownEndsAt && now >= updated.countdownEndsAt) {
      updated.status = 'RECORDING'
      // 60-second submit deadline per SRS timeout rule
      updated.submitDeadlineAt = now + 60000
      modified = true
    }
  }

  // 4. RECORDING state:
  if (updated.status === 'RECORDING') {
    const isTimedOut = updated.submitDeadlineAt ? now >= updated.submitDeadlineAt : false

    // Stagger bot submissions for lifelike arena dynamics
    updated.participants!.forEach((p, idx) => {
      if (p.isBot && !p.hasSubmitted) {
        const botThreshold = (updated.countdownEndsAt || now) + 3200 + idx * 800
        if (now >= botThreshold || isTimedOut) {
          p.hasSubmitted = true
          p.submittedAt = now
          modified = true
        }
      }
    })

    if (updated.opponent && updated.participants!.length > 1) {
      updated.opponent = updated.participants![1]
    }

    const allSubmitted = updated.participants!.every((p) => p.hasSubmitted)
    if (allSubmitted || isTimedOut) {
      updated.status = 'ASSESSING'
      updated.assessReadyAt = now + DEMO_CONFIG.assessmentDelayMs
      modified = true
    }
  }

  // 5. ASSESSING state: calculate results when assessReadyAt is reached
  if (updated.status === 'ASSESSING') {
    if (updated.assessReadyAt && now >= updated.assessReadyAt) {
      const forcedOutcome = getForcedOutcome()

      // Assess human player
      let playerAssessment = updated.player.assessment
      if (!playerAssessment) {
        playerAssessment = updated.player.hasSubmitted
          ? generateAssessmentResult(refText)
          : generateAssessmentResult(refText, 45) // forfeited penalty
      }
      updated.player.assessment = playerAssessment

      // Assess all participants
      updated.participants!.forEach((p) => {
        if (p.userId === updated.player.userId) {
          p.assessment = playerAssessment
        } else if (!p.assessment) {
          if (p.isBot) {
            let targetBotScore: number
            if (forcedOutcome === 'WIN') {
              targetBotScore = Math.max(50, playerAssessment!.battleScore - randomBetween(6, 14))
            } else if (forcedOutcome === 'LOSE') {
              targetBotScore = Math.min(98, playerAssessment!.battleScore + randomBetween(6, 14))
            } else if (forcedOutcome === 'DRAW') {
              targetBotScore = playerAssessment!.battleScore
            } else {
              targetBotScore = randomBetween(72, 92)
            }
            p.assessment = generateAssessmentResult(refText, targetBotScore)
          } else {
            p.assessment = generateAssessmentResult(refText)
          }
        }
      })

      // Sort participants by battleScore descending for Leaderboard ranking
      const sorted = [...updated.participants!].sort((a, b) => {
        const scoreA = a.assessment?.battleScore || 0
        const scoreB = b.assessment?.battleScore || 0
        return scoreB - scoreA
      })

      const topScore = sorted[0]?.assessment?.battleScore || 0

      // Assign ranks & outcomes
      sorted.forEach((p, idx) => {
        const pScore = p.assessment?.battleScore || 0
        p.rank = idx + 1
        if (pScore === topScore) {
          p.outcome = 'WIN'
          p.earnedXp = REWARDS.battleWin.xp
          p.earnedCoins = REWARDS.battleWin.coins
        } else if (idx === 1 && maxPlayers > 2) {
          p.outcome = 'DRAW'
          p.earnedXp = REWARDS.battleDraw.xp
          p.earnedCoins = REWARDS.battleDraw.coins
        } else {
          p.outcome = 'LOSE'
          p.earnedXp = REWARDS.battleLose.xp
          p.earnedCoins = REWARDS.battleLose.coins
        }
      })

      updated.participants = sorted

      // Sync player & opponent references
      const myParticipant = sorted.find((p) => p.userId === updated.player.userId) || sorted[0]
      updated.player = { ...myParticipant }

      const otherParticipant = sorted.find((p) => p.userId !== updated.player.userId) || sorted[1]
      updated.opponent = otherParticipant ? { ...otherParticipant } : null

      // Atomically record rewards into ledger for human player
      if (!updated.rewardsClaimed) {
        addRewardTransactions([
          {
            userId: updated.player.userId,
            type: 'XP',
            amount: updated.player.earnedXp || REWARDS.battleLose.xp,
            referenceType: 'BATTLE',
            referenceId: updated.id,
          },
          {
            userId: updated.player.userId,
            type: 'COINS',
            amount: updated.player.earnedCoins || REWARDS.battleLose.coins,
            referenceType: 'BATTLE',
            referenceId: updated.id,
          },
        ])
        updated.rewardsClaimed = true
      }

      updated.status = 'RESULT'
      updated.finishedAt = now
      modified = true
    }
  }

  if (modified) {
    saveRoom(updated)
  }

  return updated
}
