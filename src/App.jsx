import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Placeholder from './components/Placeholder'
import Home from './pages/Home'

const routes = [
  { path: '/', label: 'Home', element: <Home /> },
  { path: '/about', label: 'About Us' },
  { path: '/our-work', label: 'Our Work' },
  { path: '/our-partners', label: 'Our Partners' },
  { path: '/eye-route', label: 'EyeRoute' },
  { path: '/donate', label: 'Donate' },
  { path: '/contact', label: 'Contact Us' },
  { path: '/newsletter/1', label: 'Quarterly Newsletter 1 2025' },
  { path: '/newsletter/2', label: 'Quarterly Newsletter 2 2023' },
  { path: '/newsletter/3', label: 'Quarterly Newsletter 3 2023' },
  { path: '/newsletter/4', label: 'Quarterly Newsletter 4 2023' },
  { path: '/year-end-report-2024', label: 'Year-End Report 2024' },
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
