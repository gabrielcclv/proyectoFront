import { Link, useParams } from 'react-router-dom'
import { useTranslation } from '../i18n.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { motion } from 'framer-motion'

const APIS = [
  { name: 'USGS Earthquake API', url: 'https://earthquake.usgs.gov/fdsnws/event/1/', type: 'SEISMOLOGY', color: 'var(--amber)' },
  { name: 'Open-Meteo Forecast', url: 'https://api.open-meteo.com/v1/forecast', type: 'METEOROLOGY', color: 'var(--teal)' },
]

const FEATURES = [
  { icon: '📡', key: 'feature_seismic', accent: 'var(--amber)' },
  { icon: '🌡', key: 'feature_weather', accent: 'var(--teal)' },
  { icon: '⚡', key: 'feature_realtime', accent: 'var(--blue)' },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const item      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }

export default function Home() {
  const { t }        = useTranslation()
  const { user }     = useAuth()
  const { lang = 'en' } = useParams()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '960px', margin: '0 auto' }}
    >
      {/* Hero */}
      <motion.section variants={item} style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
        {/* Decorative badge */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-amber">
            <span className="pulse-dot" style={{ background: 'var(--amber)', width: '5px', height: '5px' }} />
            {t('home.status_live')}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          lineHeight: 1.1,
          whiteSpace: 'pre-line',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {t('home.hero_title')}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.125rem',
          maxWidth: '560px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          {t('home.hero_sub')}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to={`/${lang}/dashboard`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              {t('home.cta_dashboard')} →
            </Link>
          ) : (
            <>
              <Link to={`/${lang}/login`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                {t('home.cta_login')} →
              </Link>
              <Link to={`/${lang}/earthquakes`} className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                {t('nav.earthquakes')}
              </Link>
            </>
          )}
        </div>
      </motion.section>

      {/* Divider with waveform decoration */}
      <motion.div variants={item} style={{ position: 'relative', margin: '0 0 3rem', overflow: 'hidden', height: '60px' }}>
        <svg viewBox="0 0 960 60" style={{ width: '100%', height: '60px' }}>
          <path
            d="M0 30 Q60 10 120 30 Q180 50 240 30 Q300 10 360 30 Q420 50 480 20 Q540 -5 600 30 Q660 55 720 30 Q780 10 840 30 Q900 50 960 30"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <circle cx="480" cy="20" r="4" fill="var(--amber)" />
        </svg>
      </motion.div>

      {/* Feature cards */}
      <motion.section variants={item} style={{ marginBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map((f) => (
            <div
              key={f.key}
              className="card"
              style={{ borderLeft: `3px solid ${f.accent}`, paddingLeft: '1.5rem' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: f.accent,
                marginBottom: '0.5rem',
              }}>
                {t(`home.${f.key}`)}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t(`home.${f.key}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* API sources */}
      <motion.section variants={item}>
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}>
          {t('home.apis_title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {APIS.map((api) => (
            <div key={api.name} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge" style={{ background: `${api.color}18`, color: api.color, border: `1px solid ${api.color}40`, fontSize: '0.625rem' }}>
                  {api.type}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {api.name}
                </span>
              </div>
              <a
                href={api.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = api.color}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {api.url.replace('https://', '').split('/')[0]} ↗
              </a>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}