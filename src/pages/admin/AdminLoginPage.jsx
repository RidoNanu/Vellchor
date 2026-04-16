import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Container from '../../components/layout/Container'

function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading, signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const nextPath = location.state?.from?.pathname || '/admin/dashboard'
    navigate(nextPath, { replace: true })
  }

  if (!authLoading && user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <Container>
      <main className="admin-login">
        <motion.div
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
          <form className="poem-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
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
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <motion.button
              className="admin-login-submit"
              type="submit"
              disabled={loading}
              whileHover={prefersReducedMotion || loading ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion || loading ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </Container>
  )
}

export default AdminLoginPage
