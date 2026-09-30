import { Flame, Coins, Zap, Swords, Headphones, BarChart2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMe } from '../../api'
import type { UserProfile } from '../../types/user'

export function Header() {
  const [user, setUser] = useState<UserProfile | null>(null)
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

    void fetchUser()

    const handleStorageChange = () => {
      void fetchUser()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [location.pathname])

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/practice') || location.pathname.startsWith('/result')
  const isBattleActive = location.pathname.startsWith('/battle')

  return (
    <header className="sticky top-0 z-40 w-full h-[80px] bg-white border-b border-[#ebebeb]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo — Flush Left with Rausch Voltage */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff385c] text-white shadow-sm transition-transform duration-150 group-hover:scale-105">
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Custom Sonorauris soundwave-meets-airbnb loop */}
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[19px] tracking-tight text-[#ff385c]">
                Sonorauris
              </span>
              <span className="new-tag">
                MVP
              </span>
            </div>
            <p className="hidden text-[11px] text-[#6a6a6a] sm:block">
              English Shadowing Arena
            </p>
          </div>
        </Link>

        {/* Center Product Navigation Tabs — Airbnb 3-Product Pattern with NEW tags */}
        <nav className="flex items-center h-full gap-2 sm:gap-6">
          {/* Product Tab 1: Practice Clips */}
          <Link
            to="/"
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isHomeActive
                ? 'text-[#222222]'
                : 'text-[#6a6a6a] hover:text-[#222222]'
            }`}
          >
            <Headphones className="h-4 w-4" />
            <span>Practice Clips</span>
            {isHomeActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222]" />
            )}
          </Link>

          {/* Product Tab 2: 1v1 Battle Arena (with NEW Tag) */}
          <Link
            to="/battle/lobby"
            className={`relative flex items-center gap-2 h-full px-3 text-[15px] font-medium transition-colors ${
              isBattleActive
                ? 'text-[#222222]'
                : 'text-[#6a6a6a] hover:text-[#222222]'
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>1v1 Battle</span>
            <span className="new-tag">NEW</span>
            {isBattleActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222]" />
            )}
          </Link>

          {/* Product Tab 3: Speech AI Metrics */}
          <Link
            to="/battle/lobby"
            className="hidden md:flex relative items-center gap-2 h-full px-3 text-[15px] font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
            title="Real-time Speech Diagnostics"
          >
            <BarChart2 className="h-4 w-4" />
            <span>AI Feedback</span>
            <span className="new-tag">LIVE</span>
          </Link>
        </nav>

        {/* Right Utilities: User Stats and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <>
              {/* Streak Pill */}
              <div
                title={`${user.streak} days active streak`}
                className="flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#ebebeb] px-3 py-1.5 text-xs font-medium text-[#222222]"
              >
                <Flame className="h-3.5 w-3.5 fill-[#ff385c] text-[#ff385c]" />
                <span className="font-mono font-bold text-[12px]">{user.streak}d</span>
              </div>

              {/* Coins Pill */}
              <div
                title={`${user.coins} Coins balance`}
                className="flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#ebebeb] px-3 py-1.5 text-xs font-medium text-[#222222]"
              >
                <Coins className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="font-mono font-bold text-[12px]">{user.coins}</span>
              </div>

              {/* XP Pill */}
              <div
                title={`${user.xp} Total XP earned`}
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#f7f7f7] border border-[#ebebeb] px-3 py-1.5 text-xs font-medium text-[#222222]"
              >
                <Zap className="h-3.5 w-3.5 fill-[#460479] text-[#460479]" />
                <span className="font-mono font-bold text-[12px]">{user.xp} XP</span>
              </div>

              {/* User Avatar Circle */}
              <div
                className="flex items-center gap-2 rounded-full border border-[#dddddd] p-1 pr-2 hover:shadow-sm transition-shadow cursor-pointer"
                title={`Signed in as ${user.displayName}`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-7 w-7 rounded-full bg-[#f2f2f2] object-cover"
                />
                <span className="hidden sm:inline text-xs font-medium text-[#222222] max-w-[85px] truncate">
                  {user.displayName}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
