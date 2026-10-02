import React, { useEffect, useState } from 'react'
import { Check, Coins, Sparkles, Trophy, X, Zap } from 'lucide-react'
import { claimQuest, getDailyQuests } from '../../api'
import type { DailyQuest } from '../../types/quest'

interface DailyQuestsModalProps {
  isOpen: boolean
  onClose: () => void
  onRewardClaimed?: () => void
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const loadQuests = async () => {
    try {
      const data = await getDailyQuests()
      setQuests(data)
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadQuests()
      setFeedbackMsg(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClaim = async (questId: string) => {
    setClaimingId(questId)
    setFeedbackMsg(null)
    try {
      const res = await claimQuest(questId)
      if (res.success) {
        setFeedbackMsg(res.message)
        await loadQuests()
        if (onRewardClaimed) onRewardClaimed()
      } else {
        setFeedbackMsg(res.message)
      }
    } finally {
      setClaimingId(null)
    }
  }

  const completedCount = quests.filter((q) => q.completed).length

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">Daily Quests</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rausch/10 text-rausch font-semibold">
                  {completedCount}/{quests.length} Completed
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete daily goals to earn bonus XP and Coins (resets at 00:00 UTC).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close daily quests"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner if claimed */}
        {feedbackMsg && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Quests list */}
        <div className="flex flex-col gap-3.5">
          {quests.map((quest) => {
            const progressPct = Math.round((quest.currentValue / quest.targetValue) * 100)

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all ${
                  quest.claimed
                    ? 'bg-gray-50/70 border-gray-200 opacity-80'
                    : quest.completed
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs ring-1 ring-amber-300/40'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{quest.title}</h4>
                      {quest.completed && !quest.claimed && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                          Ready to claim
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{quest.description}</p>
                  </div>

                  {/* Rewards preview */}
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-gray-700 bg-gray-100/80 px-2.5 py-1 rounded-lg">
                    <span className="text-rausch flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5 fill-current" />+{quest.rewardXp}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-amber-500 flex items-center gap-0.5">
                      <Coins className="w-3.5 h-3.5 fill-current" />+{quest.rewardCoins}
                    </span>
                  </div>
                </div>

                {/* Progress bar and Claim Button */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {quest.currentValue} / {quest.targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.completed ? 'bg-emerald-500' : 'bg-rausch'
                        }`}
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    {quest.claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 px-3 py-1.5 rounded-xl bg-gray-100">
                        <Check className="w-3.5 h-3.5 text-gray-400" /> Claimed
                      </span>
                    ) : quest.completed ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        disabled={claimingId === quest.id}
                        className="px-4 py-1.5 rounded-xl bg-rausch hover:bg-[#e0314f] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {claimingId === quest.id ? 'Claiming...' : 'Claim Reward'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-gray-400 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer tip */}
        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-100">
          Complete all 3 quests daily to earn up to <strong className="text-gray-700">75 XP</strong> and <strong className="text-gray-700">25 Coins</strong>!
        </div>
      </div>
    </div>
  )
}
