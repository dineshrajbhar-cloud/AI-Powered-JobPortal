import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import * as authService from '../services/authService'
import { clearSession, isTokenExpired, loadSession, saveSession } from '../lib/storage'

const AuthContext = createContext(null)

function initialSession() {
  const session = loadSession()
  if (session?.token && !isTokenExpired(session.token)) return session
  if (session) clearSession()
  return null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession)

  const signIn = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    const role = await authService.detectRole(data.jwtToken, data.role)
    const next = { token: data.jwtToken, name: data.name, email: data.email, role }
    saveSession(next)
    setSession(next)
    return next
  }, [])

  // Registration always creates a candidate, so sign the new user straight in.
  const register = useCallback(
    async (details) => {
      await authService.signup(details)
      return signIn({ email: details.email, password: details.password })
    },
    [signIn],
  )

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  useEffect(() => {
    const onExpired = () => {
      setSession((current) => {
        if (current) toast.info('Your session expired. Please sign in again.')
        return null
      })
    }
    // keep tabs in sync when another tab signs in or out
    const onStorage = (event) => {
      if (event.key === 'jobportal.session') setSession(initialSession())
    }
    window.addEventListener('auth:expired', onExpired)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('auth:expired', onExpired)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session,
      role: session?.role ?? null,
      isAuthenticated: !!session,
      isRecruiter: session?.role === 'RECRUITER',
      isCandidate: session?.role === 'CANDIDATE',
      signIn,
      register,
      signOut,
    }),
    [session, signIn, register, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export const homeFor = (role) => (role === 'RECRUITER' ? '/recruiter' : '/candidate')
