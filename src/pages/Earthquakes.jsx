import { useState, Suspense, lazy } from 'react'
import { useTranslation } from '../i18n.jsx'
import { useEarthquakes } from '../hooks/useEarthquakes.js'
import EarthquakeList from '../components/Earthquakelist.jsx'
import MagnitudeChart from '../components/MagnitudeChart.jsx'
import { LoadingState, ErrorState } from '../components/LoadingState.jsx'
import { motion } from 'framer-motion'

// Lazy-load the map to avoid SSR issues with Leaflet
const EarthquakeMap = lazy(() => import('../components/EarthquakeMap.jsx'))

const DAY_OPTIONS = [7, 14, 30]
const MAG_OPTIONS = [4.5, 5.0, 6.0, 7.0]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Earthquakes() {
  const { t } = useTranslation()

  const [days,   setDays]   = useState(7)
  const [minMag, setMinMag] = useState(4.5)

  const { earthquakes, count, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useEarthquakes({ minMagnitude: minMag, days })

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.75rem' }}>{t('earthquakes.title')}</h1>
              {isFetching && (
                <span className="badge badge-amber">
                  <span className="pulse-dot" style={{ width: '5px', height: '5px', background: 'var(--amber)' }} />
                  syncing
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {t('earthquakes.subtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {t('common.last_updated')}: {lastUpdated}
            </span>
            <button onClick={() => refetch()} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              ↺ {t('common.retry')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label>{t('earthquakes.filter_days')}</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {DAY_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.8125rem',
                  background:    days === d ? 'var(--amber-glow)' : 'transparent',
                  color:         days === d ? 'var(--amber)' : 'var(--text-secondary)',
                  border:        days === d ? '1px solid var(--amber-dim)' : '1px solid var(--border)',
                  borderRadius:  'var(--radius-md)',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>{t('earthquakes.filter_mag')}</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {MAG_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => setMinMag(m)}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.8125rem',
                  background:   minMag === m ? 'var(--amber-glow)' : 'transparent',
                  color:        minMag === m ? 'var(--amber)' : 'var(--text-secondary)',
                  border:       minMag === m ? '1px solid var(--amber-dim)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                M{m.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
        {!isLoading && (
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-muted">{count} {t('earthquakes.count')}</span>
          </div>
        )}
      </motion.div>

      {/* Loading / error */}
      {isLoading && <LoadingState message={t('earthquakes.loading')} />}
      {isError   && <ErrorState  message={t('earthquakes.error')} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {/* Map */}
          <motion.div variants={item} className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {t('earthquakes.map_title')}
            </h2>
            <Suspense fallback={<LoadingState message="Loading map…" />}>
              <EarthquakeMap earthquakes={earthquakes} />
            </Suspense>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: 'M≥7.0', color: '#ef4444' },
                { label: 'M≥6.0', color: '#f97316' },
                { label: 'M≥5.0', color: '#f59e0b' },
                { label: 'M≥4.5', color: '#14b8a6' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: l.color, opacity: 0.8 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Magnitude chart */}
          <motion.div variants={item} className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {t('earthquakes.chart_title')} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(last 50)</span>
            </h2>
            <MagnitudeChart earthquakes={earthquakes} />
          </motion.div>

          {/* Event list */}
          <motion.div variants={item} className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {t('earthquakes.list_title')}
            </h2>
            <EarthquakeList earthquakes={earthquakes} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}