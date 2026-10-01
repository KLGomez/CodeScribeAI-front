import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/landing/HeroSection'
import { useAuthStore } from '../features/auth/store/authStore'
import api from '../lib/axios'

export function LandingPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleDemoAccess = async () => {
    setLoadingDemo(true)
    try {
      const res = await api.post('/auth/demo')
      setAuth(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch {
      // Fallback local si el backend está en proceso de inicio o modo offline
      setAuth(
        {
          id: '66faef1234567890abcdef01',
          username: 'desarrollador-demo',
          displayName: 'Usuario de Prueba',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
          email: 'demo@codescribe.local',
          plan: 'pro',
          analysisCount: 3,
        },
        'demo-jwt-token-testing-codescribe',
      )
      navigate('/dashboard')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <HeroSection
      onDemoAccess={handleDemoAccess}
      loadingDemo={loadingDemo}
    />
  )
}
