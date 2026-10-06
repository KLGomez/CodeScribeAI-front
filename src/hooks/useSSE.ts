import { useEffect, useRef, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export interface SSEMessagePayload {
  status: string
  progress: number
  stage?: string
  documentationId?: string
  errorCode?: string
  errorMessage?: string
}

interface UseSSEOptions<T = SSEMessagePayload> {
  url: string
  onMessage: (data: T) => void
  onError?: (err?: Error) => void
  enabled?: boolean
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Server-Sent Events hook with Authorization headers, exponential backoff,
 * retry limits and typed stages.
 */
export function useSSE<T = SSEMessagePayload>({
  url,
  onMessage,
  onError,
  enabled = true,
}: UseSSEOptions<T>) {
  const ctrlRef = useRef<AbortController | null>(null)
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)
  const retryCountRef = useRef(0)

  useEffect(() => {
    onMessageRef.current = onMessage
    onErrorRef.current = onError
  }, [onMessage, onError])

  const getToken = () => {
    try {
      const stored = localStorage.getItem('codescribe-auth')
      return stored ? JSON.parse(stored)?.state?.token : null
    } catch {
      return null
    }
  }

  const close = useCallback(() => {
    if (ctrlRef.current) {
      ctrlRef.current.abort()
      ctrlRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || !url) return

    close()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    retryCountRef.current = 0

    const token = getToken()
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const fullUrl = `${BASE_URL}${url}`

    fetchEventSource(fullUrl, {
      method: 'GET',
      headers,
      signal: ctrl.signal,
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          retryCountRef.current = 0
          return
        }
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          throw new Error(`Fatal SSE status: ${response.status}`)
        }
        throw new Error(`Server returned status: ${response.status}`)
      },
      onmessage(event) {
        try {
          const parsed = JSON.parse(event.data) as T
          onMessageRef.current(parsed)
        } catch {
          // ignore malformed frame
        }
      },
      onclose() {
        // Stream completed by server
      },
      onerror(err) {
        if (ctrl.signal.aborted) {
          return
        }
        retryCountRef.current += 1
        if (
          retryCountRef.current > 5 ||
          err?.message?.includes('Fatal SSE status')
        ) {
          onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)))
          throw err
        }
        return Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000)
      },
    }).catch(() => {
      onErrorRef.current?.()
    })

    return () => {
      ctrl.abort()
      ctrlRef.current = null
    }
  }, [url, enabled, close])

  return { close }
}
