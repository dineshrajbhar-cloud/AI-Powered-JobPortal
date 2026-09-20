import { api } from '../lib/api'
import { parseFilename } from '../lib/files'

// Candidates receive only their own applications; recruiters receive all of them.
export const listApplications = (config = {}) => api.get('/application', config).then((r) => r.data)

// The backend takes the owner from the JWT and ignores userId, but the request DTO
// marks it @NotNull, so a placeholder is sent to pass validation.
export const applyToJob = (jobId) =>
  api.post('/application', { status: 'PENDING', userId: 0, jobId }).then((r) => r.data)

export const withdrawApplication = (id) => api.delete(`/application/${id}`).then((r) => r.data)

// Recruiter only. The backend saves the status, then emails the candidate.
export const updateApplicationStatus = (id, status) =>
  api.patch(`/application/${id}/status`, null, { params: { status } }).then((r) => r.data)

export function uploadResume(applicationId, file, onProgress) {
  const form = new FormData()
  form.append('resume', file)
  return api
    .post(`/${applicationId}/upload-resume`, form, {
      timeout: 60000,
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    })
    .then((r) => r.data)
}

export async function downloadResume(applicationId) {
  const res = await api.get(`/${applicationId}/resume`, { responseType: 'blob', timeout: 60000 })
  return { blob: res.data, filename: parseFilename(res.headers['content-disposition']) }
}
