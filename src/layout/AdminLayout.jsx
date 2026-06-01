import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const navItems = [
  { path: '/admin', label: 'Visionistas' },
  { path: '/admin/news-gallery', label: 'News & Gallery' },
  { path: '/admin/partners', label: 'Our Partners' },
  { path: '/admin/deleted', label: 'Recently Deleted' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminLoginTime')
    localStorage.removeItem('token')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-container">
          <div className="admin-header-content">
            <Link to="/" className="admin-logo">
              <img src="/images/fvh-logo.png" alt="Future Vision Home" className="logo-image" />
              <div className="logo-text-wrapper">
                <span className="logo-text">Future Vision Home</span>
                <span className="logo-subtext">Future Vision Sighted-Blind, Inc.</span>
              </div>
            </Link>
            <div className="admin-header-right">
              <h1 className="admin-title">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button onClick={handleLogout} className="admin-logout">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="admin-container">
        {/* Admin Tabs */}
        <div className="admin-tabs">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-tab ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
