import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

type Mode = 'signin' | 'signup'

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

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError(null)
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: call useAuth hook → supabase.auth.signInWithOAuth({ provider: 'google' })
    } catch {
      setError(t('errors.auth_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (mode === 'signin') {
        // TODO: call useAuth hook → supabase.auth.signInWithPassword({ email, password })
      } else {
        // TODO: call useAuth hook → supabase.auth.signUp({ email, password })
      }
    } catch {
      setError(t('errors.auth_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">

        {/* Logo / heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">
            Meme Platform
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-modal border border-border bg-surface p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-btn border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <Button
            variant="secondary"
            fullWidth
            loading={isLoading}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <GoogleIcon />
            {t('auth.sign_in_google')}
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              variant="primary"
              fullWidth
              loading={isLoading}
              type="submit"
              className="mt-1"
            >
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="mt-5 text-center text-sm text-text-secondary">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-accent transition-colors hover:text-accent-hover"
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
                  className="font-medium text-accent transition-colors hover:text-accent-hover"
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
