export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type Topic =
  | 'Daily Life'
  | 'Work & Tech'
  | 'Movies & Culture'
  | 'Debate & Opinion'
  | 'Science & Nature'

export interface Clip {
  id: string
  youtubeVideoId: string
  title: string
  sourceUrl: string
  channelName: string
  thumbnailUrl: string
  startTimeSec: number
  endTimeSec: number
  durationSec: number
  referenceText: string
  topic: Topic
  difficulty: Difficulty
  locale: 'en-US'
}
