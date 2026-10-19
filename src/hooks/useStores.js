import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listStores } from '../api/stores'

export function useStores(keyword = '', { enabled = true } = {}) {
  const trimmedKeyword = keyword.trim()
  return useQuery({
    queryKey: ['stores', trimmedKeyword],
    queryFn: () => listStores(trimmedKeyword),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled,
  })
}
