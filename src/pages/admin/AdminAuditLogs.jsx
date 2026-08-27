import { useState, useEffect } from 'react'
import { auditLogApi } from '../../api/auditLogApi'

// Initial seed fallback audit logs if offline
const INITIAL_AUDIT_LOGS = [
  {
    id: 'log_101',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    actor: {
      fullName: 'Jorge Omar K. Fuertes',
      username: 'jfuertes',
      email: 'jorge.fuertes@futurevisionhome.com',
    },
    actionType: 'PROMOTED_TO_ADMIN',
    actionLabel: 'Promoted to Admin',
    category: 'ROLES',
    severity: 'info',
    isSecurityAlert: false,
    targetUser: {
      fullName: 'Rishaye Abigail G. Melad',
      username: 'rmelad',
      email: 'rishaye.melad@futurevisionhome.com',
    },
    details: 'Upgraded role permissions for Rishaye Abigail G. Melad from Editor to Administrator.',
  },
  {
    id: 'log_102',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: {
      fullName: 'Jorge Omar K. Fuertes',
      username: 'jfuertes',
      email: 'jorge.fuertes@futurevisionhome.com',
    },
    actionType: 'APPROVED_REQUEST',
    actionLabel: 'Approved Staff Request',
    category: 'ACCESS',
    severity: 'info',
    isSecurityAlert: false,
    targetUser: {
      fullName: 'Gwyenth A. Lim',
      username: 'glim',
      email: 'gwyenth.lim@futurevisionhome.com',
    },
    details: 'Approved internal staff access request for Gwyenth A. Lim; assigned default Editor role.',
  },
  {
    id: 'log_103',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    actor: {
      fullName: 'Rishaye Abigail G. Melad',
      username: 'rmelad',
      email: 'rishaye.melad@futurevisionhome.com',
    },
    actionType: 'DEMOTED_TO_EDITOR',
    actionLabel: 'Demoted to Editor',
    category: 'ROLES',
    severity: 'warning',
    isSecurityAlert: true,
    targetUser: {
      fullName: 'Jamaine Grace M. Tuazon',
      username: 'jtuazon',
      email: 'jamaine.tuazon@futurevisionhome.com',
    },
    details: 'Demoted Jamaine Grace M. Tuazon from Administrator to Editor with password re-authentication challenge.',
  },
  {
    id: 'log_104',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor: {
      fullName: 'System Security',
      username: 'system',
      email: 'security@futurevisionhome.com',
    },
    actionType: 'AUTH_FAILED_LOCKOUT',
    actionLabel: 'Failed Auth Lockout',
    category: 'SECURITY',
    severity: 'critical',
    isSecurityAlert: true,
    targetUser: null, // System event target displays as clean em-dash (—)
    details: 'Multiple invalid password attempts detected during admin verification challenge.',
  },
  {
    id: 'log_105',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    actor: {
      fullName: 'Jorge Omar K. Fuertes',
      username: 'jfuertes',
      email: 'jorge.fuertes@futurevisionhome.com',
    },
    actionType: 'REJECTED_REQUEST',
    actionLabel: 'Rejected Access Request',
    category: 'ACCESS',
    severity: 'warning',
    isSecurityAlert: false,
    targetUser: {
      fullName: 'Angel Faith Fernando',
      username: 'afernando',
      email: 'angel.fernando@external-guest.com',
    },
    details: 'Rejected access request for Angel Faith Fernando from unregistered external email domain.',
  },
  {
    id: 'log_106',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    actor: {
      fullName: 'Jorge Omar K. Fuertes',
      username: 'jfuertes',
      email: 'jorge.fuertes@futurevisionhome.com',
    },
    actionType: 'REMOVED_STAFF_MEMBER',
    actionLabel: 'Removed Staff Member',
    category: 'STAFF',
    severity: 'critical',
    isSecurityAlert: true,
    targetUser: {
      fullName: 'Angel Faith Fernando',
      username: 'afernando',
      email: 'angel.fernando@futurevisionhome.com',
    },
    details: 'Deleted staff credentials and revoked workspace access for Angel Faith Fernando with password confirmation.',
  },
]

