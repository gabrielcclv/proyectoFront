import { useQuery } from '@tanstack/react-query'
import { getRecentEarthquakes, normaliseEarthquakes } from '../services/earthquakesApi.js'

/**
 * useEarthquakes — React Query hook for USGS seismic data.
 *
 * Cache key changes with minMagnitude and days filters so React Query
 * automatically re-fetches when the user adjusts the filters.
 *
 * @param {object} params
 * @param {number} params.minMagnitude - Minimum magnitude (default 4.5)
 * @param {number} params.days         - Days window (default 7)
 * @returns React Query result with `earthquakes` normalised array
 */
export function useEarthquakes({ minMagnitude = 4.5, days = 7 } = {}) {
  const query = useQuery({
    queryKey: ['earthquakes', { minMagnitude, days }],
    queryFn:  () => getRecentEarthquakes({ minMagnitude, days }),
    staleTime: 5 * 60 * 1000,          // 5 min — USGS updates every few minutes
    refetchInterval: 5 * 60 * 1000,    // Poll every 5 min
    select: (data) => ({
      raw:         data,
      earthquakes: normaliseEarthquakes(data),
      count:       data?.metadata?.count ?? 0,
    }),
  })

  return {
    ...query,
    earthquakes: query.data?.earthquakes ?? [],
    count:       query.data?.count ?? 0,
  }
}