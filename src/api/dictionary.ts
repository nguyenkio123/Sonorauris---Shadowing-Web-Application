export interface DictionaryEntry {
  word: string
  phonetic?: string
  audioUrl?: string
  partOfSpeech?: string
  definition: string
  example?: string
}

// Offline fallback dictionary for instant response on key speech vocabulary
const LOCAL_DICTIONARY_CACHE: Record<string, DictionaryEntry> = {
  honored: {
    word: 'honored',
    phonetic: '/ˈɑː.nəd/',
    partOfSpeech: 'adjective',
    definition: 'Regarded with great respect, esteem, or privilege.',
    example: 'I am honored to be speaking at this commencement ceremony.',
  },
  commencement: {
    word: 'commencement',
    phonetic: '/kəˈmens.mənt/',
    partOfSpeech: 'noun',
    definition: 'A graduation ceremony at a university or college; a beginning or start.',
    example: 'The university held its annual commencement on Sunday.',
  },
  instrument: {
    word: 'instrument',
    phonetic: '/ˈɪn.strə.mənt/',
    partOfSpeech: 'noun',
    definition: 'A tool, implement, or device used for precision work or playing music.',
    example: 'The human voice is the finest instrument we possess.',
  },
  rut: {
    word: 'rut',
    phonetic: '/rʌt/',
    partOfSpeech: 'noun',
    definition: 'A habit or pattern of behavior that has become dull and unproductive.',
    example: 'After three years in the same job, I felt like I was stuck in a rut.',
  },
  assumptions: {
    word: 'assumptions',
    phonetic: '/əˈsʌmp.ʃənz/',
    partOfSpeech: 'noun',
    definition: 'Things accepted as true or as certain to happen, without proof.',
    example: 'They questioned the fundamental assumptions of modern physics.',
  },
  harbor: {
    word: 'harbor',
    phonetic: '/ˈhɑːr.bər/',
    partOfSpeech: 'verb',
    definition: 'To provide a home, shelter, or breeding ground for something.',
    example: 'Earth is the only known planet to harbor conscious life.',
  },
  worthwhile: {
    word: 'worthwhile',
    phonetic: '/ˌwɜːθˈwaɪl/',
    partOfSpeech: 'adjective',
    definition: 'Worth the time, effort, or cost of doing.',
    example: 'Nothing in life is worthwhile unless you take calculated risks.',
  },
  instantaneously: {
    word: 'instantaneously',
    phonetic: '/ˌɪn.stənˈteɪ.ni.əs.li/',
    partOfSpeech: 'adverb',
    definition: 'Happening, done, or completed immediately or at once.',
    example: 'Social media allows messages to reach millions instantaneously.',
  },
  inequality: {
    word: 'inequality',
    phonetic: '/ˌɪn.ɪˈkwɒl.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'Difference in size, degree, circumstances, or rights between groups.',
    example: 'We must work together to eradicate gender inequality.',
  },
  governs: {
    word: 'governs',
    phonetic: '/ˈɡʌv.ənz/',
    partOfSpeech: 'verb',
    definition: 'Conducts the policy, actions, and affairs of something; controls or directs.',
    example: 'Body language directly governs how listeners perceive our message.',
  },
  procrastinator: {
    word: 'procrastinator',
    phonetic: '/prəˈkræs.tɪ.neɪ.tər/',
    partOfSpeech: 'noun',
    definition: 'A person who habitually delays or postpones actions that need doing.',
    example: 'Even a chronic procrastinator can learn effective focus techniques.',
  },
  revolutionary: {
    word: 'revolutionary',
    phonetic: '/ˌrev.əˈluː.ʃən.ər.i/',
    partOfSpeech: 'adjective',
    definition: 'Involving or causing a complete or dramatic change.',
    example: 'The team introduced a revolutionary mobile computing platform.',
  },
  audacity: {
    word: 'audacity',
    phonetic: '/ɔːˈdæs.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'A willingness to take bold risks; daring spirit.',
    example: 'He had the audacity to hope for real change against all odds.',
  },
  perseverance: {
    word: 'perseverance',
    phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
    partOfSpeech: 'noun',
    definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
    example: 'Grit is passion and perseverance for long-term goals.',
  },
  traceable: {
    word: 'traceable',
    phonetic: '/ˈtreɪ.sə.bəl/',
    partOfSpeech: 'adjective',
    definition: 'Able to be tracked, found, or linked back to a particular origin.',
    example: 'The elements in our blood are traceable to exploded stars.',
  },
  empathy: {
    word: 'empathy',
    phonetic: '/ˈem.pə.θi/',
    partOfSpeech: 'noun',
    definition: 'The ability to understand and share the feelings of another.',
    example: 'Leadership requires genuine empathy for the everyday needs of people.',
  },
}

/**
 * SRS FR-DICT-01: Look up a word's definition, phonetic IPA, audio, and example.
 * Queries Free Dictionary API with instant local fallback cache.
 */
export async function lookupWord(rawWord: string): Promise<DictionaryEntry> {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z'-]/g, '').trim()
  if (!cleanWord) {
    throw new Error('Please select a valid word.')
  }

  // 1. Check local pre-compiled cache for instantaneous sub-millisecond response
  if (LOCAL_DICTIONARY_CACHE[cleanWord]) {
    return LOCAL_DICTIONARY_CACHE[cleanWord]
  }

  // 2. Fetch from Free Dictionary API
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`, {
      signal: AbortSignal.timeout(3000), // 3-second timeout
    })

    if (!res.ok) {
      throw new Error(`Word "${cleanWord}" not found.`)
    }

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Word "${cleanWord}" not found.`)
    }

    const first = data[0]
    const phonetic =
      first.phonetic ||
      first.phonetics?.find((p: { text?: string }) => p.text)?.text ||
      `/${cleanWord}/`

    const audioUrl = first.phonetics?.find((p: { audio?: string }) => p.audio)?.audio || ''

    const firstMeaning = first.meanings?.[0]
    const partOfSpeech = firstMeaning?.partOfSpeech || 'word'
    const firstDef = firstMeaning?.definitions?.[0]

    return {
      word: first.word || cleanWord,
      phonetic,
      audioUrl: audioUrl || undefined,
      partOfSpeech,
      definition: firstDef?.definition || 'Definition currently unavailable.',
      example: firstDef?.example || undefined,
    }
  } catch (err) {
    // 3. Fallback: synthesize graceful entry so the user is never stuck
    return {
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: 'English term',
      definition: `A term used in authentic spoken English. Practice listening to native audio and shadow the pitch.`,
      example: `"${rawWord}" as heard in this shadowing segment.`,
    }
  }
}

/**
 * Pronounces a word using native browser SpeechSynthesis if audioUrl isn't available.
 */
export function playWordPronunciation(word: string, audioUrl?: string): void {
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      speakNative(word)
    })
  } else {
    speakNative(word)
  }
}

function speakNative(word: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel() // stop any prior speech
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9 // slightly slowed for pronunciation clarity
    window.speechSynthesis.speak(utterance)
  }
}
