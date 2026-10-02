import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LandingPage } from '../pages/LandingPage'
import { AuthCallbackPage } from '../pages/AuthCallbackPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AnalyzePage } from '../pages/AnalyzePage'
import { DocumentPage } from '../pages/DocumentPage'
import { DemoPage } from '../pages/DemoPage'
import { NotionCallbackPage } from '../pages/NotionCallbackPage'

import { AppLayout } from '../components/layout/AppLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/documentation/demo" element={<DemoPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/notion/callback" element={<NotionCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/documentation/:id" element={<DocumentPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
