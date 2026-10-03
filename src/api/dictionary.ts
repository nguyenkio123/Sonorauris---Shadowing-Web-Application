export interface DictionaryEntry {
  word: string
  phonetic?: string
  audioUrl?: string
  partOfSpeech?: string
  definition: string
  example?: string
}

// In-memory runtime cache across the application session
const RUNTIME_CACHE = new Map<string, DictionaryEntry>()

// Pre-compiled vocabulary & grammatical functional words for instantaneous 0ms response
const LOCAL_DICTIONARY_CACHE: Record<string, DictionaryEntry> = {
  // Common transcript functional & speech words
  the: {
    word: 'the',
    phonetic: '/ðə/',
    partOfSpeech: 'definite article',
    definition: 'Denoting one or more people or things already mentioned or assumed to be common knowledge.',
    example: 'The finest instrument we possess.',
  },
  of: {
    word: 'of',
    phonetic: '/əv/',
    partOfSpeech: 'preposition',
    definition: 'Expressing the relationship between a part and a whole, origin, or belonging.',
    example: 'One of the greatest speeches in modern history.',
  },
  in: {
    word: 'in',
    phonetic: '/ɪn/',
    partOfSpeech: 'preposition',
    definition: 'Expressing the situation of something that is enclosed or situated within something else.',
    example: 'Inspiration for spoken English rhythm.',
  },
  to: {
    word: 'to',
    phonetic: '/tuː/',
    partOfSpeech: 'preposition',
    definition: 'Expressing motion in the direction of, or indicating the destination/purpose of an action.',
    example: 'I am honored to be with you today.',
  },
  and: {
    word: 'and',
    phonetic: '/ænd/',
    partOfSpeech: 'conjunction',
    definition: 'Used to connect words of the same part of speech, clauses, or sentences.',
    example: 'Imitate native speaker intonation and pauses.',
  },
  is: {
    word: 'is',
    phonetic: '/ɪz/',
    partOfSpeech: 'verb',
    definition: 'Third person singular present tense of be; exists or possesses a particular quality.',
    example: 'The human voice is the finest instrument.',
  },
  are: {
    word: 'are',
    phonetic: '/ɑːr/',
    partOfSpeech: 'verb',
    definition: 'Second person singular and all plural present tense of be.',
    example: 'The elements in our blood are traceable to exploded stars.',
  },
  was: {
    word: 'was',
    phonetic: '/wɒz/',
    partOfSpeech: 'verb',
    definition: 'First and third person singular past tense of be.',
    example: 'It was the best of times.',
  },
  you: {
    word: 'you',
    phonetic: '/juː/',
    partOfSpeech: 'pronoun',
    definition: 'Used to refer to the person or people that the speaker is addressing.',
    example: 'I am honored to be with you today.',
  },
  your: {
    word: 'your',
    phonetic: '/jɔːr/',
    partOfSpeech: 'determiner',
    definition: 'Belonging to or associated with the person or people that the speaker is addressing.',
    example: 'At your commencement from Stanford University.',
  },
  with: {
    word: 'with',
    phonetic: '/wɪð/',
    partOfSpeech: 'preposition',
    definition: 'Accompanied by another person or thing; in the company of.',
    example: 'To be with you today.',
  },
  today: {
    word: 'today',
    phonetic: '/təˈdeɪ/',
    partOfSpeech: 'noun / adverb',
    definition: 'On or in the course of the present day; at the present period of time.',
    example: 'I am honored to be with you today.',
  },
  world: {
    word: 'world',
    phonetic: '/wɜːld/',
    partOfSpeech: 'noun',
    definition: 'The earth, together with all of its countries and peoples; human existence in general.',
    example: 'One of the finest universities in the world.',
  },
  university: {
    word: 'university',
    phonetic: '/ˌjuː.nɪˈvɜː.sə.ti/',
    partOfSpeech: 'noun',
    definition: 'A high-level educational institution where students study for degrees and academic research is done.',
    example: 'He graduated from Stanford University.',
  },
  universities: {
    word: 'universities',
    phonetic: '/ˌjuː.nɪˈvɜː.sə.tiz/',
    partOfSpeech: 'noun (plural)',
    definition: 'Plural of university: high-level institutions of higher education and academic research.',
    example: 'One of the finest universities in the world.',
  },
  finest: {
    word: 'finest',
    phonetic: '/ˈfaɪ.nɪst/',
    partOfSpeech: 'adjective (superlative)',
    definition: 'Superlative of fine: of the highest or most superior quality, skill, or beauty.',
    example: 'The human voice is the finest instrument we all play.',
  },
  fine: {
    word: 'fine',
    phonetic: '/faɪn/',
    partOfSpeech: 'adjective',
    definition: 'Of superior or very high quality, excellence, or delicacy.',
    example: 'A fine example of classical rhetoric.',
  },
  speech: {
    word: 'speech',
    phonetic: '/spiːtʃ/',
    partOfSpeech: 'noun',
    definition: 'The expression of or the ability to express thoughts and feelings by articulate sounds; a formal address.',
    example: 'Body language directly governs how listeners receive your speech.',
  },
  speaking: {
    word: 'speaking',
    phonetic: '/ˈspiː.kɪŋ/',
    partOfSpeech: 'noun / adjective',
    definition: 'The action of conveying meaning through spoken language; used in or related to speech.',
    example: 'Imitate native speaker cadence and speaking rhythm.',
  },
  speaker: {
    word: 'speaker',
    phonetic: '/ˈspiː.kər/',
    partOfSpeech: 'noun',
    definition: 'A person who speaks, delivers a formal address, or uses a specific language.',
    example: 'Listen closely to the native speaker before shadowing.',
  },
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
 * Generates lemmatized base candidate words for morphological suffixes.
 * e.g., 'universities' -> ['universities', 'university']
 *       'finest'       -> ['finest', 'fine']
 *       'speaking'     -> ['speaking', 'speak']
 */
function generateLemmatizedCandidates(word: string): string[] {
  const list: string[] = [word]

  if (word.endsWith("'s")) {
    list.push(word.slice(0, -2))
  }
  if (word.endsWith('ies') && word.length > 4) {
    list.push(word.slice(0, -3) + 'y')
  }
  if (word.endsWith('es') && word.length > 4) {
    list.push(word.slice(0, -2))
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    list.push(word.slice(0, -1))
  }
  if (word.endsWith('ed') && word.length > 4) {
    list.push(word.slice(0, -2))
    list.push(word.slice(0, -1))
  }
  if (word.endsWith('ing') && word.length > 5) {
    list.push(word.slice(0, -3))
    list.push(word.slice(0, -3) + 'e')
  }
  if (word.endsWith('est') && word.length > 5) {
    list.push(word.slice(0, -3))
    list.push(word.slice(0, -3) + 'e')
  }
  if (word.endsWith('er') && word.length > 4) {
    list.push(word.slice(0, -2))
    list.push(word.slice(0, -2) + 'e')
  }
  if (word.endsWith('ly') && word.length > 4) {
    list.push(word.slice(0, -2))
  }

  return Array.from(new Set(list))
}

/**
 * Provider 1: Free Dictionary API (rich with audio, IPA, examples)
 */
async function fetchFromFreeDictionary(term: string): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const first = data[0]
    const phonetic =
      first.phonetic ||
      first.phonetics?.find((p: { text?: string }) => p.text)?.text ||
      `/${term}/`

    const audioUrl = first.phonetics?.find((p: { audio?: string }) => Boolean(p.audio))?.audio || undefined
    const firstMeaning = first.meanings?.[0]
    const partOfSpeech = firstMeaning?.partOfSpeech || 'word'
    const firstDef = firstMeaning?.definitions?.[0]

    if (!firstDef?.definition) return null

    return {
      word: first.word || term,
      phonetic,
      audioUrl,
      partOfSpeech,
      definition: firstDef.definition,
      example: firstDef.example || undefined,
    }
  } catch {
    return null
  }
}

