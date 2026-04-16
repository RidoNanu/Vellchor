import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

function PoemCard({ poem }) {
  const prefersReducedMotion = useReducedMotion()
  const MotionLink = motion.create(Link)

  return (
    <MotionLink
      to={`/poems/${poem.slug}`}
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
