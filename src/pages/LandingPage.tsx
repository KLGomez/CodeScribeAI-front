import { useNavigate } from 'react-router-dom'
import { GithubLoginButton } from '../features/auth/components/GithubLoginButton'
import { useAuthStore } from '../features/auth/store/authStore'

export function LandingPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleDemoAccess = () => {
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
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-2xl">
        <div className="mb-6 text-6xl">📄</div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Code<span className="text-green-400">Scribe</span> AI
        </h1>
        <p className="text-gray-400 text-xl mb-10 leading-relaxed">
          Genera documentación técnica profesional de tus repositorios GitHub
          en segundos, impulsado por{' '}
          <span className="text-green-400 font-medium">Google Gemini</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GithubLoginButton />
          <button
            onClick={handleDemoAccess}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-150 shadow-lg shadow-green-900/20"
          >
            🚀 Entrar en Modo Demo
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          Usa <strong>Continuar con GitHub</strong> para autenticación real OAuth o{' '}
          <strong>Entrar en Modo Demo</strong> para explorar la interfaz sin credenciales.
        </p>
      </div>
    </div>
  )
}
