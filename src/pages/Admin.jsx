import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi.js'

const SESSION_KEY = 'adminAuthenticated'
const SESSION_TIME_KEY = 'adminLoginTime'
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours

const ADMIN_USER = 'admin'
const ADMIN_PASS = '12345678'

function Admin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuthed = (localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)) === 'true'
    const loginTime = parseInt(localStorage.getItem(SESSION_TIME_KEY) || sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10)
    const expired = Date.now() - loginTime > SESSION_MAX_AGE
    if (isAuthed && !expired) {
      navigate('/admin', { replace: true })
    } else {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_TIME_KEY)
      localStorage.removeItem('token')
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_TIME_KEY)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)

    // Check default / local dev admin credentials
    const isDefaultAdmin = username.trim() === ADMIN_USER && password === ADMIN_PASS

    try {
      const data = await authApi.loginAdmin({ username: username.trim(), password })

      localStorage.setItem(SESSION_KEY, 'true')
      localStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
      if (data?.result?.token) {
        localStorage.setItem('token', data.result.token)
        sessionStorage.setItem('token', data.result.token)
      }
      sessionStorage.setItem(SESSION_KEY, 'true')
      sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
      navigate('/admin', { replace: true })
    } catch (err) {
      if (isDefaultAdmin) {
        // Fallback for default admin if backend is offline or unreachable
        localStorage.setItem(SESSION_KEY, 'true')
        localStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
        sessionStorage.setItem(SESSION_KEY, 'true')
        sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
        navigate('/admin', { replace: true })
        return
      }

      if (err?.retryAfter) {
        const seconds = typeof err.retryAfter === 'number' ? err.retryAfter : (err.retryAfter?.seconds || err.retryAfter)
        setError(`Too many failed attempts. Please try again in ${seconds} seconds.`)
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Invalid username or password. Please try again.')
      }
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-header admin-login-page !m-0 !min-h-screen">
      <div className="container admin-login-container">
        <div className="admin-login-card">
          <Link to="/" className="admin-login-back" aria-label="Back to Website">
            <svg
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
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Website
          </Link>

          <h1 className="page-title">Admin Login</h1>
          <p className="page-subtitle">Welcome back! Log in to continue.</p>
          
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <input
                type="text"
                id="adminUsername"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                aria-label="Admin username"
                disabled={loading}
                required
              />
            </div>
            
            <div className="admin-form-group">
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="Admin password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="19"
                      height="19"
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
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? (
                <span className="admin-login-loading">
                  <span className="admin-login-spinner" aria-hidden="true"></span>
                  LOGGING IN...
                </span>
              ) : (
                'LOG IN'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Admin
