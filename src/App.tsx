import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
// Gallery removed per request
import BookFlip from './components/BookFlip'
import Hero from './pages/intro'
import Splash from './pages/splash'
import heroImage from './assets/hero.png'
import foto1 from './assets/foto1.jpeg'
import foto2 from './assets/foto2.jpeg'
import foto3 from './assets/foto3.jpeg'
import foto4 from './assets/foto4.jpeg'
const targetDate = new Date('2026-06-01T00:00:00')
const musicSrc = '/music.mp3'
const musicStartTime = 145
const SPLASH_TO_VIDEO_DELAY_MS = 900

const extraPhotos = [
  {
    title: 'Manis banget',
    caption: '“Satu momen kecil yang hangatnya tetap tinggal, bahkan saat diingat lagi.”',
    position: 'object-center',
    src: foto1,
  },
  {
    title: 'Peluk lembut',
    caption: '“Peluk yang lembut, seperti jeda paling manis di tengah hari yang ramai.”',
    position: 'object-top',
    src: foto2,
  },
  {
    title: 'Cahaya favorit',
    caption: '“Kamu itu cahaya favorit yang bikin hari terasa lebih hangat.”',
    position: 'object-[50%_35%]',
    src: foto3,
  },
  {
    title: 'Memori manis',
    caption: '“Simpan memori ini baik-baik, supaya senyumnya bisa diingat kapan saja.”',
    position: 'object-[50%_15%]',
    src: foto4,
  },
]


