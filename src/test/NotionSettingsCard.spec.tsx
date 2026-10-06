import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotionSettingsCard } from '../components/integrations/NotionSettingsCard'
import { useNotionStore } from '../features/integrations/store/useNotionStore'
import { useAuthStore } from '../features/auth/store/authStore'

vi.mock('../features/integrations/api/notionApi', () => ({
  notionApi: {
    getPages: vi.fn().mockResolvedValue([]),
    getStatus: vi.fn().mockResolvedValue({ connected: false, workspaceName: null }),
    getAuthUrl: vi.fn().mockResolvedValue('https://notion.so/oauth'),
    disconnect: vi.fn().mockResolvedValue(undefined),
    exportDocument: vi.fn().mockResolvedValue({ success: true, url: 'https://notion.so/test' }),
  },
}))

describe('NotionSettingsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNotionStore.setState({
      isNotionConnected: false,
      notionWorkspaceName: null,
      notionPages: [],
      loading: false,
      error: null,
    })
    useAuthStore.setState({
      user: {
        id: 'u-1',
        username: 'test_user',
        plan: 'free',
        analysisCount: 0,
        isDemo: false,
      },
      token: 'jwt',
      isAuthenticated: true,
    })
  })

  it('muestra el estado no vinculado y el botón de conectar', () => {
    render(<NotionSettingsCard />)
    expect(screen.getByText('No vinculado')).toBeInTheDocument()
    expect(screen.getByText('Conectar con Notion')).toBeInTheDocument()
  })

  it('muestra el estado conectado y el nombre del workspace', () => {
    useNotionStore.setState({
      isNotionConnected: true,
      notionWorkspaceName: 'Mi Workspace de Notion',
      notionPages: [{ id: 'p-1', title: 'Página 1' }],
    })

    render(<NotionSettingsCard />)
    expect(screen.getByText('Conectado')).toBeInTheDocument()
    expect(screen.getByText('Mi Workspace de Notion')).toBeInTheDocument()
    expect(screen.getByText('Desconectar')).toBeInTheDocument()
  })

  it('muestra aviso restringido y botón deshabilitado en modo demo', () => {
    useAuthStore.setState({
      user: {
        id: 'demo-1',
        username: 'demo_user',
        plan: 'free',
        analysisCount: 0,
        isDemo: true,
      },
    })

    render(<NotionSettingsCard />)
    expect(screen.getByText('No disponible en Demo')).toBeInTheDocument()
    const connectButton = screen.getByRole('button', { name: /Conectar cuenta de Notion/i })
    expect(connectButton).toBeDisabled()
  })
})
