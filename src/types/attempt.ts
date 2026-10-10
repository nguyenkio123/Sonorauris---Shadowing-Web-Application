export type MiscueType = 'omission' | 'insertion' | 'mispronunciation'
export type SpeechAssessmentEngine =
  | 'azure'
  | 'azure-speech'
  | 'faster-whisper'
  | 'browser-dsp'
  | 'webaudio-dsp'

export interface MiscueWord {
  word: string
  type?: MiscueType
  phoneticHint?: string
  confidence?: number
  startSec?: number
  endSec?: number
}

export interface AssessmentResult {
  accuracy: number
  fluency: number
  completeness: number
  prosody: number
  battleScore: number
  words: MiscueWord[]
  engine?: SpeechAssessmentEngine
  recognizedText?: string
  spokenWpm?: number
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
