import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAdminAuth } from '../context/AdminAuthContext'

const SESSION_KEY = 'adminAuthenticated'
const SESSION_TIME_KEY = 'adminLoginTime'
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours

function Admin() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuthed = sessionStorage.getItem(SESSION_KEY) === 'true'
    const loginTime = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10)
    const token = sessionStorage.getItem('token')
    const expired = Date.now() - loginTime > SESSION_MAX_AGE

    if (isAuthed && token && !expired) {
      navigate('/admin')
    } else {
      sessionStorage.clear()
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.loginAdmin({
        username: username.trim(),
        password: password.trim(),
      })

      const rawUser = response?.result?.user || response?.user || response?.result || response
      const token = response?.result?.token || response?.token

      login(rawUser, token)
      navigate('/admin')
    } catch (err) {
      const errorMessage =
        err?.error ||
        err?.message ||
        'Invalid username or password. Please try again.'
      setError(errorMessage)
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-header admin-login-page !m-0 !min-h-screen relative">
      <Link to="/" className="admin-login-back-btn" aria-label="Back to website" title="Back to website">
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
          <h1 className="page-title">Admin Login</h1>
          <p className="page-subtitle">Welcome back! Log in to continue.</p>
          <form className="admin-login-form" onSubmit={handleSubmit}>
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

            <div className="admin-form-group">
              <label htmlFor="adminUsername" className="admin-field-label">
                Username <span className="admin-required-star">*</span>
              </label>
              <input
                type="text"
                id="adminUsername"
                name="username"
                autoFocus
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                disabled={isSubmitting}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Admin username"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="adminPassword" className="admin-field-label">
                Password <span className="admin-required-star">*</span>
              </label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Admin password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
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
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
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
                  <span>Logging in...</span>
                </span>
              ) : (
                'LOG IN'
              )}
            </button>
          </form>

          <div className="admin-auth-footer">
            <p>
              Need an account?{' '}
              <Link to="/internal/request-access" className="admin-auth-link">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Admin
