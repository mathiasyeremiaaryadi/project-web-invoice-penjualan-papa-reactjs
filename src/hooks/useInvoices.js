import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInvoice, deleteInvoice, listInvoices, updateInvoice } from '../api/invoices'

export const invoiceKeys = {
  all: ['invoices'],
  list: (params) => ['invoices', 'list', params],
  detail: (id) => ['invoices', 'detail', String(id)],
}

export function useInvoices(params) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => listInvoices(params),
    placeholderData: keepPreviousData,
  })
}

/** Setelah data invoice berubah: list, detail, dashboard, dan daftar toko perlu dimuat ulang. */
function useInvalidateInvoiceData() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['stores'] }),
    ])
}

export function useCreateInvoice() {
  const invalidate = useInvalidateInvoiceData()
  return useMutation({
    mutationFn: (body) => createInvoice(body),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateInvoice(id) {
  const invalidate = useInvalidateInvoiceData()
  return useMutation({
    mutationFn: (body) => updateInvoice(id, body),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteInvoice() {
  const invalidate = useInvalidateInvoiceData()
  return useMutation({
    mutationFn: (id) => deleteInvoice(id),
    onSuccess: () => invalidate(),
  })
}
