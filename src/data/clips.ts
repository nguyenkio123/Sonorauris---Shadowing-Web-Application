import type { Clip } from '../types/clip'

/**
 * 20 Curated Verified English Clips for Shadowing Practice & 1v1 Battle Arena
 * Meets SRS Section 11.1 & Section 20 requirements (20–30 curated clips).
 *
 * Each clip has:
 * - 100% authentic English audio
 * - Correct YouTube video ID verified via youtube-transcript.ai
 * - Exact transcript sourced from YouTube's own captions (auto/manual)
 * - Second-precise startTimeSec and endTimeSec matching actual spoken content
 * - Balanced distribution across Topics and Difficulties
 *
 * VERIFICATION METHOD (2-step):
 *   1. YouTube ID verified by fetching full transcript from youtube-transcript.ai
 *   2. Transcript text extracted directly from the YouTube caption timestamps
 */
export const SAMPLE_CLIPS: Clip[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // CLIPS 1–5: Original clips, previously verified working
  // ═══════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 6: Brené Brown — The Power of Vulnerability
  // YT ID: iCvmsMzlF7o ✅ | Captions verified at [1:16]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-6',
    youtubeVideoId: 'iCvmsMzlF7o',
    title: 'The Power of Vulnerability',
    sourceUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 76,
    endTimeSec: 92,
    durationSec: 16,
    referenceText:
      "And maybe stories are just data with a soul. And maybe I'm just a storyteller. And so I said, you know what, why don't you just say I'm a researcher-storyteller.",
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 7: Carol Dweck — The Power of Believing You Can Improve
  // YT ID: _X0mgOOSpLU ✅ | Captions verified at [0:13]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-7',
    youtubeVideoId: '_X0mgOOSpLU',
    title: 'The Power of Believing You Can Improve',
    sourceUrl: 'https://www.youtube.com/watch?v=_X0mgOOSpLU',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 13,
    endTimeSec: 27,
    durationSec: 14,
    referenceText:
      "I heard about a high school in Chicago where students had to pass a certain number of courses to graduate, and if they didn't pass a course, they got the grade \"Not Yet.\" And I thought that was fantastic.",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIPS 8–10: Original clips, previously verified working
  // ═══════════════════════════════════════════════════════════════════════
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
      "Both brains have a Rational Decision-Maker in them, but the procrastinator's brain also has an Instant Gratification Monkey.",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 11: Dan Pink — The Puzzle of Motivation
  // YT ID: rrkrvAUbU9Y ✅ | Captions verified at [1:16]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-11',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'The Puzzle of Motivation',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 76,
    endTimeSec: 90,
    durationSec: 14,
    referenceText:
      "I want to make a hard-headed, evidence-based, dare I say lawyerly case, for rethinking how we run our businesses.",
    topic: 'Work & Tech',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 12: Chimamanda Ngozi Adichie — The Danger of a Single Story
  // YT ID: D9Ihs241zeg ✅ | Captions verified at [0:12]
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
    endTimeSec: 27,
    durationSec: 15,
    referenceText:
      "I'm a storyteller. And I would like to tell you a few personal stories about what I like to call the danger of the single story. I grew up on a university campus in eastern Nigeria.",
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 13: Shawn Achor — The Happy Secret to Better Work
  // YT ID: fLJsdqxnZb0 ✅ | Captions verified at [0:15]
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
    endTimeSec: 30,
    durationSec: 15,
    referenceText:
      "When I was seven years old and my sister was just five years old, we were playing on top of a bunk bed. I was two years older than my sister at the time -- I mean, I'm two years older than her now.",
    topic: 'Daily Life',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 14: Original clip, previously verified working
  // ═══════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 15: Elizabeth Gilbert — Your Elusive Creative Genius
  // YT ID: 86x-u-tz0MA ✅ | Captions verified at [0:13]
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
    endTimeSec: 28,
    durationSec: 15,
    referenceText:
      "I am a writer. Writing books is my profession but it's more than that, of course. It is also my great lifelong love and fascination.",
    topic: 'Movies & Culture',
    difficulty: 'Intermediate',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 16: Brené Brown — Connection and Worthiness
  // YT ID: iCvmsMzlF7o ✅ | Captions verified at [3:19]
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
    endTimeSec: 215,
    durationSec: 16,
    referenceText:
      "Connection is why we're here. It's what gives purpose and meaning to our lives. This is what it's all about.",
    topic: 'Debate & Opinion',
    difficulty: 'Beginner',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 17: Dan Pink — Autonomy, Mastery and Purpose
  // YT ID: rrkrvAUbU9Y ✅ | Captions verified at [12:11]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-17',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'Autonomy, Mastery and Purpose',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 731,
    endTimeSec: 749,
    durationSec: 18,
    referenceText:
      "And to my mind, that new operating system for our businesses revolves around three elements: autonomy, mastery and purpose. Autonomy: the urge to direct our own lives.",
    topic: 'Work & Tech',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 18: Carol Dweck — Growth Mindset vs Fixed Mindset
  // YT ID: _X0mgOOSpLU ✅ | Captions verified at [1:14]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-18',
    youtubeVideoId: '_X0mgOOSpLU',
    title: 'The Tyranny of Now vs The Power of Yet',
    sourceUrl: 'https://www.youtube.com/watch?v=_X0mgOOSpLU',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 74,
    endTimeSec: 92,
    durationSec: 18,
    referenceText:
      'They understood that their abilities could be developed. They had what I call a growth mindset. But other students felt it was tragic, catastrophic. From their more fixed mindset perspective, their intelligence had been up for judgment, and they failed.',
    topic: 'Science & Nature',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 19: Chimamanda — The Single Story Creates Stereotypes
  // YT ID: D9Ihs241zeg ✅ | Captions verified at [12:48]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-19',
    youtubeVideoId: 'D9Ihs241zeg',
    title: 'The Single Story Creates Stereotypes',
    sourceUrl: 'https://www.youtube.com/watch?v=D9Ihs241zeg',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 768,
    endTimeSec: 786,
    durationSec: 18,
    referenceText:
      'The single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete. They make one story become the only story.',
    topic: 'Movies & Culture',
    difficulty: 'Advanced',
    locale: 'en-US',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLIP 20: Dan Pink — What Science Knows vs What Business Does
  // YT ID: rrkrvAUbU9Y ✅ | Captions verified at [4:53]
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'clip-20',
    youtubeVideoId: 'rrkrvAUbU9Y',
    title: 'What Science Knows About Motivation',
    sourceUrl: 'https://www.youtube.com/watch?v=rrkrvAUbU9Y',
    channelName: 'TED',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    startTimeSec: 293,
    endTimeSec: 310,
    durationSec: 17,
    referenceText:
      "If you look at the science, there is a mismatch between what science knows and what business does.",
    topic: 'Work & Tech',
    difficulty: 'Advanced',
    locale: 'en-US',
  },
]
