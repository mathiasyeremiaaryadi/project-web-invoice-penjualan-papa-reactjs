import { afterEach, describe, expect, it } from 'vitest'
import { formatDate, isValidDateString, parseSaleDate, todayJakarta } from './formatDate'
import { formatNumber, formatRupiah } from './formatRupiah'
import { formatAmountInput, parseAmount } from './parseAmount'
import { getPageItems } from './pagination'

describe('formatRupiah', () => {
  it('memformat dengan prefix Rp, spasi biasa, dan titik ribuan', () => {
    expect(formatRupiah(15000000)).toBe('Rp 15.000.000')
    expect(formatRupiah(842500000)).toBe('Rp 842.500.000')
    expect(formatRupiah(1)).toBe('Rp 1')
    expect(formatRupiah(0)).toBe('Rp 0')
  })

  it('tanpa desimal dan tanpa NBSP', () => {
    const out = formatRupiah(1234.56)
    expect(out).toBe('Rp 1.235')
    expect(out).not.toMatch(/\u00a0/)
  })

  it('nilai tidak valid menjadi Rp 0', () => {
    expect(formatRupiah(undefined)).toBe('Rp 0')
    expect(formatRupiah('abc')).toBe('Rp 0')
  })

  it('angka besar tetap benar', () => {
    expect(formatRupiah(100_000_000_000)).toBe('Rp 100.000.000.000')
  })

  it('formatNumber tanpa prefix', () => {
    expect(formatNumber(15000000)).toBe('15.000.000')
    expect(formatNumber('')).toBe('')
  })
})

describe('parseAmount', () => {
  it('mengubah teks berformat menjadi integer', () => {
    expect(parseAmount('15.000.000')).toBe(15000000)
    expect(parseAmount('Rp 15.000.000')).toBe(15000000)
    expect(parseAmount('15000000')).toBe(15000000)
    expect(parseAmount(' 1 000 ')).toBe(1000)
  })

  it('koma dianggap desimal dan dibuang', () => {
    expect(parseAmount('15.000,75')).toBe(15000)
  })

  it('angka (number) diterima', () => {
    expect(parseAmount(2500)).toBe(2500)
    expect(parseAmount(12.9)).toBe(12)
  })

  it('kosong atau tanpa digit → null', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount(null)).toBeNull()
    expect(parseAmount(undefined)).toBeNull()
    expect(parseAmount(Number.NaN)).toBeNull()
  })

  it('nol di depan dibuang, nol tetap nol', () => {
    expect(parseAmount('000123')).toBe(123)
    expect(parseAmount('0')).toBe(0)
  })

  it('formatAmountInput memberi pemisah ribuan saat mengetik', () => {
    expect(formatAmountInput('15000000')).toBe('15.000.000')
    expect(formatAmountInput('15.0000')).toBe('150.000')
    expect(formatAmountInput('12a3')).toBe('123')
    expect(formatAmountInput('')).toBe('')
  })
})

describe('formatDate', () => {
  const originalTZ = process.env.TZ
  afterEach(() => {
    process.env.TZ = originalTZ
  })

  it('format sale_date menjadi "12 Okt 2026"', () => {
    expect(formatDate('2026-10-12')).toBe('12 Okt 2026')
    expect(formatDate('2026-01-05')).toBe('05 Jan 2026')
    expect(formatDate('2026-12-31')).toBe('31 Des 2026')
  })

  it('sale_date tidak bergeser hari di zona waktu mana pun', () => {
    for (const timeZone of ['UTC', 'America/Los_Angeles', 'Pacific/Honolulu', 'Asia/Jakarta', 'Pacific/Kiritimati', 'Pacific/Auckland']) {
      process.env.TZ = timeZone
      expect(formatDate('2026-10-12')).toBe('12 Okt 2026')
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
    }
  })

  it('timestamp ISO diformat dalam WIB', () => {
    // 2026-10-11T20:00:00Z = 12 Okt 2026 03:00 WIB
    expect(formatDate('2026-10-11T20:00:00Z')).toBe('12 Okt 2026')
    expect(formatDate('2026-10-12T11:20:00+07:00')).toBe('12 Okt 2026')
  })

  it('nilai kosong/tidak valid menjadi "-"', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
    expect(formatDate('2026-02-30')).toBe('-')
  })

  it('parseSaleDate & isValidDateString', () => {
    expect(parseSaleDate('2026-10-12').getUTCDate()).toBe(12)
    expect(isValidDateString('2024-02-29')).toBe(true)
    expect(isValidDateString('2026-02-29')).toBe(false)
    expect(isValidDateString('2026-13-01')).toBe(false)
    expect(isValidDateString('12-10-2026')).toBe(false)
  })

  it('todayJakarta memakai zona WIB', () => {
    // 12 Okt 2026 18:30 UTC = 13 Okt 2026 01:30 WIB
    expect(todayJakarta(new Date('2026-10-12T18:30:00Z'))).toBe('2026-10-13')
    expect(todayJakarta(new Date('2026-10-12T16:59:59Z'))).toBe('2026-10-12')
  })
})

describe('getPageItems', () => {
  it('tanpa elipsis untuk halaman sedikit', () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('dengan elipsis di tengah', () => {
    expect(getPageItems(7, 13)).toEqual([1, 'start-ellipsis', 6, 7, 8, 'end-ellipsis', 13])
    expect(getPageItems(1, 13)).toEqual([1, 2, 3, 4, 'end-ellipsis', 13])
    expect(getPageItems(13, 13)).toEqual([1, 'start-ellipsis', 10, 11, 12, 13])
  })
})
