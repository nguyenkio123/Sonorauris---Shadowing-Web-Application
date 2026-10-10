import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Coins,
  Edit2,
  ExternalLink,
  Gift,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'
import {
  createAdminClip,
  createAdminUser,
  deleteAdminClip,
  deleteAdminUser,
  getAdminClips,
  getAdminStats,
  getAdminUsers,
  grantUserCurrency,
  grantUserItem,
  resetAdminClips,
  revokeUserItem,
  updateAdminClip,
  updateAdminUser,
} from '../api/admin'
import { toggleCurrentRole } from '../api/auth'
import { getUserInventory } from '../api/storage'
import { SHOP_ITEMS } from '../data/shopItems'
import { AvatarWithFrame, TitleEmblem } from '../components/common/AvatarWithFrame'
import type { AdminClipInput, AdminDashboardStats, AdminUserSummary } from '../types/admin'
import type { Clip, Difficulty, Topic } from '../types/clip'
import type { UserRole } from '../types/auth'
import type { ShopItem } from '../types/shop'
import { useAuth } from '../context/AuthContext'

type TabType = 'OVERVIEW' | 'CLIPS' | 'USERS'

const TOPICS: Topic[] = [
  'Daily Life',
  'Work & Tech',
  'Movies & Culture',
  'Debate & Opinion',
  'Science & Nature',
]

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']

function extractYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  )
  return match ? match[1] : trimmed
}

