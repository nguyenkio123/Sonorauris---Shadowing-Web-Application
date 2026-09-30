import { DEMO_CONFIG, getForcedOutcome } from '../config/demo'
import {
  calculateBattleScore,
  REWARDS,
  SCORE_RANGE,
} from '../config/scoring'
import { SAMPLE_CLIPS } from '../data/clips'
import type { AssessmentResult, MiscueWord } from '../types/attempt'
import type { BattleOutcome, BattleRoom } from '../types/battle'
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

/**
 * Calculates current room status purely from Date.now() and stored timestamps.
 * Guarantees that room state survives page refresh (F5).
 */
export function syncRoomState(room: BattleRoom): BattleRoom {
  const now = Date.now()
  let modified = false
  const updated: BattleRoom = {
    ...room,
    player: { ...room.player },
    opponent: room.opponent ? { ...room.opponent } : null,
  }

  const clip = SAMPLE_CLIPS.find((c) => c.id === updated.clipId)
  const refText = clip ? clip.referenceText : 'English shadowing practice sample text.'

  // 1. WAITING state: check bot join and bot ready
  if (updated.status === 'WAITING') {
    if (updated.botJoinAt && now >= updated.botJoinAt && !updated.opponent) {
      updated.opponent = {
        userId: 'bot-shadow-ai',
        displayName: 'ShadowBot AI',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowBot',
        isBot: true,
        isReady: false,
        hasSubmitted: false,
      }
      updated.botReadyAt = now + DEMO_CONFIG.botReadyDelayMs
      modified = true
    }

    if (
      updated.opponent &&
      !updated.opponent.isReady &&
      updated.botReadyAt &&
      now >= updated.botReadyAt
    ) {
      updated.opponent.isReady = true
      modified = true
    }

    // Both ready? Transition to READY
    if (updated.player.isReady && updated.opponent?.isReady) {
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
    // Bot automatically submits ~4s into recording
    if (updated.opponent && !updated.opponent.hasSubmitted) {
      const botSubmitThreshold = (updated.countdownEndsAt || now) + 4000
      if (now >= botSubmitThreshold) {
        updated.opponent.hasSubmitted = true
        updated.opponent.submittedAt = now
        modified = true
      }
    }

    // Check if timeout reached (60s submit deadline)
    const isTimedOut = updated.submitDeadlineAt ? now >= updated.submitDeadlineAt : false

    if (isTimedOut) {
      // If player did not submit in time, mark as unsubmitted
      if (!updated.player.hasSubmitted) {
        updated.player.hasSubmitted = false
      }
      if (updated.opponent && !updated.opponent.hasSubmitted) {
        updated.opponent.hasSubmitted = true
        updated.opponent.submittedAt = now
      }
      updated.status = 'ASSESSING'
      updated.assessReadyAt = now + DEMO_CONFIG.assessmentDelayMs
      modified = true
    } else if (updated.player.hasSubmitted && updated.opponent?.hasSubmitted) {
      // Both submitted normally
      updated.status = 'ASSESSING'
      updated.assessReadyAt = now + DEMO_CONFIG.assessmentDelayMs
      modified = true
    }
  }

  // 5. ASSESSING state: calculate results when assessReadyAt is reached
  if (updated.status === 'ASSESSING') {
    if (updated.assessReadyAt && now >= updated.assessReadyAt) {
      // Check if player timed out without submitting
      const playerDidNotSubmit = !updated.player.hasSubmitted

      if (playerDidNotSubmit) {
        // Player forfeited / timed out
        const botAssessment = generateAssessmentResult(refText, 85)
        updated.player.assessment = undefined
        updated.player.outcome = 'LOSE'
        updated.player.earnedXp = 0
        updated.player.earnedCoins = 0

        if (updated.opponent) {
          updated.opponent.assessment = botAssessment
          updated.opponent.outcome = 'WIN'
          updated.opponent.earnedXp = REWARDS.battleWin.xp
          updated.opponent.earnedCoins = REWARDS.battleWin.coins
        }
      } else {
        // 1. Generate player's organic score first
        const playerAssessment = generateAssessmentResult(refText)
        const forcedOutcome = getForcedOutcome()

        let botAssessment: AssessmentResult

        // 2. Generate bot's score relative to player's score to guarantee matching labels
        if (forcedOutcome === 'WIN') {
          // Bot is 5-15 points lower than player
          const diff = randomBetween(5, 15)
          const botTarget = Math.max(50, playerAssessment.battleScore - diff)
          botAssessment = generateAssessmentResult(refText, botTarget)
          // Ensure strictly lower
          while (botAssessment.battleScore >= playerAssessment.battleScore) {
            botAssessment.accuracy = Math.max(50, botAssessment.accuracy - 2)
            botAssessment.battleScore = calculateBattleScore(
              botAssessment.accuracy,
              botAssessment.fluency,
              botAssessment.completeness,
              botAssessment.prosody
            )
          }
        } else if (forcedOutcome === 'LOSE') {
          // Bot is 5-15 points higher than player
          const diff = randomBetween(5, 15)
          const botTarget = Math.min(98, playerAssessment.battleScore + diff)
          botAssessment = generateAssessmentResult(refText, botTarget)
          // Ensure strictly higher
          while (botAssessment.battleScore <= playerAssessment.battleScore) {
            botAssessment.accuracy = Math.min(99, botAssessment.accuracy + 2)
            botAssessment.battleScore = calculateBattleScore(
              botAssessment.accuracy,
              botAssessment.fluency,
              botAssessment.completeness,
              botAssessment.prosody
            )
          }
        } else if (forcedOutcome === 'DRAW') {
          // Both have strictly identical battleScore integers
          botAssessment = {
            ...playerAssessment,
            accuracy: playerAssessment.accuracy,
            fluency: playerAssessment.fluency,
            completeness: playerAssessment.completeness,
            prosody: playerAssessment.prosody,
            battleScore: playerAssessment.battleScore,
            words: generateMockMiscues(refText),
          }
        } else {
          // Natural random matchup
          botAssessment = generateAssessmentResult(refText)
        }

        // 3. Determine outcome strictly from the comparison of battleScore numbers
        let playerOutcome: BattleOutcome
        let opponentOutcome: BattleOutcome

        if (playerAssessment.battleScore > botAssessment.battleScore) {
          playerOutcome = 'WIN'
          opponentOutcome = 'LOSE'
        } else if (playerAssessment.battleScore < botAssessment.battleScore) {
          playerOutcome = 'LOSE'
          opponentOutcome = 'WIN'
        } else {
          playerOutcome = 'DRAW'
          opponentOutcome = 'DRAW'
        }

        const rewardMap = {
          WIN: REWARDS.battleWin,
          DRAW: REWARDS.battleDraw,
          LOSE: REWARDS.battleLose,
        }

        const playerReward = rewardMap[playerOutcome]
        const botReward = rewardMap[opponentOutcome]

        updated.player.assessment = playerAssessment
        updated.player.outcome = playerOutcome
        updated.player.earnedXp = playerReward.xp
        updated.player.earnedCoins = playerReward.coins

        if (updated.opponent) {
          updated.opponent.assessment = botAssessment
          updated.opponent.outcome = opponentOutcome
          updated.opponent.earnedXp = botReward.xp
          updated.opponent.earnedCoins = botReward.coins
        }

        // 4. Atomically record rewards into ledger (Double protection: rewardsClaimed flag + ledger idempotency)
        if (!updated.rewardsClaimed) {
          addRewardTransactions([
            {
              userId: updated.player.userId,
              type: 'XP',
              amount: playerReward.xp,
              referenceType: 'BATTLE',
              referenceId: updated.id,
            },
            {
              userId: updated.player.userId,
              type: 'COINS',
              amount: playerReward.coins,
              referenceType: 'BATTLE',
              referenceId: updated.id,
            },
          ])
          updated.rewardsClaimed = true
        }
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
