import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTranslation } from '../i18n.jsx'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { t, locale }   = useTranslation()
  const navigate         = useNavigate()
  const { lang = 'en' } = useParams()

  function switchLang() {
    const next = locale === 'en' ? 'es' : 'en'
    // Swap the lang prefix in the current path
    const path = window.location.pathname
    const newPath = path.replace(`/${lang}`, `/${next}`)
    navigate(newPath, { replace: true })
  }

  function handleLogout() {
    logout()
    navigate(`/${lang}`)
  }

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textDecoration: 'none',
    color:      isActive ? 'var(--amber)' : 'var(--text-secondary)',
    background: isActive ? 'var(--amber-glow)' : 'transparent',
    border:     isActive ? '1px solid var(--amber-dim)' : '1px solid transparent',
    transition: 'all 0.15s',
  })

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(6,10,18,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
      }}>
        <nav style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '56px',
        }}>
          {/* Logo */}
          <NavLink
            to={`/${lang}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '1rem' }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              background: 'var(--amber)',
              borderRadius: '6px',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" fill="#000" />
                <circle cx="8" cy="8" r="6" stroke="#000" strokeWidth="1.5" fill="none" />
                <line x1="8" y1="0" x2="8" y2="4" stroke="#000" strokeWidth="1.5" />
                <line x1="8" y1="12" x2="8" y2="16" stroke="#000" strokeWidth="1.5" />
                <line x1="0" y1="8" x2="4" y2="8" stroke="#000" strokeWidth="1.5" />
                <line x1="12" y1="8" x2="16" y2="8" stroke="#000" strokeWidth="1.5" />
              </svg>
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: '600',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {t('app.name')}
            </span>
          </NavLink>

          {/* Nav links */}
          <NavLink to={`/${lang}`} end style={linkStyle}>{t('nav.home')}</NavLink>

          {user && (
            <>
              <NavLink to={`/${lang}/dashboard`}   style={linkStyle}>{t('nav.dashboard')}</NavLink>
              <NavLink to={`/${lang}/earthquakes`} style={linkStyle}>{t('nav.earthquakes')}</NavLink>
              <NavLink to={`/${lang}/weather`}     style={linkStyle}>{t('nav.weather')}</NavLink>
            </>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
            <span className="pulse-dot" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--green)', letterSpacing: '0.06em' }}>
              {t('home.status_live')}
            </span>
          </div>

          {/* Language switcher */}
          <button
            onClick={switchLang}
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '5px 10px',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
            title={t('nav.language')}
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={user.image}
                alt={user.username}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-light)' }}
              />
              <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <NavLink to={`/${lang}/login`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}>
              {t('nav.login')}
            </NavLink>
          )}
        </nav>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
    </>
  )
}