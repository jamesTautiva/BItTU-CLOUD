import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'

const ROLES_PERMITIDOS = ['moderator', 'support', 'admin', 'super_admin']

function RequireAuth({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar que el rol del usuario esté en la lista permitida
  if (!user || !user.role || !ROLES_PERMITIDOS.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
