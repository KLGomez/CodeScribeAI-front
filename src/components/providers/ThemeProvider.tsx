import { useEffect, type ReactNode } from 'react'
import { useThemeStore, applyTheme } from '../../features/theme/store/useThemeStore'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    // Aplicar el tema inicial o al cambiar de modo
    applyTheme(theme)

    // Si el modo es 'system', escuchar cambios dinámicos del sistema operativo
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [theme])

  return <>{children}</>
}
