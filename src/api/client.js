import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
})

let unauthorizedHandler = null

/** Dipanggil AuthProvider: apa yang dilakukan saat session habis (401). */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

const AUTH_PROBE_PATHS = ['/auth/me', '/auth/login']

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    if (status === 401 && !AUTH_PROBE_PATHS.some((path) => url.endsWith(path)) && unauthorizedHandler) {
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)

const GENERIC_MESSAGE = 'Terjadi kesalahan. Silakan coba lagi.'

/** Ambil pesan error yang ramah pengguna dari error axios. */
export function getErrorMessage(error, fallback = GENERIC_MESSAGE) {
  if (error?.response?.data?.error?.message) return error.response.data.error.message
  if (error?.code === 'ECONNABORTED') return 'Server terlalu lama merespons. Silakan coba lagi.'
  if (error?.request && !error?.response) return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
  return fallback
}

/** Ambil error per field dari respons 422, atau null jika bukan error validasi. */
export function getFieldErrors(error) {
  if (error?.response?.status !== 422) return null
  return error.response.data?.error?.fields ?? {}
}

export function isNotFound(error) {
  return error?.response?.status === 404
}

/** Buang parameter kosong agar URL query tetap bersih. */
export function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}
