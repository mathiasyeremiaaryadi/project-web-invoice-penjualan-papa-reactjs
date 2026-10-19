const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

/**
 * Format angka menjadi "Rp 15.000.000".
 * Intl menghasilkan spasi tak-putus (NBSP) setelah "Rp"; dirapikan menjadi spasi biasa.
 */
export function formatRupiah(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 'Rp 0'
  return rupiahFormatter.format(numericValue).replace(/\s/g, ' ')
}

/** Format angka dengan pemisah ribuan tanpa prefix: 15000000 → "15.000.000". */
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return ''
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return ''
  return numberFormatter.format(numericValue)
}
