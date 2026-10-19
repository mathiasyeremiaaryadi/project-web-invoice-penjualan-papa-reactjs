import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { AuthContext } from './useAuth'

/**
 * Menyimpan user yang sedang login. Token session ada di cookie httpOnly
 * dan tidak pernah disentuh JavaScript.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState({ status: 'loading', user: null })

  // Cek session saat aplikasi dibuka.
  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((user) => active && setState({ status: 'ready', user }))
      .catch(() => active && setState({ status: 'ready', user: null }))
    return () => {
      active = false
    }
  }, [])

  const clearSession = useCallback(() => {
    queryClient.clear()
    setState({ status: 'ready', user: null })
  }, [queryClient])

  // Response 401 dari API mana pun → kosongkan user; ProtectedRoute akan redirect ke /login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession)
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const login = useCallback(
    async (credentials) => {
      const user = await authApi.login(credentials)
      queryClient.clear()
      setState({ status: 'ready', user })
      return user
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({ user: state.user, status: state.status, login, logout }),
    [state, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
