import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Coins,
  Cpu,
  Crown,
  Edit2,
  Flame,
  LogIn,
  LogOut,
  Mail,
  Mic,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Volume2,
  Zap,
} from '../components/icons'
import { getMe, getUserAttempts, resetDemo } from '../api'
import { updateCurrentUserProfile } from '../api/auth'
import {
  checkFasterWhisperHealth,
  getSpeechEngineMode,
  setSpeechEngineMode,
  type SpeechEngineMode,
  type WhisperHealthStatus,
} from '../api/azureSpeech'
import type { UserProfile } from '../types/user'
import type { Attempt } from '../types/attempt'
import { AvatarWithFrame } from '../components/common/AvatarWithFrame'
import { calculateLevelInfo } from '../config/scoring'
import { useAuth } from '../context/AuthContext'

type TabType = 'ACCOUNT' | 'STATS' | 'AUDIO'

export function ProfilePage() {
  const { user: authUser, signOut, isConfigured, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('ACCOUNT')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const levelInfo = calculateLevelInfo(user?.xp || 0)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Mic test states
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [micVolume, setMicVolume] = useState(0)
  const [micStatus, setMicStatus] = useState<'IDLE' | 'LISTENING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [engineMode, setEngineModeState] = useState<SpeechEngineMode>(() => getSpeechEngineMode())
  const [whisperHealth, setWhisperHealth] = useState<WhisperHealthStatus | null>(null)
  const [pingingWhisper, setPingingWhisper] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const runWhisperPing = async () => {
    setPingingWhisper(true)
    const status = await checkFasterWhisperHealth()
    setWhisperHealth(status)
    setPingingWhisper(false)
  }

  const handleEngineChange = (mode: SpeechEngineMode) => {
    setSpeechEngineMode(mode)
    setEngineModeState(mode)
  }

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function init() {
      try {
        const [uData, attData, whisperStatus] = await Promise.all([
          getMe(),
          getUserAttempts(),
          checkFasterWhisperHealth(),
        ])
        if (!active) return
        setUser(uData)
        setNameInput(uData.displayName)
        setEmailInput(authUser?.email || '')
        setAttempts(attData)
        setWhisperHealth(whisperStatus)
      } catch (err) {
        console.error('Failed to load profile data', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    void init()
    return () => {
      active = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close()
      }
    }
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentEmail = authUser?.email || ''
    if (
      nameInput.trim() === user?.displayName &&
      emailInput.trim().toLowerCase() === currentEmail.toLowerCase()
    ) {
      setIsEditingName(false)
      return
    }

    setSavingName(true)
    setFeedbackMsg(null)
    setErrorMsg(null)
    try {
      const res = await updateCurrentUserProfile({
        displayName: nameInput,
        email: emailInput,
      })
      setFeedbackMsg(res.message)
      setIsEditingName(false)
      await Promise.all([loadProfile(), refreshUser()])
      window.dispatchEvent(new Event('shadowing_user_updated'))
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving profile.')
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

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

  const totalAttempts = attempts.length
  const bestScore = attempts.reduce((max, a) => Math.max(max, a.result.battleScore), 0)
  const avgScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.result.battleScore, 0) / totalAttempts)
      : 0

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-[#171B2A] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#171B2A] hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to practice catalog</span>
          </Link>

          <span className="rounded-full bg-white border border-[#e2e6ea] px-3.5 py-1 text-xs font-semibold text-[#171B2A]">
            Profile &amp; Preferences
          </span>
        </div>

        {/* Main Profile Card */}
        <div className="rounded-3xl bg-white border border-[#e2e6ea] airbnb-shadow p-6 sm:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3.5 border-b border-[#ebebeb] pb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#4E9488]/10 border border-[#4E9488]/20 flex items-center justify-center text-[#4E9488] shadow-xs shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#171B2A]">Account &amp; Settings</h1>
              <p className="text-xs text-[#5B6780] mt-0.5">
                Manage your profile identity, learning stats, and device preferences.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#ebebeb] pb-1 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('ACCOUNT')}
              className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
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
              className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'STATS'
                  ? 'border-[#4E9488] text-[#171B2A]'
                  : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
              }`}
            >
              Stats &amp; Records
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('AUDIO')}
              className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'AUDIO'
                  ? 'border-[#4E9488] text-[#171B2A]'
                  : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
              }`}
            >
              Audio &amp; Device
            </button>
          </div>

          {/* Notification Feedback */}
          {feedbackMsg && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-[#5B6780]">
              <span className="h-5 w-5 rounded-full border-2 border-[#4E9488]/30 border-t-[#4E9488] animate-spin mr-2" />
              Loading profile...
            </div>
          ) : (
            <>
              {/* TAB 1: ACCOUNT IDENTITY */}
              {activeTab === 'ACCOUNT' && user && (
                <div className="flex flex-col gap-5">
                  {/* User Avatar + Title Card */}
                  <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <AvatarWithFrame
                          avatarUrl={user.avatarUrl}
                          alt={user.displayName}
                          frameId={user.equippedFrameId}
                          size="lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-[#171B2A] truncate">{user.displayName}</h2>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#460479] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            <Zap className="w-3 h-3 fill-current" />
                            Lv.{levelInfo.level} · {levelInfo.rankName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#4E9488] bg-[#4E9488]/10 px-2 py-0.5 rounded-full">
                            <Crown className="w-3 h-3 fill-current" />
                            {user.equippedTitle || 'Shadowing Learner'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5B6780] mt-0.5 truncate">
                          Account ID: <span className="font-mono text-gray-500">{user.id}</span>
                        </p>
                        <div className="mt-2 max-w-xs">
                          <div className="flex items-center justify-between text-[10px] text-[#5B6780] mb-1">
                            <span>Level Progress</span>
                            <span className="font-mono font-semibold text-[#171B2A]">
                              {levelInfo.xpIntoLevel}/{levelInfo.xpNeededForNext} XP
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#ebebeb] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#4E9488] transition-all duration-300"
                              style={{ width: `${levelInfo.progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/shop"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dddddd] bg-white text-xs font-semibold text-[#171B2A] hover:border-[#171B2A] hover:shadow-xs transition-all"
                      title="Change Avatar, Frame, or Title"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4E9488]" />
                      <span>Shop Wardrobe</span>
                    </Link>
                  </div>

                  {/* Edit Display Name & Email Form */}
                  <div className="p-4 rounded-2xl border border-[#ebebeb] bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#171B2A] uppercase tracking-wider">
                        Name &amp; Email
                      </span>
                      {!isEditingName && (
                        <button
                          type="button"
                          onClick={() => {
                            setNameInput(user.displayName)
                            setEmailInput(authUser?.email || '')
                            setErrorMsg(null)
                            setIsEditingName(true)
                          }}
                          className="text-xs font-semibold text-[#4E9488] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Info</span>
                        </button>
                      )}
                    </div>

                    {isEditingName ? (
                      <form onSubmit={handleSaveProfile} className="space-y-3">
                        <div>
                          <label htmlFor="display-name-input" className="block text-[11px] font-semibold text-[#5B6780] mb-1">
                            Display Name
                          </label>
                          <input
                            id="display-name-input"
                            type="text"
                            maxLength={30}
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Enter your nickname..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#171B2A] focus:outline-none focus:ring-2 focus:ring-[#4E9488]/30 font-medium"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label htmlFor="profile-email-input" className="block text-[11px] font-semibold text-[#5B6780] mb-1">
                            Email Address
                          </label>
                          <input
                            id="profile-email-input"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#171B2A] focus:outline-none focus:ring-2 focus:ring-[#4E9488]/30 font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={savingName || !nameInput.trim() || !emailInput.trim()}
                            className="px-4 py-2 rounded-xl bg-[#171B2A] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {savingName ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingName(false)
                              setErrorMsg(null)
                              setNameInput(user.displayName)
                              setEmailInput(authUser?.email || '')
                            }}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#f7f7f7] px-3 py-2 rounded-xl border border-[#ebebeb]">
                          <div className="text-[10px] font-bold uppercase text-[#5B6780]">Display Name</div>
                          <div className="text-sm font-medium text-[#222222] mt-0.5 truncate">{user.displayName}</div>
                        </div>
                        <div className="bg-[#f7f7f7] px-3 py-2 rounded-xl border border-[#ebebeb]">
                          <div className="text-[10px] font-bold uppercase text-[#5B6780]">Email</div>
                          <div className="text-sm font-mono text-[#222222] mt-0.5 truncate">
                            {authUser?.email || 'guest@sonorauris.com'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Credentials & Sync Status */}
                  <div className="rounded-xl border border-[#ebebeb] bg-[#f7f9fa] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
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
                      <span className="text-[#5B6780] font-medium">Role &amp; Privileges</span>
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
                          onClick={() => navigate('/login')}
                          className="w-full py-2 px-3 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Sign In or Create Account</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await signOut()
                            navigate('/login')
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
                  <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#460479] bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          Lv.{levelInfo.level}
                        </span>
                        <span className="text-sm font-bold text-[#171B2A]">{levelInfo.rankName}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#5B6780]">
                        {levelInfo.xpIntoLevel} / {levelInfo.xpNeededForNext} XP to Lv.{levelInfo.level + 1}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#ebebeb] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4E9488] transition-all duration-300"
                        style={{ width: `${levelInfo.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#6a6a6a]">
                        <span>Total XP</span>
                        <Zap className="w-4 h-4 text-[#460479] fill-[#460479]" />
                      </div>
                      <div className="text-lg font-bold font-mono text-[#222222] mt-2">
                        {user.xp} XP
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#6a6a6a]">
                        <span>Coins Balance</span>
                        <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-[#222222] mt-2">
                        {user.coins}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#5B6780]">
                        <span>Active Streak</span>
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                        {user.streak} Days
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#5B6780]">
                        <span>Solo Sessions</span>
                        <Volume2 className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                        {totalAttempts}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#ebebeb] bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#5B6780]">
                        <span>Best Score</span>
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-[#171B2A] mt-2">
                        {bestScore > 0 ? `${bestScore}/100` : '—'}
                      </div>
                    </div>

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
                    <strong>Tip:</strong> Maintain a 7-day streak and achieve scores &ge; 85 to unlock exclusive titles in the Cosmetics Shop!
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIO & DEVICE SETTINGS */}
              {activeTab === 'AUDIO' && (
                <div className="flex flex-col gap-5">
                  {/* Speech AI Engine */}
                  <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#4E9488]" />
                        <h3 className="text-xs font-bold text-[#171B2A] uppercase tracking-wider">
                          Speech AI Assessment Engine
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            whisperHealth?.online
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {whisperHealth?.online
                            ? `Faster-Whisper Online · ${whisperHealth.latencyMs}ms`
                            : 'Faster-Whisper :8000 Offline'}
                        </span>
                        <button
                          type="button"
                          onClick={() => void runWhisperPing()}
                          disabled={pingingWhisper}
                          title="Ping http://localhost:8000/health"
                          aria-label="Ping local faster-whisper server"
                          className="p-1 text-[#5B6780] hover:text-[#171B2A] transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${pingingWhisper ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#5B6780] leading-relaxed mb-3">
                      Choose your preferred pronunciation assessment tier. Start the local Python microservice with{' '}
                      <code className="font-mono text-[11px] bg-[#f0f3f5] px-1.5 py-0.5 text-[#171B2A]">
                        uvicorn server.whisper_server:app --port 8000
                      </code>{' '}
                      for zero-cost offline Needleman-Wunsch phonetic alignment.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {(
                        [
                          { id: 'auto', label: 'Auto Cascade (Tier 1 → 2 → 3)' },
                          { id: 'faster-whisper', label: 'Force Tier 2: Faster-Whisper' },
                          { id: 'azure', label: 'Force Tier 1: Azure Cloud' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleEngineChange(opt.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            engineMode === opt.id
                              ? 'bg-[#171B2A] text-white'
                              : 'bg-[#f0f3f5] text-[#5B6780] hover:text-[#171B2A]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Microphone Diagnostics */}
                  <div className="p-4 rounded-2xl border border-[#ebebeb] bg-[#fcfcfc]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#4E9488]" />
                        <h3 className="text-xs font-bold text-[#171B2A] uppercase tracking-wider">
                          Microphone Input Test
                        </h3>
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

                  {/* Progress Reset Danger Zone */}
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Reset Progress Data</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Clear local records and restore your profile to default stats.
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
