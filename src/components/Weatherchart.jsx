import {
  ComposedChart, Line, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useTranslation } from '../i18n.jsx'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--text-primary)',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value} {p.unit ?? ''}
        </div>
      ))}
    </div>
  )
}

export function TemperatureChart({ forecast }) {
  const { t } = useTranslation()
  const data = forecast.map(d => ({
    date:    d.date.slice(5),
    max:     d.tempMax,
    min:     d.tempMin,
    avg:     d.tempMax != null && d.tempMin != null
               ? parseFloat(((d.tempMax + d.tempMin) / 2).toFixed(1))
               : null,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} unit="°" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone" dataKey="max" name={t('weather.temp_max')}
          fill="rgba(245,158,11,0.12)" stroke="var(--amber)" strokeWidth={2}
        />
        <Area
          type="monotone" dataKey="min" name={t('weather.temp_min')}
          fill="rgba(20,184,166,0.12)" stroke="var(--teal)" strokeWidth={2}
        />
        <Line
          type="monotone" dataKey="avg" name="Avg"
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function PrecipChart({ forecast }) {
  const { t } = useTranslation()
  const data = forecast.map(d => ({ date: d.date.slice(5), precip: d.precip }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} unit="mm" />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="precip" name={t('weather.chart_precip')}
          fill="var(--blue)" opacity={0.75} radius={[3, 3, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function WindChart({ forecast }) {
  const { t } = useTranslation()
  const data = forecast.map(d => ({ date: d.date.slice(5), wind: d.windMax }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} unit=" km/h" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone" dataKey="wind" name={t('weather.chart_wind')}
          fill="rgba(139,92,246,0.12)" stroke="#8b5cf6" strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}