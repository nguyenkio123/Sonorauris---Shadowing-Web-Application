import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Flame,
  Coins,
  Zap,
  Play,
  Swords,
  Clock,
  Search,
  Heart,
  Star,
  SlidersHorizontal,
  Compass,
  Briefcase,
  Film,
  MessageSquare,
  FlaskConical,
  X,
} from 'lucide-react'
import { getClips, getMe } from '../api'
import type { Clip, Difficulty, Topic } from '../types/clip'
import type { UserProfile } from '../types/user'
1
const TOPICS: { name: 'All' | Topic; label: string; icon: typeof Compass }[] = [
  { name: 'All', label: 'All Topics', icon: Compass },
  { name: 'Daily Life', label: 'Daily Life', icon: MessageSquare },
  { name: 'Work & Tech', label: 'Work & Tech', icon: Briefcase },
  { name: 'Movies & Culture', label: 'Movies & Culture', icon: Film },
  { name: 'Debate & Opinion', label: 'Debate & Opinion', icon: Sparkles },
  { name: 'Science & Nature', label: 'Science & Nature', icon: FlaskConical },
]

const DIFFICULTIES: ('All' | Difficulty)[] = ['All', 'Beginner', 'Intermediate', 'Advanced']

export function HomeCatalogPage() {
  const [clips, setClips] = useState<Clip[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [clipsData, userData] = await Promise.all([getClips(), getMe()])
        setClips(clipsData)
        setUser(userData)
      } catch (err) {
        console.error('Failed to load catalog data:', err)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredClips = clips.filter((clip) => {
    const matchTopic = selectedTopic === 'All' || clip.topic === selectedTopic
    const matchDiff =
      selectedDifficulty === 'All' || clip.difficulty === selectedDifficulty
    const matchQuery =
      searchQuery.trim() === '' ||
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.referenceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.channelName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchTopic && matchDiff && matchQuery
  })

  return (
    <div className="min-h-screen bg-white text-[#171B2A] font-sans pb-16">
      {/* HERO EDITORIAL SECTION — Airbnb Style High-Impact Welcome */}
      <section className="bg-gradient-to-b from-[#f7f9fa] to-white border-b border-[#ebebeb] pt-8 pb-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#dddddd] px-3.5 py-1 text-xs font-semibold text-[#171B2A] mb-3 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#4E9488]" />
                <span>Authentic Voice Shadowing • Real-Time AI Diagnostics</span>
              </div>
              <h1 className="text-[28px] sm:text-[34px] font-bold text-[#171B2A] leading-[1.25] tracking-tight">
                Inspiration for spoken English rhythm
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[#5B6780] mt-2 max-w-2xl font-normal leading-relaxed">
                Imitate native speaker intonation, pauses, and cadence with short authentic video clips. Challenge other learners in 1v1 synchronized duels.
              </p>
            </div>

            {/* User Progression Ledger Cards */}
            {user && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-xl border border-[#dddddd] bg-[#ffffff] p-3 airbnb-shadow flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#4E9488]/10 flex items-center justify-center text-[#4E9488]">
                    <Flame className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#5B6780]">Streak</div>
                    <div className="text-[14px] font-bold text-[#171B2A] font-mono">{user.streak} Days</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dddddd] bg-[#ffffff] p-3 airbnb-shadow flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Coins className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#5B6780]">Coins</div>
                    <div className="text-[14px] font-bold text-[#171B2A] font-mono">{user.coins}</div>
                  </div>
                </div>

                <div className="hidden sm:flex rounded-xl border border-[#dddddd] bg-[#ffffff] p-3 airbnb-shadow items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#171B2A]/10 flex items-center justify-center text-[#171B2A]">
                    <Zap className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#5B6780]">Total XP</div>
                    <div className="text-[14px] font-bold text-[#171B2A] font-mono">{user.xp} XP</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GLOBAL SEARCH BAR — Signature Airbnb Pill (search-bar-pill & search-orb) */}
      <section className="border-b border-[#ebebeb] py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-2xl">
          <div className="search-bar-pill flex items-center justify-between p-2 pl-6 gap-3">
            {/* Search Keyword Input */}
            <div className="flex-1 min-w-0 pr-2">
              <label htmlFor="search-input" className="block text-[12px] font-semibold text-[#171B2A] leading-none mb-1">
                Search Clips
              </label>
              <input
                id="search-input"
                type="text"
                placeholder="By title, speaker, topic, or transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[14px] text-[#171B2A] placeholder-[#5B6780] outline-none truncate"
              />
            </div>

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#5B6780] hover:text-[#171B2A] hover:bg-[#f7f7f7] rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Orb terminating right edge */}
            <button
              type="button"
              className="search-orb"
              title="Search clips"
              onClick={() => {
                const input = document.getElementById('search-input')
                input?.focus()
              }}
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP — Horizontal Product Tabs with clean Airbnb icons */}
      <section className="sticky top-[80px] z-30 bg-white border-b border-[#ebebeb] shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-1">
            {TOPICS.map((t) => {
              const Icon = t.icon
              const isSelected = selectedTopic === t.name
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTopic(t.name)}
                  className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-medium cursor-pointer transition-all select-none border-b-2 whitespace-nowrap ${
                    isSelected
                      ? 'border-[#4E9488] text-[#171B2A] font-semibold opacity-100'
                      : 'border-transparent text-[#5B6780] hover:text-[#171B2A] hover:border-[#dddddd] opacity-80'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-[#4E9488]' : 'text-[#5B6780]'}`} />
                  <span className="text-[12px]">{t.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Filter Pill for Difficulty */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#ebebeb] shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#5B6780]" />
            <div className="flex items-center gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDifficulty(d)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedDifficulty === d
                      ? 'bg-[#171B2A] text-white shadow-xs'
                      : 'bg-[#f7f9fa] text-[#5B6780] hover:bg-[#edf0f2] hover:text-[#171B2A]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROPERTY CARDS GRID (DESIGN.md property-card) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-[#171B2A]">
              Available practice clips
            </h2>
            <span className="text-sm text-[#5B6780] font-normal">
              ({filteredClips.length} found)
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#4E9488] hover:underline font-medium"
            >
              Clear search filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5B6780] text-sm">
            <span className="h-8 w-8 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin mb-3" />
            Loading curated practice clips...
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="rounded-2xl border border-[#dddddd] bg-[#f7f9fa] p-12 text-center text-[#5B6780]">
            <p className="font-semibold text-[#171B2A] mb-1.5 text-lg">No matching clips found</p>
            <p className="text-sm">Try broadening your search or resetting the category filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedTopic('All')
                setSelectedDifficulty('All')
                setSearchQuery('')
              }}
              className="btn-pill-rausch mt-4 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClips.map((clip, index) => {
              const isFav = !!favorites[clip.id]
              const isGuestFavorite = index === 0 || clip.difficulty === 'Beginner'

              return (
                <div
                  key={clip.id}
                  className="airbnb-card group flex flex-col justify-between overflow-hidden border border-[#ebebeb] bg-white hover:border-[#171B2A]/30"
                >
                  {/* Photo-First aspect-ratio thumbnail with rounded-md corner clipping */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f0f3f5]">
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Guest Favorite Badge Top-Left */}
                    {isGuestFavorite && (
                      <div className="absolute top-3 left-3">
                        <span className="guest-favorite-badge">
                          <span>Guest favorite</span>
                        </span>
                      </div>
                    )}

                    {/* Heart Save Button Top-Right (icon-button-circle) */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(clip.id, e)}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
                      title={isFav ? 'Remove from wishlist' : 'Save clip to wishlist'}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isFav
                            ? 'fill-[#4E9488] text-[#4E9488]'
                            : 'text-[#171B2A] stroke-[2.2]'
                        }`}
                      />
                    </button>

                    {/* Clip Duration Pill Bottom-Right */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-medium text-white shadow-xs">
                        <Clock className="h-3 w-3 text-white" />
                        <span>{clip.durationSec}s</span>
                      </span>
                    </div>
                  </div>

                  {/* Meta Details Block (DESIGN.md 4-5 lines of meta beneath photo) */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Line 1: Title and Star Rating */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-[#171B2A] line-clamp-1 group-hover:text-[#4E9488] transition-colors">
                          {clip.title}
                        </h3>
                        {/* Deliberate brand choice: star & rating in ink #171B2A */}
                        <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-[#171B2A]">
                          <Star className="h-3.5 w-3.5 fill-[#171B2A] text-[#171B2A]" />
                          <span>4.88</span>
                        </div>
                      </div>

                      {/* Line 2: Speaker / Source Channel */}
                      <p className="text-[14px] text-[#5B6780] line-clamp-1 mb-1">
                        Source: {clip.channelName} · {clip.locale}
                      </p>

                      {/* Line 3: Difficulty & Topic Badges */}
                      <div className="flex items-center gap-2 my-2">
                        <span className="rounded-full bg-[#f7f9fa] border border-[#dddddd] px-2.5 py-0.5 text-[11px] font-medium text-[#171B2A]">
                          {clip.difficulty}
                        </span>
                        <span className="text-[12px] text-[#5B6780]">
                          {clip.topic}
                        </span>
                      </div>

                      {/* Line 4: Reference text snippet in italic quotes */}
                      <p className="text-[13px] text-[#283044] italic line-clamp-2 bg-[#f7f9fa] p-2.5 rounded-lg border border-[#e2e6ea] mb-3 leading-relaxed">
                        "{clip.referenceText}"
                      </p>
                    </div>

                    {/* Action CTAs: Rausch Primary Button ("Practice") & Outline ("1v1 Battle") */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#ebebeb]">
                      <Link
                        to={`/practice/${clip.id}`}
                        className="btn-primary text-xs font-semibold h-[40px] px-3 rounded-lg"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Practice</span>
                      </Link>

                      <Link
                        to={`/battle/lobby?clipId=${clip.id}`}
                        className="btn-secondary text-xs font-semibold h-[40px] px-3 rounded-lg"
                      >
                        <Swords className="h-3.5 w-3.5" />
                        <span>1v1 Battle</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
