import { useEffect, useRef, useCallback } from 'react'

interface UseSSEOptions<T> {
  url: string
  onMessage: (data: T) => void
  onError?: () => void
  enabled?: boolean
}

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

/**
 * Generic Server-Sent Events hook.
 * Reads the JWT from localStorage and appends it as a query param
 * since EventSource doesn't support custom headers.
 */
export function useSSE<T>({
  url,
  onMessage,
  onError,
  enabled = true,
}: UseSSEOptions<T>) {
  const esRef = useRef<EventSource | null>(null)

  const getToken = () => {
    try {
      const stored = localStorage.getItem('codescribe-auth')
      return stored ? JSON.parse(stored)?.state?.token : null
    } catch {
      return null
    }
  }

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close()
    const token = getToken()
    const qs = token ? `?token=${token}` : ''
    const es = new EventSource(`${BASE_URL}${url}${qs}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data) as T)
      } catch {
        /* skip malformed frames */
      }
    }

    es.onerror = () => {
      onError?.()
      es.close()
    }
  }, [url, onMessage, onError])

  useEffect(() => {
    if (!enabled) return
    connect()
    return () => esRef.current?.close()
  }, [enabled, connect])

  return { close: () => esRef.current?.close() }
}
