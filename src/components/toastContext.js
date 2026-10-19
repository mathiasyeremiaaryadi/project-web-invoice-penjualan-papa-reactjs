import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/** @returns {{ success: (msg: string) => void, error: (msg: string) => void }} */
export function useToast() {
  const contextValue = useContext(ToastContext)
  if (!contextValue) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return contextValue
}
