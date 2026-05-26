import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/constants'
import {
  ensureProfile,
  getSession,
  onAuthStateChange,
  signInWithEmail as signInWithEmailClient,
  signInWithGoogle as signInWithGoogleClient,
  signOut as signOutClient,
  signUpWithEmail as signUpWithEmailClient,
} from '../lib/supabaseClient'
import { useAuthStore } from '../stores/authStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export function useAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const isSigningOutRef = useRef(false)
  const {
    user,
    profile,
    session,
    loading,
    error,
    setUser,
    setProfile,
    setSession,
    setLoading,
    setError,
    reset,
  } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    async function hydrateSession() {
      setLoading(true)
      const currentSession = await getSession()

      if (!isMounted) {
        return
      }

      if (currentSession) {
        const currentProfile = await ensureProfile(currentSession.user)

        if (!isMounted) {
          return
        }

        setUser(currentSession.user)
        setProfile(currentProfile)
        setSession(currentSession)
      }

      setLoading(false)
    }

    void hydrateSession()

    const unsubscribe = onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' && nextSession) {
        void ensureProfile(nextSession.user).then((nextProfile) => {
          if (!isMounted) {
            return
          }

          setUser(nextSession.user)
          setProfile(nextProfile)
          setSession(nextSession)
          setError(null)
          setLoading(false)
        })
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(nextSession)
        return
      }

      if (event === 'SIGNED_OUT') {
        reset()

        if (
          !isSigningOutRef.current &&
          location.pathname !== ROUTES.LOGIN &&
          location.pathname !== ROUTES.HOME
        ) {
          navigate(ROUTES.LOGIN, { replace: true })
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [
    location.pathname,
    navigate,
    reset,
    setError,
    setLoading,
    setProfile,
    setSession,
    setUser,
  ])

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogleClient()
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong, please try again'
      setError(message)
      setLoading(false)
    }
  }, [setError, setLoading])

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      setLoading(true)
      setError(null)

      const result = await signInWithEmailClient(email, password)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      navigate(ROUTES.FEED)
      setLoading(false)
    },
    [navigate, setError, setLoading],
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string, username: string): Promise<void> => {
      setLoading(true)
      setError(null)

      if (!EMAIL_PATTERN.test(email)) {
        setError('Enter a valid email address')
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters')
        setLoading(false)
        return
      }

      if (username.includes(' ') || !USERNAME_PATTERN.test(username)) {
        setError('Username can only use letters, numbers, and underscores')
        setLoading(false)
        return
      }

      const result = await signUpWithEmailClient(email, password, username)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      navigate(ROUTES.FEED)
      setLoading(false)
    },
    [navigate, setError, setLoading],
  )

  const signOut = useCallback(async (): Promise<void> => {
    isSigningOutRef.current = true
    setLoading(true)

    try {
      await signOutClient()
    } finally {
      reset()
      setLoading(false)
      isSigningOutRef.current = false
      navigate(ROUTES.HOME)
    }
  }, [navigate, reset, setLoading])

  return {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: Boolean(session),
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
