import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Reveal from '../components/Reveal'

type IntroProps = {
  playNow: boolean
  forceMute?: boolean
  onVideoStart?: () => void
  onVideoEnd?: () => void
  onGiftOpen?: () => void
  onBurstComplete?: () => void
  onFollowUpEnd?: () => void
}

const flowerBurst = Array.from({ length: 96 }, (_, index) => {
  const count = 96
  const angle = (Math.PI * 2 * index) / count
  const distance = 160 + (index % 20) * 18 + (Math.sin(index) * 20)
  const size = index % 11 === 0 ? 40 : 14 + (index % 7) * 4

  return {
    angle,
    delay: index * 0.006,
    distance,
    duration: 0.6 + (index % 6) * 0.04,
    size,
    symbol: index % 7 === 0 ? '✿' : index % 7 === 1 ? '❀' : index % 7 === 2 ? '✦' : index % 7 === 3 ? '✧' : index % 7 === 4 ? '❁' : index % 7 === 5 ? '✾' : '❃',
  }
})

const petalBurst = Array.from({ length: 64 }, (_, index) => {
  const count = 64
  const angle = (Math.PI * 2 * index) / count
  const distance = 180 + (index % 12) * 22 + (Math.cos(index) * 12)

  return {
    angle,
    delay: index * 0.004,
    distance,
    duration: 0.7 + (index % 5) * 0.05,
    size: 8 + (index % 5) * 3,
  }
})

