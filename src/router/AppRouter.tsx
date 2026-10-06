import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { ErrorBoundary } from '../components/shared/ErrorBoundary'

// Code splitting mediante React.lazy
const LandingPage = lazy(() => import('../pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const DemoPage = lazy(() => import('../pages/DemoPage').then((m) => ({ default: m.DemoPage })))
const AuthCallbackPage = lazy(() => import('../pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })))
const NotionCallbackPage = lazy(() => import('../pages/NotionCallbackPage').then((m) => ({ default: m.NotionCallbackPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const AnalyzePage = lazy(() => import('../pages/AnalyzePage').then((m) => ({ default: m.AnalyzePage })))
const DocumentPage = lazy(() => import('../pages/DocumentPage').then((m) => ({ default: m.DocumentPage })))
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/documentation/demo" element={<DemoPage />} />
            <Route path="/privacidad" element={<PrivacyPolicyPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/notion/callback" element={<NotionCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/documentation/:id" element={<DocumentPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
