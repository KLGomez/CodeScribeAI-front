import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../features/auth/store/authStore'
import { useJobStore } from '../features/jobs/store/jobStore'
import { useJobSSE } from '../features/jobs/hooks/useJobSSE'
import { docApi } from '../features/documentation/api/docApi'
import { formatDate } from '../lib/utils'
import { ThemeToggle } from '../components/shared/ThemeToggle'
import { NotionSettingsCard } from '../components/NotionSettingsCard'

export function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { activeJobId, jobs } = useJobStore()
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Suscribirse a eventos SSE para el trabajo activo
  useJobSSE(activeJobId)

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documentation'],
    queryFn: docApi.getAll,
  })

  // Mutación para eliminación física de documentación con invalidación de caché
  const deleteMutation = useMutation({
    mutationFn: (id: string) => docApi.delete(id),
    onSuccess: () => {
      // Refresca la lista automáticamente
      queryClient.invalidateQueries({ queryKey: ['documentation'] })
      setDeletingId(null)
    },
    onError: (error: any) => {
      setDeletingId(null)
      const message =
        error?.response?.data?.message ||
        'No se pudo eliminar la documentación. Verifica tus permisos.'
      alert(`Error: ${message}`)
    },
  })

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    // Evitar que el clic active la navegación del enlace de la tarjeta
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta documentación? Esta acción es permanente y no se puede deshacer.',
    )

    if (confirmed) {
      setDeletingId(docId)
      deleteMutation.mutate(docId)
    }
  }

  const activeJob = activeJobId ? jobs[activeJobId] : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Patrón SVG decorativo de cuadrícula fina para profundidad visual adaptativo */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full stroke-slate-900/[0.03] dark:stroke-white/[0.03] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="dashboard-grid-pattern"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
              x="50%"
              y={-1}
            >
              <path d="M.5 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#dashboard-grid-pattern)" />
        </svg>
      </div>

      {/* Header Superior Limpio con Modo Oscuro */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 transition-colors duration-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            <span>Code</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
              Scribe AI
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Selector de Tema Visual (Light / Dark / System) */}
            <ThemeToggle />

            {/* Perfil del Usuario */}
            <div className="flex items-center gap-2.5 bg-slate-100/80 dark:bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 transition-colors">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-6 h-6 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold">{user?.username}</span>
              {user?.plan && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                  {user.plan}
                </span>
              )}
            </div>

            <button
              onClick={logout}
              type="button"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Banner de trabajo activo (SSE) */}
        {activeJob && (
          <div
            className={`mb-8 p-5 rounded-2xl border shadow-sm transition-all ${
              activeJob.status === 'done'
                ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : activeJob.status === 'error'
                  ? 'border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                  : 'border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeJob.status === 'processing' || activeJob.status === 'queued' ? (
                  <div className="w-4 h-4 border-2 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : null}
                <p className="text-sm font-semibold">
                  {activeJob.status === 'queued' && '⏳ Análisis en cola...'}
                  {activeJob.status === 'processing' && '🔄 Analizando repositorio con IA...'}
                  {activeJob.status === 'done' && '✅ Documentación generada con éxito'}
                  {activeJob.status === 'error' && `❌ Error: ${activeJob.errorMessage}`}
                </p>
              </div>

              {activeJob.status === 'done' && activeJob.documentationId && (
                <Link
                  to={`/documentation/${activeJob.documentationId}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  Ver documentación →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Mis Documentaciones
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Repositorios analizados y documentación técnica lista para consultar, exportar o gestionar.
            </p>
          </div>

          <Link
            to="/analyze"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/15 dark:hover:shadow-emerald-900/30 active:translate-y-0 cursor-pointer self-start sm:self-auto"
          >
            <span className="text-emerald-400 dark:text-white font-bold">+</span>
            <span>Nuevo análisis</span>
          </Link>
        </div>

        {/* Estado de Carga */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cargando documentaciones...</span>
          </div>
        ) : !docs || docs.length === 0 ? (
          /* Empty State Adaptable */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto transition-colors">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-2xs">
              📄
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
              Todavía no tienes documentaciones generadas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              Analiza cualquier repositorio público de GitHub o explora un documento interactivo de prueba.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <span>Analizar Repositorio</span>
                <span>→</span>
              </Link>
              <Link
                to="/documentation/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-2xs cursor-pointer"
              >
                <span>📄 Ver Ejemplo Demo</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Lista de Tarjetas de Documentación */
          <div className="space-y-3">
            {docs.map((doc) => {
              const repoName = doc.repoUrl.replace('https://github.com/', '')
              const isDeletingThis = deletingId === doc._id

              return (
                <div
                  key={doc._id}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:bg-emerald-50/20 dark:hover:bg-emerald-500/[0.03] transition-all duration-200 ease-out hover:-translate-y-0.5 flex items-center justify-between gap-4"
                >
                  {/* Área clickeable principal que navega a la documentación */}
                  <Link
                    to={`/documentation/${doc._id}`}
                    className="flex items-center gap-4 min-w-0 flex-1 focus:outline-none"
                  >
                    {/* Icono de repositorio */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>

                    {/* Información del Repo */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {repoName}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDate(doc.createdAt)}</span>
                        {doc.tokensUsed ? (
                          <>
                            <span>•</span>
                            <span>{doc.tokensUsed.toLocaleString()} tokens</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Link>

                  {/* Acciones de la Tarjeta: Ver Documentación + Botón de Eliminar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/documentation/${doc._id}`}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    >
                      <span>Ver documentación</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>

                    {/* Botón de Eliminación Física con confirmación nativa */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, doc._id)}
                      disabled={isDeletingThis}
                      title="Eliminar documentación permanentemente"
                      aria-label={`Eliminar documentación de ${repoName}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingThis ? (
                        <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sección de Integraciones de Workspace */}
        <section className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Integraciones de Espacios de Trabajo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Conecta tus herramientas favoritas para exportar y sincronizar documentación técnica automáticamente.
            </p>
          </div>
          <NotionSettingsCard />
        </section>
      </main>
    </div>
  )
}
