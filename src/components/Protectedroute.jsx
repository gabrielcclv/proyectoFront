import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTranslation } from '../i18n.jsx'

/**
 * ProtectedRoute — guards a route behind authentication.
 *
 * If the user is not logged in, redirects to /:lang/login and preserves
 * the current location in state.from so the login page can redirect back.
 *
 * While auth state is being restored from sessionStorage (isLoading),
 * renders a minimal loading screen to avoid a flicker redirect.
 */
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const { lang = 'en' } = useParams()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          {t('common.loading')}
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={`/${lang}/login`}
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}