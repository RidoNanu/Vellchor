import Navbar from './Navbar'
import Container from './Container'

function PageWrapper({ children, showNavbar = true }) {
  return (
    <div className="page-shell">
      {showNavbar ? <Navbar /> : null}
      <Container>
        <main className="page-content">{children}</main>
      </Container>
    </div>
  )
}

export default PageWrapper
