import { RETRY, TIMEOUTS } from '../config/constants'
import { AppError, isBrowserOffline, isRetryableRequestError, normalizeRequestError } from './appErrors'

export function wait(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms)
  })
}

function getTimeoutError(message) {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(message, 'AbortError')
  }

  const error = new Error(message)
  error.name = 'AbortError'
  return error
}

function getRetryDelay(attempt) {
  return Math.min(
    TIMEOUTS.REQUEST_RETRY_BASE_DELAY_MS * 2 ** attempt,
    TIMEOUTS.REQUEST_RETRY_MAX_DELAY_MS,
  )
}

async function runWithTimeout(operation, timeoutMs, timeoutMessage) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  let timeoutId = null

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      if (controller) controller.abort()
      reject(getTimeoutError(timeoutMessage))
    }, timeoutMs)
  })

  try {
    return await Promise.race([operation(controller?.signal), timeoutPromise])
  } finally {
    if (timeoutId) globalThis.clearTimeout(timeoutId)
  }
}

export async function runWithRetry(operation, options = {}) {
  const {
    timeoutMs = TIMEOUTS.REQUEST_MS,
    totalTimeoutMs = null,
    retries = RETRY.REQUEST_RETRIES,
    timeoutMessage = 'Request timed out.',
    fallbackMessage = 'Request failed. Please try again.',
  } = options

  const startedAt = Date.now()
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (isBrowserOffline()) {
      throw normalizeRequestError(
        new AppError('Browser is offline.'),
        fallbackMessage,
      )
    }

    const elapsed = Date.now() - startedAt
    const remaining = totalTimeoutMs ? totalTimeoutMs - elapsed : timeoutMs

    if (remaining <= 0) {
      throw normalizeRequestError(getTimeoutError(timeoutMessage), fallbackMessage)
    }

    try {
      return await runWithTimeout(
        (signal) => operation(signal, attempt),
        Math.min(timeoutMs, remaining),
        timeoutMessage,
      )
    } catch (error) {
      lastError = error

      if (attempt >= retries || !isRetryableRequestError(error)) {
        throw normalizeRequestError(error, fallbackMessage)
      }

      const delay = Math.min(getRetryDelay(attempt), Math.max(totalTimeoutMs ? remaining : timeoutMs, 0))
      if (delay > 0) {
        await wait(delay)
      }
    }
  }

  throw normalizeRequestError(lastError, fallbackMessage)
}
