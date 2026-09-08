import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import AppLayout from './layout/AppLayout'
import AdminLayout from './layout/AdminLayout'

// Lazy-loaded public page components
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const OurWork = lazy(() => import('./pages/OurWork'))
const OurPartners = lazy(() => import('./pages/OurPartners'))
const EyeRoute = lazy(() => import('./pages/EyeRoute'))
const Donate = lazy(() => import('./pages/Donate'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin = lazy(() => import('./pages/Admin'))
const RequestAccess = lazy(() => import('./pages/RequestAccess'))
const Article = lazy(() => import('./pages/Article'))

// Lazy-loaded admin section components
const AdminVisionistas = lazy(() => import('./pages/admin/AdminVisionistas'))
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners'))
const AdminNewsGallery = lazy(() => import('./pages/admin/AdminNewsGallery'))
const AdminDeleted = lazy(() => import('./pages/admin/AdminDeleted'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'))

const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    width: '100%'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e2e8f0',
      borderTop: '4px solid #95ab2f',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/our-work', element: <OurWork /> },
  { path: '/our-partners', element: <OurPartners /> },
  { path: '/eye-route', element: <EyeRoute /> },
  { path: '/donate', element: <Donate /> },
  { path: '/contact', element: <Contact /> },
  { path: '/news/:slug', element: <Article /> },
]

// Admin-Only Route Guard (Restricts User Management & Audit Logs strictly to Admin)
const AdminOnlyRoute = ({ children }) => {
  const { currentUser } = useAdminAuth()
  const rawRole = currentUser?.role || sessionStorage.getItem('userRole') || 'Editor'
  const isAdmin = rawRole.toLowerCase() === 'admin'

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}

const adminRoutes = [
  { path: '', element: <AdminVisionistas /> },
  { path: 'news-gallery', element: <AdminNewsGallery /> },
  { path: 'partners', element: <AdminPartners /> },
  { path: 'deleted', element: <AdminDeleted /> },
  {
    path: 'users',
    element: (
      <AdminOnlyRoute>
        <AdminUsers />
      </AdminOnlyRoute>
    ),
  },
  {
    path: 'audit-logs',
    element: (
      <AdminOnlyRoute>
        <AdminAuditLogs />
      </AdminOnlyRoute>
    ),
  },
]

// Protected Route / Middleware Guard with Cache & bfcache Teardown Protection
const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAdminAuth()
  const sessionAuth = sessionStorage.getItem('adminAuthenticated') === 'true'
  const token = sessionStorage.getItem('token')
  const userRole = currentUser?.role || sessionStorage.getItem('userRole') || ''

  // Allowed staff roles (Admin / Editor)
  const hasValidRole = ['admin', 'editor'].includes(userRole.toLowerCase())
  const isAuthorized = (isAuthenticated || sessionAuth) && Boolean(token) && hasValidRole

  // Prevent browser back-forward cache (bfcache) from showing stale dashboard after logout
  useEffect(() => {
    const handlePageShow = (event) => {
      const currentToken = sessionStorage.getItem('token')
      const currentAuth = sessionStorage.getItem('adminAuthenticated') === 'true'
      if (event.persisted || !currentToken || !currentAuth) {
        window.location.replace('/admin/login')
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<AppLayout />}>
              {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* Admin Login - No Layout */}
            <Route path="/admin/login" element={<Admin />} />
            <Route path="/login" element={<Admin />} />

            {/* Sign Up / Request Access Routes - No Layout */}
            <Route path="/internal/request-access" element={<RequestAccess />} />
            <Route path="/signup" element={<RequestAccess />} />
            <Route path="/sign-up" element={<RequestAccess />} />
            <Route path="/register" element={<RequestAccess />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {adminRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}

export default App
