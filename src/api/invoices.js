import { cleanParams, client } from './client'

/** @returns {Promise<{data: Array, meta: {page, limit, total, total_pages}}>} */
export async function listInvoices(params) {
  const response = await client.get('/invoices', { params: cleanParams(params) })
  return response.data
}

export async function getInvoice(id) {
  const response = await client.get(`/invoices/${encodeURIComponent(id)}`)
  return response.data.data
}

export async function createInvoice(body) {
  const response = await client.post('/invoices', body)
  return response.data.data
}

export async function updateInvoice(id, body) {
  const response = await client.put(`/invoices/${encodeURIComponent(id)}`, body)
  return response.data.data
}

export async function deleteInvoice(id) {
  await client.delete(`/invoices/${encodeURIComponent(id)}`)
}
