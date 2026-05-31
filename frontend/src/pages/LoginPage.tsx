import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import {
  AUTH_REDIRECT_STORAGE_KEY,
  getSafeAuthRedirect,
} from '../lib/constants'
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../lib/authValidation'

type Mode = 'signin' | 'signup'

interface FormErrors {
  email?: string
  password?: string
  username?: string
}

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const {
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    loading,
    isAuthenticated,
  } = useAuth()

  const requestedMode: Mode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<Mode>(requestedMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const callbackError =
    searchParams.get('error') === 'auth_failed'
      ? 'Could not complete sign in. Please try again.'
      : null
  const redirectTo = getSafeAuthRedirect(searchParams.get('redirect'))

  useEffect(() => {
    setMode(requestedMode)
  }, [requestedMode])

  useEffect(() => {
    if (callbackError) {
      toast.error(callbackError, { id: 'auth-callback-error' })
    }
  }, [callbackError])

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setFormErrors({})
  }

  function validateSignUpForm(): boolean {
    const nextErrors: FormErrors = {}
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const usernameError = validateUsername(username)

    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError
    if (usernameError) nextErrors.username = usernameError

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateSignInForm(): boolean {
    const nextErrors: FormErrors = {}
    const emailError = validateEmail(email)

    if (emailError) nextErrors.email = emailError
    if (!password) nextErrors.password = 'Enter your password'

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleGoogleSignIn() {
    setFormErrors({})
    window.sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, redirectTo)
    await signInWithGoogle()
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === 'signin') {
      if (!validateSignInForm()) {
        return
      }

      await signInWithEmail(email.trim(), password, redirectTo)
      return
    }

    if (!validateSignUpForm()) {
      return
    }

    const accountCreated = await signUpWithEmail(
      email.trim(),
      password,
      username,
      redirectTo,
    )

    if (accountCreated) {
      setEmail('')
      setPassword('')
      setUsername('')
      setFormErrors({})
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/memeit-logo.png"
            alt="memeit"
            className="mx-auto h-28 w-auto object-contain"
          />
          <h1 className="mt-4 text-xl font-semibold text-text-primary">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-text-secondary">
            {mode === 'signin'
              ? 'Sign in to continue creating with memeit.'
              : 'Join memeit and start making memes in minutes.'}
          </p>
        </div>

        <div className="rounded-modal border border-border bg-surface p-8">
          <Button
            variant="secondary"
            fullWidth
            loading={loading}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <GoogleIcon />
            {t('auth.sign_in_google')}
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              error={formErrors.email}
            />

            <Input
              label={t('auth.password')}
              type="password"
              placeholder="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              error={formErrors.password}
            />

            {mode === 'signup' && (
              <Input
                label="Username"
                type="text"
                placeholder="meme_maker"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                error={formErrors.username}
              />
            )}

            <Button
              variant="primary"
              fullWidth
              loading={loading}
              type="submit"
              className="mt-1 border border-[#00e676] !bg-[#00c96b] font-semibold !text-[#052e1a] transition-all duration-[120ms] hover:!bg-[#00e676] focus-visible:!ring-[#00e676] active:!bg-[#00b85f]"
            >
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                  className="font-medium text-[#00c96b] transition-colors duration-[120ms] hover:text-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] disabled:opacity-50"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                  className="font-medium text-[#00c96b] transition-colors duration-[120ms] hover:text-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] disabled:opacity-50"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
