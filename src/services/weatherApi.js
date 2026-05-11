/**
 * weatherApi.js — Open-Meteo forecast API (no API key required).
 *
 * Base URL: https://api.open-meteo.com/v1/forecast
 *
 * Returns daily arrays (one value per day for `forecast_days`):
 *   daily.time[]                  — ISO date string
 *   daily.temperature_2m_max[]    — °C
 *   daily.temperature_2m_min[]    — °C
 *   daily.precipitation_sum[]     — mm
 *   daily.windspeed_10m_max[]     — km/h
 *   daily.weathercode[]           — WMO code
 *
 * @ai-assisted Claude proposed the URLSearchParams pattern; reviewed against
 *              Open-Meteo docs at open-meteo.com/en/docs.
 */

const BASE = 'https://api.open-meteo.com/v1/forecast'

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// WEATHERAPI.JS — Integración con API Meteorológica Open-Meteo
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Obtiene pronósticos meteorológicos de 7 días sin necesidad de API key.
// 
// API: https://api.open-meteo.com/v1/forecast
// Documentación: https://open-meteo.com/en/docs
// 
// Datos disponibles:
//   - Temperatura máxima/mínima diarias (°C)
//   - Precipitación total (mm)
//   - Velocidad máxima del viento (km/h)
//   - Código meteorológico WMO
//   - Zona horaria automática
// 
// @ai-assisted Claude proposed the URLSearchParams pattern; reviewed against
//              Open-Meteo docs at open-meteo.com/en/docs.

const BASE = 'https://api.open-meteo.com/v1/forecast'

/**
 * Ubicaciones predefinidas para selección rápida.
 * Lat/Lon de ciudades importantes en diferentes continentes.
 */
export const LOCATION_PRESETS = {
  madrid:       { lat: 40.4168, lon: -3.7038,   label: 'Madrid' },
  sanfrancisco: { lat: 37.7749, lon: -122.4194, label: 'San Francisco' },
  tokyo:        { lat: 35.6895, lon: 139.6917,  label: 'Tokyo' },
  lima:         { lat: -12.046, lon: -77.0428,  label: 'Lima' },
}

/**
 * Obtiene pronóstico de 7 días para coordenadas específicas.
 * 
 * @param {object} opts
 * @param {number} opts.lat  - Latitud
 * @param {number} opts.lon  - Longitud
 * @param {number} opts.days - Días de pronóstico (default 7)
 * @returns {Promise<object>} Respuesta de Open-Meteo con datos diarios
 */
export async function getForecast({ lat, lon, days = 7 } = {}) {
  const url = new URL(BASE)
  // Parámetros de ubicación
  url.searchParams.set('latitude',  String(lat))
  url.searchParams.set('longitude', String(lon))
  // Variables meteorológicas a solicitar
  url.searchParams.set('daily', [
    'temperature_2m_max',      // Temp máxima diaria
    'temperature_2m_min',      // Temp mínima diaria
    'precipitation_sum',       // Precipitación total
    'windspeed_10m_max',       // Velocidad máxima del viento
    'weathercode',             // Código WMO (describe condiciones)
  ].join(','))
  url.searchParams.set('forecast_days', String(days))
  url.searchParams.set('timezone', 'auto')  // Auto-detecta zona horaria

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  return res.json()
}

/**
 * Convierte código meteorológico WMO a etiqueta descriptiva en inglés.
 * Útil para mostrar interpretación legible en UI.
 * 
 * Referencia: https://www.noaa.gov/education/weather-faqs/why-do-we-use-fahrenheit
 * 
 * @param {number} code - Código WMO
 * @returns {string} Descripción legible (ej: "Light rain", "Overcast")
 */
export function describeWeatherCode(code) {
  const codes = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Rain showers', 81: 'Moderate showers', 82: 'Violent showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Thunderstorm + heavy hail',
  }
  return codes[code] ?? `Code ${code}`
}

/**
 * Normaliza respuesta bruta de Open-Meteo a formato amigable.
 * Convierte arrays diarios en objetos accesibles.
 * 
 * @param {object} raw - Respuesta bruta del API Open-Meteo
 * @returns {Array} Array de objetos diarios normalizados
 */
export function normaliseforecast(raw) {
  if (!raw?.daily?.time) return []
  const { daily } = raw
  return daily.time.map((date, i) => ({
    date,
    tempMax:   daily.temperature_2m_max[i],
    tempMin:   daily.temperature_2m_min[i],
    precip:    daily.precipitation_sum[i],
    windMax:   daily.windspeed_10m_max[i],
    code:      daily.weathercode[i],
    condition: describeWeatherCode(daily.weathercode[i]),
  }))
}