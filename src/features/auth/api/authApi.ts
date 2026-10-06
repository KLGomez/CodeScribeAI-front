import api from '../../../lib/axios'
import type { User } from '../../../types/user.types'

export interface ExchangeResponse {
  token: string
  user: User
}

export const authApi = {
  getMe: () => api.get<User>('/auth/me').then((r) => r.data),
  exchangeCode: (code: string) =>
    api.post<ExchangeResponse>('/auth/exchange', { code }).then((r) => r.data),
}
