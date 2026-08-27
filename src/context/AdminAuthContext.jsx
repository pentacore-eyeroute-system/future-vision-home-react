import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const isAuthed = sessionStorage.getItem('adminAuthenticated') === 'true'
    const token = sessionStorage.getItem('token')

    if (!isAuthed || !token) {
      return null
    }

    const username = sessionStorage.getItem('userName') || ''
    const fullName = sessionStorage.getItem('userFullName') || username || 'Administrator'
    const email = sessionStorage.getItem('userEmail') || ''
    const role = sessionStorage.getItem('userRole') || 'Admin'
    const id = sessionStorage.getItem('currentUserId') || null

    return {
      id,
      username,
      fullName,
      email,
      role,
      token,
      isAuthenticated: true,
    }
  })

  const login = useCallback((userData, token) => {
    const id = userData?.id || userData?.usr_id || ''
    const username = userData?.usr_username || userData?.username || ''
    const fullName = userData?.usr_fullname || userData?.fullName || username || 'Administrator'
    const email = userData?.usr_email || userData?.email || ''
    const role = (userData?.usr_role || userData?.role || 'admin').toLowerCase() === 'admin' ? 'Admin' : 'Editor'

    const sessionUser = {
      id: String(id),
      username,
      fullName,
      email,
      role,
      token,
      isAuthenticated: true,
    }

    if (token) {
      sessionStorage.setItem('token', token)
    }
    if (id) {
      sessionStorage.setItem('currentUserId', String(id))
      sessionStorage.setItem('userId', String(id))
    }
    sessionStorage.setItem('userName', username)
    sessionStorage.setItem('userFullName', fullName)
    sessionStorage.setItem('userEmail', email)
    sessionStorage.setItem('userRole', role)
    sessionStorage.setItem('adminAuthenticated', 'true')
    sessionStorage.setItem('adminLoginTime', Date.now().toString())

    // Clear any stale persistent storage credentials
    localStorage.removeItem('token')
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminLoginTime')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('userId')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userPassword')

    setCurrentUser(sessionUser)
    window.dispatchEvent(new Event('adminAuthUpdated'))
  }, [])

  const logout = useCallback(() => {
    sessionStorage.clear()
    localStorage.removeItem('token')
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminLoginTime')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('userId')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userPassword')

    setCurrentUser(null)
    window.dispatchEvent(new Event('adminAuthUpdated'))
  }, [])

  const updateUser = useCallback((updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updatedFields }
      if (updatedFields.role) {
        sessionStorage.setItem('userRole', updatedFields.role)
      }
      if (updatedFields.username) {
        sessionStorage.setItem('userName', updatedFields.username)
      }
      if (updatedFields.fullName) {
        sessionStorage.setItem('userFullName', updatedFields.fullName)
      }
      if (updatedFields.email) {
        sessionStorage.setItem('userEmail', updatedFields.email)
      }
      return next
    })
    window.dispatchEvent(new Event('adminAuthUpdated'))
  }, [])

  useEffect(() => {
    const handleSync = () => {
      const isAuthed = sessionStorage.getItem('adminAuthenticated') === 'true'
      const token = sessionStorage.getItem('token')

      if (!isAuthed || !token) {
        setCurrentUser(null)
      } else {
        const username = sessionStorage.getItem('userName') || ''
        const fullName = sessionStorage.getItem('userFullName') || username || 'Administrator'
        const email = sessionStorage.getItem('userEmail') || ''
        const role = sessionStorage.getItem('userRole') || 'Admin'
        const id = sessionStorage.getItem('currentUserId') || null

        setCurrentUser({
          id,
          username,
          fullName,
          email,
          role,
          token,
          isAuthenticated: true,
        })
      }
    }

    window.addEventListener('adminAuthUpdated', handleSync)
    return () => {
      window.removeEventListener('adminAuthUpdated', handleSync)
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser?.isAuthenticated),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  return context || {
    currentUser: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
  }
}
