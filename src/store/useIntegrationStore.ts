import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotionPage {
  id: string
  title: string
  icon?: string
}

export interface NotionExportPayload {
  targetPageId: string
  title: string
  markdown: string
  notionAccessToken?: string
}

export interface NotionExportResult {
  success: boolean
  url?: string
  pageId?: string
  error?: string
}

export interface IntegrationState {
  // Estado Notion
  isNotionConnected: boolean
  notionWorkspaceName: string | null
  notionPages: NotionPage[]
  isExporting: boolean
  lastExportResult: NotionExportResult | null

  // Acciones y Mutaciones
  setNotionConnected: (connected: boolean, workspaceName?: string) => void
  disconnectNotion: () => void
  setNotionPages: (pages: NotionPage[]) => void
  exportToNotion: (payload: NotionExportPayload) => Promise<NotionExportResult>
  clearLastExportResult: () => void
}

/**
 * Páginas iniciales simuladas (Dummy Data) para el espacio de trabajo de Notion
 */
export const DUMMY_NOTION_PAGES: NotionPage[] = [
  { id: 'page-eng-wiki-01', title: 'Engineering Wiki', icon: '💻' },
  { id: 'page-priv-docs-02', title: 'Docs Privados', icon: '🔒' },
  { id: 'page-arch-03', title: 'Arquitectura de Software', icon: '🏛️' },
  { id: 'page-team-guide-04', title: 'Onboarding & Guías Técnicas', icon: '📖' },
]

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      isNotionConnected: false,
      notionWorkspaceName: 'CodeScribe Workspace',
      notionPages: DUMMY_NOTION_PAGES,
      isExporting: false,
      lastExportResult: null,

      setNotionConnected: (connected: boolean, workspaceName?: string) =>
        set((state) => ({
          isNotionConnected: connected,
          notionWorkspaceName: connected
            ? workspaceName ?? (state.notionWorkspaceName || 'CodeScribe Workspace')
            : null,
        })),

      disconnectNotion: () =>
        set({
          isNotionConnected: false,
          notionWorkspaceName: null,
          lastExportResult: null,
        }),

      setNotionPages: (pages: NotionPage[]) =>
        set({ notionPages: pages }),

      exportToNotion: async (payload: NotionExportPayload): Promise<NotionExportResult> => {
        set({ isExporting: true, lastExportResult: null })

        try {
          // Simulación de latencia de red hacia el backend / API de Notion
          await new Promise((resolve) => setTimeout(resolve, 1500))

          const selectedPage = get().notionPages.find((p) => p.id === payload.targetPageId)
          const targetPageName = selectedPage ? selectedPage.title : 'Notion'
          const pageSlug = payload.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'document'

          const result: NotionExportResult = {
            success: true,
            url: `https://www.notion.so/codescribe/${pageSlug}-${Date.now().toString(36)}`,
            pageId: payload.targetPageId,
          }
          // Log descriptivo para trazabilidad
          console.debug(`[NotionExport] Documento "${payload.title}" exportado a "${targetPageName}" (${payload.targetPageId})`)

          set({ isExporting: false, lastExportResult: result })
          return result
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Error inesperado al exportar la documentación a Notion.'

          const errorResult: NotionExportResult = {
            success: false,
            error: errorMessage,
          }

          set({ isExporting: false, lastExportResult: errorResult })
          return errorResult
        }
      },

      clearLastExportResult: () => set({ lastExportResult: null }),
    }),
    {
      name: 'codescribe-integrations',
      partialize: (state) => ({
        isNotionConnected: state.isNotionConnected,
        notionWorkspaceName: state.notionWorkspaceName,
        notionPages: state.notionPages,
      }),
    },
  ),
)
