import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/authApi'

/**
 * Reads single-use ?code= from URL params, calls POST /api/auth/exchange,
 * stores user and token in authStore, clears the URL and navigates to /dashboard.
 * Rejects insecure ?jwt= params immediately.
 */
export function useAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const rawJwt = searchParams.get('jwt')
    if (rawJwt) {
      console.error('[Security] Insecure JWT received in URL query parameters. Rejected.')
      window.history.replaceState({}, '', '/')
      navigate('/?error=insecure_auth_rejected', { replace: true })
      return
    }

    const code = searchParams.get('code')
    if (!code) {
      navigate('/', { replace: true })
      return
    }

    authApi
      .exchangeCode(code)
      .then(({ token, user }) => {
        setAuth(user, token)
        window.history.replaceState({}, '', '/dashboard')
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        console.error('[Auth] Code exchange failed:', err)
        setError('Error al canjear el código de autorización.')
        window.history.replaceState({}, '', '/')
        navigate('/?error=auth_failed', { replace: true })
      })
  }, [searchParams, navigate, setAuth])

  return { error }
}
