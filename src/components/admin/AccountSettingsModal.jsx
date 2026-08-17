import { useState, useEffect } from 'react'
import AdminModal from './AdminModal'

function AccountSettingsModal({
  isOpen,
  onClose,
  userRole = 'Admin',
  userName = 'Administrator',
  userEmail = 'admin@futurevisionhome.com',
  onRoleToggle,
}) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'security'

  // Form states for password tab
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Copy-to-clipboard state
  const [copiedField, setCopiedField] = useState(null) // 'email' | 'username'

  // Derive username and initials
  const username =
    userRole === 'Admin'
      ? 'admin'
      : userName.toLowerCase().replace(/\s+/g, '') || 'editor'

  const initials =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || (userRole === 'Editor' ? 'ED' : 'AD')

  // Real-time validation rules
  const isMinLengthMet = newPassword.length >= 8
  const isMatchMet = confirmPassword.length > 0 && newPassword === confirmPassword
  const isFormValid = Boolean(currentPassword && isMinLengthMet && isMatchMet)

  // Reset states when opening/closing modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab('profile')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccessMessage('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setCopiedField(null)
    }
  }, [isOpen])

  const handleCopy = (text, fieldName) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldName)
        setTimeout(() => setCopiedField(null), 2000)
      })
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }

    if (!newPassword) {
      setError('Please enter a new password.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    const storedPassword =
      sessionStorage.getItem('userPassword') ||
      localStorage.getItem('userPassword') ||
      '12345678'

    if (currentPassword !== storedPassword) {
      setError('The current password you entered is incorrect.')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      sessionStorage.setItem('userPassword', newPassword)
      localStorage.setItem('userPassword', newPassword)

      setIsSubmitting(false)
      setSuccessMessage('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        onClose()
      }, 1500)
    }, 600)
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      subtitle="Manage your profile preferences and security credentials."
      maxWidth="max-w-2xl"
    >
      <div className="account-modal-container">
        {/* Dual-Tab Navigation Bar */}
        <div className="account-modal-tabs" role="tablist" aria-label="Account Settings Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`account-modal-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile')
              setError('')
            }}
          >
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>General Profile</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            className={`account-modal-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('security')
              setError('')
            }}
          >
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
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB A: GENERAL PROFILE */}
        {activeTab === 'profile' && (
          <div className="account-tab-content animate-fadeIn">
            {/* Avatar & Role Header Card */}
            <div className="account-profile-header-card">
              <div className="account-avatar-wrapper-large">
                <div className="account-avatar-large">
                  <span>{initials}</span>
                </div>
                <span className="account-status-badge-dot" title="Active authenticated session" />
              </div>

              <div className="account-profile-header-info">
                <div className="account-profile-name-row">
                  <h3 className="account-profile-fullname">{userName}</h3>
                  <span
                    className={`admin-role-badge ${
                      userRole === 'Editor' ? 'role-editor' : 'role-admin'
                    }`}
                  >
                    {userRole}
                  </span>
                </div>

                <div className="account-status-pill">
                  <span className="account-status-indicator-dot" />
                  <span>Active Session</span>
                </div>
              </div>
            </div>

            {/* Metadata Cards with 1-Click Copy */}
            <div className="account-metadata-grid">
              {/* Work Email Card */}
              <div className="account-metadata-card">
                <div className="account-metadata-card-header">
                  <span className="account-info-label">Work Email</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(userEmail, 'email')}
                    className="account-copy-btn"
                    title="Copy Email"
                    aria-label="Copy Email"
                  >
                    {copiedField === 'email' ? (
                      <span className="account-copied-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
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
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="account-metadata-value truncate" title={userEmail}>
                  {userEmail}
                </span>
              </div>

              {/* Username Card */}
              <div className="account-metadata-card">
                <div className="account-metadata-card-header">
                  <span className="account-info-label">Username</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`@${username}`, 'username')}
                    className="account-copy-btn"
                    title="Copy Username"
                    aria-label="Copy Username"
                  >
                    {copiedField === 'username' ? (
                      <span className="account-copied-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
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
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="account-metadata-value font-mono">@{username}</span>
              </div>
            </div>

            {/* Permission Summary Card */}
            <div className="account-permission-card">
              <div className="account-permission-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div className="account-permission-text">
                <h4 className="account-permission-title">
                  {userRole === 'Admin' ? 'Administrator Privileges' : 'Editor Privileges'}
                </h4>
                <p className="account-permission-desc">
                  {userRole === 'Admin'
                    ? 'As an Administrator, you have full access to User Management, Audit Logs, and all dashboard modules.'
                    : 'As an Editor, you have access to create and manage Visionistas, News & Gallery, and Partner content.'}
                </p>
              </div>
            </div>

            {/* Dev Role Switcher (Dev Mode) */}
            {onRoleToggle && (
              <div className="account-role-switcher-container">
                <div className="account-role-switcher-header">
                  <span className="account-info-label">Dev Role Preview</span>
                </div>
                <div className="role-toggle-group">
                  <button
                    type="button"
                    className={`role-toggle-btn ${userRole === 'Admin' ? 'active' : ''}`}
                    onClick={() => onRoleToggle('Admin')}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    className={`role-toggle-btn ${userRole === 'Editor' ? 'active' : ''}`}
                    onClick={() => onRoleToggle('Editor')}
                  >
                    Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="account-tab-content animate-fadeIn">
            <form onSubmit={handlePasswordSubmit} className="account-password-form" noValidate>
              {/* Inline Error Alert */}
              {error && (
                <div className="admin-login-alert" role="alert">
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
                  <span>{error}</span>
                </div>
              )}

              {/* Inline Success Alert */}
              {successMessage && (
                <div className="account-success-alert" role="status">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. Current Password */}
              <div className="admin-form-group">
                <label htmlFor="currentPassword" className="admin-field-label">
                  Current Password <span className="admin-required-star">*</span>
                </label>
                <div className="admin-password-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    tabIndex={-1}
                    disabled={isSubmitting}
                  >
                    {showCurrentPassword ? (
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

              {/* 2. New Password */}
              <div className="admin-form-group">
                <label htmlFor="newPassword" className="admin-field-label">
                  New Password <span className="admin-required-star">*</span>
                </label>
                <div className="admin-password-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    tabIndex={-1}
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? (
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
                {/* Inline Hint for New Password */}
                <div className="account-field-hint">
                  <span
                    className={`account-hint-badge ${
                      newPassword.length > 0
                        ? isMinLengthMet
                          ? 'is-valid'
                          : 'is-invalid'
                        : ''
                    }`}
                  >
                    {isMinLengthMet ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hint-icon"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="hint-bullet" aria-hidden="true">•</span>
                    )}
                    <span>Must be at least 8 characters</span>
                  </span>
                </div>
              </div>

              {/* 3. Confirm New Password */}
              <div className="admin-form-group">
                <label htmlFor="confirmPassword" className="admin-field-label">
                  Confirm New Password <span className="admin-required-star">*</span>
                </label>
                <div className="admin-password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                    tabIndex={-1}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
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
                {/* Inline Hint for Confirm Password */}
                <div className="account-field-hint">
                  <span
                    className={`account-hint-badge ${
                      confirmPassword.length > 0
                        ? isMatchMet
                          ? 'is-valid'
                          : 'is-invalid'
                        : ''
                    }`}
                  >
                    {isMatchMet ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hint-icon"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : confirmPassword.length > 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hint-icon"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <span className="hint-bullet" aria-hidden="true">•</span>
                    )}
                    <span>
                      {confirmPassword.length > 0
                        ? isMatchMet
                          ? 'Passwords match'
                          : 'Passwords do not match'
                        : 'Must match new password'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="account-modal-actions">
                <button
                  type="button"
                  className="account-btn-cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="account-btn-save"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <span className="admin-login-loading">
                      <span className="admin-login-spinner" aria-hidden="true" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminModal>
  )
}

export default AccountSettingsModal
