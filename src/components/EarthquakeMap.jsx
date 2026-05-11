import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useTranslation } from '../i18n.jsx'

function magToRadius(mag) {
  return Math.max(4, (mag - 4) * 5 + 4)
}

function magToColor(mag) {
  if (mag >= 7.0) return '#ef4444'
  if (mag >= 6.0) return '#f97316'
  if (mag >= 5.0) return '#f59e0b'
  return '#14b8a6'
}

export default function EarthquakeMap({ earthquakes }) {
  const { t } = useTranslation()

  // Downsample for performance if many events
  const points = earthquakes.slice(0, 150)

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((eq) => (
        <CircleMarker
          key={eq.id}
          center={[eq.lat, eq.lon]}
          radius={magToRadius(eq.mag)}
          pathOptions={{
            fillColor: magToColor(eq.mag),
            fillOpacity: 0.7,
            color: magToColor(eq.mag),
            weight: 1,
            opacity: 0.9,
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.5 }}>
              <strong style={{ color: magToColor(eq.mag) }}>M {eq.mag?.toFixed(1)}</strong><br />
              {eq.place}<br />
              <span style={{ color: 'var(--text-muted)' }}>Depth: {Math.round(eq.depth)} km</span><br />
              <span style={{ color: 'var(--text-muted)' }}>{eq.time?.toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
              {eq.tsunami && <><br /><span style={{ color: 'var(--red)' }}>🌊 {t('earthquakes.tsunami')}</span></>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}