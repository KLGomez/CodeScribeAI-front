import { GithubLoginButton } from '../features/auth/components/GithubLoginButton'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-2xl">
        <div className="mb-6 text-6xl">📄</div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Code<span className="text-green-400">Scribe</span> AI
        </h1>
        <p className="text-gray-400 text-xl mb-10 leading-relaxed">
          Genera documentación técnica profesional de tus repositorios GitHub
          en segundos, impulsado por{' '}
          <span className="text-green-400 font-medium">Google Gemini</span>.
        </p>
        <GithubLoginButton />
        <p className="mt-6 text-xs text-gray-600">
          Solo se solicitan permisos de lectura sobre repositorios públicos.
        </p>
      </div>
    </div>
  )
}
