import { cleanParams, client } from './client'

export async function getSummary({ start_date, end_date }) {
  const response = await client.get('/dashboard/summary', { params: cleanParams({ start_date, end_date }) })
  return response.data.data
}

export async function getTopStores({ start_date, end_date, limit }) {
  const response = await client.get('/dashboard/top-stores', {
    params: cleanParams({ start_date, end_date, limit }),
  })
  return response.data.data
}
