import { api } from '../lib/api'

export const getCandidateDashboard = (config = {}) => api.get('/dashboard/candidate', config).then((r) => r.data)
export const getRecruiterDashboard = (config = {}) => api.get('/dashboard/recruiter', config).then((r) => r.data)
