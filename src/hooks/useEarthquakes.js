// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// USEEARTHQUAKES.JS — React Query Hook para datos sísmicos en tiempo real
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Hook personalizado que:
//   1. Obtiene datos de terremotos de USGS
//   2. Los normaliza en formato estándar
//   3. Cachea los datos y polling automático cada 5 min
// 
// El parámetro de queryKey cambia cuando minMagnitude o days cambian, lo que hace que
// React Query automáticamente refetch cuando el usuario ajusta los filtros.

import { useQuery } from '@tanstack/react-query'
import { getRecentEarthquakes, normaliseEarthquakes } from '../services/earthquakeApi.js'

/**
 * useEarthquakes — React Query hook para datos sísmicos de USGS.
 *
 * @param {object} params
 * @param {number} params.minMagnitude - Filtro de magnitud mínima (default 4.5)
 * @param {number} params.days         - Ventana de días históricos (default 7)
 * @returns {object} React Query result con array `earthquakes` normalizado
 */
export function useEarthquakes({ minMagnitude = 4.5, days = 7 } = {}) {
  const query = useQuery({
    // Clave de cache que incluye los parámetros - cuando cambian, refetch automática
    queryKey: ['earthquakes', { minMagnitude, days }],
    // Función que obtiene y normaliza los datos
    queryFn:  () => getRecentEarthquakes({ minMagnitude, days }),
    // Datos válidos por 5 min (USGS actualiza cada ~5 min)
    staleTime: 5 * 60 * 1000,
    // Polling automático: refetch cada 5 min
    refetchInterval: 5 * 60 * 1000,
    // Transforma datos crudos en formato amigable
    select: (data) => ({
      raw:         data,                           // GeoJSON bruto de USGS
      earthquakes: normaliseEarthquakes(data),    // Array normalizado [{ lat, lon, mag, ... }]
      count:       data?.metadata?.count ?? 0,    // Total de eventos
    }),
  })

  return {
    ...query,
    earthquakes: query.data?.earthquakes ?? [],  // Fallback a array vacío si error
    count:       query.data?.count ?? 0,
  }
}