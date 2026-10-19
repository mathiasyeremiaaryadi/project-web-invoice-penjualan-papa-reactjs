import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSummary, getTopStores } from '../api/dashboard'

export const TOP_LIMIT_OPTIONS = [5, 10, 15, 20]

/** Card dashboard. Query terpisah dari top-stores agar mengganti Top N tidak memuat ulang card. */
export function useDashboardSummary({ start_date, end_date }) {
  return useQuery({
    queryKey: ['dashboard', 'summary', { start_date, end_date }],
    queryFn: () => getSummary({ start_date, end_date }),
  })
}

export function useTopStores({ start_date, end_date }, limit) {
  return useQuery({
    queryKey: ['dashboard', 'top-stores', { start_date, end_date, limit }],
    queryFn: () => getTopStores({ start_date, end_date, limit }),
    placeholderData: keepPreviousData,
  })
}
