import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaHandsClapping, FaHeart } from 'react-icons/fa6'

type MemoryPage = {
  title: string
  caption: string
  position: string
  src: string
}

type BookFlipProps = {
  coverImage: string
  coverTitle: string
  coverSubtitle: string
  pages: MemoryPage[]
  isMusicPlaying: boolean
  toggleMusic: () => void
  onComplete?: () => void
}

function BookFlip({ coverImage, coverTitle, coverSubtitle, pages, isMusicPlaying, toggleMusic, onComplete }: BookFlipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [activePageIndex, setActivePageIndex] = useState(0)

  useEffect(() => {
    return () => {
      // no-op cleanup for future timers if needed
    }
  }, [])

  const closeBook = () => {
    if (!isOpen || isLeaving || isClosing) {
      return
    }

    setIsClosing(true)
    setIsOpen(false)

    window.setTimeout(() => {
      setIsLeaving(true)
      setIsClosing(false)
      onComplete?.()
    }, 1000)
  }

  const advancePage = () => {
    if (!isOpen || isLeaving) {
      return
    }

    if (activePageIndex < pages.length - 1) {
      setActivePageIndex((currentPageIndex) => currentPageIndex + 1)
      return
    }

    closeBook()
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black px-4 py-6 font-sans text-slate-800 transition-opacity duration-500 ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-[92vw] max-w-90 sm:max-w-100 h-[78vh] max-h-140 sm:h-[min(88vh,550px)]" style={{ perspective: '1500px' }}>
        <div
          className={`absolute inset-0 rounded-r-2xl bg-white p-6 shadow-2xl transition-opacity duration-500 ease-out origin-left z-10 ${isOpen || isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="relative flex h-full w-full flex-col overflow-hidden text-left">
            <button
              type="button"
              onClick={toggleMusic}
              className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg transition hover:bg-stone-800 sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs"
            >
              {isMusicPlaying ? 'Music Off' : 'Music On'}
            </button>

            <button
              type="button"
              onClick={advancePage}
              className="relative flex h-full w-full flex-col overflow-hidden text-left"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePageIndex}
                  className="flex h-full w-full flex-col"
                  initial={{ opacity: 0, x: 28, rotateY: -8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -24, rotateY: 8 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative h-[52%] min-h-48 bg-stone-950">
                    <img
                      src={pages[activePageIndex].src}
                      alt={pages[activePageIndex].title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-100/90">
                        {`Lembar ${String(activePageIndex + 1).padStart(2, '0')}`}
                      </p>
                      <h2 className="mt-2 max-w-md font-serif text-[1.4rem] leading-tight text-white sm:mt-3 sm:text-4xl">
                        {pages[activePageIndex].title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between px-3 py-4 sm:px-8 sm:py-12">
                    <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-400">
                          Quotes halaman
                        </p>
                        <h3 className="mt-3 font-serif text-lg leading-relaxed text-stone-900 sm:mt-4 sm:text-3xl sm:leading-relaxed">
                          {pages[activePageIndex].caption}
                        </h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

        </div>

        <div
          onClick={() => !isOpen && setIsOpen(true)}
          className={`absolute inset-0 z-20 cursor-pointer rounded-2xl shadow-2xl transition-transform duration-1000 ease-in-out ${isClosing ? 'pointer-events-none' : ''}`}
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-slate-100 bg-white p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-2xl bg-linear-to-r from-slate-200 to-transparent" />

            <div className="relative flex aspect-3/4 w-full max-w-70 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_55%)]" />
              <p className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.45em] text-rose-400/90">
                {coverTitle}
              </p>
              <div className="flex flex-col items-center animate-bounce duration-1000">
                <FaHeart className="text-5xl text-rose-500 drop-shadow-md" aria-hidden="true" />
              </div>

              <p className="mt-4 max-w-56 px-4 text-center font-serif text-sm leading-6 text-slate-600">
                {coverSubtitle}
              </p>

              <div className="mt-6 flex justify-center gap-1 opacity-80 scale-125">
                <FaHandsClapping className="text-slate-400" aria-hidden="true" />
              </div>

              <img
                src={coverImage}
                alt="Cover buku"
                className="absolute inset-x-6 bottom-12 top-20 rounded-lg object-cover opacity-15 sm:bottom-16 sm:top-28"
              />

              <p className="absolute bottom-3 text-[10px] uppercase tracking-widest text-slate-400 font-mono animate-pulse">
                Klik untuk membuka
              </p>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between border-r border-slate-200 shadow-inner"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
          </div>
        </div>
      </div>

      <p className="absolute bottom-8 text-slate-400 font-mono text-xs tracking-widest">
        BOOK_STATUS: {isOpen ? 'OPENED' : 'CLOSED'}
      </p>
    </div>
  )
}

export default BookFlip