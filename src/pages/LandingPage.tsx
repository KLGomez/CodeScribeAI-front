import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/landing/HeroSection'
import { useAuthStore } from '../features/auth/store/authStore'
import api from '../lib/axios'

export function LandingPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleDemoAccess = () => {
    // Modo Demo autónomo en frontend con demoData.ts para máxima velocidad y privacidad
    setAuth(
      {
        id: 'demo-guest',
        username: 'desarrollador-demo',
        displayName: 'Visitante Demo',
        avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
        email: 'demo@codescribe.local',
        plan: 'pro',
        analysisCount: 0,
      },
      'demo-jwt-token-testing-codescribe',
    )
    navigate('/demo')
  }

  return (
    <HeroSection
      onDemoAccess={handleDemoAccess}
      loadingDemo={loadingDemo}
    />
  )
}
