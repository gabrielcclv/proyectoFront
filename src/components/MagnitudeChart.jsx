import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useTranslation } from '../i18n.jsx'

function magToColor(mag) {
  if (mag >= 7.0) return '#ef4444'
  if (mag >= 6.0) return '#f97316'
  if (mag >= 5.0) return '#f59e0b'
  return '#14b8a6'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { place, mag, depth, time } = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--text-primary)',
      maxWidth: '240px',
    }}>
      <div style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>M {mag?.toFixed(1)}</div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{place}</div>
      <div style={{ color: 'var(--text-muted)' }}>Depth: {Math.round(depth)} km</div>
      <div style={{ color: 'var(--text-muted)' }}>{time?.toISOString().slice(0, 10)}</div>
    </div>
  )
}

export default function MagnitudeChart({ earthquakes }) {
  const { t } = useTranslation()

  // Show last 50 events sorted by time ascending
  const data = [...earthquakes]
    .sort((a, b) => a.time - b.time)
    .slice(-50)

  if (!data.length) return null

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis
            domain={[4, 'auto']}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={6} stroke="var(--red)" strokeDasharray="4 4" strokeWidth={1} />
          <Bar dataKey="mag" radius={[2, 2, 0, 0]} maxBarSize={12}>
            {data.map((entry, i) => (
              <Cell key={i} fill={magToColor(entry.mag)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}