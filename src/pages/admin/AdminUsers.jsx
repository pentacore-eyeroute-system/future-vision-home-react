import { useState, useEffect, useRef } from 'react'
import AdminModal from '../../components/admin/AdminModal'
import { userManagementApi } from '../../api/userManagementApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

// Initial seed fallback data for pending requests if offline
const INITIAL_PENDING_REQUESTS = [
  {
    id: 'req_101',
    fullName: 'Angel Faith Fernando',
    email: 'angel.fernando@futurevisionhome.com',
    username: 'afernando',
    requestedRole: 'Editor',
    status: 'PENDING_APPROVAL',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'req_102',
    fullName: 'Jamaine Grace M. Tuazon',
    email: 'jamaine.tuazon@futurevisionhome.com',
    username: 'jtuazon',
    requestedRole: 'Editor',
    status: 'PENDING_APPROVAL',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
]

// Initial seed fallback data for staff members if offline
const INITIAL_STAFF_MEMBERS = [
  {
    id: 'usr_01',
    fullName: 'Jorge Omar K. Fuertes',
    email: 'jorge.fuertes@futurevisionhome.com',
    username: 'jfuertes',
    role: 'Admin',
    joinedAt: '2025-01-10T08:00:00.000Z',
  },
]

function AdminUsers() {
  const { currentUser } = useAdminAuth()
  const [subTab, setSubTab] = useState('pending') // 'pending' | 'staff'
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL') // 'ALL' | 'Admin' | 'Editor'
  const [isLoading, setIsLoading] = useState(false)

  // Acting admin identification from authenticated session
  const currentUserId =
    currentUser?.id ||
    sessionStorage.getItem('currentUserId') ||
    localStorage.getItem('currentUserId') ||
    sessionStorage.getItem('userId') ||
    localStorage.getItem('userId') ||
    ''

  const currentAdminEmail =
    currentUser?.email ||
    sessionStorage.getItem('userEmail') ||
    localStorage.getItem('userEmail') ||
    ''

  const currentAdminUsername =
    currentUser?.username ||
    sessionStorage.getItem('userName') ||
    localStorage.getItem('userName') ||
    ''

  const currentAdminFullName =
    currentUser?.fullName ||
    sessionStorage.getItem('userFullName') ||
    localStorage.getItem('userFullName') ||
    'Administrator'

  // Helper to dynamically check if user matches logged-in session
  const isSelfUser = (user) => {
    if (!user) return false

    const loggedInId = currentUser?.id || currentUserId
    const loggedInEmail = currentUser?.email || currentAdminEmail
    const loggedInUsername = currentUser?.username || currentAdminUsername

    const userIdMatch =
      Boolean(loggedInId) &&
      Boolean(user.id || user.usr_id) &&
      String(user.id || user.usr_id) === String(loggedInId)

    const emailMatch =
      Boolean(loggedInEmail) &&
      Boolean(user.email || user.usr_email) &&
      (user.email || user.usr_email).trim().toLowerCase() === loggedInEmail.trim().toLowerCase()

    const usernameMatch =
      Boolean(loggedInUsername) &&
      Boolean(user.username || user.usr_username) &&
      (user.username || user.usr_username).trim().toLowerCase() === loggedInUsername.trim().toLowerCase()

    return userIdMatch || emailMatch || usernameMatch
  }

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState([])

  // Staff Members State
  const [staffMembers, setStaffMembers] = useState([])

  const fetchUsersData = async () => {
    try {
      setIsLoading(true)
      const [staffData, pendingData] = await Promise.allSettled([
        userManagementApi.getStaffMembers(),
        userManagementApi.getPendingRequests(),
      ])

      if (staffData.status === 'fulfilled' && Array.isArray(staffData.value)) {
        const normalizedStaff = staffData.value.map((u) => ({
          id: u.id,
          fullName: u.usr_fullname || u.fullName || u.usr_username || 'Staff Member',
          email: u.usr_email || u.email || '',
          username: u.usr_username || u.username || '',
          role: (u.usr_role || u.role || 'editor').toLowerCase() === 'admin' ? 'Admin' : 'Editor',
          joinedAt: u.createdAt || u.joinedAt || new Date().toISOString(),
        }))
        setStaffMembers(normalizedStaff)
      }

      if (pendingData.status === 'fulfilled' && Array.isArray(pendingData.value)) {
        const normalizedPending = pendingData.value.map((r) => ({
          id: r.id,
          fullName: r.apl_fullname || r.fullName || r.apl_username || 'Applicant',
          email: r.apl_email || r.email || '',
          username: r.apl_username || r.username || '',
          requestedRole: 'Editor',
          status: (r.apl_status || r.status || 'pending').toLowerCase() === 'pending' ? 'PENDING_APPROVAL' : r.status,
          submittedAt: r.createdAt || r.submittedAt || new Date().toISOString(),
        }))
        setPendingRequests(normalizedPending)
        window.dispatchEvent(new Event('pendingRequestsUpdated'))
      }
    } catch (err) {
      console.error('Failed to fetch user management data from backend:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersData()
  }, [])

  // Modals & Feedback State
  const [rejectTarget, setRejectTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Password Re-Authentication Modal State for Administrative Actions (Demote Admin / Remove Member)
  const [authActionModal, setAuthActionModal] = useState({
    isOpen: false,
    type: null, // 'DEMOTE' | 'REMOVE'
    targetUser: null,
  })
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false)
  const [adminPasswordError, setAdminPasswordError] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState(null) // null or number (e.g., 3, 2, 1)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)

  const actionMenuRef = useRef(null)

  // Sync with pendingRequestsUpdated event and localStorage
  const updatePendingStorage = (updated) => {
    setPendingRequests(updated)
    localStorage.setItem('pendingAccessRequests', JSON.stringify(updated))
    window.dispatchEvent(new Event('pendingRequestsUpdated'))
  }

  const updateStaffStorage = (updated) => {
    setStaffMembers(updated)
    localStorage.setItem('staffMembersList', JSON.stringify(updated))
    localStorage.setItem('activeUsersList', JSON.stringify(updated))
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionMenuId(null)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpenActionMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Guardrail calculations
  const activePendingList = pendingRequests.filter((r) => r.status === 'PENDING_APPROVAL')
  const pendingCount = activePendingList.length
  const totalStaffCount = staffMembers.length

  // Number of administrators currently in the system
  const adminCount = staffMembers.filter((u) => u.role === 'Admin').length

  // Helper to record an audit log event to localStorage and dispatch event
  const recordAuditEvent = ({
    actionType,
    actionLabel,
    category = 'ACCESS',
    severity = 'info',
    isSecurityAlert = false,
    targetUser,
    details,
  }) => {
    try {
      const stored = localStorage.getItem('auditLogsList')
      const currentLogs = stored ? JSON.parse(stored) : []
      const newLog = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        actor: {
          id: currentUserId || null,
          fullName: currentAdminFullName || 'Administrator',
          username: currentAdminUsername || 'admin',
          email: currentAdminEmail || 'admin@futurevisionhome.com',
        },
        actionType,
        actionLabel,
        category,
        severity,
        isSecurityAlert,
        targetUser: {
          fullName: targetUser?.fullName || 'Unknown',
          username: targetUser?.username || 'user',
          email: targetUser?.email || '',
        },
        details,
        metadata: {
          ipAddress: '127.0.0.1 (Local UI)',
          sessionType: 'Web UI (Active Session)',
          authMethod: isSecurityAlert ? 'Password Re-Auth' : 'Session Token',
        },
      }

      const updated = [newLog, ...currentLogs]
      localStorage.setItem('auditLogsList', JSON.stringify(updated))
      window.dispatchEvent(new Event('auditLogsUpdated'))
    } catch {
      // ignore
    }
  }

  // Handlers for Pending Requests
  const handleApproveRequest = async (request) => {
    try {
      await userManagementApi.updatePendingRequest(request.id, 'approved')
      showToast(`Approved ${request.fullName} as an Editor.`)
      await fetchUsersData()
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to approve request'
      showToast(errorMsg, 'error')
      await fetchUsersData()
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectTarget) return
    try {
      await userManagementApi.updatePendingRequest(rejectTarget.id, 'rejected')
      showToast(`Access request from ${rejectTarget.fullName} was rejected.`, 'info')
      setRejectTarget(null)
      await fetchUsersData()
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to reject request'
      showToast(errorMsg, 'error')
      setRejectTarget(null)
      await fetchUsersData()
    }
  }

  // Handlers for Administrative Action Authentication Modal
  const handleOpenDemoteModal = (user) => {
    setOpenActionMenuId(null)
    if (isSelfUser(user)) {
      showToast('You cannot demote your own account.', 'error')
      return
    }
    if (adminCount <= 1) {
      showToast('Cannot demote the only Administrator in the system.', 'error')
      return
    }
    setAdminPasswordInput('')
    setAdminPasswordError('')
    setAttemptsRemaining(null)
    setShowAdminPasswordInput(false)
    setAuthActionModal({
      isOpen: true,
      type: 'DEMOTE',
      targetUser: user,
    })
  }

  const handleOpenRemoveModal = (user) => {
    setOpenActionMenuId(null)

    // Self-delete protection
    if (isSelfUser(user)) {
      showToast('You cannot remove your own account.', 'error')
      return
    }

    // Last admin guardrail
    if (user.role === 'Admin' && adminCount <= 1) {
      showToast('Cannot remove the only Administrator in the system.', 'error')
      return
    }

    setAdminPasswordInput('')
    setAdminPasswordError('')
    setAttemptsRemaining(null)
    setShowAdminPasswordInput(false)
    setAuthActionModal({
      isOpen: true,
      type: 'REMOVE',
      targetUser: user,
    })
  }

  const handleCloseAuthModal = () => {
    setAuthActionModal({ isOpen: false, type: null, targetUser: null })
    setAdminPasswordInput('')
    setAdminPasswordError('')
    setAttemptsRemaining(null)
    setShowAdminPasswordInput(false)
    setIsVerifyingPassword(false)
  }

  const handleConfirmAuthAction = async (e) => {
    e?.preventDefault()
    if (!authActionModal.targetUser) return
    const targetUser = authActionModal.targetUser

    try {
      if (authActionModal.type === 'DEMOTE') {
        await userManagementApi.updateStaffRole(targetUser.id, 'editor')
        showToast(`${targetUser.fullName} was demoted to Editor.`)
      } else if (authActionModal.type === 'REMOVE') {
        await userManagementApi.updateStaffStatus(targetUser.id, 'disabled')
        showToast(`${targetUser.fullName} was removed from the staff directory.`, 'info')
      }
      await fetchUsersData()
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to update member'
      showToast(errorMsg, 'error')
      await fetchUsersData()
    } finally {
      handleCloseAuthModal()
    }
  }

  // Handlers for Staff Members
  const handleToggleRole = async (user) => {
    setOpenActionMenuId(null)

    if (user.role === 'Admin' && isSelfUser(user)) {
      showToast('You cannot demote your own account.', 'error')
      return
    }

    // Last admin guardrail: Cannot demote the only Admin
    if (user.role === 'Admin' && adminCount <= 1) {
      showToast('Cannot demote the only Administrator in the system.', 'error')
      return
    }

    if (user.role === 'Admin') {
      // Demoting Admin requires password re-authentication modal
      handleOpenDemoteModal(user)
    } else {
      // Promoting Editor to Admin
      try {
        await userManagementApi.updateStaffRole(user.id, 'admin')
        showToast(`${user.fullName} was promoted to Administrator.`)
        await fetchUsersData()
      } catch (err) {
        showToast(err?.response?.data?.error || err?.message || 'Failed to promote user', 'error')
      }
    }
  }

  // Format dates cleanly
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Recent'
    }
  }

  // Filtering for Pending Requests
  const filteredPending = activePendingList.filter((r) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q)
    )
  })

  // Filtering for Staff Members
  const filteredStaff = staffMembers.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    if (!q) return matchesRole
    const matchesQuery =
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    return matchesRole && matchesQuery
  })

  return (
    <div className="admin-section active">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`user-toast-banner ${toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'success'}`}
          role="status"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {toast.type === 'error' ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            ) : (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </>
            )}
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Section Header & Sub-Navigation */}
      <div className="user-mgmt-header-row">
        <div>
          <h2>User Management</h2>
          <p>
            {subTab === 'pending'
              ? 'Review and approve internal staff access requests.'
              : 'Manage staff directory roles and permissions.'}
          </p>
        </div>

        {/* 1. Sub-Navigation Tabs */}
        <div className="admin-subtabs" role="tablist" aria-label="User Management Views">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'pending'}
            className={`admin-subtab ${subTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('pending')
              setSearchQuery('')
            }}
          >
            <span>Pending Requests</span>
            <span className="admin-subtab-count" title={`${pendingCount} pending requests`}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'staff'}
            className={`admin-subtab ${subTab === 'staff' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('staff')
              setSearchQuery('')
            }}
          >
            <span>Staff Members</span>
            <span className="admin-subtab-count" title={`${totalStaffCount} staff members`}>
              {totalStaffCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="user-mgmt-toolbar">
        <div className="user-search-wrapper">
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
            className="user-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={
              subTab === 'pending'
                ? 'Search requests by name, email, username...'
                : 'Search staff by name, email, username...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="user-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="user-search-clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter for Staff Members */}
        {subTab === 'staff' && (
          <div className="user-role-filter-group">
            <button
              type="button"
              className={`user-filter-pill ${roleFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setRoleFilter('ALL')}
            >
              All Roles
            </button>
            <button
              type="button"
              className={`user-filter-pill ${roleFilter === 'Admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('Admin')}
            >
              Admins
            </button>
            <button
              type="button"
              className={`user-filter-pill ${roleFilter === 'Editor' ? 'active' : ''}`}
              onClick={() => setRoleFilter('Editor')}
            >
              Editors
            </button>
          </div>
        )}
      </div>

      {/* 2. PENDING REQUESTS VIEW */}
      {subTab === 'pending' && (
        <div className="user-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Work Email</th>
                <th>Username</th>
                <th>Date Requested</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.length > 0 ? (
                filteredPending.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-table-avatar">
                          {req.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || 'US'}
                        </div>
                        <span className="font-semibold text-slate-900">{req.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-600 font-medium">{req.email}</span>
                    </td>
                    <td>
                      <span className="user-username-badge font-mono">@{req.username}</span>
                    </td>
                    <td>
                      <span className="text-slate-500 text-sm">
                        {formatDate(req.submittedAt)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions justify-end">
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req)}
                          className="btn-user-approve"
                          title="Approve access request"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectTarget(req)}
                          className="btn-user-reject"
                          title="Reject access request"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="user-empty-table-cell">
                    <div className="user-empty-state">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="user-empty-icon"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                      <h4>No Pending Access Requests</h4>
                      <p>
                        {searchQuery
                          ? 'No requests match your current search criteria.'
                          : 'All internal staff sign-up requests have been reviewed.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. STAFF MEMBERS VIEW (Status/Active column removed) */}
      {subTab === 'staff' && (
        <div className="user-table-wrapper" ref={actionMenuRef}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Work Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((user) => {
                  const isSelf = isSelfUser(user)
                  const isLastAdmin = user.role === 'Admin' && adminCount <= 1

                  const initials =
                    user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'US'

                  const isMenuOpen = openActionMenuId === user.id

                  return (
                    <tr key={user.id}>
                      {/* 1. User Name & Monospace Username */}
                      <td>
                        <div className="user-name-cell">
                          <div className="user-table-avatar">
                            {initials}
                          </div>
                          <div className="user-info-stack">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{user.fullName}</span>
                              {isSelf && (
                                <span className="user-self-pill" title="Currently logged in">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="user-username-badge font-mono text-xs">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td>
                        <span className="text-slate-600 font-medium">{user.email}</span>
                      </td>

                      {/* 3. Role */}
                      <td>
                        <span
                          className={`admin-role-badge ${
                            user.role === 'Admin' ? 'role-admin' : 'role-editor'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* 4. Actions (Dropdown Menu or Current User Badge) */}
                      <td>
                        <div className="admin-actions justify-end relative">
                          {isSelf ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 px-3 py-1.5 rounded-full select-none"
                              title="Your active account — manage via Account Settings modal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-slate-400"
                              >
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              Current User
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionMenuId((prev) => (prev === user.id ? null : user.id))
                                }
                                className={`btn-user-more ${isMenuOpen ? 'active' : ''}`}
                                aria-label={`Actions for ${user.fullName}`}
                                aria-expanded={isMenuOpen}
                                aria-haspopup="true"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </button>

                              {/* Action Menu Popover */}
                              {isMenuOpen && (
                                <div
                                  className="user-action-popover"
                                  role="menu"
                                  aria-orientation="vertical"
                                >
                                  {/* Role Toggle Option */}
                                  <button
                                    type="button"
                                    className="user-action-popover-item"
                                    onClick={() => handleToggleRole(user)}
                                    title={
                                      isLastAdmin
                                        ? 'Cannot demote the only Administrator.'
                                        : user.role === 'Admin'
                                        ? 'Demote user to Editor'
                                        : 'Promote user to Admin'
                                    }
                                    role="menuitem"
                                  >
                                    {user.role === 'Admin' ? (
                                      <>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                          <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span>Demote to Editor</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                        </svg>
                                        <span>Promote to Admin</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="user-action-popover-divider" />

                                  {/* Remove Staff Member Option */}
                                  <button
                                    type="button"
                                    className="user-action-popover-item danger"
                                    onClick={() => handleOpenRemoveModal(user)}
                                    title={
                                      isLastAdmin
                                        ? 'Cannot remove the only Administrator.'
                                        : 'Remove staff member from directory'
                                    }
                                    role="menuitem"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                    <span>Remove Member</span>
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="user-empty-table-cell">
                    <div className="user-empty-state">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="user-empty-icon"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <h4>No Staff Members Found</h4>
                      <p>
                        {searchQuery || roleFilter !== 'ALL'
                          ? 'No staff members match your current filter or search criteria.'
                          : 'No staff members found in the directory.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. REJECT CONFIRMATION MODAL */}
      {rejectTarget && (
        <AdminModal
          isOpen={Boolean(rejectTarget)}
          onClose={() => setRejectTarget(null)}
          title="Reject Access Request"
          subtitle="Confirm rejection of this internal staff registration request."
          maxWidth="max-w-lg"
        >
          <div className="delete-confirmation">
            <div className="delete-confirmation-body">
              <p>
                Are you sure you want to reject the access request from{' '}
                <strong>{rejectTarget.fullName}</strong> (
                <code>{rejectTarget.email}</code>)?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                This request will be removed from your review queue.
              </p>
            </div>
            <div className="delete-confirmation-footer">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleConfirmReject}
              >
                Reject Request
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* 5. ADMINISTRATIVE ACTION CONFIRMATION MODAL (WITH PASSWORD RE-AUTH) */}
      {authActionModal.isOpen && authActionModal.targetUser && (
        <AdminModal
          isOpen={authActionModal.isOpen}
          onClose={handleCloseAuthModal}
          title={
            authActionModal.type === 'DEMOTE'
              ? 'Demote Administrator'
              : 'Remove Staff Member'
          }
          subtitle="Password re-authentication is required to authorize this administrative change."
          maxWidth="max-w-lg"
        >
          <form className="delete-confirmation" onSubmit={handleConfirmAuthAction}>
            <div className="delete-confirmation-body">
              <p>
                {authActionModal.type === 'DEMOTE' ? (
                  <>
                    Are you sure you want to demote <strong>{authActionModal.targetUser.fullName}</strong> (
                    <code>{authActionModal.targetUser.email}</code>) to <strong>Editor</strong>?
                  </>
                ) : (
                  <>
                    Are you sure you want to remove <strong>{authActionModal.targetUser.fullName}</strong> (
                    <code>{authActionModal.targetUser.email}</code>) from the staff directory?
                  </>
                )}
              </p>
              <p className="text-sm text-slate-500 mt-2 mb-4">
                {authActionModal.type === 'DEMOTE'
                  ? 'They will lose access to administrative dashboard tabs and settings.'
                  : 'This will delete their workspace credentials and revoke their access.'}
              </p>

              {/* Inline Error Alert (Hook ready for teammate to trigger if backend validation fails) */}
              {adminPasswordError && (
                <div className="admin-login-alert mb-4" role="alert">
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
                    className="admin-login-alert-icon"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>{adminPasswordError}</span>
                    {typeof attemptsRemaining === 'number' && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md w-fit border border-red-200 dark:border-red-800/50">
                        {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} left
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Current Password Field with Show/Hide Eye Toggle */}
              <div className="admin-form-group text-left mt-2">
                <label htmlFor="authActionPassword" className="admin-field-label">
                  Enter your password to confirm this administrative action: <span className="admin-required-star">*</span>
                </label>
                <div className="admin-password-wrapper mt-1.5">
                  <input
                    type={showAdminPasswordInput ? 'text' : 'password'}
                    id="authActionPassword"
                    name="authActionPassword"
                    placeholder="Enter your current password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value)
                      if (adminPasswordError) setAdminPasswordError('')
                    }}
                    autoFocus
                    required
                    aria-label="Current admin password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowAdminPasswordInput((prev) => !prev)}
                    aria-label={showAdminPasswordInput ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showAdminPasswordInput ? (
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
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
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
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="delete-confirmation-footer">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleCloseAuthModal}
                disabled={isVerifyingPassword}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={authActionModal.type === 'DEMOTE' ? 'restore-confirm-btn !bg-amber-600 hover:!bg-amber-700 !border-amber-600' : 'delete-confirm-btn'}
                disabled={isVerifyingPassword}
              >
                {isVerifyingPassword ? (
                  <span>Verifying...</span>
                ) : authActionModal.type === 'DEMOTE' ? (
                  'Confirm Demotion'
                ) : (
                  'Remove Member'
                )}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}

export default AdminUsers