export const AdminDashboardPage: React.FC = () => {
  const { user: authUser, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW')
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [clips, setClips] = useState<Clip[]>([])
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // Filters for Clips
  const [clipSearch, setClipSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')

  // Filters for Users
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')

  // Modals state
  const [isClipModalOpen, setIsClipModalOpen] = useState(false)
  const [editingClip, setEditingClip] = useState<Clip | null>(null)

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null)

  const [grantModalUser, setGrantModalUser] = useState<AdminUserSummary | null>(null)
  const [grantSubTab, setGrantSubTab] = useState<'CURRENCY' | 'ITEMS'>('CURRENCY')
  const [xpDelta, setXpDelta] = useState<number>(100)
  const [coinsDelta, setCoinsDelta] = useState<number>(50)
  const [grantReason, setGrantReason] = useState<string>('Admin bonus')
  const [isGranting, setIsGranting] = useState(false)

  // Clip Form State
  const [clipForm, setClipForm] = useState<AdminClipInput>({
    youtubeVideoId: '',
    title: '',
    channelName: '',
    startTimeSec: 0,
    endTimeSec: 20,
    referenceText: '',
    topic: 'Daily Life',
    difficulty: 'Intermediate',
  })

  // User Form State
  const [userForm, setUserForm] = useState({
    email: '',
    displayName: '',
    password: '',
    role: 'user' as UserRole,
    initialXp: 100,
    initialCoins: 50,
  })

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [sData, cData, uData] = await Promise.all([
        getAdminStats(),
        getAdminClips(),
        getAdminUsers(),
      ])
      setStats(sData)
      setClips(cData)
      setUsers(uData)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setFeedback({ type: 'error', message: 'Failed to refresh admin data.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAllData()
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // --- CLIP ACTIONS ---
  const handleOpenAddClip = () => {
    setEditingClip(null)
    setClipForm({
      youtubeVideoId: '',
      title: '',
      channelName: '',
      startTimeSec: 0,
      endTimeSec: 25,
      referenceText: '',
      topic: 'Daily Life',
      difficulty: 'Intermediate',
    })
    setIsClipModalOpen(true)
  }

  const handleOpenEditClip = (clip: Clip) => {
    setEditingClip(clip)
    setClipForm({
      youtubeVideoId: clip.youtubeVideoId,
      title: clip.title,
      channelName: clip.channelName,
      startTimeSec: clip.startTimeSec,
      endTimeSec: clip.endTimeSec,
      referenceText: clip.referenceText,
      topic: clip.topic,
      difficulty: clip.difficulty,
    })
    setIsClipModalOpen(true)
  }

  const handleSaveClip = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = extractYouTubeId(clipForm.youtubeVideoId)
    if (!cleanId || cleanId.length !== 11) {
      showToast('error', 'Please provide a valid 11-character YouTube video ID or link.')
      return
    }
    if (clipForm.endTimeSec <= clipForm.startTimeSec) {
      showToast('error', 'End time must be greater than start time.')
      return
    }
    if (!clipForm.referenceText.trim()) {
      showToast('error', 'Reference transcript cannot be empty.')
      return
    }

    try {
      if (editingClip) {
        await updateAdminClip(editingClip.id, {
          ...clipForm,
          youtubeVideoId: cleanId,
          durationSec: clipForm.endTimeSec - clipForm.startTimeSec,
          thumbnailUrl: `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
          sourceUrl: `https://www.youtube.com/watch?v=${cleanId}`,
        })
        showToast('success', `Clip "${clipForm.title}" updated successfully!`)
      } else {
        await createAdminClip({
          ...clipForm,
          youtubeVideoId: cleanId,
        })
        showToast('success', `New clip "${clipForm.title}" added to library!`)
      }
      setIsClipModalOpen(false)
      await loadAllData()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save clip.')
    }
  }

  const handleDeleteClip = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await deleteAdminClip(id)
      showToast('success', `Deleted clip "${title}".`)
      await loadAllData()
    } catch {
      showToast('error', 'Failed to delete clip.')
    }
  }

  const handleResetClips = async () => {
    if (!window.confirm('Reset all clips back to the standard 20 curated clips?')) return
    try {
      await resetAdminClips()
      showToast('success', 'Clips library restored to default 20 clips!')
      await loadAllData()
    } catch {
      showToast('error', 'Failed to reset clips.')
    }
  }

  // --- USER ACTIONS ---
  const handleOpenAddUser = () => {
    setEditingUser(null)
    setUserForm({
      email: '',
      displayName: '',
      password: '',
      role: 'user',
      initialXp: 100,
      initialCoins: 50,
    })
    setIsUserModalOpen(true)
  }

  const handleOpenEditUser = (u: AdminUserSummary) => {
    setEditingUser(u)
    setUserForm({
      email: u.email,
      displayName: u.displayName,
      password: '',
      role: u.role,
      initialXp: u.xp,
      initialCoins: u.coins,
    })
    setIsUserModalOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, {
          displayName: userForm.displayName,
          email: userForm.email,
          role: userForm.role,
        })
        showToast('success', `User "${userForm.displayName}" updated successfully!`)
      } else {
        await createAdminUser({
          email: userForm.email,
          displayName: userForm.displayName,
          password: userForm.password || 'password123',
          role: userForm.role,
          initialXp: Number(userForm.initialXp) || 0,
          initialCoins: Number(userForm.initialCoins) || 0,
        })
        showToast('success', `Created user account for ${userForm.email}!`)
      }
      setIsUserModalOpen(false)
      await loadAllData()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save user.')
    }
  }

  const handleDeleteUser = async (u: AdminUserSummary) => {
    if (u.id === authUser?.id) {
      showToast('error', 'You cannot delete your own active admin session.')
      return
    }
    if (!window.confirm(`Delete user "${u.displayName}" (${u.email}) permanently?`)) return
    try {
      await deleteAdminUser(u.id)
      showToast('success', `User "${u.displayName}" deleted.`)
      await loadAllData()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete user.')
    }
  }

  // --- GRANT REWARDS & ITEMS ---
  const handleOpenGrantModal = (u: AdminUserSummary) => {
    setGrantModalUser(u)
    setGrantSubTab('CURRENCY')
    setXpDelta(100)
    setCoinsDelta(50)
    setGrantReason('Admin gift')
  }

  const handleGrantCurrency = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grantModalUser) return
    setIsGranting(true)
    try {
      const res = await grantUserCurrency(
        grantModalUser.id,
        Number(xpDelta) || 0,
        Number(coinsDelta) || 0,
        grantReason
      )
      showToast(
        'success',
        `Granted ${xpDelta >= 0 ? '+' : ''}${xpDelta} XP and ${coinsDelta >= 0 ? '+' : ''}${coinsDelta} Coins to ${grantModalUser.displayName}!`
      )
      setGrantModalUser({
        ...grantModalUser,
        xp: res.newXp,
        coins: res.newCoins,
      })
      await loadAllData()
    } catch {
      showToast('error', 'Failed to record currency adjustment.')
    } finally {
      setIsGranting(false)
    }
  }

  const handleToggleItem = async (item: ShopItem, isOwned: boolean) => {
    if (!grantModalUser) return
    try {
      if (isOwned) {
        await revokeUserItem(grantModalUser.id, item.id)
        showToast('success', `Revoked item "${item.name}" from ${grantModalUser.displayName}.`)
      } else {
        await grantUserItem(grantModalUser.id, item.id)
        showToast('success', `Unlocked item "${item.name}" for ${grantModalUser.displayName}!`)
      }
      await loadAllData()
    } catch {
      showToast('error', 'Failed to update item ownership.')
    }
  }

  const handleSwitchToLearner = async () => {
    try {
      await toggleCurrentRole()
      await refreshUser()
      navigate('/')
    } catch {
      showToast('error', 'Failed to switch role.')
    }
  }

  // Filtered lists
  const filteredClips = clips.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(clipSearch.toLowerCase()) ||
      c.channelName.toLowerCase().includes(clipSearch.toLowerCase()) ||
      c.referenceText.toLowerCase().includes(clipSearch.toLowerCase())
    const matchesTopic = selectedTopic === 'ALL' || c.topic === selectedTopic
    const matchesDiff = selectedDifficulty === 'ALL' || c.difficulty === selectedDifficulty
    return matchesSearch && matchesTopic && matchesDiff
  })

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-[#F7F9FA] pb-20">
      {/* Top Notification Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Admin Portal Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E6EA] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] transition-colors bg-[#F7F9FA] border border-[#E2E6EA] px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#171B2A] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#4E9488]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base text-[#171B2A] tracking-tight">
                    Sonorauris Admin Console
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6780]">
                  User & Video Management • Reward Ledger Distribution
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSwitchToLearner}
              title="Toggle role back to normal user mode"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Switch to Learner View</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-[#E2E6EA]">
              <img
                src={authUser?.avatarUrl}
                alt={authUser?.displayName}
                className="w-8 h-8 rounded-full ring-2 ring-[#4E9488]/30"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-[#171B2A]">{authUser?.displayName}</div>
                <div className="text-[10px] text-[#5B6780]">{authUser?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 border-t border-[#f0f2f5]">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#4E9488]" />
            <span>Overview & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLIPS')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'CLIPS'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Video className="w-4 h-4 text-[#4E9488]" />
            <span>Video & Clips ({clips.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'USERS'
                ? 'border-[#4E9488] text-[#171B2A]'
                : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Users className="w-4 h-4 text-[#4E9488]" />
            <span>Users & Grants ({users.length})</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Total Users</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalUsers ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Learners & Admins</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Admins</span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalAdmins ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Privileged accounts</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Practice Clips</span>
                  <Video className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalClips ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Curated references</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Attempts</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalAttempts ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Assessments recorded</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Ledger XP</span>
                  <Zap className="w-4 h-4 text-violet-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalCirculatingXp ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Total experience</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center justify-between text-[#5B6780] mb-2">
                  <span className="text-xs font-medium">Ledger Coins</span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#171B2A]">
                  {stats?.totalCirculatingCoins ?? '...'}
                </div>
                <div className="text-[10px] text-[#5B6780] mt-1">Total currency</div>
              </div>
            </div>

            {/* Quick Actions & Administrative Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E2E6EA] shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#4E9488]" />
                  <h3 className="font-bold text-base text-[#171B2A]">Quick Operations</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('CLIPS')
                      handleOpenAddClip()
                    }}
                    className="p-3.5 rounded-2xl border border-[#E2E6EA] hover:border-[#4E9488] bg-[#F7F9FA] hover:bg-emerald-50/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-semibold text-xs text-[#171B2A] flex items-center justify-between">
                      <span>+ Add Video Clip</span>
                      <Plus className="w-4 h-4 text-[#4E9488] group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[11px] text-[#5B6780] mt-1">
                      Add a new YouTube reference with timestamps & transcript.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('USERS')
                      handleOpenAddUser()
                    }}
                    className="p-3.5 rounded-2xl border border-[#E2E6EA] hover:border-[#4E9488] bg-[#F7F9FA] hover:bg-emerald-50/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-semibold text-xs text-[#171B2A] flex items-center justify-between">
                      <span>+ Create User</span>
                      <UserPlus className="w-4 h-4 text-[#4E9488] group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[11px] text-[#5B6780] mt-1">
                      Register a learner or administrator account.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetClips}
                    className="p-3.5 rounded-2xl border border-[#E2E6EA] hover:border-amber-300 bg-[#F7F9FA] hover:bg-amber-50/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-semibold text-xs text-[#171B2A] flex items-center justify-between">
                      <span>Reset Standard 20 Clips</span>
                      <RefreshCw className="w-4 h-4 text-amber-500 group-hover:rotate-180 transition-transform duration-300" />
                    </div>
                    <p className="text-[11px] text-[#5B6780] mt-1">
                      Restore the 20 YouTube clips across 5 topics & 3 levels.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={loadAllData}
                    className="p-3.5 rounded-2xl border border-[#E2E6EA] hover:border-[#171B2A] bg-[#F7F9FA] hover:bg-slate-100 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-semibold text-xs text-[#171B2A] flex items-center justify-between">
                      <span>Sync All Metrics</span>
                      <RefreshCw className={`w-4 h-4 text-[#171B2A] ${isLoading ? 'animate-spin' : ''}`} />
                    </div>
                    <p className="text-[11px] text-[#5B6780] mt-1">
                      Re-read database state and calculate zero-drift balances.
                    </p>
                  </button>
                </div>
              </div>

              {/* Zero-drift Ledger & Architecture Info */}
              <div className="p-6 rounded-3xl bg-white border border-[#E2E6EA] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-[#171B2A]">
                      Immutable Ledger Architecture (SRS Sec 9)
                    </h3>
                  </div>
                  <p className="text-xs text-[#5B6780] leading-relaxed">
                    Sonorauris enforces an append-only transaction ledger (`RewardTransaction`). When
                    an administrator grants Coins or XP to any user, the system commits an immutable
                    audit transaction with `referenceType: 'ADMIN_GRANT'`. Balance balances are
                    dynamically derived from the ledger at runtime, preventing balance drift and F5
                    duplication attacks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#f0f2f5] flex items-center justify-between text-xs text-[#5B6780]">
                  <span>Sandbox Engine: Active</span>
                  <span className="font-semibold text-[#171B2A]">
                    Version: Competition MVP v1.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIDEOS & CLIPS MANAGEMENT */}
        {activeTab === 'CLIPS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Action Bar & Filters */}
            <div className="p-4 rounded-3xl bg-white border border-[#E2E6EA] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6780]" />
                  <input
                    type="text"
                    placeholder="Search by title, channel, text..."
                    value={clipSearch}
                    onChange={(e) => setClipSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                {/* Topic Filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                >
                  <option value="ALL">All Topics ({clips.length})</option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                >
                  <option value="ALL">All Difficulties</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetClips}
                  className="px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reset 20 Default
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddClip}
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Clip</span>
                </button>
              </div>
            </div>

            {/* Clips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-white rounded-3xl border border-[#E2E6EA] overflow-hidden shadow-xs flex flex-col justify-between group hover:border-[#4E9488]/50 transition-all"
                >
                  <div>
                    {/* Thumbnail & Timing */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                          {clip.topic}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            clip.difficulty === 'Beginner'
                              ? 'bg-emerald-500/90 text-white'
                              : clip.difficulty === 'Intermediate'
                              ? 'bg-blue-500/90 text-white'
                              : 'bg-purple-500/90 text-white'
                          }`}
                        >
                          {clip.difficulty}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded-md text-[11px] font-mono text-white">
                        {clip.startTimeSec}s - {clip.endTimeSec}s ({clip.durationSec}s)
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#5B6780]">
                        <span className="font-semibold text-[#171B2A] truncate max-w-[180px]">
                          {clip.channelName}
                        </span>
                        <span className="font-mono text-gray-400">ID: {clip.youtubeVideoId}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#171B2A] line-clamp-1 group-hover:text-[#4E9488] transition-colors">
                        {clip.title}
                      </h4>
                      <p className="text-xs text-[#5B6780] line-clamp-3 bg-[#F7F9FA] p-2.5 rounded-xl border border-[#f0f2f5] font-serif italic">
                        "{clip.referenceText}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-2 border-t border-[#f0f2f5] flex items-center justify-between gap-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${clip.youtubeVideoId}&t=${clip.startTimeSec}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B6780] hover:text-[#171B2A] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </a>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditClip(clip)}
                        className="p-1.5 rounded-lg border border-[#E2E6EA] hover:border-[#171B2A] text-[#171B2A] hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Edit clip details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClip(clip.id, clip.title)}
                        className="p-1.5 rounded-lg border border-red-200 hover:border-red-500 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete clip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClips.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E2E6EA]">
                <p className="text-sm text-[#5B6780]">No clips match your current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS & REWARDS MANAGEMENT */}
        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* User Search & Creation Bar */}
            <div className="p-4 rounded-3xl bg-white border border-[#E2E6EA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6780]" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                >
                  <option value="ALL">All Roles ({users.length})</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Learners Only</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenAddUser}
                className="w-full sm:w-auto px-4 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User / Admin</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-[#E2E6EA] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#171B2A]">
                  <thead className="bg-[#F7F9FA] border-b border-[#E2E6EA] text-[#5B6780] font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Ledger XP</th>
                      <th className="py-3.5 px-4">Coins</th>
                      <th className="py-3.5 px-4">Streak</th>
                      <th className="py-3.5 px-4">Practices</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2f5]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl}
                              alt={u.displayName}
                              className="w-9 h-9 rounded-full ring-1 ring-[#E2E6EA] bg-gray-50"
                            />
                            <div>
                              <div className="font-bold text-sm text-[#171B2A] flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                {u.isGuest && (
                                  <span className="text-[10px] text-amber-700 font-normal">
                                    (Active Demo)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#5B6780]">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            <span>{u.role}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-violet-700">
                          {u.xp} XP
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-amber-600">
                          {u.coins}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#4E9488] font-semibold">
                          {u.streak}d
                        </td>

                        <td className="py-3.5 px-4 text-[#5B6780] font-mono">
                          {u.attemptsCount} attempts
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Grant Rewards & Items */}
                            <button
                              type="button"
                              onClick={() => handleOpenGrantModal(u)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Grant XP, Coins or Cosmetics"
                            >
                              <Gift className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Grant</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg border border-[#E2E6EA] hover:border-[#171B2A] text-[#171B2A] hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            {!u.isGuest && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-red-200 hover:border-red-500 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT CLIP */}
      {isClipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E6EA] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f2f5] mb-5">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#4E9488]" />
                <h3 className="font-bold text-lg text-[#171B2A]">
                  {editingClip ? 'Edit Video Clip' : 'Add New Shadowing Clip'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsClipModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                  YouTube Video Link or ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                  value={clipForm.youtubeVideoId}
                  onChange={(e) => setClipForm({ ...clipForm, youtubeVideoId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                />
                <span className="text-[10px] text-[#5B6780] mt-0.5 block">
                  Accepts standard YouTube URLs, short youtu.be links, or 11-char IDs.
                </span>
              </div>

              {/* YouTube Preview if ID valid */}
              {extractYouTubeId(clipForm.youtubeVideoId).length === 11 && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-[#E2E6EA] flex flex-col items-center">
                  <div className="aspect-video w-full max-w-sm rounded-xl overflow-hidden shadow-xs mb-2">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(
                        clipForm.youtubeVideoId
                      )}?start=${clipForm.startTimeSec}&end=${clipForm.endTimeSec}&autoplay=0`}
                      title="Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <span className="text-[11px] text-[#5B6780]">
                    Live Video Preview ({clipForm.startTimeSec}s to {clipForm.endTimeSec}s)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Clip Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Steve Jobs — Stay Hungry Stay Foolish"
                    value={clipForm.title}
                    onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={clipForm.channelName}
                    onChange={(e) => setClipForm({ ...clipForm, channelName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Start Sec *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={clipForm.startTimeSec}
                    onChange={(e) =>
                      setClipForm({ ...clipForm, startTimeSec: Math.max(0, Number(e.target.value)) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    End Sec *
                  </label>
                  <input
                    type="number"
                    min={clipForm.startTimeSec + 1}
                    value={clipForm.endTimeSec}
                    onChange={(e) =>
                      setClipForm({ ...clipForm, endTimeSec: Math.max(0, Number(e.target.value)) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">Topic</label>
                  <select
                    value={clipForm.topic}
                    onChange={(e) => setClipForm({ ...clipForm, topic: e.target.value as Topic })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={clipForm.difficulty}
                    onChange={(e) =>
                      setClipForm({ ...clipForm, difficulty: e.target.value as Difficulty })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                  Reference Transcript (Used by AI Pronunciation Assessment) *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter the exact English text spoken by the speaker during this interval..."
                  value={clipForm.referenceText}
                  onChange={(e) => setClipForm({ ...clipForm, referenceText: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488] leading-relaxed font-serif"
                />
              </div>

              <div className="pt-3 border-t border-[#f0f2f5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsClipModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E6EA] text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingClip ? 'Save Changes' : 'Create Clip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E6EA] shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f2f5] mb-5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#4E9488]" />
                <h3 className="font-bold text-lg text-[#171B2A]">
                  {editingUser ? 'Edit User Profile' : 'Create New User Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. learner@sonorauris.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={userForm.displayName}
                  onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] bg-white focus:outline-none focus:border-[#4E9488]"
                >
                  <option value="user">User (Learner)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                      Initial XP
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={userForm.initialXp}
                      onChange={(e) =>
                        setUserForm({ ...userForm, initialXp: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                      Initial Coins
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={userForm.initialCoins}
                      onChange={(e) =>
                        setUserForm({ ...userForm, initialCoins: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#f0f2f5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E6EA] text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save Updates' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GRANT REWARDS & ITEMS MODAL */}
      {grantModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E6EA] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-200">
            {/* Header with User Info */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f2f5] mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={grantModalUser.avatarUrl}
                  alt={grantModalUser.displayName}
                  className="w-11 h-11 rounded-full ring-2 ring-[#4E9488]/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#171B2A]">
                      Grant to {grantModalUser.displayName}
                    </h3>
                    <span className="text-xs text-[#5B6780]">({grantModalUser.email})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-0.5">
                    <span className="font-semibold text-violet-700">
                      Current XP: {grantModalUser.xp}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-amber-600">
                      Coins: {grantModalUser.coins}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGrantModalUser(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab selection */}
            <div className="flex gap-4 border-b border-[#f0f2f5] mb-5">
              <button
                type="button"
                onClick={() => setGrantSubTab('CURRENCY')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  grantSubTab === 'CURRENCY'
                    ? 'border-[#4E9488] text-[#171B2A]'
                    : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
                }`}
              >
                1. Grant XP & Coins (Ledger)
              </button>
              <button
                type="button"
                onClick={() => setGrantSubTab('ITEMS')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  grantSubTab === 'ITEMS'
                    ? 'border-[#4E9488] text-[#171B2A]'
                    : 'border-transparent text-[#5B6780] hover:text-[#171B2A]'
                }`}
              >
                2. Grant Cosmetics (Shop Inventory)
              </button>
            </div>

            {/* TAB CONTENT A: CURRENCY GRANT */}
            {grantSubTab === 'CURRENCY' && (
              <form onSubmit={handleGrantCurrency} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  Currency distributions are recorded directly into the user's permanent immutable
                  ledger with reference `ADMIN_GRANT`. You can also enter negative amounts to deduct.
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#171B2A]">XP Adjustment</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setXpDelta((p) => p + 100)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => setXpDelta((p) => p + 500)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => setXpDelta((p) => p + 1000)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +1,000
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={xpDelta}
                    onChange={(e) => setXpDelta(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs font-mono font-bold text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#171B2A]">
                      Coins Adjustment
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCoinsDelta((p) => p + 50)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoinsDelta((p) => p + 200)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +200
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoinsDelta((p) => p + 500)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-mono font-semibold"
                      >
                        +500
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={coinsDelta}
                    onChange={(e) => setCoinsDelta(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs font-mono font-bold text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                    Grant Reason / Audit Memo
                  </label>
                  <input
                    type="text"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    placeholder="e.g. Weekly Competition Champion, Bug Bounty reward..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-xs text-[#171B2A] focus:outline-none focus:border-[#4E9488]"
                  />
                </div>

                <div className="pt-3 border-t border-[#f0f2f5] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGrantModalUser(null)}
                    className="px-4 py-2 rounded-xl border border-[#E2E6EA] text-xs font-semibold text-[#5B6780] hover:text-[#171B2A] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isGranting}
                    className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isGranting ? 'Writing Ledger...' : 'Commit Currency Grant'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT B: COSMETIC ITEMS GRANT */}
            {grantSubTab === 'ITEMS' && (
              <div className="space-y-4">
                <p className="text-xs text-[#5B6780]">
                  Directly grant or revoke premium cosmetic items from the Shop without deducting
                  Coins.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {SHOP_ITEMS.map((item) => {
                    const userInv = grantModalUser ? getUserInventory(grantModalUser.id) : null
                    const isOwned = userInv ? userInv.ownedItemIds.includes(item.id) : false
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-[#E2E6EA] bg-[#F7F9FA] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.type === 'AVATAR' ? (
                            <AvatarWithFrame
                              avatarUrl={item.assetValue}
                              alt={item.name}
                              frameId="frame-none"
                              size="sm"
                            />
                          ) : item.type === 'FRAME' ? (
                            <AvatarWithFrame
                              avatarUrl={grantModalUser?.avatarUrl || ''}
                              alt={item.name}
                              frameId={item.id}
                              size="sm"
                            />
                          ) : (
                            <TitleEmblem titleId={item.id} size="sm" />
                          )}
                          <div>
                            <div className="font-bold text-xs text-[#171B2A] flex items-center gap-1.5">
                              <span>{item.name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  item.rarity === 'Legendary'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.rarity === 'Epic'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.rarity}
                              </span>
                              {isOwned && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-emerald-100 text-emerald-800">
                                  Owned
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#5B6780]">{item.type}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void handleToggleItem(item, isOwned)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] shadow-xs transition-colors cursor-pointer ${
                              isOwned
                                ? 'border border-red-200 hover:bg-red-50 text-red-600'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isOwned ? 'Revoke' : 'Grant'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-3 border-t border-[#f0f2f5] text-right">
                  <button
                    type="button"
                    onClick={() => setGrantModalUser(null)}
                    className="px-4 py-2 rounded-xl btn-primary text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
