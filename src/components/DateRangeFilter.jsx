import { useId, useState } from 'react'
import { todayJakarta } from '../utils/formatDate'

/**
 * Filter periode dengan tombol Terapkan & Reset. Nilai baru dikirim lewat onApply hanya saat diterapkan.
 * Beri `key` dari nilai URL agar draft ikut berubah saat URL berubah (misal tombol Back).
 */
export function DateRangeFilter({ startDate = '', endDate = '', onApply, onReset }) {
  const inputIdPrefix = useId()
  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)
  const [error, setError] = useState('')
  const today = todayJakarta()

  const handleSubmit = (event) => {
    event.preventDefault()
    if (start && end && start > end) {
      setError('Tanggal awal tidak boleh setelah tanggal akhir')
      return
    }
    setError('')
    onApply({ start_date: start, end_date: end })
  }

  const handleReset = () => {
    setStart('')
    setEnd('')
    setError('')
    onReset()
  }

  return (
    <form className="date-range-filter" onSubmit={handleSubmit} noValidate aria-label="Filter periode">
      <div className="row g-2 align-items-end">
        <div className="col-6 col-md">
          <label htmlFor={`${inputIdPrefix}-start`} className="form-label small mb-1">
            Dari tanggal
          </label>
          <input
            id={`${inputIdPrefix}-start`}
            type="date"
            className={`form-control${error ? ' is-invalid' : ''}`}
            value={start}
            max={end || today}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
        <div className="col-6 col-md">
          <label htmlFor={`${inputIdPrefix}-end`} className="form-label small mb-1">
            Sampai tanggal
          </label>
          <input
            id={`${inputIdPrefix}-end`}
            type="date"
            className={`form-control${error ? ' is-invalid' : ''}`}
            value={end}
            min={start || undefined}
            max={today}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-fill d-inline-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-funnel" aria-hidden="true" />
            Terapkan
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill d-inline-flex align-items-center justify-content-center gap-2"
            onClick={handleReset}
          >
            <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>
      {error && (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </form>
  )
}
