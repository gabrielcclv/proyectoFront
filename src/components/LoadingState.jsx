import { useTranslation } from '../i18n.js'

export function LoadingState({ message }) {
  const { t } = useTranslation()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1.5rem',
    }}>
      {/* Animated seismograph-style loader */}
      <svg width="120" height="40" viewBox="0 0 120 40" style={{ overflow: 'visible' }}>
        <style>{`
          @keyframes wave {
            0%   { d: path("M0 20 Q10 20 20 20 Q30 20 40 20 Q50 20 60 20 Q70 20 80 20 Q90 20 100 20 Q110 20 120 20"); }
            25%  { d: path("M0 20 Q10 10 20 20 Q30 30 40 20 Q50 10 60 5  Q70 30 80 20 Q90 10 100 20 Q110 30 120 20"); }
            50%  { d: path("M0 20 Q10 30 20 20 Q30 10 40 20 Q50 30 60 35 Q70 10 80 20 Q90 30 100 20 Q110 10 120 20"); }
            75%  { d: path("M0 20 Q10 10 20 20 Q30 30 40 20 Q50 10 60 5  Q70 30 80 20 Q90 10 100 20 Q110 30 120 20"); }
            100% { d: path("M0 20 Q10 20 20 20 Q30 20 40 20 Q50 20 60 20 Q70 20 80 20 Q90 20 100 20 Q110 20 120 20"); }
          }
        `}</style>
        <path
          d="M0 20 Q10 20 20 20 Q30 20 40 20 Q50 20 60 20 Q70 20 80 20 Q90 20 100 20 Q110 20 120 20"
          fill="none"
          stroke="var(--amber)"
          strokeWidth="2"
          style={{ animation: 'wave 2s ease-in-out infinite' }}
        />
      </svg>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        {message ?? t('common.loading')}
      </p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '2rem' }}>⚠</span>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.875rem',
        color: 'var(--red)',
        maxWidth: '400px',
      }}>
        {message ?? t('common.error')}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline" style={{ marginTop: '0.5rem' }}>
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}