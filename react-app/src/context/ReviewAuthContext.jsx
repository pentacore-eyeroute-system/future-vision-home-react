import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import { getApiErrorMessage, reviewApi } from '../api/reviewApi'
import { reviewAuthConfig } from '../config/reviewAuthConfig'
import { disableGoogleAutoSelect, initializeGoogleIdentity } from '../lib/googleIdentity'
import { ReviewAuthContext } from './reviewAuth'

const SESSION_STORAGE_KEY = 'fvh.review-auth-session'

const loadStoredSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const storeSession = (session) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function ReviewAuthProvider({ children }) {
  const [session, setSession] = useState(loadStoredSession)
  const [googleReady, setGoogleReady] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isRestoringSession, setIsRestoringSession] = useState(false)
  const [error, setError] = useState('')
  const restoreAttemptedRef = useRef(false)

  // Auto-dismiss auth error after 5 seconds
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => {
      setError('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [error])

  const handleCredentialResponse = useEffectEvent(async (response) => {
    if (!response?.credential) {
      setError('Google did not return an ID token.')
      return
    }

    setIsAuthenticating(true)
    setError('')

    try {
      const nextSession = await reviewApi.authenticateWithGoogle(response.credential)
      storeSession(nextSession)
      setSession(nextSession)
    } catch (authError) {
      clearStoredSession()
      setSession(null)
      setError(getApiErrorMessage(authError, 'Unable to finish Google sign-in.'))
    } finally {
      setIsAuthenticating(false)
    }
  })

  useEffect(() => {
    let isActive = true

    if (!reviewAuthConfig.hasGoogleClientId) {
      return undefined
    }

    initializeGoogleIdentity({
      clientId: reviewAuthConfig.googleClientId,
      onCredential: handleCredentialResponse,
    })
      .then(() => {
        if (!isActive) {
          return
        }

        setGoogleReady(true)
      })
      .catch((loadError) => {
        if (!isActive) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load Google Sign-In.')
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (restoreAttemptedRef.current || session || !reviewApi.canRestoreSession()) {
      return
    }

    restoreAttemptedRef.current = true

    let isActive = true
    setIsRestoringSession(true)

    reviewApi
      .getCurrentSession()
      .then((nextSession) => {
        if (!isActive || !nextSession) {
          return
        }

        storeSession(nextSession)
        setSession(nextSession)
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) {
          setIsRestoringSession(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [session])

  const signOut = async () => {
    try {
      // await reviewApi.signOut(session)
    } catch {
      // Ignore sign-out endpoint failures so local logout still succeeds.
    } finally {
      disableGoogleAutoSelect()
      clearStoredSession()
      setSession(null)
      setError('')
    }
  }

  const value = {
    error,
    googleReady,
    hasGoogleClientId: reviewAuthConfig.hasGoogleClientId,
    isAuthenticated: Boolean(session?.user),
    isAuthenticating,
    isRestoringSession,
    session,
    signOut,
    user: session?.user ?? null,
  }

  return <ReviewAuthContext.Provider value={value}>{children}</ReviewAuthContext.Provider>
}
