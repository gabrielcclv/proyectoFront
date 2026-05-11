// ═════════════════════════════════════════════════════════════════════════════
// AUTHCONTEXT.JSX — Autenticación JWT Global
// ═════════════════════════════════════════════════════════════════════════════
// Gestiona el estado global de autenticación contra dummyjson.com.
// 
// CICLO DE VIDA DE TOKENS:
//   1. Access token  → En memoria (protege contra XSS, no persiste)
//   2. Refresh token → sessionStorage (persiste en reload, se borra al cerrar tab)
//   3. Auto-refresh  → Cada 25 min (tokens expiran a los 30 min)
// 
// SEGURIDAD:
//   - Access token EN MEMORIA solo: evita ataques XSS via localStorage
//   - Refresh token EN sessionStorage: permite reauth en reload pero no persistencia
//   - Auto-logout en fallo de refresh: protege contra sesiones expiradas
// 
// @ai-assisted Claude proposed the in-memory access token pattern; verified against
//              OWASP Auth Cheat Sheet at owasp.org/www-community/attacks/xss.

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { login as apiLogin, refreshToken, getMe } from '../services/authApi.js'

const AuthContext = createContext(null)

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ AuthProvider — Gestiona sesión JWT del usuario                              │
// └─────────────────────────────────────────────────────────────────────────────┘
export function AuthProvider({ children }) {
  // Estado de autenticación
  const [user, setUser]           = useState(null)       // Objeto usuario: {id, username, email, ...}
  const [token, setToken]         = useState(null)       // Access token en memoria
  const [isLoading, setIsLoading] = useState(true)       // Flag de inicialización
  const refreshTimerRef           = useRef(null)        // Referencia al timer de auto-refresh

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ scheduleRefresh — Programa auto-refresh del access token cada 25 min     │
  // └─────────────────────────────────────────────────────────────────────────┘
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

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ logout — Limpia sesión actual y detiene auto-refresh                    │
  // └─────────────────────────────────────────────────────────────────────────┘
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('refreshToken')  // Elimina refresh token almacenado
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)  // Cancela timer
  }, [])

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ useEffect: Restaurar sesión en mount                                    │
  // └─────────────────────────────────────────────────────────────────────────┘
  // Al cargar: intenta reusar el refresh token existente en sessionStorage.
  // Si lo consigue, recarga el usuario. Si falla, limpia sesión.
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

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ login — Autentica usuario con credenciales                              │
  // └─────────────────────────────────────────────────────────────────────────┘
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

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ authFetch — Fetch con auto-refresh si access token expira (401)         │
  // └─────────────────────────────────────────────────────────────────────────┘
  // Wrapper de fetch() que:
  //   1. Incluye Authorization header con access token
  //   2. Si recibe 401 (no autorizado): intenta refresh automático
  //   3. Si refresh falla: logout y lanza error
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