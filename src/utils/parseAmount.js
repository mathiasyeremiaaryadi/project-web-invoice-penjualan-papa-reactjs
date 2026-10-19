/** Jumlah digit maksimal yang diterima input nominal (cukup untuk 100.000.000.000 + sedikit ruang). */
export const MAX_AMOUNT_DIGITS = 15

/**
 * Ubah teks nominal ("15.000.000", "Rp 15.000.000", 15000000) menjadi integer.
 * Mengembalikan null jika kosong / tidak ada digit.
 * Titik dianggap pemisah ribuan (format Indonesia); bagian setelah koma (desimal) dibuang.
 */
export function parseAmount(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : null
  }
  const [integerPart] = String(value).split(',')
  const digits = integerPart.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  if (digits === '') return null
  return Number(digits.slice(0, MAX_AMOUNT_DIGITS))
}

/** Rapikan input saat mengetik: hanya digit, lalu diberi pemisah ribuan. */
export function formatAmountInput(value) {
  const amount = parseAmount(value)
  if (amount === null) return ''
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)
}
