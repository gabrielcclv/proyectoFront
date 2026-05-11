/**
 * earthquakesApi.js — USGS Earthquake Hazards Program service.
 *
 * Base URL: https://earthquake.usgs.gov/fdsnws/event/1/
 * Returns GeoJSON FeatureCollection.
 *
 * Each feature has:
 *   geometry.coordinates: [lon, lat, depth_km]
 *   properties.mag:       number
 *   properties.place:     string
 *   properties.time:      Unix ms
 *   properties.tsunami:   0 | 1
 *   properties.url:       USGS detail page
 *
 * @ai-assisted Claude proposed the URLSearchParams pattern; reviewed against
 *              the USGS FDSN spec at earthquake.usgs.gov/fdsnws/event/1/.
 */

const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/'

/**
 * Builds the USGS query URL with dynamic time range and magnitude filter.
 * @param {object} opts
 * @param {number} opts.minMagnitude - Minimum magnitude filter (default 4.5)
 * @param {number} opts.days         - Days back from today (default 7)
 */
export function buildUSGSUrl({ minMagnitude = 4.5, days = 7 } = {}) {
  const endtime   = new Date().toISOString().slice(0, 10)
  const starttime = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)

  const url = new URL('query', BASE)
  url.searchParams.set('format',       'geojson')
  url.searchParams.set('starttime',    starttime)
  url.searchParams.set('endtime',      endtime)
  url.searchParams.set('minmagnitude', String(minMagnitude))
  url.searchParams.set('orderby',      'time')
  url.searchParams.set('limit',        '200')

  return url.toString()
}

/**
 * Fetches recent earthquakes from the USGS API.
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getRecentEarthquakes({ minMagnitude = 4.5, days = 7 } = {}) {
  const url = buildUSGSUrl({ minMagnitude, days })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`USGS API ${res.status}`)
  return res.json()
}

/**
 * Extracts a normalised array of earthquake objects from GeoJSON.
 * @param {object} geojson - GeoJSON FeatureCollection from USGS
 * @returns {Array} Normalised earthquake objects
 */
export function normaliseEarthquakes(geojson) {
  if (!geojson?.features) return []
  return geojson.features.map((f) => ({
    id:      f.id,
    lat:     f.geometry.coordinates[1],
    lon:     f.geometry.coordinates[0],
    depth:   f.geometry.coordinates[2],
    mag:     f.properties.mag,
    place:   f.properties.place,
    time:    new Date(f.properties.time),
    tsunami: f.properties.tsunami === 1,
    url:     f.properties.url,
    type:    f.properties.type,
  }))
}