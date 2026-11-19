import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="button"], select, label[for], .cursor-pointer'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Fast dot + smooth trailing outer ring
  const dotX = useSpring(mouseX, { stiffness: 900, damping: 40, mass: 0.15 })
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 40, mass: 0.15 })
  const ringX = useSpring(mouseX, { stiffness: 260, damping: 24, mass: 0.5 })
  const ringY = useSpring(mouseY, { stiffness: 260, damping: 24, mass: 0.5 })

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (hover: hover)')
    const sync = () => setEnabled(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setVisible(true)

      const target = e.target as HTMLElement | null
      setIsHoveringLink(Boolean(target?.closest(INTERACTIVE_SELECTOR)))
    }

    const handleLeave = () => setVisible(false)
    const handleEnter = () => setVisible(true)
    const handleDown = () => setIsPressed(true)
    const handleUp = () => setIsPressed(false)

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [enabled, mouseX, mouseY])

  if (!enabled) return null

  return (
    <>
      {/* Trailing Outer Ring — expands on link/button hover */}
      <motion.div
        aria-hidden="true"
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: isPressed ? 0.85 : isHoveringLink ? 1.55 : 1,
          borderColor: isHoveringLink ? 'rgba(78, 148, 136, 0.85)' : 'rgba(23, 27, 42, 0.45)',
          backgroundColor: isHoveringLink ? 'rgba(78, 148, 136, 0.12)' : 'rgba(78, 148, 136, 0)',
        }}
        transition={{
          scale: { type: 'spring', stiffness: 360, damping: 24 },
          opacity: { duration: 0.15 },
          borderColor: { duration: 0.18 },
          backgroundColor: { duration: 0.18 },
        }}
        className="pointer-events-none fixed top-0 left-0 z-[95] -ml-[17px] -mt-[17px] h-[34px] w-[34px] rounded-full border-[1.5px]"
      />

      {/* Crisp Inner Dot — expands slightly & turns Rausch Teal on hover */}
      <motion.div
        aria-hidden="true"
        style={{
          x: dotX,
          y: dotY,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: isPressed ? 0.7 : isHoveringLink ? 1.8 : 1,
          backgroundColor: isHoveringLink ? '#4E9488' : '#171B2A',
        }}
        transition={{
          scale: { type: 'spring', stiffness: 450, damping: 26 },
          opacity: { duration: 0.15 },
          backgroundColor: { duration: 0.15 },
        }}
        className="pointer-events-none fixed top-0 left-0 z-[96] -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full"
      />
    </>
  )
}
