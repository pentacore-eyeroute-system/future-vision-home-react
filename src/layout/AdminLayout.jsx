import { useState, useRef, useEffect, useLayoutEffect, useContext } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AccountSettingsModal from '../components/admin/AccountSettingsModal'
import { ThemeContext } from '../context/ThemeContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import './AdminLayout.css'

// Core Content Navigation (Visible to both Editor and Admin)
const contentNavItems = [
  { path: '/admin', label: 'Visionistas' },
  { path: '/admin/news-gallery', label: 'News & Gallery' },
  { path: '/admin/partners', label: 'Partners' },
  { path: '/admin/deleted', label: 'Recently Deleted' },
]

// Administrative-only Navigation (Visible exclusively to Admin)
const adminNavItems = [
  { path: '/admin/users', label: 'User Management' },
  { path: '/admin/audit-logs', label: 'Audit Logs' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useContext(ThemeContext)
  const { currentUser, logout, updateUser } = useAdminAuth()

  // Role and User profile dynamic state from active auth session
  const rawRole = currentUser?.role || sessionStorage.getItem('userRole') || 'Editor'
  const userRole = rawRole.toLowerCase() === 'admin' ? 'Admin' : 'Editor'
  const isAdmin = userRole === 'Admin'
  const userName = currentUser?.fullName || sessionStorage.getItem('userFullName') || currentUser?.username || sessionStorage.getItem('userName') || 'Staff Member'
  const username = currentUser?.username || sessionStorage.getItem('userName') || 'admin'
  const userEmail = currentUser?.email || sessionStorage.getItem('userEmail') || ''

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(3)

  const profileMenuRef = useRef(null)
  const tabListRef = useRef(null)
  const tabRefs = useRef({})
  const indicatorRef = useRef(null)

  // All currently active navigation items based on role
  const visibleNavItems = isAdmin
    ? [...contentNavItems, ...adminNavItems]
    : contentNavItems

  const isTabActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname === path
  }

  // Update sliding tab indicator position
  const updateIndicator = () => {
    const activeItem = visibleNavItems.find((item) => isTabActive(item.path))
    if (activeItem && tabRefs.current[activeItem.path] && tabListRef.current && indicatorRef.current) {
      const activeEl = tabRefs.current[activeItem.path]
      const containerRect = tabListRef.current.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()

      const left = elRect.left - containerRect.left + tabListRef.current.scrollLeft
      const width = elRect.width

      indicatorRef.current.style.left = `${left}px`
      indicatorRef.current.style.width = `${width}px`
      indicatorRef.current.style.opacity = '1'
    } else if (indicatorRef.current) {
      indicatorRef.current.style.opacity = '0'
    }
  }

  useLayoutEffect(() => {
    updateIndicator()
  }, [location.pathname, userRole])

  useEffect(() => {
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [location.pathname, userRole])

  // Keyboard navigation for horizontal tabs (Left / Right / Home / End)
  const handleTabKeyDown = (e, currentPath) => {
    const currentIndex = visibleNavItems.findIndex((item) => item.path === currentPath)
    if (currentIndex === -1) return

    let targetIndex = -1

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      targetIndex = (currentIndex + 1) % visibleNavItems.length
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      targetIndex = (currentIndex - 1 + visibleNavItems.length) % visibleNavItems.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      targetIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      targetIndex = visibleNavItems.length - 1
    }

    if (targetIndex !== -1) {
      const targetPath = visibleNavItems[targetIndex].path
      const targetEl = tabRefs.current[targetPath]
      if (targetEl) {
        targetEl.focus()
      }
    }
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const syncCount = () => {
      try {
        const raw = sessionStorage.getItem('pendingAccessRequests')
        if (raw) {
          const parsed = JSON.parse(raw)
          const count = parsed.filter((r) => r.status === 'PENDING_APPROVAL').length
          setPendingCount(count)
        } else {
          setPendingCount(3)
        }
      } catch {
        setPendingCount(3)
      }
    }

    syncCount()
    window.addEventListener('pendingRequestsUpdated', syncCount)
    window.addEventListener('storage', syncCount)
    return () => {
      window.removeEventListener('pendingRequestsUpdated', syncCount)
      window.removeEventListener('storage', syncCount)
    }
  }, [location.pathname])

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    logout()
    navigate('/admin/login', { replace: true })
  }

  const handleBackToWebsite = (e) => {
    e?.preventDefault?.()
    setIsProfileMenuOpen(false)
    logout()
    navigate('/', { replace: true })
  }

  const handleRoleToggle = (newRole) => {
    updateUser({ role: newRole })
  }

  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || (userRole === 'Editor' ? 'ED' : 'AD')

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-container">
          <div className="admin-header-content">
            <Link
              to="/"
              className="admin-logo"
              onClick={handleBackToWebsite}
              title="Return to Public Website (Ends Admin Session)"
            >
              <img src="/images/fvh-logo.png" alt="Future Vision Home logo" className="logo-image" />
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
                {/* Profile Quick Menu & Avatar Trigger */}
                <div className="admin-avatar-wrapper" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`admin-account-circle-btn ${isProfileMenuOpen ? 'active' : ''}`}
                    title={`Profile Menu (${userName} • ${userRole})`}
                    aria-label="User Profile Menu"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="admin-avatar-initials">{initials}</span>
                    {/* Active Status Dot */}
                    <span
                      className="admin-status-dot"
                      aria-label="Active session status"
                      title="Active authenticated session"
                    />
                  </button>

                  {/* Profile Quick Menu Popover */}
                  {isProfileMenuOpen && (
                    <div
                      className="admin-profile-dropdown"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {/* Header info */}
                      <div className="profile-dropdown-header">
                        <div className="profile-dropdown-avatar">
                          <span>{initials}</span>
                        </div>
                        <div className="profile-dropdown-info">
                          <div className="profile-dropdown-name-row">
                            <span className="profile-dropdown-name">{userName}</span>
                            <span
                              className={`admin-role-badge ${
                                userRole === 'Editor' ? 'role-editor' : 'role-admin'
                              }`}
                            >
                              {userRole}
                            </span>
                          </div>
                          <span className="profile-dropdown-username">@{username}</span>
                        </div>
                      </div>

                      {/* Menu actions */}
                      <div className="profile-dropdown-menu">
                        {/* ⚙️ Account & Security */}
                        <button
                          type="button"
                          className="profile-dropdown-item"
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            setIsAccountModalOpen(true)
                          }}
                          role="menuitem"
                        >
                          <div className="profile-dropdown-item-left">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="profile-dropdown-item-icon"
                            >
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>Account Settings</span>
                          </div>
                        </button>

                        {/* 🎨 Theme Toggle */}
                        <button
                          type="button"
                          className="profile-dropdown-item"
                          onClick={toggleTheme}
                          role="menuitem"
                        >
                          <div className="profile-dropdown-item-left">
                            {theme === 'dark' ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="profile-dropdown-item-icon"
                              >
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="profile-dropdown-item-icon"
                              >
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                              </svg>
                            )}
                            <span>Theme</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            {theme}
                          </span>
                        </button>

                        <div className="profile-dropdown-divider" />

                        {/* 🚪 Sign Out */}
                        <button
                          type="button"
                          className="profile-dropdown-item danger"
                          onClick={handleLogout}
                          role="menuitem"
                        >
                          <div className="profile-dropdown-item-left">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="profile-dropdown-item-icon"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sign Out</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="admin-container">
        {/* Horizontal Tab Bar (Role-Gated with Sliding Indicator & Keyboard Navigation) */}
        <nav
          className="admin-tabs"
          ref={tabListRef}
          role="tablist"
          aria-label="Dashboard Content Navigation"
        >
          {/* Animated Sliding Underline Indicator */}
          <span
            ref={indicatorRef}
            className="admin-tab-indicator"
            aria-hidden="true"
          />

          {/* Core Content Tabs (Visible to both Editor and Admin) */}
          {contentNavItems.map((item) => {
            const active = isTabActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                ref={(el) => (tabRefs.current[item.path] = el)}
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => handleTabKeyDown(e, item.path)}
                className={`admin-tab ${active ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Admin-Only Tabs (Visible only to Admin) */}
          {userRole === 'Admin' && (
            <>
              {/* Subtle visual divider before User Management */}
              <div className="admin-tab-divider" aria-hidden="true" />

              {adminNavItems.map((item) => {
                const active = isTabActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    ref={(el) => (tabRefs.current[item.path] = el)}
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, item.path)}
                    className={`admin-tab ${active ? 'active' : ''}`}
                  >
                    <span>{item.label}</span>
                    {item.hasBadge && (
                      <span className="admin-tab-badge" title={`${pendingCount} pending requests`}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Dynamic Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Self Account Management Modal */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        username={username}
        onRoleToggle={handleRoleToggle}
      />
    </div>
  )
}

export default AdminLayout
