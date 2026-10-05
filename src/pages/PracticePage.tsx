import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
  Coins,
  Swords,
  Volume2,
  Mic,
  Award,
  BookOpen,
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
    try {
      const attempt = await submitAttempt(clip.id, audioBlob)
      navigate(`/result/${attempt.id}`)
    } catch (err) {
      console.error('Failed to submit attempt:', err)
      alert('Failed to evaluate recording. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#6a6a6a] text-sm">
        <span className="h-8 w-8 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin mb-3" />
        Preparing shadowing practice session...
      </div>
    )
  }

  if (error || !clip) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#222222] px-4">
        <div className="rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-8 max-w-md text-center airbnb-shadow">
          <h2 className="text-xl font-semibold text-[#222222] mb-2">{error || 'Clip not found'}</h2>
          <p className="text-xs text-[#6a6a6a] mb-6">The requested shadowing exercise does not exist.</p>
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

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans py-8 px-4 sm:px-6 lg:px-8">
      {/* Maximum content width ~1080px to keep rail readable per DESIGN.md */}
      <div className="mx-auto max-w-[1080px]">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#222222] hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All practice clips</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3 py-1 text-xs font-medium text-[#222222]">
              {clip.topic}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#f7f9fa] border border-[#dddddd] px-3 py-1 text-xs font-mono font-medium text-[#171B2A]">
              <Clock className="h-3.5 w-3.5 text-[#4E9488]" />
              <span>{clip.durationSec}s</span>
            </span>
          </div>
        </div>

        {/* Listing Detail Heading — display-lg (22px / 500) per DESIGN.md */}
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[26px] font-semibold text-[#171B2A] tracking-tight leading-snug mb-2">
            {clip.title}
          </h1>

          {/* Meta line: Star rating in ink, reviews, host/channel, locale */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#171B2A]">
            <div className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-[#171B2A] text-[#171B2A]" />
              <span>4.92</span>
            </div>
            <span>·</span>
            <span className="text-[#5B6780] underline cursor-pointer">
              128 verified learners
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-medium text-[#171B2A]">
              <ShieldCheck className="h-4 w-4 text-[#4E9488]" />
              <span>Verified Authentic Audio</span>
            </span>
            <span>·</span>
            <span className="text-[#5B6780]">
              Source: <strong className="text-[#171B2A]">{clip.channelName}</strong> ({clip.locale})
            </span>
          </div>
        </div>

        {/* Airbnb 2-Column Detail Layout: Media & Body (64%) vs Sticky Reservation Rail (36%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Segment Player & Transcript & Amenities (7 Cols / ~60%) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <YouTubePlayer
              key={clip.id}
              videoId={clip.youtubeVideoId}
              title={clip.title}
              thumbnailUrl={clip.thumbnailUrl}
              sourceUrl={clip.sourceUrl}
              startTimeSec={clip.startTimeSec}
              endTimeSec={clip.endTimeSec}
            />

            {/* Amenity Rows (DESIGN.md amenity-row) */}
            <div className="border-t border-[#ebebeb] pt-6">
              <h3 className="text-[18px] font-semibold text-[#171B2A] mb-4">
                What this practice session offers
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-[#f7f9fa] text-[#171B2A]">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171B2A]">Authentic Native Cadence</h4>
                    <p className="text-xs text-[#5B6780] mt-0.5">
                      Unscripted real-world delivery with natural American English pitch shifts and connected speech.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-[#f7f9fa] text-[#171B2A]">
                    <Sparkles className="h-5 w-5 text-[#4E9488]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171B2A]">4-Dimension AI Speech Assessment</h4>
                    <p className="text-xs text-[#5B6780] mt-0.5">
                      Sub-second phoneme alignment scoring Accuracy, Fluency, Completeness, and Prosodic intonation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-[#f7f9fa] text-[#171B2A]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171B2A]">Immediate Progression Payout</h4>
                    <p className="text-xs text-[#5B6780] mt-0.5">
                      Guaranteed idempotent XP and Coin credit added directly to your learner ledger on each attempt.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Things to Know Guide */}
            <div className="border-t border-[#ebebeb] pt-6 text-xs text-[#5B6780]">
              <h4 className="text-sm font-semibold text-[#171B2A] mb-2">
                Things to know before shadowing
              </h4>
              <p className="leading-relaxed">
                1. Listen to the video segment 1–2 times to internalize the cadence and intonation.<br />
                2. Hit the red record button and speak synchronously with or immediately following the speaker.<br />
                3. Check your diagnostic score to review mispronounced or omitted words.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Reservation-Card Rail (5 Cols / ~40%) */}
          <div className="lg:col-span-5 sticky top-[100px] flex flex-col gap-4">
            {/* The Signature Airbnb Reservation Card (DESIGN.md reservation-card) */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 airbnb-shadow">
              {/* Target Transcript Block (Replaces session details per user feedback) */}
              <div className="mb-5 pb-5 border-b border-[#ebebeb]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#171B2A]">
                      Target Transcript
                    </span>
                  </div>
                  <span className="guest-favorite-badge text-[11px] py-0.5 px-2.5">
                    {clip.locale || 'English (US)'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#dddddd] bg-[#f7f9fa] p-4 text-[#171B2A]">
                  <blockquote className="text-[16px] sm:text-[17px] font-normal leading-relaxed text-[#171B2A] select-text">
                    "
                    {clip.referenceText.split(/\s+/).map((rawWord, idx) => {
                      const cleanWord = rawWord.replace(/^[.,/#!$%^&*;:{}=\-_`~()?"]+|[.,/#!$%^&*;:{}=\-_`~()?"]+$/g, '')
                      return (
                        <span
                          key={idx}
                          onClick={() => setSelectedDictWord(cleanWord)}
                          className="hover:text-[#4E9488] hover:bg-emerald-50 hover:underline underline-offset-4 rounded px-0.5 cursor-pointer transition-colors"
                          title={`Click to lookup definition for "${cleanWord}"`}
                        >
                          {rawWord}{' '}
                        </span>
                      )
                    })}
                    "
                  </blockquote>
                  <div className="mt-3 pt-2.5 border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-[#5B6780]">
                    <span className="flex items-center gap-1 text-[#4E9488] font-medium">
                      <BookOpen className="h-3 w-3" />
                      <span>Click any word to look up definition &amp; IPA</span>
                    </span>
                    <span className="text-[10px] text-[#8895AD]">FR-DICT-01</span>
                  </div>
                </div>
              </div>

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

              {/* Guaranteed Payout Breakdown Stack (Fee breakdown style) */}
              <div className="space-y-2 text-sm text-[#6a6a6a] border-t border-[#ebebeb] pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Base practice attempt</span>
                  <span className="font-mono text-[#222222] font-medium">+{REWARDS.soloPractice.xp} XP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Pronunciation completion</span>
                  <span className="font-mono text-[#222222] font-medium">+{REWARDS.soloPractice.coins} Coins</span>
                </div>
                <div className="border-t border-[#ebebeb] pt-2 flex items-center justify-between font-semibold text-[#222222] text-sm">
                  <span>Session Reward Total</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#460479] font-mono text-xs">
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
