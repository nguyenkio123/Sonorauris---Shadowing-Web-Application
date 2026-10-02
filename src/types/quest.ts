export type QuestType = 'SOLO_PRACTICE' | 'HIGH_SCORE' | 'BATTLE_MATCH'

export interface DailyQuest {
  id: string
  title: string
  description: string
  type: QuestType
  targetValue: number
  currentValue: number
  rewardXp: number
  rewardCoins: number
  completed: boolean
  claimed: boolean
}
