// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { LIST_DEFAULTS, readListParams, toSearchParams, useListParams } from './useListParams'

function setup(initialUrl = '/invoices') {
  const wrapper = ({ children }) => <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  return renderHook(
    () => {
      const list = useListParams()
      const location = useLocation()
      return { ...list, search: location.search }
    },
    { wrapper },
  )
}

describe('useListParams', () => {
  it('membaca nilai default jika URL kosong', () => {
    const { result } = setup()
    expect(result.current.params).toEqual({ ...LIST_DEFAULTS })
    expect(result.current.params.limit).toBe(10)
    expect(result.current.params.sort_by).toBe('created_at')
    expect(result.current.params.sort_order).toBe('desc')
    expect(result.current.hasFilters).toBe(false)
  })

  it('membaca nilai dari URL', () => {
    const { result } = setup('/invoices?page=3&limit=20&search=jaya&store_id=4&start_date=2026-01-01&sort_by=amount&sort_order=asc')
    expect(result.current.params).toEqual({
      page: 3,
      limit: 20,
      start_date: '2026-01-01',
      end_date: '',
      store_id: '4',
      search: 'jaya',
      sort_by: 'amount',
      sort_order: 'asc',
    })
    expect(result.current.hasFilters).toBe(true)
  })

  it('nilai URL tidak valid diganti default', () => {
    const { result } = setup('/invoices?page=-2&limit=15&sort_by=id&sort_order=up&store_id=abc&start_date=kemarin')
    expect(result.current.params).toEqual({ ...LIST_DEFAULTS })
  })

  it('mengubah filter mereset page ke 1', () => {
    const { result } = setup('/invoices?page=3&limit=20')
    act(() => result.current.setParams({ search: 'bearing' }))
    expect(result.current.params.page).toBe(1)
    expect(result.current.params.search).toBe('bearing')
    expect(result.current.params.limit).toBe(20)
  })

  it.each([
    ['limit', { limit: 50 }],
    ['sort', { sort_by: 'amount', sort_order: 'asc' }],
    ['tanggal', { start_date: '2026-02-01' }],
    ['toko', { store_id: '7' }],
  ])('mengubah %s mereset page ke 1', (_name, patch) => {
    const { result } = setup('/invoices?page=4')
    act(() => result.current.setParams(patch))
    expect(result.current.params.page).toBe(1)
  })

  it('mengubah page saja tidak mereset filter', () => {
    const { result } = setup('/invoices?search=jaya')
    act(() => result.current.setParams({ page: 2 }))
    expect(result.current.params.page).toBe(2)
    expect(result.current.params.search).toBe('jaya')
  })

  it('nilai yang sama tidak mereset page', () => {
    const { result } = setup('/invoices?page=2&search=jaya')
    act(() => result.current.setParams({ search: 'jaya' }))
    expect(result.current.params.page).toBe(2)
  })

  it('resetFilters menghapus filter tetapi mempertahankan limit & sort', () => {
    const { result } = setup('/invoices?page=2&limit=50&search=x&store_id=1&start_date=2026-01-01&end_date=2026-02-01&sort_by=amount')
    act(() => result.current.resetFilters())
    expect(result.current.params).toEqual({ ...LIST_DEFAULTS, limit: 50, sort_by: 'amount' })
    expect(result.current.hasFilters).toBe(false)
  })

  it('nilai default tidak ditulis ke URL', () => {
    const { result } = setup('/invoices?page=2')
    act(() => result.current.setParams({ page: 1 }))
    expect(result.current.search).toBe('')
  })
})

describe('readListParams / toSearchParams', () => {
  it('round-trip', () => {
    const params = { ...LIST_DEFAULTS, page: 2, search: 'gear' }
    const searchParams = toSearchParams(params)
    expect(searchParams.toString()).toBe('page=2&search=gear')
    expect(readListParams(searchParams)).toEqual(params)
  })
})
