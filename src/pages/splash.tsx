import { motion } from 'framer-motion'
import './splash.css'

const splashLetters = 'HAPPYBIRTHDAYBELA'.split('')

const splashColumns = Array.from({ length: 22 }, (_, index) => splashLetters[index % splashLetters.length])

type SplashProps = {
  splashNumber: number
  eventCountdown: string
  isMusicPlaying: boolean
  toggleMusic: () => void
}

function Splash({ splashNumber, eventCountdown, isMusicPlaying, toggleMusic }: SplashProps) {
  const isGreeting = splashNumber === 0

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#040404] text-fuchsia-400"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-label="Splash screen"
      role="presentation"
    >
      <div className="splash-rain" aria-hidden="true">
        {splashColumns.map((word, index) => (
          <motion.div
            key={`${word}-${index}`}
            className="splash-column"
            style={{
              left: `${index * 4.8}%`,
              animationDuration: `${8 + (index % 5) * 1.2}s`,
              animationDelay: `${index * -0.55}s`,
            }}
            animate={{ opacity: [0.22, 0.95, 0.38] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.08 }}
          >
              {Array.from({ length: 18 }).map((_, row) => (
                <span key={`${word}-${row}`} className="splash-word">
                  {word}
                </span>
              ))}
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,105,180,0.18),_transparent_28%),radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_22%)]" aria-hidden="true" />

      <motion.div
        className="relative flex min-h-screen items-center justify-center px-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
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

        <div className="text-center">
          {isGreeting ? (
            <motion.div
              key="greeting"
              className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_0_60px_rgba(236,72,153,0.18)] backdrop-blur-xl sm:px-10 sm:py-14"
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className="text-xs uppercase tracking-[0.6em] text-fuchsia-200/80 sm:text-sm">Happy Birthday</p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-fuchsia-100 sm:text-6xl">Happy Birthday, Bela Amelia Nuralfiani</h1>
              <p className="mt-4 text-sm text-fuchsia-100/70 sm:text-base">Semoga hari ini jadi awal yang paling manis.</p>
              <p className="mt-4 text-sm text-fuchsia-200/70 sm:text-base">{eventCountdown}</p>
            </motion.div>
          ) : (
            <motion.div
              key={splashNumber}
              className="mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-fuchsia-500/10 text-[9rem] font-black leading-none text-fuchsia-300 drop-shadow-[0_0_28px_rgba(236,72,153,0.4)] sm:h-96 sm:w-96 sm:text-[13rem]"
              initial={{ scale: 0.84, opacity: 0, y: 16 }}
              animate={{ scale: [0.94, 1.04, 1], opacity: 1, y: 0, rotate: [-1, 1.5, 0] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              {splashNumber}
            </motion.div>
          )}

          {!isGreeting ? (
            <>
              <motion.h1
                className="mt-8 font-serif text-4xl font-semibold tracking-tight text-fuchsia-100 sm:text-6xl"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                Happy Birthday
              </motion.h1>

              <motion.p
                className="mt-3 text-sm uppercase tracking-[0.5em] text-fuchsia-200/80 sm:text-base"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.22 }}
              >
                Made with love for Bela
              </motion.p>
            </>
          ) : null}

          <motion.p className="mt-6 text-sm text-fuchsia-100/70 sm:text-base" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.32 }}>
            {isGreeting ? 'Welcome to her special day.' : eventCountdown && eventCountdown.length > 0 ? eventCountdown : 'Almost there...'}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Splash