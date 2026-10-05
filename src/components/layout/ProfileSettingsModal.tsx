import React, { useEffect, useState, useRef } from 'react'
import {
  Check,
  Coins,
  Crown,
  Edit2,
  Flame,
  LogIn,
  LogOut,
  Mail,
  Mic,
  RotateCcw,
  Sparkles,
  Trophy,
  User,
  Volume2,
  X,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMe, getUserAttempts, resetDemo, setDisplayName } from '../../api'
import type { UserProfile } from '../../types/user'
import type { Attempt } from '../../types/attempt'
import { useAuth } from '../../context/AuthContext'

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated?: () => void
  onOpenAuth?: () => void
}

type TabType = 'ACCOUNT' | 'STATS' | 'AUDIO'

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  onOpenAuth,
}) => {
  const { user: authUser, signOut, isConfigured } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('ACCOUNT')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Mic test states
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [micVolume, setMicVolume] = useState(0)
  const [micStatus, setMicStatus] = useState<'IDLE' | 'LISTENING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const stopMicTest = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsTestingMic(false)
    setMicVolume(0)
  }

  const loadProfile = async () => {
    try {
      const [uData, attData] = await Promise.all([getMe(), getUserAttempts()])
      setUser(uData)
      setNameInput(uData.displayName)
      setAttempts(attData)
    } catch (err) {
      console.error('Failed to load profile data', err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void loadProfile()
      setIsEditingName(false)
      setFeedbackMsg(null)
      setMicStatus('IDLE')
    } else {
      stopMicTest()
    }
  }, [isOpen])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopMicTest()
    }
  }, [])

  if (!isOpen) return null

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || nameInput.trim() === user?.displayName) {
      setIsEditingName(false)
      return
    }

    setSavingName(true)
    setFeedbackMsg(null)
    try {
      const success = await setDisplayName(nameInput.trim())
      if (success) {
        setFeedbackMsg('Display name updated successfully!')
        setIsEditingName(false)
        await loadProfile()
        if (onProfileUpdated) onProfileUpdated()
      } else {
        setFeedbackMsg('Failed to update name. Please try again.')
      }
    } catch {
      setFeedbackMsg('Error saving name.')
    } finally {
      setSavingName(false)
    }
  }

  const startMicTest = async () => {
    setMicStatus('LISTENING')
    setIsTestingMic(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioContextRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        setMicVolume(Math.min(100, Math.round((average / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(checkVolume)
      }

      checkVolume()

      // Automatically succeed after 3 seconds of active monitoring
      setTimeout(() => {
        setMicStatus('SUCCESS')
      }, 3000)
    } catch (err) {
      console.error('Mic access error', err)
      setMicStatus('ERROR')
      setIsTestingMic(false)
    }
  }

  const handleResetData = async () => {
    if (window.confirm('Reset all demo state to pristine initial data (120 XP, 45 Coins, 3d Streak)?')) {
      await resetDemo()
      window.location.reload()
    }
  }

  // Calculate career statistics
  const totalAttempts = attempts.length
  const bestScore = attempts.reduce((max, a) => Math.max(max, a.result.battleScore), 0)
  const avgScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.result.battleScore, 0) / totalAttempts)
      : 0

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
        <div className="flex items-start justify-between border-b border-[#ebebeb] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4E9488]/10 border border-[#4E9488]/20 flex items-center justify-center text-[#4E9488] shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#171B2A]">Account & Settings</h3>
              <p className="text-xs text-[#5B6780] mt-0.5">
                Manage your profile identity, learning stats, and device preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#ebebeb] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('ACCOUNT')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ACCOUNT'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            Account Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'STATS'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            Stats & Records
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIO')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'AUDIO'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            Audio & Device
          </button>
        </div>

        {/* Notification Feedback */}
        {feedbackMsg && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* TAB 1: ACCOUNT IDENTITY */}
        {activeTab === 'ACCOUNT' && user && (
          <div className="flex flex-col gap-5">
            {/* User Avatar + Title Card */}
            <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-14 w-14 rounded-full bg-white object-cover ring-2 ring-[#4E9488]/30 shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[#171B2A]">{user.displayName}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#4E9488] bg-[#4E9488]/10 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3 fill-current" />
                      {user.equippedTitle || 'Shadowing Learner'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6780] mt-0.5">
                    Account ID: <span className="font-mono text-gray-500">{user.id}</span>
                  </p>
                </div>
              </div>

              {/* Link to Cosmetics Shop to customize */}
              <Link
                to="/shop"
                onClick={onClose}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dddddd] bg-white text-xs font-semibold text-[#171B2A] hover:border-[#171B2A] hover:shadow-xs transition-all"
                title="Change Avatar, Frame, or Title"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4E9488]" />
                <span className="hidden sm:inline">Shop Wardrobe</span>
              </Link>
            </div>

            {/* Edit Display Name Form */}
            <div className="p-4 rounded-2xl border border-[#ebebeb] bg-white">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="display-name-input" className="text-xs font-bold text-[#171B2A] uppercase tracking-wider">
                  Display Name
                </label>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-semibold text-[#4E9488] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change Name</span>
                  </button>
                )}
              </div>

              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-2">
                  <input
                    id="display-name-input"
                    type="text"
                    maxLength={30}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your nickname..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#171B2A] focus:outline-none focus:ring-2 focus:ring-[#4E9488]/30 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={savingName || !nameInput.trim()}
                    className="px-3 py-2 rounded-xl bg-[#171B2A] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false)
                      setNameInput(user.displayName)
                    }}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="text-sm font-medium text-[#222222] bg-[#f7f7f7] px-3 py-2 rounded-xl border border-[#ebebeb]">
                  {user.displayName}
                </div>
              )}
            </div>

            {/* Account Credentials & Sync Status */}
            <div className="rounded-xl border border-[#ebebeb] bg-[#f7f9fa] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5B6780] font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#171B2A]" />
                  <span>Email Account</span>
                </span>
                <span className="font-mono text-[#171B2A] font-semibold">
                  {authUser?.email || 'guest@sonorauris.com'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#ebebeb]">
                <span className="text-[#5B6780] font-medium">Account Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    authUser?.isGuest
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {authUser?.isGuest ? 'Guest (Local Sandbox)' : 'Verified Member'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#ebebeb]">
                <span className="text-[#5B6780] font-medium">Role & Privileges</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    authUser?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {authUser?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-purple-700" />}
                  <span>{authUser?.role === 'admin' ? 'Administrator' : 'Learner'}</span>
                </span>
              </div>

              {authUser?.role === 'admin' && (
                <div className="pt-2 border-t border-[#ebebeb]">
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span>Open Admin Console</span>
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-[#ebebeb] flex items-center justify-between gap-3">
                {authUser?.isGuest ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenAuth?.()
                    }}
                    className="w-full py-2 px-3 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In or Create Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      onClose()
                      await signOut()
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Architecture Notice */}
            <div className="text-[11px] text-[#5B6780] bg-white border border-[#dddddd] rounded-xl p-3 leading-relaxed">
              <span className="font-semibold text-[#171B2A]">Sync Architecture:</span>{' '}
              {isConfigured
                ? 'Connected to Supabase Cloud Auth. Your progress and rewards are automatically synchronized across all devices.'
                : 'Running in Local Sandbox Mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable multi-device Cloud Sync.'}
            </div>
          </div>
        )}

        {/* TAB 2: STATS & RECORDS */}
        {activeTab === 'STATS' && user && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Total XP */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#6a6a6a]">
                  <span>Total XP</span>
                  <Zap className="w-4 h-4 text-[#460479] fill-[#460479]" />
                </div>
                <div className="text-lg font-bold font-mono text-[#222222] mt-2">
                  {user.xp} XP
                </div>
              </div>

              {/* Coins */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#6a6a6a]">
                  <span>Coins Balance</span>
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-lg font-bold font-mono text-[#222222] mt-2">
                  {user.coins} 🪙
                </div>
              </div>

              {/* Streak */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#5B6780]">
                  <span>Active Streak</span>
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                </div>
                <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                  {user.streak} Days
                </div>
              </div>

              {/* Total Practices */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#5B6780]">
                  <span>Solo Sessions</span>
                  <Volume2 className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                  {totalAttempts}
                </div>
              </div>

              {/* Best Score */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#5B6780]">
                  <span>Best Score</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                  {bestScore > 0 ? `${bestScore}/100` : '—'}
                </div>
              </div>

              {/* Average Score */}
              <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#5B6780]">
                  <span>Avg Accuracy</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                  {avgScore > 0 ? `${avgScore}%` : '—'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              💡 <strong>Tip:</strong> Maintain a 7-day streak and achieve scores ≥ 85 to unlock exclusive titles in the Cosmetics Shop!
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO & DEVICE SETTINGS */}
        {activeTab === 'AUDIO' && (
          <div className="flex flex-col gap-5">
            {/* Microphone Diagnostics */}
            <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#4E9488]" />
                  <h4 className="text-xs font-bold text-[#171B2A] uppercase tracking-wider">
                    Microphone Input Test
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    micStatus === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : micStatus === 'ERROR'
                      ? 'bg-rose-100 text-rose-800'
                      : micStatus === 'LISTENING'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {micStatus === 'SUCCESS'
                    ? 'Working OK'
                    : micStatus === 'ERROR'
                    ? 'Permission Denied'
                    : micStatus === 'LISTENING'
                    ? 'Listening...'
                    : 'Ready'}
                </span>
              </div>

              <p className="text-xs text-[#5B6780] leading-relaxed mb-4">
                Test your browser microphone input to ensure clear audio shadowing recordings before entering 1v1 duels.
              </p>

              {/* Live Volume Meter */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-[11px] font-mono font-semibold text-gray-500 w-12">
                  {micVolume}%
                </div>
                <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4E9488] transition-all duration-75"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isTestingMic ? (
                  <button
                    type="button"
                    onClick={() => void startMicTest()}
                    className="px-4 py-2 rounded-xl bg-[#171B2A] text-white text-xs font-semibold hover:bg-black transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Test Microphone</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopMicTest}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-300 transition-all cursor-pointer"
                  >
                    Stop Test
                  </button>
                )}
              </div>
            </div>

            {/* Demo Reset Danger Zone */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900">Reset Demo Data</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Clear local records and return profile to pristine seed defaults (120 XP, 45 Coins).
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleResetData()}
                className="shrink-0 px-3 py-1.5 rounded-xl border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-[#6a6a6a] border-t border-[#ebebeb]">
          <span>Sonorauris MVP • Competitive Shadowing</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#f7f7f7] hover:bg-[#ebebeb] text-[#222222] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
