import api from '../../../lib/axios'
import type { Job } from '../../../types/job.types'

export const jobApi = {
  getAll: () => api.get<Job[]>('/jobs').then((r) => r.data),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`).then((r) => r.data),
}
