import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import AdminModal from '../components/admin/AdminModal'

const contentNavItems = [
  { path: '/admin', label: 'Visionistas' },
  { path: '/admin/news-gallery', label: 'News & Gallery' },
  { path: '/admin/partners', label: 'Our Partners' },
  { path: '/admin/deleted', label: 'Recently Deleted' },
]

const adminNavItems = [
  { path: '/admin/users', label: 'User Management', hasBadge: true },
  { path: '/admin/audit-logs', label: 'Audit Logs' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Role state - defaults to 'Admin' if not explicitly stored
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || 'Admin'
  })

  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem('userName') || localStorage.getItem('userName') || (userRole === 'Editor' ? 'Editor' : 'Admin')
  })

  const [userEmail] = useState(() => {
    return sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || (userRole === 'Editor' ? 'editor@futurevisionhome.com' : 'admin@futurevisionhome.com')
  })

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(3)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingAccessRequests')
      if (raw) {
        const parsed = JSON.parse(raw)
        const count = parsed.filter((r) => r.status === 'PENDING_APPROVAL').length
        setPendingCount(count > 0 ? count : 3)
      }
    } catch {
      setPendingCount(3)
    }
  }, [location.pathname])

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminLoginTime')
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('userName')
    sessionStorage.removeItem('userEmail')
    localStorage.removeItem('token')
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminLoginTime')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    navigate('/admin/login', { replace: true })
  }

  const handleRoleToggle = (newRole) => {
    setUserRole(newRole)
    sessionStorage.setItem('userRole', newRole)
    localStorage.setItem('userRole', newRole)
    const newName = newRole === 'Editor' ? 'Editor' : 'Admin'
    setUserName(newName)
    sessionStorage.setItem('userName', newName)
    localStorage.setItem('userName', newName)
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || (userRole === 'Editor' ? 'ED' : 'AD')

  const isTabActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname === path
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
              <h1 className="admin-title">
                {userRole === 'Editor' ? 'Editor Dashboard' : 'Admin Dashboard'}
              </h1>

              <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Self Account Management Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="admin-account-btn"
                  title="Account Settings"
                  aria-label="Account Settings"
                >
                  <span className="admin-avatar-pill">
                    <span className="admin-avatar-initials">{initials}</span>
                  </span>
                  <span className="admin-account-label">My Account</span>
                  <span className={`admin-role-badge ${userRole === 'Editor' ? 'role-editor' : 'role-admin'}`}>
                    {userRole}
                  </span>
                </button>

                {/* Logout Button */}
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
        {/* Horizontal Tab Bar (Role-Gated) */}
        <div className="admin-tabs">
          {/* Core Content Tabs (Visible to both Editor and Admin) */}
          {contentNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-tab ${isTabActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin-Only Tabs (Visible only to Admin) */}
          {userRole === 'Admin' && (
            <>
              {/* Subtle visual divider before User Management */}
              <div className="admin-tab-divider" aria-hidden="true" />

              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin-tab ${isTabActive(item.path) ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                  {item.hasBadge && (
                    <span className="admin-tab-badge" title={`${pendingCount} pending requests`}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Dynamic Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Account Settings Modal Placeholder */}
      <AdminModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Account Settings"
        subtitle="Manage your profile details and preferences."
        maxWidth="max-w-xl"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              type="button"
              className="admin-login-btn !w-auto !py-2 !px-6"
              onClick={() => setIsAccountModalOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="account-modal-body">
          <div className="account-modal-profile">
            <div className="account-avatar-large">
              <span>{initials}</span>
            </div>
            <div className="account-details">
              <h3 className="account-name">{userName}</h3>
              <p className="account-email">{userEmail}</p>
              <div className="account-role-tag">
                <span className={`admin-role-badge ${userRole === 'Editor' ? 'role-editor' : 'role-admin'}`}>
                  {userRole} Role
                </span>
              </div>
            </div>
          </div>

          <div className="account-section-divider" />

          {/* Role Preview Switcher (Quick Toggle for Testing Admin/Editor views) */}
          <div className="account-role-switcher">
            <label className="admin-field-label">Switch Preview Role (RBAC Demo):</label>
            <div className="role-toggle-group">
              <button
                type="button"
                className={`role-toggle-btn ${userRole === 'Admin' ? 'active' : ''}`}
                onClick={() => handleRoleToggle('Admin')}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${userRole === 'Editor' ? 'active' : ''}`}
                onClick={() => handleRoleToggle('Editor')}
              >
                Editor (Content Only)
              </button>
            </div>
            <p className="role-switcher-hint">
              Switching roles dynamically updates header titles, tabs, and permissions.
            </p>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

export default AdminLayout
