import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const MotionLink = motion.create(Link)

function PoemCard({ poem }) {
  const prefersReducedMotion = useReducedMotion()
  const poemSlug = (poem.slug || poem.id || '').toString().trim()

  return (
    <MotionLink
      to={`/poems/${encodeURIComponent(poemSlug)}`}
      state={{ poem }}
      className="poem-card"
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.22 }}
    >
      <h2>
        {poem.title}
      </h2>
      <p>{poem.preview}</p>
    </MotionLink>
  )
}

export default PoemCard
