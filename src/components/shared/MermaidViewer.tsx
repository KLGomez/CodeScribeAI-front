import { useEffect, useState } from 'react'
import mermaid from 'mermaid'
import DOMPurify from 'dompurify'
import { useThemeStore } from '../../features/theme/store/useThemeStore'

interface MermaidViewerProps {
  chart: string
}

export function MermaidViewer({ chart }: MermaidViewerProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    let isMounted = true
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Configuración con htmlLabels: false para generar elementos <text> SVG nativos
    // que DOMPurify conserva sin eliminar las etiquetas de texto
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      flowchart: {
        htmlLabels: false,
        useMaxWidth: true,
        curve: 'basis',
      },
      sequence: {
        useMaxWidth: true,
      },
      theme: isDark ? 'dark' : 'base',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: 'transparent',
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#10b981',
            lineColor: '#34d399',
            secondaryColor: '#334155',
            secondaryTextColor: '#f1f5f9',
            secondaryBorderColor: '#64748b',
            tertiaryColor: '#0f172a',
            tertiaryTextColor: '#94a3b8',
            mainBkg: '#1e293b',
            nodeBorder: '#10b981',
            nodeTextColor: '#f8fafc',
            clusterBkg: '#0f172a',
            clusterBorder: '#334155',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#0f172a',
          }
        : {
            darkMode: false,
            background: 'transparent',
            primaryColor: '#ecfdf5',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#10b981',
            lineColor: '#059669',
            secondaryColor: '#f8fafc',
            secondaryTextColor: '#0f172a',
            secondaryBorderColor: '#cbd5e1',
            tertiaryColor: '#ffffff',
            tertiaryTextColor: '#334155',
            mainBkg: '#ecfdf5',
            nodeBorder: '#10b981',
            nodeTextColor: '#0f172a',
            clusterBkg: '#f8fafc',
            clusterBorder: '#cbd5e1',
            titleColor: '#0f172a',
            edgeLabelBackground: '#ffffff',
          },
    })

    const cleanChart = chart.trim()

    mermaid
      .render(uniqueId, cleanChart)
      .then(({ svg }) => {
        if (isMounted) {
          const sanitizedSvg = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['foreignObject', 'foreignobject', 'style'],
            ADD_ATTR: ['dominant-baseline', 'text-anchor', 'transform'],
          })
          setSvg(sanitizedSvg)
          setError(false)
        }
      })
      .catch((err) => {
        console.warn('Mermaid rendering fallback:', err)
        if (isMounted) setError(true)
      })

    return () => {
      isMounted = false
    }
  }, [chart, theme])

  if (error || !svg) {
    return (
      <pre className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      className="my-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto flex justify-center shadow-2xs w-full transition-colors [&_.node_text]:fill-slate-900 dark:[&_.node_text]:fill-slate-100 [&_.nodeLabel]:fill-slate-900 dark:[&_.nodeLabel]:fill-slate-100 [&_.edgeLabel]:fill-slate-700 dark:[&_.edgeLabel]:fill-slate-300"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
