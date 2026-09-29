import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#16a34a',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#22c55e',
    lineColor: '#4ade80',
    secondaryColor: '#1f2937',
    tertiaryColor: '#111827',
    background: '#030712',
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
      <pre className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-400 overflow-x-auto">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      className="my-6 p-6 bg-gray-900/70 border border-gray-800 rounded-xl overflow-x-auto flex justify-center shadow-lg"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
