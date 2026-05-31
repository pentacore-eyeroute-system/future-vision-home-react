import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import AppLayout from './layout/AppLayout'
import AdminLayout from './layout/AdminLayout'
import Placeholder from './components/Placeholder'
import Home from './pages/Home'
import About from './pages/About'
import OurWork from './pages/OurWork'
import OurPartners from './pages/OurPartners'
import EyeRoute from './pages/EyeRoute'
import Donate from './pages/Donate'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Article from './pages/Article'
import AdminVisionistas from './pages/admin/AdminVisionistas'
import AdminPartners from './pages/admin/AdminPartners'
import AdminNewsGallery from './pages/admin/AdminNewsGallery'
import AdminDeleted from './pages/admin/AdminDeleted'

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

const adminRoutes = [
  { path: '', element: <AdminVisionistas /> },
  { path: 'news-gallery', element: <AdminNewsGallery /> },
  { path: 'partners', element: <AdminPartners /> },
  { path: 'deleted', element: <AdminDeleted /> },
]

// Simple Auth Guard
const ProtectedRoute = ({ children, requiredRole }) => {
  // const isAuthed = sessionStorage.getItem('adminAuthenticated') === 'true'
  // return isAuthed ? children : <Navigate to="/admin/login" replace />

  const token = sessionStorage.getItem('token');

  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== requiredRole) {
      return <Navigate to='/' replace />;
    }

    return children;
  } catch (err) {
    sessionStorage.removeItem('token');
    return <Navigate to='/admin/login' replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AppLayout />}>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Admin Login - No Layout */}
        <Route path="/admin/login" element={<Admin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
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
    </BrowserRouter>
  )
}

export default App
