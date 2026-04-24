/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { RETRY, TIMEOUTS } from '../config/constants'
import { getErrorMessage, normalizeRequestError } from '../utils/appErrors'
import { runWithRetry, wait } from '../utils/request'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

let sharedBootstrapPromise = null
let sharedAuthSubscription = null
const authObservers = new Set()

function resetBootstrapSession() {
  sharedBootstrapPromise = null
}

function bootstrapSessionOnce({ force = false } = {}) {
  if (force) {
    resetBootstrapSession()
  }

  if (!sharedBootstrapPromise) {
    sharedBootstrapPromise = runWithRetry(
      async () => {
        const result = await supabase.auth.getSession()

        if (result.error) {
          throw result.error
        }

        return result.data.session ?? null
      },
      {
        timeoutMs: TIMEOUTS.AUTH_REQUEST_MS,
        totalTimeoutMs: TIMEOUTS.AUTH_BOOTSTRAP_MS,
        retries: RETRY.AUTH_RETRIES,
        timeoutMessage: 'Session check timed out.',
        fallbackMessage: 'Could not check your session. Please try again.',
      },
    ).catch((error) => {
      resetBootstrapSession()
      throw error
    })
  }

  return sharedBootstrapPromise
}

async function runAuthAction(action, fallbackMessage) {
  const result = await runWithRetry(
    async () => {
      const response = await action()

      if (response.error) {
        throw response.error
      }

      return response
    },
    {
      timeoutMs: TIMEOUTS.AUTH_ACTION_MS,
      retries: RETRY.AUTH_RETRIES,
      timeoutMessage: fallbackMessage,
      fallbackMessage,
    },
  )

  return { ...result, error: null }
}

function ensureSharedAuthListener() {
  if (sharedAuthSubscription) return

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    authObservers.forEach((observer) => {
      observer(nextSession)
    })
  })

  sharedAuthSubscription = subscription
}

function subscribeToSharedAuth(callback) {
  authObservers.add(callback)
  ensureSharedAuthListener()

  return () => {
    authObservers.delete(callback)

    if (authObservers.size === 0 && sharedAuthSubscription) {
      sharedAuthSubscription.unsubscribe()
      sharedAuthSubscription = null
    }
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const mountedRef = useRef(false)
  const authRunIdRef = useRef(0)

  const refreshSession = useCallback(async ({ force = true, showLoading = true } = {}) => {
    const runId = authRunIdRef.current + 1
    authRunIdRef.current = runId

    if (showLoading && mountedRef.current) {
      setLoading(true)
    }

    if (mountedRef.current) {
      setAuthError('')
    }

    try {
      const nextSession = await bootstrapSessionOnce({ force })

      if (!mountedRef.current || authRunIdRef.current !== runId) {
        return { data: { session: nextSession }, error: null }
      }

      setSession(nextSession)
      setAuthError('')
      return { data: { session: nextSession }, error: null }
    } catch (error) {
      const normalizedError = normalizeRequestError(
        error,
        'Could not check your session. Please try again.',
      )

      if (mountedRef.current && authRunIdRef.current === runId) {
        setSession(null)
        setAuthError(normalizedError.message)
      }

      return { data: null, error: normalizedError }
    } finally {
      if (mountedRef.current && authRunIdRef.current === runId) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    let receivedAuthEvent = false

    const unsubscribe = subscribeToSharedAuth((nextSession) => {
      if (!mountedRef.current) return

      receivedAuthEvent = true
      setSession(nextSession)
      setAuthError('')
      setLoading(false)
    })

    refreshSession({ force: false, showLoading: true }).then((result) => {
      if (!mountedRef.current || receivedAuthEvent || result.error) return
      setSession(result.data.session)
    })

    async function handleOnline() {
      await wait(TIMEOUTS.ONLINE_RECOVERY_DELAY_MS)
      if (mountedRef.current) {
        refreshSession({ force: true, showLoading: false })
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      unsubscribe()
    }
  }, [refreshSession])

  const signInWithPassword = useCallback(async ({ email, password }) => {
    setAuthError('')

    try {
      const result = await runAuthAction(
        () => supabase.auth.signInWithPassword({ email, password }),
        'Sign-in failed. Check your connection and try again.',
      )

      setSession(result.data.session ?? null)
      setAuthError('')
      return result
    } catch (error) {
      const normalizedError = normalizeRequestError(
        error,
        'Sign-in failed. Check your credentials and try again.',
      )

      setAuthError(normalizedError.message)
      return { data: null, error: normalizedError }
    }
  }, [])

  const signOut = useCallback(async () => {
    setAuthError('')
    let signOutError = null

    try {
      await runAuthAction(
        () => supabase.auth.signOut(),
        'Could not fully sign out. Your local session has been cleared.',
      )
    } catch (error) {
      signOutError = normalizeRequestError(
        error,
        'Could not fully sign out. Your local session has been cleared.',
      )
    } finally {
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch (localError) {
        if (!signOutError) {
          signOutError = normalizeRequestError(
            localError,
            'Could not clear the local session. Refresh the page before continuing.',
          )
        }
      }

      resetBootstrapSession()
      setSession(null)
      setLoading(false)

      if (signOutError) {
        setAuthError(signOutError.message)
      }
    }

    return { data: null, error: signOutError }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error: authError,
      refreshSession,
      signInWithPassword,
      signOut,
      getErrorMessage,
    }),
    [authError, loading, refreshSession, session, signInWithPassword, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
