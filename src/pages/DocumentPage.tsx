import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { docApi } from '../features/documentation/api/docApi'

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ['documentation', id],
    queryFn: () => docApi.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center">
        <div>
          <p className="text-red-400 text-lg mb-4">
            No se pudo cargar la documentación.
          </p>
          <Link to="/dashboard" className="text-green-400 hover:underline">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-gray-950 z-10">
        <Link
          to="/dashboard"
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          ← Dashboard
        </Link>
        <span className="text-gray-600">·</span>
        <span className="text-gray-400 text-sm truncate">
          {doc?.repoUrl.replace('https://github.com/', '')}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert prose-green max-w-none prose-headings:font-bold prose-code:text-green-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc?.content ?? ''}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
