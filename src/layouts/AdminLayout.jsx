import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const MotionLink = motion.create(Link)
  const MotionNavLink = motion.create(NavLink)
  const MotionButton = motion.button
  const MotionMain = motion.main

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <MotionLink
          to="/"
          className="brand"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Vellichor
        </MotionLink>
        <nav aria-label="Admin navigation" className="nav-links">
          <MotionNavLink
            to="/admin/dashboard"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Dashboard
          </MotionNavLink>
          <MotionNavLink
            to="/admin/new"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            New Poem
          </MotionNavLink>
          <MotionButton
            type="button"
            className="ghost-button"
            onClick={handleSignOut}
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Sign out
          </MotionButton>
        </nav>
      </header>
      <MotionMain
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </MotionMain>
    </div>
  )
}

export default AdminLayout