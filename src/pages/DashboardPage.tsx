import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../features/auth/store/authStore'
import { useJobStore } from '../features/jobs/store/jobStore'
import { useJobSSE } from '../features/jobs/hooks/useJobSSE'
import { docApi } from '../features/documentation/api/docApi'
import { formatDate } from '../lib/utils'

export function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { activeJobId, jobs } = useJobStore()

  // Subscribe to SSE for the active job
  useJobSSE(activeJobId)

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documentation'],
    queryFn: docApi.getAll,
  })

  const activeJob = activeJobId ? jobs[activeJobId] : null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg">
          Code<span className="text-green-400">Scribe</span> AI
        </span>
        <div className="flex items-center gap-4">
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-300 text-sm">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Active job banner */}
        {activeJob && (
          <div
            className={`mb-8 p-4 rounded-lg border ${
              activeJob.status === 'done'
                ? 'border-green-700 bg-green-950'
                : activeJob.status === 'error'
                  ? 'border-red-700 bg-red-950'
                  : 'border-yellow-700 bg-yellow-950'
            }`}
          >
            <p className="text-sm font-medium text-white">
              {activeJob.status === 'queued' && '⏳ Análisis en cola...'}
              {activeJob.status === 'processing' && '🔄 Analizando repositorio...'}
              {activeJob.status === 'done' && '✅ Documentación generada'}
              {activeJob.status === 'error' && `❌ Error: ${activeJob.errorMessage}`}
            </p>
            {activeJob.status === 'done' && activeJob.documentationId && (
              <Link
                to={`/documentation/${activeJob.documentationId}`}
                className="mt-2 inline-block text-green-400 hover:underline text-sm"
              >
                Ver documentación →
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Mis Documentaciones</h1>
          <Link
            to="/analyze"
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            + Nuevo análisis
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : docs?.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-4">Todavía no tienes documentaciones generadas.</p>
            <Link to="/analyze" className="text-green-400 hover:underline">
              Analiza tu primer repositorio →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {docs?.map((doc) => (
              <Link
                key={doc._id}
                to={`/documentation/${doc._id}`}
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">
                    {doc.repoUrl.replace('https://github.com/', '')}
                  </span>
                  <span className="text-gray-500 text-xs ml-4 shrink-0">
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
