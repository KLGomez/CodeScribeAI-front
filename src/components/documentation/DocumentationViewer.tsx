import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MermaidViewer } from '../shared/MermaidViewer'
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
  cleanTitle: string
  icon: string
  content: string
}

function cleanSectionTitle(rawTitle: string): string {
  return rawTitle.replace(/`([^`]+)`/g, '$1').trim()
}

/**
 * Extrae un icono/emoji representativo y el título limpio para el menú lateral tipo árbol.
 */
function extractIconAndTitle(rawTitle: string): { icon: string; title: string } {
  const cleaned = cleanSectionTitle(rawTitle)
  // Detecta emojis comunes al inicio del título
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*(.*)$/u
  const match = cleaned.match(emojiRegex)
  if (match) {
    return { icon: match[1], title: match[2].trim() }
  }
  return { icon: '📄', title: cleaned }
}

/**
 * Descompone el markdown completo en bloques de secciones basados en encabezados de nivel 2 (##)
 * manteniendo la estructura unificada y enriquecida para navegación tipo IDE.
 */
function parseMarkdownToSections(rawMarkdown: string): SectionBlock[] {
  if (!rawMarkdown) return []

  const lines = rawMarkdown.split('\n')
  const sections: SectionBlock[] = []
  let currentTitle = 'Visión General'
  let currentLines: string[] = []
  let sectionIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      const prevContent = currentLines.join('\n').trim()
      if (prevContent.length > 0) {
        const { icon, title: cleanT } = extractIconAndTitle(currentTitle)
        sections.push({
          id: `section-${sectionIndex}`,
          title: currentTitle,
          cleanTitle: cleanT,
          icon,
          content: prevContent,
        })
        sectionIndex++
      }

      currentTitle = cleanSectionTitle(line.replace(/^##\s+/, '').trim())
      currentLines = [line]
    } else {
      currentLines.push(line)
    }
  }

  const remaining = currentLines.join('\n').trim()
  if (remaining.length > 0) {
    const { icon, title: cleanT } = extractIconAndTitle(currentTitle)
    sections.push({
      id: `section-${sectionIndex}`,
      title: currentTitle,
      cleanTitle: cleanT,
      icon,
      content: remaining,
    })
  }

  if (sections.length === 0 && rawMarkdown.trim().length > 0) {
    return [
      {
        id: 'section-0',
        title: 'Documentación General',
        cleanTitle: 'Documentación General',
        icon: '📄',
        content: rawMarkdown.trim(),
      },
    ]
  }

  return sections
}

/**
 * Bloque de código estilizado con temática oscura de IDE y botón interactivo de copiado.
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
    <div className="my-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/70 shadow-2xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shadow-3xs">
            {language || 'código'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-emerald-300 font-semibold">Copiado</span>
            </>
          ) : (
            <>
              <span className="text-slate-400">📋</span>
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm font-mono text-slate-200 bg-slate-950/50 leading-relaxed selection:bg-emerald-950/60 selection:text-emerald-200">
        <code>{value}</code>
      </pre>
    </div>
  )
}

/**
 * Componente Principal del Visor de Documentación con estructura de columnas tipo IDE de la Demo.
 */
export function DocumentationViewer({
  doc,
}: DocumentationViewerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>('all')
  const [filterText, setFilterText] = useState('')
  const [copied, setCopied] = useState(false)
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false)

  const sections = useMemo(() => {
    return parseMarkdownToSections(doc.content)
  }, [doc.content])

  const repoCleanName = useMemo(() => {
    if (!doc.repoUrl) return ''
    return doc.repoUrl.replace('https://github.com/', '')
  }, [doc.repoUrl])

  // Filtrado reactivo de secciones para búsqueda en el TOC
  const filteredSections = useMemo(() => {
    if (!filterText.trim()) return sections
    const term = filterText.toLowerCase()
    return sections.filter((s) => s.title.toLowerCase().includes(term))
  }, [sections, filterText])

  // Contenido y título dinámicos según la sección activa seleccionada
  const { activeTitle, activeContent } = useMemo(() => {
    if (activeSectionId === 'all') {
      return {
        activeTitle: 'Documento Completo',
        activeContent: doc.content,
      }
    }
    const current = sections.find((s) => s.id === activeSectionId)
    if (current) {
      return {
        activeTitle: current.title,
        activeContent: current.content,
      }
    }
    return {
      activeTitle: 'Documento Completo',
      activeContent: doc.content,
    }
  }, [activeSectionId, sections, doc.content])

  // Copiar Markdown al portapapeles
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(activeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Descargar archivo .md de la sección o documento
  const handleDownloadMarkdown = () => {
    const baseName = repoCleanName ? repoCleanName.replace(/[/\\]/g, '-') : 'documentacion'
    const fileName =
      activeSectionId === 'all'
        ? `${baseName}-tecnica.md`
        : `${baseName}-${cleanSectionTitle(activeTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`

    const blob = new Blob([activeContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  // Exportar / Imprimir PDF nativo
  const handleExportPdf = () => {
    window.print()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Columna Izquierda (Índice / TOC - 4 columnas) */}
      <aside className="lg:col-span-4 bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 lg:sticky lg:top-24">
        {/* Encabezado del TOC con estilo de Estructura de Archivos */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>🌲</span>
              <span>Estructura de Secciones</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Navega por los módulos y temas del documento
            </p>
          </div>

          <div
            className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-mono"
            title="Total de secciones generadas"
          >
            {sections.length} secciones
          </div>
        </div>

        {/* Input de búsqueda / filtro de secciones */}
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar temas o secciones..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lista interactiva de secciones con indicador de item activo */}
        <div className="overflow-y-auto max-h-[460px] pr-1 py-1 space-y-1">
          <ul className="space-y-1">
            {/* Elemento raíz: Documento Completo */}
            <li>
              <button
                type="button"
                onClick={() => setActiveSectionId('all')}
                className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  activeSectionId === 'all'
                    ? 'border-l-2 border-emerald-500 text-emerald-400 bg-emerald-950/20 font-semibold'
                    : 'border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">📑</span>
                  <span className="truncate">Documento Completo</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                    activeSectionId === 'all'
                      ? 'bg-emerald-900/60 text-emerald-300 font-semibold'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  Todo
                </span>
              </button>
            </li>

            {/* Separador sutil */}
            <li className="border-t border-slate-800/80 my-1.5" aria-hidden="true" />

            {/* Mapeo de secciones individuales */}
            {filteredSections.map((section, idx) => {
              const isActive = activeSectionId === section.id
              const { icon, title } = extractIconAndTitle(section.title)
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'border-l-2 border-emerald-500 text-emerald-400 bg-emerald-950/20 font-semibold'
                        : 'border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{icon}</span>
                      <span className="truncate">{title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                        isActive
                          ? 'bg-emerald-900/60 text-emerald-300 font-semibold'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Resumen inferior con barra de progreso de lectura */}
        <div className="pt-3 border-t border-slate-800 bg-slate-950/50 -mx-4 -mb-4 p-4 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Enfoque actual:</span>
            <span className="font-semibold text-white truncate max-w-[170px]">
              {activeSectionId === 'all'
                ? 'Documento Completo'
                : sections.find((s) => s.id === activeSectionId)?.title || 'Sección'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  activeSectionId === 'all'
                    ? 100
                    : sections.length > 0
                    ? Math.round(
                        ((sections.findIndex((s) => s.id === activeSectionId) + 1) /
                          sections.length) *
                          100,
                      )
                    : 100
                }%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>💡</span>
            <span>Haz clic en cada sección para aislarla o mantén el documento completo.</span>
          </p>
        </div>
      </aside>

      {/* Columna Derecha (Contenido Principal - 8 columnas) */}
      <div className="lg:col-span-8 flex flex-col">
        {/* Barra de Acciones Superior */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-3 sm:px-4 rounded-t-2xl border border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Sección Activa:
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-100 truncate bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
              {activeTitle}
            </span>
          </div>

          {/* Botones de Exportación */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
              title="Copiar texto Markdown al portapapeles"
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? '¡Copiado!' : 'Copiar Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
              title="Descargar archivo en formato .md"
            >
              <span>💾</span>
              <span>Descargar .md</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
              title="Exportar a PDF o imprimir"
            >
              <span>📑</span>
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNotionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer shrink-0"
              title="Exportar documentación técnica a bloques nativos de Notion"
            >
              <NotionLogoIcon className="w-3.5 h-3.5" />
              <span>Exportar a Notion</span>
            </button>
          </div>
        </div>

        {/* Contenedor del Markdown Unificado (Editor/IDE) */}
        <div className="border-x border-b border-slate-800 rounded-b-2xl bg-slate-950/50 p-6 sm:p-8">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-2xl font-extrabold text-white tracking-tight pb-3 mb-6 border-b border-slate-800"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-100 mt-6 mb-3 flex items-center gap-2 border-b border-slate-800/60 pb-2"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-base font-semibold text-slate-200 mt-4 mb-2"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p className="text-slate-300 leading-relaxed my-3" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-5 space-y-1.5 my-3 text-slate-300" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-5 space-y-1.5 my-3 text-slate-300" {...props} />
                ),
                li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                strong: ({ ...props }) => (
                  <strong className="font-semibold text-slate-100" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-emerald-500 bg-slate-900/60 pl-4 py-2.5 pr-4 my-4 rounded-r-xl text-slate-300 italic not-italic:font-normal"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-6 border border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-sm" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-200" {...props} />
                ),
                th: ({ ...props }) => (
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-slate-300" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="px-4 py-3 border-b border-slate-800/60 text-slate-300 text-sm" {...props} />
                ),
                hr: () => <hr className="my-6 border-slate-800" />,
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const lang = match ? match[1] : ''
                  const codeText = String(children).replace(/\n$/, '')

                  if (lang === 'mermaid') {
                    return (
                      <div className="my-6 p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-center overflow-x-auto">
                        <MermaidViewer chart={codeText} />
                      </div>
                    )
                  }

                  if (inline) {
                    return (
                      <code
                        className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded text-[13px] font-mono border border-slate-700/60"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }

                  return <CodeBlock language={lang} value={codeText} />
                },
              }}
            >
              {activeContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Modal para exportación nativa a Notion */}
      <NotionExportModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        documentTitle={
          repoCleanName
            ? `Documentación: ${repoCleanName}${activeSectionId !== 'all' ? ` - ${activeTitle}` : ''}`
            : activeTitle
        }
        markdownContent={activeSectionId === 'all' ? doc.content : activeContent}
      />
    </div>
  )
}
