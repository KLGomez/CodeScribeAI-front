import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

/**
 * Aplica o remueve la clase `.dark` en document.documentElement (<html>)
 * basándose en la preferencia seleccionada y la configuración del sistema.
 */
export function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldBeDark = theme === 'dark' || (theme === 'system' && systemPrefersDark)

  if (shouldBeDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme: ThemeMode) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'codescribe-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    },
  ),
)
