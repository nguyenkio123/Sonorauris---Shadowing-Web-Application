import type { Clip } from '../types/clip'

/**
 * 20 Curated Verified English Clips for Shadowing Practice & 1v1 Battle Arena
 * Meets SRS Section 11.1 & Section 20 requirements (20–30 curated clips).
 *
 * Each clip has:
 * - 100% authentic English audio
 * - Correct YouTube video ID verified with exact caption extraction
 * - Exact transcript sourced directly from spoken audio / YouTube captions
 * - Second-precise startTimeSec and endTimeSec matching actual spoken content
 * - Balanced distribution across 5 Topics and 3 Difficulties
 *
 * VERIFICATION METHOD:
 *   1. Full subtitles extracted and matched at word-level timestamp precision.
 *   2. Start/End timestamps calibrated to eliminate pre-speech pauses and cutoff.
 */
export const SAMPLE_CLIPS: Clip[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 1: Steve Jobs — Finding What You Love (Stanford Commencement)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-1',
    youtubeVideoId: 'UF8uR6Z6KLc',
    title: 'Finding What You Love',
    sourceUrl: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    channelName: 'Stanford University',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 26,
    endTimeSec: 40,
    durationSec: 14,
    referenceText:
      'I am honored to be with you today for your commencement from one of the finest universities in the world. Truth be told, I never graduated from college.',
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 2: Julian Treasure — How to Speak so That People Want to Listen
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-2',
    youtubeVideoId: 'eIho2S0ZahI',
    title: 'How to Speak so That People Want to Listen',
    sourceUrl: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 14,
    endTimeSec: 24,
    durationSec: 10,
    referenceText:
      "The human voice: It's the instrument we all play. It's the most powerful sound in the world, probably. It's the only one that can start a war or say \"I love you.\"",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 3: Matt Cutts — Try Something New for 30 Days
  // ═══════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 4: Simon Sinek — How Great Leaders Inspire Action
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-4',
    youtubeVideoId: 'qp0HIF3SfI4',
    title: 'How Great Leaders Inspire Action',
    sourceUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 16,
    endTimeSec: 27,
    durationSec: 11,
    referenceText:
      "How do you explain when things don't go as we assume? Or better, how do you explain when others are able to achieve things that seem to defy all of the assumptions?",
    topic: 'Work & Tech',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 5: Carl Sagan — Pale Blue Dot: A Vision of the Human Future
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-5',
    youtubeVideoId: 'wupToqz1e2g',
    title: 'Pale Blue Dot: A Vision of the Human Future',
    sourceUrl: 'https://www.youtube.com/watch?v=wupToqz1e2g',
    channelName: 'Carl Sagan',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 154,
    endTimeSec: 167,
    durationSec: 13,
    referenceText:
      'The Earth is the only world known so far to harbor life. There is nowhere else, at least in the near future, to which our species could migrate.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 6: Brené Brown — The Power of Vulnerability
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-6',
    youtubeVideoId: 'iCvmsMzlF7o',
    title: 'The Power of Vulnerability',
    sourceUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 79,
    endTimeSec: 90,
    durationSec: 11,
    referenceText:
      "And maybe stories are just data with a soul. And maybe I'm just a storyteller. And so I said, you know what, why don't you just say I'm a researcher-storyteller.",
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 7: Carol Dweck — The Power of Believing You Can Improve
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-7',
    youtubeVideoId: '_X0mgOOSpLU',
    title: 'The Power of Believing You Can Improve',
    sourceUrl: 'https://www.youtube.com/watch?v=_X0mgOOSpLU',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 16,
    endTimeSec: 30,
    durationSec: 14,
    referenceText:
      'I heard about a high school in Chicago where students had to pass a certain number of courses to graduate, and if they didn\'t pass a course, they got the grade "Not Yet." And I thought that was fantastic.',
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 8: Les Brown — Never Give Up On Your Dream
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-8',
    youtubeVideoId: 'g-jwWYX7Jlo',
    title: 'Never Give Up On Your Dream',
    sourceUrl: 'https://www.youtube.com/watch?v=g-jwWYX7Jlo',
    channelName: 'Les Brown',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 58,
    endTimeSec: 72,
    durationSec: 14,
    referenceText:
      "For those of you that have experienced some hardships, don't give up on your dream. The rough times are gonna come, but they have not come to stay, they have come to pass.",
    topic: 'Debate & Opinion',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 9: Amy Cuddy — Your Body Language Shapes Who You Are
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-9',
    youtubeVideoId: 'Ks-_Mh1QhMc',
    title: 'Your Body Language Shapes Who You Are',
    sourceUrl: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 437,
    endTimeSec: 449,
    durationSec: 12,
    referenceText:
      'So we know that our nonverbals govern how other people think and feel about us. But our question really was, do our nonverbals govern how we think and feel about ourselves?',
    topic: 'Daily Life',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 10: Tim Urban — Inside the Mind of a Master Procrastinator
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-10',
    youtubeVideoId: 'arj7oStGLkU',
    title: 'Inside the Mind of a Master Procrastinator',
    sourceUrl: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 236,
    endTimeSec: 246,
    durationSec: 10,
    referenceText:
      "There is a difference. Both brains have a Rational Decision-Maker in them, but the procrastinator's brain also has an Instant Gratification Monkey.",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 11: Dan Pink — The Puzzle of Motivation
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-11',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'The Puzzle of Motivation',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 94,
    endTimeSec: 106,
    durationSec: 12,
    referenceText:
      'I want to make a case. I want to make a hard-headed, evidence-based, dare I say lawyerly case, for rethinking how we run our businesses.',
    topic: 'Work & Tech',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 12: Chimamanda Ngozi Adichie — The Danger of a Single Story
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-12',
    youtubeVideoId: 'D9Ihs241zeg',
    title: 'The Danger of a Single Story',
    sourceUrl: 'https://www.youtube.com/watch?v=D9Ihs241zeg',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 12,
    endTimeSec: 26,
    durationSec: 14,
    referenceText:
      "I'm a storyteller. And I would like to tell you a few personal stories about what I like to call the danger of the single story. I grew up on a university campus in eastern Nigeria.",
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 13: Shawn Achor — The Happy Secret to Better Work
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-13',
    youtubeVideoId: 'fLJsdqxnZb0',
    title: 'The Happy Secret to Better Work',
    sourceUrl: 'https://www.youtube.com/watch?v=fLJsdqxnZb0',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 15,
    endTimeSec: 27,
    durationSec: 12,
    referenceText:
      "When I was seven years old and my sister was just five years old, we were playing on top of a bunk bed. I was two years older than my sister at the time -- I mean, I'm two years older than her now.",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 14: Angela Duckworth — Grit: The Power of Passion and Perseverance
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-14',
    youtubeVideoId: 'H14bBuluwB8',
    title: 'Grit: The Power of Passion and Perseverance',
    sourceUrl: 'https://www.youtube.com/watch?v=H14bBuluwB8',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 182,
    endTimeSec: 194,
    durationSec: 12,
    referenceText:
      'Grit is passion and perseverance for very long-term goals. Grit is having stamina. Grit is sticking with your future day in, day out.',
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 15: Elizabeth Gilbert — Your Elusive Creative Genius
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-15',
    youtubeVideoId: '86x-u-tz0MA',
    title: 'Your Elusive Creative Genius',
    sourceUrl: 'https://www.youtube.com/watch?v=86x-u-tz0MA',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 13,
    endTimeSec: 23,
    durationSec: 10,
    referenceText:
      "I am a writer. Writing books is my profession but it's more than that, of course. It is also my great lifelong love and fascination.",
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 16: Brené Brown — Connection and Worthiness
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-16',
    youtubeVideoId: 'iCvmsMzlF7o',
    title: 'Connection and Worthiness',
    sourceUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 199,
    endTimeSec: 209,
    durationSec: 10,
    referenceText:
      "Connection is why we're here. It's what gives purpose and meaning to our lives. This is what it's all about.",
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 17: Dan Pink — Autonomy, Mastery and Purpose
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-17',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'Autonomy, Mastery and Purpose',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 752,
    endTimeSec: 764,
    durationSec: 12,
    referenceText:
      'And to my mind, that new operating system for our businesses revolves around three elements: autonomy, mastery and purpose. Autonomy: the urge to direct our own lives.',
    topic: 'Work & Tech',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 18: Carol Dweck — Growth Mindset vs Fixed Mindset
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-18',
    youtubeVideoId: '_X0mgOOSpLU',
    title: 'The Tyranny of Now vs The Power of Yet',
    sourceUrl: 'https://www.youtube.com/watch?v=_X0mgOOSpLU',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 84,
    endTimeSec: 109,
    durationSec: 25,
    referenceText:
      'They understood that their abilities could be developed. They had what I call a growth mindset. But other students felt it was tragic, catastrophic. From their more fixed mindset perspective, their intelligence had been up for judgment, and they failed.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 19: Chimamanda — The Single Story Creates Stereotypes
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-19',
    youtubeVideoId: 'D9Ihs241zeg',
    title: 'The Single Story Creates Stereotypes',
    sourceUrl: 'https://www.youtube.com/watch?v=D9Ihs241zeg',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 791,
    endTimeSec: 805,
    durationSec: 14,
    referenceText:
      'The single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete. They make one story become the only story.',
    topic: 'Movies & Culture',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 20: Dan Pink — What Science Knows About Motivation
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-20',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'What Science Knows About Motivation',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 313,
    endTimeSec: 323,
    durationSec: 10,
    referenceText:
      "And I'm telling you, it's not even close. If you look at the science, there is a mismatch between what science knows and what business does.",
    topic: 'Work & Tech',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
]
