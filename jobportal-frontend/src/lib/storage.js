const KEY = 'jobportal.session'

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    /* storage unavailable (private mode) - session lives in memory only */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      Array.from(atob(payload), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// The backend puts `exp` in the token, but answers 403 (not 401) for an expired one,
// so expiry is checked on the client before requests are sent.
export function isTokenExpired(token, skewSeconds = 10) {
  const claims = decodeJwt(token)
  if (!claims?.exp) return false
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000
}
