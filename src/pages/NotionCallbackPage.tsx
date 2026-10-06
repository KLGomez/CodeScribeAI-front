import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNotionStore } from '../features/integrations/store/useNotionStore'
import { notionApi } from '../features/integrations/api/notionApi'
import { NotionLogoIcon } from '../components/integrations/NotionSettingsCard'

type CallbackStatus = 'loading' | 'success' | 'error'

export function NotionCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setNotionConnected = useNotionStore((state) => state.setNotionConnected)

  const initialError = searchParams.get('error')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const [status, setStatus] = useState<CallbackStatus>(() => {
    if (initialError || !code) return 'error'
    return 'loading'
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (initialError) {
      return initialError === 'access_denied'
        ? 'Autorización cancelada por el usuario en Notion.'
        : `Error devuelto por Notion: ${initialError}`
    }
    if (!code) {
      return 'No se encontró ningún código de autorización en la URL.'
    }
    return null
  })

  useEffect(() => {
    let isCancelled = false

    if (initialError || !code) {
      const timer = setTimeout(() => {
        if (!isCancelled) navigate('/dashboard')
      }, 3000)
      return () => {
        isCancelled = true
        clearTimeout(timer)
      }
    }

    // Call real backend OAuth callback exchange
    notionApi
      .submitCallback(code, state || '')
      .then((data) => {
        if (isCancelled) return
        setNotionConnected(true, data.workspaceName)
        setStatus('success')
        setTimeout(() => {
          if (!isCancelled) navigate('/dashboard')
        }, 1500)
      })
      .catch((err) => {
        if (isCancelled) return
        setStatus('error')
        const msg =
          err?.response?.data?.message ||
          'Error al completar la vinculación con Notion. Por favor, reintenta.'
        setErrorMessage(msg)
        setTimeout(() => {
          if (!isCancelled) navigate('/dashboard')
        }, 3500)
      })

    return () => {
      isCancelled = true
    }
  }, [searchParams, navigate, setNotionConnected, code, state, initialError])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 text-center transition-all duration-200">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center mb-6 shadow-2xs">
              <NotionLogoIcon className="w-9 h-9" />
            </div>

            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-6" />

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
              Serás redirigido al Dashboard automáticamente en unos segundos...
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
