import { useQuery } from '@tanstack/react-query'
import { getForecast, normaliseforecast } from '../services/weatherApi.js'

/**
 * useWeather — React Query hook for Open-Meteo forecast data.
 *
 * Cache key changes with lat/lon so navigating between locations
 * uses cached data when available.
 *
 * @param {object} params
 * @param {number}  params.lat     - Latitude
 * @param {number}  params.lon     - Longitude
 * @param {number}  params.days    - Forecast days (default 7)
 * @param {boolean} params.enabled - Whether to run the query (default true)
 * @returns React Query result with `forecast` normalised array
 */
export function useWeather({ lat, lon, days = 7, enabled = true } = {}) {
  const query = useQuery({
    queryKey: ['weather', { lat: Number(lat?.toFixed(4)), lon: Number(lon?.toFixed(4)), days }],
    queryFn:  () => getForecast({ lat, lon, days }),
    enabled:  enabled && lat != null && lon != null,
    staleTime: 30 * 60 * 1000,         // 30 min — forecasts don't update that often
    refetchInterval: 30 * 60 * 1000,
    select: (data) => ({
      raw:      data,
      forecast: normaliseforecast(data),
      timezone: data?.timezone,
    }),
  })

  return {
    ...query,
    forecast: query.data?.forecast ?? [],
    timezone: query.data?.timezone ?? '',
  }
}