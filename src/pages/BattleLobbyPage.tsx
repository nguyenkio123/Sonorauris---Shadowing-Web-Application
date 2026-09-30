import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  PlusCircle,
  Swords,
  Users,
  Zap,
} from 'lucide-react'
import { createRoom, getClips, joinRoom, setReady } from '../api'
import { useRoom } from '../hooks/useRoom'
import type { Clip } from '../types/clip'

export function BattleLobbyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const queryRoom = searchParams.get('room')
  const queryClipId = searchParams.get('clipId')

  const [activeCode, setActiveCode] = useState<string | null>(queryRoom)
  const [clips, setClips] = useState<Clip[]>([])
  const [selectedClipId, setSelectedClipId] = useState<string>(queryClipId || 'clip-1')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Real-time room polling hook (survives F5)
  const { room, loading: roomLoading, error: roomError } = useRoom(activeCode || undefined)

  // Load clips for room creation selector
  useEffect(() => {
    async function load() {
      try {
        const data = await getClips()
        setClips(data)
        if (queryClipId && data.some((c) => c.id === queryClipId)) {
          setSelectedClipId(queryClipId)
        }
      } catch (err) {
        console.error('Failed to load clips for lobby', err)
      }
    }
    void load()
  }, [queryClipId])

  // Sync URL query when activeCode changes
  useEffect(() => {
    if (activeCode && searchParams.get('room') !== activeCode) {
      setSearchParams({ room: activeCode })
    }
  }, [activeCode, searchParams, setSearchParams])

  // Auto-redirect to battle arena once room is in COUNTDOWN or RECORDING
  useEffect(() => {
    if (room && (room.status === 'COUNTDOWN' || room.status === 'RECORDING')) {
      navigate(`/battle/room/${room.code}`)
    }
  }, [room, navigate])

  const handleCreateRoom = async () => {
    setCreating(true)
    setJoinError(null)
    try {
      const newRoom = await createRoom(selectedClipId)
      setActiveCode(newRoom.code)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return

    setJoining(true)
    setJoinError(null)
    try {
      const existing = await joinRoom(joinCodeInput.trim())
      setActiveCode(existing.code)
      setJoinCodeInput('')
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Invalid room code')
    } finally {
      setJoining(false)
    }
  }

  const handleCopyCode = async () => {
    if (!activeCode) return
    try {
      await navigator.clipboard.writeText(activeCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleToggleReady = async () => {
    if (!room) return
    try {
      await setReady(room.code, !room.player.isReady)
    } catch (err) {
      console.error('Failed to update ready state', err)
    }
  }

  const currentClip = clips.find((c) => c.id === (room?.clipId || selectedClipId))

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#222222] hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to practice catalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3.5 py-1 text-xs font-semibold text-[#222222] flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-[#ff385c]" />
              <span>1v1 Synchronized Arena</span>
            </span>
          </div>
        </div>

        {/* VIEW A: NO ACTIVE ROOM (CREATE OR JOIN) */}
        {!activeCode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Create Room Card */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 sm:p-8 airbnb-shadow flex flex-col justify-between h-full">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff385c]/10 text-[#ff385c] mb-5">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-[#222222] mb-1.5">Create Battle Room</h2>
                <p className="text-xs text-[#6a6a6a] leading-relaxed mb-6 min-h-[40px]">
                  Host a private 1v1 match with a shareable 5-character code. An AI sparring bot steps in automatically if practicing solo.
                </p>

                {/* Challenge Clip Selector */}
                <div className="mb-6">
                  <label htmlFor="challenge-clip-select" className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
                    Select Challenge Clip
                  </label>
                  <select
                    id="challenge-clip-select"
                    value={selectedClipId}
                    onChange={(e) => setSelectedClipId(e.target.value)}
                    className="w-full h-[46px] rounded-lg bg-[#f7f7f7] border border-[#dddddd] px-3.5 py-2.5 text-xs font-medium text-[#222222] focus:outline-none focus:border-[#222222] transition-colors"
                  >
                    {clips.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.difficulty}] {c.title} ({c.durationSec}s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={creating}
                  className="btn-primary w-full text-sm font-semibold h-[48px] rounded-lg disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Generating Room...</span>
                    </>
                  ) : (
                    <>
                      <Swords className="h-4 w-4" />
                      <span>Create Private Room</span>
                    </>
                  )}
                </button>
                <div className="text-center text-[11px] font-mono text-[#929292] pt-3">
                  Instant match code generated on click
                </div>
              </div>
            </div>

            {/* Join Room Card */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 sm:p-8 airbnb-shadow flex flex-col justify-between h-full">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#460479]/10 text-[#460479] mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-[#222222] mb-1.5">Join with Code</h2>
                <p className="text-xs text-[#6a6a6a] leading-relaxed mb-6 min-h-[40px]">
                  Have a 5-character room code from a friend? Enter it below to join their synchronized lobby.
                </p>

                <form id="join-room-form" onSubmit={handleJoinRoom} className="mb-6">
                  <label htmlFor="join-code-input" className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
                    Enter 5-Character Code
                  </label>
                  <input
                    id="join-code-input"
                    type="text"
                    maxLength={5}
                    placeholder="e.g. SH7A2"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full h-[46px] text-center tracking-widest font-mono text-xl font-bold uppercase rounded-lg bg-[#f7f7f7] border border-[#dddddd] px-4 py-2 text-[#222222] placeholder:text-[#929292] focus:outline-none focus:border-[#222222] transition-colors"
                  />

                  {joinError && (
                    <p className="text-xs text-[#c13515] font-semibold mt-2">
                      {joinError}
                    </p>
                  )}
                </form>
              </div>

              <div>
                <button
                  form="join-room-form"
                  type="submit"
                  disabled={joining || joinCodeInput.trim().length !== 5}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#222222] hover:bg-black px-6 h-[48px] text-sm font-semibold text-white transition-all disabled:opacity-50"
                >
                  {joining ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Enter Room</span>
                    </>
                  )}
                </button>
                <div className="text-center text-[11px] font-mono text-[#929292] pt-3">
                  Live State Sync via Polling • F5 Resilient
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: ACTIVE ROOM WAITING LOBBY */}
        {activeCode && (
          <div className="flex flex-col gap-6">
            {/* Room Header & Code Banner */}
            <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 sm:p-8 airbnb-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff385c] mb-1 block">
                  Private 1v1 Room
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#222222] tracking-widest bg-[#f7f7f7] px-4 py-1.5 rounded-xl border border-[#dddddd]">
                    {activeCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-secondary text-xs font-semibold h-[40px] px-3.5 rounded-lg"
                    title="Copy room code"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-[#10b981]" />
                        <span className="text-[#10b981]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {currentClip && (
                <div className="text-center sm:text-right max-w-sm">
                  <span className="text-[10px] uppercase font-bold text-[#6a6a6a] tracking-wider">
                    Challenge Target
                  </span>
                  <h3 className="text-base font-semibold text-[#222222] line-clamp-1">
                    {currentClip.title}
                  </h3>
                  <p className="text-xs text-[#6a6a6a]">
                    {currentClip.topic} • <span className="font-mono">{currentClip.durationSec}s</span> duration
                  </p>
                </div>
              )}
            </div>

            {/* Error or Loading state */}
            {roomLoading && !room && (
              <div className="flex items-center justify-center py-12 text-[#6a6a6a] text-xs">
                <span className="h-5 w-5 rounded-full border-2 border-[#ff385c]/30 border-t-[#ff385c] animate-spin mr-2" />
                Connecting to room state...
              </div>
            )}

            {roomError && (
              <div className="rounded-xl border border-[#c13515]/30 bg-[#fff5f5] p-4 text-xs text-[#c13515]">
                {roomError}
              </div>
            )}

            {/* 2 CONTENDER PODS (PLAYER VS OPPONENT) */}
            {room && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Pod 1: Host / Player */}
                <div
                  className={`rounded-[14px] border p-6 flex flex-col justify-between h-full min-h-[220px] transition-all duration-200 ${
                    room.player.isReady
                      ? 'border-[#10b981]/50 bg-emerald-50/30 airbnb-shadow'
                      : 'border-[#dddddd] bg-white airbnb-shadow'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={room.player.avatarUrl}
                      alt={room.player.displayName}
                      className="h-14 w-14 rounded-full border border-[#dddddd] bg-[#f7f7f7] object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#222222]">
                          {room.player.displayName}
                        </span>
                        <span className="rounded-full bg-[#ff385c]/10 text-[#ff385c] px-2 py-0.5 text-[10px] font-bold font-mono">
                          YOU
                        </span>
                      </div>
                      <span className="text-xs text-[#6a6a6a]">Host Contender</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#ebebeb] pt-4 mt-6">
                    <span className="text-xs font-semibold text-[#6a6a6a]">Status</span>
                    {room.player.isReady ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
                        <Check className="h-3.5 w-3.5" />
                        <span>READY</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3 py-1 text-xs font-medium text-[#6a6a6a]">
                        <span>NOT READY</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Pod 2: Opponent / Bot */}
                <div
                  className={`rounded-[14px] border p-6 flex flex-col justify-between h-full min-h-[220px] transition-all duration-200 ${
                    room.opponent?.isReady
                      ? 'border-[#10b981]/50 bg-emerald-50/30 airbnb-shadow'
                      : 'border-[#dddddd] bg-white airbnb-shadow'
                  }`}
                >
                  {room.opponent ? (
                    <>
                      <div className="flex items-center gap-4">
                        <img
                          src={room.opponent.avatarUrl}
                          alt={room.opponent.displayName}
                          className="h-14 w-14 rounded-full border border-[#dddddd] bg-[#f7f7f7] object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#222222]">
                              {room.opponent.displayName}
                            </span>
                            {room.opponent.isBot && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#460479]/10 text-[#460479] px-2 py-0.5 text-[10px] font-bold font-mono">
                                <Bot className="h-3 w-3" />
                                <span>BOT</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#6a6a6a]">Challenger</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#ebebeb] pt-4 mt-6">
                        <span className="text-xs font-semibold text-[#6a6a6a]">Status</span>
                        {room.opponent.isReady ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
                            <Check className="h-3.5 w-3.5" />
                            <span>READY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#dddddd] px-3 py-1 text-xs font-medium text-[#6a6a6a]">
                            <span>PREPARING...</span>
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full my-auto py-2">
                      <div className="relative mb-3 flex items-center justify-center">
                        <span className="h-10 w-10 rounded-full border-2 border-[#ff385c]/20 border-t-[#ff385c] animate-spin" />
                        <Users className="absolute h-4 w-4 text-[#ff385c]" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-1">
                        Waiting for Opponent...
                      </h4>
                      <p className="text-xs text-[#6a6a6a] max-w-xs">
                        Share the 5-character code with a friend, or ShadowBot will step in after ~3s.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* READY TOGGLE BUTTON */}
            {room && (
              <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 airbnb-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#6a6a6a] text-center sm:text-left">
                  {room.player.isReady && !room.opponent?.isReady ? (
                    <span className="text-amber-600 font-semibold">
                      You are Ready! Waiting for opponent to confirm readiness...
                    </span>
                  ) : room.player.isReady && room.opponent?.isReady ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      <span>Both contenders ready! Starting countdown...</span>
                    </span>
                  ) : (
                    <span>
                      Press Ready when you are prepared to shadow the clip.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveCode(null)}
                    className="btn-secondary text-xs font-medium h-[44px] px-5 rounded-lg"
                  >
                    Leave Lobby
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleReady}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg px-8 h-[44px] text-sm font-semibold text-white transition-all active:scale-95 ${
                      room.player.isReady
                        ? 'bg-[#c13515] hover:bg-[#b32505]'
                        : 'btn-primary'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span>{room.player.isReady ? 'Cancel Ready' : 'I AM READY!'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
