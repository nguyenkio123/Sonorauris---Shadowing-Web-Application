import type { UserRole } from './auth'

export interface UserProfile {
  id: string
  displayName: string
  avatarUrl: string
  xp: number
  coins: number
  streak: number
  role?: UserRole
  lastPracticeDate: string | null
  equippedAvatarId?: string
  equippedFrameId?: string
  equippedTitleId?: string
  equippedTitle?: string
  lastStreakRestoreDate?: string | null
}
