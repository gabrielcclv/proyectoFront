import { Link, useParams } from 'react-router-dom'
import { useTranslation } from '../i18n.jsx'
import { motion } from 'framer-motion'

export default function NotFound() {
  const { t } = useTranslation()
  const { lang } = useParams()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--gray-500)' }}>
        {t('notfound_message') || 'Page not found'}
      </p>
      <Link
        to={`/${lang}`}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--primary)',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.target.style.opacity = '1')}
      >
        {t('go_home') || 'Go Home'}
      </Link>
    </motion.div>
  )
}
