import { api } from '../lib/api'

function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ''),
  )
}

// GET /api/jobs/filter treats missing params as "no filter", so it also serves as "list all"
export const listJobs = (filters = {}, config = {}) =>
  api.get('/jobs/filter', { params: clean(filters), ...config }).then((r) => r.data)

export const getJob = (id, config = {}) => api.get(`/jobs/${id}`, config).then((r) => r.data)

export const createJob = (payload) => api.post('/jobs', payload).then((r) => r.data)

export const updateJob = (id, payload) => api.put(`/jobs/${id}`, payload).then((r) => r.data)

export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data)

// Public endpoint (used by the AI service) - lets the landing page show openings before login
export const listPublicJobs = (config = {}) =>
  api.get('/ai/jobs', { skipAuth: true, ...config }).then((r) => r.data)
