export type RewardType = 'XP' | 'COINS'
export type ReferenceType = 'SEED' | 'ATTEMPT' | 'BATTLE'

export interface RewardTransaction {
  id: string
  userId: string
  type: RewardType
  amount: number
  referenceType: ReferenceType
  referenceId: string
  createdAt: string
}
