import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '../pages/public/LandingPage'
import PoemsPage from '../pages/public/PoemsPage'
import PoemDetailPage from '../pages/public/PoemDetailPage'
import AboutPage from '../pages/public/AboutPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminNewPoemPage from '../pages/admin/AdminNewPoemPage'
import AdminEditPoemPage from '../pages/admin/AdminEditPoemPage'
import { useAuth } from '../hooks/useAuth'

function AdminEntryRoute() {
  const { user, loading, error, refreshSession } = useAuth()

  if (error) {
    return (
      <div className="auth-state-container">
        <p className="error-text">Authentication error: {error}</p>
        <button type="button" onClick={() => refreshSession({ force: true })}>
          Check again
        </button>
        <a href="/admin/login">Try logging in again</a>
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
    return <Navigate to="/admin/login" replace />
  }

  return <Navigate to="/admin/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/poems/:slug" element={<PoemDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      <Route path="/admin" element={<AdminEntryRoute />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/new" element={<AdminNewPoemPage />} />
          <Route path="/admin/edit/:id" element={<AdminEditPoemPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
