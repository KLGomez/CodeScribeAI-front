import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { docApi } from '../features/documentation/api/docApi'
import type { Documentation } from '../types/doc.types'
import { MermaidViewer } from '../components/shared/MermaidViewer'

const SAMPLE_DEMO_DOC: Documentation = {
  _id: 'demo',
  repoUrl: 'https://github.com/facebook/react',
  content: `# Documentación Técnica: React (Demo)

> Generado automáticamente por **CodeScribe AI** · [Ver Repositorio Original](https://github.com/facebook/react)

---

## 🎯 Overview del Proyecto

**React** es una biblioteca declarativa, eficiente y flexible de JavaScript para construir interfaces de usuario interactivas basadas en componentes.

### 🏛️ Arquitectura de Alto Nivel

1. **Reconciliation Engine (Fiber):** Motor de planificación de renderizado con capacidad de pausar, reanudar o abortar trabajo según prioridades de UI.
2. **Virtual DOM:** Representación en memoria de la UI que calcula las mutaciones mínimas necesarias sobre el DOM real.
3. **Hooks System:** Primitivas funcionales para desacoplar el estado y el ciclo de vida de los componentes visuales.

---

## 📦 Ejemplo de Integración

\`\`\`tsx
import React, { useState, useEffect } from 'react';

export function RealtimeMetrics() {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prev) => [...prev.slice(-10), Math.floor(Math.random() * 100)]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="font-bold text-green-400">Métricas en Vivo</h3>
      <div className="flex gap-2 mt-2">
        {data.map((val, idx) => (
          <span key={idx} className="bg-gray-800 px-2 py-1 rounded text-sm">
            {val}
          </span>
        ))}
      </div>
    </div>
  );
}
\`\`\`

---

## 📋 Módulos Principales

| Módulo | Ruta | Propósito |
|---|---|---|
| **React Core** | \`packages/react\` | APIs universales (\`useState\`, \`useMemo\`, etc.) |
| **React Reconciler** | \`packages/react-reconciler\` | Algoritmo agnóstico de reconciliación |
| **React DOM** | \`packages/react-dom\` | Adaptador para navegadores y SSR |
`,
  sections: ['Overview', 'Arquitectura', 'Ejemplo', 'Módulos'],
  tokensUsed: 1840,
  createdAt: new Date().toISOString(),
}

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()

  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ['documentation', id],
    queryFn: async () => {
      if (id === 'demo') {
        return SAMPLE_DEMO_DOC
      }
      return docApi.getById(id!)
    },
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            ← Volver al Dashboard
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-green-400 text-sm font-mono truncate">
            {doc?.repoUrl.replace('https://github.com/', '')}
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded border border-gray-700 transition-colors"
        >
          🖨️ Exportar / Imprimir
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert prose-green max-w-none prose-headings:font-bold prose-code:text-green-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const lang = match ? match[1] : ''
                const codeText = String(children).replace(/\n$/, '')

                if (lang === 'mermaid') {
                  return <MermaidViewer chart={codeText} />
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {doc?.content ?? ''}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
