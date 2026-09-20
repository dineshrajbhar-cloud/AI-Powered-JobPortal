import { api } from '../lib/api'
import { decodeJwt } from '../lib/storage'

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data // { jwtToken, name, email }
}

export async function signup({ name, email, password }) {
  const { data } = await api.post('/auth/signup', { name, email, password })
  return data // plain-text confirmation; the backend always creates a CANDIDATE
}

function normalizeRole(value) {
  const role = String(value || '').replace(/^ROLE_/, '').toUpperCase()
  return role === 'RECRUITER' || role === 'CANDIDATE' ? role : null
}

/**
 * The login response only contains { jwtToken, name, email } and the JWT only
 * carries the email, so the role has to be worked out:
 *  1. use a `role` field / claim if the backend ever provides one
 *  2. otherwise probe a recruiter-only endpoint. Spring Security answers 403
 *     for candidates; recruiters get past security and receive a 404 (user 0
 *     does not exist), so no user data is transferred.
 */
export async function detectRole(token, hint) {
  const explicit = normalizeRole(hint)
  if (explicit) return explicit

  const claims = decodeJwt(token) || {}
  const claimed = normalizeRole(claims.role ?? claims.roles?.[0] ?? claims.authorities?.[0])
  if (claimed) return claimed

  try {
    await api.get('/users/0', { skipAuth: true, headers: { Authorization: `Bearer ${token}` } })
    return 'RECRUITER'
  } catch (error) {
    if (error.status === 403) return 'CANDIDATE'
    if (error.status === 404) return 'RECRUITER'
    throw error
  }
}
