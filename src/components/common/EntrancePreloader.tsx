import { useEffect, useState } from 'react'

interface EntrancePreloaderProps {
  onRevealStart?: () => void
  onComplete?: () => void
}

const BRAND_LETTERS = 'SONORAURIS'.split('')

// Smooth editorial cubic-bezier-like progress curve (fast start, subtle mid-pause, smooth finish)
function easeEditorialProgress(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function EntrancePreloader({ onRevealStart, onComplete }: EntrancePreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading')

  useEffect(() => {
    const durationMs = 2200
    const revealDurationMs = 620
    const startTime = performance.now()
    let rafId = 0
    let revealTimer = 0
    let doneTimer = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const rawT = Math.min(1, elapsed / durationMs)
      const eased = easeEditorialProgress(rawT)
      const currentPct = Math.min(100, Math.round(eased * 100))

      setProgress(currentPct)

      if (rawT < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        revealTimer = window.setTimeout(() => {
          setPhase('revealing')
          onRevealStart?.()
          doneTimer = window.setTimeout(() => {
            setPhase('done')
            onComplete?.()
          }, revealDurationMs)
        }, 120)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(revealTimer)
      clearTimeout(doneTimer)
    }
  }, [onRevealStart, onComplete])

  if (phase === 'done') return null

  const isRevealing = phase === 'revealing'

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] overflow-hidden select-none bg-[#E6F2EF] transition-opacity duration-600 ease-out ${
        isRevealing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle editorial grid hairlines in background */}
      <div className="pointer-events-none absolute inset-x-0 top-16 h-px bg-[#2B6B61]/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-16 h-px bg-[#2B6B61]/15" />

      {/* Right-aligned wavy serif Brand Wordmark (clipped as the curtain sweeps across) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-8 sm:pr-16 lg:pr-24">
        <div
          className="flex items-center text-[32px] sm:text-[50px] lg:text-[62px] tracking-[0.06em] text-[#2B6B61]"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {BRAND_LETTERS.map((char, idx) => (
            <span
              key={idx}
              className="inline-block preloader-letter-wave"
              style={{
                animationDelay: `${idx * 85}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Left-to-Right Expanding Rausch Teal Curtain */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden will-change-[width]"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(135deg, #245B52 0%, #36786D 48%, #4E9488 100%)',
          borderRight:
            progress < 100
              ? '2px solid rgba(23, 27, 42, 0.45)'
              : '0px solid transparent',
          boxShadow:
            progress < 100 ? '8px 0 30px rgba(23, 27, 42, 0.16)' : 'none',
        }}
      >
        {/* Editorial Counter {n}/100 traveling with the right edge of the curtain */}
        <div
          className={`absolute right-5 sm:right-12 top-1/2 -translate-y-1/2 transition-all duration-300 ${
            isRevealing ? 'opacity-0 -translate-y-[60%] scale-95' : 'opacity-100'
          }`}
        >
          <span
            className="block text-[32px] sm:text-[52px] lg:text-[64px] leading-none text-[#E6F2EF] tracking-tight whitespace-nowrap drop-shadow-xs"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {progress}/100
          </span>
        </div>
      </div>
    </div>
  )
}
