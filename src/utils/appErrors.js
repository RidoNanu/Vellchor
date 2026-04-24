export class AppError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'AppError'
    this.code = options.code
    this.status = options.status
    this.cause = options.cause
  }
}

export function getErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (!error) return fallbackMessage
  if (typeof error === 'string') return error
  if (typeof error.message === 'string' && error.message.trim()) return error.message
  return fallbackMessage
}

export function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function normalizeRequestError(error, fallbackMessage = 'Request failed. Please try again.') {
  if (error instanceof AppError) return error

  if (isBrowserOffline()) {
    return new AppError('You are offline. Reconnect and the app will try again automatically.', {
      cause: error,
    })
  }

  const message = getErrorMessage(error, fallbackMessage)
  const lowerMessage = message.toLowerCase()
  const code = error?.code
  const status = error?.status

  if (error?.name === 'AbortError' || lowerMessage.includes('timed out')) {
    return new AppError('The request timed out. Check your connection and try again.', {
      code,
      status,
      cause: error,
    })
  }

  if (code === '23505' || status === 409) {
    return new AppError('A poem with this slug already exists. Choose a unique slug.', {
      code,
      status,
      cause: error,
    })
  }

  if (status === 401) {
    return new AppError('Your session has expired. Sign in again to continue.', {
      code,
      status,
      cause: error,
    })
  }

  if (status === 403) {
    return new AppError('You do not have permission to perform this action.', {
      code,
      status,
      cause: error,
    })
  }

  if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('network')) {
    return new AppError('Network request failed. Check your connection and try again.', {
      code,
      status,
      cause: error,
    })
  }

  return new AppError(message, {
    code,
    status,
    cause: error,
  })
}

export function isRetryableRequestError(error) {
  if (!error || isBrowserOffline()) return false

  const status = error.status
  const code = error.code
  const message = getErrorMessage(error, '').toLowerCase()

  if (code === '23505' || status === 400 || status === 401 || status === 403 || status === 404 || status === 409) {
    return false
  }

  if (error.name === 'AbortError') return true
  if (status === 408 || status === 429) return true
  if (typeof status === 'number' && status >= 500) return true

  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('connection')
  )
}