/**
 * Provider 2: Datamuse API (Princeton WordNet dictionary - ultra-fast, robust, 100% free)
 */
async function fetchFromDatamuse(term: string): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(term)}&md=dp&max=1`,
      { signal: AbortSignal.timeout(2500) }
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0 || !data[0].defs || data[0].defs.length === 0) {
      return null
    }

    const firstItem = data[0]
    const rawDef = firstItem.defs[0] as string
    const [posTag, defText] = rawDef.split('\t')

    const posMap: Record<string, string> = {
      n: 'noun',
      v: 'verb',
      adj: 'adjective',
      adv: 'adverb',
      u: 'interjection',
    }

    return {
      word: firstItem.word || term,
      phonetic: `/${term}/`,
      partOfSpeech: posMap[posTag] || posTag || 'term',
      definition: defText?.trim() || 'English vocabulary term.',
    }
  } catch {
    return null
  }
}

/**
 * Provider 3: Wiktionary REST API (Wikimedia Foundation - comprehensive dictionary encyclopedia)
 */
async function fetchFromWiktionary(term: string): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}`,
      { signal: AbortSignal.timeout(2500) }
    )
    if (!res.ok) return null

    const data = await res.json()
    const firstSection = data.en?.[0]
    const firstDef = firstSection?.definitions?.[0]

    if (!firstDef?.definition) return null

    // Strip HTML markup returned by Wiktionary
    const cleanDef = firstDef.definition.replace(/<[^>]*>/g, '').trim()
    if (!cleanDef) return null

    return {
      word: term,
      phonetic: `/${term}/`,
      partOfSpeech: firstSection.partOfSpeech || 'term',
      definition: cleanDef,
    }
  } catch {
    return null
  }
}

