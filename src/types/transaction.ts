export type RewardType = 'XP' | 'COINS'
export type ReferenceType = 'SEED' | 'ATTEMPT' | 'BATTLE' | 'SHOP' | 'STREAK_RESTORE' | 'QUEST'

export interface RewardTransaction {
  id: string
  userId: string
  type: RewardType
  amount: number
  referenceType: ReferenceType
  referenceId: string
  createdAt: string
}
