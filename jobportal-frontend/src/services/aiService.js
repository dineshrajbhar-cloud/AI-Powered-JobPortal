import { api } from '../lib/api'

// Public endpoint. Spring forwards the PDF to the FastAPI service, which asks the
// LLM to rank open jobs - this can take a while, hence the long timeout.
export async function matchJobs(file, config = {}) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/ai/match-jobs', form, { timeout: 120000, skipAuth: true, ...config })
  return Array.isArray(data?.matchedJobs) ? data.matchedJobs : []
}
