import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/authApi'

function RequestAccess() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError('')
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { fullName, email, username, password } = formData

    // Basic validation
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your work email.')
      return
    }

    if (!validateEmail(email)) {
      setError('Please provide a valid work email address.')
      return
    }

    if (!username.trim()) {
      setError('Please choose a username.')
      return
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    if (!password) {
      setError('Please enter a password.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.signup({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim(),
      })

      setIsSubmitted(true)
    } catch (err) {
      const errorMessage =
        err?.error ||
        err?.message ||
        'An error occurred while submitting your request. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-header admin-login-page !m-0 !min-h-screen relative">
      <Link
        to="/login"
        className="admin-login-back-btn"
        aria-label="Back to login"
        title="Back to login"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </Link>

      <div className="container admin-login-container">
        <div className="admin-login-card">
          <h1 className="page-title">Request Access</h1>
          <p className="page-subtitle">Submit your details for administrator review and role assignment.</p>

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="admin-form-group">
              <label htmlFor="fullName" className="admin-field-label">
                Full Name <span className="admin-required-star">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="e.g. Aira Batumbakal"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="name"
                required
              />
            </div>

            {/* Work Email */}
            <div className="admin-form-group">
              <label htmlFor="email" className="admin-field-label">
                Work Email <span className="admin-required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. aira@futurevisonhome.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>

            {/* Username */}
            <div className="admin-form-group">
              <label htmlFor="username" className="admin-field-label">
                Username <span className="admin-required-star">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="e.g. Aira"
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div className="admin-form-group">
              <label htmlFor="password" className="admin-field-label">
                Password <span className="admin-required-star">*</span>
              </label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
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
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
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
                      aria-hidden="true"
                    >
                      <path d="M12 5c-7 0-11 8-11 8s4 8 11 8 11-8 11-8-4-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>



            <button
              type="submit"
              className="admin-login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="admin-login-loading">
                  <span className="admin-login-spinner" aria-hidden="true"></span>
                  <span>Submitting Request...</span>
                </span>
              ) : (
                'SUBMIT REQUEST'
              )}
            </button>
          </form>

          <div className="admin-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="admin-auth-link">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Post-Submit Modal Overlay */}
      {isSubmitted && (
        <div className="admin-status-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="statusModalTitle">
          <div className="admin-status-modal-card">
            <div className="admin-status-modal-icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="admin-status-modal-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 id="statusModalTitle" className="admin-status-modal-title">Account Under Review</h2>
            <p className="admin-status-modal-body">
              Your request has been submitted to the workspace administrator. You will receive an email confirmation once your account and role have been approved.
            </p>
            <button
              type="button"
              className="admin-login-btn"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default RequestAccess
