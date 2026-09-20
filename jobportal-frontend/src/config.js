export const APP_NAME = 'JobPortal'
export const REPO_URL = 'https://github.com/dineshrajbhar-cloud/Jobportal'

// Requests go to /api (proxied to Spring Boot in dev). Override for direct calls.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Backend limit is 5 MB and PDF / DOC / DOCX (ApplicationServiceImpl.uploadResume)
export const MAX_RESUME_MB = 5
export const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']
// The AI service reads resumes with pypdf, so the matcher accepts PDF only
export const MATCHER_EXTENSIONS = ['.pdf']

export const CURRENCY = {
  locale: import.meta.env.VITE_CURRENCY_LOCALE || 'en-IN',
  code: import.meta.env.VITE_CURRENCY_CODE || 'INR',
}

// Recruiter account seeded by DataInitializer in the backend.
export const SHOW_DEMO_LOGIN = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO === 'true'
export const DEMO_RECRUITER = { email: 'recruiter@gmail.com', password: 'recruiter@123' }
