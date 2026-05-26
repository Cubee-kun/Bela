import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  id?: string
}

function Reveal({ children, className = '', id }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      id={id}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.72, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  )
}

export default Reveal