import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSSE } from '../hooks/useSSE'
import { fetchEventSource } from '@microsoft/fetch-event-source'

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn().mockImplementation(() => Promise.resolve()),
}))

describe('useSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('envía Authorization header y NO expone el token en la query string de la URL', () => {
    localStorage.setItem(
      'codescribe-auth',
      JSON.stringify({ state: { token: 'my_secret_user_jwt_token' } }),
    )

    const onMessage = vi.fn()
    const onError = vi.fn()

    renderHook(() =>
      useSSE({
        url: '/jobs/job-123/stream',
        onMessage,
        onError,
        enabled: true,
      }),
    )

    expect(fetchEventSource).toHaveBeenCalledTimes(1)
    const [callUrl, callInit] = vi.mocked(fetchEventSource).mock.calls[0]

    // Verify URL does not have ?token=
    expect(callUrl).not.toContain('?token=')
    expect(callUrl).toContain('/jobs/job-123/stream')

    // Verify Authorization Bearer header
    expect(callInit?.headers).toMatchObject({
      Accept: 'text/event-stream',
      Authorization: 'Bearer my_secret_user_jwt_token',
    })
  })
})
