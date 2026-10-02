import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../../../types/user.types'
import api from '../../../lib/axios'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  deleteAccount: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('codescribe-auth')
        window.location.href = '/'
      },
      deleteAccount: async () => {
        const { token } = get()
        await api.delete('/users/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        localStorage.removeItem('codescribe-auth')
        sessionStorage.clear()
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'codescribe-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

