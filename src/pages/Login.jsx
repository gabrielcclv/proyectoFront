import { useState } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTranslation } from '../i18n.js'
import { motion } from 'framer-motion'

export default function Login() {
  const { login }       = useAuth()
  const { t }           = useTranslation()
  const navigate        = useNavigate()
  const location        = useLocation()
  const { lang = 'en' } = useParams()

  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname ?? `/${lang}/dashboard`

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch {
      setError(t('login.error_invalid'))
    } finally {
      setIsLoading(false)
    }
  }

  function fillDemo() {
    setUsername(t('login.demo_user'))
    setPassword(t('login.demo_pass'))
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--amber-glow)',
            border: '1px solid var(--amber-dim)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="4" fill="var(--amber)" />
              <circle cx="11" cy="11" r="8" stroke="var(--amber)" strokeWidth="1.5" fill="none" />
              <line x1="11" y1="1" x2="11" y2="5" stroke="var(--amber)" strokeWidth="1.5" />
              <line x1="11" y1="17" x2="11" y2="21" stroke="var(--amber)" strokeWidth="1.5" />
              <line x1="1" y1="11" x2="5" y2="11" stroke="var(--amber)" strokeWidth="1.5" />
              <line x1="17" y1="11" x2="21" y2="11" stroke="var(--amber)" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('login.title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="username">{t('login.username')}</label>
              <input
                id="username"
                className="input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password">{t('login.password')}</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-glow)',
                border: '1px solid var(--red-dim)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--red)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}
            >
              {isLoading ? t('login.loading') : t('login.submit')}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}>
              {t('login.demo_label')}
            </p>
            <button onClick={fillDemo} style={{
              width: '100%',
              background: 'var(--bg-raised)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>user: </span>
                <span style={{ color: 'var(--amber)' }}>{t('login.demo_user')}</span>
                {'  '}
                <span style={{ color: 'var(--text-muted)' }}>pass: </span>
                <span style={{ color: 'var(--amber)' }}>{t('login.demo_pass')}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('login.demo_hint')} ↵
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}