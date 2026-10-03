import { useEffect, useState } from 'react'
import {
  getForcedOutcome,
  isDemoMode,
  setDemoMode,
  setForcedOutcome,
} from '../../config/demo'
import { resetDemo } from '../../api'
import type { BattleOutcome } from '../../types/battle'

export function DemoCheatBar() {
  const [visible, setVisible] = useState(isDemoMode())
  const [forced, setForced] = useState<BattleOutcome | null>(getForcedOutcome())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.shiftKey && e.key === 'D') {
        e.preventDefault()
        const next = !visible
        setVisible(next)
        setDemoMode(next)
      } else if (e.shiftKey && e.key === '!') {
        // Shift + 1
        e.preventDefault()
        setForcedOutcome('WIN')
        setForced('WIN')
      } else if (e.shiftKey && e.key === '@') {
        // Shift + 2
        e.preventDefault()
        setForcedOutcome('LOSE')
        setForced('LOSE')
      } else if (e.shiftKey && e.key === '#') {
        // Shift + 3
        e.preventDefault()
        setForcedOutcome('DRAW')
        setForced('DRAW')
      } else if (e.shiftKey && e.key === ')') {
        // Shift + 0
        e.preventDefault()
        setForcedOutcome(null)
        setForced(null)
      } else if (e.shiftKey && e.key === 'R') {
        // Shift + R
        e.preventDefault()
        if (window.confirm('Reset demo state?')) {
          void resetDemo().then(() => window.location.reload())
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible])

  if (!visible) return null

  return (
    <aside
      aria-label="Demo Controller"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border border-[#dddddd] bg-white px-4 py-2 text-xs font-sans shadow-lg"
      style={{
        boxShadow:
          'rgba(0, 0, 0, 0.04) 0 0 0 1px, rgba(0, 0, 0, 0.08) 0 4px 14px 0, rgba(0, 0, 0, 0.12) 0 8px 24px 0',
      }}
    >
      <div className="flex items-center gap-1.5 font-bold text-[#4E9488] text-[11px] uppercase tracking-wider">
        <span className="flex h-2 w-2 rounded-full bg-[#4E9488] animate-pulse" />
        <span>DEMO:</span>
      </div>

      <div className="flex items-center gap-1 bg-[#f7f7f7] p-1 rounded-full border border-[#ebebeb]">
        <button
          type="button"
          onClick={() => {
            setForcedOutcome('WIN')
            setForced('WIN')
          }}
          className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] transition-all ${
            forced === 'WIN'
              ? 'bg-[#10b981] text-white shadow-sm'
              : 'text-[#6a6a6a] hover:text-[#222222]'
          }`}
          title="Shortcut: Shift + 1"
        >
          WIN
        </button>
        <button
          type="button"
          onClick={() => {
            setForcedOutcome('LOSE')
            setForced('LOSE')
          }}
          className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] transition-all ${
            forced === 'LOSE'
              ? 'bg-[#ef4444] text-white shadow-sm'
              : 'text-[#6a6a6a] hover:text-[#222222]'
          }`}
          title="Shortcut: Shift + 2"
        >
          LOSE
        </button>
        <button
          type="button"
          onClick={() => {
            setForcedOutcome('DRAW')
            setForced('DRAW')
          }}
          className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] transition-all ${
            forced === 'DRAW'
              ? 'bg-[#f59e0b] text-white shadow-sm'
              : 'text-[#6a6a6a] hover:text-[#222222]'
          }`}
          title="Shortcut: Shift + 3"
        >
          DRAW
        </button>
        <button
          type="button"
          onClick={() => {
            setForcedOutcome(null)
            setForced(null)
          }}
          className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] transition-all ${
            forced === null
              ? 'bg-[#4E9488] text-white shadow-sm'
              : 'text-[#6a6a6a] hover:text-[#222222]'
          }`}
          title="Shortcut: Shift + 0 (Natural)"
        >
          AUTO
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setVisible(false)
          setDemoMode(false)
        }}
        className="ml-0.5 text-[#929292] hover:text-[#222222] font-bold px-1 transition-colors"
        title="Hide Demo Cheat Bar (Shift + D)"
      >
        ✕
      </button>
    </aside>
  )
}
