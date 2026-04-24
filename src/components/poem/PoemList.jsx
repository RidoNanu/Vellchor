import { motion, useReducedMotion } from 'framer-motion'
import PoemCard from './PoemCard'

const MotionSection = motion.section

function PoemList({ poems, emptyMessage }) {
  const prefersReducedMotion = useReducedMotion()

  const listVariants = {
    hidden: {},
    visible: prefersReducedMotion
      ? {}
      : {
          transition: {
            staggerChildren: 0.08,
          },
        },
  }

  if (!poems.length) {
    return (
      <p className="status-text">
        {emptyMessage || (
          <>
            No poems published yet. Set <strong>published</strong> to <strong>true</strong> for a
            poem to appear here.
          </>
        )}
      </p>
    )
  }

  return (
    <MotionSection
      className="poem-list"
      aria-label="Poem list"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={listVariants}
    >
      {poems.map((poem) => (
        <PoemCard key={poem.id} poem={poem} />
      ))}
    </MotionSection>
  )
}

export default PoemList
