import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  notionApi,
  type NotionPage,
  type NotionExportPayload,
  type NotionExportResponse,
} from '../api/notionApi'

interface NotionState {
  isNotionConnected: boolean
  notionWorkspaceName: string | null
  notionPages: NotionPage[]
  loading: boolean
  error: string | null

  checkStatus: () => Promise<void>
  loadPages: () => Promise<void>
  disconnectNotion: () => Promise<void>
  setNotionConnected: (connected: boolean, workspaceName?: string | null) => void
  exportToNotion: (payload: NotionExportPayload) => Promise<NotionExportResponse>
}

export const useNotionStore = create<NotionState>()(
  persist(
    (set, get) => ({
      isNotionConnected: false,
      notionWorkspaceName: null,
      notionPages: [],
      loading: false,
      error: null,

      setNotionConnected: (connected: boolean, workspaceName?: string | null) => {
        set({
          isNotionConnected: connected,
          notionWorkspaceName: connected ? (workspaceName ?? get().notionWorkspaceName) : null,
          error: null,
        })
      },

      checkStatus: async () => {
        try {
          set({ loading: true, error: null })
          const status = await notionApi.getStatus()
          set({
            isNotionConnected: status.connected,
            notionWorkspaceName: status.workspaceName,
            loading: false,
          })
          if (status.connected) {
            await get().loadPages()
          }
        } catch (err: any) {
          if (err?.response?.status === 401) {
            set({ isNotionConnected: false, notionWorkspaceName: null, notionPages: [] })
          }
          set({ loading: false, error: err?.message || 'Error verificando estado de Notion' })
        }
      },

      loadPages: async () => {
        try {
          const pages = await notionApi.getPages()
          set({ notionPages: pages, error: null })
        } catch (err: any) {
          if (err?.response?.status === 401) {
            set({ isNotionConnected: false, notionWorkspaceName: null, notionPages: [] })
          }
          console.error('[NotionStore] Error cargando páginas:', err)
        }
      },

      disconnectNotion: async () => {
        try {
          set({ loading: true })
          await notionApi.disconnect()
          set({
            isNotionConnected: false,
            notionWorkspaceName: null,
            notionPages: [],
            loading: false,
            error: null,
          })
        } catch (err: any) {
          set({ loading: false, error: err?.message || 'Error al desconectar Notion' })
          throw err
        }
      },

      exportToNotion: async (payload: NotionExportPayload) => {
        try {
          set({ loading: true, error: null })
          const res = await notionApi.exportDocument(payload)
          set({ loading: false })
          return res
        } catch (err: any) {
          set({ loading: false, error: err?.message || 'Error al exportar a Notion' })
          throw err
        }
      },
    }),
    {
      name: 'codescribe-notion-storage',
      partialize: (state) => ({
        isNotionConnected: state.isNotionConnected,
        notionWorkspaceName: state.notionWorkspaceName,
      }),
    },
  ),
)

// Alias for backwards-compatibility
export const useIntegrationStore = useNotionStore
export type { NotionPage, NotionExportPayload, NotionExportResponse }
