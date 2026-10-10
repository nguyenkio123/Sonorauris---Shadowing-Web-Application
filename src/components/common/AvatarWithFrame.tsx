import {
  Compass,
  Crown,
  Flame,
  Headphones,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import { getUserInventory } from '../../api/storage'

export type FrameSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const BOT_FRAMES = ['frame-rausch', 'frame-cyber', 'frame-golden', 'frame-celestial']

export function resolveParticipantFrameId(
  userId?: string,
  isBot?: boolean,
  idx: number = 0
): string {
  if (isBot) {
    return BOT_FRAMES[idx % BOT_FRAMES.length]
  }
  if (!userId) return 'frame-none'
  try {
    return getUserInventory(userId).equippedFrameId || 'frame-none'
  } catch {
    return 'frame-none'
  }
}

interface AvatarWithFrameProps {
  avatarUrl: string
  alt?: string
  frameId?: string
  size?: FrameSize
  showCrest?: boolean
  className?: string
}

const SIZE_MAP: Record<
  FrameSize,
  {
    box: string
    imgPad: string
    crestBox: string
    crestIcon: string
  }
> = {
  xs: {
    box: 'h-7 w-7',
    imgPad: 'p-[2px]',
    crestBox: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
    crestIcon: 'h-2 w-2',
  },
  sm: {
    box: 'h-9 w-9',
    imgPad: 'p-[3px]',
    crestBox: 'h-4 w-4 -bottom-0.5 -right-0.5',
    crestIcon: 'h-2.5 w-2.5',
  },
  md: {
    box: 'h-11 w-11',
    imgPad: 'p-[3.5px]',
    crestBox: 'h-4.5 w-4.5 -bottom-0.5 -right-0.5',
    crestIcon: 'h-2.5 w-2.5',
  },
  lg: {
    box: 'h-14 w-14',
    imgPad: 'p-[4px]',
    crestBox: 'h-5 w-5 -bottom-0.5 -right-0.5',
    crestIcon: 'h-3 w-3',
  },
  xl: {
    box: 'h-24 w-24',
    imgPad: 'p-[6px]',
    crestBox: 'h-7 w-7 -bottom-1 -right-1',
    crestIcon: 'h-4 w-4',
  },
}

function normalizeFrameId(frameId?: string): string {
  if (!frameId) return 'frame-none'
  if (frameId.startsWith('frame-')) return frameId
  if (frameId.includes('#4E9488')) return 'frame-rausch'
  if (frameId.includes('amber')) return 'frame-golden'
  if (frameId.includes('emerald')) return 'frame-cyber'
  if (frameId.includes('violet')) return 'frame-celestial'
  return 'frame-none'
}

export function AvatarWithFrame({
  avatarUrl,
  alt = 'Avatar',
  frameId,
  size = 'md',
  showCrest = true,
  className = '',
}: AvatarWithFrameProps) {
  const resolvedId = normalizeFrameId(frameId)
  const sz = SIZE_MAP[size]
  const gradSuffix = `${resolvedId}-${size}`

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${sz.box} ${className}`}>
      {/* Ambient Outer Glow per Frame Tier */}
      {resolvedId === 'frame-rausch' && (
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_12px_rgba(78,148,136,0.45)]" />
      )}
      {resolvedId === 'frame-golden' && (
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.55)]" />
      )}
      {resolvedId === 'frame-cyber' && (
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.55)]" />
      )}
      {resolvedId === 'frame-celestial' && (
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_18px_rgba(139,92,246,0.65)]" />
      )}

      {/* Bespoke Multi-Layer SVG Ornate Ring */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-rausch-${gradSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E9488" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
          <linearGradient id={`grad-golden-${gradSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id={`grad-cyber-${gradSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id={`grad-celestial-${gradSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {resolvedId === 'frame-none' && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#DCE2E8" strokeWidth="2.5" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#171B2A"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </>
        )}

        {resolvedId === 'frame-rausch' && (
          <>
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke={`url(#grad-rausch-${gradSuffix})`}
              strokeWidth="4.5"
            />
            <circle
              cx="50"
              cy="50"
              r="43.5"
              fill="none"
              stroke="#4E9488"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <circle cx="50" cy="2.5" r="2.5" fill="#14B8A6" />
            <circle cx="2.5" cy="50" r="2" fill="#4E9488" />
            <circle cx="97.5" cy="50" r="2" fill="#4E9488" />
          </>
        )}

        {resolvedId === 'frame-golden' && (
          <>
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke={`url(#grad-golden-${gradSuffix})`}
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#FDE047"
              strokeWidth="1.5"
              strokeDasharray="10 3"
            />
            {/* Royal cardinal diamond studs */}
            <polygon points="50,0 53,4 50,8 47,4" fill="#F59E0B" />
            <polygon points="0,50 4,47 8,50 4,53" fill="#F59E0B" />
            <polygon points="100,50 96,47 92,50 96,53" fill="#F59E0B" />
          </>
        )}

        {resolvedId === 'frame-cyber' && (
          <>
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke={`url(#grad-cyber-${gradSuffix})`}
              strokeWidth="4.5"
              strokeDasharray="24 5"
            />
            <circle
              cx="50"
              cy="50"
              r="43.5"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.8"
            />
            {/* Cyber HUD nodes */}
            <rect x="47" y="0.5" width="6" height="3.5" rx="1" fill="#10B981" />
            <rect x="0.5" y="47" width="3.5" height="6" rx="1" fill="#06B6D4" />
            <rect x="96" y="47" width="3.5" height="6" rx="1" fill="#06B6D4" />
          </>
        )}

        {resolvedId === 'frame-celestial' && (
          <>
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke={`url(#grad-celestial-${gradSuffix})`}
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#E879F9"
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />
            {/* Celestial star nodes */}
            <polygon points="50,-1 52,3 56,5 52,7 50,11 48,7 44,5 48,3" fill="#C084FC" />
            <circle cx="4" cy="30" r="2.2" fill="#EC4899" />
            <circle cx="96" cy="30" r="2.2" fill="#8B5CF6" />
            <circle cx="15" cy="84" r="2" fill="#C084FC" />
          </>
        )}
      </svg>

      {/* Inner Avatar Image */}
      <div className={`relative h-full w-full rounded-full overflow-hidden ${sz.imgPad}`}>
        <img
          src={avatarUrl}
          alt={alt}
          className="h-full w-full rounded-full object-cover bg-[#f2f4f7]"
        />
      </div>

      {/* Ornate Corner Crest / Gem Emblem */}
      {showCrest && resolvedId !== 'frame-none' && (
        <span
          className={`pointer-events-none absolute ${sz.crestBox} rounded-full flex items-center justify-center shadow-sm ring-1 ring-white ${
            resolvedId === 'frame-rausch'
              ? 'bg-[#4E9488] text-white'
              : resolvedId === 'frame-golden'
              ? 'bg-amber-400 text-[#171B2A]'
              : resolvedId === 'frame-cyber'
              ? 'bg-emerald-500 text-white'
              : 'bg-violet-600 text-white'
          }`}
        >
          {resolvedId === 'frame-rausch' && <Zap className={`${sz.crestIcon} fill-current`} />}
          {resolvedId === 'frame-golden' && <Crown className={`${sz.crestIcon} fill-current`} />}
          {resolvedId === 'frame-cyber' && <Shield className={`${sz.crestIcon} fill-current`} />}
          {resolvedId === 'frame-celestial' && <Sparkles className={sz.crestIcon} />}
        </span>
      )}
    </div>
  )
}

interface TitleEmblemProps {
  titleId: string
  size?: 'sm' | 'lg'
}

export function TitleEmblem({ titleId, size = 'lg' }: TitleEmblemProps) {
  const boxClass = size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-9 w-9 rounded-xl'
  const iconClass = size === 'lg' ? 'h-6 w-6' : 'h-4.5 w-4.5'

  switch (titleId) {
    case 'title-learner':
      return (
        <div
          className={`${boxClass} bg-slate-100 border border-slate-300 flex items-center justify-center text-[#171B2A] shadow-2xs shrink-0`}
        >
          <Headphones className={iconClass} />
        </div>
      )
    case 'title-cadence':
      return (
        <div
          className={`${boxClass} bg-sky-50 border border-sky-300 flex items-center justify-center text-sky-600 shadow-2xs shrink-0`}
        >
          <Compass className={iconClass} />
        </div>
      )
    case 'title-rhythm':
      return (
        <div
          className={`${boxClass} bg-orange-50 border border-orange-300 flex items-center justify-center text-orange-600 shadow-2xs shrink-0`}
        >
          <Flame className={`${iconClass} fill-orange-500/20`} />
        </div>
      )
    case 'title-fluent':
      return (
        <div
          className={`${boxClass} bg-violet-50 border border-violet-300 flex items-center justify-center text-violet-600 shadow-2xs shrink-0`}
        >
          <Sparkles className={iconClass} />
        </div>
      )
    case 'title-master':
    default:
      return (
        <div
          className={`${boxClass} bg-teal-50 border border-[#4E9488]/50 flex items-center justify-center text-[#4E9488] shadow-xs shrink-0`}
        >
          <Trophy className={iconClass} />
        </div>
      )
  }
}
