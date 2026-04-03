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
import Newsletter1 from './pages/newsletters/Newsletter1'
import Newsletter2 from './pages/newsletters/Newsletter2'
import Newsletter3 from './pages/newsletters/Newsletter3'
import Newsletter4 from './pages/newsletters/Newsletter4'
import YearEndReport2024 from './pages/newsletters/YearEndReport2024'

const routes = [
  { path: '/', label: 'Home', element: <Home /> },
  { path: '/about', label: 'About Us', element: <About /> },
  { path: '/our-work', label: 'Our Work', element: <OurWork /> },
  { path: '/our-partners', label: 'Our Partners', element: <OurPartners /> },
  { path: '/eye-route', label: 'EyeRoute', element: <EyeRoute /> },
  { path: '/donate', label: 'Donate', element: <Donate /> },
  { path: '/contact', label: 'Contact Us', element: <Contact /> },
  { path: '/newsletter/1', label: 'Quarterly Newsletter 1 2025', element: <Newsletter1 /> },
  { path: '/newsletter/2', label: 'Quarterly Newsletter 2 2023', element: <Newsletter2 /> },
  { path: '/newsletter/3', label: 'Quarterly Newsletter 3 2023', element: <Newsletter3 /> },
  { path: '/newsletter/4', label: 'Quarterly Newsletter 4 2023', element: <Newsletter4 /> },
  { path: '/year-end-report-2024', label: 'Year-End Report 2024', element: <YearEndReport2024 /> },
  { path: '/admin', label: 'Admin' },
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
