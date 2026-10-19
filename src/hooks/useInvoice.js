import { useQuery } from '@tanstack/react-query'
import { getInvoice } from '../api/invoices'
import { invoiceKeys } from './useInvoices'

export function useInvoice(id) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => getInvoice(id),
    enabled: Boolean(id),
    // Data form tidak boleh berubah diam-diam saat sedang diedit.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
