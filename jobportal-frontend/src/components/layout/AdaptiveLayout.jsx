import { useAuth } from '../../context/AuthContext'
import { AppShell } from './AppShell'
import { PublicLayout } from './PublicLayout'

// Pages that work signed in or out (resume matcher, 404) pick the matching chrome.
export function AdaptiveLayout() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppShell /> : <PublicLayout contained />
}
