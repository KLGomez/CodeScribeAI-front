import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Política de Privacidad y Seguridad</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Última actualización: Octubre 2026 · CodeScribe AI
            </p>
          </div>
          <Link
            to="/"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              1. Principio de Mínimo Privilegio
            </h2>
            <p>
              CodeScribe AI solicita acceso a GitHub únicamente para leer repositorios públicos o aquellos en los que el usuario autorice expresamente. 
              <strong> Nunca</strong> solicitamos permisos de escritura, administración ni modificación en tus repositorios ni organizaciones.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              2. Tratamiento y Cifrado de Credenciales
            </h2>
            <p>
              Tus tokens de acceso de GitHub y Notion se procesan de la siguiente manera:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Cifrado en reposo:</strong> Se cifran mediante el algoritmo estándar de la industria <code>AES-256-GCM</code> con un vector de inicialización único y autenticación criptográfica.
              </li>
              <li>
                <strong>Exclusión en consultas:</strong> Las credenciales no se incluyen en consultas estándar de base de datos ni se exponen jamás al navegador del usuario.
              </li>
              <li>
                <strong>Sanitización de logs:</strong> Los tokens se enmascaran en memoria y nunca se imprimen en logs del sistema ni tracebacks.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              3. Procesamiento de Código e Inteligencia Artificial
            </h2>
            <p>
              El código fuente recopilado de tu repositorio se envía al modelo Google Gemini a través de su API empresarial.
              De acuerdo con las políticas de Google Cloud y Gemini API, el código enviado mediante peticiones de API <strong>no se utiliza para entrenar modelos base</strong> ni se retiene más allá de la ventana requerida para generar la documentación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              4. Modo Demo y Sesiones Efímeras
            </h2>
            <p>
              Cuando accedes a CodeScribe AI a través del modo demo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Se crea una sesión y usuario efímero único con identificador aleatorio.</li>
              <li>No compartes datos con otros visitantes ni tienes acceso a repositorios ajenos.</li>
              <li>
                Todos los datos generados (trabajos, repositorios y documentaciones) cuentan con un índice TTL automático que <strong>los elimina definitivamente a las 24 horas</strong>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              5. Integración con Notion
            </h2>
            <p>
              La integración con Notion utiliza el flujo estándar de OAuth público de Notion. Solo accedemos a las páginas que tú compartes explícitamente con la aplicación al momento de la autorización. Puedes desconectar y revocar la integración en cualquier instante desde la tarjeta de configuración.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              6. Eliminación Definitiva de Datos
            </h2>
            <p>
              Tienes el derecho de eliminar cualquier documento o tu cuenta completa en cualquier momento desde la interfaz. La eliminación elimina de forma inmediata e irreversible tus registros y tokens asociados en nuestra base de datos.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
