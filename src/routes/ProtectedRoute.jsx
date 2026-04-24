import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { user, loading, error, refreshSession } = useAuth()
  const location = useLocation()

  if (error) {
    return (
      <div className="auth-state-container">
        <p className="error-text">Authentication error: {error}</p>
        <button type="button" onClick={() => refreshSession({ force: true })}>
          Check again
        </button>
        <a href="/admin/login">Return to login</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="auth-state-container">
        <p className="status-text">Checking session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
