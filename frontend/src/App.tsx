import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import HomePage from '@/pages/HomePage'
import CreatePage from '@/pages/CreatePage'
import EditorPage from '@/pages/EditorPage'
import ProfilePage from '@/pages/ProfilePage'
import LoginPage from '@/pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.CREATE} element={<CreatePage />} />
      <Route path={ROUTES.EDITOR} element={<EditorPage />} />
      <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    </Routes>
  )
}
