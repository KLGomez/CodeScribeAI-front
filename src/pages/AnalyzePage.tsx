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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <Link
          to="/dashboard"
          className="text-gray-500 hover:text-white text-sm mb-8 inline-block transition-colors"
        >
          ← Volver al dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          Analizar Repositorio
        </h1>
        <p className="text-gray-500 mb-8">
          Ingresa la URL de un repositorio público de GitHub.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              URL del repositorio
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
            />
            {url && !isValid && (
              <p className="text-red-400 text-sm mt-1">
                Ingresa una URL válida: https://github.com/owner/repo
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Iniciando análisis...' : 'Generar Documentación'}
          </button>
        </form>
      </div>
    </div>
  )
}