/**
 * SRS FR-DICT-01: Look up a word's authentic definition, phonetic IPA, native audio, and example.
 * Multi-layer architecture:
 * 1. Instant Cache (Local pre-compiled + Session Memory) -> 0ms
 * 2. Morphological Lemmatization (base form recovery)
 * 3. Multi-Provider Cascade: Free Dictionary -> Datamuse WordNet -> Wiktionary REST
 */
export async function lookupWord(rawWord: string): Promise<DictionaryEntry> {
  const cleanWord = rawWord.toLowerCase().replace(/[^a-z'-]/g, '').trim()
  if (!cleanWord) {
    throw new Error('Please select a valid word.')
  }

  // 1. Check local pre-compiled vocabulary cache (0ms)
  if (LOCAL_DICTIONARY_CACHE[cleanWord]) {
    return LOCAL_DICTIONARY_CACHE[cleanWord]
  }

  // 2. Check session memory cache (0ms)
  if (RUNTIME_CACHE.has(cleanWord)) {
    return RUNTIME_CACHE.get(cleanWord)!
  }

  // 3. Generate candidate base words
  const candidates = generateLemmatizedCandidates(cleanWord)

  // 4. Try candidate words across our multi-provider cascade
  for (const candidate of candidates) {
    // Check cache for candidate
    if (LOCAL_DICTIONARY_CACHE[candidate]) {
      const match = LOCAL_DICTIONARY_CACHE[candidate]
      RUNTIME_CACHE.set(cleanWord, match)
      return match
    }
    if (RUNTIME_CACHE.has(candidate)) {
      const match = RUNTIME_CACHE.get(candidate)!
      RUNTIME_CACHE.set(cleanWord, match)
      return match
    }

    // Provider 1: Free Dictionary API
    const freeDictResult = await fetchFromFreeDictionary(candidate)
    if (freeDictResult) {
      if (candidate !== cleanWord) {
        freeDictResult.example = `"${rawWord}" as heard in this shadowing segment.`
      }
      RUNTIME_CACHE.set(cleanWord, freeDictResult)
      RUNTIME_CACHE.set(candidate, freeDictResult)
      return freeDictResult
    }

    // Provider 2: Datamuse API (WordNet)
    const datamuseResult = await fetchFromDatamuse(candidate)
    if (datamuseResult) {
      datamuseResult.example = `"${rawWord}" as used in authentic English.`
      RUNTIME_CACHE.set(cleanWord, datamuseResult)
      RUNTIME_CACHE.set(candidate, datamuseResult)
      return datamuseResult
    }

    // Provider 3: Wiktionary API
    const wiktionaryResult = await fetchFromWiktionary(candidate)
    if (wiktionaryResult) {
      wiktionaryResult.example = `"${rawWord}" as heard in this shadowing segment.`
      RUNTIME_CACHE.set(cleanWord, wiktionaryResult)
      RUNTIME_CACHE.set(candidate, wiktionaryResult)
      return wiktionaryResult
    }
  }

  // Graceful fallback when not found in any lexicon: provide exact word and phonetics
  const fallbackEntry: DictionaryEntry = {
    word: cleanWord,
    phonetic: `/${cleanWord}/`,
    partOfSpeech: 'spoken word',
    definition: `Spoken English word. Use the listen button to hear its authentic pronunciation.`,
    example: `"${rawWord}" as heard in this video segment.`,
  }

  RUNTIME_CACHE.set(cleanWord, fallbackEntry)
  return fallbackEntry
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
