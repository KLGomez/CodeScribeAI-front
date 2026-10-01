import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { docApi } from '../features/documentation/api/docApi'
import type { Documentation } from '../types/doc.types'
import { DocumentationViewer } from '../components/documentation/DocumentationViewer'

const SAMPLE_DEMO_DOC: Documentation = {
  _id: 'demo',
  repoUrl: 'https://github.com/facebook/react',
  content: `# Documentación Técnica: React (Demo)

> Generado automáticamente por **CodeScribe AI** · [Ver Repositorio Original](https://github.com/facebook/react)

---

## 🎯 Resumen General del Proyecto

**React** es una biblioteca declarativa, eficiente y flexible de JavaScript para construir interfaces de usuario interactivas basadas en componentes.

Su modelo mental se enfoca en el flujo unidireccional de datos y en componentes puramente declarativos que reaccionan a cambios de estado.

---

## 🏛️ Arquitectura del Sistema

La estructura interna de React divide el ciclo de vida y la renderización en capas bien definidas:

1. **Reconciliation Engine (Fiber):** Motor de planificación de renderizado con capacidad de pausar, reanudar o abortar trabajo según prioridades de UI.
2. **Virtual DOM:** Representación en memoria de la UI que calcula las mutaciones mínimas necesarias sobre el DOM real.
3. **Hooks System:** Primitivas funcionales para desacoplar el estado y el ciclo de vida de los componentes visuales.

\`\`\`mermaid
flowchart TD
  A[Component State Mutation] --> B[Fiber Work Loop]
  B --> C{Reconciliation Phase}
  C -->|Diffing Virtual DOM| D[Commit Phase]
  D --> E[Host DOM Mutations]
  D --> F[Layout Effects]
\`\`\`

---

## 📦 Ejemplo de Integración

A continuación se muestra un componente funcional implementando métricas en tiempo real con hooks:

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
    <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
      <h3 className="font-bold text-emerald-400">Métricas en Vivo</h3>
      <div className="flex gap-2 mt-2">
        {data.map((val, idx) => (
          <span key={idx} className="bg-slate-800 px-2.5 py-1 rounded text-xs font-mono">
            {val}
          </span>
        ))}
      </div>
    </div>
  );
}
\`\`\`

---

## 📋 Análisis de Módulos Principales

Detalle de los paquetes que componen el repositorio de React:

| Módulo | Ruta | Propósito | Estado |
|---|---|---|---|
| **React Core** | \`packages/react\` | APIs universales (\`useState\`, \`useMemo\`, etc.) | Estable |
| **React Reconciler** | \`packages/react-reconciler\` | Algoritmo agnóstico de reconciliación | Núcleo |
| **React DOM** | \`packages/react-dom\` | Adaptador para navegadores y SSR | Producción |
| **Scheduler** | \`packages/scheduler\` | Programador de prioridades de tareas | Optimizado |
`,
  sections: ['Resumen General', 'Arquitectura', 'Ejemplo de Integración', 'Análisis de Módulos'],
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Cargando documentación...</span>
        </div>
      </div>
    )
  }

  if (isError || !doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center px-4">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm max-w-md">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-rose-600 font-semibold text-lg mb-2">
            No se pudo cargar la documentación
          </p>
          <p className="text-slate-500 text-sm mb-6">
            El identificador solicitado no existe o hubo un problema al obtener el contenido.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <DocumentationViewer doc={doc} />
}
