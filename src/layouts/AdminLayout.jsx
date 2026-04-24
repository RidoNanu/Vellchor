import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const MotionLink = motion.create(Link)
const MotionNavLink = motion.create(NavLink)
const MotionButton = motion.button
const MotionMain = motion.main

function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [signOutError, setSignOutError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSignOutError('')
    setSigningOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        navigate('/admin/login', {
          replace: true,
          state: { authNotice: error.message || 'Your local session has been cleared.' },
        })
        return
      }

      navigate('/admin/login', { replace: true, state: { notice: 'Signed out.' } })
    } catch (err) {
      setSignOutError(err?.message || 'An unexpected error occurred during sign out.')
      setSigningOut(false)
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <MotionLink
          to="/admin/dashboard"
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
            disabled={signingOut}
            whileHover={prefersReducedMotion || signingOut ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion || signingOut ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {signingOut ? 'Signing out...' : 'Sign out'}
          </MotionButton>
        </nav>
      </header>

      {signOutError && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderBottom: '1px solid #fcc' }}>
          <p className="error-text">{signOutError}</p>
        </div>
      )}

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