function AdminAuditLogs() {
  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('auditLogsList')
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch {
      return []
    }
  })

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  // Current logged in admin identification from session
  const currentUserId =
    sessionStorage.getItem('currentUserId') ||
    localStorage.getItem('currentUserId') ||
    sessionStorage.getItem('userId') ||
    localStorage.getItem('userId') ||
    ''

  const currentAdminEmail =
    sessionStorage.getItem('userEmail') ||
    localStorage.getItem('userEmail') ||
    ''

  const currentAdminUsername =
    sessionStorage.getItem('userName') ||
    localStorage.getItem('userName') ||
    ''

  const fetchAuditLogs = async () => {
    try {
      const data = await auditLogApi.getAllLogs()
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((l) => ({
          id: l.id,
          timestamp: l.timestamp || l.createdAt,
          actor: {
            id: l.actor?.id || l.actorUserId,
            fullName: l.actor?.fullname || l.actor?.fullName || l.actor?.username || 'Administrator',
            username: l.actor?.username || 'admin',
            email: l.actor?.email || '',
            role: l.actor?.role || 'admin',
          },
          actionType: l.actionType || l.action_type || 'SYSTEM_ACTION',
          actionLabel: l.actionLabel || l.actionType || 'System Event',
          category: l.category || 'ACCESS',
          severity: l.severity || 'info',
          isSecurityAlert: Boolean(l.isSecurityAlert),
          targetUser: l.targetUser ? {
            fullName: l.targetUser.fullname || l.targetUser.fullName || l.targetUser.username,
            username: l.targetUser.username,
            email: l.targetUser.email,
          } : null,
          details: l.details || '',
          metadata: typeof l.metadata === 'string' ? JSON.parse(l.metadata || '{}') : (l.metadata || {}),
        }))
        setLogs(normalized)
        localStorage.setItem('auditLogsList', JSON.stringify(normalized))
      }
    } catch (err) {
      console.error('Failed to load audit logs from backend:', err)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  // Sync with auditLogsUpdated event and localStorage
  useEffect(() => {
    const syncLogs = () => {
      try {
        const stored = localStorage.getItem('auditLogsList')
        if (stored) {
          setLogs(JSON.parse(stored))
        }
      } catch {
        // keep current
      }
    }

    window.addEventListener('auditLogsUpdated', syncLogs)
    window.addEventListener('storage', syncLogs)
    return () => {
      window.removeEventListener('auditLogsUpdated', syncLogs)
      window.removeEventListener('storage', syncLogs)
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Filter application by search query
  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesActor =
        log.actor?.fullName?.toLowerCase().includes(q) ||
        log.actor?.username?.toLowerCase().includes(q) ||
        log.actor?.email?.toLowerCase().includes(q)
      const matchesTarget =
        log.targetUser?.fullName?.toLowerCase().includes(q) ||
        log.targetUser?.username?.toLowerCase().includes(q) ||
        log.targetUser?.email?.toLowerCase().includes(q)
      const matchesAction =
        log.actionLabel?.toLowerCase().includes(q) ||
        log.actionType?.toLowerCase().includes(q)
      const matchesDetails = log.details?.toLowerCase().includes(q)

      return matchesActor || matchesTarget || matchesAction || matchesDetails
    }

    return true
  })

  // Format timestamp
  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString)
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      return { datePart, timePart }
    } catch {
      return { datePart: 'Recent', timePart: '' }
    }
  }

  // Relative time helper
  const getRelativeTime = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    } catch {
      return ''
    }
  }

  // Export logs to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Action Type', 'Target Name', 'Target Email', 'Severity', 'Details']
      const rows = filteredLogs.map((l) => [
        `"${l.timestamp}"`,
        `"${l.actor?.fullName || ''}"`,
        `"${l.actor?.email || ''}"`,
        `"${l.actionLabel || l.actionType || ''}"`,
        `"${l.targetUser?.fullName || '—'}"`,
        `"${l.targetUser?.email || ''}"`,
        `"${l.severity || 'info'}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Audit logs exported successfully.')
    } catch {
      showToast('Failed to export logs.', 'error')
    }
  }

  // Minimal Action Type indicator with clean status dot (no capsule pills)
  const renderActionStatus = (log) => {
    let dotClass = 'bg-slate-400' // Slate dot (Neutral / General)

    if (
      log.severity === 'critical' ||
      log.isSecurityAlert ||
      log.actionType?.includes('REMOVED') ||
      log.actionType?.includes('LOCKOUT')
    ) {
      dotClass = 'bg-rose-500' // Rose dot (Critical / Security)
    } else if (
      log.severity === 'warning' ||
      log.actionType?.includes('DEMOTED') ||
      log.actionType?.includes('REJECTED')
    ) {
      dotClass = 'bg-amber-500' // Amber dot (Warning / Review)
    } else if (
      log.actionType?.includes('PROMOTED') ||
      log.actionType?.includes('APPROVED') ||
      log.severity === 'info'
    ) {
      dotClass = 'bg-emerald-500' // Emerald dot (Success / Positive)
    }

    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`}
          aria-hidden="true"
        />
        <span className="truncate">{log.actionLabel || log.actionType}</span>
      </div>
    )
  }

  return (
    <div className="admin-section active">
      {/* Toast Notification */}
      {toast && (
        <div className={`user-toast-banner ${toast.type === 'error' ? 'error' : 'success'}`} role="status">
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Subtitle */}
      <div className="user-mgmt-header-row !mb-4">
        <div>
          <h2>Audit Logs</h2>
          <p>Chronological record of administrative security events and access modifications.</p>
        </div>
      </div>

      {/* Streamlined Toolbar: Search Bar + Export CSV Action */}
      <div className="audit-decluttered-toolbar">
        <div className="user-search-wrapper audit-search-clean max-w-md">
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
            className="user-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search logs by actor, email, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="user-search-input !py-2"
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

        <button
          type="button"
          onClick={handleExportCSV}
          className="audit-export-btn"
          title="Download audit records as CSV"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Clean Table with Instant Hover Tooltip for Details */}
      <div className="user-table-wrapper">
        <table className="admin-table audit-table">
          <thead>
            <tr>
              <th style={{ width: '170px' }}>Timestamp</th>
              <th style={{ width: '210px' }}>Actor</th>
              <th style={{ width: '180px' }}>Action Type</th>
              <th style={{ width: '200px' }}>Target User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const { datePart, timePart } = formatTimestamp(log.timestamp)
                const relativeTime = getRelativeTime(log.timestamp)
                const isActorSelf = Boolean(
                  (currentUserId && (log.actor?.id || log.actorUserId) && String(log.actor?.id || log.actorUserId) === String(currentUserId)) ||
                  (currentAdminEmail && log.actor?.email && log.actor.email.trim().toLowerCase() === currentAdminEmail.trim().toLowerCase()) ||
                  (currentAdminUsername && log.actor?.username && log.actor.username.trim().toLowerCase() === currentAdminUsername.trim().toLowerCase())
                )

                const actorInitials =
                  log.actor?.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'AD'

                const isSystemEvent = !log.targetUser || log.actionType?.includes('LOCKOUT')

                return (
                  <tr
                    key={log.id}
                    className={log.isSecurityAlert ? 'audit-row-alert' : ''}
                  >
                    {/* 1. Timestamp */}
                    <td>
                      <div className="audit-time-cell">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {datePart}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {timePart} {relativeTime ? `• ${relativeTime}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* 2. Actor */}
                    <td>
                      <div className="user-name-cell">
                        <div className="user-table-avatar text-xs font-bold">
                          {actorInitials}
                        </div>
                        <div className="user-info-stack">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {log.actor?.fullName || 'System'}
                            </span>
                            {isActorSelf && (
                              <span className="user-self-pill" title="Acting administrator">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            @{log.actor?.username || 'system'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Action Type with Status Dot */}
                    <td>{renderActionStatus(log)}</td>

                    {/* 4. Target User */}
                    <td>
                      {isSystemEvent ? (
                        <span className="text-slate-400 font-medium text-base select-none">—</span>
                      ) : (
                        <div className="user-info-stack">
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {log.targetUser.fullName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {log.targetUser.email}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 5. Details with Clean Hover Tooltip */}
                    <td>
                      <div className="audit-tooltip-container">
                        <span className="audit-details-condensed">
                          {log.details}
                        </span>
                        <div className="audit-hover-popover" role="tooltip">
                          <p className="audit-popover-text">{log.details}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="user-empty-table-cell">
                  <div className="user-empty-state">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="user-empty-icon"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <h4>No Audit Logs Found</h4>
                    <p>No event records match your current criteria.</p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="user-filter-pill active mt-2"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAuditLogs
