import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotionExportModal } from '../components/documentation/NotionExportModal'
import { useNotionStore } from '../features/integrations/store/useNotionStore'
import { useAuthStore } from '../features/auth/store/authStore'

vi.mock('../features/integrations/api/notionApi', () => ({
  notionApi: {
    getPages: vi.fn().mockResolvedValue([]),
    getStatus: vi.fn().mockResolvedValue({ connected: true, workspaceName: 'Engineering Workspace' }),
    getAuthUrl: vi.fn().mockResolvedValue('https://notion.so/oauth'),
    disconnect: vi.fn().mockResolvedValue(undefined),
    exportDocument: vi.fn().mockResolvedValue({ success: true, url: 'https://notion.so/test' }),
  },
}))

describe('NotionExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNotionStore.setState({
      isNotionConnected: true,
      notionWorkspaceName: 'Engineering Workspace',
      notionPages: [
        { id: 'page-1', title: 'Documentación Backend' },
        { id: 'page-2', title: 'Documentación Frontend' },
      ],
      loading: false,
      error: null,
    })
    useAuthStore.setState({
      user: {
        id: 'u-1',
        username: 'dev',
        plan: 'free',
        analysisCount: 0,
        isDemo: false,
      },
      token: 'jwt',
      isAuthenticated: true,
    })
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <NotionExportModal
        isOpen={false}
        onClose={vi.fn()}
        documentationId="doc-123"
        documentTitle="Arquitectura General"
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza selector de páginas y botón de confirmar cuando está conectado', () => {
    render(
      <NotionExportModal
        isOpen={true}
        onClose={vi.fn()}
        documentationId="doc-123"
        documentTitle="Arquitectura General"
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Exportar a Notion')).toBeInTheDocument()
    expect(screen.getByText(/Documentación Backend/i)).toBeInTheDocument()
    expect(screen.getByText(/Documentación Frontend/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirmar Exportación/i })).toBeInTheDocument()
  })

  it('muestra aviso de restricción cuando el usuario está en modo demo', () => {
    useAuthStore.setState({
      user: {
        id: 'demo-1',
        username: 'demo_user',
        plan: 'free',
        analysisCount: 0,
        isDemo: true,
      },
    })

    render(
      <NotionExportModal
        isOpen={true}
        onClose={vi.fn()}
        documentationId="doc-123"
        documentTitle="Arquitectura General"
      />,
    )

    expect(screen.getByText('Función restringida en modo demo')).toBeInTheDocument()
    const confirmButton = screen.getByRole('button', { name: /Confirmar Exportación/i })
    expect(confirmButton).toBeDisabled()
  })
})
