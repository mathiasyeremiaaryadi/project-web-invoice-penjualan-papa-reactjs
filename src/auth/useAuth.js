import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/** @returns {{ user: {id:number, username:string}|null, status: 'loading'|'ready', login: Function, logout: Function }} */
export function useAuth() {
  const contextValue = useContext(AuthContext)
  if (!contextValue) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return contextValue
}
