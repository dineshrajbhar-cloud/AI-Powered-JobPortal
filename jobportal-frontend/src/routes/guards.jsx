import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../context/AuthContext'

export function RequireAuth({ roles }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(role)) return <Navigate to={homeFor(role)} replace />
  return <Outlet />
}

export function GuestOnly() {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated) return <Navigate to={homeFor(role)} replace />
  return <Outlet />
}
