import { useState, useEffect, type FormEvent } from 'react'
import { useNotionStore } from '../../features/integrations/store/useNotionStore'
import { notionApi } from '../../features/integrations/api/notionApi'
import { NotionLogoIcon } from '../integrations/NotionSettingsCard'
import { useAuthStore } from '../../features/auth/store/authStore'

export interface NotionExportModalProps {
  isOpen: boolean
  onClose: () => void
  documentTitle: string
  documentationId?: string
  markdownContent?: string
  onSuccess?: (pageUrl: string) => void
}

function NotionExportModalContent({
  onClose,
  documentTitle,
  documentationId,
  markdownContent,
  onSuccess,
}: Omit<NotionExportModalProps, 'isOpen'>) {
  const { user } = useAuthStore()
  const {
    isNotionConnected,
    notionPages,
    notionWorkspaceName,
    loadPages,
    exportToNotion,
  } = useNotionStore()

  const isDemo = Boolean(user?.isDemo)

  const [selectedPageId, setSelectedPageId] = useState<string>(
    notionPages[0]?.id || '',
  )
  const [customTitle, setCustomTitle] = useState<string>(
    documentTitle || 'Documentación Técnica',
  )
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<boolean>(false)

  useEffect(() => {
    if (isNotionConnected && !isDemo) {
      loadPages().catch(() => {})
    }
  }, [isNotionConnected, isDemo, loadPages])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExporting, onClose])

  const handleConnectNotion = async () => {
    if (isDemo || connecting) return
    try {
      setConnecting(true)
      const url = await notionApi.getAuthUrl()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('[Notion] Error al redirigir a autorización:', err)
      setExportError('No se pudo iniciar la conexión con Notion.')
      setConnecting(false)
    }
  }

  const handleConfirmExport = async (e: FormEvent) => {
    e.preventDefault()
    if (isExporting || isDemo) return

    const targetId = selectedPageId || (notionPages.length > 0 ? notionPages[0].id : '')
    if (!targetId) {
      setExportError('Por favor selecciona una página destino en Notion.')
      return
    }

    if (!documentationId) {
      setExportError('Identificador de documentación inválido.')
      return
    }

    setExportError(null)
    setExportSuccessUrl(null)
    setIsExporting(true)

    try {
      const result = await exportToNotion({
        documentationId,
        targetPageId: targetId,
        title: customTitle.trim() || documentTitle || 'Documentación CodeScribe',
      })

      if (result.success && result.url) {
        setExportSuccessUrl(result.url)
        if (onSuccess) {
          onSuccess(result.url)
        }
      } else {
        setExportError('Ocurrió un error al sincronizar con Notion.')
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) {
        setExportError('La sesión con Notion ha expirado. Por favor, vuelve a vincular tu cuenta.')
      } else if (status === 429) {
        setExportError('Límite de tasa de Notion alcanzado. Intenta de nuevo en unos momentos.')
      } else {
        setExportError(err?.response?.data?.message || err?.message || 'Error al exportar a Notion.')
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notion-export-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isExporting) onClose()
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Cerrar modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-2xs shrink-0">
            <NotionLogoIcon className="w-6 h-6" />
          </div>
          <div>
            <h2
              id="notion-export-modal-title"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              Exportar a Notion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crea una página con bloques nativos en tu espacio de trabajo de Notion.
            </p>
          </div>
        </div>

        {isDemo ? (
          <div className="my-6 p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-lg">🔒</span>
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-sm">Función restringida en modo demo</p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Para exportar documentos a Notion, por favor inicia sesión con tu cuenta de GitHub.
                </p>
              </div>
            </div>
          </div>
        ) : !isNotionConnected ? (
          <div className="my-6 p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-sm">
                  Espacio de Notion no conectado
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Para poder exportar esta documentación como bloques nativos, primero debes conectar tu cuenta de Notion.
                </p>
                <button
                  type="button"
                  onClick={handleConnectNotion}
                  disabled={connecting}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-900 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer mt-1"
                >
                  <NotionLogoIcon className="w-4 h-4" />
                  <span>{connecting ? 'Conectando...' : 'Conectar con Notion'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {exportSuccessUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ¡Exportación completada con éxito!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Tu documentación ha sido estructurada en bloques en Notion.
                </p>
                <a
                  href={exportSuccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline pt-1"
                >
                  <span>Abrir página en Notion</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {exportError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">❌ Error:</span>
              <span>{exportError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleConfirmExport} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="notion-target-page"
                className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Página destino en Notion
              </label>
              {notionWorkspaceName && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Espacio: {notionWorkspaceName}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                id="notion-target-page"
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                disabled={!isNotionConnected || isExporting || isDemo}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notionPages.length === 0 ? (
                  <option value="" disabled>
                    {isNotionConnected ? 'No se encontraron páginas compartidas' : 'Conecta Notion para ver páginas'}
                  </option>
                ) : (
                  notionPages.map((page) => (
                    <option
                      key={page.id}
                      value={page.id}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-1.5"
                    >
                      {page.icon ? `${page.icon} ` : '📄 '}
                      {page.title}
                    </option>
                  ))
                )}
              </select>

              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <svg
                  className="w-4 h-4 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              El contenido se anidará como una subpágina nueva dentro de la página elegida.
            </p>
          </div>

          <div>
            <label
              htmlFor="notion-doc-title"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Título final del documento
            </label>
            <input
              id="notion-doc-title"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={!isNotionConnected || isExporting || isDemo}
              placeholder="Ej. Guía de Arquitectura del Sistema"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>📝</span>
              <span>Formato: Bloques nativos enriquecidos</span>
            </span>
            <span className="font-mono text-[11px]">
              ~{Math.round((markdownContent?.length || 0) / 1024)} KB
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isNotionConnected || isExporting || isDemo || (!selectedPageId && notionPages.length === 0)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <NotionLogoIcon className="w-4 h-4" />
                  <span>Confirmar Exportación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function NotionExportModal(props: NotionExportModalProps) {
  if (!props.isOpen) return null

  return <NotionExportModalContent {...props} />
}
