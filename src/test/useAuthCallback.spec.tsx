import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthCallback } from '../features/auth/hooks/useAuth'
import { useAuthStore } from '../features/auth/store/authStore'
import { authApi } from '../features/auth/api/authApi'

const mockNavigate = vi.fn()
const mockParams = new URLSearchParams('code=test_one_time_code_12345')

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockParams],
}))

vi.mock('../features/auth/api/authApi', () => ({
  authApi: {
    exchangeCode: vi.fn(),
  },
}))

describe('useAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  })

  it('canjea el código de autorización por token y usuario y limpia la URL', async () => {
    const mockUser = {
      id: 'user-1',
      username: 'dev_user',
      plan: 'free' as const,
      analysisCount: 0,
    }
    vi.mocked(authApi.exchangeCode).mockResolvedValue({
      token: 'valid_jwt_token_from_exchange',
      user: mockUser,
    })

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    renderHook(() => useAuthCallback())

    await waitFor(() => {
      expect(authApi.exchangeCode).toHaveBeenCalledWith('test_one_time_code_12345')
    })

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.token).toBe('valid_jwt_token_from_exchange')
      expect(state.user?.username).toBe('dev_user')
      expect(state.isAuthenticated).toBe(true)
    })

    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/dashboard')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
})
