import {
  Flame,
  Coins,
  Swords,
  Headphones,
  Sparkles,
  Trophy,
  LogIn,
  ShieldCheck,
  type AnimatedIconHandle,
} from '../../components/icons'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getDailyQuests, getMe } from '../../api'
import type { UserProfile } from '../../types/user'
import type { DailyQuest } from '../../types/quest'
import { DailyQuestsModal } from './DailyQuestsModal'
import { AvatarWithFrame } from '../common/AvatarWithFrame'
import { calculateLevelInfo } from '../../config/scoring'
import { useAuth } from '../../context/AuthContext'

export function Header() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [isQuestsOpen, setIsQuestsOpen] = useState(false)
  const location = useLocation()
  const practiceIconRef = useRef<AnimatedIconHandle>(null)
  const battleIconRef = useRef<AnimatedIconHandle>(null)
  const shopIconRef = useRef<AnimatedIconHandle>(null)
  const adminIconRef = useRef<AnimatedIconHandle>(null)
  const questsIconRef = useRef<AnimatedIconHandle>(null)
  const streakIconRef = useRef<AnimatedIconHandle>(null)
  const coinsIconRef = useRef<AnimatedIconHandle>(null)

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
    window.addEventListener('shadowing_user_updated', handleStorageChange)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      window.removeEventListener('shadowing_user_updated', handleStorageChange)
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
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-7xl rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow overflow-hidden">
      <div className="flex h-[60px] md:h-[72px] items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand / Logo with Sonorauris Emblem from logo.jpe */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group select-none shrink-0 min-w-0">
          <img
            src="/logo.jpe"
            alt="Sonorauris Logo"
            className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl object-cover shadow-xs transition-transform duration-150 group-hover:scale-105 border border-[#e2e6ea] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[15px] sm:text-[19px] tracking-tight truncate">
                <span className="text-[#171B2A]">Sonor</span>
                <span className="text-[#10B981]">auris</span>
              </span>
            </div>
            <p className="hidden text-[11px] text-[#5B6780] sm:block">
              English Shadowing Arena
            </p>
          </div>
        </Link>

        {/* Center Product Navigation Tabs — Desktop (md+) */}
        <nav className="hidden md:flex items-center h-full gap-4 lg:gap-6">
          {/* Product Tab 1: Practice */}
          <Link
            to="/"
            onMouseEnter={() => practiceIconRef.current?.startAnimation()}
            onMouseLeave={() => practiceIconRef.current?.stopAnimation()}
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isHomeActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Headphones ref={practiceIconRef} className="h-4 w-4" />
            <span>Practice</span>
            {isHomeActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>

          {/* Product Tab 2: Battle Arena (2-5 Players) */}
          <Link
            to="/battle/lobby"
            onMouseEnter={() => battleIconRef.current?.startAnimation()}
            onMouseLeave={() => battleIconRef.current?.stopAnimation()}
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isBattleActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Swords ref={battleIconRef} className="h-4 w-4" />
            <span>Battle</span>
            <span className="new-tag">LIVE</span>
            {isBattleActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>

          {/* Product Tab 3: Shop */}
          <Link
            to="/shop"
            onMouseEnter={() => shopIconRef.current?.startAnimation()}
            onMouseLeave={() => shopIconRef.current?.stopAnimation()}
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isShopActive
                ? 'text-[#171B2A]'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            <Sparkles ref={shopIconRef} className="h-4 w-4 text-[#4E9488]" />
            <span>Shop</span>
            {isShopActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4E9488]" />
            )}
          </Link>

          {/* Product Tab 4: Admin Panel (if admin) */}
          {authUser?.role === 'admin' && (
            <Link
              to="/admin"
              onMouseEnter={() => adminIconRef.current?.startAnimation()}
              onMouseLeave={() => adminIconRef.current?.stopAnimation()}
              className={`relative flex items-center gap-1.5 h-full px-3 text-[15px] font-medium transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'text-purple-700'
                  : 'text-[#5B6780] hover:text-purple-700'
              }`}
            >
              <ShieldCheck ref={adminIconRef} className="h-4 w-4 text-purple-600" />
              <span>Admin</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                PANEL
              </span>
              {location.pathname.startsWith('/admin') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-purple-600" />
              )}
            </Link>
          )}
        </nav>

        {/* Right Utilities: Quests, Quick Stats, and Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {user && (
            <>
              {/* Daily Quests Trigger Button (English, FR-QUEST-01) */}
              <button
                type="button"
                onClick={() => setIsQuestsOpen(true)}
                onMouseEnter={() => questsIconRef.current?.startAnimation()}
                onMouseLeave={() => questsIconRef.current?.stopAnimation()}
                title={`Daily Quests (${completedCount}/${quests.length || 3})`}
                className="relative flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-2 sm:px-3 py-1.5 text-xs font-medium text-[#171B2A] hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer group"
              >
                <Trophy ref={questsIconRef} className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-[12px] hidden lg:inline">Quests</span>
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
                onMouseEnter={() => {
                  streakIconRef.current?.startAnimation()
                  coinsIconRef.current?.startAnimation()
                }}
                onMouseLeave={() => {
                  streakIconRef.current?.stopAnimation()
                  coinsIconRef.current?.stopAnimation()
                }}
                title={`${user.streak} days active streak • ${user.coins} Coins (Click to visit Shop)`}
                className="flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-[#f7f9fa] border border-[#e2e6ea] px-2 sm:px-3 py-1.5 text-xs font-semibold text-[#171B2A] hover:border-[#171B2A]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-0.5 sm:gap-1 text-orange-500">
                  <Flame ref={streakIconRef} className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  <span className="font-mono text-[11px] sm:text-[12px]">{user.streak}d</span>
                </div>
                <div className="h-3 w-px bg-[#dddddd]" />
                <div className="flex items-center gap-0.5 sm:gap-1 text-amber-600">
                  <Coins ref={coinsIconRef} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span className="font-mono text-[11px] sm:text-[12px]">{user.coins}</span>
                </div>
              </Link>

              {/* Sign In Button for Guest / Anonymous Users */}
              {authUser?.isGuest && (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-full bg-[#171B2A] hover:bg-[#2b3445] text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 transition-all shadow-xs cursor-pointer"
                  title="Sign In or Register"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* User Profile & Settings Page Link */}
              <Link
                to="/profile"
                className={`flex items-center gap-2 rounded-full border p-0.5 sm:p-1 sm:pr-3 hover:shadow-xs transition-all cursor-pointer group ${
                  location.pathname.startsWith('/profile')
                    ? 'border-[#4E9488] bg-[#4E9488]/5'
                    : 'border-[#dddddd] hover:border-[#171B2A]'
                }`}
                title={`Account & Settings (${user.displayName} · Lv.${calculateLevelInfo(user.xp).level})`}
              >
                <div className="relative flex flex-col items-center shrink-0">
                  <AvatarWithFrame
                    avatarUrl={user.avatarUrl}
                    alt={user.displayName}
                    frameId={user.equippedFrameId}
                    size="xs"
                  />
                  <span className="-mt-1.5 z-10 rounded-full bg-[#460479] text-white text-[9px] font-bold leading-none px-1.5 py-[2px] ring-1 ring-white shadow-2xs font-mono">
                    Lv.{calculateLevelInfo(user.xp).level}
                  </span>
                </div>
                <span className="hidden sm:inline text-xs font-medium text-[#171B2A] max-w-[95px] truncate">
                  {user.displayName}
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar (< md) */}
      <nav className="flex md:hidden items-center justify-around border-t border-[#f0f3f5]/70 bg-transparent px-2 h-11 overflow-x-auto scrollbar-none">
        <Link
          to="/"
          className={`relative flex items-center gap-1.5 h-full px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            isHomeActive ? 'text-[#171B2A]' : 'text-[#5B6780]'
          }`}
        >
          <Headphones className="h-3.5 w-3.5" />
          <span>Practice</span>
          {isHomeActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4E9488]" />}
        </Link>

        <Link
          to="/battle/lobby"
          className={`relative flex items-center gap-1.5 h-full px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            isBattleActive ? 'text-[#171B2A]' : 'text-[#5B6780]'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>Battle</span>
          <span className="new-tag">LIVE</span>
          {isBattleActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4E9488]" />}
        </Link>

        <Link
          to="/shop"
          className={`relative flex items-center gap-1.5 h-full px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            isShopActive ? 'text-[#171B2A]' : 'text-[#5B6780]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#4E9488]" />
          <span>Shop</span>
          {isShopActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4E9488]" />}
        </Link>

        {authUser?.role === 'admin' && (
          <Link
            to="/admin"
            className={`relative flex items-center gap-1 h-full px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
              location.pathname.startsWith('/admin') ? 'text-purple-700' : 'text-[#5B6780]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>Admin</span>
            {location.pathname.startsWith('/admin') && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-purple-600" />
            )}
          </Link>
        )}
      </nav>
      </div>

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        onRewardClaimed={() => void reloadData()}
      />
    </header>
  )
}
