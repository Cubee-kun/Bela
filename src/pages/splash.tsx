import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type SplashProps = {
  splashNumber: number
  eventCountdown: string
  isMusicPlaying: boolean
  toggleMusic: () => void
  onCountdownFinish?: () => void
}

// Countdown configuration (tweak these to change pacing)
const countdownSteps = [3, 2, 1]
const LOADER_DURATION_MS = 1100 // loader visibility for "Preparing something special..."
const PRE_COUNTDOWN_PAUSE_MS = 900 // extra pause after loader before showing countdown
const STEP_DELAY_MS = 1500 // time between each countdown step (3 -> 2 -> 1)
const SHOW_HB_AFTER_MS = 3 * STEP_DELAY_MS // when to show "Happy Birthday"
const SHOW_HB_DURATION_MS = 1200 // how long "Happy Birthday" stays visible
const PAUSE_AFTER_HB_MS = 380 // short pause before "For"
const FOR_MESSAGE = 'For'
const SHOW_FOR_DURATION_MS = 850
const PAUSE_AFTER_FOR_MS = 320 // short pause before name
const NAME_MESSAGE = 'Bela Amelia Nuralfiani'
const SHOW_NAME_DURATION_MS = 1600
const TARGET_FPS = 24
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS

function Splash({ splashNumber, eventCountdown, isMusicPlaying, toggleMusic, onCountdownFinish }: SplashProps) {
  const isGreeting = splashNumber === 0
  const reduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const countdownRef = useRef(3)
  const countdownActiveRef = useRef(false)
  const finishedRef = useRef(false)
  const [showLoader, setShowLoader] = useState(true)
  const [countValue, setCountValue] = useState<number | null>(null)
  const [showHB, setShowHB] = useState(false)
  const [showFor, setShowFor] = useState(false)
  const [showName, setShowName] = useState(false)

  // small loader shown before countdown starts
  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), LOADER_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    countdownRef.current = countValue ?? 0
    countdownActiveRef.current = countValue !== null
  }, [countValue])

  useEffect(() => {
    const timers: number[] = []
    const countdownStartAt = LOADER_DURATION_MS + PRE_COUNTDOWN_PAUSE_MS
    const showForAt = SHOW_HB_AFTER_MS + SHOW_HB_DURATION_MS + PAUSE_AFTER_HB_MS
    const showNameAt = showForAt + SHOW_FOR_DURATION_MS + PAUSE_AFTER_FOR_MS
    const finishAt = showNameAt + SHOW_NAME_DURATION_MS

    countdownSteps.forEach((step, index) => {
      timers.push(
        window.setTimeout(() => {
          setCountValue(step)
        }, countdownStartAt + (index * STEP_DELAY_MS)),
      )
    })

    // show "Happy Birthday"
    timers.push(
      window.setTimeout(() => {
        setCountValue(null)
        setShowHB(true)
      }, countdownStartAt + SHOW_HB_AFTER_MS),
    )

    // after HB + pause, show "For"
    timers.push(
      window.setTimeout(() => {
        setShowHB(false)
        setCountValue(null)
        setShowFor(true)
      }, countdownStartAt + showForAt),
    )

    // after "For" + pause, show full name
    timers.push(
      window.setTimeout(() => {
        setShowFor(false)
        setShowName(true)
      }, countdownStartAt + showNameAt),
    )

    // finish splash after name
    timers.push(
      window.setTimeout(() => {
        setShowFor(false)
        setShowName(false)
        if (!finishedRef.current) {
          finishedRef.current = true
          onCountdownFinish?.()
        }
      }, countdownStartAt + finishAt),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [onCountdownFinish])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const targetText = 'HAPPYBIRTHDAYBELA'
    const alphabet = targetText.split('')
    // Aim for ~31 rows vertically so each cell is reasonably large on desktop
    const TARGET_ROWS = 31
    const MIN_FONT = 10
    const MAX_COLUMNS = 80 // tighter cap to keep draw calls light
    const dpr = Math.max(1, window.devicePixelRatio || 1)

    let width = 0
    let height = 0
    let columns = 0
    let rainDrops: number[] = []
    let fontSize = reduceMotion ? 18 : 16

    const resizeCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      // derive fontSize so that roughly TARGET_ROWS fit vertically
      fontSize = Math.max(MIN_FONT, Math.floor(height / TARGET_ROWS))

      // compute columns from the chosen fontSize and cap it to avoid too many draw ops
      columns = Math.max(1, Math.min(MAX_COLUMNS, Math.floor(width / fontSize)))
      rainDrops = Array.from({ length: columns }, (_, column) => -(column % 7) * 10 - Math.random() * 40)
    }

    const isInsideDotMatrixNumber = (x: number, y: number, num: number) => {
      const centerX = width / 2
      const centerY = height / 2
      const dx = x - centerX
      const dy = y - centerY
      const w = 110
      const h = 160

      if (num === 3) {
        if (Math.abs(dx) < w && Math.abs(dy) < h) {
          const topCurve = dx ** 2 + (dy + h / 2) ** 2 < w ** 2 && dx ** 2 + (dy + h / 2) ** 2 > (w - 35) ** 2 && dx > -20
          const bottomCurve = dx ** 2 + (dy - h / 2) ** 2 < w ** 2 && dx ** 2 + (dy - h / 2) ** 2 > (w - 35) ** 2 && dx > -20
          const middleBar = Math.abs(dy) < 15 && dx > -30 && dx < w - 20
          return topCurve || bottomCurve || middleBar
        }
      } else if (num === 2) {
        if (Math.abs(dx) < w && Math.abs(dy) < h) {
          const topArc = dx ** 2 + (dy + 60) ** 2 < 90 ** 2 && dx ** 2 + (dy + 60) ** 2 > 55 ** 2 && dy < -40
          const topRight = dx > 50 && dx < 90 && dy >= -40 && dy < 0
          const diagonal = dx + dy * 0.7 > -20 && dx + dy * 0.7 < 25 && dy >= 0 && dy < h - 30
          const bottomBar = dy >= h - 30 && dy < h && dx > -w + 20 && dx < w
          return topArc || topRight || diagonal || bottomBar
        }
      } else if (num === 1) {
        return dx > -20 && dx < 20 && dy > -h && dy < h
      }

      return false
    }

    const draw = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.08)'
      context.fillRect(0, 0, width, height)
      context.font = `bold ${fontSize}px monospace`

      for (let index = 0; index < rainDrops.length; index += 1) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)]
        const xPos = index * fontSize
        const yPos = rainDrops[index] * fontSize
        const isLED = countdownActiveRef.current && isInsideDotMatrixNumber(xPos, yPos, countdownRef.current)

        if (isLED) {
          context.fillStyle = '#ff4da6'
          context.shadowBlur = 10
          context.shadowColor = '#ff4da6'
          context.fillText(text, xPos, yPos)
        } else {
          context.shadowBlur = 0
          context.fillStyle = Math.random() > 0.992 ? '#ffffff' : 'rgba(255, 20, 147, 0.3)'
          context.fillText(text, xPos, yPos)
        }

        if (yPos > height && Math.random() > 0.975) {
          rainDrops[index] = 0
        }

        rainDrops[index] += 0.9
      }
    }

    resizeCanvas()

    let animationFrameId = 0
    let lastFrameTime = 0
    const renderLoop = (timestamp: number) => {
      if (timestamp - lastFrameTime >= FRAME_INTERVAL_MS) {
        draw()
        lastFrameTime = timestamp
      }

      animationFrameId = window.requestAnimationFrame(renderLoop)
    }

    if (reduceMotion) {
      draw()
    } else {
      animationFrameId = window.requestAnimationFrame(renderLoop)
    }

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [reduceMotion])

  return (
    <motion.div
      className="fixed inset-0 z-100 overflow-hidden bg-[#040404] text-fuchsia-400"
      data-splash-number={splashNumber}
      data-countdown={eventCountdown}
      data-greeting={isGreeting ? 'yes' : 'no'}
      data-countdown-active={countValue !== null || showHB || showFor || showName ? 'yes' : 'no'}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-label="Splash screen"
      role="presentation"
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />

      <div aria-hidden={!showLoader}>
        <motion.div
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/60"
          initial={{ opacity: 1 }}
          animate={showLoader ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="px-6 text-center">
            <div className="inline-flex h-18 w-18 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/12 border-t-fuchsia-500" />
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,105,180,0.18),transparent_28%),radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_22%)]" aria-hidden="true" />

      <motion.div
        className="relative flex min-h-screen items-center justify-center px-4"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        {(countValue !== null || showHB || showFor || showName) ? (
          <div className="pointer-events-none fixed inset-0 z-120 flex items-center justify-center">
            {countValue !== null ? (
              <motion.div className="text-center text-fuchsia-100" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.28 }}>
                <div className="font-black text-[6.5rem] leading-none drop-shadow-[0_0_40px_rgba(236,72,153,0.45)] sm:text-[10rem]">{countValue}</div>
              </motion.div>
            ) : showName ? (
              <motion.div className="text-center text-fuchsia-100" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.38 }}>
                <div className="font-serif text-3xl font-semibold drop-shadow-[0_0_28px_rgba(236,72,153,0.45)] sm:text-5xl">{NAME_MESSAGE}</div>
              </motion.div>
            ) : showFor ? (
              <motion.div className="text-center text-fuchsia-100" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.36 }}>
                <div className="font-serif text-4xl font-semibold drop-shadow-[0_0_28px_rgba(236,72,153,0.45)] sm:text-5xl">{FOR_MESSAGE}</div>
              </motion.div>
            ) : (
              showHB && (
                <motion.div className="text-center text-fuchsia-100" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="font-serif text-5xl font-semibold drop-shadow-[0_0_28px_rgba(236,72,153,0.45)] sm:text-7xl">Happy Birthday</div>
                </motion.div>
              )
            )}
          </div>
        ) : null}

        <motion.button
          type="button"
          aria-pressed={isMusicPlaying}
          onClick={toggleMusic}
          className="absolute right-6 top-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:scale-105"
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