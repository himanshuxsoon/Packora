import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clearSession, saveTokens } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: if a token exists, fetch the current user
  useEffect(() => {
    const token = localStorage.getItem('packora_access')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me/')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('packora_user', JSON.stringify(data))
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    saveTokens(data.access, data.refresh)
    const me = await api.get('/auth/me/')
    setUser(me.data)
    localStorage.setItem('packora_user', JSON.stringify(me.data))
    return me.data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register/', payload)
    saveTokens(data.tokens.access, data.tokens.refresh)
    setUser(data.user)
    localStorage.setItem('packora_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('packora_refresh')
    try {
      if (refresh) {
        await api.post('/auth/logout/', { refresh })
      }
    } catch {
      // best-effort — clear locally regardless
    }
    clearSession()
    setUser(null)
  }, [])

  const isAdmin = !!(user?.is_admin || user?.is_staff || user?.role === 'admin')

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, isAdmin, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
