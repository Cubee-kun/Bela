import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Reveal from '../components/Reveal'

type IntroProps = {
  playNow: boolean
  forceMute?: boolean
  onVideoStart?: () => void
  onVideoEnd?: () => void
  onGiftOpen?: () => void
  onBurstComplete?: () => void
}

const flowerBurst = Array.from({ length: 96 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 96
  const distance = 120 + (index % 12) * 22
  const size = index % 9 === 0 ? 34 : 18 + (index % 6) * 5

  return {
    angle,
    delay: index * 0.012,
    distance,
    duration: 0.72 + (index % 7) * 0.045,
    size,
    symbol: index % 5 === 0 ? '✿' : index % 5 === 1 ? '❀' : index % 5 === 2 ? '✦' : index % 5 === 3 ? '✧' : '❁',
  }
})

const petalBurst = Array.from({ length: 56 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 56
  const distance = 200 + (index % 8) * 28

  return {
    angle,
    delay: index * 0.01,
    distance,
    duration: 0.95 + (index % 4) * 0.06,
    size: 10 + (index % 4) * 3,
  }
})

function Intro({ playNow, forceMute, onVideoStart, onVideoEnd, onGiftOpen, onBurstComplete }: IntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const followUpVideoRef = useRef<HTMLVideoElement | null>(null)
  const burstTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const playTimerRef = useRef<number | null>(null)
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
    } catch {}
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
      } catch (err) {
        // Autoplay with sound blocked — try muted autoplay without persisting
        const prevMuted = video.muted
        video.muted = true
        try {
          await video.play()
        } catch {
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

      if (playTimerRef.current) {
        window.clearTimeout(playTimerRef.current)
      }
    }
  }, [])

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
    setDismissed(true)
  }

  const openGift = () => {
    if (giftOpened) {
      return
    }

    setGiftOpened(true)
    setShowBurst(true)
    setMuted(false)
    try {
      localStorage.setItem('videoMuted', JSON.stringify(false))
    } catch {}
    onGiftOpen?.()

    hideTimerRef.current = window.setTimeout(() => {
      setShowFollowUpVideo(true)
    }, 420)

    const followUpVideo = followUpVideoRef.current
    if (followUpVideo) {
      const tryPlayNow = async () => {
        followUpVideo.muted = false
        try {
          await followUpVideo.play()
        } catch {
          try {
            followUpVideo.muted = true
            await followUpVideo.play()
          } catch {
            // if this still fails, the hidden follow-up video is ready and can be played manually
          }
        }
      }

      playTimerRef.current = window.setTimeout(() => {
        void tryPlayNow()
      }, 620)
    }

    burstTimerRef.current = window.setTimeout(() => {
      setShowBurst(false)
    }, 1250)
  }


  const toggleMuted = () => {
    const next = !muted
    setMuted(next)
    try {
      localStorage.setItem('videoMuted', JSON.stringify(next))
    } catch {}

    const v = videoRef.current
    if (!v) return
    v.muted = next
    if (!next) v.play().catch(() => {})
  }

  if (dismissed) {
    return null
  }

  return (
    <Reveal className="relative min-h-screen overflow-hidden bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
        <div className="relative w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {!videoEnded ? (
              <motion.video
                key="intro-video"
                ref={videoRef}
                className="h-[min(86vh,780px)] w-full rounded-4xl bg-black object-contain shadow-2xl sm:h-[min(84vh,760px)] sm:rounded-4xl"
                src="/vidio.mp4"
                playsInline
                controls
                muted={muted}
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
                className={`h-[min(86vh,780px)] w-full rounded-4xl bg-black object-contain shadow-2xl sm:h-[min(84vh,760px)] ${showFollowUpVideo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                src="/vidio1.mp4"
                playsInline
                controls={showFollowUpVideo}
                muted={false}
                onEnded={handleFollowUpEnded}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {videoEnded && !showFollowUpVideo ? (
            <motion.button
              key="gift-box"
              type="button"
              onClick={openGift}
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-4xl bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0d0d0d_100%)] shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%)]" />
              <motion.div
                className="relative flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64"
                animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-8 rounded-4xl bg-linear-to-br from-rose-200 via-rose-100 to-amber-100 shadow-[0_18px_50px_rgba(0,0,0,0.38)]" />
                <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 rounded-full bg-linear-to-b from-rose-500 via-pink-300 to-rose-600 shadow-[0_0_35px_rgba(244,114,182,0.6)]" />
                <div className="absolute top-1/2 left-0 h-8 w-full -translate-y-1/2 rounded-full bg-linear-to-r from-rose-500 via-pink-300 to-rose-600 shadow-[0_0_35px_rgba(244,114,182,0.45)]" />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.5em] text-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
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
                  className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 blur-3xl"
                  animate={{ scale: [0.7, 3.6, 6], opacity: [0.98, 0.82, 0] }}
                  transition={{ duration: 0.92, ease: 'easeOut' }}
                />
                {flowerBurst.map((flower, index) => (
                  <motion.span
                    key={`flower-${index}`}
                    className="absolute left-1/2 top-1/2 flex items-center justify-center text-rose-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                    style={{ fontSize: `${flower.size}px` }}
                    initial={{ opacity: 0, scale: 0.18, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.18, 1, 1.15, 0.92],
                      x: [0, Math.cos(flower.angle) * flower.distance],
                      y: [0, Math.sin(flower.angle) * flower.distance * -1],
                      rotate: [0, flower.angle * 28, flower.angle * 44],
                    }}
                      transition={{ duration: flower.duration, delay: flower.delay, ease: 'easeOut' }}
                  >
                    {flower.symbol}
                  </motion.span>
                ))}
                {petalBurst.map((petal, index) => (
                  <motion.span
                    key={`petal-${index}`}
                    className="absolute left-1/2 top-1/2 rounded-full bg-rose-100/90 blur-[0.5px]"
                    style={{ width: `${petal.size}px`, height: `${Math.max(4, petal.size - 4)}px` }}
                    initial={{ opacity: 0, scale: 0.1, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.1, 1, 1.08, 0.85],
                      x: [0, Math.cos(petal.angle) * petal.distance],
                      y: [0, Math.sin(petal.angle) * petal.distance * -1],
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