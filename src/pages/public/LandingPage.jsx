import { motion, useReducedMotion } from 'framer-motion'
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

function LandingPage() {
  const prefersReducedMotion = useReducedMotion()

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
              Open museum of poems
            </MotionP>
            <MotionH1 variants={fadeUpVariants}>Hey, I'm Rido Nanu.</MotionH1>
            <MotionP className="landing-intro" variants={fadeUpVariants}>
              For the last five years, I've been writing—
              not always to be understood, but to make sense of things I couldn't hold onto.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              Poetry, for me, has always been a place where I can open my mind without restraint—
              a space where thoughts don't have to be organized, where feelings don't need to be explained.
              With every poem I write, I feel like I've grown a little—
              not just as a writer, but as a person trying to understand himself.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              This website is a collection of those moments.
              Some are unfinished feelings, some are questions, and some are just… echoes.
            </MotionP>
            <MotionP variants={fadeUpVariants}>
              I've always been drawn to perspective—
              how the same words can mean something entirely different to someone else.
              What you feel when you read these poems matters to me just as much as what I felt while writing them.
              It pushes me to see things differently, to try new ideas, to grow beyond my own thoughts.
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
              className="landing-card landing-card-hero landing-photo-card"
              variants={cardVariants}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <img className="landing-portrait" src={ridoPhoto} alt="Portrait of Rido Nanu" />
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
    </MotionSection>
  )
}

export default LandingPage
