import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Zap,
  Coins,
  Swords,
  Mic,
  BookOpen,
  AlertCircle,
} from 'lucide-react'
import { getClip, submitAttempt } from '../api'
import { REWARDS } from '../config/scoring'
import { AudioRecorder } from '../components/recorder/AudioRecorder'
import { YouTubePlayer } from '../components/player/YouTubePlayer'
import { DictionaryModal } from '../components/common/DictionaryModal'
import type { Clip } from '../types/clip'

export function PracticePage() {
  const { clipId } = useParams<{ clipId: string }>()
  const navigate = useNavigate()

  const [clip, setClip] = useState<Clip | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedDictWord, setSelectedDictWord] = useState<string | null>(null)

  useEffect(() => {
    async function loadClip() {
      if (!clipId) return
      try {
        const data = await getClip(clipId)
        if (!data) {
          setError('Clip not found.')
        } else {
          setClip(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clip details')
      } finally {
        setLoading(false)
      }
    }
    void loadClip()
  }, [clipId])

  const handleSubmitRecording = async (audioBlob: Blob) => {
    if (!clip || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const attempt = await submitAttempt(clip.id, audioBlob)
      navigate(`/result/${attempt.id}`)
    } catch (err) {
      console.error('Failed to submit attempt:', err)
      setSubmitError(
        'Could not evaluate your recording. Check your connection and click Submit again — your recorded audio is preserved.',
      )
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#5B6780] text-sm">
        <span className="h-8 w-8 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin mb-3" />
        Preparing shadowing practice session...
      </div>
    )
  }

  if (error || !clip) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#171B2A] px-4">
        <div className="rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-8 max-w-md text-center airbnb-shadow">
          <h2 className="text-xl font-semibold text-[#171B2A] mb-2">{error || 'Clip not found'}</h2>
          <p className="text-xs text-[#5B6780] mb-6">The requested shadowing exercise does not exist.</p>
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

  const wordCount = clip.referenceText.trim().split(/\s+/).filter(Boolean).length
  const wpm = Math.round((wordCount / Math.max(1, clip.durationSec)) * 60)

  return (
    <div className="min-h-screen bg-white text-[#171B2A] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1080px]">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#171B2A] hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All practice clips</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f7f9fa] border border-[#dddddd] px-3 py-1 text-xs font-medium text-[#171B2A]">
              {clip.topic}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#f7f9fa] border border-[#dddddd] px-3 py-1 text-xs font-mono font-medium text-[#171B2A]">
              <Clock className="h-3.5 w-3.5 text-[#4E9488]" />
              <span>{clip.durationSec}s</span>
            </span>
          </div>
        </div>

        {/* Studio Heading & Authentic Linguistic Metadata */}
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[26px] font-semibold text-[#171B2A] tracking-tight leading-snug mb-2">
            {clip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#171B2A]">
            <span className="inline-flex items-center rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-2.5 py-0.5 text-xs font-semibold text-[#171B2A]">
              {clip.difficulty}
            </span>
            <span>·</span>
            <span className="font-mono text-xs font-semibold text-[#4E9488]">
              {wordCount} words · {wpm} WPM target cadence
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-medium text-[#171B2A]">
              <ShieldCheck className="h-4 w-4 text-[#4E9488]" />
              <span>Authentic Native Segment</span>
            </span>
            <span>·</span>
            <span className="text-[#5B6780]">
              Source: <strong className="text-[#171B2A]">{clip.channelName}</strong> ({clip.locale})
            </span>
          </div>
        </div>

        {/* 2-Column Studio Layout: Video Segment & Guide (7 Cols) vs Transcript & Recorder Rail (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Segment Player & Concise Studio Guide */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <YouTubePlayer
              key={clip.id}
              videoId={clip.youtubeVideoId}
              title={clip.title}
              thumbnailUrl={clip.thumbnailUrl}
              sourceUrl={clip.sourceUrl}
              startTimeSec={clip.startTimeSec}
              endTimeSec={clip.endTimeSec}
            />

            {/* Concise Shadowing Studio Guide & Keyboard Shortcuts */}
            <div className="rounded-[14px] border border-[#ebebeb] bg-[#f7f9fa] p-5 text-xs text-[#5B6780]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <h2 className="text-sm font-semibold text-[#171B2A]">
                  Shadowing Studio Workflow
                </h2>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#e2e6ea] px-2 py-0.5 text-[#171B2A]">
                    <kbd className="font-mono font-bold text-[#4E9488]">R</kbd> Record / Stop
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#e2e6ea] px-2 py-0.5 text-[#171B2A]">
                    <kbd className="font-mono font-bold text-[#4E9488]">Enter</kbd> Submit
                  </span>
                </div>
              </div>
              <p className="leading-relaxed">
                1. Listen to the segment 1–2 times to lock into the speaker's rhythm and stress.<br />
                2. Press <strong className="text-[#171B2A]">R</strong> (or click the microphone) and shadow the speaker out loud at <strong className="font-mono text-[#171B2A]">{wpm} WPM</strong>.<br />
                3. Submit your take for phoneme-level Accuracy, Fluency, Completeness, and Prosody diagnostics.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Transcript & Recording Studio Card */}
          <div className="lg:col-span-5 sticky top-[100px] flex flex-col gap-4">
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 airbnb-shadow">
              {/* Target Transcript Block */}
              <div className="mb-5 pb-5 border-b border-[#ebebeb]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#171B2A]">
                    Target Transcript
                  </span>
                  <span className="rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-2.5 py-0.5 text-[11px] font-semibold text-[#171B2A]">
                    {clip.locale || 'English (US)'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#dddddd] bg-[#f7f9fa] p-4 text-[#171B2A]">
                  <blockquote className="text-[16px] sm:text-[17px] font-normal leading-relaxed text-[#171B2A] select-text">
                    "
                    {clip.referenceText.split(/\s+/).map((rawWord, idx) => {
                      const cleanWord = rawWord.replace(/^[.,/#!$%^&*;:{}=\-_`~()?"]+|[.,/#!$%^&*;:{}=\-_`~()?"]+$/g, '')
                      return (
                        <span key={idx}>
                          <button
                            type="button"
                            onClick={() => setSelectedDictWord(cleanWord)}
                            className="inline p-0 m-0 bg-transparent border-0 font-inherit text-inherit hover:text-[#4E9488] hover:bg-emerald-50 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#4E9488] rounded px-0.5 cursor-pointer transition-colors"
                            title={`Look up definition & IPA for "${cleanWord}"`}
                          >
                            {rawWord}
                          </button>{' '}
                        </span>
                      )
                    })}
                    "
                  </blockquote>
                  <div className="mt-3 pt-2.5 border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-[#5B6780]">
                    <span className="flex items-center gap-1 text-[#4E9488] font-medium">
                      <BookOpen className="h-3 w-3" />
                      <span>Click or Tab+Enter any word for definition &amp; IPA</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#5B6780]">
                      {wordCount} words
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline Submission Error Banner */}
              {submitError && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#c13515]/30 bg-[#fff5f5] p-3.5 text-xs text-[#c13515]"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Audio Recorder Component */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171B2A] mb-2">
                  <Mic className="h-3.5 w-3.5 text-[#4E9488]" />
                  <span>Record Your Voice</span>
                </div>
                <AudioRecorder
                  maxDurationSec={clip.durationSec + 4}
                  onSubmit={handleSubmitRecording}
                  submitting={submitting}
                />
              </div>

              {/* Guaranteed Payout Breakdown Stack */}
              <div className="space-y-2 text-sm text-[#5B6780] border-t border-[#ebebeb] pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Base practice attempt</span>
                  <span className="font-mono text-[#171B2A] font-medium">+{REWARDS.soloPractice.xp} XP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Pronunciation completion</span>
                  <span className="font-mono text-[#171B2A] font-medium">+{REWARDS.soloPractice.coins} Coins</span>
                </div>
                <div className="border-t border-[#ebebeb] pt-2 flex items-center justify-between font-semibold text-[#171B2A] text-sm">
                  <span>Session Reward Total</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#4E9488] font-mono text-xs">
                      <Zap className="h-3 w-3 fill-current" />
                      <span>+{REWARDS.soloPractice.xp} XP</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-mono text-xs">
                      <Coins className="h-3 w-3 fill-current" />
                      <span>+{REWARDS.soloPractice.coins} Coins</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary 1v1 Battle CTA */}
              <div className="mt-5 pt-4 border-t border-[#ebebeb]">
                <Link
                  to={`/battle/lobby?clipId=${clip.id}`}
                  className="btn-secondary w-full text-xs font-semibold h-[44px] rounded-lg"
                >
                  <Swords className="h-4 w-4" />
                  <span>Challenge in Real-Time Battle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dictionary Modal (FR-DICT-01) */}
      <DictionaryModal
        word={selectedDictWord}
        onClose={() => setSelectedDictWord(null)}
      />
    </div>
  )
}
