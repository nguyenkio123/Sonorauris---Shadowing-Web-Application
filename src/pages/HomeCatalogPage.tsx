import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Play,
  Swords,
  Clock,
  Search,
  Heart,
  Trophy,
  SlidersHorizontal,
  Compass,
  Briefcase,
  Film,
  MessageSquare,
  FlaskConical,
  Volume2,
  VolumeX,
  X,
  ArrowDown,
  type AnimatedIconHandle,
} from '../components/icons'
import { getClips, getUserAttempts } from '../api'
import { ProceduralGradientBg } from '../components/common/ProceduralGradientBg'
import type { Clip, Difficulty, Topic } from '../types/clip'

const FAVORITES_KEY = 'shadowing_favorites'

const TOPICS: { name: 'All' | Topic; label: string; icon: ComponentType<{ className?: string }> }[] = [
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
  const [bestScores, setBestScores] = useState<Record<string, number>>({})
  const [selectedTopic, setSelectedTopic] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<'level' | 'alphabetical' | 'duration'>('level')
  const [heroMuted, setHeroMuted] = useState(true)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)
  const searchIconRef = useRef<AnimatedIconHandle>(null)
  const exploreArrowRef = useRef<AnimatedIconHandle>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [clipsData, attemptsData] = await Promise.all([
          getClips(),
          getUserAttempts().catch(() => []),
        ])
        setClips(clipsData)
        const scoresMap: Record<string, number> = {}
        for (const att of attemptsData) {
          const score = att.result?.battleScore ?? -1
          const prev = scoresMap[att.clipId] ?? -1
          if (score > prev) {
            scoresMap[att.clipId] = score
          }
        }
        setBestScores(scoresMap)
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
    setFavorites((prev) => {
      const next = {
        ...prev,
        [id]: !prev[id],
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  const DIFFICULTY_RANK: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  }

  const filteredClips = clips
    .filter((clip) => {
      const matchTopic = selectedTopic === 'All' || clip.topic === selectedTopic
      const matchDiff =
        selectedDifficulty === 'All' || clip.difficulty === selectedDifficulty
      const matchFav = !showFavoritesOnly || Boolean(favorites[clip.id])
      const matchQuery =
        searchQuery.trim() === '' ||
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.referenceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.channelName.toLowerCase().includes(searchQuery.toLowerCase())

      return matchTopic && matchDiff && matchFav && matchQuery
    })
    .sort((a, b) => {
      if (sortBy === 'level') {
        const diffRank = (DIFFICULTY_RANK[a.difficulty] || 2) - (DIFFICULTY_RANK[b.difficulty] || 2)
        if (diffRank !== 0) return diffRank
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'duration') {
        return a.durationSec - b.durationSec
      }
      return 0
    })

  return (
    <div className="relative min-h-screen text-[#171B2A] font-sans pb-16">
      <ProceduralGradientBg variant="page" />

      {/* HERO EDITORIAL SECTION — Elevated Spotlight Card + 3D Fly-Through */}
      <section className="relative z-10 pt-5 pb-2 px-3 sm:px-6 lg:px-8">
        <div
          className="entrance-tier relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-white/75 backdrop-blur-md border border-white/70 shadow-[0_24px_60px_-15px_rgba(23,27,42,0.14)] p-6 sm:p-8 lg:p-10"
          style={{ '--entrance-delay': '100ms' } as React.CSSProperties}
        >
          {/* Subtle Ambient Radial Spotlights */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#4E9488]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div>
                <h1 className="text-[32px] sm:text-[44px] font-bold text-[#171B2A] leading-[1.12] tracking-tight">
                  <span
                    className="italic font-normal text-[42px] sm:text-[56px] leading-none pr-2 inline-flex flex-wrap"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    aria-label="Inspiration"
                  >
                    {'Inspiration'.split('').map((ch, idx) => (
                      <span
                        key={idx}
                        className="entrance-char bg-gradient-to-r from-[#2B6B61] via-[#4E9488] to-[#10B981] bg-clip-text text-transparent"
                        style={{ '--char-delay': `${140 + idx * 28}ms` } as React.CSSProperties}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                  {['for', 'spoken', 'English', 'rhythm'].map((word, idx) => (
                    <span
                      key={word}
                      className="entrance-char mr-[0.28em]"
                      style={{ '--char-delay': `${360 + idx * 60}ms` } as React.CSSProperties}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
                <p
                  className="entrance-tier text-[15px] sm:text-[16px] text-[#4A5568] mt-3 max-w-xl font-normal leading-relaxed"
                  style={{ '--entrance-delay': '280ms' } as React.CSSProperties}
                >
                  Imitate native speaker intonation, pauses, and cadence with short authentic video clips. Challenge other learners in 1v1 synchronized duels.
                </p>
              </div>

              {/* Aesthetic Scroll-to-Clips Action Button */}
              <div
                className="entrance-tier pt-1"
                style={{ '--entrance-delay': '360ms' } as React.CSSProperties}
              >
                <button
                  type="button"
                  onMouseEnter={() => exploreArrowRef.current?.startAnimation()}
                  onMouseLeave={() => exploreArrowRef.current?.stopAnimation()}
                  onClick={() =>
                    document.getElementById('clips-grid')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }
                  className="group relative inline-flex items-center gap-3.5 rounded-full bg-[#171B2A] hover:bg-[#1f263b] text-white pl-5 pr-2 py-2 shadow-[0_10px_28px_-6px_rgba(23,27,42,0.28)] hover:shadow-[0_14px_34px_-6px_rgba(78,148,136,0.42)] ring-1 ring-white/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                    <span>Explore Practice Clips</span>
                    {clips.length > 0 && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] font-medium text-[#8ee3d5]">
                        {clips.length}
                      </span>
                    )}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4E9488] text-white shadow-xs group-hover:bg-[#3d7a70] transition-colors">
                    <ArrowDown ref={exploreArrowRef} className="h-4 w-4 text-white" />
                  </span>
                </button>
              </div>

              {/* Search Clips Pill directly under Explore Practice Clips */}
              <div
                className="entrance-tier pt-2 max-w-xl"
                style={{ '--entrance-delay': '430ms' } as React.CSSProperties}
              >
                <div className="search-bar-pill flex items-center justify-between p-1.5 pl-4 sm:pl-5 gap-2 sm:gap-3">
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          document.getElementById('clips-grid')?.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      className="w-full bg-transparent text-[14px] text-[#171B2A] placeholder-[#5B6780] outline-none truncate"
                    />
                  </div>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="p-1 text-[#5B6780] hover:text-[#171B2A] hover:bg-[#f7f7f7] rounded-full transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="search-orb"
                    aria-label="Search practice clips"
                    title="Search clips"
                    onMouseEnter={() => searchIconRef.current?.startAnimation()}
                    onMouseLeave={() => searchIconRef.current?.stopAnimation()}
                    onClick={() => {
                      if (searchQuery.trim()) {
                        document.getElementById('clips-grid')?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        document.getElementById('search-input')?.focus()
                      }
                    }}
                  >
                    <Search ref={searchIconRef} className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3D Fly-Through Showcase Video (1440x1152 / 5:4) */}
            <div
              className="entrance-tier lg:col-span-5"
              style={{ '--entrance-delay': '220ms' } as React.CSSProperties}
            >
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-[#4E9488]/25 bg-[#f9fbfb] shadow-[0_18px_40px_-12px_rgba(23,27,42,0.22)] ring-1 ring-black/5">
                <video
                  ref={heroVideoRef}
                  src="/hero-flythrough.mp4"
                  autoPlay
                  muted={heroMuted}
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover block"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = !heroMuted
                    setHeroMuted(next)
                    if (heroVideoRef.current) heroVideoRef.current.muted = next
                  }}
                  aria-label={heroMuted ? 'Unmute showcase audio' : 'Mute showcase audio'}
                  title={heroMuted ? 'Unmute audio' : 'Mute audio'}
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-[#e2e6ea] text-[#171B2A] shadow-xs hover:bg-white transition-colors cursor-pointer"
                >
                  {heroMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#4E9488]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP — Horizontal Product Tabs & Mobile-Accessible Difficulty Filter */}
      <section
        className="entrance-tier sticky top-[118px] md:top-[92px] z-30 mt-6 w-full px-3 sm:px-6 lg:px-8"
        style={{ '--entrance-delay': '490ms' } as React.CSSProperties}
      >
        <div className="mx-auto max-w-7xl rounded-2xl bg-white/78 backdrop-blur-md border border-white/70 airbnb-shadow px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2.5">
          <div className="w-full min-w-0 flex items-center gap-6 sm:gap-8 overflow-x-auto py-1 scrollbar-none">
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

          {/* Quick Filter Pill for Difficulty & Saved (Visible on Mobile & Desktop) */}
          <div className="w-full sm:w-auto min-w-0 flex items-center gap-2 pt-2 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-[#ebebeb] overflow-x-auto scrollbar-none shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#5B6780] shrink-0" />
            <div className="flex items-center gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDifficulty(d)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === d
                      ? 'bg-[#171B2A] text-white shadow-xs'
                      : 'bg-[#f7f9fa] text-[#5B6780] hover:bg-[#edf0f2] hover:text-[#171B2A]'
                  }`}
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  showFavoritesOnly
                    ? 'bg-[#4E9488] text-white shadow-xs'
                    : 'bg-[#f7f9fa] text-[#5B6780] hover:bg-[#edf0f2] hover:text-[#171B2A]'
                }`}
                title="Show only saved clips"
              >
                <Heart className={`h-3 w-3 ${showFavoritesOnly ? 'fill-white text-white' : ''}`} />
                <span>Saved</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CLIPS CATALOG GRID */}
      <div id="clips-grid" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 scroll-mt-[190px] md:scroll-mt-[165px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-[#171B2A]">
              Available practice clips
            </h2>
            <span className="text-sm text-[#5B6780] font-normal">
              ({filteredClips.length} found)
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#4E9488] hover:underline font-medium mr-2"
              >
                Clear search filter
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[#5B6780]">
              <span className="hidden sm:inline font-medium">Sort:</span>
              <div className="inline-flex rounded-xl bg-[#f7f9fa] border border-[#e2e6ea] p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSortBy('level')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'level'
                      ? 'bg-white text-[#171B2A] font-semibold shadow-xs'
                      : 'text-[#5B6780] hover:text-[#171B2A]'
                  }`}
                  title="Sort by Difficulty Level: Beginner ➔ Intermediate ➔ Advanced"
                >
                  Level (Easy ➔ Hard)
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('alphabetical')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'alphabetical'
                      ? 'bg-white text-[#171B2A] font-semibold shadow-xs'
                      : 'text-[#5B6780] hover:text-[#171B2A]'
                  }`}
                  title="Sort Alphabetically A to Z"
                >
                  A ➔ Z
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('duration')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'duration'
                      ? 'bg-white text-[#171B2A] font-semibold shadow-xs'
                      : 'text-[#5B6780] hover:text-[#171B2A]'
                  }`}
                  title="Sort by Duration (Shortest first)"
                >
                  Duration
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5B6780] text-sm">
            <span className="h-8 w-8 rounded-full border-2 border-[#4E9488]/20 border-t-[#4E9488] animate-spin mb-3" />
            Loading curated practice clips...
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/78 backdrop-blur-md p-12 text-center text-[#5B6780] airbnb-shadow">
            <p className="font-semibold text-[#171B2A] mb-1.5 text-lg">No matching clips found</p>
            <p className="text-sm">Try broadening your search or resetting the category filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedTopic('All')
                setSelectedDifficulty('All')
                setShowFavoritesOnly(false)
                setSearchQuery('')
              }}
              className="btn-pill-rausch mt-4 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClips.map((clip, idx) => {
              const isFav = !!favorites[clip.id]
              const wordCount = clip.referenceText.trim().split(/\s+/).filter(Boolean).length
              const wpm = Math.round((wordCount / Math.max(1, clip.durationSec)) * 60)
              const bestScore = bestScores[clip.id]

              return (
                <div
                  key={clip.id}
                  className="entrance-tier airbnb-card group flex flex-col justify-between overflow-hidden border border-white/70 bg-white/78 backdrop-blur-md hover:border-[#171B2A]/30"
                  style={{ '--entrance-delay': `${550 + Math.min(idx, 8) * 55}ms` } as React.CSSProperties}
                >
                  {/* Thumbnail with Authentic Cadence / Best Score Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f0f3f5]">
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top-Left Badge: Real Best Score if practiced, otherwise Speech Rate (WPM) */}
                    <div className="absolute top-3 left-3">
                      {bestScore !== undefined ? (
                        <span className="guest-favorite-badge text-[#4E9488]">
                          <Trophy className="h-3 w-3 text-[#4E9488]" />
                          <span>Best: {bestScore}%</span>
                        </span>
                      ) : (
                        <span className="guest-favorite-badge">
                          <span>{wpm} WPM</span>
                        </span>
                      )}
                    </div>

                    {/* Heart Save Button Top-Right (40x40px touch target) */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(clip.id, e)}
                      aria-label={isFav ? 'Remove from saved clips' : 'Save clip'}
                      className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
                      title={isFav ? 'Remove from saved clips' : 'Save clip for practice'}
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

                  {/* Meta Details Block */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Line 1: Title and Authentic Word Count / Tempo */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-[#171B2A] line-clamp-1 group-hover:text-[#4E9488] transition-colors">
                          {clip.title}
                        </h3>
                        <span className="shrink-0 font-mono text-[11px] font-semibold text-[#4E9488] bg-[#f7f9fa] border border-[#e2e6ea] rounded-md px-1.5 py-0.5">
                          {wordCount}w · {wpm} WPM
                        </span>
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
                      <p className="text-[13px] text-[#283044] italic line-clamp-2 bg-white/60 p-2.5 rounded-lg border border-[#e2e6ea]/80 mb-3 leading-relaxed">
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
                        <span>Battle</span>
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
