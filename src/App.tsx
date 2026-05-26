import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
// Gallery removed per request
import Hero from './pages/intro'
import Splash from './pages/splash'
import heroImage from './assets/hero.png'
import './App.css'
const targetDate = new Date('2026-06-01T00:00:00')
const musicSrc = '/music.mp3'


function App() {
  const [countdown, setCountdown] = useState('')
  // gallery removed; activePhoto state not needed
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [splashCount, setSplashCount] = useState(3)
  const [showAudioControl, setShowAudioControl] = useState(false)
  const [forceMuteVideo, setForceMuteVideo] = useState(false)
  const [videoHasEnded, setVideoHasEnded] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // scroll behavior removed (no automatic scroll-restoration or scrolling)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        setCountdown('Hari istimewa Bela sudah tiba.')
        return
      }

      const totalDays = Math.ceil(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)

      setCountdown(`${totalDays} hari ${hours} jam ${minutes} menit lagi`)
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 60000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!showSplash) {
      return
    }

    setSplashCount(3)

    const timeouts: number[] = []

    const schedule = (value: number) => {
      setSplashCount(value)

      if (value <= 0) {
        timeouts.push(window.setTimeout(() => setShowSplash(false), 1400))
        return
      }

      if (value === 1) {
        timeouts.push(window.setTimeout(() => schedule(0), 1000))
        return
      }

      timeouts.push(window.setTimeout(() => schedule(value - 1), 1000))
    }

    timeouts.push(window.setTimeout(() => schedule(2), 1000))

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout))
    }
  }, [showSplash])

  // When splash finishes, attempt to play background music
  useEffect(() => {
    if (showSplash) return
    const audio = audioRef.current
    if (!audio) return

    audio.play().then(() => {
      setIsMusicPlaying(true)
    }).catch(() => {
      // Autoplay blocked; leave paused until user interacts
      setIsMusicPlaying(false)
    })
  }, [showSplash])

  // If the video has ended, resume the background music when possible.
  useEffect(() => {
    if (!videoHasEnded) return
    const audio = audioRef.current
    if (!audio) return

    audio.muted = false
    audio.play().then(() => {
      setIsMusicPlaying(true)
    }).catch(() => {
      setIsMusicPlaying(false)
    })
  }, [videoHasEnded])

  // On first user scroll, reveal audio controls and force-mute the video
  useEffect(() => {
    let fired = false
    const onScroll = () => {
      if (!videoHasEnded) {
        return
      }

      if (fired) return
      fired = true
      setShowEqualizer(true)
      setShowAudioControl(true)
      setForceMuteVideo(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [videoHasEnded])

  // gallery items removed

  const toggleMusic = async () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (audio.paused) {
      await audio.play()
      setIsMusicPlaying(true)
      return
    }

    audio.pause()
    setIsMusicPlaying(false)
  }

  const handleVideoStart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = true
  }

  const handleVideoEnd = () => {
    const audio = audioRef.current
    if (audio) {
      audio.muted = false
    }
    setShowEqualizer(true)
    setVideoHasEnded(true)
  }

  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden text-stone-800">
      <div className="page-backdrop fixed inset-0 -z-20" aria-hidden="true" />
      <div className="floating-orb floating-orb-left fixed -left-28 top-12 -z-10 h-72 w-72 rounded-full blur-3xl" aria-hidden="true" />
      <div className="floating-orb floating-orb-right fixed right-0 top-1/3 -z-10 h-80 w-80 rounded-full blur-3xl" aria-hidden="true" />
      <div className="floating-orb floating-orb-bottom fixed bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full blur-3xl" aria-hidden="true" />

      <AnimatePresence>
        {showSplash ? (
          <Splash
            key="splash"
            splashNumber={splashCount}
            eventCountdown={countdown}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={toggleMusic}
          />
        ) : null}
      </AnimatePresence>

      <Hero
        playNow={!showSplash}
        forceMute={forceMuteVideo}
        onVideoStart={handleVideoStart}
        onVideoEnd={handleVideoEnd}
      />

      <AnimatePresence>
        {showEqualizer ? (
          <motion.section
            className="mx-auto w-full max-w-6xl min-h-[150vh] px-4 pb-16 pt-8 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="sticky top-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(122,71,75,0.14)] backdrop-blur-xl">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[320px] bg-stone-950">
                  <img
                    src={heroImage}
                    alt="Kenangan manis untuk Bela Amelia Nuralfiani"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-100/90">
                      Foto kenangan
                    </p>
                    <h2 className="mt-3 max-w-md font-serif text-3xl leading-tight text-white sm:text-4xl">
                      Happy Birthday, Bela Amelia Nuralfiani
                    </h2>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-8 sm:py-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-400">
                        Equalizer visual
                      </p>
                      <h3 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">
                        Musik dan ucapan spesial
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                    >
                      {isMusicPlaying ? 'Music Off' : 'Music On'}
                    </button>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                    Setelah video selesai, bagian ini muncul saat kamu scroll. Di sini ada foto kenangan,
                    equalizer yang bergerak, dan tombol untuk menyalakan atau mematikan musik latar.
                  </p>

                  <div className="mt-8 flex h-36 items-end justify-center gap-2 sm:h-40 sm:gap-3" aria-hidden="true">
                    {[18, 54, 28, 72, 36, 84, 48, 66, 24, 90, 42, 78].map((barHeight, index) => (
                      <motion.span
                        key={`${barHeight}-${index}`}
                        className="block w-3 rounded-full bg-gradient-to-t from-rose-400 via-fuchsia-400 to-amber-200 shadow-[0_0_18px_rgba(236,72,153,0.35)] sm:w-4"
                        style={{ height: `${barHeight}%` }}
                        animate={{
                          height: [`${barHeight}%`, `${Math.max(18, barHeight - 22)}%`, `${Math.min(92, barHeight + 18)}%`, `${barHeight}%`],
                        }}
                        transition={{
                          duration: 1.4 + (index % 4) * 0.18,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.08,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
      {/* Gallery removed */}

      {/* lightbox removed */}

      <audio ref={audioRef} src={musicSrc} loop preload="none" />

      {showAudioControl ? (
        <motion.button
          type="button"
          className="audio-dock fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/85 px-4 py-3 text-stone-700 shadow-[0_16px_50px_rgba(122,71,75,0.2)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
          onClick={toggleMusic}
          whileTap={{ scale: 0.96 }}
        >
          <span className={`audio-wave ${isMusicPlaying ? 'is-playing' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.35em] text-rose-400">
              Music On / Off
            </span>
            <span className="block text-sm font-medium">{isMusicPlaying ? 'Pause lagu' : 'Play lagu'}</span>
          </span>
        </motion.button>
      ) : null}
    </main>
  )
}

export default App
