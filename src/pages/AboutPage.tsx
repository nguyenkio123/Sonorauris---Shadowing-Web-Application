import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Coins,
  Compass,
  Headphones,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Swords,
  Volume2,
  Zap,
} from '../components/icons'
import { ProceduralGradientBg } from '../components/common/ProceduralGradientBg'

const TOC_ITEMS = [
  { id: 'about-shadowing', label: '1. What is Spoken Shadowing?' },
  { id: 'rhythm-cadence', label: '2. Speech Rhythm & Intonation' },
  { id: 'four-dimensions', label: '3. 4 Core Assessment Dimensions' },
  { id: 'accent-reduction', label: '4. Natural English Cadence' },
  { id: 'arena-guides', label: '5. Arena, Ledger & Mic Guide' },
]

export function AboutPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const targetId = location.hash.replace('#', '')
    const timer = window.setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
    return () => clearTimeout(timer)
  }, [location.hash])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative min-h-screen text-[#171B2A] font-sans pb-16">
      <ProceduralGradientBg variant="page" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Back Navigation & Hero Banner */}
        <div className="rounded-[28px] bg-white/78 backdrop-blur-md border border-white/70 shadow-[0_24px_60px_-15px_rgba(23,27,42,0.14)] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#4E9488]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] mb-4 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Practice Catalog</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#4E9488]/10 border border-[#4E9488]/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2B6B61] mb-3 ml-3">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Sonorauris Methodology &amp; Handbook</span>
            </div>

            <h1 className="text-[30px] sm:text-[42px] font-bold text-[#171B2A] leading-[1.15] tracking-tight">
              The Science of{' '}
              <span
                className="italic font-normal text-[40px] sm:text-[54px] leading-none bg-gradient-to-r from-[#2B6B61] via-[#4E9488] to-[#10B981] bg-clip-text text-transparent pr-1"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Spoken Shadowing
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#4A5568] mt-3 max-w-3xl leading-relaxed">
              Why memorizing vocabulary lists rarely translates into fluent speaking—and how real-time acoustic shadowing rewires your articulatory muscle memory, pitch contour, and English cadence.
            </p>

            {/* Quick Anchor Pill Strip */}
            <div className="mt-6 pt-5 border-t border-[#e2e6ea]/80 flex flex-wrap gap-2">
              {TOC_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/85 hover:bg-[#171B2A] text-[#171B2A] hover:text-white border border-[#e2e6ea] transition-all cursor-pointer shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1: WHAT IS SPOKEN SHADOWING? */}
        <section
          id="about-shadowing"
          className="scroll-mt-28 rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#4E9488]/15 border border-[#4E9488]/30 flex items-center justify-center text-[#2B6B61] shrink-0">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E9488]">
                01 · Core Technique
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171B2A]">
                What is Spoken Shadowing?
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#283044] leading-relaxed mb-4">
            <strong>Spoken Shadowing</strong> (originally formalized by linguist and polyglot Prof. Alexander Arguelles and widely used in simultaneous interpretation training) is an active auditory-motor practice where you listen to an authentic native speaker clip and <strong>echo the speech out loud with a 0.2-to-0.5 second delay</strong>—matching not only the words, but the exact speed, emotion, breathing pauses, and melody.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <div className="text-xs font-bold uppercase text-[#2B6B61] mb-1">
                Step 1 · Pure Listening
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Play the 10–25 second video clip once while watching the speaker’s jaw movement, stress points, and rhythm pauses.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <div className="text-xs font-bold uppercase text-[#2B6B61] mb-1">
                Step 2 · Synchronized Echo
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Record your voice while mimicking the speaker’s exact WPM tempo, connected speech links, and pitch inflection.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <div className="text-xs font-bold uppercase text-[#2B6B61] mb-1">
                Step 3 · AI Feedback Loop
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Inspect word-level miscues (omissions, substitutions, phonetic hints) and re-shadow until your score crosses 85+.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: SPEECH RHYTHM & INTONATION */}
        <section
          id="rhythm-cadence"
          className="scroll-mt-28 rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shrink-0">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                02 · Prosodic Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171B2A]">
                Speech Rhythm &amp; Intonation
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#283044] leading-relaxed mb-4">
            Unlike syllable-timed languages (such as Vietnamese, French, or Spanish where every syllable takes roughly equal time), <strong>English is a stress-timed language</strong>. Content words (nouns, main verbs, adjectives) receive elongated vowel duration and pitch peaks, while grammar words (prepositions, articles, auxiliary verbs) are compressed into rapid weak forms (schwa <code>/ə/</code>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <h3 className="text-sm font-bold text-[#171B2A] mb-1.5 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#4E9488]" />
                <span>Thought Groups &amp; Micro-Pauses</span>
              </h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Native speakers do not pause between every word; they speak in continuous 3-to-6 word acoustic phrases (&ldquo;thought groups&rdquo;) separated by brief timing anchors. Shadowing trains you to breathe at natural syntactic boundaries.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <h3 className="text-sm font-bold text-[#171B2A] mb-1.5 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Pitch Contour &amp; Nuclear Stress</span>
              </h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Rising-falling intonation signals certainty, contrast, or curiosity. Our acoustic engine tracks RMS energy variation and Zero-Crossing Rate (ZCR) modulation to ensure your voice avoids flat robotic monotone.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: 4 CORE ASSESSMENT DIMENSIONS */}
        <section
          id="four-dimensions"
          className="scroll-mt-28 rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-700 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                03 · Scoring Formula
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171B2A]">
                4 Core Assessment Dimensions
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#283044] leading-relaxed mb-5">
            Every practice attempt and 1v1 Battle submission is evaluated across four orthogonal speech dimensions using Needleman-Wunsch sequence alignment and acoustic prosody analysis:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/75 border border-[#e2e6ea] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[#171B2A]">1. Accuracy</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#4E9488]/15 text-[#2B6B61]">
                    35% Weight
                  </span>
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Phoneme- and word-level pronunciation precision. Detects exact matches, near-phonetic substitutions (via Levenshtein distance), and word confidence probability.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/75 border border-[#e2e6ea] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[#171B2A]">2. Fluency</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    25% Weight
                  </span>
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Measures temporal smoothness, inter-word pause gaps (&gt;0.38s hesitation penalties), and how closely your spoken Words-Per-Minute (WPM) matches native cadence (~140 WPM).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/75 border border-[#e2e6ea] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[#171B2A]">3. Completeness</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Ratio of reference transcript words successfully articulated without omissions or skipped clauses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/75 border border-[#e2e6ea] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[#171B2A]">4. Prosody</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Evaluates natural stress variation, energy modulation, and intonation contour so expressive speech scores higher than flat word-by-word reading.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-[#171B2A] text-white text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <span>Composite Battle Score Formula:</span>
            <span className="text-[#8ee3d5] font-bold">
              Score = 0.35 × Accuracy + 0.25 × Fluency + 0.20 × Completeness + 0.20 × Prosody
            </span>
          </div>
        </section>

        {/* SECTION 4: NATURAL ENGLISH CADENCE */}
        <section
          id="accent-reduction"
          className="scroll-mt-28 rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                04 · Connected Speech Habits
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171B2A]">
                Natural English Cadence
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#283044] leading-relaxed mb-4">
            Achieving natural cadence is not about erasing your identity—it is about mastering <strong>connected speech phenomena</strong> that make spoken English effortless to produce and effortless for listeners to understand:
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#4A5568]">
            <li className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <strong className="block text-sm text-[#171B2A] mb-1">Catenation (Linking)</strong>
              When a word ends in a consonant sound and the next begins with a vowel (e.g., <em>&ldquo;turn it off&rdquo;</em> → <code>/tɜː.nɪ.tɒf/</code>), the consonant bridges seamlessly across word boundaries.
            </li>
            <li className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <strong className="block text-sm text-[#171B2A] mb-1">Elision &amp; Assimilation</strong>
              Fast conversational speech drops or blends clustered consonants (e.g., <em>&ldquo;next day&rdquo;</em> → <code>/neks deɪ/</code>, <em>&ldquo;want to&rdquo;</em> → <em>&ldquo;wanna&rdquo;</em>) to preserve rhythmic tempo.
            </li>
            <li className="p-4 rounded-xl bg-white/70 border border-[#e2e6ea]">
              <strong className="block text-sm text-[#171B2A] mb-1">Vowel Reduction</strong>
              Unstressed function words (<em>to, for, of, and, can</em>) shrink to a relaxed central vowel <code>/ə/</code> so stressed keywords stand out clearly.
            </li>
          </ul>
        </section>

        {/* SECTION 5: ARENA, LEDGER & MICROPHONE CALIBRATION GUIDE */}
        <section
          id="arena-guides"
          className="scroll-mt-28 rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div id="ledger" className="scroll-mt-28 p-4 rounded-xl bg-white/75 border border-[#e2e6ea]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171B2A] mb-1.5">
                <Coins className="h-4 w-4 text-amber-500" />
                <span>Idempotent Coins &amp; XP Ledger</span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Every practice attempt, daily quest claim, and 1v1 duel writes an immutable transaction to the reward ledger. Total XP drives your <strong>Player Level (Lv.1–Lv.10+)</strong> to unlock level-exclusive avatars, frames, and titles, while Coins can be spent in the Cosmetics Shop or for Streak Insurance.
              </p>
            </div>

            <div id="room-codes" className="scroll-mt-28 p-4 rounded-xl bg-white/75 border border-[#e2e6ea]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171B2A] mb-1.5">
                <Swords className="h-4 w-4 text-[#4E9488]" />
                <span>Room Code Invitation Guide</span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                In the Battle Lobby, create a private or quick-match room to receive a 6-character Room Code. Share that code with a friend on another device (synced via Supabase Realtime) or challenge our adaptive ShadowBot AI opponent.
              </p>
            </div>

            <div id="microphone-guide" className="scroll-mt-28 p-4 rounded-xl bg-white/75 border border-[#e2e6ea]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171B2A] mb-1.5">
                <Mic className="h-4 w-4 text-purple-600" />
                <span>Microphone Calibration Guide</span>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                For optimal accuracy, speak 15–20 cm from your microphone in a quiet room. Our acoustic gate filters ambient mic hiss (&lt;0.035 peak RMS), and you can test your input level anytime in <strong>Profile → Speech &amp; Audio Engine</strong>.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e6ea] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#5B6780]">
              <ShieldCheck className="h-4 w-4 text-[#4E9488]" />
              <span>Ready to put the Shadowing Method into practice?</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link to="/" className="btn-primary text-xs font-semibold h-9 px-4 rounded-xl">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Practicing</span>
              </Link>
              <Link to="/battle/lobby" className="btn-secondary text-xs font-semibold h-9 px-4 rounded-xl">
                <Swords className="h-3.5 w-3.5" />
                <span>Enter 1v1 Arena</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
