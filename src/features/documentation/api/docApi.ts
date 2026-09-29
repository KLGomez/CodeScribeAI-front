import api from '../../../lib/axios'
import type { Documentation } from '../../../types/doc.types'

export const docApi = {
  getAll: () =>
    api.get<Documentation[]>('/documentation').then((r) => r.data),
  getById: (id: string) =>
    api.get<Documentation>(`/documentation/${id}`).then((r) => r.data),
  delete: (id: string) => api.delete(`/documentation/${id}`),
}
