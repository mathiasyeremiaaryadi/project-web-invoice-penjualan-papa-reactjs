import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getErrorMessage } from '../api/client'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi').max(100, 'Username terlalu panjang'),
  password: z.string().min(1, 'Password wajib diisi').max(200, 'Password terlalu panjang'),
})

function redirectTarget(location) {
  const from = location.state?.from
  if (!from?.pathname || from.pathname === '/login') return '/'
  return `${from.pathname}${from.search ?? ''}`
}

export function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const target = redirectTarget(location)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (user) return <Navigate to={target} replace />

  const onSubmit = async (values) => {
    setServerError('')
    try {
      await login(values)
      navigate(target, { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Login gagal. Silakan coba lagi.'))
    }
  }

  return (
    <main className="login-page d-flex align-items-center justify-content-center min-vh-100 px-3 py-4">
      <div className="card shadow-sm border-0 login-card w-100">
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="login-logo bg-primary text-white mx-auto mb-3" aria-hidden="true">
              <i className="bi bi-receipt" />
            </div>
            <h1 className="h4 fw-bold mb-1">Invoice Penjualan</h1>
            <p className="text-body-secondary small mb-0">Masuk untuk mengelola invoice</p>
          </div>

          {serverError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-group has-validation">
                <span className="input-group-text">
                  <i className="bi bi-person" aria-hidden="true" />
                </span>
                <input
                  id="username"
                  type="text"
                  className={`form-control${errors.username ? ' is-invalid' : ''}`}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                  aria-invalid={errors.username ? 'true' : 'false'}
                  {...register('username')}
                />
                {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group has-validation">
                <span className="input-group-text">
                  <i className="bi bi-lock" aria-hidden="true" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control${errors.password ? ' is-invalid' : ''}`}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((isShown) => !isShown)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                  Memproses...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
