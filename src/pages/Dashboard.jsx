import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from '../i18n.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useEarthquakes } from '../hooks/useEarthquakes.js'
import { useWeather } from '../hooks/useWeather.js'
import { LOCATION_PRESETS } from '../services/weatherApi.js'
import EarthquakeList from '../components/EarthquakeList.jsx'
import MagnitudeChart from '../components/MagnitudeChart.jsx'
import { TemperatureChart } from '../components/WeatherChart.jsx'
import { LoadingState, ErrorState } from '../components/LoadingState.jsx'
import { motion } from 'framer-motion'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Dashboard() {
  const { t }           = useTranslation()
  const { user }        = useAuth()
  const { lang = 'en' } = useParams()

  // Earthquake data
  const { earthquakes, count, isLoading: eqLoading, isError: eqError, refetch: eqRefetch } = useEarthquakes({ minMagnitude: 4.5, days: 7 })

  // Weather data — default to Madrid
  const [preset, setPreset] = useState('madrid')
  const loc = LOCATION_PRESETS[preset]
  const { forecast, isLoading: wLoading } = useWeather({ lat: loc.lat, lon: loc.lon })

  // Derived earthquake stats
  const mags       = earthquakes.map(e => e.mag).filter(Boolean)
  const maxMag     = mags.length ? Math.max(...mags).toFixed(1) : '—'
  const avgMag     = mags.length ? (mags.reduce((a, b) => a + b, 0) / mags.length).toFixed(2) : '—'

  // Derived weather stats (today)
  const today       = forecast[0]
  const tempMax     = today?.tempMax != null ? `${today.tempMax.toFixed(1)} °C` : '—'
  const precipTotal = today?.precip  != null ? `${today.precip.toFixed(1)} mm` : '—'
  const windPeak    = today?.windMax != null ? `${today.windMax.toFixed(0)} km/h` : '—'

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.75rem' }}>{t('dashboard.title')}</h1>
          <span className="badge badge-green">
            <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
            {t('home.status_live')}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {t('dashboard.subtitle')} · {user?.firstName} {user?.lastName}
        </p>
      </motion.div>

      {/* Metric row — seismic */}
      <motion.section variants={item} style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '12px',
        }}>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.total_events')}</div>
            <div className="metric-value" style={{ color: 'var(--amber)' }}>{eqLoading ? '—' : count}</div>
            <div className="metric-sub">M≥4.5 · USGS</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.max_magnitude')}</div>
            <div className="metric-value">{eqLoading ? '—' : maxMag}</div>
            <div className="metric-sub">global</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.avg_magnitude')}</div>
            <div className="metric-value">{eqLoading ? '—' : avgMag}</div>
            <div className="metric-sub">last 7d</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.temp_now')}</div>
            <div className="metric-value" style={{ color: 'var(--teal)' }}>{wLoading ? '—' : tempMax}</div>
            <div className="metric-sub">{loc.label}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.precipitation')}</div>
            <div className="metric-value">{wLoading ? '—' : precipTotal}</div>
            <div className="metric-sub">today</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('dashboard.wind_max')}</div>
            <div className="metric-value">{wLoading ? '—' : windPeak}</div>
            <div className="metric-sub">10m level</div>
          </div>
        </div>
      </motion.section>

      {/* Two-column layout */}
      <motion.section variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>

        {/* Earthquakes panel */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', marginBottom: '2px' }}>{t('dashboard.recent_events')}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t('common.source')}: USGS
              </p>
            </div>
            <Link to={`/${lang}/earthquakes`} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              {t('dashboard.see_all_eq')} →
            </Link>
          </div>

          {eqLoading && <LoadingState message={t('earthquakes.loading')} />}
          {eqError   && <ErrorState  message={t('earthquakes.error')} onRetry={eqRefetch} />}
          {!eqLoading && !eqError && (
            <>
              <MagnitudeChart earthquakes={earthquakes} />
              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
              <EarthquakeList earthquakes={earthquakes} limit={5} />
            </>
          )}
        </div>

        {/* Weather panel */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', marginBottom: '2px' }}>{t('dashboard.weather_forecast')}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t('common.source')}: Open-Meteo
              </p>
            </div>
            <Link to={`/${lang}/weather`} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              {t('dashboard.see_weather')} →
            </Link>
          </div>

          {/* Location preset selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="preset-select">{t('dashboard.location_label')}</label>
            <select
              id="preset-select"
              className="input"
              value={preset}
              onChange={e => setPreset(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              {Object.entries(LOCATION_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </div>

          {wLoading && <LoadingState message={t('weather.loading')} />}
          {!wLoading && forecast.length > 0 && (
            <>
              <TemperatureChart forecast={forecast} />
              {/* Daily table */}
              <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      {['Date', 'Max', 'Min', 'Rain', 'Wind'].map(h => (
                        <th key={h} style={{ padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.slice(0, 5).map((d, i) => (
                      <tr key={d.date} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '5px 8px', color: 'var(--text-secondary)', textAlign: 'left' }}>{d.date.slice(5)}</td>
                        <td style={{ padding: '5px 8px', color: 'var(--amber)',           textAlign: 'right' }}>{d.tempMax?.toFixed(1)}°</td>
                        <td style={{ padding: '5px 8px', color: 'var(--teal)',            textAlign: 'right' }}>{d.tempMin?.toFixed(1)}°</td>
                        <td style={{ padding: '5px 8px', color: 'var(--blue)',            textAlign: 'right' }}>{d.precip?.toFixed(1)}</td>
                        <td style={{ padding: '5px 8px', color: 'var(--text-muted)',      textAlign: 'right' }}>{d.windMax?.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}