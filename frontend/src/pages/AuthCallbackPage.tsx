import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/constants'
import { getSession } from '../lib/supabaseClient'

function Spinner() {
  return (
    <div
      className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
      aria-hidden="true"
    />
  )
}

function hasAuthError(): boolean {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return searchParams.has('error') || hashParams.has('error')
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    async function finishSignIn() {
      if (hasAuthError()) {
        navigate(`${ROUTES.LOGIN}?error=auth_failed`, { replace: true })
        return
      }

      const session = await getSession()

      if (!isMounted) {
        return
      }

      if (session) {
        navigate(ROUTES.FEED, { replace: true })
      }
    }

    void finishSignIn()

    const fallback = window.setTimeout(() => {
      if (isMounted) {
        navigate(ROUTES.LOGIN, { replace: true })
      }
    }, 3000)

    return () => {
      isMounted = false
      window.clearTimeout(fallback)
    }
  }, [navigate])

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm text-text-secondary">Signing you in...</p>
      </div>
    </main>
  )
}
