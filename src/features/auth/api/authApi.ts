import api from '../../../lib/axios'
import type { User } from '../../../types/user.types'

export const authApi = {
  getMe: () => api.get<User>('/auth/me').then((r) => r.data),
}
