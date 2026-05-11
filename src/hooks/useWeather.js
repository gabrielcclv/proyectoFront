// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// USEWEATHER.JS — React Query Hook para datos meteorológicos (Open-Meteo)
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Hook que:
//   1. Obtiene pronóstico de 7 días para coordenadas lat/lon
//   2. Normaliza datos: temp, precipitación, viento
//   3. Solo ejecuta si lat y lon están definidos (enabled)
//   4. Cachea por ubicación para reutilizar al navegar

import { useQuery } from '@tanstack/react-query'
import { getForecast, normaliseforecast } from '../services/weatherApi.js'

/**
 * useWeather — React Query hook para datos de pronóstico de Open-Meteo.
 *
 * La clave de cache cambia con lat/lon para que navegando entre ubicaciones
 * se reutilice la cache cuando sea posible.
 *
 * @param {object} params
 * @param {number}  params.lat     - Latitud
 * @param {number}  params.lon     - Longitud
 * @param {number}  params.days    - Días de pronóstico (default 7)
 * @param {boolean} params.enabled - Ejecutar o no el query (default true)
 * @returns {object} React Query result con array `forecast` normalizado
 */
export function useWeather({ lat, lon, days = 7, enabled = true } = {}) {
  const query = useQuery({
    // Clave única por ubicación (redondeada a 4 decimales para eficiencia)
    queryKey: ['weather', { lat: Number(lat?.toFixed(4)), lon: Number(lon?.toFixed(4)), days }],
    // Obtiene pronóstico de Open-Meteo
    queryFn:  () => getForecast({ lat, lon, days }),
    // Solo ejecuta si lat y lon existen (útil en selectores que cargan)
    enabled:  enabled && lat != null && lon != null,
    // Pronósticos no cambian frecuentemente - cache por 30 min
    staleTime: 30 * 60 * 1000,
    // Polling cada 30 min (suficiente para datos meteorológicos)
    refetchInterval: 30 * 60 * 1000,
    // Normaliza respuesta para componentes
    select: (data) => ({
      raw:      data,                      // Respuesta bruta de Open-Meteo
      forecast: normaliseforecast(data),  // Array normalizado [{ date, tempMax, tempMin, ... }]
      timezone: data?.timezone,           // Zona horaria de la ubicación
    }),
  })

  return {
    ...query,
    forecast: query.data?.forecast ?? [],    // Fallback a array vacío
    timezone: query.data?.timezone ?? '',
  }
}