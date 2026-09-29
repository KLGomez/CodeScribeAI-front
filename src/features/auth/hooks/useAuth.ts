import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/authApi'

/**
 * Reads the ?jwt= query param set by the backend after GitHub OAuth,
 * stores the token, fetches the user profile and redirects to /dashboard.
 */
export function useAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const jwt = searchParams.get('jwt')
    if (!jwt) {
      navigate('/')
      return
    }
    // Temporarily inject the token so the next API call is authenticated
    useAuthStore.setState({ token: jwt })

    authApi
      .getMe()
      .then((user) => {
        setAuth(user, jwt)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        useAuthStore.setState({ token: null })
        navigate('/')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
