import { Navigate, useLocation } from 'react-router-dom'
import { getLoginRoute } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'
import TopLoadingBar from './TopLoadingBar'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="min-h-screen bg-bg">
        <TopLoadingBar />
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={getLoginRoute({ redirectTo: location.pathname })} replace />
  }

  return children
}
