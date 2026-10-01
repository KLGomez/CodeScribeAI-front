import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#ecfdf5',
    primaryTextColor: '#0f172a',
    primaryBorderColor: '#10b981',
    lineColor: '#059669',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#ffffff',
    background: '#ffffff',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
})

interface MermaidViewerProps {
  chart: string
}

export function MermaidViewer({ chart }: MermaidViewerProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`

    mermaid
      .render(uniqueId, chart)
      .then(({ svg }) => {
        if (isMounted) {
          setSvg(svg)
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
  }, [chart])

  if (error || !svg) {
    return (
      <pre className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      className="my-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto flex justify-center shadow-2xs w-full transition-colors"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
