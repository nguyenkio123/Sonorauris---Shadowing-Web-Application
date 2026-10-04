import type { UserRole } from './auth'
import type { Difficulty, Topic } from './clip'

export interface AdminUserSummary {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  role: UserRole
  xp: number
  coins: number
  streak: number
  attemptsCount: number
  ownedItemCount: number
  createdAt: string
  isGuest: boolean
}

export interface AdminClipInput {
  youtubeVideoId: string
  title: string
  sourceUrl?: string
  channelName: string
  thumbnailUrl?: string
  startTimeSec: number
  endTimeSec: number
  referenceText: string
  topic: Topic
  difficulty: Difficulty
}

export interface AdminDashboardStats {
  totalUsers: number
  totalAdmins: number
  totalClips: number
  totalAttempts: number
  totalCirculatingXp: number
  totalCirculatingCoins: number
}
