import { Link } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'
import { formatRupiah } from '../utils/formatRupiah'

/** Tampilan invoice berbentuk kartu untuk layar HP. */
export function InvoiceCard({ invoice, number, onDelete }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex align-items-start gap-2">
        <div className="flex-grow-1 min-w-0">
          <div className="small text-body-secondary">
            #{number} · {formatDate(invoice.sale_date)}
          </div>
          <div className="fw-semibold text-break">{invoice.store_name}</div>
          <div className="fs-5 fw-bold text-success text-nowrap">{formatRupiah(invoice.amount)}</div>
        </div>
        <div className="d-flex gap-1 flex-shrink-0">
          <Link
            to={`/invoices/${invoice.id}/edit`}
            className="btn btn-outline-primary btn-icon"
            aria-label={`Edit invoice ${invoice.store_name}`}
            title="Edit"
          >
            <i className="bi bi-pencil" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger btn-icon"
            onClick={() => onDelete(invoice)}
            aria-label={`Hapus invoice ${invoice.store_name}`}
            title="Hapus"
          >
            <i className="bi bi-trash" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
