import { describe, expect, it } from 'vitest'
import { MESSAGES, createInvoiceSchema, normalizeStoreName } from './invoiceSchema'

const TODAY = '2026-10-12'
const schema = createInvoiceSchema(TODAY)

const valid = { store_name: 'Bearing Jaya', sale_date: '2026-10-12', amount: '15.000.000' }

function errorsOf(input) {
  const result = schema.safeParse(input)
  if (result.success) return {}
  const errorsByField = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    errorsByField[key] ??= issue.message
  }
  return errorsByField
}

describe('invoiceSchema', () => {
  it('data valid menghasilkan nilai bersih', () => {
    const result = schema.safeParse({ ...valid, store_name: '  Bearing    Jaya ' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ store_name: 'Bearing Jaya', sale_date: '2026-10-12', amount: 15000000 })
  })

  it('normalizeStoreName memangkas & menyatukan spasi', () => {
    expect(normalizeStoreName('  a   b\tc ')).toBe('a b c')
  })

  const cases = [
    ['nama kosong', { store_name: '' }, 'store_name', MESSAGES.storeRequired],
    ['nama hanya spasi', { store_name: '    ' }, 'store_name', MESSAGES.storeRequired],
    ['nama 1 karakter', { store_name: ' A ' }, 'store_name', MESSAGES.storeLength],
    ['nama 101 karakter', { store_name: 'a'.repeat(101) }, 'store_name', MESSAGES.storeLength],
    ['tanggal kosong', { sale_date: '' }, 'sale_date', MESSAGES.dateRequired],
    ['tanggal format salah', { sale_date: '12/10/2026' }, 'sale_date', MESSAGES.dateInvalid],
    ['tanggal tidak ada', { sale_date: '2026-02-30' }, 'sale_date', MESSAGES.dateInvalid],
    ['tanggal masa depan', { sale_date: '2026-10-13' }, 'sale_date', MESSAGES.dateFuture],
    ['nominal kosong', { amount: '' }, 'amount', MESSAGES.amountRequired],
    ['nominal tanpa angka', { amount: 'abc' }, 'amount', MESSAGES.amountRequired],
    ['nominal nol', { amount: '0' }, 'amount', MESSAGES.amountPositive],
    ['nominal terlalu besar', { amount: '100.000.000.001' }, 'amount', MESSAGES.amountTooLarge],
  ]

  it.each(cases)('%s', (_name, patch, field, message) => {
    const errors = errorsOf({ ...valid, ...patch })
    expect(errors[field]).toBe(message)
    expect(Object.keys(errors)).toEqual([field])
  })

  it('batas valid: 2 & 100 karakter, nominal 1 & 100 miliar', () => {
    expect(schema.safeParse({ ...valid, store_name: 'AB', amount: '1' }).success).toBe(true)
    expect(schema.safeParse({ ...valid, store_name: 'é'.repeat(100), amount: '100.000.000.000' }).success).toBe(true)
  })

  it('semua error dikumpulkan sekaligus', () => {
    const errors = errorsOf({ store_name: '', sale_date: '', amount: '' })
    expect(Object.keys(errors).sort()).toEqual(['amount', 'sale_date', 'store_name'])
  })

  it('pesan sama dengan backend', () => {
    expect(MESSAGES.storeLength).toBe('Nama toko 2–100 karakter')
    expect(MESSAGES.amountPositive).toBe('Nominal penjualan harus lebih dari 0')
    expect(MESSAGES.dateFuture).toBe('Tanggal penjualan tidak boleh di masa depan')
  })
})
