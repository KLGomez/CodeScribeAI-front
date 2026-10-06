import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
        <span className="text-6xl font-black text-slate-300 dark:text-slate-700 block mb-3 font-mono">
          404
        </span>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Página no encontrada</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          La ruta a la que intentas acceder no existe, ha sido movida o la documentación fue eliminada.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Volver a Mis Documentaciones
          </Link>
        </div>
      </div>
    </div>
  )
}
