import { useTranslation } from '../i18n.jsx'

function magColor(mag) {
  if (mag >= 7.0) return 'var(--red)'
  if (mag >= 6.0) return '#f97316'
  if (mag >= 5.0) return 'var(--amber)'
  return 'var(--teal)'
}

function magBadgeClass(mag) {
  if (mag >= 7.0) return 'badge badge-red'
  if (mag >= 6.0) return 'badge'
  if (mag >= 5.0) return 'badge badge-amber'
  return 'badge badge-blue'
}

function formatUTC(date) {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

export default function EarthquakeList({ earthquakes, limit }) {
  const { t } = useTranslation()
  const list = limit ? earthquakes.slice(0, limit) : earthquakes

  if (!list.length) {
    return (
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
        {t('earthquakes.empty')}
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              t('earthquakes.col_mag'),
              t('earthquakes.col_place'),
              t('earthquakes.col_depth'),
              t('earthquakes.col_time'),
            ].map((col) => (
              <th key={col} style={{
                textAlign: 'left',
                padding: '8px 12px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.06em',
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((eq, i) => (
            <tr
              key={eq.id}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-highlight)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
            >
              {/* Magnitude */}
              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                <span
                  className={magBadgeClass(eq.mag)}
                  style={{
                    color: magColor(eq.mag),
                    background: `${magColor(eq.mag)}18`,
                    border: `1px solid ${magColor(eq.mag)}50`,
                    fontSize: '0.8125rem',
                  }}
                >
                  {eq.mag?.toFixed(1) ?? '—'}
                </span>
                {eq.tsunami && (
                  <span className="badge badge-red" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>
                    🌊
                  </span>
                )}
              </td>

              {/* Place */}
              <td style={{ padding: '10px 12px', color: 'var(--text-primary)', maxWidth: '300px' }}>
                <a
                  href={eq.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                >
                  {eq.place ?? '—'}
                </a>
              </td>

              {/* Depth */}
              <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {eq.depth != null ? `${Math.round(eq.depth)} ${t('earthquakes.unit_km')}` : '—'}
              </td>

              {/* Time */}
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatUTC(eq.time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
