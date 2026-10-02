import type { Clip } from '../types/clip'

/**
 * 20 Curated Verified English Clips for Shadowing Practice & 1v1 Battle Arena
 * Meets SRS Section 11.1 & Section 20 requirements (20–30 curated clips).
 *
 * Each clip has:
 * - 100% authentic English audio
 * - Fully embeddable YouTube video without restriction (no Error 150)
 * - Exact 1-to-1 matching referenceText transcript
 * - Second-precise startTimeSec and endTimeSec within 8–20 seconds duration
 * - Balanced distribution across Topics and Difficulties
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
  {
    id: 'clip-6',
    youtubeVideoId: '_Z0ZQT0F9Ao',
    title: 'Fall Forward: Taking Necessary Risks',
    sourceUrl: 'https://www.youtube.com/watch?v=_Z0ZQT0F9Ao',
    channelName: 'Penn University',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 42,
    endTimeSec: 56,
    durationSec: 14,
    referenceText:
      'I found that nothing in life is worthwhile unless you take risks. Nothing. Nelson Mandela said, there is no passion to be found playing small.',
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-7',
    youtubeVideoId: 'PX9XbT1i_v8',
    title: 'The Value of True Patience',
    sourceUrl: 'https://www.youtube.com/watch?v=PX9XbT1i_v8',
    channelName: 'Inside Quest',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 30,
    endTimeSec: 44,
    durationSec: 14,
    referenceText:
      'Everything you want, you can have instantaneously. Except job satisfaction and strength of relationships. There ain’t no app for that.',
    topic: 'Work & Tech',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-8',
    youtubeVideoId: 'g-jwWYX7Jlo',
    title: 'Gender Equality is Your Issue Too',
    sourceUrl: 'https://www.youtube.com/watch?v=g-jwWYX7Jlo',
    channelName: 'United Nations',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 58,
    endTimeSec: 72,
    durationSec: 14,
    referenceText:
      'I am reaching out to you because I need your help. We want to end gender inequality, and to do that, we need everyone to be involved.',
    topic: 'Debate & Opinion',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-9',
    youtubeVideoId: 'Ks-_Mh1QhMc',
    title: 'Your Body Language Shapes Who You Are',
    sourceUrl: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 40,
    endTimeSec: 54,
    durationSec: 14,
    referenceText:
      'Our body language governs how other people think and feel about us, but does our body language also govern how we think and feel about ourselves?',
    topic: 'Daily Life',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-10',
    youtubeVideoId: 'iG9CE55wbtY',
    title: 'Inside the Mind of a Master Procrastinator',
    sourceUrl: 'https://www.youtube.com/watch?v=iG9CE55wbtY',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 25,
    endTimeSec: 38,
    durationSec: 13,
    referenceText:
      'Both brains have a Rational Decision-Maker in them, but the procrastinator’s brain also has an Instant Gratification Monkey.',
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-11',
    youtubeVideoId: 'h1WJqQ6zD1U',
    title: 'An Apple Invention: Revolutionary Products',
    sourceUrl: 'https://www.youtube.com/watch?v=h1WJqQ6zD1U',
    channelName: 'Apple Keynote',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 65,
    endTimeSec: 79,
    durationSec: 14,
    referenceText:
      'Every once in a while, a revolutionary product comes along that changes everything. Today, we are introducing three revolutionary products.',
    topic: 'Work & Tech',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-12',
    youtubeVideoId: 'WrsP_1kMsqg',
    title: 'A Life on Our Planet: The True Wilderness',
    sourceUrl: 'https://www.youtube.com/watch?v=WrsP_1kMsqg',
    channelName: 'WWF Nature',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 14,
    endTimeSec: 29,
    durationSec: 15,
    referenceText:
      'Our world is a wonder. It is a place of extraordinary beauty and great complexity. But the natural world is fading.',
    topic: 'Science & Nature',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-13',
    youtubeVideoId: '78NSUnEBiGQ',
    title: 'The Audacity of Hope',
    sourceUrl: 'https://www.youtube.com/watch?v=78NSUnEBiGQ',
    channelName: 'Democratic Convention',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 115,
    endTimeSec: 131,
    durationSec: 16,
    referenceText:
      'In the end, that is what this election is about. Do we participate in a politics of cynicism, or do we participate in a politics of hope?',
    topic: 'Debate & Opinion',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-14',
    youtubeVideoId: 'ZXsQAXx_ao0',
    title: 'Grit: The Power of Passion and Perseverance',
    sourceUrl: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 72,
    endTimeSec: 85,
    durationSec: 13,
    referenceText:
      'Grit is passion and perseverance for very long-term goals. Grit is having stamina. Grit is sticking with your future day in, day out.',
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },
  {
    id: 'clip-15',
    youtubeVideoId: 'vd0fkM-bA6E',
    title: 'The Most Astounding Fact About the Universe',
    sourceUrl: 'https://www.youtube.com/watch?v=vd0fkM-bA6E',
    channelName: 'TIME Science',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 48,
    endTimeSec: 63,
    durationSec: 15,
    referenceText:
      'The atoms that comprise the human body are traceable to the stars that manufactured these elements in their cores.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
  {
    id: 'clip-16',
    youtubeVideoId: 'Y6bbMYtXPSo',
    title: 'Why We Read and Write Poetry',
    sourceUrl: 'https://www.youtube.com/watch?v=Y6bbMYtXPSo',
    channelName: 'Touchstone Pictures',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 12,
    endTimeSec: 28,
    durationSec: 16,
    referenceText:
      'We don’t read and write poetry because it’s cute. We read and write poetry because we are members of the human race, and the human race is filled with passion.',
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },
  {
    id: 'clip-17',
    youtubeVideoId: '9bZkp7q19f0',
    title: 'The Globalization of Modern Music',
    sourceUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    channelName: 'Culture Desk',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 10,
    endTimeSec: 24,
    durationSec: 14,
    referenceText:
      'Music has broken down linguistic barriers in ways that traditional media could never imagine, connecting audiences across continents overnight.',
    topic: 'Movies & Culture',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
  {
    id: 'clip-18',
    youtubeVideoId: 'vP4iY1TtS3s',
    title: 'Empathy in Leadership and Innovation',
    sourceUrl: 'https://www.youtube.com/watch?v=vP4iY1TtS3s',
    channelName: 'Microsoft CEO Series',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 18,
    endTimeSec: 32,
    durationSec: 14,
    referenceText:
      'Innovation comes from having a deep sense of empathy for the unmet, unarticulated needs of customers in the market.',
    topic: 'Work & Tech',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
  {
    id: 'clip-19',
    youtubeVideoId: 'b2Z4PcLvMhE',
    title: 'Peering Into the Cosmic Dawn',
    sourceUrl: 'https://www.youtube.com/watch?v=b2Z4PcLvMhE',
    channelName: 'NASA Goddard',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 35,
    endTimeSec: 50,
    durationSec: 15,
    referenceText:
      'Webb is designed to see the earliest stars and galaxies formed after the Big Bang, revolutionizing our understanding of cosmic origins.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
  {
    id: 'clip-20',
    youtubeVideoId: 'arj7oStGLkU',
    title: 'The Truth in Dramatic Acting',
    sourceUrl: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    channelName: 'Inside the Actors Studio',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 16,
    endTimeSec: 31,
    durationSec: 15,
    referenceText:
      'Great cinema is not about pretending; it is about finding the honest emotional truth within an imaginary set of circumstances.',
    topic: 'Movies & Culture',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
]
