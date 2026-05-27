import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import './splash.css'

const splashLetters = 'HAPPYBIRTHDAYBELA'.split('')

const splashGlyphs = Array.from({ length: 180 }, (_, index) => {
  const letter = splashLetters[index % splashLetters.length]

  return {
    letter,
    left: (index * 5.7) % 100,
    delay: index * -0.14,
    duration: 4.5 + (index % 8) * 0.35,
    size: 12 + (index % 5) * 2,
    xOffset: ((index % 7) - 3) * 5,
    opacity: 0.38 + (index % 6) * 0.08,
  }
})

type SplashProps = {
  splashNumber: number
  eventCountdown: string
  isMusicPlaying: boolean
  toggleMusic: () => void
  onCountdownFinish?: () => void
}

function Splash({ splashNumber, eventCountdown, isMusicPlaying, toggleMusic, onCountdownFinish }: SplashProps) {
  const isGreeting = splashNumber === 0
  const [showLoader, setShowLoader] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [countValue, setCountValue] = useState<number | null>(null)
  const [showHB, setShowHB] = useState(false)
  const countdownActive = (countValue !== null) || showHB

  useEffect(() => {
    const t = window.setTimeout(() => setShowLoader(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showLoader) {
      const t = window.setTimeout(() => setContentVisible(true), 260)
      return () => window.clearTimeout(t)
    }
    setContentVisible(false)
  }, [showLoader])

  // countdown 3 -> 0 over 3 seconds, then show "Happy Birthday" for 1s
  useEffect(() => {
    if (!contentVisible) return

    const interval = 3000 / 4 // 4 steps (3,2,1,0) across 3s -> 0.75s
    const timers: number[] = []

    setCountValue(3)

    for (let i = 1; i <= 3; i++) {
      timers.push(window.setTimeout(() => setCountValue(3 - i), Math.round(i * interval)))
    }

    // after full 3s, show HB for 1s
    timers.push(window.setTimeout(() => {
      setCountValue(null)
      setShowHB(true)
    }, 3000))

    timers.push(window.setTimeout(() => {
      setShowHB(false)
      if (typeof onCountdownFinish === 'function') onCountdownFinish()
    }, 4000))

    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [contentVisible])

  return (
    <motion.div
      className="fixed inset-0 z-100 overflow-hidden bg-[#040404] text-fuchsia-400"
      data-splash-number={splashNumber}
      data-countdown={eventCountdown}
      data-greeting={isGreeting ? 'yes' : 'no'}
      data-countdown-active={countdownActive ? 'yes' : 'no'}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-label="Splash screen"
      role="presentation"
    >
      <div aria-hidden={!showLoader}>
        <motion.div
          className="initial-loader fixed inset-0 z-110 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={showLoader ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-center px-6">
            <div className="loader-wrap">
              <div className="spinner" />
            </div>
            <motion.h2
              className="mt-6 font-serif text-2xl text-fuchsia-100"
              initial={{ y: 8, opacity: 0 }}
              animate={showLoader ? { y: 0, opacity: 1 } : { y: -6, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              Preparing something special...
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-fuchsia-200/80"
              initial={{ y: 6, opacity: 0 }}
              animate={showLoader ? { y: 0, opacity: 1 } : { y: -4, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.06 }}
            >
              Good things take time.
            </motion.p>
          </div>
        </motion.div>
      </div>
      <div className="splash-rain" aria-hidden="true">
        {splashGlyphs.map((glyph, index) => (
          <motion.div
            key={`${glyph.letter}-${index}`}
            className="splash-glyph"
            style={{
              left: `${glyph.left}%`,
              fontSize: `${glyph.size}px`,
              opacity: glyph.opacity,
            }}
            animate={{
              opacity: [0, glyph.opacity, glyph.opacity, 0],
              y: ['-18vh', '48vh', '118vh'],
              x: [glyph.xOffset, glyph.xOffset + 10, glyph.xOffset - 6],
              scale: [0.92, 1, 0.98],
            }}
            transition={{
              duration: glyph.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: glyph.delay,
            }}
          >
            <span className={`splash-word ${index % 5 === 0 ? 'splash-word-bright' : ''} ${index % 9 === 0 ? 'splash-word-soft' : ''}`}>
              {glyph.letter}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="splash-cinematic" aria-hidden="true">
        <div className="splash-vignette" />
        <div className="splash-grain" />
        <div className="splash-soft-blur splash-soft-blur-left" />
        <div className="splash-soft-blur splash-soft-blur-right" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,105,180,0.18),transparent_28%),radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_22%)]" aria-hidden="true" />

      <motion.div
        className="relative flex min-h-screen items-center justify-center px-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={contentVisible ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        {/* Countdown / Happy Birthday overlay */}
        {contentVisible && (countValue !== null || showHB) ? (
          <div className="fixed inset-0 z-120 flex items-center justify-center pointer-events-none">
            {countValue !== null ? (
              <motion.div className="text-center text-fuchsia-100" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.28 }}>
                <div className="font-black text-[6.5rem] sm:text-[10rem] leading-none drop-shadow-[0_0_40px_rgba(236,72,153,0.45)]">{countValue}</div>
              </motion.div>
            ) : (
              showHB && (
                <motion.div className="text-center text-fuchsia-100" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="font-serif text-5xl sm:text-7xl font-semibold drop-shadow-[0_0_28px_rgba(236,72,153,0.45)]">Happy Birthday</div>
                </motion.div>
              )
            )}
          </div>
        ) : null}
        <motion.button
          type="button"
          aria-pressed={isMusicPlaying}
          onClick={toggleMusic}
          className="absolute top-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/8 backdrop-blur transition hover:scale-105"
          whileTap={{ scale: 0.96 }}
        >
          {isMusicPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fuchsia-200">
              <rect x="6" y="5" width="3" height="14" fill="currentColor" />
              <rect x="15" y="5" width="3" height="14" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fuchsia-200">
              <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
            </svg>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default Splash