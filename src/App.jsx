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

/**
 * LangWrapper syncs the URL :lang segment to the i18n context.
 * This keeps locale in the URL so links are shareable.
 */
function LangWrapper({ children }) {
  const { lang } = useParams()
  const { setLocale } = useI18n()

  const valid = ['en', 'es']
  if (!valid.includes(lang)) return <Navigate to="/en" replace />

  // Sync context on every render (lightweight — just a setState call if it changed)
  setLocale(lang)
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/en" replace />} />

      {/* Localised tree */}
      <Route path="/:lang" element={<LangWrapper><NavBar /></LangWrapper>}>
        <Route index           element={<Home />} />
        <Route path="login"    element={<Login />} />
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
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  )
}