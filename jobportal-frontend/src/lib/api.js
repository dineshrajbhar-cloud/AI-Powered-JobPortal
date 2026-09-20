import axios from 'axios'
import { API_BASE_URL } from '../config'
import { clearSession, isTokenExpired, loadSession } from './storage'

export class ApiError extends Error {
  constructor(message, { status, fieldErrors, cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors || null
    this.cause = cause
  }
}

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 })

api.interceptors.request.use((config) => {
  // `skipAuth` is used for public endpoints and for calls that set their own header
  if (config.skipAuth || config.url?.startsWith('/auth/')) return config

  const session = loadSession()
  if (session?.token) {
    if (isTokenExpired(session.token)) {
      clearSession()
      window.dispatchEvent(new CustomEvent('auth:expired'))
      return Promise.reject(new ApiError('Your session has expired. Please sign in again.', { status: 401 }))
    }
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error) || error instanceof ApiError) throw error

    // Blob responses (resume download) carry error text as a Blob
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = await error.response.data.text()
      } catch {
        /* ignore */
      }
    }

    const apiError = toApiError(error)
    if (apiError.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      clearSession()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    throw apiError
  },
)

function toApiError(error) {
  const response = error.response
  if (!response) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', { cause: error })
    }
    return new ApiError('Cannot reach the server. Check that the Spring Boot API is running.', { cause: error })
  }

  const { status, data } = response
  let message = ''
  let fieldErrors = null

  if (typeof data === 'string') {
    message = data.trim()
  } else if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message) {
      message = data.message
    } else {
      // GlobalExceptionHandler returns { field: "message" } for validation failures
      fieldErrors = data
      message = Object.values(data).filter((v) => typeof v === 'string').join('. ')
    }
  }

  // The backend's catch-all handler prefixes "Something went wrong"
  message = message.replace(/^Something went wrong/i, '').trim()

  if (/maximum upload size exceeded/i.test(message)) {
    message = "That file is larger than the server's upload limit."
  }
  if (!message) {
    if (status === 403) message = "You don't have permission to do this."
    else if (status === 404) message = 'The requested item was not found.'
    else if (status >= 500) message = 'Something went wrong on the server.'
    else message = 'The request failed.'
  }

  return new ApiError(message, { status, fieldErrors, cause: error })
}

export function isCancelled(error) {
  return axios.isCancel(error)
}
