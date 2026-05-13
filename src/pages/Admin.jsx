import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../services/authService.js';

const SESSION_KEY = 'adminAuthenticated'
const SESSION_TIME_KEY = 'adminLoginTime'
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours

function Admin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuthed = sessionStorage.getItem(SESSION_KEY) === 'true'
    const loginTime = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10)
    const expired = Date.now() - loginTime > SESSION_MAX_AGE
    if (isAuthed && !expired) {
      navigate('/admin')
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_TIME_KEY)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    try {
      const { data } = await loginAdmin({ username, password })

      sessionStorage.setItem(SESSION_KEY, 'true')
      sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString())
      localStorage.setItem('token', data.result);
      navigate('/admin')
    } catch (err) {
      setError('Invalid username or password. Please try again.')
      setPassword('')
    }
  }

  return (
    <section className="page-header admin-login-page !m-0 !min-h-screen">
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
