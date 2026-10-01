import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { repoApi } from '../features/repository/api/repoApi'
import { useJobStore } from '../features/jobs/store/jobStore'
import { parseGithubUrl } from '../lib/utils'

export function AnalyzePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setActiveJob } = useJobStore()

  const isValid = !!parseGithubUrl(url)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const { jobId } = await repoApi.analyze(url)
      setActiveJob(jobId)
      navigate('/dashboard')
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Error al iniciar el análisis. Verifica que el repositorio sea público.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Patrón SVG decorativo */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <svg
          className="absolute inset-0 h-full w-full stroke-slate-900/[0.03] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="analyze-grid-pattern"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
              x="50%"
              y={-1}
            >
              <path d="M.5 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#analyze-grid-pattern)" />
        </svg>
      </div>

      <div className="w-full max-w-xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-6 transition-colors bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs"
        >
          <span>←</span>
          <span>Volver al dashboard</span>
        </Link>

        {/* Tarjeta del formulario de análisis */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
              🔍
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Analizar Repositorio
            </h1>
          </div>

          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Ingresa la URL de un repositorio público de GitHub para extraer automáticamente su arquitectura, componentes y documentación.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                URL de GitHub
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              {url && !isValid && (
                <p className="text-rose-500 text-xs font-medium mt-1.5">
                  Por favor ingresa una URL válida: https://github.com/propietario/repositorio
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/15 active:translate-y-0 text-sm cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando análisis con IA...</span>
                </span>
              ) : (
                'Generar Documentación →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
