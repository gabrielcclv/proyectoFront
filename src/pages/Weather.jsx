import { useState } from 'react'
import { useTranslation } from '../i18n.jsx'
import { useWeather } from '../hooks/useWeather.js'
import { LOCATION_PRESETS } from '../services/weatherApi.js'
import { Temperaturechart, Precipchart, Windchart } from '../components/Weatherchart.jsx'
import { LoadingState, ErrorState } from '../components/LoadingState.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = ['tab_temp', 'tab_precip', 'tab_wind']

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Weather() {
  const { t } = useTranslation()

  const [lat,    setLat]    = useState(LOCATION_PRESETS.madrid.lat)
  const [lon,    setLon]    = useState(LOCATION_PRESETS.madrid.lon)
  const [latIn,  setLatIn]  = useState(String(LOCATION_PRESETS.madrid.lat))
  const [lonIn,  setLonIn]  = useState(String(LOCATION_PRESETS.madrid.lon))
  const [tab,    setTab]    = useState('tab_temp')
  const [error,  setError]  = useState('')

  const { forecast, isLoading, isError, refetch, timezone } = useWeather({ lat, lon })

  function applyPreset(key) {
    const p = LOCATION_PRESETS[key]
    setLatIn(String(p.lat))
    setLonIn(String(p.lon))
    setLat(p.lat)
    setLon(p.lon)
    setError('')
  }

  function handleFetch() {
    const parsedLat = parseFloat(latIn)
    const parsedLon = parseFloat(lonIn)
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      setError('Latitude must be between -90 and 90.'); return
    }
    if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      setError('Longitude must be between -180 and 180.'); return
    }
    setError('')
    setLat(parsedLat)
    setLon(parsedLon)
  }

  // Derived stats from full forecast
  const tempMax    = forecast.length ? Math.max(...forecast.map(d => d.tempMax ?? -Infinity)).toFixed(1) : '—'
  const tempMin    = forecast.length ? Math.min(...forecast.map(d => d.tempMin ?? Infinity)).toFixed(1) : '—'
  const precipTot  = forecast.length ? forecast.reduce((s, d) => s + (d.precip ?? 0), 0).toFixed(1) : '—'
  const windPeak   = forecast.length ? Math.max(...forecast.map(d => d.windMax ?? 0)).toFixed(0) : '—'

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{t('weather.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {t('weather.subtitle')}
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={item} className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          {/* Coordinate inputs */}
          <div>
            <label>{t('weather.location_label')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.625rem' }}>{t('weather.lat')}</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  min="-90"
                  max="90"
                  value={latIn}
                  onChange={e => setLatIn(e.target.value)}
                  style={{ width: '120px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.625rem' }}>{t('weather.lon')}</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  min="-180"
                  max="180"
                  value={lonIn}
                  onChange={e => setLonIn(e.target.value)}
                  style={{ width: '120px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button onClick={handleFetch} className="btn btn-primary" style={{ padding: '0.625rem 1rem' }}>
                  {t('weather.fetch')}
                </button>
              </div>
            </div>
          </div>

          {/* Preset buttons */}
          <div>
            <label>Presets</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(LOCATION_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="btn btn-outline"
                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                >
                  {t(`weather.preset_${key.replace('sanfrancisco', 'sf')}`)}
                </button>
              ))}
            </div>
          </div>

          {timezone && (
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              TZ: {timezone}
            </div>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '0.75rem',
            background: 'var(--red-glow)',
            border: '1px solid var(--red-dim)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--red)',
          }}>
            {error}
          </div>
        )}
      </motion.div>

      {/* Metric stats */}
      {!isLoading && forecast.length > 0 && (
        <motion.div variants={item} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '1.5rem',
        }}>
          {[
            { label: t('weather.temp_max'),    value: `${tempMax}°C`,    color: 'var(--amber)' },
            { label: t('weather.temp_min'),    value: `${tempMin}°C`,    color: 'var(--teal)' },
            { label: t('weather.precip_total'), value: `${precipTot} mm`, color: 'var(--blue)' },
            { label: t('weather.wind_peak'),   value: `${windPeak} km/h`, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="metric-card">
              <div className="metric-label">{s.label}</div>
              <div className="metric-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
              <div className="metric-sub">7-day</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Chart tabs */}
      {!isLoading && !isError && forecast.length > 0 && (
        <motion.div variants={item} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
            {TABS.map(tb => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className="btn"
                style={{
                  padding: '5px 14px',
                  fontSize: '0.8125rem',
                  background:   tab === tb ? 'var(--amber-glow)' : 'transparent',
                  color:        tab === tb ? 'var(--amber)' : 'var(--text-muted)',
                  border:       tab === tb ? '1px solid var(--amber-dim)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {t(`weather.${tb}`)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'tab_temp'   && <TemperatureChart forecast={forecast} />}
              {tab === 'tab_precip' && <PrecipChart      forecast={forecast} />}
              {tab === 'tab_wind'   && <WindChart         forecast={forecast} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Daily forecast table */}
      {!isLoading && !isError && forecast.length > 0 && (
        <motion.div variants={item} className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Daily breakdown
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Condition', 'Max °C', 'Min °C', 'Rain mm', 'Wind km/h'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'left', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast.map((d, i) => (
                <tr key={d.date} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{d.date}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)'   }}>{d.condition}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--amber)'          }}>{d.tempMax?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--teal)'           }}>{d.tempMin?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--blue)'           }}>{d.precip?.toFixed(1)  ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#8b5cf6'               }}>{d.windMax?.toFixed(0) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {isLoading && <LoadingState message={t('weather.loading')} />}
      {isError   && <ErrorState  message={t('weather.error')} onRetry={refetch} />}
    </motion.div>
  )
}
