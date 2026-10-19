import { useEffect, useId, useRef } from 'react'
import { Modal } from '../utils/bootstrap'
import { formatDate } from '../utils/formatDate'
import { formatRupiah } from '../utils/formatRupiah'

/**
 * Modal konfirmasi hapus invoice (Bootstrap Modal).
 * `show` mengatur buka/tutup; `onHidden` dipanggil setelah animasi tutup selesai
 * (termasuk ditutup lewat Esc, klik backdrop, atau tombol Batal).
 */
export function ConfirmDeleteModal({ show, invoice, onConfirm, onHidden, isDeleting = false }) {
  const modalRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const modalElement = modalRef.current
    const handleHidden = () => onHidden?.()
    modalElement.addEventListener('hidden.bs.modal', handleHidden)
    return () => modalElement.removeEventListener('hidden.bs.modal', handleHidden)
  }, [onHidden])

  useEffect(() => {
    const instance = Modal.getOrCreateInstance(modalRef.current)
    if (show) instance.show()
    else instance.hide()
  }, [show])

  // Bersihkan backdrop jika halaman ditinggalkan saat modal masih terbuka.
  useEffect(() => {
    const modalElement = modalRef.current
    return () => {
      Modal.getInstance(modalElement)?.dispose()
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
    }
  }, [])

  return (
    <div className="modal fade" ref={modalRef} tabIndex={-1} aria-labelledby={titleId} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5 d-flex align-items-center gap-2" id={titleId}>
              <i className="bi bi-exclamation-triangle text-danger" aria-hidden="true" />
              Hapus Invoice?
            </h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Tutup" disabled={isDeleting} />
          </div>
          <div className="modal-body">
            <p>Invoice berikut akan dihapus permanen dan tidak dapat dikembalikan:</p>
            {invoice && (
              <dl className="row mb-0 bg-body-tertiary rounded p-3 small">
                <dt className="col-5 col-sm-4">Nama Toko</dt>
                <dd className="col-7 col-sm-8 text-break">{invoice.store_name}</dd>
                <dt className="col-5 col-sm-4">Tanggal</dt>
                <dd className="col-7 col-sm-8">{formatDate(invoice.sale_date)}</dd>
                <dt className="col-5 col-sm-4">Nominal</dt>
                <dd className="col-7 col-sm-8 mb-0 fw-semibold">{formatRupiah(invoice.amount)}</dd>
              </dl>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" disabled={isDeleting}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger d-inline-flex align-items-center gap-2"
              onClick={onConfirm}
              disabled={isDeleting || !invoice}
            >
              {isDeleting ? (
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              ) : (
                <i className="bi bi-trash" aria-hidden="true" />
              )}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
