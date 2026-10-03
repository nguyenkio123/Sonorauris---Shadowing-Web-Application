import { Flame, Coins, Swords, Headphones, Sparkles, Trophy, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getDailyQuests, getMe } from '../../api'
import type { UserProfile } from '../../types/user'
import type { DailyQuest } from '../../types/quest'
import { DailyQuestsModal } from './DailyQuestsModal'
import { ProfileSettingsModal } from './ProfileSettingsModal'
import { useAuth } from '../../context/AuthContext'
import { AuthModal } from '../auth/AuthModal'

export function Header() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [isQuestsOpen, setIsQuestsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const data = await getMe()
        if (isMounted) {
          setUser(data)
        }
      } catch (err) {
        console.error('Failed to load user in header', err)
      }
    }

    const fetchQuests = async () => {
      try {
        const qData = await getDailyQuests()
        if (isMounted) {
          setQuests(qData)
        }
      } catch {
        // ignore
      }
    }

    void fetchUser()
    void fetchQuests()

    const handleStorageChange = () => {
      void fetchUser()
      void fetchQuests()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [location.pathname])

  const reloadData = async () => {
    try {
      const [uData, qData] = await Promise.all([getMe(), getDailyQuests()])
      setUser(uData)
      setQuests(qData)
    } catch {
      // ignore
    }
  }

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/practice') || location.pathname.startsWith('/result')
  const isBattleActive = location.pathname.startsWith('/battle')
  const isShopActive = location.pathname.startsWith('/shop')
  const completedCount = quests.filter((q) => q.completed).length
  const hasClaimable = quests.some((q) => q.completed && !q.claimed)

  return (
    <header className="sticky top-0 z-40 w-full h-[80px] bg-white border-b border-[#ebebeb]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo with Sonorauris Emblem from logo.jpe */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <img
            src="/logo.jpe"
            alt="Sonorauris Logo"
            className="h-9 w-9 rounded-xl object-cover shadow-xs transition-transform duration-150 group-hover:scale-105 border border-[#e2e6ea]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[19px] tracking-tight text-[#171B2A] group-hover:text-[#4E9488] transition-colors">
                Sonorauris
              </span>
              <span className="new-tag">
                MVP
              </span>
            </div>
            <p className="hidden text-[11px] text-[#5B6780] sm:block">
              English Shadowing Arena
            </p>
          </div>
        </Link>

        {/* Center Product Navigation Tabs — Clean Minimalist Airbnb Pattern */}
        <nav className="flex items-center h-full gap-2 sm:gap-6">
          {/* Product Tab 1: Practice */}
          <Link
            to="/"
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isHomeActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Headphones className="h-4 w-4" />
            <span>Practice</span>
            {isHomeActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>

          {/* Product Tab 2: 1v1 Battle Arena */}
          <Link
            to="/battle/lobby"
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isBattleActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>1v1 Battle</span>
            <span className="new-tag">LIVE</span>
            {isBattleActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>

          {/* Product Tab 3: Shop */}
          <Link
            to="/shop"
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isShopActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#4E9488]" />
            <span>Shop</span>
            {isShopActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>
        </nav>

        {/* Right Utilities: Quests, Quick Stats, and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <>
              {/* Daily Quests Trigger Button (English, FR-QUEST-01) */}
              <button
                type="button"
                onClick={() => setIsQuestsOpen(true)}
                title={`Daily Quests (${completedCount}/${quests.length || 3})`}
                className="relative flex items-center gap-1.5 rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-3 py-1.5 text-xs font-medium text-[#171B2A] hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer group"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[12px] hidden md:inline">Quests</span>
                <span className="font-mono text-[11px] text-gray-500">
                  {completedCount}/{quests.length || 3}
                </span>
                {hasClaimable && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E9488] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4E9488]"></span>
                  </span>
                )}
              </button>

              {/* Unified Quick Currency Pill: Streak & Coins */}
              <Link
                to="/shop"
                title={`${user.streak} days active streak • ${user.coins} Coins (Click to visit Shop)`}
                className="flex items-center gap-2.5 rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-3 py-1.5 text-xs font-semibold text-[#171B2A] hover:border-[#171B2A]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 text-[#4E9488]">
                  <Flame className="h-3.5 w-3.5 fill-[#4E9488] group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[12px]">{user.streak}d</span>
                </div>
                <div className="h-3 w-px bg-[#dddddd]" />
                <div className="flex items-center gap-1 text-amber-600">
                  <Coins className="h-3.5 w-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[12px]">{user.coins}</span>
                </div>
              </Link>

              {/* Sign In Button for Guest / Anonymous Users */}
              {authUser?.isGuest && (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#171B2A] hover:bg-[#2b3445] text-white text-xs font-semibold px-3 py-1.5 transition-all shadow-xs cursor-pointer"
                  title="Sign In or Register"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Profile & Settings Trigger */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 rounded-full border border-[#dddddd] p-1 pr-3 hover:shadow-xs hover:border-[#171B2A] transition-all cursor-pointer group"
                title={`Account & Settings (${user.displayName})`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-7 w-7 rounded-full bg-[#f2f2f2] object-cover ring-1 ring-[#ebebeb]"
                />
                <span className="hidden sm:inline text-xs font-medium text-[#171B2A] max-w-[95px] truncate">
                  {user.displayName}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        onRewardClaimed={() => void reloadData()}
      />

      {/* Profile & Account Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={() => void reloadData()}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false)
          void reloadData()
        }}
      />
    </header>
  )
}
