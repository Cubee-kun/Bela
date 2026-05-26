import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Reveal from '../components/Reveal'

type IntroProps = {
  playNow: boolean
  forceMute?: boolean
  onVideoStart?: () => void
  onVideoEnd?: () => void
}

function Intro({ playNow, forceMute, onVideoStart, onVideoEnd }: IntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('videoMuted')
      return raw ? JSON.parse(raw) : false
    } catch {
      return false
    }
  })

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

    if (!playNow) {
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
  }, [playNow])

  // Track first play so we can notify parent once
  const playedOnceRef = useRef(false)

  const handlePlay = () => {
    if (!playedOnceRef.current) {
      playedOnceRef.current = true
      onVideoStart?.()
    }
  }

  const handleEnded = () => {
    onVideoEnd?.()
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

  return (
    <Reveal className="relative min-h-screen flex items-center justify-center bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full flex justify-center px-4">
        <div className="relative">
          <motion.video
            ref={videoRef}
            className="w-full h-[92vh] rounded-none shadow-2xl object-cover sm:w-[360px] sm:h-auto sm:rounded-2xl md:w-[640px] lg:w-[760px] xl:w-[880px]"
            src="/vidio.mp4"
            playsInline
            // play once; after ended we'll mute video and start background music
            controls
            muted={muted}
            onPlay={handlePlay}
            onEnded={handleEnded}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          <button
            type="button"
            onClick={toggleMuted}
            aria-pressed={!muted}
            className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:scale-105"
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>
    </Reveal>
  )
}

export default Intro