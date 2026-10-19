import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isValidDateString } from '../utils/formatDate'

export const LIMIT_OPTIONS = [10, 20, 50]
export const SORT_FIELDS = ['sale_date', 'store_name', 'amount', 'created_at']

export const LIST_DEFAULTS = Object.freeze({
  page: 1,
  limit: 10,
  start_date: '',
  end_date: '',
  store_id: '',
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
})

const FILTER_KEYS = ['start_date', 'end_date', 'store_id', 'search']

/** Baca & sanitasi parameter list dari URL; nilai tidak valid diganti default. */
export function readListParams(searchParams) {
  const getValue = (key) => searchParams.get(key) ?? ''

  const page = Number.parseInt(getValue('page'), 10)
  const limit = Number.parseInt(getValue('limit'), 10)
  const storeId = getValue('store_id')
  const sortBy = getValue('sort_by')
  const sortOrder = getValue('sort_order')
  const start = getValue('start_date')
  const end = getValue('end_date')

  return {
    page: Number.isInteger(page) && page >= 1 ? page : LIST_DEFAULTS.page,
    limit: LIMIT_OPTIONS.includes(limit) ? limit : LIST_DEFAULTS.limit,
    start_date: isValidDateString(start) ? start : '',
    end_date: isValidDateString(end) ? end : '',
    store_id: /^[1-9]\d*$/.test(storeId) ? storeId : '',
    search: getValue('search').slice(0, 100),
    sort_by: SORT_FIELDS.includes(sortBy) ? sortBy : LIST_DEFAULTS.sort_by,
    sort_order: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : LIST_DEFAULTS.sort_order,
  }
}

/** Ubah objek parameter menjadi URLSearchParams; nilai default tidak ditulis agar URL ringkas. */
export function toSearchParams(params) {
  const searchParams = new URLSearchParams()
  for (const key of Object.keys(LIST_DEFAULTS)) {
    const value = params[key]
    if (value === '' || value === null || value === undefined) continue
    if (String(value) === String(LIST_DEFAULTS[key])) continue
    searchParams.set(key, String(value))
  }
  return searchParams
}

/**
 * State list invoice (page, limit, filter, search, sort) yang disimpan di URL.
 * Mengubah apa pun selain `page` otomatis mereset page ke 1.
 */
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => readListParams(searchParams), [searchParams])

  const setParams = useCallback(
    (patch, options) => {
      setSearchParams((previousSearchParams) => {
        const currentParams = readListParams(previousSearchParams)
        const nextParams = { ...currentParams, ...patch }
        const nonPageValueChanged = Object.keys(patch).some(
          (key) => key !== 'page' && String(patch[key] ?? '') !== String(currentParams[key] ?? ''),
        )
        if (nonPageValueChanged && !('page' in patch)) nextParams.page = 1
        return toSearchParams(nextParams)
      }, options)
    },
    [setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setParams(Object.fromEntries(FILTER_KEYS.map((key) => [key, ''])))
  }, [setParams])

  const hasFilters = FILTER_KEYS.some((key) => params[key] !== '')

  return { params, setParams, resetFilters, hasFilters }
}
