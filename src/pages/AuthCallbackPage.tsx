import { useAuthCallback } from '../features/auth/hooks/useAuth'

export function AuthCallbackPage() {
  useAuthCallback()
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Autenticando con GitHub...</p>
      </div>
    </div>
  )
}
