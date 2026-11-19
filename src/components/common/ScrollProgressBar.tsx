import { motion, useScroll, useSpring } from 'motion/react'

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 28,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="pointer-events-none fixed top-0 left-0 right-0 z-[85] h-[3px] bg-gradient-to-r from-[#2B6B61] via-[#4E9488] to-[#10B981] shadow-[0_0_8px_rgba(78,148,136,0.45)]"
    />
  )
}
