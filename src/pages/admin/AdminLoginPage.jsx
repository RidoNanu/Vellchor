import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Container from '../../components/layout/Container'

const MotionButton = motion.button
const MotionDiv = motion.div

function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading, signInWithPassword, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [hideRouteNotice, setHideRouteNotice] = useState(false)
  const [loading, setLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const notice = hideRouteNotice ? '' : location.state?.notice || ''
  const authNotice = hideRouteNotice ? '' : location.state?.authNotice || ''

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setHideRouteNotice(true)

    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    try {
      const { error: signInError } = await signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      setError('')
      const nextPath = location.state?.from?.pathname || '/admin/dashboard'
      navigate(nextPath, { replace: true })
    } catch (authError) {
      setError(authError?.message || 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  if (!authLoading && user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <Container>
      <main className="admin-login">
        <MotionDiv
          className="admin-login-card"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="admin-eyebrow">Private access</p>
          <h1>Admin Login</h1>
          <p className="admin-subtitle">
            Sign in to add, update, or organize the collection.
          </p>

          {notice ? (
            <p className="success-text" role="status">
              {notice}
            </p>
          ) : null}

          {authNotice ? (
            <p className="error-text" role="alert">
              {authNotice}
            </p>
          ) : null}

          {authError && !authNotice && (
            <p className="error-text" role="alert">
              Authentication error: {authError}. Please refresh and try again.
            </p>
          )}

          <form className="poem-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                required
                aria-describedby={error ? 'form-error' : undefined}
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  disabled={loading}
                  required
                  aria-describedby={error ? 'form-error' : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </label>
            {error && (
              <p className="error-text" id="form-error" role="alert">
                {error}
              </p>
            )}
            <MotionButton
              className="admin-login-submit"
              type="submit"
              disabled={loading || authLoading}
              whileHover={prefersReducedMotion || loading || authLoading ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion || loading || authLoading ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </MotionButton>
          </form>
        </MotionDiv>
      </main>
    </Container>
  )
}

export default AdminLoginPage
