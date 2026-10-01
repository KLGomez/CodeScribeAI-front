import { useAuthCallback } from '../features/auth/hooks/useAuth'

export function AuthCallbackPage() {
  useAuthCallback()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-sm">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Conectando con GitHub</h2>
        <p className="text-slate-500 text-xs">Comprobando credenciales y autorizando sesión...</p>
      </div>
    </div>
  )
}