function App() {
  const [countdown, setCountdown] = useState('')
  // gallery removed; activePhoto state not needed
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showBookFlip, setShowBookFlip] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [bookFlipMode, setBookFlipMode] = useState<'intro' | 'post'>('intro')
  const [shownPostBookFlip, setShownPostBookFlip] = useState(false)
  const [bookFlipClosed, setBookFlipClosed] = useState(false)
  
  const [showAudioControl, setShowAudioControl] = useState(false)
  const [forceMuteVideo, setForceMuteVideo] = useState(false)
  const [videoHasEnded, setVideoHasEnded] = useState(false)
  const [, setShowEqualizer] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const splashExitTimerRef = useRef<number | null>(null)

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

  useEffect(() => {
    return () => {
      if (splashExitTimerRef.current) {
        window.clearTimeout(splashExitTimerRef.current)
      }
    }
  }, [])

  // gallery items removed

  const seekMusicStart = (audio: HTMLAudioElement) => {
    const applySeek = () => {
      const targetTime = Math.min(musicStartTime, Math.max(0, audio.duration - 0.1))
      audio.currentTime = Number.isFinite(targetTime) ? targetTime : musicStartTime
    }

    if (audio.readyState >= 1) {
      applySeek()
      return
    }

    audio.addEventListener('loadedmetadata', applySeek, { once: true })
  }

  const toggleMusic = async () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (audio.paused) {
      if (audio.currentTime < musicStartTime || audio.ended) {
        seekMusicStart(audio)
      }

      await audio.play()
      setIsMusicPlaying(true)
      return
    }

    audio.pause()
    setIsMusicPlaying(false)
  }

  const primeMusicMuted = async () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.muted = true
    seekMusicStart(audio)

    try {
      await audio.play()
      setIsMusicPlaying(true)
    } catch {
      setIsMusicPlaying(false)
    }
  }

  const revealMusic = async () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.muted = false

    seekMusicStart(audio)

    try {
      if (audio.paused) {
        await audio.play()
      }

      setIsMusicPlaying(true)
    } catch {
      setIsMusicPlaying(false)
    }
  }

  const handleVideoStart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = true
  }

  const handleGiftOpen = () => {
    void primeMusicMuted()
  }

  const handleBurstComplete = () => {
    void revealMusic()
    setShowEqualizer(true)
    setShowAudioControl(true)
  }

  const handleVideoEnd = () => {
    setVideoHasEnded(true)
  }

  const handleSplashFinish = () => {
    if (splashExitTimerRef.current) {
      window.clearTimeout(splashExitTimerRef.current)
    }

    splashExitTimerRef.current = window.setTimeout(() => {
      setShowSplash(false)
    }, SPLASH_TO_VIDEO_DELAY_MS)
  }

  const handleBookFlipCompleteIntro = () => {
    setShowBookFlip(false)
    setShowSplash(true)
    setBookFlipMode('intro')
    setBookFlipClosed(true)
  }

  const handleBookFlipCompletePost = async () => {
    setShowBookFlip(false)
    setShowSplash(false)
    // reveal music and show equalizer when closing the book at the end
    void revealMusic()
    setShowEqualizer(true)
    setShowAudioControl(true)
    setBookFlipMode('intro')
    setShownPostBookFlip(true)
    setBookFlipClosed(true)
  }

  const showBookFlipAfterFollowUp = () => {
    // avoid re-showing the post-bookflip if it was already shown or the user already closed the book
    if (bookFlipClosed || shownPostBookFlip) return
    setBookFlipMode('post')
    setShowBookFlip(true)
    setShownPostBookFlip(true)
    // start music and UI controls as soon as the book appears after the follow-up video
    void revealMusic()
    setShowEqualizer(true)
    setShowAudioControl(true)
  }


  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden text-stone-800">
      <div
        className="fixed inset-0 -z-20"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(255, 244, 234, 0.9), transparent 30%), radial-gradient(circle at 80% 15%, rgba(252, 231, 243, 0.85), transparent 26%), linear-gradient(180deg, #fff9f5 0%, #fff2eb 42%, #f6ede6 100%)',
        }}
      />
      <motion.div
        className="fixed -left-28 top-12 -z-10 h-72 w-72 rounded-full blur-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(251, 191, 36, 0.22) 42%, rgba(244, 114, 182, 0.08) 72%, transparent 100%)',
        }}
        animate={{ y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        className="fixed right-0 top-1/3 -z-10 h-80 w-80 rounded-full blur-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(251, 191, 36, 0.22) 42%, rgba(244, 114, 182, 0.08) 72%, transparent 100%)',
        }}
        animate={{ y: [0, 18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity, delay: -3 }}
      />
      <motion.div
        className="fixed bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full blur-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(251, 191, 36, 0.22) 42%, rgba(244, 114, 182, 0.08) 72%, transparent 100%)',
        }}
        animate={{ y: [0, -16, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 15, ease: 'easeInOut', repeat: Infinity, delay: -6 }}
      />

      <AnimatePresence>
        {showBookFlip ? (
          <BookFlip
            key="book-flip"
            coverImage={heroImage}
            coverTitle="Happy Birthday Sayang"
            coverSubtitle="Semoga hari ini jadi awal yang paling manis untuk tahun-tahun ke depan."
            pages={extraPhotos}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={toggleMusic}
            onComplete={bookFlipMode === 'intro' ? handleBookFlipCompleteIntro : handleBookFlipCompletePost}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showSplash ? (
          <Splash
            key="splash"
            splashNumber={3}
            eventCountdown={countdown}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={toggleMusic}
            onCountdownFinish={handleSplashFinish}
          />
        ) : null}
      </AnimatePresence>

      <Hero
        playNow={!showSplash && !showBookFlip}
        forceMute={forceMuteVideo}
        onVideoStart={handleVideoStart}
        onVideoEnd={handleVideoEnd}
        onGiftOpen={handleGiftOpen}
        onBurstComplete={handleBurstComplete}
        onFollowUpEnd={showBookFlipAfterFollowUp}
      />

      <audio ref={audioRef} src={musicSrc} preload="metadata" />

      {showAudioControl && !showBookFlip ? (
        <motion.button
          type="button"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/85 px-4 py-3 text-stone-700 shadow-[0_16px_50px_rgba(122,71,75,0.2)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
          onClick={toggleMusic}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="inline-flex h-5 w-5.5 items-end gap-0.75" aria-hidden="true">
            <motion.span
              className="w-0.75 origin-bottom rounded-full bg-[linear-gradient(180deg,#f9a8d4_0%,#f59e0b_100%)] opacity-55"
              style={{ height: 8 }}
              animate={isMusicPlaying ? { scaleY: [0.35, 1, 0.5, 0.35] } : { scaleY: 0.35 }}
              transition={{ duration: 0.95, ease: 'easeInOut', repeat: isMusicPlaying ? Infinity : 0 }}
            />
            <motion.span
              className="w-0.75 origin-bottom rounded-full bg-[linear-gradient(180deg,#f9a8d4_0%,#f59e0b_100%)] opacity-55"
              style={{ height: 16 }}
              animate={isMusicPlaying ? { scaleY: [0.35, 1, 0.5, 0.35] } : { scaleY: 0.35 }}
              transition={{ duration: 0.95, ease: 'easeInOut', repeat: isMusicPlaying ? Infinity : 0, delay: 0.12 }}
            />
            <motion.span
              className="w-0.75 origin-bottom rounded-full bg-[linear-gradient(180deg,#f9a8d4_0%,#f59e0b_100%)] opacity-55"
              style={{ height: 12 }}
              animate={isMusicPlaying ? { scaleY: [0.35, 1, 0.5, 0.35] } : { scaleY: 0.35 }}
              transition={{ duration: 0.95, ease: 'easeInOut', repeat: isMusicPlaying ? Infinity : 0, delay: 0.24 }}
            />
            <motion.span
              className="w-0.75 origin-bottom rounded-full bg-[linear-gradient(180deg,#f9a8d4_0%,#f59e0b_100%)] opacity-55"
              style={{ height: 18 }}
              animate={isMusicPlaying ? { scaleY: [0.35, 1, 0.5, 0.35] } : { scaleY: 0.35 }}
              transition={{ duration: 0.95, ease: 'easeInOut', repeat: isMusicPlaying ? Infinity : 0, delay: 0.36 }}
            />
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
