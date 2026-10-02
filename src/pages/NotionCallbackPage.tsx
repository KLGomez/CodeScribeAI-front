import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useIntegrationStore } from '../store/useIntegrationStore'
import { NotionLogoIcon } from '../components/NotionSettingsCard'

type CallbackStatus = 'loading' | 'success' | 'error'

export function NotionCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setNotionConnected = useIntegrationStore((state) => state.setNotionConnected)

  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // 1. Manejo de error retornado por Notion (ej. usuario canceló o denegó acceso)
    if (error) {
      setStatus('error')
      setErrorMessage(
        error === 'access_denied'
          ? 'Autorización cancelada por el usuario en Notion.'
          : `Error devuelto por Notion: ${error}`,
      )

      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 3000)

      return () => clearTimeout(timer)
    }

    // 2. Manejo exitoso con código de autorización
    if (code) {
      setStatus('loading')

      // Simulación asíncrona del intercambio de token en el backend (2 segundos)
      const timer = setTimeout(() => {
        setNotionConnected(true, 'Mi Espacio de Trabajo')
        setStatus('success')
        navigate('/dashboard')
      }, 2000)

      return () => clearTimeout(timer)
    }

    // 3. Caso atípico: URL sin code ni error
    setStatus('error')
    setErrorMessage('No se encontró ningún código de autorización válido en la URL.')
    const fallbackTimer = setTimeout(() => {
      navigate('/dashboard')
    }, 3000)

    return () => clearTimeout(fallbackTimer)
  }, [searchParams, navigate, setNotionConnected])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 text-center transition-all duration-200">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            {/* Logo de Notion destacado */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center mb-6 shadow-2xs">
              <NotionLogoIcon className="w-9 h-9" />
            </div>

            {/* Spinner elegante color emerald-500 */}
            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-6" />

            {/* Mensajes de carga */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Conectando tu espacio de trabajo...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Estamos verificando las credenciales y autorizando la integración con Notion.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800/80">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ¡Espacio conectado con éxito!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Redirigiendo a tu Dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/80">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No se pudo conectar con Notion
            </h2>
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-4 max-w-xs">
              {errorMessage}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Serás redirigido al Dashboard automáticamente en 3 segundos...
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-4 cursor-pointer"
            >
              Volver al Dashboard ahora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
