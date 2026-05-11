// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// EARTHQUAKEAPI.JS — Integración con API de Terremotos de USGS
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Obtiene datos sísmicos en tiempo real del USGS Earthquake Hazards Program.
// 
// API: https://earthquake.usgs.gov/fdsnws/event/1/
// Documentación: https://earthquake.usgs.gov/fdsnws/event/1/
// 
// Cada terremoto retorna:
//   - Coordenadas: [longitud, latitud, profundidad_km]
//   - Magnitud, ubicación, timestamp, tsunami flag
//   - URL con detalles en USGS
// 
// @ai-assisted Claude proposed the URLSearchParams pattern; verified against
//              the USGS FDSN spec at earthquake.usgs.gov/fdsnws/event/1/.

const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/'

/**
 * Construye URL para consultar terremotos recientes con filtros.
 * 
 * @param {object} opts
 * @param {number} opts.minMagnitude - Filtro magnitud mínima (default 4.5)
 * @param {number} opts.days         - Días hacia atrás desde hoy (default 7)
 * @returns {string} URL completa con parámetros de query
 */
export function buildUSGSUrl({ minMagnitude = 4.5, days = 7 } = {}) {
  // Rango de fechas: hoy a 'days' días atrás
  const endtime   = new Date().toISOString().slice(0, 10)      // YYYY-MM-DD actual
  const starttime = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)

  // Construye URL con parámetros
  const url = new URL('query', BASE)
  url.searchParams.set('format',       'geojson')              // Formato GeoJSON
  url.searchParams.set('starttime',    starttime)              // Rango temporal
  url.searchParams.set('endtime',      endtime)
  url.searchParams.set('minmagnitude', String(minMagnitude))  // Solo magnitud > X
  url.searchParams.set('orderby',      'time')                 // Ordena por timestamp
  url.searchParams.set('limit',        '200')                  // Max 200 eventos

  return url.toString()
}

/**
 * Obtiene terremotos recientes del API de USGS.
 * 
 * @param {object} opts - Opciones de filtrado (minMagnitude, days)
 * @returns {Promise<object>} GeoJSON FeatureCollection con terremotos
 */
export async function getRecentEarthquakes({ minMagnitude = 4.5, days = 7 } = {}) {
  const url = buildUSGSUrl({ minMagnitude, days })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`USGS API ${res.status}`)
  return res.json()
}

/**
 * Normaliza datos GeoJSON de USGS a un formato estándar para la app.
 * Extrae las propiedades útiles de cada terremoto.
 * 
 * @param {object} geojson - GeoJSON FeatureCollection retornado por USGS
 * @returns {Array} Array de objetos earthquake normalizados
 */
export function normaliseEarthquakes(geojson) {
  if (!geojson?.features) return []
  return geojson.features.map((f) => ({
    id:      f.id,                              // ID único del evento
    lat:     f.geometry.coordinates[1],         // Latitud del epicentro
    lon:     f.geometry.coordinates[0],         // Longitud del epicentro
    depth:   f.geometry.coordinates[2],         // Profundidad en km
    mag:     f.properties.mag,                  // Magnitud en escala de Richter
    place:   f.properties.place,                // Descripción de ubicación
    time:    new Date(f.properties.time),       // Timestamp del evento
    tsunami: f.properties.tsunami === 1,        // Flag: ¿generó tsunami?
    url:     f.properties.url,                  // Link a página de detalles en USGS
    type:    f.properties.type,                 // Tipo de evento sísmico
  }))
}