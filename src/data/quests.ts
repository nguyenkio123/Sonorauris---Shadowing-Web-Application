import type { DailyQuest } from '../types/quest'

export const DEFAULT_DAILY_QUESTS: Omit<DailyQuest, 'currentValue' | 'completed' | 'claimed'>[] = [
  {
    id: 'quest-warmup',
    title: 'Daily Shadowing Warmup',
    description: 'Complete at least 1 solo practice clip today.',
    type: 'SOLO_PRACTICE',
    targetValue: 1,
    rewardXp: 30,
    rewardCoins: 10,
  },
  {
    id: 'quest-high-score',
    title: 'Acoustic Precision',
    description: 'Achieve a Battle Score of 80 or higher on any attempt.',
    type: 'HIGH_SCORE',
    targetValue: 1,
    rewardXp: 40,
    rewardCoins: 15,
  },
  {
    id: 'quest-battle',
    title: 'Arena Gladiator',
    description: 'Participate in at least 1 live 1v1 battle match.',
    type: 'BATTLE_MATCH',
    targetValue: 1,
    rewardXp: 50,
    rewardCoins: 20,
  },
]
