import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AUTH_REDIRECT_STORAGE_KEY,
  getSafeAuthRedirect,
  ROUTES,
} from '../lib/constants'
import {
  exchangeAuthCodeForSession,
  getSession,
} from '../lib/supabaseClient'
import TopLoadingBar from '../components/TopLoadingBar'

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

      const authCode = new URLSearchParams(window.location.search).get('code')

      if (!authCode) {
        navigate(`${ROUTES.LOGIN}?error=auth_failed`, { replace: true })
        return
      }

      window.history.replaceState({}, document.title, ROUTES.AUTH_CALLBACK)

      const exchanged = await exchangeAuthCodeForSession(authCode)

      if (!exchanged) {
        navigate(`${ROUTES.LOGIN}?error=auth_failed`, { replace: true })
        return
      }

      const session = await getSession()

      if (!isMounted) {
        return
      }

      if (session) {
        const redirectTo = getSafeAuthRedirect(
          window.sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY),
        )
        window.sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY)
        toast.success('Welcome to memeit!', { id: 'signin' })
        navigate(redirectTo, { replace: true })
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
      <TopLoadingBar />
      <p className="text-sm text-text-secondary">Signing you in...</p>
    </main>
  )
}
