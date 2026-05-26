import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './lib/constants'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import EditorPage from './pages/EditorPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

// Wraps every page that needs the top navigation bar.
// LoginPage is excluded — it's a full-screen centered layout.
function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME}    element={<Layout><HomePage /></Layout>} />
      <Route path={ROUTES.FEED}    element={<Layout><HomePage /></Layout>} />
      <Route path={ROUTES.CREATE}  element={<Layout><ProtectedRoute><CreatePage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.EDITOR}  element={<Layout><ProtectedRoute><EditorPage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.PROFILE} element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.LOGIN}   element={<LoginPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
    </Routes>
  )
}
