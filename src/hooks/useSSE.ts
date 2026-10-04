import { useEffect, useRef, useCallback } from 'react'

interface UseSSEOptions<T> {
  url: string
  onMessage: (data: T) => void
  onError?: () => void
  enabled?: boolean
}

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'http://localhost:3001/api'

/**
 * Generic Server-Sent Events hook with stable callbacks and automatic reconnection.
 * Reads JWT from localStorage for EventSource query param.
 */
export function useSSE<T>({
  url,
  onMessage,
  onError,
  enabled = true,
}: UseSSEOptions<T>) {
  const esRef = useRef<EventSource | null>(null)
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

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
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || !url) return

    close()
    const token = getToken()
    const qs = token ? `?token=${token}` : ''
    const es = new EventSource(`${BASE_URL}${url}${qs}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as T
        onMessageRef.current(parsed)
      } catch {
        /* skip malformed frames */
      }
    }

    es.onerror = (e) => {
      if (es.readyState === EventSource.CLOSED) {
        onErrorRef.current?.()
      } else {
        // EventSource will automatically attempt to reconnect
        console.warn('[SSE] Connection issue, retrying...', e)
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [url, enabled, close])

  return { close }
}
