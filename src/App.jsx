// ═════════════════════════════════════════════════════════════════════════════
// APP.JSX — Main Router Configuration
// ═════════════════════════════════════════════════════════════════════════════
// Define la estructura de rutas de la aplicación con protección de autenticación.
// Todas las rutas son localizadas con :lang (en/es) en la URL para que los
// enlaces sean compartibles en el idioma correcto.

import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useI18n } from './i18n.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import NavBar        from './components/NavBar.jsx'

import Home        from './pages/Home.jsx'
import Login       from './pages/Login.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import Earthquakes from './pages/Earthquakes.jsx'
import Weather     from './pages/Weather.jsx'
import NotFound    from './pages/NotFound.jsx'

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LangWrapper — Middleware que sincroniza idioma URL ↔ Context I18n            │
// └─────────────────────────────────────────────────────────────────────────────┘
// Asegura que el parámetro :lang en la URL refleje el idioma actual en el Context.
// Esto permite que los enlaces sean compartibles con el idioma correcto.
// Ej: /es/earthquakes lleva al usuario a la versión en español
//
// Validación: Solo permite 'en' y 'es'. Redirecciona a /en si hay URL invalida.
function LangWrapper({ children }) {
  const { lang } = useParams()
  const { setLocale } = useI18n()

  const valid = ['en', 'es']
  if (!valid.includes(lang)) return <Navigate to="/en" replace />

  // Sincroniza el contexto i18n con la URL (lightweight - solo setState si cambió)
  setLocale(lang)
  return children
}

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ ESTRUCTURA DE RUTAS                                                         │
// └─────────────────────────────────────────────────────────────────────────────┘
// /                    → Redirige a /en (idioma por defecto)
// /:lang               → Layout con NavBar que contiene todas las subrutas
//   /                  → Home (página publica)
//   /login             → Login (página publica)
//   /dashboard         → Dashboard (protegida)
//   /earthquakes       → Sísmica en vivo (protegida)
//   /weather           → Pronóstico meteorológico (protegida)
//   /:lang/*           → 404 NotFound page
// 
// Notas:
// - ProtectedRoute valida autenticación antes de renderizar
// - LangWrapper sincroniza :lang con el Context i18n
// - Cualquier ruta desconocida redirige a /en

export default function App() {
  return (
    <Routes>
      {/* Root: redirige a idioma por defecto (en) */}
      <Route path="/" element={<Navigate to="/en" replace />} />

      {/* Árbol localizado: todas las rutas tienen :lang en URL */}
      <Route path="/:lang" element={<LangWrapper><NavBar /></LangWrapper>}>
        {/* Rutas públicas */}
        <Route index           element={<Home />} />
        <Route path="login"    element={<Login />} />
        
        {/* Rutas privadas - requieren autenticación */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="earthquakes"
          element={
            <ProtectedRoute>
              <Earthquakes />
            </ProtectedRoute>
          }
        />
        <Route
          path="weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback para rutas no definidas dentro del :lang */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Fallback global para cualquier ruta no definida */}
      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  )
}