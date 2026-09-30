export type MiscueType = 'omission' | 'insertion' | 'mispronunciation'

export interface MiscueWord {
  word: string
  type?: MiscueType
  phoneticHint?: string
}

export interface AssessmentResult {
  accuracy: number
  fluency: number
  completeness: number
  prosody: number
  battleScore: number
  words: MiscueWord[]
}

export interface Attempt {
  id: string
  userId: string
  clipId: string
  result: AssessmentResult
  earnedXp: number
  earnedCoins: number
  createdAt: string
}
