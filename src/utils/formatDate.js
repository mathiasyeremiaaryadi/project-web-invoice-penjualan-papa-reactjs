export const APP_TIMEZONE = 'Asia/Jakarta'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: APP_TIMEZONE,
})

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Ubah "YYYY-MM-DD" menjadi Date tanpa pergeseran hari.
 * Jangan pakai new Date('2026-10-12') karena dianggap UTC tengah malam
 * (bisa bergeser hari tergantung zona waktu browser). Di sini dipakai jam 12:00 UTC,
 * yang saat diformat dengan timeZone Asia/Jakarta menjadi 19:00 WIB di hari yang sama,
 * apa pun zona waktu komputer pengguna.
 */
export function parseSaleDate(value) {
  const match = DATE_PATTERN.exec(value ?? '')
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return date
}

/** True jika string berformat YYYY-MM-DD dan tanggalnya benar-benar ada. */
export function isValidDateString(value) {
  return parseSaleDate(value) !== null
}

/** Format tanggal: "2026-10-12" atau ISO datetime → "12 Okt 2026". */
export function formatDate(value) {
  if (!value) return '-'
  const date = DATE_PATTERN.test(value) ? parseSaleDate(value) : new Date(value)
  if (!date || Number.isNaN(date.getTime())) return '-'
  return dateFormatter.format(date).replace(/\s/g, ' ')
}

/** Tanggal hari ini (WIB) dalam format YYYY-MM-DD. */
export function todayJakarta(now = new Date()) {
  // Locale en-CA menghasilkan format YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
