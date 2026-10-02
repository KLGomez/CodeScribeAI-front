import { useState, useEffect, type FormEvent } from 'react'
import { useIntegrationStore } from '../../store/useIntegrationStore'
import { NotionLogoIcon } from '../integrations/NotionSettingsCard'

export interface NotionExportModalProps {
  /**
   * Determina si el modal está abierto o cerrado.
   */
  isOpen: boolean
  /**
   * Callback invocado para cerrar el modal.
   */
  onClose: () => void
  /**
   * Título base sugerido de la documentación a exportar.
   */
  documentTitle: string
  /**
   * Contenido técnico completo en Markdown que se transformará a bloques de Notion.
   */
  markdownContent: string
  /**
   * Callback opcional que recibe la URL generada al exportar exitosamente.
   */
  onSuccess?: (pageUrl: string) => void
}

/**
 * Contenido interno del modal montado únicamente cuando está abierto.
 * Esto garantiza que el estado local se inicialice fresco en cada apertura sin efectos secundarios.
 */
function NotionExportModalContent({
  onClose,
  documentTitle,
  markdownContent,
  onSuccess,
}: Omit<NotionExportModalProps, 'isOpen'>) {
  const {
    isNotionConnected,
    notionPages,
    notionWorkspaceName,
    isExporting,
    exportToNotion,
    setNotionConnected,
  } = useIntegrationStore()

  // Inicialización limpia y directa del estado sin efectos sincronizadores
  const [selectedPageId, setSelectedPageId] = useState<string>(
    notionPages[0]?.id || '',
  )
  const [customTitle, setCustomTitle] = useState<string>(
    documentTitle || 'Documentación Técnica',
  )
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // Manejo de accesibilidad: tecla Escape y bloqueo de scroll de la ventana
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

  // Acción de confirmación de exportación
  const handleConfirmExport = async (e: FormEvent) => {
    e.preventDefault()
    if (isExporting) return

    const targetId = selectedPageId || (notionPages.length > 0 ? notionPages[0].id : '')
    if (!targetId) {
      setExportError('Por favor selecciona una página destino en Notion.')
      return
    }

    setExportError(null)
    setExportSuccessUrl(null)

    const result = await exportToNotion({
      targetPageId: targetId,
      title: customTitle.trim() || documentTitle || 'Documentación CodeScribe',
      markdown: markdownContent,
    })

    if (result.success && result.url) {
      setExportSuccessUrl(result.url)
      if (onSuccess) {
        onSuccess(result.url)
      }
    } else {
      setExportError(result.error || 'Ocurrió un error al sincronizar con Notion.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notion-export-modal-title"
    >
      {/* Fondo oscurecido con desenfoque elegante */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isExporting) onClose()
        }}
        aria-hidden="true"
      />

      {/* Contenedor principal de la ventana modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Botón de cierre en esquina superior */}
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

        {/* Encabezado del Modal con Logo de Notion */}
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

        {/* Notificación si la integración con Notion no está activa */}
        {!isNotionConnected ? (
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
                  onClick={() => setNotionConnected(true, 'Engineering Wiki Space')}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-900 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer mt-1"
                >
                  <span>⚡ Conectar espacio ahora (Simulación)</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Alerta de Éxito al finalizar la exportación */}
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
                  Tu documentación ha sido creada y estructurada en bloques en Notion.
                </p>
                <a
                  href={exportSuccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline pt-1"
                >
                  <span>Abrir página en Notion</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Error si ocurre algún fallo */}
        {exportError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">❌ Error:</span>
              <span>{exportError}</span>
            </div>
          </div>
        )}

        {/* Formulario de Configuración de Destino y Título */}
        <form onSubmit={handleConfirmExport} className="space-y-5">
          {/* Selector de Página Destino de Notion */}
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
                disabled={!isNotionConnected || isExporting}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notionPages.length === 0 ? (
                  <option value="" disabled>
                    No se encontraron páginas en este espacio
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

              {/* Icono SVG personalizado de flecha hacia abajo */}
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

          {/* Input Opcional de Edición de Título Final */}
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
              disabled={!isNotionConnected || isExporting}
              placeholder="Ej. Guía de Arquitectura del Sistema"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Metadatos informativos rápidos */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>📝</span>
              <span>Formato: Bloques nativos enriquecidos</span>
            </span>
            <span className="font-mono text-[11px]">
              ~{Math.round((markdownContent?.length || 0) / 1024)} KB
            </span>
          </div>

          {/* Botones de Acción */}
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
              disabled={!isNotionConnected || isExporting || (!selectedPageId && notionPages.length === 0)}
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

/**
 * Modal accesible y centrado para la exportación de documentos Markdown hacia Notion.
 * Incluye selector de páginas destino, personalización de título y estados de carga luminosos.
 */
export function NotionExportModal(props: NotionExportModalProps) {
  if (!props.isOpen) return null

  return <NotionExportModalContent {...props} />
}
