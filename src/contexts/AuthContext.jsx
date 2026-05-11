import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { login as apiLogin, refreshToken, getMe } from '../services/authApi.js'

/**
 * AuthContext — JWT-based authentication via dummyjson.com.
 *
 * Token lifecycle:
 *  - Access token stored in memory (not localStorage) for XSS protection.
 *  - Refresh token stored in sessionStorage (survives tab reload, not persistence).
 *  - Auto-refresh runs every 25 min (tokens expire at 30 min).
 *
 * @ai-assisted Claude proposed the in-memory access token pattern; verified against
 *              OWASP Auth Cheat Sheet at owasp.org/www-community/attacks/xss.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [token, setToken]       = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef(null)

  // ── Helpers ──────────────────────────────────────────────
  const scheduleRefresh = useCallback((refreshTkn) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await refreshToken(refreshTkn)
        setToken(data.accessToken)
        sessionStorage.setItem('refreshToken', data.refreshToken)
        scheduleRefresh(data.refreshToken)
      } catch {
        logout()
      }
    }, 25 * 60 * 1000) // 25 min
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('refreshToken')
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
  }, [])

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem('refreshToken')
    if (!stored) { setIsLoading(false); return }

    refreshToken(stored)
      .then(async (data) => {
        setToken(data.accessToken)
        sessionStorage.setItem('refreshToken', data.refreshToken)
        const me = await getMe(data.accessToken)
        setUser(me)
        scheduleRefresh(data.refreshToken)
      })
      .catch(() => {
        sessionStorage.removeItem('refreshToken')
      })
      .finally(() => setIsLoading(false))
  }, [scheduleRefresh])

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password)
    setToken(data.accessToken)
    sessionStorage.setItem('refreshToken', data.refreshToken)
    setUser({
      id:        data.id,
      username:  data.username,
      email:     data.email,
      firstName: data.firstName,
      lastName:  data.lastName,
      image:     data.image,
    })
    scheduleRefresh(data.refreshToken)
    return data
  }, [scheduleRefresh])

  // ── Fetch with auto-refresh on 401 ──────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      // Try to refresh
      const stored = sessionStorage.getItem('refreshToken')
      if (stored) {
        try {
          const data = await refreshToken(stored)
          setToken(data.accessToken)
          sessionStorage.setItem('refreshToken', data.refreshToken)
          return fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${data.accessToken}` },
          })
        } catch {
          logout()
          throw new Error('Session expired')
        }
      }
      logout()
      throw new Error('Unauthorized')
    }
    return res
  }, [token, logout])

  const value = { user, token, isLoading, login, logout, authFetch }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}