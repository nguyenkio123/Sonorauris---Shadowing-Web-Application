import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Coins,
  Flame,
  Medal,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'
import { createRoom } from '../api'
import { AvatarWithFrame, resolveParticipantFrameId } from '../components/common/AvatarWithFrame'
import { useRoom } from '../hooks/useRoom'

export function BattleResultPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()

  const { room, loading, error } = useRoom(roomCode)
  const [rematching, setRematching] = useState(false)

  const handleRematch = async () => {
    if (!room || rematching) return
    setRematching(true)
    try {
      const newRoom = await createRoom(room.clipId, room.maxPlayers)
      navigate(`/battle/lobby?room=${newRoom.code}`)
    } catch (err) {
      console.error('Failed to create rematch room:', err)
      setRematching(false)
    }
  }

  if (loading && !room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#5B6780] text-xs font-sans">
        <span className="h-6 w-6 rounded-full border-2 border-[#4E9488]/30 border-t-[#4E9488] animate-spin mr-3" />
        Loading battle scoreboard...
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#222222] p-6 text-center font-sans">
        <div className="rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-8 max-w-md airbnb-shadow">
          <h2 className="text-xl font-bold text-[#c13515] mb-2">{error || 'Battle room not found'}</h2>
          <p className="text-xs text-[#6a6a6a] mb-6">Could not retrieve match results.</p>
          <Link
            to="/"
            className="btn-primary text-xs font-semibold px-4 py-2.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    )
  }

  const { player, opponent } = room
  const participants =
    room.participants && room.participants.length > 0
      ? room.participants
      : [player, ...(opponent ? [opponent] : [])]
  const isMultiplayer = participants.length > 2

  const myRank = player.rank || (player.outcome === 'WIN' ? 1 : 2)
  const outcome = player.outcome || 'DRAW'
  const playerScore = player.assessment?.battleScore || 0
  const opponentScore = opponent?.assessment?.battleScore || 0
  const scoreDiff = playerScore - opponentScore

  const getOutcomeStyle = () => {
    if (isMultiplayer) {
      if (myRank === 1) {
        return {
          title: 'CHAMPION • 1ST PLACE!',
          subtitle: `You conquered the ${participants.length}-player arena with a stunning Battle Score of ${playerScore}!`,
          badgeClass: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: <Trophy className="h-10 w-10 text-amber-500" />,
        }
      }
      if (myRank === 2) {
        return {
          title: 'RUNNER-UP • 2ND PLACE!',
          subtitle: `Silver finish! You outperformed ${participants.length - 2} other contender${participants.length - 2 > 1 ? 's' : ''} in the arena.`,
          badgeClass: 'bg-slate-100 border-slate-300 text-slate-800',
          icon: <Medal className="h-10 w-10 text-slate-500" />,
        }
      }
      if (myRank === 3) {
        return {
          title: 'PODIUM • 3RD PLACE!',
          subtitle: 'Bronze podium finish! Great shadowing cadence against tough sparring contenders.',
          badgeClass: 'bg-amber-50/60 border-amber-300 text-amber-900',
          icon: <Medal className="h-10 w-10 text-amber-700" />,
        }
      }
      return {
        title: `ARENA FINISH #${myRank}`,
        subtitle: `You finished #${myRank} out of ${participants.length} contenders. Review your errors and rematch!`,
        badgeClass: 'bg-rose-50 border-rose-300 text-rose-800',
        icon: <Swords className="h-10 w-10 text-[#c13515]" />,
      }
    }

    switch (outcome) {
      case 'WIN':
        return {
          title: 'VICTORY!',
          subtitle: 'You delivered superior pronunciation accuracy & natural flow!',
          badgeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          icon: <Trophy className="h-10 w-10 text-amber-500" />,
        }
      case 'LOSE':
        return {
          title: 'DEFEAT',
          subtitle: 'ShadowBot AI edged ahead this round. Review your pronunciation and take the rematch!',
          badgeClass: 'bg-rose-50 border-rose-300 text-rose-800',
          icon: <Swords className="h-10 w-10 text-[#c13515]" />,
        }
      case 'DRAW':
      default:
        return {
          title: 'TIED MATCH!',
          subtitle: 'Incredible precision! Both speakers achieved strictly identical composite Battle Scores.',
          badgeClass: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: <Flame className="h-10 w-10 text-amber-500" />,
        }
    }
  }

  const outcomeStyle = getOutcomeStyle()

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
            <span>Back to Catalog</span>
          </Link>

          <span className="font-mono text-xs font-bold text-[#222222] bg-[#f7f7f7] px-3.5 py-1 rounded-full border border-[#dddddd]">
            ROOM: {room.code}
          </span>
        </div>

        {/* HERO VICTORY / DEFEAT / DRAW BANNER (Airbnb Clean Card) */}
        <section className="relative overflow-hidden rounded-[14px] border border-[#dddddd] bg-white p-8 sm:p-10 mb-8 airbnb-shadow text-center flex flex-col items-center justify-center">
          <div className="mb-3">{outcomeStyle.icon}</div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs font-bold tracking-wider uppercase mb-2 ${outcomeStyle.badgeClass}`}
          >
            <span>{outcomeStyle.title}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-[#222222] mb-1.5">
            {outcome === 'WIN' ? 'Pronunciation Master!' : outcome === 'LOSE' ? 'Valiant Effort!' : 'Dead Heat!'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6a6a] max-w-lg mb-6 leading-relaxed">
            {outcomeStyle.subtitle}
          </p>

          {/* Reward Badges from Ledger */}
          <div className="flex items-center gap-5 bg-[#f7f7f7] border border-[#dddddd] px-6 py-2.5 rounded-full">
            <span className="text-[11px] uppercase font-bold text-[#6a6a6a] tracking-wider">
              Battle Payout:
            </span>
            <div className="flex items-center gap-1.5 font-bold text-[#460479] text-xs font-mono">
              <Zap className="h-4 w-4 fill-[#460479]" />
              <span>+{player.earnedXp || 0} XP</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-amber-600 text-xs font-mono">
              <Coins className="h-4 w-4 fill-amber-500" />
              <span>+{player.earnedCoins || 0} Coins</span>
            </div>
          </div>
        </section>

        {/* SCOREBOARD SECTION: MULTIPLAYER LEADERBOARD OR 1V1 DUEL */}
        {isMultiplayer ? (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#222222] flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>Arena Leaderboard ({participants.length} Players)</span>
              </h2>
              <span className="text-xs text-[#6a6a6a]">
                Ranked by Battle Score (AI Speech Assessment)
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {participants.map((p, idx) => {
                const isMe = p.userId === player.userId
                const rank = p.rank || idx + 1
                const score = p.assessment?.battleScore || 0

                const rankBadge =
                  rank === 1 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
                      <Trophy className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                      #1 CHAMPION
                    </span>
                  ) : rank === 2 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold font-mono">
                      <Medal className="h-3.5 w-3.5 text-slate-500" />
                      #2 RUNNER-UP
                    </span>
                  ) : rank === 3 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
                      <Medal className="h-3.5 w-3.5 text-amber-700" />
                      #3 3RD PLACE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold font-mono">
                      #{rank}
                    </span>
                  )

                return (
                  <div
                    key={p.userId || idx}
                    className={`rounded-[16px] border p-5 sm:p-6 transition-all duration-200 airbnb-shadow ${
                      isMe
                        ? 'border-rausch/40 bg-rose-50/20 ring-1 ring-rausch/30'
                        : rank === 1
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-[#dddddd] bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <AvatarWithFrame
                            avatarUrl={p.avatarUrl}
                            alt={p.displayName}
                            frameId={resolveParticipantFrameId(p.userId, p.isBot, idx)}
                            size="md"
                            showCrest={false}
                          />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#171B2A] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                            {rank}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-[#171B2A]">
                              {p.displayName}
                            </span>
                            {isMe && (
                              <span className="rounded-full bg-[#4E9488]/10 text-[#4E9488] px-2 py-0.5 text-[10px] font-bold font-mono">
                                YOU
                              </span>
                            )}
                            {p.isBot && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#171B2A]/10 text-[#171B2A] px-2 py-0.5 text-[10px] font-bold font-mono">
                                <Bot className="h-3 w-3" />
                                <span>BOT</span>
                              </span>
                            )}
                          </div>
                          <div className="mt-1">{rankBadge}</div>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 sm:text-right">
                        <div>
                          <span className="text-3xl sm:text-4xl font-bold text-[#171B2A] font-mono">
                            {score}
                          </span>
                          <span className="text-xs text-[#5B6780] ml-1 uppercase font-bold">
                            / 100
                          </span>
                          <div className="text-[10px] uppercase font-bold text-[#5B6780] tracking-wider">
                            Battle Score
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4 Metrics Bars */}
                    {p.assessment && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#ebebeb]">
                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                            <span>Accuracy</span>
                            <span className="text-[#4E9488] font-bold font-mono">
                              {p.assessment.accuracy}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                            <div
                              className="h-full bg-[#4E9488] rounded-full"
                              style={{ width: `${p.assessment.accuracy}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                            <span>Fluency</span>
                            <span className="text-[#171B2A] font-bold font-mono">
                              {p.assessment.fluency}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                            <div
                              className="h-full bg-[#171B2A] rounded-full"
                              style={{ width: `${p.assessment.fluency}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                            <span>Completeness</span>
                            <span className="text-amber-600 font-bold font-mono">
                              {p.assessment.completeness}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${p.assessment.completeness}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                            <span>Prosody</span>
                            <span className="text-[#4E9488] font-bold font-mono">
                              {p.assessment.prosody}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                            <div
                              className="h-full bg-[#4E9488] rounded-full"
                              style={{ width: `${p.assessment.prosody}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#171B2A] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#4E9488]" />
                <span>Contender Head-to-Head Comparison</span>
              </h2>
              <span className="text-xs text-[#5B6780]">
                Evaluated by Sonorauris Speech AI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
              {/* Player Card (5 Cols) */}
              <div
                className={`md:col-span-5 rounded-[14px] border p-6 flex flex-col justify-between h-full airbnb-shadow ${
                  outcome === 'WIN'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-[#dddddd] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      avatarUrl={player.avatarUrl}
                      alt={player.displayName}
                      frameId={resolveParticipantFrameId(player.userId, player.isBot, 0)}
                      size="md"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#171B2A] flex items-center gap-1.5">
                        <span>{player.displayName}</span>
                        <span className="text-[10px] bg-[#4E9488]/10 text-[#4E9488] px-2 py-0.5 rounded-full font-bold font-mono">
                          YOU
                        </span>
                      </div>
                      <span className="text-xs text-[#5B6780]">Host Contender</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-bold text-[#171B2A] font-mono">
                      {playerScore}
                    </span>
                    <div className="text-[10px] uppercase font-bold text-[#5B6780] tracking-wider">
                      Battle Score
                    </div>
                  </div>
                </div>

                {/* 4 Metrics Bars */}
                {player.assessment && (
                  <div className="space-y-2.5 pt-3 border-t border-[#ebebeb]">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Accuracy</span>
                        <span className="text-[#4E9488] font-bold font-mono">{player.assessment.accuracy}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#4E9488] rounded-full" style={{ width: `${player.assessment.accuracy}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Fluency</span>
                        <span className="text-[#171B2A] font-bold font-mono">{player.assessment.fluency}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#171B2A] rounded-full" style={{ width: `${player.assessment.fluency}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Completeness</span>
                        <span className="text-amber-600 font-bold font-mono">{player.assessment.completeness}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${player.assessment.completeness}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Prosody</span>
                        <span className="text-[#4E9488] font-bold font-mono">{player.assessment.prosody}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#4E9488] rounded-full" style={{ width: `${player.assessment.prosody}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Center VS Badge (1 Col) */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-2 my-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f9fa] border border-[#dddddd] font-bold text-xs text-[#171B2A]">
                  VS
                </div>
                <span
                  className={`text-[11px] font-mono font-bold mt-1 px-2 py-0.5 rounded-full ${
                    scoreDiff > 0
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-300'
                      : scoreDiff < 0
                      ? 'text-rose-700 bg-rose-50 border border-rose-300'
                      : 'text-amber-700 bg-amber-50 border border-amber-300'
                  }`}
                >
                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                </span>
              </div>

              {/* Opponent Card (5 Cols) */}
              <div
                className={`md:col-span-5 rounded-[14px] border p-6 flex flex-col justify-between h-full airbnb-shadow ${
                  outcome === 'LOSE'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-[#dddddd] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      avatarUrl={opponent?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowBot'}
                      alt={opponent?.displayName || 'Opponent'}
                      frameId={resolveParticipantFrameId(opponent?.userId, opponent?.isBot ?? true, 1)}
                      size="md"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#171B2A] flex items-center gap-1.5">
                        <span>{opponent?.displayName || 'ShadowBot AI'}</span>
                        <Bot className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="text-xs text-[#5B6780]">Challenger</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-bold text-[#171B2A] font-mono">
                      {opponentScore}
                    </span>
                    <div className="text-[10px] uppercase font-bold text-[#5B6780] tracking-wider">
                      Battle Score
                    </div>
                  </div>
                </div>

                {/* 4 Metrics Bars for Opponent */}
                {opponent?.assessment && (
                  <div className="space-y-2.5 pt-3 border-t border-[#ebebeb]">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Accuracy</span>
                        <span className="text-[#4E9488] font-bold font-mono">{opponent.assessment.accuracy}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#4E9488] rounded-full" style={{ width: `${opponent.assessment.accuracy}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Fluency</span>
                        <span className="text-[#171B2A] font-bold font-mono">{opponent.assessment.fluency}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#171B2A] rounded-full" style={{ width: `${opponent.assessment.fluency}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Completeness</span>
                        <span className="text-amber-600 font-bold font-mono">{opponent.assessment.completeness}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${opponent.assessment.completeness}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-[#171B2A] mb-1">
                        <span>Prosody</span>
                        <span className="text-[#4E9488] font-bold font-mono">{opponent.assessment.prosody}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#f0f3f5] overflow-hidden">
                        <div className="h-full bg-[#4E9488] rounded-full" style={{ width: `${opponent.assessment.prosody}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ACTION BUTTONS (REMATCH / CATALOG) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ebebeb] pt-6">
          <Link
            to="/"
            className="btn-secondary text-xs font-semibold h-[44px] px-5 rounded-lg w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Catalog</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              to={`/practice/${room.clipId}`}
              className="btn-secondary text-xs font-semibold h-[44px] px-5 rounded-lg flex-1 sm:flex-initial"
            >
              <span>Practice Solo</span>
            </Link>

            <button
              type="button"
              onClick={handleRematch}
              disabled={rematching}
              className="btn-primary text-xs font-semibold h-[44px] px-6 rounded-lg flex-1 sm:flex-initial active:scale-95 disabled:opacity-50"
            >
              {rematching ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Setting up Rematch...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Instant Rematch 1v1</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
