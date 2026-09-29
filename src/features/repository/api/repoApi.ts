import api from '../../../lib/axios'

export const repoApi = {
  analyze: (repoUrl: string) =>
    api
      .post<{ jobId: string; status: string }>('/repositories/analyze', { repoUrl })
      .then((r) => r.data),
}
