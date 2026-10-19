import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toast } from '../utils/bootstrap'
import { ToastContext } from './toastContext'

const VARIANTS = {
  success: { backgroundClass: 'text-bg-success', icon: 'bi-check-circle-fill' },
  error: { backgroundClass: 'text-bg-danger', icon: 'bi-x-circle-fill' },
}

function ToastItem({ toast, onHidden }) {
  const toastRef = useRef(null)

  useEffect(() => {
    const toastElement = toastRef.current
    const instance = Toast.getOrCreateInstance(toastElement, { autohide: true, delay: 4000 })
    const handleHidden = () => onHidden(toast.id)
    toastElement.addEventListener('hidden.bs.toast', handleHidden)
    instance.show()
    // Instance sengaja tidak di-dispose: callback animasi Bootstrap masih memakai elemen ini
    // (StrictMode menjalankan efek dua kali). Elemen dibuang bersama komponen saat unmount.
    return () => toastElement.removeEventListener('hidden.bs.toast', handleHidden)
  }, [toast.id, onHidden])

  const variant = VARIANTS[toast.type] ?? VARIANTS.success
  return (
    <div
      ref={toastRef}
      className={`toast align-items-center border-0 ${variant.backgroundClass}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center gap-2">
          <i className={`bi ${variant.icon}`} aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Tutup"
        />
      </div>
    </div>
  )
}

/** Toast Bootstrap di pojok kanan atas (desktop) / atas tengah (HP), hilang otomatis 4 detik. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const push = useCallback((type, message) => {
    const id = nextId.current++
    setToasts((currentToasts) => [...currentToasts.slice(-3), { id, type, message }])
  }, [])

  const remove = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const toastActions = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toastActions}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3 app-toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onHidden={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
