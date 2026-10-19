import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 px-3">
      <div className="text-center">
        <i className="bi bi-signpost-split display-1 text-primary d-block mb-3" aria-hidden="true" />
        <h1 className="display-6 fw-bold">404</h1>
        <p className="text-body-secondary mb-4">Halaman yang Anda cari tidak ditemukan.</p>
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-house-door" aria-hidden="true" />
          Kembali ke Home
        </Link>
      </div>
    </main>
  )
}
