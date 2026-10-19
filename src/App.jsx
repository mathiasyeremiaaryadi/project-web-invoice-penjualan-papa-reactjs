import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, RouterProvider, ScrollRestoration, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import { AppNavbar } from './components/AppNavbar'
import { LoadingState } from './components/LoadingState'
import { ToastProvider } from './components/ToastProvider'
import { HomePage } from './pages/HomePage'
import { InvoiceFormPage } from './pages/InvoiceFormPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Error 4xx (validasi, 401, 404) tidak perlu dicoba ulang.
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if (status && status < 500) return false
        return failureCount < 2
      },
    },
    mutations: { retry: false },
  },
})

function AppLayout() {
  return (
    <>
      <AppNavbar />
      <main className="container py-4">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'invoices', element: <InvoiceListPage /> },
          { path: 'invoices/new', element: <InvoiceFormPage /> },
          { path: 'invoices/:id/edit', element: <InvoiceFormPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

/** Tunggu hasil GET /api/auth/me sebelum memutuskan redirect. */
function Root() {
  const { status } = useAuth()
  if (status === 'loading') return <LoadingState fullScreen text="Memeriksa sesi..." />
  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
