import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MermaidViewer } from '../shared/MermaidViewer'
import { ThemeToggle } from '../shared/ThemeToggle'
import { NotionLogoIcon } from '../integrations/NotionSettingsCard'
import { NotionExportModal } from './NotionExportModal'
import type { Documentation } from '../../types/doc.types'

export interface DocumentationViewerProps {
  doc: Documentation
  onBackUrl?: string
}

interface SectionBlock {
  id: string
  title: string
  content: string
}

function cleanSectionTitle(rawTitle: string): string {
  return rawTitle.replace(/`([^`]+)`/g, '$1').trim()
}

/**
 * Función utilitaria para descomponer el markdown completo en bloques de secciones
 * basados en encabezados de nivel 2 (##) para distribuirlos en tarjetas independientes.
 */
function parseMarkdownToSections(rawMarkdown: string): SectionBlock[] {
  if (!rawMarkdown) return []

  const lines = rawMarkdown.split('\n')
  const sections: SectionBlock[] = []
  let currentTitle = 'Resumen Inicial'
  let currentLines: string[] = []
  let sectionIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      const previousContent = currentLines.join('\n').trim()
      if (previousContent.length > 0) {
        sections.push({
          id: `section-${sectionIndex}`,
          title: currentTitle,
          content: previousContent,
        })
        sectionIndex++
      }

      currentTitle = cleanSectionTitle(line.replace(/^##\s+/, '').trim())
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }

  const remainingContent = currentLines.join('\n').trim()
  if (remainingContent.length > 0) {
    sections.push({
      id: `section-${sectionIndex}`,
      title: currentTitle,
      content: remainingContent,
    })
  }

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
 * Componente interno para renderizar bloques de código luminosos y adaptables a dark mode
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
    <div className="my-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 shadow-2xs transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80 dark:bg-slate-700" />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700 shadow-3xs">
            {language || 'código'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copiado</span>
            </>
          ) : (
            <>
              <span className="text-slate-400">📋</span>
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50/60 dark:bg-slate-950/50 leading-relaxed selection:bg-emerald-100 dark:selection:bg-emerald-950/60 selection:text-slate-900 dark:selection:text-emerald-200">
        <code>{value}</code>
      </pre>
    </div>
  )
}

/**
 * Tarjeta individual blanca/oscura para cada bloque de la documentación
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
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mb-8"
    >
      {/* Encabezado de la Tarjeta */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-200/60 dark:border-emerald-800/50">
            {index + 1}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {section.title}
          </h2>
        </div>
        <button
          onClick={handleCopySection}
          type="button"
          title="Copiar contenido de esta sección"
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          {copied ? '✓ Copiado' : 'Copiar sección'}
        </button>
      </div>

      {/* Cuerpo de la Tarjeta: Tipografía adaptada para light y dark mode */}
      <div className="p-6 sm:p-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-base last:mb-0">
                {children}
              </p>
            ),
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 mt-6 first:mt-0 tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 mt-5 first:mt-0 tracking-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-4 first:mt-0">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-3">
                {children}
              </h4>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-6 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-6 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-700 dark:text-slate-300 marker:text-emerald-500">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {children}
              </strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 bg-slate-50 dark:bg-slate-950/50 pl-4 py-3 pr-4 my-4 rounded-r-xl text-slate-700 dark:text-slate-300 italic border-y-0 border-r-0">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 text-sm">
                {children}
              </td>
            ),
            hr: () => <hr className="my-6 border-slate-200 dark:border-slate-800" />,
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              const lang = match ? match[1] : ''
              const codeText = String(children).replace(/\n$/, '')

              if (lang === 'mermaid') {
                return (
                  <div className="my-6 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center overflow-x-auto">
                    <MermaidViewer chart={codeText} />
                  </div>
                )
              }

              if (match || codeText.includes('\n')) {
                return <CodeBlock language={lang} value={codeText} />
              }

              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-700 font-mono text-xs px-1.5 py-0.5 rounded font-medium"
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
 * Componente Principal del Visor de Documentación con soporte Dark Mode
 */
export function DocumentationViewer({
  doc,
  onBackUrl = '/dashboard',
}: DocumentationViewerProps) {
  const [copiedAll, setCopiedAll] = useState(false)
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false)

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Header Sticky Superior */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={onBackUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-transparent dark:border-slate-800"
            >
              <span>←</span>
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Repositorio:</span>
              <a
                href={doc.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-xs"
              >
                {repoCleanName}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Theme Toggle en Header de Documentación */}
            <ThemeToggle />

            {doc.tokensUsed ? (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                <span>⚡</span>
                <span>{doc.tokensUsed.toLocaleString()} tokens</span>
              </span>
            ) : null}

            <button
              onClick={handleCopyAll}
              type="button"
              className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3.5 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              {copiedAll ? '✓ Copiado al portapapeles' : '📋 Copiar Markdown'}
            </button>

            <button
              onClick={() => setIsNotionModalOpen(true)}
              type="button"
              title="Exportar documentación a bloques nativos de Notion"
              className="text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3.5 py-2 rounded-xl shadow-2xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
            >
              <NotionLogoIcon className="w-3.5 h-3.5" />
              <span>Exportar a Notion</span>
            </button>

            <button
              onClick={() => window.print()}
              type="button"
              className="text-xs font-medium text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 px-3.5 py-2 rounded-xl shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              🖨️ Exportar / Imprimir
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Navegación lateral sticky + Tarjetas de Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navegación rápida (TOC) */}
          <aside className="lg:col-span-3 sticky top-24 hidden lg:block">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Secciones del Documento
              </h3>
              <nav className="space-y-1">
                {sections.map((section, idx) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 px-3 py-2 rounded-lg transition-colors"
                  >
                    <span className="truncate">{section.title}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 font-mono">
                      #{idx + 1}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Tarjetas de Contenido */}
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

      {/* Modal de Exportación a Notion */}
      <NotionExportModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        documentTitle={repoCleanName ? `Documentación: ${repoCleanName}` : 'Documentación Técnica'}
        markdownContent={doc.content}
      />
    </div>
  )
}
