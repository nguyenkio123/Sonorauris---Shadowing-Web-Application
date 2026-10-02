import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  FastForward,
  Mic,
  Send,
  Sparkles,
  Swords,
  Volume2,
} from 'lucide-react'
import { getClip, submitBattleAttempt } from '../api'
import { AudioRecorder } from '../components/recorder/AudioRecorder'
import { YouTubePlayer } from '../components/player/YouTubePlayer'
import { useRoom } from '../hooks/useRoom'
import type { Clip } from '../types/clip'

export function BattleRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()

  const { room, loading: roomLoading, error: roomError } = useRoom(roomCode)
  const [clip, setClip] = useState<Clip | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [countdownNum, setCountdownNum] = useState<number>(3)

  // Load clip metadata
  useEffect(() => {
    async function load() {
      if (!room?.clipId) return
      try {
        const data = await getClip(room.clipId)
        setClip(data)
      } catch (err) {
        console.error('Failed to load battle clip', err)
      }
    }
    void load()
  }, [room?.clipId])

  // Countdown timer calculation in COUNTDOWN state
  useEffect(() => {
    if (room?.status !== 'COUNTDOWN' || !room.countdownEndsAt) return

    const interval = setInterval(() => {
      const remainingMs = room.countdownEndsAt! - Date.now()
      const secs = Math.max(1, Math.ceil(remainingMs / 1000))
      setCountdownNum(secs)
    }, 100)

    return () => clearInterval(interval)
  }, [room?.status, room?.countdownEndsAt])

  // Redirect to Battle Result once status reaches RESULT
  useEffect(() => {
    if (room?.status === 'RESULT') {
      navigate(`/battle/result/${room.code}`)
    }
  }, [room?.status, room?.code, navigate])

  const handleQuickSubmit = useCallback(async () => {
    if (!room || submitting || room.player.hasSubmitted) return
    setSubmitting(true)
    try {
      // Create mock audio blob for rapid demonstration/testing
      const mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' })
      await submitBattleAttempt(room.code, mockBlob)
    } catch (err) {
      console.error('Failed to submit quick demo audio', err)
      setSubmitting(false)
    }
  }, [room, submitting])

  // Quick submit / Skip recording shortcut (Shift + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        void handleQuickSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleQuickSubmit])

  const handleSubmitAudio = async (audioBlob: Blob) => {
    if (!room || submitting) return
    setSubmitting(true)
    try {
      await submitBattleAttempt(room.code, audioBlob)
    } catch (err) {
      console.error('Failed to submit battle recording', err)
      setSubmitting(false)
    }
  }

  if (roomLoading && !room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#6a6a6a] text-xs font-sans">
        <span className="h-6 w-6 rounded-full border-2 border-[#ff385c]/30 border-t-[#ff385c] animate-spin mr-3" />
        Connecting to battle room...
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#222222] p-6 text-center font-sans">
        <div className="rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-8 max-w-md airbnb-shadow">
          <h2 className="text-xl font-bold text-[#c13515] mb-2">{roomError || 'Room not found'}</h2>
          <p className="text-xs text-[#6a6a6a] mb-6">Could not establish synchronized battle state.</p>
          <Link
            to="/battle/lobby"
            className="btn-primary text-xs font-semibold px-4 py-2.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Lobby</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Arena Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/battle/lobby"
              className="text-xs font-medium text-[#6a6a6a] hover:text-[#222222] hover:underline transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Leave Arena</span>
            </Link>
            <span className="text-[#dddddd]">•</span>
            <span className="font-mono text-xs font-bold text-[#222222] bg-[#f7f7f7] px-3 py-1 rounded-full border border-[#dddddd]">
              ROOM: {room.code}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3.5 py-1 text-xs font-semibold text-[#222222]">
              <Swords className="h-3.5 w-3.5 text-[#ff385c]" />
              <span className="uppercase font-mono text-[11px]">{room.status}</span>
            </span>

            {/* Quick Demo Skip Button */}
            {room.status === 'RECORDING' && !room.player.hasSubmitted && (
              <button
                type="button"
                onClick={handleQuickSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] border border-[#dddddd] px-3.5 py-1 text-xs font-semibold text-[#222222] transition-all active:scale-95"
                title="Shortcut: Shift + S (Rapid recording testing)"
              >
                <FastForward className="h-3 w-3 text-[#ff385c]" />
                <span>Skip Record <span className="font-mono text-[10px] text-[#929292]">[Shift+S]</span></span>
              </button>
            )}
          </div>
        </div>

        {/* 1. COUNTDOWN STATE OVERLAY (3-2-1) */}
        {room.status === 'COUNTDOWN' && (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            {/* Countdown Orb */}
            <div className="relative mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-[#ff385c] text-white shadow-xl shadow-[#ff385c]/25 animate-pulse">
              <span className="font-mono text-7xl font-bold tracking-tighter">
                {countdownNum}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-1.5">Get Ready Contenders!</h2>
            <p className="text-xs sm:text-sm text-[#6a6a6a] max-w-sm leading-relaxed">
              Listen carefully to the authentic clip as it begins playing, then record your shadowing reproduction.
            </p>
          </div>
        )}

        {/* 2. RECORDING STATE */}
        {room.status === 'RECORDING' && (
          <div className="flex flex-col gap-6">
            {/* Contenders Status Banner: Dynamic cards for 2 to 5 participants (FR-BAT-07) */}
            {(() => {
              const maxPlayers = room.maxPlayers || 2
              const participants = room.participants && room.participants.length > 0
                ? room.participants
                : [room.player, ...(room.opponent ? [room.opponent] : [])]
              const gridCols =
                maxPlayers === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : maxPlayers === 3
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

              return (
                <div className={`grid ${gridCols} gap-4 items-stretch`}>
                  {participants.map((p, idx) => {
                    const isMe = p.userId === room.player.userId
                    return (
                      <div
                        key={p.userId || idx}
                        className="rounded-[14px] bg-white border border-[#dddddd] p-4 airbnb-shadow flex items-center justify-between h-full min-h-[72px]"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.displayName}
                            className="h-10 w-10 rounded-full border border-[#dddddd] bg-[#f7f7f7] object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#222222] flex items-center gap-1.5 flex-wrap">
                              <span className="truncate">{p.displayName}</span>
                              {isMe && (
                                <span className="text-[10px] bg-[#ff385c]/10 text-[#ff385c] px-1.5 py-0.5 rounded-full font-mono font-bold">
                                  YOU
                                </span>
                              )}
                              {p.isBot && <Bot className="h-3 w-3 text-amber-500" />}
                            </div>
                            <span className="text-[11px] text-[#6a6a6a]">
                              {idx === 0 ? 'Host' : `Contender #${idx}`}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-medium shrink-0">
                          {p.hasSubmitted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 font-bold">
                              <CheckCircle2 className="h-3 w-3" /> Submitted
                            </span>
                          ) : isMe ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-[#c13515] border border-rose-200 px-2.5 py-1 font-bold animate-pulse">
                              <Mic className="h-3 w-3" /> Recording...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 font-bold">
                              <Volume2 className="h-3 w-3 animate-bounce" /> Speaking...
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Video Player + Transcript + Audio Recorder */}
            {clip && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: YouTube Segment Player & Transcript */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <YouTubePlayer
                    key={clip.id}
                    videoId={clip.youtubeVideoId}
                    title={clip.title}
                    thumbnailUrl={clip.thumbnailUrl}
                    sourceUrl={clip.sourceUrl}
                    startTimeSec={clip.startTimeSec}
                    endTimeSec={clip.endTimeSec}
                    autoPlay={true}
                  />

                  {/* Target Transcript Card */}
                  <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
                    <div className="flex items-center justify-between mb-2.5 border-b border-[#ebebeb] pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                        Battle Transcript
                      </span>
                      <span className="text-[11px] font-mono text-[#222222] bg-[#f7f7f7] border border-[#dddddd] px-2.5 py-0.5 rounded-full font-semibold">
                        Standard Benchmark
                      </span>
                    </div>

                    <blockquote className="text-base sm:text-lg font-normal text-[#222222] leading-relaxed bg-[#f7f7f7] p-4 rounded-xl border border-[#ebebeb]">
                      "{clip.referenceText}"
                    </blockquote>
                  </div>
                </div>

                {/* Right: Audio Recorder & Submission Pod */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {room.player.hasSubmitted ? (
                    <div className="rounded-[14px] border border-[#10b981]/40 bg-emerald-50/40 p-8 text-center flex flex-col items-center justify-center airbnb-shadow">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3 animate-pulse">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-bold text-[#222222] mb-1">
                        Recording Submitted!
                      </h3>
                      <p className="text-xs text-[#6a6a6a] max-w-xs">
                        {room.opponent?.hasSubmitted
                          ? 'Both contenders submitted. Evaluating pronunciation...'
                          : 'Waiting for opponent to finish their recording...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <AudioRecorder
                        maxDurationSec={clip.durationSec + 5}
                        onSubmit={handleSubmitAudio}
                        submitting={submitting}
                      />

                      {/* Alternate Quick Submit */}
                      <button
                        type="button"
                        onClick={handleQuickSubmit}
                        disabled={submitting}
                        className="btn-secondary w-full text-xs font-semibold h-[40px] rounded-lg"
                      >
                        <Send className="h-3.5 w-3.5 text-[#ff385c]" />
                        <span>Quick Submit for Demo <span className="font-mono text-[10px] text-[#929292]">[Shift+S]</span></span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ASSESSING / SUBMITTING STATE */}
        {(room.status === 'ASSESSING' || room.status === 'SUBMITTING') && (
          <div className="my-16 rounded-[14px] border border-[#dddddd] bg-white p-8 sm:p-12 airbnb-shadow text-center flex flex-col items-center justify-center">
            <div className="relative mb-6 flex items-center justify-center">
              <span className="h-16 w-16 rounded-full border-2 border-[#ff385c]/20 border-t-[#ff385c] animate-spin" />
              <Sparkles className="absolute h-6 w-6 text-[#ff385c] animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-[#222222] mb-1.5">
              Sealed AI Assessment in Progress
            </h2>
            <p className="text-xs sm:text-sm text-[#6a6a6a] max-w-lg mb-6 leading-relaxed">
              Evaluating speech accuracy, fluency rhythm, completeness, and prosody contours for both contenders independently. Scores remain sealed until verification is complete.
            </p>

            <div className="flex items-center gap-6 rounded-full bg-[#f7f7f7] border border-[#dddddd] px-6 py-2.5 text-xs text-[#222222] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                <span>Audio Stream Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                <span>Computing Battle Score</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
