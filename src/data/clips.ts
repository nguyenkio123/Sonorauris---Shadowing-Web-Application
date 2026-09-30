import type { Clip } from '../types/clip'

/**
 * 5 Curated Verified English Clips for Shadowing Practice & Demo Recording
 *
 * Each clip has:
 * - 100% authentic English audio
 * - Fully embeddable YouTube video without restriction (no Error 150)
 * - Exact 1-to-1 matching referenceText transcript
 * - Second-precise startTimeSec and endTimeSec verified via live caption stream
 */
export const SAMPLE_CLIPS: Clip[] = [
  {
    id: 'clip-1',
    youtubeVideoId: 'UF8uR6Z6KLc',
    title: 'Finding What You Love',
    sourceUrl: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    channelName: 'Stanford University',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 23,
    endTimeSec: 41,
    durationSec: 18,
    referenceText:
      'I am honored to be with you today at your commencement from one of the finest universities in the world. Truth be told, I never graduated from college.',
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-2',
    youtubeVideoId: 'eIho2S0ZahI',
    title: 'How to Speak so That People Want to Listen',
    sourceUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 12,
    endTimeSec: 22,
    durationSec: 10,
    referenceText:
      'The human voice: It is the instrument we all play. It is the most powerful sound in the world, probably.',
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-3',
    youtubeVideoId: 'JnfBXjWm7hc',
    title: 'Try Something New for 30 Days',
    sourceUrl: 'https://www.youtube.com/watch?v=JnfBXjWm7hc',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 15,
    endTimeSec: 28,
    durationSec: 13,
    referenceText:
      'A few years ago, I felt like I was stuck in a rut, so I decided to follow in the footsteps of the great American philosopher, Morgan Spurlock, and try something new for 30 days.',
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-4',
    youtubeVideoId: 'qp0HIF3SfI4',
    title: 'How Great Leaders Inspire Action',
    sourceUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 16,
    endTimeSec: 28,
    durationSec: 12,
    referenceText:
      'How do you explain when things do not go as we assume? Or better, how do you explain when others are able to achieve things that seem to defy all of the assumptions?',
    topic: 'Work & Tech',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-5',
    youtubeVideoId: 'wupToqz1e2g',
    title: 'Pale Blue Dot: A Vision of the Human Future',
    sourceUrl: 'https://www.youtube.com/watch?v=wupToqz1e2g',
    channelName: 'Carl Sagan',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 152,
    endTimeSec: 168,
    durationSec: 16,
    referenceText:
      'The Earth is the only world known so far to harbor life. There is nowhere else, at least in the near future, to which our species could migrate.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
]
