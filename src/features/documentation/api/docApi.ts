import api from '../../../lib/axios'
import type { Documentation } from '../../../types/doc.types'

export interface DeleteDocResponse {
  success: boolean
  message: string
}

export const docApi = {
  getAll: () =>
    api.get<Documentation[]>('/documentation').then((r) => r.data),
  getById: (id: string) =>
    api.get<Documentation>(`/documentation/${id}`).then((r) => r.data),
  delete: (id: string) =>
    api.delete<DeleteDocResponse>(`/documentation/${id}`).then((r) => r.data),
}
