import type { CSSProperties } from 'react'

interface ProceduralGradientBgProps {
  variant?: 'hero' | 'page' | 'auth'
}

const COLUMNS = [
  {
    direction: 'procedural-band-up',
    duration: '10s',
    delay: '-1.5s',
    gradient:
      'linear-gradient(180deg, #171B2A 0%, #2f655d 30%, #4E9488 62%, #eef5f4 99.4%, #171B2A 100%)',
  },
  {
    direction: 'procedural-band-down',
    duration: '13s',
    delay: '-5.2s',
    gradient:
      'linear-gradient(180deg, #eef5f4 0%, #4E9488 34%, #171B2A 72%, #295952 99.4%, #eef5f4 100%)',
  },
  {
    direction: 'procedural-band-up',
    duration: '11.5s',
    delay: '-3.8s',
    gradient:
      'linear-gradient(180deg, #4E9488 0%, #eef5f4 46%, #4E9488 76%, #171B2A 99.4%, #4E9488 100%)',
  },
  {
    direction: 'procedural-band-down',
    duration: '14s',
    delay: '-8.4s',
    gradient:
      'linear-gradient(180deg, #171B2A 0%, #4E9488 38%, #eef5f4 86%, #d9ece8 99.4%, #171B2A 100%)',
  },
  {
    direction: 'procedural-band-up',
    duration: '9.5s',
    delay: '-2.1s',
    gradient:
      'linear-gradient(180deg, #eef5f4 0%, #3a766c 36%, #171B2A 68%, #4E9488 99.4%, #eef5f4 100%)',
  },
] as const

export function ProceduralGradientBg({ variant = 'hero' }: ProceduralGradientBgProps) {
  const isPage = variant === 'page'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 overflow-hidden select-none bg-[#f7f9fa] ${
        isPage ? 'fixed z-0' : 'absolute'
      }`}
    >
      {/* 5-column sliding procedural gradient bands */}
      <div className="grid h-full w-full grid-cols-3 sm:grid-cols-5 opacity-[0.78]">
        {COLUMNS.map((col, idx) => (
          <div
            key={idx}
            className={`relative h-full w-full overflow-hidden ${
              idx >= 3 ? 'hidden sm:block' : ''
            }`}
          >
            <div
              className={`h-[200%] w-full ${col.direction}`}
              style={
                {
                  '--band-duration': col.duration,
                  animationDelay: col.delay,
                  backgroundImage: col.gradient,
                  backgroundSize: '100% 50%',
                  backgroundRepeat: 'repeat-y',
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
