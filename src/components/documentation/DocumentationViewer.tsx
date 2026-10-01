import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MermaidViewer } from '../shared/MermaidViewer'
import type { Documentation } from '../../types/doc.types'

export interface DocumentationViewerProps {
  doc: Documentation
  onBackUrl?: string
}

interface SectionBlock {
  id: string
  title: string
  icon?: string
  content: string
}

/**
 * Función utilitaria para descomponer el markdown completo en bloques de secciones
 * basados en encabezados de nivel 2 (##) para distribuirlos en tarjetas independientes.
 */
function parseMarkdownToSections(rawMarkdown: string): SectionBlock[] {
  if (!rawMarkdown) return []

  // Dividir por líneas para encontrar encabezados de nivel 2 '## '
  const lines = rawMarkdown.split('\n')
  const sections: SectionBlock[] = []
  let currentTitle = 'Resumen Inicial'
  let currentLines: string[] = []
  let sectionIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      // Guardar sección previa si tiene contenido
      const previousContent = currentLines.join('\n').trim()
      if (previousContent.length > 0) {
        sections.push({
          id: `section-${sectionIndex}`,
          title: currentTitle,
          content: previousContent,
        })
        sectionIndex++
      }

      currentTitle = line.replace(/^##\s+/, '').trim()
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }

  // Agregar la última sección
  const remainingContent = currentLines.join('\n').trim()
  if (remainingContent.length > 0) {
    sections.push({
      id: `section-${sectionIndex}`,
      title: currentTitle,
      content: remainingContent,
    })
  }

  // Fallback si no hubo ningún '## '
  if (sections.length === 0 && rawMarkdown.trim().length > 0) {
    return [
      {
        id: 'section-0',
        title: 'Documentación General',
        content: rawMarkdown.trim(),
      },
    ]
  }

  return sections
}

/**
 * Componente interno para renderizar bloques de código con botón de copiado
 */
function CodeBlock({
  language,
  value,
}: {
  language?: string
  value: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-slate-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800"
        >
          {copied ? '✓ Copiado' : 'Copiar código'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  )
}

/**
 * Componente de Tarjeta individual de Documentación
 */
function DocumentationCard({
  section,
  index,
}: {
  section: SectionBlock
  index: number
}) {
  const [copied, setCopied] = useState(false)

  const handleCopySection = () => {
    navigator.clipboard.writeText(section.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      id={section.id}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mb-8"
    >
      {/* Encabezado de la Tarjeta */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-semibold text-xs border border-emerald-200/60">
            {index + 1}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {section.title}
          </h2>
        </div>
        <button
          onClick={handleCopySection}
          type="button"
          title="Copiar contenido de esta sección"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          {copied ? '✓ Copiado' : 'Copiar sección'}
        </button>
      </div>

      {/* Cuerpo de la Tarjeta con renderizado de Markdown accesible y legible */}
      <div className="p-6 sm:p-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Párrafos claros y confortables para lectura
            p: ({ children }) => (
              <p className="text-slate-700 leading-relaxed mb-4 text-base last:mb-0">
                {children}
              </p>
            ),
            // Encabezados con jerarquía visual y contraste
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-slate-900 mb-4 mt-6 first:mt-0 tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-slate-900 mb-3 mt-5 first:mt-0 tracking-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-4 first:mt-0">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-slate-900 mb-2 mt-3">
                {children}
              </h4>
            ),
            // Listas ordenadas y desordenadas
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-6 space-y-1.5 mb-4 text-slate-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-6 space-y-1.5 mb-4 text-slate-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-700 marker:text-emerald-500">
                {children}
              </li>
            ),
            // Texto en negrita y enlaces
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">
                {children}
              </strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            // Citas o llamadas de atención
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 bg-slate-50 pl-4 py-3 pr-4 my-4 rounded-r-xl text-slate-700 italic border-y-0 border-r-0">
                {children}
              </blockquote>
            ),
            // Tablas con estilo tabular limpio
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-50 border-b border-slate-200">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 font-semibold text-slate-900 text-xs uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-slate-100 text-slate-700 text-sm">
                {children}
              </td>
            ),
            hr: () => <hr className="my-6 border-slate-200" />,
            // Código (inline, bloques o diagramas Mermaid)
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              const lang = match ? match[1] : ''
              const codeText = String(children).replace(/\n$/, '')

              if (lang === 'mermaid') {
                return (
                  <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-center overflow-x-auto">
                    <MermaidViewer chart={codeText} />
                  </div>
                )
              }

              // Si es un bloque de código multilinea
              if (match || codeText.includes('\n')) {
                return <CodeBlock language={lang} value={codeText} />
              }

              // Código inline
              return (
                <code
                  className="bg-slate-100 text-emerald-700 border border-slate-200/80 font-mono text-xs px-1.5 py-0.5 rounded font-medium"
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
        >
          {section.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

/**
 * Componente Principal del Visor de Documentación (Layout Moderno SaaS)
 */
export function DocumentationViewer({
  doc,
  onBackUrl = '/dashboard',
}: DocumentationViewerProps) {
  const [copiedAll, setCopiedAll] = useState(false)

  // Descomponer el Markdown en tarjetas lógicas
  const sections = useMemo(() => {
    return parseMarkdownToSections(doc.content)
  }, [doc.content])

  const repoCleanName = useMemo(() => {
    return doc.repoUrl.replace('https://github.com/', '')
  }, [doc.repoUrl])

  const handleCopyAll = () => {
    navigator.clipboard.writeText(doc.content)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Barra de navegación superior fija (Header) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={onBackUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Repositorio:</span>
              <a
                href={doc.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-mono font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate max-w-xs"
              >
                {repoCleanName}
              </a>
            </div>
          </div>

          {/* Acciones y Metadatos de la Documentación */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {doc.tokensUsed ? (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                <span>⚡</span>
                <span>{doc.tokensUsed.toLocaleString()} tokens</span>
              </span>
            ) : null}

            <button
              onClick={handleCopyAll}
              type="button"
              className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              {copiedAll ? '✓ Copiado al portapapeles' : '📋 Copiar Markdown'}
            </button>

            <button
              onClick={() => window.print()}
              type="button"
              className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              🖨️ Exportar / Imprimir
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal de Contenido con Grid y Sistema de Tarjetas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navegación lateral rápida (Índice de Secciones Sticky) */}
          <aside className="lg:col-span-3 sticky top-24 hidden lg:block">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Secciones del Documento
              </h3>
              <nav className="space-y-1">
                {sections.map((section, idx) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-between text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/60 px-3 py-2 rounded-lg transition-colors"
                  >
                    <span className="truncate">{section.title}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 font-mono">
                      #{idx + 1}
                    </span>
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Documentación generada por <strong className="text-slate-600 font-medium">CodeScribe AI</strong>
              </div>
            </div>
          </aside>

          {/* Columna Principal: Tarjetas de Contenido */}
          <div className="lg:col-span-9 space-y-6">
            {sections.map((section, index) => (
              <DocumentationCard
                key={section.id}
                section={section}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
