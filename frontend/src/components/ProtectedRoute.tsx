import { Navigate } from 'react-router-dom'
import { ROUTES } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function FullPageSpinner() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
        aria-hidden="true"
      />
    </main>
  )
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return children
}
