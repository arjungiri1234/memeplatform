import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ROUTES } from './lib/constants'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TemplatePickerPage from './pages/TemplatePickerPage'
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
    <>
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111111',
            color: '#ededed',
            border: '1px solid #1e1e1e',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#00e676', secondary: '#052e1a' },
          },
        }}
      />
    <Routes>
      <Route path={ROUTES.HOME}    element={<Layout><HomePage /></Layout>} />
      <Route path={ROUTES.FEED}    element={<Layout><HomePage /></Layout>} />
      <Route path={ROUTES.CREATE}  element={<Layout><ProtectedRoute><TemplatePickerPage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.EDITOR}  element={<Layout><ProtectedRoute><EditorPage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.PROFILE} element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
      <Route path={`${ROUTES.PROFILE}/:username`} element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
      <Route path={ROUTES.LOGIN}   element={<LoginPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
    </Routes>
    </>
  )
}
