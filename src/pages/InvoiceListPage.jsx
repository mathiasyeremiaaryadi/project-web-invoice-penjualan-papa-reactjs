import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { EmptyState } from '../components/EmptyState'
import { InvoiceCard } from '../components/InvoiceCard'
import { LoadingState } from '../components/LoadingState'
import { Pagination } from '../components/Pagination'
import { SortableTh } from '../components/SortableTh'
import { useToast } from '../components/toastContext'
import { getErrorMessage } from '../api/client'
import { useDeleteInvoice, useInvoices } from '../hooks/useInvoices'
import { LIMIT_OPTIONS, useListParams } from '../hooks/useListParams'
import { useStores } from '../hooks/useStores'
import { formatDate, todayJakarta } from '../utils/formatDate'
import { formatRupiah } from '../utils/formatRupiah'

const SEARCH_DEBOUNCE_MS = 400

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Terbaru disimpan' },
  { value: 'sale_date:desc', label: 'Tanggal terbaru' },
  { value: 'sale_date:asc', label: 'Tanggal terlama' },
  { value: 'store_name:asc', label: 'Nama toko A–Z' },
  { value: 'store_name:desc', label: 'Nama toko Z–A' },
  { value: 'amount:desc', label: 'Penjualan terbesar' },
  { value: 'amount:asc', label: 'Penjualan terkecil' },
]

