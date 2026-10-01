import { type ReactNode } from 'react'
import { useThemeStore, type ThemeMode } from '../../features/theme/store/useThemeStore'

interface ThemeToggleProps {
  /**
   * 'segmented': muestra los 3 iconos (Sol, Luna, Sistema) en una píldora compacta.
   * 'cycle': un solo botón que cicla entre los 3 modos al hacer clic.
   */
  variant?: 'segmented' | 'cycle'
  className?: string
}

export function ThemeToggle({ variant = 'segmented', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore()

  const modes: { mode: ThemeMode; label: string; icon: ReactNode }[] = [
    {
      mode: 'light',
      label: 'Modo Claro',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      mode: 'dark',
      label: 'Modo Oscuro',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
    {
      mode: 'system',
      label: 'Tema del Sistema',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ]

  if (variant === 'cycle') {
    const nextModeMap: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    }

    const currentModeObj = modes.find((m) => m.mode === theme) || modes[0]

    return (
      <button
        onClick={() => setTheme(nextModeMap[theme])}
        type="button"
        title={`Tema actual: ${currentModeObj.label}. Clic para cambiar.`}
        className={`inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${className}`}
      >
        <span className="transition-transform duration-200 hover:rotate-12">
          {currentModeObj.icon}
        </span>
      </button>
    )
  }

  // Segmented control por defecto (3 opciones elegantes)
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs backdrop-blur-xs ${className}`}
      role="group"
      aria-label="Selector de Tema Visual"
    >
      {modes.map(({ mode, label, icon }) => {
        const isActive = theme === mode

        return (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            type="button"
            title={label}
            aria-pressed={isActive}
            className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs transition-all duration-200 ease-out cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60 scale-100 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="transition-transform duration-200 hover:scale-110">
              {icon}
            </span>
          </button>
        )
      })}
    </div>
  )
}
