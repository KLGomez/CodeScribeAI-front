import { useState } from 'react'
import { DeleteAccountModal } from './DeleteAccountModal'

export interface AccountSettingsCardProps {
  className?: string
}

/**
 * Tarjeta de Configuración de la Cuenta - Zona de Peligro
 * Permite al usuario autenticado iniciar el proceso de eliminación definitiva de su cuenta.
 */
export function AccountSettingsCard({ className = '' }: AccountSettingsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className={`bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Lado izquierdo: Icono de advertencia, Título y Descripción */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center shrink-0 shadow-2xs">
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

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Zona de Peligro
                </h3>
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/60">
                  Irreversible
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Elimina tu cuenta y todos los datos asociados de forma permanente.
              </p>
            </div>
          </div>

          {/* Lado derecho: Botón para abrir modal de eliminación */}
          <div className="flex items-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-100 dark:border-rose-950/40">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-white dark:bg-slate-900 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-700 px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer shadow-3xs hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              aria-label="Abrir modal para eliminar cuenta permanentemente"
            >
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
              <span>Eliminar Cuenta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación Estricta */}
      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
