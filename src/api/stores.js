import { cleanParams, client } from './client'

export async function listStores(keyword = '') {
  const response = await client.get('/stores', { params: cleanParams({ q: keyword.trim() }) })
  return response.data.data
}
