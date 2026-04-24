import React from 'react'

function ErrorFallback({ error, resetError }) {
  const errorMessage = error?.message || 'An unexpected error occurred.'

  return (
    <main className="app-error-boundary" role="alert">
      <section className="app-error-boundary-panel">
        <p className="admin-eyebrow">Application error</p>
        <h1>Something went wrong</h1>
        <p className="status-text">
          The app hit an unexpected error. You can retry the screen, reload the app, or return home.
        </p>

        <details>
          <summary>Error details</summary>
          <pre>{errorMessage}</pre>
        </details>

        <div className="app-error-boundary-actions">
          <button type="button" onClick={resetError}>
            Try again
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
          <a href="/">Go home</a>
        </div>
      </section>
    </main>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
