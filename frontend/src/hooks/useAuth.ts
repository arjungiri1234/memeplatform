import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getLoginRoute,
  getSafeAuthRedirect,
  ROUTES,
} from '../lib/constants'
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../lib/authValidation'
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

// Ensures hydrateSession() runs once per page load, not once per useAuth() call.
// Every component that calls useAuth() gets its own effect instance, and without
// this flag each one would call setLoading(true) independently — causing the
// spinner to re-appear whenever new components (EditorPage hooks) mount.
let hydrationRan = false

export function useAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const isSigningOutRef = useRef(false)
  const locationPathnameRef = useRef(location.pathname)

  useEffect(() => {
    locationPathnameRef.current = location.pathname
  })

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
    async function hydrateSession() {
      if (hydrationRan) return
      hydrationRan = true

      setLoading(true)
      const currentSession = await getSession()

      // Update global store unconditionally — Zustand state is safe to set
      // even after unmount. Must NOT gate setLoading(false) behind isMounted:
      // StrictMode unmounts before getSession() resolves, which would leave
      // loading stuck at true forever (hydrationRan blocks any retry).
      if (currentSession) {
        setUser(currentSession.user)
        setSession(currentSession)
      }
      setLoading(false)

      // ensureProfile and setProfile are safe to call after unmount — they update
      // global Zustand state, not component-local state. isMounted guard here would
      // prevent the profile from ever loading in StrictMode (double-invoke unmounts
      // before the async call completes, and hydrationRan blocks any retry).
      if (currentSession) {
        const currentProfile = await ensureProfile(currentSession.user)
        setProfile(currentProfile)
      }
    }

    void hydrateSession()

    const unsubscribe = onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' && nextSession) {
        void ensureProfile(nextSession.user).then((nextProfile) => {
          // All setters update global Zustand store — safe to call after unmount
          void getSession().then((currentSession) => {
            if (currentSession?.access_token !== nextSession.access_token) {
              return
            }

            setUser(nextSession.user)
            setProfile(nextProfile)
            setSession(nextSession)
            setError(null)
            setLoading(false)
          })
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
          locationPathnameRef.current !== ROUTES.LOGIN &&
          locationPathnameRef.current !== ROUTES.HOME
        ) {
          navigate(ROUTES.LOGIN, { replace: true })
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [
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
    async (
      email: string,
      password: string,
      redirectTo: string = ROUTES.FEED,
    ): Promise<void> => {
      setLoading(true)
      setError(null)

      const result = await signInWithEmailClient(email, password)

      if (result.error) {
        setError(result.error)
        toast.error(result.error, { id: 'signin-error' })
        setLoading(false)
        return
      }

      toast.success('Welcome back!', { id: 'signin' })
      navigate(getSafeAuthRedirect(redirectTo))
      setLoading(false)
    },
    [navigate, setError, setLoading],
  )

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      redirectTo: string = ROUTES.FEED,
    ): Promise<boolean> => {
      setLoading(true)
      setError(null)

      const emailError = validateEmail(email)
      const passwordError = validatePassword(password)
      const usernameError = validateUsername(username)

      if (emailError) {
        setError(emailError)
        setLoading(false)
        return false
      }

      if (passwordError) {
        setError(passwordError)
        setLoading(false)
        return false
      }

      if (usernameError) {
        setError(usernameError)
        setLoading(false)
        return false
      }

      const result = await signUpWithEmailClient(
        email.trim(),
        password,
        username,
      )

      if (result.error) {
        setError(result.error)
        toast.error(result.error, { id: 'signup-error' })
        setLoading(false)
        return false
      }

      await signOutClient()
      reset()
      toast.success('Account created. Sign in to continue.', {
        id: 'signup',
      })
      navigate(
        getLoginRoute({
          mode: 'signin',
          redirectTo: getSafeAuthRedirect(redirectTo),
        }),
        { replace: true },
      )
      setLoading(false)
      return true
    },
    [navigate, reset, setError, setLoading],
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
      toast.success('You\'ve been signed out.', { id: 'signout' })
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
