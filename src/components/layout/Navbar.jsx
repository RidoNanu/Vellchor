import { motion, useReducedMotion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'

const MotionLink = motion.create(Link)
const MotionNavLink = motion.create(NavLink)

function Navbar() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <header className="navbar">
      <MotionLink
        to="/"
        className="brand"
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        Vellichor
      </MotionLink>
      <nav className="nav-links" aria-label="Main navigation">
        <MotionNavLink
          to="/"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Home
        </MotionNavLink>
        <MotionNavLink
          to="/poems"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Poems
        </MotionNavLink>
        <MotionNavLink
          to="/about"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          About
        </MotionNavLink>
      </nav>
    </header>
  )
}

export default Navbar
