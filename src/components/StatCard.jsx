/** Card angka dashboard. `variant`: warna Bootstrap (primary, warning, success, ...). */
export function StatCard({ icon, label, value, variant = 'primary', loading = false }) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${variant}-subtle text-${variant}-emphasis`} aria-hidden="true">
          <i className={`bi ${icon}`} />
        </div>
        <div className="min-w-0 flex-grow-1">
          <div className="text-body-secondary small">{label}</div>
          {loading ? (
            <div className="placeholder-glow" aria-hidden="true">
              <span className="placeholder col-8 placeholder-lg rounded" />
            </div>
          ) : (
            <div className="stat-value fw-bold">{value}</div>
          )}
          {loading && <span className="visually-hidden">Memuat {label}</span>}
        </div>
      </div>
    </div>
  )
}
