import { useState, useEffect, type FormEvent } from 'react'
import { useAuthStore } from '../features/auth/store/authStore'

export interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Contenido interno del modal montado únicamente cuando está abierto.
 * Esto asegura que el texto de confirmación y el estado de carga se reinicien limpios.
 */
function DeleteAccountModalContent({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuthStore()
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manejo de accesibilidad: tecla Escape y bloqueo de scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
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
  }, [isDeleting, onClose])

  const handleConfirmDelete = async (e: FormEvent) => {
    e.preventDefault()
    if (confirmationText !== 'ELIMINAR' || isDeleting) return

    try {
      setIsDeleting(true)
      setError(null)
      await deleteAccount()
      // Redirección al inicio limpiando todo el estado
      window.location.href = '/'
    } catch (err: any) {
      setIsDeleting(false)
      setError(
        err?.response?.data?.message ||
          'Ocurrió un error al intentar eliminar la cuenta. Por favor, intenta nuevamente.',
      )
    }
  }

  const isConfirmed = confirmationText === 'ELIMINAR'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
    >
      {/* Fondo oscurecido con desenfoque */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isDeleting) onClose()
        }}
        aria-hidden="true"
      />

      {/* Contenedor principal del modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Botón de cierre en esquina superior */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Cerrar modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Encabezado con Icono de Advertencia */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center shadow-2xs shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="delete-account-modal-title"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              Eliminar cuenta permanentemente
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
              Acción irreversible
            </p>
          </div>
        </div>

        {/* Advertencia severa */}
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-rose-950 dark:text-rose-100 mb-1">
            Esta acción no se puede deshacer.
          </p>
          <p className="text-rose-800 dark:text-rose-300">
            Se eliminarán permanentemente todos tus análisis, documentaciones exportadas y la conexión con Notion.
          </p>
        </div>

        {/* Error si ocurre alguno */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
            <span className="font-bold">❌ Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Confirmación */}
        <form onSubmit={handleConfirmDelete} className="space-y-5">
          <div>
            <label
              htmlFor="confirm-delete-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Para confirmar, escribe <span className="font-mono text-rose-600 dark:text-rose-400 font-extrabold select-all">ELIMINAR</span>:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isDeleting}
              placeholder="ELIMINAR"
              autoComplete="off"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40 disabled:hover:bg-rose-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
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
                  <span>Eliminando cuenta...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Eliminar definitivamente</span>
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
 * Modal accesible y centrado para la eliminación definitiva de la cuenta.
 */
export function DeleteAccountModal(props: DeleteAccountModalProps) {
  if (!props.isOpen) return null

  return <DeleteAccountModalContent {...props} />
}
