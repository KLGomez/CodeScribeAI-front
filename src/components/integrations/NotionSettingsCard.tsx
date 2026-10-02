import { useIntegrationStore } from '../../store/useIntegrationStore'

export interface NotionSettingsCardProps {
  className?: string
  /**
   * URL de autorización OAuth de Notion.
   * Si no se especifica, tomará la variable de entorno VITE_NOTION_AUTH_URL.
   */
  authUrl?: string
}

/**
 * Icono vectorial oficial y fiel de Notion
 */
export function NotionLogoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.668c-.466-.373-.932-.653-2.146-.56L2.92 2.135c-.373.047-.466.28-.326.466l1.865 1.607zm.84 3.731v13.618c0 .84.42 1.12 1.306 1.073l14.195-.84c.886-.046.98-.606.98-1.26V6.953c0-.653-.28-.98-.84-.933l-14.801.886c-.606.047-.84.42-.84 1.033zm13.447.886c.047.373 0 .746-.373.793l-1.073.187v10.354c-.606.373-1.213.56-1.727.56-.84 0-1.073-.28-1.726-.98l-5.177-8.118v7.885l1.633.373c.047.373 0 .746-.373.793l-4.244.28c-.047-.373 0-.746.373-.793l1.12-.234V8.406l-1.447-.14c-.047-.373 0-.746.373-.793l4.384-.28 5.41 8.258V8.126l-1.26-.14c-.047-.373 0-.746.373-.793l3.684-.233z" />
    </svg>
  )
}

/**
 * Tarjeta de Configuración de la Integración con Notion
 * Soporta estados conectado y desconectado con diseño claro/oscuro (SaaS luminoso).
 */
export function NotionSettingsCard({ className = '', authUrl }: NotionSettingsCardProps) {
  const {
    isNotionConnected,
    notionWorkspaceName,
    notionPages,
    setNotionConnected,
    disconnectNotion,
  } = useIntegrationStore()

  // Determinación de la URL de autorización OAuth
  const resolvedAuthUrl =
    authUrl ||
    (import.meta.env?.VITE_NOTION_AUTH_URL as string | undefined) ||
    'https://api.notion.com/v1/oauth/authorize?client_id=codescribe-notion-app&response_type=code&owner=user'

  const handleConnectRedirect = () => {
    if (resolvedAuthUrl) {
      window.location.href = resolvedAuthUrl
    }
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Lado izquierdo: Logo, Identidad y Descripción */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-2xs">
            <NotionLogoIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Notion
              </h3>

              {isNotionConnected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 shadow-3xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Conectado</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  No vinculado
                </span>
              )}
            </div>

            {isNotionConnected ? (
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Espacio vinculado:{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                    {notionWorkspaceName || 'Espacio de Trabajo'}
                  </strong>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {notionPages.length} {notionPages.length === 1 ? 'página disponible' : 'páginas disponibles'} para exportación directa
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Sincroniza tus documentaciones directamente a tu espacio de trabajo de Notion en un solo clic.
              </p>
            )}
          </div>
        </div>

        {/* Lado derecho: Acciones de Conexión / Desconexión */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          {!isNotionConnected ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleConnectRedirect}
                className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-950 px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20"
                aria-label="Conectar cuenta de Notion mediante OAuth"
              >
                <NotionLogoIcon className="w-4 h-4" />
                <span>Conectar con Notion</span>
              </button>

              {/* Botón rápido para pruebas locales / demo en desarrollo */}
              <button
                type="button"
                onClick={() => setNotionConnected(true, 'Engineering Team Workspace')}
                title="Activar estado conectado para pruebas locales"
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 px-2 py-1 text-center cursor-pointer transition-colors"
              >
                (Simular conexión)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={disconnectNotion}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/60 px-3.5 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-3xs"
                aria-label="Desconectar espacio de trabajo de Notion"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Desconectar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
