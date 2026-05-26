import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './lib/constants'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import EditorPage from './pages/EditorPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'

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
      <Route path={ROUTES.CREATE}  element={<Layout><CreatePage /></Layout>} />
      <Route path={ROUTES.EDITOR}  element={<Layout><EditorPage /></Layout>} />
      <Route path={ROUTES.PROFILE} element={<Layout><ProfilePage /></Layout>} />
      <Route path={ROUTES.LOGIN}   element={<LoginPage />} />
    </Routes>
  )
}
