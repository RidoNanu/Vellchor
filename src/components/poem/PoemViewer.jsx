import { motion, useReducedMotion } from 'framer-motion'
import { formatDate } from '../../utils/text'

function PoemViewer({ poem }) {
  const prefersReducedMotion = useReducedMotion()

  if (!poem) return null

  return (
    <motion.article
      className="poem-viewer"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>{poem.title}</h1>
        <p className="poem-meta">{formatDate(poem.created_at)}</p>
      </motion.header>
      <motion.pre
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.14 }}
      >
        {poem.content}
      </motion.pre>
    </motion.article>
  )
}

export default PoemViewer
