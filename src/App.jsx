import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
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

const routes = [
  { path: '/', label: 'Home', element: <Home /> },
  { path: '/about', label: 'About Us', element: <About /> },
  { path: '/our-work', label: 'Our Work', element: <OurWork /> },
  { path: '/our-partners', label: 'Our Partners', element: <OurPartners /> },
  { path: '/eye-route', label: 'EyeRoute', element: <EyeRoute /> },
  { path: '/donate', label: 'Donate', element: <Donate /> },
  { path: '/contact', label: 'Contact Us', element: <Contact /> },
  { path: '/news/:slug', label: 'Article', element: <Article /> },
  { path: '/admin', label: 'Admin', element: <Admin /> },
]

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element || <Placeholder title={route.label} />}
            />
          ))}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
