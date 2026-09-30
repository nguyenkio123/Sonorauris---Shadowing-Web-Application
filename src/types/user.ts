export interface UserProfile {
  id: string
  displayName: string
  avatarUrl: string
  xp: number
  coins: number
  streak: number
  lastPracticeDate: string | null
}
