import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import ridoPhoto from '../../assets/rido.jpg'

const MotionArticle = motion.article
const MotionAside = motion.aside
const MotionDiv = motion.div
const MotionH1 = motion.h1
const MotionP = motion.p
const MotionSection = motion.section
const MotionImg = motion.img
const MotionButton = motion.button

function LandingPage() {
  const prefersReducedMotion = useReducedMotion()
  const [isImageOpen, setIsImageOpen] = useState(false)

  useEffect(() => {
    if (!isImageOpen) return undefined

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsImageOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isImageOpen])

  const containerVariants = {
    hidden: {},
    visible: prefersReducedMotion
      ? {}
      : {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.08,
          },
        },
  }

  const fadeUpVariants = {
    hidden: {
      opacity: 0,
      y: 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 18,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <MotionSection
      className="landing landing-hero"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={containerVariants}
    >
        <div className="landing-grid">
          <MotionDiv className="landing-copy" variants={containerVariants}>
            <MotionP className="kicker" variants={fadeUpVariants}>
              Open museum of my poems
            </MotionP>
            <MotionH1 variants={fadeUpVariants}>Hey, I'm Rido Nanu.</MotionH1>
            <MotionArticle
              className="landing-card landing-card-hero landing-photo-card landing-photo-inline landing-photo-trigger"
              variants={cardVariants}
              onClick={() => setIsImageOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setIsImageOpen(true)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Open portrait image"
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              <MotionImg
                className="landing-portrait"
                src={ridoPhoto}
                alt="Portrait of Rido Nanu"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 1.01 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="landing-photo-caption">
                <p className="landing-card-label">Meet the poet</p>
                <p className="landing-card-quote">Rido Nanu</p>
              </div>
            </MotionArticle>
            <MotionP className="landing-intro" variants={fadeUpVariants}>
              For over five years, I've been writing-not always to be understood,
              but to make sense of things I couldn't hold onto.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              Poetry, for me, has always been a place where I can open my mind without restraint-
              a space where thoughts don't have to be organized, where feelings don't need to be explained.
              With every poem I write, I feel like I've grown a little-
              not just as a writer, but as a person trying to understand himself.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              This website is a collection of those moments.
              Some are unfinished feelings, some are questions, and some are just... echoes.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              I've always been drawn to perspective-
              how the same words can mean something entirely different to someone else.
              What you feel when you read these poems matters to me just as much as what I felt while writing them.
              It pushes me to see things differently, to try new ideas, to grow beyond my own thoughts.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              Over time, I've also written for others-turning their experiences into words.
              But I began to notice something: once those words are read, they often lose their weight,
              becoming just another paragraph on a page. It made me realize that art doesn't really belong
              to the moment it was written for, or even to the person it was written for-it belongs to
              whoever feels something in it.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              So this is not just a collection of what I've written,
              but a reflection of how my mind has changed over time.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              If you find yourself in any of these lines,
              then maybe they were meant to be shared.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              And if you leave behind your thoughts,
              they might help me see my own words in a different light.
            </MotionP>

            <MotionDiv className="landing-actions" variants={fadeUpVariants}>
              <MotionDiv
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              >
                <Link className="primary-link" to="/poems">
                  Enter the collection
                </Link>
              </MotionDiv>
            </MotionDiv>
          </MotionDiv>

          <MotionAside
            className="landing-aside"
            aria-label="Featured notes"
            variants={containerVariants}
          >
            <MotionArticle
              className="landing-card landing-card-hero landing-photo-card landing-photo-desktop landing-photo-trigger"
              variants={cardVariants}
              onClick={() => setIsImageOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setIsImageOpen(true)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Open portrait image"
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              <MotionImg
                className="landing-portrait"
                src={ridoPhoto}
                alt="Portrait of Rido Nanu"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 1.01 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="landing-photo-caption">
                <p className="landing-card-label">Meet the poet</p>
                <p className="landing-card-quote">Rido Nanu</p>
                <p>
                  Writing down the moments that were too alive to leave unnamed.
                </p>
              </div>
            </MotionArticle>

            <div className="landing-stack">
              <MotionArticle
                className="landing-card"
                variants={cardVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <p className="landing-card-label">Permanent collection</p>
                <p>
                  The poems are arranged as an archive visitors can return to, each
                  visit revealing a different line, silence, or frame.
                </p>
              </MotionArticle>
              <MotionArticle
                className="landing-card"
                variants={cardVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <p className="landing-card-label">Visitor notes</p>
                <p>
                  Your thoughts are part of the exhibit. Leave them behind if a poem
                  meets you where you are.
                </p>
              </MotionArticle>
            </div>
          </MotionAside>
        </div>

        <div className="landing-contact">
          <MotionDiv variants={fadeUpVariants} className="contact-section">
            <p className="contact-heading">Connect with me</p>
            <div className="contact-links">
              <a 
                href="https://www.instagram.com/the_tiles_of_imperfections?igsh=MTRtamxibWlwNGFscw%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="mailto:ridonanu5105@gmail.com"
                className="contact-link"
                aria-label="Email"
              >
                <MdEmail size={24} />
              </a>
            </div>
          </MotionDiv>
        </div>

        <AnimatePresence>
          {isImageOpen ? (
            <motion.div
              className="landing-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="Portrait image preview"
              onClick={() => setIsImageOpen(false)}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <MotionButton
                type="button"
                className="landing-lightbox-close"
                onClick={() => setIsImageOpen(false)}
                aria-label="Close image preview"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Close
              </MotionButton>
              <MotionImg
                className="landing-lightbox-image"
                src={ridoPhoto}
                alt="Portrait of Rido Nanu"
                onClick={(event) => event.stopPropagation()}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: 14 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
    </MotionSection>
  )
}

export default LandingPage
