import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Container from '../components/layout/Container'

function PublicLayout() {
  return (
    <div className="page-shell">
      <Navbar />
      <Container>
        <main className="page-content">
          <Outlet />
        </main>
      </Container>
    </div>
  )
}

export default PublicLayout