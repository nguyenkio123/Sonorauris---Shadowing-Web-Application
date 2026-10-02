import type { AssessmentResult } from './attempt'

export type RoomStatus =
  | 'WAITING'
  | 'READY'
  | 'COUNTDOWN'
  | 'RECORDING'
  | 'SUBMITTING'
  | 'ASSESSING'
  | 'RESULT'
  | 'FINISHED'

export type BattleOutcome = 'WIN' | 'LOSE' | 'DRAW'

export interface BattleParticipant {
  userId: string
  displayName: string
  avatarUrl: string
  isBot: boolean
  isReady: boolean
  hasSubmitted: boolean
  submittedAt?: number
  assessment?: AssessmentResult
  outcome?: BattleOutcome
  rank?: number // 1, 2, 3, etc. for multiplayer arena (FR-BAT-07)
  earnedXp?: number
  earnedCoins?: number
}

export interface BattleRoom {
  id: string
  code: string // 5-character room code (e.g. 'SH7A2')
  clipId: string
  hostUserId: string
  status: RoomStatus
  player: BattleParticipant
  opponent: BattleParticipant | null
  maxPlayers?: number // 2, 3, 4, 5 (FR-BAT-07)
  participants?: BattleParticipant[] // Full list of 2 to 5 participants
  createdAt: number
  botJoinAt?: number
  botReadyAt?: number
  countdownEndsAt?: number
  submitDeadlineAt?: number // Default 60s after RECORDING starts (SRS timeout rule)
  assessReadyAt?: number
  rewardsClaimed?: boolean // Guard flag to prevent repeated ledger reward dispatches
  finishedAt?: number
}
