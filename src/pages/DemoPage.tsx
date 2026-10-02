import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThemeToggle } from '../components/shared/ThemeToggle'
import {
  DEMO_FILE_TREE,
  DEMO_MARKDOWN_CONTENT,
  type DemoFileItem,
} from '../features/demo/data/demoData'

export function DemoPage() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react')
  const [activeFile, setActiveFile] = useState<string>('src/components/AuthButton.tsx')
  const [treeData, setTreeData] = useState<DemoFileItem[]>(() =>
    JSON.parse(JSON.stringify(DEMO_FILE_TREE)),
  )
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['src', 'src-components', 'src-hooks', 'src-lib']),
  )
  const [fileFilter, setFileFilter] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSimulatingGen, setIsSimulatingGen] = useState(false)

  // Iniciar el recorrido interactivo con driver.js
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Listo',
      allowClose: true,
      smoothScroll: true,
      steps: [
        {
          element: '#demo-repo-input',
          popover: {
            title: 'Comienza aquí',
            description:
              'Ingresa la URL de cualquier repositorio público de GitHub que desees documentar.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#demo-file-tree',
          popover: {
            title: 'Ahorra tokens y tiempo',
            description:
              'Selecciona únicamente los componentes o módulos clave que necesiten explicación, evitando procesar archivos innecesarios.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#demo-markdown-viewer',
          popover: {
            title: 'Aquí ocurre la magia',
            description:
              'Gemini analiza tu código y redacta documentación técnica profunda, clara y estructurada en segundos.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#demo-export-actions',
          popover: {
            title: 'Llévatelo contigo',
            description:
              'Copia la documentación o expórtala en tus formatos preferidos para compartirla con tu equipo.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem('hasSeenDemoTour', 'true')
      },
    })

    driverObj.drive()
  }, [])

  // Disparar tour automáticamente si es la primera visita
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDemoTour')
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [startTour])

  // Alternar apertura de carpetas en el árbol
  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Alternar selección de un archivo para ahorro de tokens
  const toggleFileSelect = (targetPath: string) => {
    const updateRecursive = (items: DemoFileItem[]): DemoFileItem[] => {
      return items.map((item) => {
        if (item.path === targetPath) {
          return { ...item, selected: !item.selected }
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) }
        }
        return item
      })
    }
    setTreeData((prev) => updateRecursive(prev))
  }

  // Métricas de tokens seleccionados vs totales
  const { totalTokens, selectedTokens, selectedCount, totalFilesCount } = useMemo(() => {
    let total = 0
    let selected = 0
    let countSel = 0
    let countTot = 0

    const traverse = (items: DemoFileItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          countTot++
          total += item.tokenCount || 0
          if (item.selected) {
            countSel++
            selected += item.tokenCount || 0
          }
        }
        if (item.children) {
          traverse(item.children)
        }
      }
    }
    traverse(treeData)
    return {
      totalTokens: total,
      selectedTokens: selected,
      selectedCount: countSel,
      totalFilesCount: countTot,
    }
  }, [treeData])

  const tokenSavingsPercent = useMemo(() => {
    if (totalTokens === 0) return 0
    return Math.max(0, Math.round(((totalTokens - selectedTokens) / totalTokens) * 100))
  }, [totalTokens, selectedTokens])

  // Contenido markdown dinámico según el archivo activo
  const currentMarkdown = useMemo(() => {
    if (activeFile === 'src/components/AuthButton.tsx') {
      return DEMO_MARKDOWN_CONTENT
    }

    const fileName = activeFile.split('/').pop() || activeFile
    return `# Documentación Técnica: ${fileName}

## 1. Propósito General
Módulo auxiliar dentro de la arquitectura de la aplicación. Proporciona utilidades y componentes reactivos optimizados para una experiencia de usuario fluida y desacoplada.

## 2. Entradas y Salidas
* **Ruta de Código:** \`${activeFile}\`
* **Tipo:** Módulo TypeScript / React
* **Exportaciones Principales:** Funciones y tipos tipados fuertemente.

## 3. Gestión de Estado y Lógica
* Gestiona su ciclo de vida respetando los principios de inmutabilidad y bajo acoplamiento.
* Se integra de forma armónica con el resto de componentes del sistema.

## 4. Dependencias y Efectos
* Optimizado por el compilador para reducir la huella en tiempo de ejecución.
* Diseñado para máxima mantenibilidad y extensibilidad.
`
  }, [activeFile])

  // Copiar al portapapeles
  const handleCopy = () => {
    navigator.clipboard.writeText(currentMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Descargar archivo .md
  const handleDownload = () => {
    const fileName = activeFile.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'documentacion'
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}-docs.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Simular regeneración
  const handleSimulateRegenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSimulatingGen(true)
    setTimeout(() => {
      setIsSimulatingGen(false)
    }, 900)
  }

  // Renderizado recursivo del árbol de archivos
  const renderTree = (items: DemoFileItem[], depth = 0) => {
    return (
      <ul className={`space-y-1 ${depth > 0 ? 'ml-3 pl-2 border-l border-slate-200 dark:border-slate-800' : ''}`}>
        {items.map((item) => {
          if (
            fileFilter &&
            item.type === 'file' &&
            !item.name.toLowerCase().includes(fileFilter.toLowerCase())
          ) {
            return null
          }

          if (item.type === 'folder') {
            const isExpanded = expandedFolders.has(item.id)
            return (
              <li key={item.id} className="select-none">
                <button
                  type="button"
                  onClick={() => toggleFolder(item.id)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                >
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] w-3.5">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="text-amber-500 text-sm">📁</span>
                  <span className="truncate">{item.name}</span>
                </button>
                {isExpanded && item.children && renderTree(item.children, depth + 1)}
              </li>
            )
          }

          const isActive = activeFile === item.path
          return (
            <li key={item.id}>
              <div
                className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/80 dark:border-emerald-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                onClick={() => setActiveFile(item.path)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected ?? false}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleFileSelect(item.path)
                    }}
                    title={item.selected ? 'Archivo incluido' : 'Archivo omitido para ahorrar tokens'}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                  />
                  <span className="text-sm">
                    {item.name.endsWith('.tsx') || item.name.endsWith('.ts') ? '⚛️' : '📄'}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    item.selected
                      ? 'bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.tokenCount}t
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Patrón SVG decorativo de cuadrícula fina para profundidad visual */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full stroke-slate-900/[0.03] dark:stroke-white/[0.03] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="demo-grid-pattern"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
              x="50%"
              y={-1}
            >
              <path d="M.5 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#demo-grid-pattern)" />
        </svg>
      </div>

      {/* Header Superior Limpio con Modo Oscuro */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white"
            >
              <span>Code</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                Scribe AI
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Modo Demo Interactivo
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botón sutil para reiniciar el tutorial */}
            <button
              onClick={startTour}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
              title="Reiniciar el recorrido interactivo guiado"
            >
              <span className="text-emerald-500 text-sm">🧭</span>
              <span>Reiniciar tutorial</span>
            </button>

            {/* Alternador de Modo Claro / Oscuro */}
            <ThemeToggle />

            {/* Acceso directo al Dashboard real */}
            <Link
              to="/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 transition-colors"
            >
              <span>Ir al Dashboard</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* PASO 1: Selector / Input de Repositorio (#demo-repo-input) */}
        <section
          id="demo-repo-input"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🚀</span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Demostración de Análisis y Documentación
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Experimenta cómo CodeScribe AI extrae la arquitectura y genera documentación técnica modular.
              </p>
            </div>

            {/* Badges de estado */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Rama: main
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                Tokens: {selectedTokens.toLocaleString()} / {totalTokens.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                Gemini 2.0 Flash
              </span>
            </div>
          </div>

          {/* Formulario de entrada de URL del Repositorio */}
          <form onSubmit={handleSimulateRegenerate} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/usuario/repositorio"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulatingGen}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer shrink-0 disabled:opacity-60 disabled:transform-none"
            >
              {isSimulatingGen ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generar Documentación</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Distribución en 2 Columnas: Explorador de Archivos (Izq) y Visor de Docs (Der) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PASO 2: Contenedor del Árbol de Archivos (#demo-file-tree) */}
          <aside
            id="demo-file-tree"
            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>🌲</span>
                  <span>Estructura de Archivos</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Marca solo los archivos clave para procesar
                </p>
              </div>

              {/* Pill de ahorro de tokens */}
              <div
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300"
                title="Porcentaje de ahorro al filtrar archivos innecesarios"
              >
                -{tokenSavingsPercent}% Tokens
              </div>
            </div>

            {/* Input de filtro de archivos */}
            <div className="relative">
              <input
                type="text"
                value={fileFilter}
                onChange={(e) => setFileFilter(e.target.value)}
                placeholder="Filtrar componentes o archivos..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              {fileFilter && (
                <button
                  type="button"
                  onClick={() => setFileFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Lista interactiva de archivos */}
            <div className="overflow-y-auto max-h-[460px] pr-1 py-1">
              {renderTree(treeData)}
            </div>

            {/* Resumen de ahorro y tokens */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 -mx-4 -mb-4 p-4 rounded-b-2xl">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Archivos seleccionados:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedCount} de {totalFilesCount}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalFilesCount > 0 ? (selectedCount / totalFilesCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <span>💡</span>
                <span>Desmarcar archivos no críticos reduce el costo y tiempo de respuesta.</span>
              </p>
            </div>
          </aside>

          {/* Columna Derecha: Visor de Documentación */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* PASO 4: Barra de Acciones de Exportación (#demo-export-actions) */}
            <div
              id="demo-export-actions"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Archivo Activo:
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {activeFile}
                </span>
              </div>

              {/* Botones de Exportación */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
                >
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? '¡Copiado!' : 'Copiar Markdown'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
                >
                  <span>💾</span>
                  <span>Descargar .md</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition-all shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
                >
                  <span>📑</span>
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* PASO 3: Visor de Markdown (#demo-markdown-viewer) */}
            <div
              id="demo-markdown-viewer"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors"
            >
              {/* Header interior del visor */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                      Documentación Técnica Generada
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Redacción automatizada por Google Gemini 2.0 Flash
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 font-semibold">
                  Generado en 1.8s
                </span>
              </div>

              {/* Renderizado de Markdown con estilos enriquecidos para modo claro y oscuro */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pb-3 mb-6 border-b border-slate-200 dark:border-slate-800"
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 flex items-center gap-2"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed my-3" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-5 space-y-1.5 my-3 text-slate-600 dark:text-slate-300" {...props} />
                    ),
                    li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                    strong: ({ ...props }) => (
                      <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code
                            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[13px] font-mono border border-slate-200/60 dark:border-slate-700/60"
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                      return (
                        <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4 border border-slate-800">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      )
                    },
                  }}
                >
                  {currentMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
