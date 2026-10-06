import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useJobSSE } from '../features/jobs/hooks/useJobSSE'
import { useJobStore } from '../features/jobs/store/jobStore'
import * as useSSEModule from '../hooks/useSSE'

describe('useJobSSE', () => {
  beforeEach(() => {
    useJobStore.setState({
      jobs: {
        job123: {
          _id: 'job123',
          userId: 'u1',
          repoUrl: 'https://github.com/owner/repo',
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      activeJobId: 'job123',
    })
    vi.clearAllMocks()
  })

  it('actualiza el progreso y la etapa del trabajo con eventos SSE entrantes', () => {
    const mockClose = vi.fn()
    let capturedOnMessage: ((data: any) => void) | undefined

    vi.spyOn(useSSEModule, 'useSSE').mockImplementation((options: any) => {
      capturedOnMessage = options.onMessage
      return {
        isConnected: true,
        data: null,
        error: null,
        close: mockClose,
        reconnect: vi.fn(),
      }
    })

    renderHook(() => useJobSSE('job123'))

    expect(capturedOnMessage).toBeDefined()
    capturedOnMessage!({
      status: 'processing',
      progress: 45,
      stage: 'generating_docs',
    })

    const updatedJob = useJobStore.getState().jobs.job123
    expect(updatedJob.progress).toBe(45)
    expect(updatedJob.stage).toBe('generating_docs')
    expect(mockClose).not.toHaveBeenCalled()
  })

  it('cierra la conexión cuando el evento SSE indica estado terminal done', () => {
    const mockClose = vi.fn()
    let capturedOnMessage: ((data: any) => void) | undefined

    vi.spyOn(useSSEModule, 'useSSE').mockImplementation((options: any) => {
      capturedOnMessage = options.onMessage
      return {
        isConnected: true,
        data: null,
        error: null,
        close: mockClose,
        reconnect: vi.fn(),
      }
    })

    renderHook(() => useJobSSE('job123'))

    capturedOnMessage!({
      status: 'done',
      progress: 100,
      documentationId: 'doc999',
    })

    const updatedJob = useJobStore.getState().jobs.job123
    expect(updatedJob.status).toBe('done')
    expect(updatedJob.documentationId).toBe('doc999')
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('mapea y almacena error tipificado cuando falla la conexión SSE', () => {
    let capturedOnError: (() => void) | undefined

    vi.spyOn(useSSEModule, 'useSSE').mockImplementation((options: any) => {
      capturedOnError = options.onError
      return {
        isConnected: false,
        data: null,
        error: new Error('Network error'),
        close: vi.fn(),
        reconnect: vi.fn(),
      }
    })

    renderHook(() => useJobSSE('job123'))

    expect(capturedOnError).toBeDefined()
    capturedOnError!()

    const updatedJob = useJobStore.getState().jobs.job123
    expect(updatedJob.status).toBe('error')
    expect(updatedJob.errorCode).toBe('AI_UNAVAILABLE')
    expect(updatedJob.errorMessage).toContain('conexión en tiempo real')
  })
})
