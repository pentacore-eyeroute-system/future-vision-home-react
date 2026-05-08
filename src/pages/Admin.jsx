import { useEffect, useState } from 'react'

const ADMIN_USER = 'admin'
const ADMIN_PASS = '12345678'
const SESSION_KEY = 'adminAuthenticated'
const SESSION_TIME_KEY = 'adminLoginTime'
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours

function Admin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const isAuthed = sessionStorage.getItem(SESSION_KEY) === 'true'
    const loginTime = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10)
    const expired = Date.now() - loginTime > SESSION_MAX_AGE
    if (isAuthed && !expired) {
      setAuthed(true)
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_TIME_KEY)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
      setAuthed(true)
      setPassword('')
      setUsername('')
      return
    }

    setError('Invalid username or password. Please try again.')
    setPassword('')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_TIME_KEY)
    setAuthed(false)
  }

  if (authed) {
    return (
      <section className="page-header admin-login-page admin-dashboard-page">
        <div className="container admin-login-container">
          <div className="admin-login-card">
            <h1 className="page-title">Admin Dashboard (placeholder)</h1>
            <p className="page-subtitle">
              You are logged in as admin. Full dashboard features will be added next.
            </p>
            <button className="admin-login-btn admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-header admin-login-page">
      <div className="container admin-login-container">
        <div className="admin-login-card">
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
                aria-label="Admin username"
              />
            </div>
            <div className="admin-form-group">
              <input
                type="password"
                id="adminPassword"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Admin password"
              />
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="admin-login-btn">
              LOG IN
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Admin
