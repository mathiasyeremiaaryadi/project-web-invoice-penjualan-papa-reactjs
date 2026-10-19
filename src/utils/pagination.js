/**
 * Daftar nomor halaman dengan elipsis, misal: [1, '…', 4, 5, 6, '…', 13].
 * Selalu menampilkan halaman pertama, terakhir, dan 1 halaman di kiri-kanan halaman aktif.
 */
export function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const items = [1]
  let firstMiddlePage = Math.max(2, page - 1)
  let lastMiddlePage = Math.min(totalPages - 1, page + 1)
  if (page <= 3) lastMiddlePage = 4
  if (page >= totalPages - 2) firstMiddlePage = totalPages - 3
  if (firstMiddlePage > 2) items.push('start-ellipsis')
  for (let pageNumber = firstMiddlePage; pageNumber <= lastMiddlePage; pageNumber++) items.push(pageNumber)
  if (lastMiddlePage < totalPages - 1) items.push('end-ellipsis')
  items.push(totalPages)
  return items
}
