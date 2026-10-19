import { client } from './client'

export async function login({ username, password }) {
  const response = await client.post('/auth/login', { username, password })
  return response.data.data
}

export async function logout() {
  await client.post('/auth/logout')
}

/** User yang sedang login, atau null jika belum login. */
export async function me() {
  try {
    const response = await client.get('/auth/me')
    return response.data.data
  } catch (error) {
    if (error.response?.status === 401) return null
    throw error
  }
}
