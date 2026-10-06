import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../router/ProtectedRoute'
import { useAuthStore } from '../features/auth/store/authStore'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('redirige a / cuando el usuario no está autenticado', () => {
    useAuthStore.setState({ isAuthenticated: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Página Pública</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Panel Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Página Pública')).toBeInTheDocument()
    expect(screen.queryByText('Panel Protegido')).not.toBeInTheDocument()
  })

  it('permite el acceso a la ruta protegida cuando está autenticado', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'valid-jwt-token',
      user: {
        id: 'u1',
        githubId: '12345',
        username: 'testdev',
        avatarUrl: 'https://avatar.com/test.png',
        analysisCount: 1,
        isDemo: false,
      },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Página Pública</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Panel Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Panel Protegido')).toBeInTheDocument()
    expect(screen.queryByText('Página Pública')).not.toBeInTheDocument()
  })
})
