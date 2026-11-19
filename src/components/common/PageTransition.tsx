import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface PageTransitionProps {
  locationKey: string
  children: React.ReactNode
}

export function PageTransition({ locationKey, children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [locationKey])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        ref={containerRef}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={() => {
          // Clear transform after entry so position:fixed & position:sticky children behave natively
          if (containerRef.current) {
            containerRef.current.style.transform = ''
          }
        }}
        className="relative flex-1 flex flex-col"
      >
        {/* Top editorial progress sweep line on every route transition */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0.95 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '0% 50%' }}
          className="pointer-events-none fixed top-0 left-0 right-0 z-[90] h-[2.5px] bg-gradient-to-r from-[#2B6B61] via-[#4E9488] to-[#10B981]"
        />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
