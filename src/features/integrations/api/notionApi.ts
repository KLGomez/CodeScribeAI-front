import api from '../../../lib/axios'

export interface NotionPage {
  id: string
  title: string
  icon?: string | null
}

export interface NotionStatusResponse {
  connected: boolean
  workspaceName: string | null
}

export interface NotionAuthUrlResponse {
  url: string
}

export interface NotionCallbackResponse {
  connected: boolean
  workspaceName: string | null
}

export interface NotionExportPayload {
  documentationId: string
  targetPageId: string
  title?: string
}

export interface NotionExportResponse {
  success: boolean
  url: string
}

export const notionApi = {
  getAuthUrl: async (): Promise<string> => {
    const res = await api.get<NotionAuthUrlResponse>('/integrations/notion/auth-url')
    return res.data.url
  },

  submitCallback: async (code: string, state: string): Promise<NotionCallbackResponse> => {
    const res = await api.post<NotionCallbackResponse>('/integrations/notion/callback', {
      code,
      state,
    })
    return res.data
  },

  getStatus: async (): Promise<NotionStatusResponse> => {
    const res = await api.get<NotionStatusResponse>('/integrations/notion/status')
    return res.data
  },

  getPages: async (): Promise<NotionPage[]> => {
    const res = await api.get<NotionPage[]>('/integrations/notion/pages')
    return res.data
  },

  disconnect: async (): Promise<void> => {
    await api.delete('/integrations/notion')
  },

  exportDocument: async (payload: NotionExportPayload): Promise<NotionExportResponse> => {
    const res = await api.post<NotionExportResponse>('/export/notion', payload)
    return res.data
  },
}
