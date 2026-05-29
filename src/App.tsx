import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
// Gallery removed per request
import Hero from './pages/intro'
import Splash from './pages/splash'
import heroImage from './assets/hero.png'
import foto1 from './assets/foto1.jpeg'
import foto2 from './assets/foto2.jpeg'
import foto3 from './assets/foto3.jpeg'
import foto4 from './assets/foto4.jpeg'
import './App.css'
const targetDate = new Date('2026-06-01T00:00:00')
const musicSrc = '/music.mp3'
const musicStartTime = 145

const extraPhotos = [
  {
    title: 'Manis banget',
    caption: 'Satu momen kecil yang rasanya tetap hangat kalau diingat lagi.',
    position: 'object-center',
    src: foto1,
  },
  {
    title: 'Peluk lembut',
    caption: 'Foto yang terasa tenang, seperti jeda yang paling kamu butuhkan.',
    position: 'object-top',
    src: foto2,
  },
  {
    title: 'Cahaya favorit',
    caption: 'Nuansa yang paling pas buat hari spesial kamu.',
    position: 'object-[50%_35%]',
    src: foto3,
  },
  {
    title: 'Memori manis',
    caption: 'Simpan yang ini, biar bisa dibuka lagi kapan saja.',
    position: 'object-[50%_15%]',
    src: foto4,
  },
]


function App() {
  const [countdown, setCountdown] = useState('')
  // gallery removed; activePhoto state not needed
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  
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
            splashNumber={3}
            eventCountdown={countdown}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={toggleMusic}
            onCountdownFinish={() => setShowSplash(false)}
          />
        ) : null}
      </AnimatePresence>

      <Hero
        playNow={!showSplash}
        forceMute={forceMuteVideo}
        onVideoStart={handleVideoStart}
        onVideoEnd={handleVideoEnd}
        onGiftOpen={handleGiftOpen}
        onBurstComplete={handleBurstComplete}
      />

      <AnimatePresence>
        {showEqualizer ? (
          <motion.section
            className="mx-auto w-full max-w-6xl px-2 py-3 sm:min-h-[190vh] sm:px-6 sm:pb-16 sm:pt-8 lg:px-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="sticky top-3 mx-auto w-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(122,71,75,0.14)] backdrop-blur-xl sm:top-6 sm:rounded-4xl">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-0 bg-stone-950 sm:min-h-80">
                  <img
                    src={heroImage}
                    alt="Kenangan manis untuk Bela Amelia Nuralfiani"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-100/90">
                      Foto kenangan
                    </p>
                    <h2 className="mt-2 max-w-md font-serif text-[1.4rem] leading-tight text-white sm:mt-3 sm:text-4xl">
                      Happy Birthday, Bela Amelia Nuralfiani
                    </h2>
                  </div>
                </div>

                <div className="px-3 py-3 sm:px-8 sm:py-10">
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-400">
                        Equalizer visual
                      </p>
                      <h3 className="mt-1.5 font-serif text-lg leading-tight text-stone-900 sm:mt-2 sm:text-3xl">
                        Sayang..., Semoga hari ini jadi awal yang paling manis untuk tahun-tahun ke depan.
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {isMusicPlaying ? 'Music Off' : 'Music On'}
                    </button>
                  </div>

                  <div className="mt-4 flex h-20 items-end justify-center gap-1.5 sm:mt-8 sm:h-40 sm:gap-3" aria-hidden="true">
                    {[18, 54, 28, 72, 36, 84, 48, 66, 24, 90, 42, 78].map((barHeight, index) => (
                      <motion.span
                        key={`${barHeight}-${index}`}
                        className="block w-2 rounded-full bg-linear-to-t from-rose-400 via-fuchsia-400 to-amber-200 shadow-[0_0_18px_rgba(236,72,153,0.35)] sm:w-4"
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

            <div className="photo-grid mt-6 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
              {extraPhotos.map((photo, index) => (
                <motion.figure
                  key={photo.title}
                  className="polaroid-card"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                >
                  <div className={`polaroid-stack ${index % 2 === 0 ? 'polaroid-tilt-left' : 'polaroid-tilt-right'}`}>
                    <div className="polaroid-tape polaroid-tape-left" aria-hidden="true" />
                    <div className="polaroid-tape polaroid-tape-right" aria-hidden="true" />

                    <div className="polaroid-photo-wrap">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className={`polaroid-photo ${photo.position}`}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
                    </div>

                    <figcaption className="polaroid-caption">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-rose-400/90">
                        Foto tambahan
                      </p>
                      <h4 className="mt-3 font-serif text-2xl text-stone-900">
                        {photo.title}
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-stone-600">
                        {photo.caption}
                      </p>
                    </figcaption>
                  </div>
                </motion.figure>
              ))}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
      {/* Gallery removed */}

      {/* lightbox removed */}

      <audio ref={audioRef} src={musicSrc} preload="metadata" />

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
