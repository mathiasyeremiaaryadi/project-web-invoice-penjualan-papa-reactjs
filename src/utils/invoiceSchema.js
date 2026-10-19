import { z } from 'zod'
import { isValidDateString, todayJakarta } from './formatDate'
import { parseAmount } from './parseAmount'

/** Nominal maksimal satu invoice: Rp 100.000.000.000. Sama dengan backend. */
export const MAX_AMOUNT = 100_000_000_000

/** Pesan validasi — sama persis dengan backend (internal/invoice/validation.go). */
export const MESSAGES = {
  storeRequired: 'Nama toko wajib diisi',
  storeLength: 'Nama toko 2–100 karakter',
  dateRequired: 'Tanggal penjualan wajib diisi',
  dateInvalid: 'Tanggal penjualan tidak valid',
  dateFuture: 'Tanggal penjualan tidak boleh di masa depan',
  amountRequired: 'Nominal penjualan wajib diisi',
  amountPositive: 'Nominal penjualan harus lebih dari 0',
  amountTooLarge: 'Nominal terlalu besar',
}

/** Trim dan ubah spasi ganda menjadi satu. */
export function normalizeStoreName(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
}

/**
 * Skema form invoice. `today` (YYYY-MM-DD, WIB) bisa diisi untuk test.
 * Output: { store_name: string ternormalisasi, sale_date: string, amount: number }.
 */
export function createInvoiceSchema(today = todayJakarta()) {
  return z.object({
    store_name: z
      .string()
      .transform(normalizeStoreName)
      .superRefine((value, context) => {
        const length = [...value].length
        if (length === 0) context.addIssue({ code: 'custom', message: MESSAGES.storeRequired })
        else if (length < 2 || length > 100) context.addIssue({ code: 'custom', message: MESSAGES.storeLength })
      }),

    sale_date: z
      .string()
      .transform((value) => value.trim())
      .superRefine((value, context) => {
        if (value === '') context.addIssue({ code: 'custom', message: MESSAGES.dateRequired })
        else if (!isValidDateString(value)) context.addIssue({ code: 'custom', message: MESSAGES.dateInvalid })
        else if (value > today) context.addIssue({ code: 'custom', message: MESSAGES.dateFuture })
      }),

    amount: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((value) => parseAmount(value))
      .superRefine((value, context) => {
        if (value === null) context.addIssue({ code: 'custom', message: MESSAGES.amountRequired })
        else if (value <= 0) context.addIssue({ code: 'custom', message: MESSAGES.amountPositive })
        else if (value > MAX_AMOUNT) context.addIssue({ code: 'custom', message: MESSAGES.amountTooLarge })
      }),
  })
}
