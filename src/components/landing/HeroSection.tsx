import { ThemeToggle } from '../shared/ThemeToggle'

export interface HeroSectionProps {
  onGithubLogin?: () => void
  onDemoAccess?: () => void
  loadingDemo?: boolean
  githubOAuthUrl?: string
}

export function HeroSection({
  onGithubLogin,
  onDemoAccess,
  loadingDemo = false,
  githubOAuthUrl = import.meta.env.VITE_GITHUB_OAUTH_URL || 'http://localhost:3001/api/auth/github',
}: HeroSectionProps) {
  const handleGithubClick = () => {
    if (onGithubLogin) {
      onGithubLogin()
    } else {
      window.location.href = githubOAuthUrl
    }
  }

  return (
    <section className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Botón flotante para alternar tema */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Patrón SVG decorativo de cuadrícula fina y gradientes de profundidad adaptables */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* SVG Grid Pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-slate-900/[0.04] dark:stroke-white/[0.03] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-grid-pattern"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
              x="50%"
              y={-1}
            >
              <path d="M.5 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#hero-grid-pattern)" />
        </svg>

        {/* Gradiente radial superior suave */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-emerald-100/50 via-teal-100/30 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 blur-3xl rounded-full"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Pill Badge superior SaaS */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs mb-8 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide">
            Potenciado por Google Gemini 2.0 &amp; Modelos Flash
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.12]">
          Code
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
            Scribe AI
          </span>
        </h1>

        {/* Bajada / Subtítulo descriptivo */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Genera documentación técnica profesional, diagramas interactivos de arquitectura
          y análisis de módulos de tus repositorios de GitHub en segundos.
        </p>

        {/* Botones de acción con microinteracciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Botón Principal: Continuar con GitHub */}
          <button
            onClick={handleGithubClick}
            type="button"
            className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium rounded-xl text-base transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-emerald-900/40 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950 cursor-pointer"
          >
            {/* SVG Icono GitHub */}
            <svg
              className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continuar con GitHub</span>
          </button>

          {/* Botón Secundario: Modo Demo */}
          <button
            onClick={onDemoAccess}
            disabled={loadingDemo}
            type="button"
            className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium rounded-xl text-base border border-slate-200 dark:border-slate-800 transition-all duration-200 ease-out hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loadingDemo ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-600 dark:text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
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
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <span className="text-emerald-500 text-lg transition-transform duration-200 group-hover:scale-110">
                  ✨
                </span>
                <span>Modo Demo</span>
              </>
            )}
          </button>
        </div>

        {/* Leyenda aclaratoria inferior */}
        <p className="mt-8 text-xs text-slate-500 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
          Autentícate con tu cuenta de GitHub para analizar repositorios privados y públicos,
          o prueba el modo demostración interactivo al instante.
        </p>

        {/* Vista previa miniatura o Social Proof de Características */}
        <div className="mt-16 pt-10 border-t border-slate-200/70 dark:border-slate-800 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs transition-colors">
            <div className="text-emerald-600 dark:text-emerald-400 text-lg mb-1">⚡ Instantáneo</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Análisis de AST &amp; Código</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Desglose automático de arquitectura, controladores y flujos de datos.
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs transition-colors">
            <div className="text-teal-600 dark:text-teal-400 text-lg mb-1">📊 Diagramas</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Mermaid Integrado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualización gráfica de secuencia, entidades y componentes del sistema.
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs transition-colors">
            <div className="text-emerald-600 dark:text-emerald-400 text-lg mb-1">📄 Exportación</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Listo para Producción</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Copia como Markdown estándar o exporta directamente en formato PDF imprimible.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
