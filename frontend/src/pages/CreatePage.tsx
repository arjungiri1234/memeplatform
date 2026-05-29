import { Navigate } from 'react-router-dom'
import { ROUTES } from '../lib/constants'

export default function CreatePage() {
  return <Navigate to={ROUTES.EDITOR} replace />
}
