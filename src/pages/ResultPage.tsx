import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Flame,
  RotateCcw,
  Sparkles,
  Swords,
  Zap,
  HelpCircle,
  Volume2,
} from 'lucide-react'
import { getAttempt, getAttemptAudioUrl, getClip, getMe } from '../api'
import type { Attempt, MiscueWord } from '../types/attempt'
import type { Clip } from '../types/clip'
import type { UserProfile } from '../types/user'

export function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [clip, setClip] = useState<Clip | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioUrl = attemptId ? getAttemptAudioUrl(attemptId) : null

  useEffect(() => {
    let isMounted = true

    const loadAttemptData = async () => {
      if (!attemptId) {
        setError('No attempt ID provided.')
        setLoading(false)
        return
      }

      try {
        const attemptData = await getAttempt(attemptId)
        if (!isMounted) return

        if (!attemptData) {
          setError(`Attempt "${attemptId}" was not found.`)
          setLoading(false)
          return
        }

        setAttempt(attemptData)

        // Load clip and refreshed user progression
        const [clipData, userData] = await Promise.all([
          getClip(attemptData.clipId),
          getMe(),
        ])

        if (!isMounted) return
        setClip(clipData)
        setUser(userData)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load attempt result')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadAttemptData()

    return () => {
      isMounted = false
    }
  }, [attemptId])

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (attempt?.clipId) {
          navigate(`/practice/${attempt.clipId}`)
        }
      } else if (e.key === 'Escape') {
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [attempt?.clipId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#171B2A] p-6 text-center font-sans">
        <div className="h-10 w-10 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-[#171B2A] mb-1">Evaluating Voice Shadowing...</h2>
        <p className="text-xs text-[#6a6a6a] max-w-md leading-relaxed">
          Evaluating phoneme boundaries, speech rhythm, completeness ratio, and prosodic intonation.
        </p>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#222222] p-6 text-center font-sans">
        <div className="rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-8 max-w-md airbnb-shadow">
          <h2 className="text-lg font-semibold text-[#c13515] mb-2">Attempt Evaluation Error</h2>
          <p className="text-xs text-[#6a6a6a] mb-6">{error || 'Data is unavailable.'}</p>
          <Link
            to="/"
            className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Catalog</span>
          </Link>
        </div>
      </div>
    )
  }

  const { result } = attempt
  const score = result.battleScore

  const engineLabel =
    result.engine === 'faster-whisper'
      ? 'Tier 2 · Faster-Whisper (base.en int8)'
      : result.engine === 'azure'
      ? 'Tier 1 · Azure Speech AI'
      : 'Tier 3 · Browser WebAudio DSP'

  const getTier = (s: number) => {
    if (s >= 90) return { label: 'Outstanding Cadence!', desc: 'Flawless speech rhythm & crisp phonetic execution.' }
    if (s >= 80) return { label: 'Great Flow!', desc: 'Natural delivery with strong pronunciation cadence.' }
    if (s >= 70) return { label: 'Solid Effort!', desc: 'Good rhythm. Focus on accented syllables and vowels.' }
    return { label: 'Keep Practicing!', desc: 'Repeat the clip once more to master tricky words.' }
  }

  const tier = getTier(score)

  const renderMiscueWord = (item: MiscueWord, index: number) => {
    const confSuffix = typeof item.confidence === 'number' ? ` · ${item.confidence}%` : ''
    if (!item.type) {
      return (
        <span
          key={index}
          title={typeof item.confidence === 'number' ? `Confidence: ${item.confidence}%` : undefined}
          className="inline-block rounded-md px-1.5 py-0.5 text-[#222222] hover:bg-[#ebebeb] transition-colors"
        >
          {item.word}
          {typeof item.confidence === 'number' && (
            <sup className="ml-0.5 font-mono text-[10px] text-[#4E9488] font-semibold">
              {item.confidence}%
            </sup>
          )}
        </span>
      )
    }

    if (item.type === 'mispronunciation') {
      return (
        <span
          key={index}
          className="inline-flex flex-col items-center rounded-lg bg-amber-50 px-2 py-0.5 text-amber-900 font-semibold"
          title={`Mispronunciation: ${item.phoneticHint || 'Check pronunciation'}${confSuffix}`}
        >
          <span>{item.word}</span>
          <span className="text-[10px] font-mono text-amber-700 font-normal">
            [Mispronounced{confSuffix}] {item.phoneticHint ? `• ${item.phoneticHint}` : ''}
          </span>
        </span>
      )
    }

    if (item.type === 'omission') {
      return (
        <span
          key={index}
          className="inline-flex flex-col items-center rounded-lg bg-rose-50 px-2 py-0.5 text-rose-900 font-semibold"
          title="Word was omitted or skipped in your speech"
        >
          <span className="line-through opacity-70">{item.word}</span>
          <span className="text-[10px] font-mono text-rose-700 font-normal">[Omitted]</span>
        </span>
      )
    }

    if (item.type === 'insertion') {
      return (
        <span
          key={index}
          className="inline-flex flex-col items-center rounded-lg bg-blue-50 px-2 py-0.5 text-blue-900 font-semibold"
          title={`Extra word detected in speech${confSuffix}`}
        >
          <span>{item.word}</span>
          <span className="text-[10px] font-mono text-blue-700 font-normal">
            [Extra Word{confSuffix}]
          </span>
        </span>
      )
    }

    return <span key={index}>{item.word}</span>
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#222222] hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Catalog (Esc)</span>
          </Link>

          {clip && (
            <div className="flex items-center gap-2 text-xs text-[#6a6a6a]">
              <span className="rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3 py-0.5 font-medium text-[#222222]">
                {clip.topic}
              </span>
              <span>·</span>
              <span className="font-semibold text-[#222222]">{clip.title}</span>
            </div>
          )}
        </div>

        {/* HERO RATING DISPLAY CARD (DESIGN.md rating-display-card: 64px / 700 with laurel wreaths) */}
        <section className="relative overflow-hidden rounded-[14px] border border-[#dddddd] bg-white p-8 sm:p-10 mb-8 airbnb-shadow text-center">
          <div className="flex flex-col items-center justify-center">
            {/* Laurel Wreaths Ornaments + 64px Composite Rating Display */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
              {/* Left Laurel SVG */}
              <svg className="h-12 w-8 text-[#222222] fill-current opacity-80" viewBox="0 0 32 64">
                <path d="M28 4c-5 10-12 18-24 24 10 3 20 1 24-8v-16zm-4 28c-6 8-14 14-22 18 8 2 16 0 22-8v-10z" />
              </svg>

              <div className="flex flex-col items-center">
                <span className="rating-display">
                  {score}
                </span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#6a6a6a] mt-[-4px]">
                  Battle Score
                </span>
              </div>

              {/* Right Laurel SVG (Mirrored) */}
              <svg className="h-12 w-8 text-[#222222] fill-current opacity-80 scale-x-[-1]" viewBox="0 0 32 64">
                <path d="M28 4c-5 10-12 18-24 24 10 3 20 1 24-8v-16zm-4 28c-6 8-14 14-22 18 8 2 16 0 22-8v-10z" />
              </svg>
            </div>

            {/* Guest Favorite / Assessment Badge + Engine Tier & WPM */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f9fa] px-4 py-1 text-xs font-semibold text-[#171B2A]">
                <CheckCircle2 className="h-4 w-4 text-[#4E9488]" />
                <span>{engineLabel}</span>
              </div>
              {typeof result.spokenWpm === 'number' && result.spokenWpm > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f3f5] px-3.5 py-1 text-xs font-mono font-semibold text-[#171B2A]">
                  <span>Pace: {result.spokenWpm} WPM</span>
                </div>
              )}
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#171B2A] mb-1.5">
              {tier.label}
            </h1>
            <p className="text-sm text-[#5B6780] max-w-md leading-relaxed mb-6">
              {tier.desc}
            </p>

            {/* Guaranteed Ledger Rewards Box */}
            <div className="flex items-center gap-4 rounded-full bg-[#f7f9fa] px-6 py-2.5">
              <span className="text-xs font-semibold text-[#171B2A]">
                Rewards Credited:
              </span>
              <div className="flex items-center gap-3 font-mono text-xs font-bold">
                <span className="flex items-center gap-1 text-[#171B2A]">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>+{attempt.earnedXp} XP</span>
                </span>
                <span className="text-[#dddddd]">•</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Coins className="h-3.5 w-3.5 fill-current" />
                  <span>+{attempt.earnedCoins} Coins</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE METRICS GRID */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#171B2A] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#4E9488]" />
              <span>Core Pronunciation Metrics</span>
            </h2>
            <span className="text-xs text-[#5B6780] font-mono">
              Normalized: 0–100 Scale
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Accuracy */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#171B2A]">Accuracy</span>
                <span className="text-xl font-bold text-[#171B2A] font-mono">
                  {result.accuracy}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden mb-2">
                <div
                  className="h-full bg-[#4E9488] transition-all duration-700"
                  style={{ width: `${result.accuracy}%` }}
                />
              </div>
              <p className="text-[12px] text-[#5B6780] leading-snug">
                Phoneme &amp; word correctness vs reference.
              </p>
            </div>

            {/* Metric 2: Fluency */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#171B2A]">Fluency</span>
                <span className="text-xl font-bold text-[#171B2A] font-mono">
                  {result.fluency}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden mb-2">
                <div
                  className="h-full bg-[#171B2A] transition-all duration-700"
                  style={{ width: `${result.fluency}%` }}
                />
              </div>
              <p className="text-[12px] text-[#5B6780] leading-snug">
                Smoothness, pause cadence &amp; speaking pace.
              </p>
            </div>

            {/* Metric 3: Completeness */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#171B2A]">Completeness</span>
                <span className="text-xl font-bold text-[#171B2A] font-mono">
                  {result.completeness}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden mb-2">
                <div
                  className="h-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${result.completeness}%` }}
                />
              </div>
              <p className="text-[12px] text-[#5B6780] leading-snug">
                Ratio of original script articulated.
              </p>
            </div>

            {/* Metric 4: Prosody */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#171B2A]">Prosody</span>
                <span className="text-xl font-bold text-[#171B2A] font-mono">
                  {result.prosody}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden mb-2">
                <div
                  className="h-full bg-[#4E9488] transition-all duration-700"
                  style={{ width: `${result.prosody}%` }}
                />
              </div>
              <p className="text-[12px] text-[#5B6780] leading-snug">
                Pitch variations &amp; natural en-US stress.
              </p>
            </div>
          </div>
        </section>

        {/* WORD-LEVEL MISCUES BREAKDOWN (Clean Editorial Diagnostic Block) */}
        <section className="rounded-[14px] border border-[#dddddd] bg-white p-6 mb-8 airbnb-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#ebebeb] pb-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#171B2A] flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-[#4E9488]" />
                <span>Word-Level Speech Diagnostics</span>
              </h2>
              <p className="text-xs text-[#5B6780]">
                Granular word assessment identifying missed sounds or rhythm slips.
              </p>
            </div>

            {/* Diagnostic Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5">
                Mispronounced
              </span>
              <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-900 border border-rose-300 px-2.5 py-0.5">
                Omitted
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-900 border border-blue-300 px-2.5 py-0.5">
                Extra Word
              </span>
            </div>
          </div>

          {audioUrl && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f7f9fa] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171B2A]">
                <Volume2 className="h-4 w-4 text-[#4E9488]" />
                <span>Your Recorded Shadowing Audio</span>
              </div>
              <audio controls src={audioUrl} className="h-9 w-full sm:w-72" />
            </div>
          )}

          {result.recognizedText && (
            <div className="mb-4 bg-[#f7f9fa] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B6780] mb-1">
                What AI Heard ({engineLabel})
              </div>
              <p className="text-sm font-medium text-[#171B2A] italic">
                &ldquo;{result.recognizedText}&rdquo;
              </p>
            </div>
          )}

          {/* Interactive Words Canvas */}
          <div className="bg-[#f7f9fa] p-6 leading-loose text-base sm:text-lg flex flex-wrap gap-2.5 items-center">
            {result.words.map((item, idx) => renderMiscueWord(item, idx))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#5B6780]">
            <HelpCircle className="h-4 w-4 text-[#4E9488] shrink-0" />
            <span>
              Tip: Re-listen to the authentic video segment to hear how the native speaker stresses the highlighted words.
            </span>
          </div>
        </section>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ebebeb] pt-6">
          <Link
            to="/"
            className="btn-secondary text-xs font-semibold h-[44px] px-5 rounded-lg w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse More Clips (Esc)</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {clip && (
              <Link
                to={`/battle/lobby?clipId=${clip.id}`}
                className="btn-secondary text-xs font-semibold h-[44px] px-5 rounded-lg flex-1 sm:flex-initial"
              >
                <Swords className="h-4 w-4" />
                <span>1v1 Duel Arena</span>
              </Link>
            )}

            {clip && (
              <button
                type="button"
                onClick={() => navigate(`/practice/${clip.id}`)}
                className="btn-primary text-xs font-semibold h-[44px] px-6 rounded-lg flex-1 sm:flex-initial"
                title="Shortcut: P"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Practice Again (P)</span>
              </button>
            )}
          </div>
        </div>

        {/* Updated User Mini Stats Bar */}
        {user && (
          <div className="mt-8 flex items-center justify-center gap-6 rounded-full bg-[#f7f9fa] border border-[#dddddd] py-2.5 px-6 text-xs text-[#5B6780]">
            <span className="flex items-center gap-1.5 font-medium text-[#171B2A]">
              <Zap className="h-3.5 w-3.5 fill-purple-600 text-purple-600" />
              <span>Current XP: <strong className="font-mono text-purple-700">{user.xp}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#171B2A]">
              <Coins className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>Coins Balance: <strong className="font-mono">{user.coins}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#171B2A]">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>Streak: <strong className="font-mono">{user.streak}d</strong></span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
