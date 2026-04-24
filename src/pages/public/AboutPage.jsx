import { motion, useReducedMotion } from 'framer-motion'

const MotionSection = motion.section

function AboutPage() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <MotionSection
      className="about"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1>About</h1>
      <p>
        Vellichor is a poetry space by Rido Nanu, built to share moments,
        reflections, and quiet lines that stay with the reader.
      </p>
    </MotionSection>
  )
}

export default AboutPage