function Intro({ playNow, forceMute, onVideoStart, onVideoEnd, onGiftOpen, onBurstComplete, onFollowUpEnd }: IntroProps) {
  const reduceMotion = useReducedMotion()
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const followUpVideoRef = useRef<HTMLVideoElement | null>(null)
  const followUpPreloadRef = useRef<HTMLVideoElement | null>(null)
  const burstTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const [followUpReady, setFollowUpReady] = useState(false)
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('videoMuted')
      return raw ? JSON.parse(raw) : false
    } catch {
      return false
    }
  })
  const [videoEnded, setVideoEnded] = useState(false)
  const [giftOpened, setGiftOpened] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [showFollowUpVideo, setShowFollowUpVideo] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [boxOpen, setBoxOpen] = useState(false)

  // Keep the element muted state in sync with user's preference, but
  // do not overwrite the user's stored preference if autoplay is blocked.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
  }, [muted])

  // If parent forces mute (e.g. on first scroll), apply it and persist
  useEffect(() => {
    if (!forceMute) return
    const video = videoRef.current
    if (!video) return
    video.muted = true
    setMuted(true)
    try {
      localStorage.setItem('videoMuted', JSON.stringify(true))
    } catch (storageError) {
      void storageError
    }
  }, [forceMute])

  // Try to play when instructed (after splash ends). If autoplay is blocked
  // we'll try to play muted to allow playback, but we won't persist that
  // forced mute as the user's preference.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!playNow || videoEnded) {
      // if splash not finished, pause so it restarts when ready
      video.pause()
      return
    }

    const tryPlay = async () => {
      try {
        await video.play()
      } catch (playError) {
        void playError
        // Autoplay with sound blocked — try muted autoplay without persisting
        const prevMuted = video.muted
        video.muted = true
        try {
          await video.play()
        } catch (retryError) {
          void retryError
          // give up; user can press play
        } finally {
          // restore muted to stored preference so we don't overwrite user choice
          video.muted = prevMuted
        }
      }
    }

    tryPlay()
  }, [playNow, videoEnded])

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) {
        window.clearTimeout(burstTimerRef.current)
      }

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = matrixCanvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const letters = 'HAPPYBIRTHDAYBELA'
    const alphabet = letters.split('')
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const TARGET_ROWS = 24
    const MIN_FONT = 10
    const MAX_COLUMNS = 80
    const TARGET_FPS = 24
    const FRAME_INTERVAL_MS = 1000 / TARGET_FPS

    let width = 0
    let height = 0
    let fontSize = 16
    let columns = 0
    let rainDrops: number[] = []
    let lastFrameTime = 0

    const resizeCanvas = () => {
      // Force full viewport sizing for a fullscreen matrix background
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      fontSize = Math.max(MIN_FONT, Math.floor(height / TARGET_ROWS))
      columns = Math.max(1, Math.min(MAX_COLUMNS, Math.floor(width / fontSize)))
      rainDrops = Array.from({ length: columns }, (_, index) => -(index % 8) * 8 - Math.random() * 32)
    }

    const draw = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.1)'
      context.fillRect(0, 0, width, height)
      context.font = `bold ${fontSize}px monospace`

      for (let index = 0; index < rainDrops.length; index += 1) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)]
        const x = index * fontSize
        const y = rainDrops[index] * fontSize
        const inCenterBand = x > width * 0.18 && x < width * 0.82 && y > height * 0.18 && y < height * 0.82

        if (inCenterBand) {
          // stronger but still modest glow so video remains visible
          context.shadowBlur = 6
          context.shadowColor = '#ff4da6'
          context.fillStyle = 'rgba(255,77,166,0.88)'
        } else {
          context.shadowBlur = 0
          context.fillStyle = Math.random() > 0.995 ? '#ffffff' : 'rgba(255, 20, 147, 0.22)'
        }

        context.fillText(text, x, y)

        if (y > height && Math.random() > 0.975) {
          rainDrops[index] = 0
        }

        rainDrops[index] += 0.9
      }
    }

    resizeCanvas()

    let animationFrameId = 0
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

  // Warm-up follow-up video early so transition from gift to vidio1 is smooth.
  useEffect(() => {
    const preloadVideo = followUpPreloadRef.current
    if (!preloadVideo) return

    const onReady = () => setFollowUpReady(true)
    preloadVideo.addEventListener('canplaythrough', onReady)
    preloadVideo.load()

    return () => {
      preloadVideo.removeEventListener('canplaythrough', onReady)
    }
  }, [])

  useEffect(() => {
    if (!showFollowUpVideo) return

    const followUpVideo = followUpVideoRef.current
    if (!followUpVideo) return

    const tryPlayFollowUp = async () => {
      followUpVideo.muted = false

      try {
        await followUpVideo.play()
      } catch {
        try {
          followUpVideo.muted = true
          await followUpVideo.play()
        } catch {
          // If autoplay still fails, keep controls available for manual play.
        }
      }
    }

    void tryPlayFollowUp()
  }, [showFollowUpVideo])

  // Track first play so we can notify parent once
  const playedOnceRef = useRef(false)

  const handlePlay = () => {
    if (!playedOnceRef.current) {
      playedOnceRef.current = true
      onVideoStart?.()
    }
  }

  const handleEnded = () => {
    setVideoEnded(true)
    onVideoEnd?.()
  }

  const handleFollowUpEnded = () => {
    onBurstComplete?.()
    onFollowUpEnd?.()
    setDismissed(true)
  }

  const openGift = () => {
    if (giftOpened) {
      return
    }

    setGiftOpened(true)
    setShowBurst(true)
    setBoxOpen(true)
    setMuted(false)
    try {
      localStorage.setItem('videoMuted', JSON.stringify(false))
    } catch (storageError) {
      void storageError
    }
    onGiftOpen?.()

    hideTimerRef.current = window.setTimeout(() => {
      setShowFollowUpVideo(true)
    }, followUpReady ? 220 : 420)

    burstTimerRef.current = window.setTimeout(() => {
      setShowBurst(false)
    }, 1800)
  }


  const toggleMuted = () => {
    const next = !muted
    setMuted(next)
    try {
      localStorage.setItem('videoMuted', JSON.stringify(next))
    } catch (storageError) {
      void storageError
    }

    const v = videoRef.current
    if (!v) return
    v.muted = next
    if (!next) v.play().catch((playError) => {
      void playError
    })
  }

  if (dismissed) {
    return null
  }

  return (
    <Reveal className="relative min-h-screen overflow-hidden bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
        <div className="relative mx-auto flex w-full max-w-98 items-center justify-center sm:max-w-98">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-4xl z-20">
            {/* Fullscreen matrix canvas */}
            <canvas ref={matrixCanvasRef} className="fixed inset-0 h-screen w-screen z-0 pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,105,180,0.16),transparent_28%),radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_22%)]" />
          </div>

          <AnimatePresence mode="wait">
            {!videoEnded ? (
              <motion.video
                key="intro-video"
                ref={videoRef}
                className="relative z-30 h-[min(72vh,560px)] w-full rounded-2xl object-contain shadow-md sm:h-[min(72vh,560px)] sm:rounded-2xl"
                src="/vidio.mp4"
                playsInline
                controls
                muted={muted}
                preload="auto"
                onPlay={handlePlay}
                onEnded={handleEnded}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ) : (
              <motion.video
                key="follow-up-video"
                ref={followUpVideoRef}
                className={`relative z-30 h-[min(72vh,560px)] w-full rounded-2xl object-contain shadow-md sm:h-[min(72vh,560px)] ${showFollowUpVideo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                src="/vidio1.mp4"
                playsInline
                controls={showFollowUpVideo}
                muted={false}
                preload="auto"
                onEnded={handleFollowUpEnded}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          <video
            ref={followUpPreloadRef}
            src="/vidio1.mp4"
            preload="auto"
            muted
            playsInline
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />

          {videoEnded && !showFollowUpVideo ? (
            <motion.button
              key="gift-box"
              type="button"
              onClick={openGift}
              className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-4xl bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0d_100%)] shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%)]" />
              <motion.div
                className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80"
                style={{ perspective: '1200px' }}
                animate={boxOpen ? { y: [0, -8, 0], rotateZ: [-1.2, 1.4, -1.2], rotateX: [8, 12, 8] } : { y: [0, -5, 0], rotateZ: [-0.7, 0.8, -0.7], rotateX: [6, 9, 6] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute bottom-4 left-1/2 h-12 w-52 -translate-x-1/2 rounded-[50%] bg-black/40 blur-2xl" />

                <motion.div
                  className="absolute left-1/2 top-10 h-20 w-56 -translate-x-1/2 rounded-4xl bg-linear-to-br from-rose-50 via-white to-amber-50 shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
                  animate={boxOpen ? { y: -14, rotateX: -24, scaleY: 0.96 } : { y: 0, rotateX: 0, scaleY: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
                <div className="absolute left-1/2 top-16 h-36 w-56 -translate-x-1/2 rounded-[1.8rem] bg-linear-to-br from-rose-300 via-rose-200 to-rose-500 shadow-[0_28px_55px_rgba(0,0,0,0.42)]" />

                <div className="absolute left-1/2 top-12 h-40 w-10 -translate-x-1/2 rounded-full bg-linear-to-b from-white/95 via-pink-200 to-rose-500 shadow-[0_0_35px_rgba(244,114,182,0.55)]" />
                <div className="absolute left-1/2 top-28 h-10 w-64 -translate-x-1/2 rounded-full bg-linear-to-r from-white/95 via-pink-200 to-rose-500 shadow-[0_0_35px_rgba(244,114,182,0.45)]" />

                <div className="absolute left-1/2 top-11 h-20 w-56 -translate-x-1/2 overflow-hidden rounded-[1.8rem]">
                  <div className="absolute inset-0 bg-linear-to-b from-white/55 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_42%)]" />
                  <div className="absolute inset-0 border border-white/40" />
                </div>

                <motion.div
                  className="absolute left-1/2 top-2 -translate-x-1/2"
                  animate={boxOpen ? { y: -10, rotate: -12, opacity: 0.98 } : { y: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                >
                  <div className="absolute top-0 h-12 w-16 rounded-[60%_40%_55%_45%] bg-linear-to-br from-rose-100 via-white to-rose-200 shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ left: '-34px', transform: 'rotate(-18deg)' }} />
                  <div className="absolute top-0 h-12 w-16 rounded-[60%_40%_55%_45%] bg-linear-to-br from-rose-100 via-white to-rose-200 shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ left: '10px', transform: 'rotate(18deg)' }} />
                  <div className="absolute top-6 h-9 w-20 rounded-[60%_40%_55%_45%] bg-linear-to-br from-rose-100 via-white to-rose-200 shadow-[0_8px_18px_rgba(0,0,0,0.18)]" style={{ left: '-10px', transform: 'rotate(90deg)' }} />
                </motion.div>

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.5em] text-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  Buka Hadiah
                </div>
              </motion.div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.5em] text-white/75 backdrop-blur-xl sm:bottom-10">
                Klik untuk ledakkan bunga
              </div>
            </motion.button>
          ) : null}

          <AnimatePresence>
            {showBurst ? (
              <motion.div
                key="flower-burst"
                className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(255,255,255,0.34)_12%,rgba(255,255,255,0.14)_24%,transparent_62%)]" />
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.34),transparent_28%),radial-gradient(circle_at_center,rgba(244,114,182,0.28),transparent_44%),radial-gradient(circle_at_center,rgba(253,242,248,0.16),transparent_58%)]"
                  animate={{ opacity: [0.5, 1, 0.72] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 blur-3xl"
                  animate={{ scale: [0.7, 6, 10], opacity: [0.98, 0.95, 0] }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                />
                {(!reduceMotion ? flowerBurst : flowerBurst.slice(0, 24)).map((flower, index) => (
                  <motion.span
                    key={`flower-${index}`}
                    className="absolute left-1/2 top-[44%] flex items-center justify-center text-rose-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                    style={{ fontSize: `${flower.size}px` }}
                    initial={{ opacity: 0, scale: 0.18, x: 0, y: 18, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.18, 1, 1.15, 0.92],
                      x: [0, Math.cos(flower.angle) * flower.distance],
                      y: [18, Math.sin(flower.angle) * flower.distance * -1],
                      rotate: [0, flower.angle * 28, flower.angle * 44],
                    }}
                      transition={{ duration: flower.duration, delay: flower.delay, ease: 'easeOut' }}
                  >
                    {flower.symbol}
                  </motion.span>
                ))}
                {(!reduceMotion ? petalBurst : petalBurst.slice(0, 16)).map((petal, index) => (
                  <motion.span
                    key={`petal-${index}`}
                    className="absolute left-1/2 top-[44%] rounded-full bg-rose-100/90 blur-[0.5px]"
                    style={{ width: `${petal.size}px`, height: `${Math.max(4, petal.size - 4)}px` }}
                    initial={{ opacity: 0, scale: 0.1, x: 0, y: 18, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.1, 1, 1.08, 0.85],
                      x: [0, Math.cos(petal.angle) * petal.distance],
                      y: [18, Math.sin(petal.angle) * petal.distance * -1],
                      rotate: [0, petal.angle * 35, petal.angle * 55],
                    }}
                    transition={{ duration: petal.duration, delay: petal.delay, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={toggleMuted}
            aria-pressed={!muted}
            className="absolute right-3 bottom-3 z-40 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:scale-105"
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>
    </Reveal>
  )
}

export default Intro