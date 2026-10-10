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
import { addBotToRoom, createRoom, getClips, joinRoom, setReady } from '../api'
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
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<number>(2)
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
      const newRoom = await createRoom(selectedClipId, selectedMaxPlayers)
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

  const handleAddBot = async () => {
    if (!activeCode) return
    try {
      await addBotToRoom(activeCode)
    } catch (err) {
      console.error('Failed to add bot to room:', err)
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
            <span className="rounded-full bg-[#f7f9fa] border border-[#dddddd] px-3.5 py-1 text-xs font-semibold text-[#171B2A] flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-[#4E9488]" />
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4E9488]/10 text-[#4E9488] mb-5">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-[#171B2A] mb-1.5">Create Battle Room</h2>
                <p className="text-xs text-[#5B6780] leading-relaxed mb-6 min-h-[40px]">
                  Host a multiplayer match (2–5 players) with a shareable 5-character code. AI sparring bots step in automatically to fill empty slots.
                </p>

                {/* Challenge Clip Selector */}
                <div className="mb-6">
                  <label htmlFor="challenge-clip-select" className="block text-xs font-semibold text-[#171B2A] uppercase tracking-wider mb-2">
                    Select Challenge Clip
                  </label>
                  <select
                    id="challenge-clip-select"
                    value={selectedClipId}
                    onChange={(e) => setSelectedClipId(e.target.value)}
                    className="w-full h-[46px] rounded-lg bg-[#f7f9fa] border border-[#dddddd] px-3.5 py-2.5 text-xs font-medium text-[#171B2A] focus:outline-none focus:border-[#171B2A] transition-colors"
                  >
                    {clips.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.difficulty}] {c.title} ({c.durationSec}s)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arena Capacity Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-[#171B2A] uppercase tracking-wider">
                      Arena Mode (Capacity)
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { count: 2, label: '2P', sub: '1v1 Duel' },
                      { count: 3, label: '3P', sub: 'Trio' },
                      { count: 4, label: '4P', sub: 'Squad' },
                      { count: 5, label: '5P', sub: 'Royale' },
                    ].map((mode) => (
                      <button
                        key={mode.count}
                        type="button"
                        onClick={() => setSelectedMaxPlayers(mode.count)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedMaxPlayers === mode.count
                            ? 'border-[#4E9488] bg-emerald-50/70 text-[#4E9488] ring-1 ring-[#4E9488]'
                            : 'border-[#dddddd] bg-[#f7f9fa] text-[#171B2A] hover:border-gray-400'
                        }`}
                      >
                        <div className="font-bold text-sm font-mono">{mode.label}</div>
                        <div className="text-[10px] text-gray-500 font-medium truncate">{mode.sub}</div>
                      </button>
                    ))}
                  </div>
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4E9488] mb-1 block">
                  Private Arena • {room?.maxPlayers || 2} Contenders
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#171B2A] tracking-widest bg-[#f7f9fa] px-4 py-1.5 rounded-xl border border-[#dddddd]">
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
                  <button
                    type="button"
                    onClick={handleAddBot}
                    className="btn-secondary text-xs font-semibold h-[40px] px-3.5 rounded-lg flex items-center gap-1.5 border-[#4E9488]/40 hover:border-[#4E9488]"
                    title="Ghép Bot AI sparring ngay lập tức"
                  >
                    <Bot className="h-4 w-4 text-[#4E9488]" />
                    <span>Thêm Bot AI</span>
                  </button>
                </div>
              </div>

              {currentClip && (
                <div className="text-center sm:text-right max-w-sm">
                  <span className="text-[10px] uppercase font-bold text-[#5B6780] tracking-wider">
                    Challenge Target
                  </span>
                  <h3 className="text-base font-semibold text-[#171B2A] line-clamp-1">
                    {currentClip.title}
                  </h3>
                  <p className="text-xs text-[#5B6780]">
                    {currentClip.topic} • <span className="font-mono">{currentClip.durationSec}s</span> duration
                  </p>
                </div>
              )}
            </div>

            {/* Error or Loading state */}
            {roomLoading && !room && (
              <div className="flex items-center justify-center py-12 text-[#5B6780] text-xs">
                <span className="h-5 w-5 rounded-full border-2 border-[#4E9488]/30 border-t-[#4E9488] animate-spin mr-2" />
                Connecting to room state...
              </div>
            )}

            {roomError && (
              <div className="rounded-xl border border-[#c13515]/30 bg-[#fff5f5] p-4 text-xs text-[#c13515]">
                {roomError}
              </div>
            )}

            {/* CONTENDER PODS (2 to 5 PLAYERS - FR-BAT-07) */}
            {room && (() => {
              const maxPlayers = room.maxPlayers || 2
              const participants = room.participants && room.participants.length > 0
                ? room.participants
                : [room.player, ...(room.opponent ? [room.opponent] : [])]
              const readyCount = participants.filter((p) => p.isReady).length
              const allReady = participants.length >= maxPlayers && participants.every((p) => p.isReady)

              const gridCols =
                maxPlayers === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : maxPlayers === 3
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

              return (
                <>
                  <div className={`grid ${gridCols} gap-4 sm:gap-6 items-stretch`}>
                    {Array.from({ length: maxPlayers }).map((_, idx) => {
                      const participant = participants[idx]

                      if (participant) {
                        const isMe = participant.userId === room.player.userId
                        return (
                          <div
                            key={participant.userId || idx}
                            className={`rounded-[14px] border p-5 sm:p-6 flex flex-col justify-between min-h-[200px] transition-all duration-200 ${
                              participant.isReady
                                ? 'border-[#10b981]/50 bg-emerald-50/30 airbnb-shadow'
                                : 'border-[#dddddd] bg-white airbnb-shadow'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <img
                                src={participant.avatarUrl}
                                alt={participant.displayName}
                                className="h-12 w-12 rounded-full border border-[#dddddd] bg-[#f7f9fa] object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-bold text-[#171B2A] truncate">
                                    {participant.displayName}
                                  </span>
                                  {isMe && (
                                    <span className="rounded-full bg-[#4E9488]/10 text-[#4E9488] px-2 py-0.5 text-[9px] font-bold font-mono">
                                      YOU
                                    </span>
                                  )}
                                  {participant.isBot && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#171B2A]/10 text-[#171B2A] px-2 py-0.5 text-[9px] font-bold font-mono">
                                      <Bot className="h-2.5 w-2.5" />
                                      <span>BOT</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-[#5B6780]">
                                  {idx === 0 ? 'Host' : `Challenger #${idx}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#ebebeb] pt-3.5 mt-4">
                              <span className="text-xs font-semibold text-[#5B6780]">Status</span>
                              {participant.isReady ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                                  <Check className="h-3 w-3" />
                                  <span>READY</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f9fa] border border-[#dddddd] px-2.5 py-0.5 text-xs font-medium text-[#5B6780]">
                                  <span>PREPARING...</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={`slot-empty-${idx}`}
                          className="rounded-[14px] border border-dashed border-gray-300 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
                        >
                          <div className="relative mb-2.5 flex items-center justify-center">
                            <span className="h-8 w-8 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin" />
                            <Users className="absolute h-3.5 w-3.5 text-[#4E9488]" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-800">
                            Waiting for gladiator #{idx + 1}...
                          </h4>
                          <p className="text-[11px] text-gray-500 max-w-[160px] mt-0.5 leading-tight">
                            Share room code or sparring bot will join automatically.
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* READY TOGGLE BUTTON */}
                  <div className="rounded-[14px] border border-[#dddddd] bg-white p-6 airbnb-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-[#6a6a6a] text-center sm:text-left">
                      {allReady ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-emerald-600" />
                          <span>All {maxPlayers} gladiators ready! Starting countdown...</span>
                        </span>
                      ) : room.player.isReady ? (
                        <span className="text-amber-600 font-semibold">
                          You are ready! Waiting for others ({readyCount}/{maxPlayers})...
                        </span>
                      ) : (
                        <span>
                          Click "I'm Ready" when you are prepared to shadow record.
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
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