export function InvoiceListPage() {
  const { params, setParams, resetFilters, hasFilters } = useListParams()
  const invoices = useInvoices(params)
  const stores = useStores('')
  const deleteMutation = useDeleteInvoice()
  const toast = useToast()
  const today = todayJakarta()

  // --- Pencarian dengan debounce 400 ms (URL diperbarui setelah berhenti mengetik) ---
  const [searchInput, setSearchInput] = useState(params.search)
  const searchTimer = useRef(null)

  useEffect(() => {
    const timer = searchTimer
    return () => clearTimeout(timer.current)
  }, [])

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchInput(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setParams({ search: value.trim() }, { replace: true })
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleResetFilters = () => {
    clearTimeout(searchTimer.current)
    setSearchInput('')
    resetFilters()
  }

  // --- Hapus ---
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const openDelete = (invoice) => {
    setDeleteTarget(invoice)
    setDeleteOpen(true)
  }

  const handleModalHidden = useCallback(() => {
    setDeleteOpen(false)
    setDeleteTarget(null)
  }, [])

  const items = invoices.data?.data ?? []
  const meta = invoices.data?.meta ?? { page: params.page, limit: params.limit, total: 0, total_pages: 0 }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success('Invoice berhasil dihapus')
        // Item terakhir di halaman ini terhapus → mundur satu halaman.
        if (items.length === 1 && params.page > 1) setParams({ page: params.page - 1 })
      },
      onError: (error) => {
        setDeleteOpen(false)
        toast.error(getErrorMessage(error, 'Gagal menghapus invoice'))
      },
    })
  }

  const handleSort = (field, order) => setParams({ sort_by: field, sort_order: order })
  const sortValue = `${params.sort_by}:${params.sort_order}`
  const startNumber = (meta.page - 1) * meta.limit

  return (
    <>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
        <h1 className="h3 fw-bold mb-0">Daftar Invoice Penjualan</h1>
        <Link to="/invoices/new" className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Tambah Invoice
        </Link>
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col col-md-12 col-lg-3">
              <label htmlFor="invoice-search" className="form-label small mb-1 d-none d-md-block">
                Cari nama toko
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" aria-hidden="true" />
                </span>
                <input
                  id="invoice-search"
                  type="search"
                  className="form-control"
                  placeholder="Cari nama toko..."
                  value={searchInput}
                  maxLength={100}
                  onChange={handleSearchChange}
                  aria-label="Cari nama toko"
                />
              </div>
            </div>
            <div className="col-auto d-md-none">
              <button
                type="button"
                className={`btn d-inline-flex align-items-center gap-2 ${hasFilters ? 'btn-primary' : 'btn-outline-primary'}`}
                data-bs-toggle="collapse"
                data-bs-target="#invoice-filters"
                aria-expanded="false"
                aria-controls="invoice-filters"
              >
                <i className="bi bi-sliders" aria-hidden="true" />
                Filter
              </button>
            </div>

            <div className="col-12 col-lg-9 collapse d-md-block" id="invoice-filters">
              <div className="row g-2 align-items-end pt-2 pt-md-0">
                <div className="col-6 col-lg">
                  <label htmlFor="filter-start" className="form-label small mb-1">
                    Dari tanggal
                  </label>
                  <input
                    id="filter-start"
                    type="date"
                    className="form-control"
                    value={params.start_date}
                    max={params.end_date || today}
                    onChange={(event) => setParams({ start_date: event.target.value })}
                  />
                </div>
                <div className="col-6 col-lg">
                  <label htmlFor="filter-end" className="form-label small mb-1">
                    Sampai tanggal
                  </label>
                  <input
                    id="filter-end"
                    type="date"
                    className="form-control"
                    value={params.end_date}
                    min={params.start_date || undefined}
                    max={today}
                    onChange={(event) => setParams({ end_date: event.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg">
                  <label htmlFor="filter-store" className="form-label small mb-1">
                    Toko
                  </label>
                  <select
                    id="filter-store"
                    className="form-select"
                    value={params.store_id}
                    onChange={(event) => setParams({ store_id: event.target.value })}
                  >
                    <option value="">Semua toko</option>
                    {(stores.data ?? []).map((store) => (
                      <option key={store.id} value={String(store.id)}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6 col-lg-auto">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={handleResetFilters}
                    disabled={!hasFilters && searchInput === ''}
                  >
                    <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                    Reset filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jumlah entri & sort (HP) */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-2 small">
          <label htmlFor="page-limit">Tampilkan</label>
          <select
            id="page-limit"
            className="form-select form-select-sm w-auto"
            value={params.limit}
            onChange={(event) => setParams({ limit: Number(event.target.value) })}
          >
            {LIMIT_OPTIONS.map((limitOption) => (
              <option key={limitOption} value={limitOption}>
                {limitOption}
              </option>
            ))}
          </select>
          <span>entri</span>
          {invoices.isFetching && !invoices.isPending && (
            <span className="spinner-border spinner-border-sm text-primary ms-1" role="status">
              <span className="visually-hidden">Memuat...</span>
            </span>
          )}
        </div>
        <div className="d-flex d-md-none align-items-center gap-2 small">
          <label htmlFor="mobile-sort">Urutkan</label>
          <select
            id="mobile-sort"
            className="form-select form-select-sm w-auto"
            value={sortValue}
            onChange={(event) => {
              const [sort_by, sort_order] = event.target.value.split(':')
              setParams({ sort_by, sort_order })
            }}
          >
            {SORT_OPTIONS.map((sortOption) => (
              <option key={sortOption.value} value={sortOption.value}>
                {sortOption.label}
              </option>
            ))}
            {!SORT_OPTIONS.some((sortOption) => sortOption.value === sortValue) && <option value={sortValue}>Terlama disimpan</option>}
          </select>
        </div>
      </div>

      {/* Isi */}
      {invoices.isPending ? (
        <div className="card border-0 shadow-sm">
          <LoadingState text="Memuat invoice..." />
        </div>
      ) : invoices.isError && !invoices.data ? (
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2" role="alert">
          <span>{getErrorMessage(invoices.error, 'Gagal memuat invoice')}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => invoices.refetch()}>
            Coba lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="card border-0 shadow-sm">
          {hasFilters ? (
            <EmptyState icon="bi-search" title="Tidak ada data yang cocok dengan filter">
              <button
                type="button"
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                onClick={handleResetFilters}
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                Reset filter
              </button>
            </EmptyState>
          ) : meta.total > 0 ? (
            <EmptyState icon="bi-file-earmark" title="Halaman ini kosong">
              <button type="button" className="btn btn-outline-primary" onClick={() => setParams({ page: 1 })}>
                Ke halaman pertama
              </button>
            </EmptyState>
          ) : (
            <EmptyState icon="bi-receipt" title="Belum ada invoice" description="Catat penjualan pertama Anda.">
              <Link to="/invoices/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
                <i className="bi bi-plus-lg" aria-hidden="true" />
                Tambah Invoice
              </Link>
            </EmptyState>
          )}
        </div>
      ) : (
        <div className={invoices.isPlaceholderData ? 'opacity-50 pe-none' : ''}>
          {invoices.isError && (
            <div className="alert alert-warning py-2 small" role="alert">
              {getErrorMessage(invoices.error, 'Gagal memuat data terbaru')}
            </div>
          )}

          {/* Tablet & desktop: tabel */}
          <div className="card border-0 shadow-sm d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="text-center no-col">
                      No
                    </th>
                    <SortableTh field="sale_date" label="Tanggal Penjualan" sortBy={params.sort_by} sortOrder={params.sort_order} onSort={handleSort} />
                    <SortableTh field="store_name" label="Nama Toko" sortBy={params.sort_by} sortOrder={params.sort_order} onSort={handleSort} />
                    <SortableTh
                      field="amount"
                      label="Penjualan (IDR)"
                      sortBy={params.sort_by}
                      sortOrder={params.sort_order}
                      onSort={handleSort}
                      className="text-end"
                    />
                    <th scope="col" className="text-center action-col">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((invoice, index) => (
                    <tr key={invoice.id}>
                      <td className="text-center text-body-secondary">{startNumber + index + 1}</td>
                      <td className="text-nowrap">{formatDate(invoice.sale_date)}</td>
                      <td className="text-break">{invoice.store_name}</td>
                      <td className="text-end text-nowrap fw-semibold">{formatRupiah(invoice.amount)}</td>
                      <td className="text-center text-nowrap">
                        <Link
                          to={`/invoices/${invoice.id}/edit`}
                          className="btn btn-sm btn-outline-primary me-1"
                          aria-label={`Edit invoice ${invoice.store_name}`}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openDelete(invoice)}
                          aria-label={`Hapus invoice ${invoice.store_name}`}
                          title="Hapus"
                        >
                          <i className="bi bi-trash" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HP: kartu */}
          <div className="d-md-none d-flex flex-column gap-2">
            {items.map((invoice, index) => (
              <InvoiceCard key={invoice.id} invoice={invoice} number={startNumber + index + 1} onDelete={openDelete} />
            ))}
          </div>
        </div>
      )}

      {!invoices.isPending && meta.total > 0 && (
        <div className="mt-3">
          <Pagination
            page={meta.page}
            totalPages={meta.total_pages}
            total={meta.total}
            limit={meta.limit}
            onChange={(page) => setParams({ page })}
            disabled={invoices.isPlaceholderData}
          />
        </div>
      )}

      <ConfirmDeleteModal
        show={deleteOpen}
        invoice={deleteTarget}
        onConfirm={handleConfirmDelete}
        onHidden={handleModalHidden}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
