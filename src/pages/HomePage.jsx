import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { getErrorMessage } from '../api/client'
import { TOP_LIMIT_OPTIONS, useDashboardSummary, useTopStores } from '../hooks/useDashboard'
import { formatDate, isValidDateString } from '../utils/formatDate'
import { formatNumber, formatRupiah } from '../utils/formatRupiah'

const RANK_BADGES = { 1: 'rank-gold', 2: 'rank-silver', 3: 'rank-bronze' }

function periodLabel(start, end) {
  if (!start && !end) return 'Semua data'
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  if (start) return `Sejak ${formatDate(start)}`
  return `Sampai ${formatDate(end)}`
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawStart = searchParams.get('start_date') ?? ''
  const rawEnd = searchParams.get('end_date') ?? ''
  const start_date = isValidDateString(rawStart) ? rawStart : ''
  const end_date = isValidDateString(rawEnd) ? rawEnd : ''
  const range = { start_date, end_date }

  const [topLimit, setTopLimit] = useState(TOP_LIMIT_OPTIONS[0])
  const summary = useDashboardSummary(range)
  const top = useTopStores(range, topLimit)

  const applyPeriod = (period) => {
    const periodSearchParams = new URLSearchParams()
    if (period.start_date) periodSearchParams.set('start_date', period.start_date)
    if (period.end_date) periodSearchParams.set('end_date', period.end_date)
    setSearchParams(periodSearchParams)
  }

  const summaryData = summary.data
  const topItems = top.data ?? []

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Dashboard</h1>
          <p className="text-body-secondary mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-calendar3" aria-hidden="true" />
            {periodLabel(start_date, end_date)}
          </p>
        </div>
        <DateRangeFilter
          key={`${start_date}|${end_date}`}
          startDate={start_date}
          endDate={end_date}
          onApply={applyPeriod}
          onReset={() => setSearchParams(new URLSearchParams())}
        />
      </div>

      {summary.isError && (
        <div className="alert alert-danger" role="alert">
          {getErrorMessage(summary.error)}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-receipt-cutoff"
            label="Jumlah Penjualan"
            value={`${formatNumber(summaryData?.invoice_count ?? 0)} invoice`}
            variant="primary"
            loading={summary.isPending}
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-shop"
            label="Jumlah Toko"
            value={`${formatNumber(summaryData?.store_count ?? 0)} toko`}
            variant="warning"
            loading={summary.isPending}
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            icon="bi-cash-stack"
            label="Total Penjualan"
            value={formatRupiah(summaryData?.total_amount ?? 0)}
            variant="success"
            loading={summary.isPending}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-body d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
          <h2 className="h6 fw-semibold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-trophy text-warning" aria-hidden="true" />
            Penjualan Tertinggi per Toko
          </h2>
          <div className="d-flex align-items-center gap-2">
            {top.isFetching && !top.isPending && (
              <span className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Memuat...</span>
              </span>
            )}
            <label htmlFor="top-limit" className="visually-hidden">
              Jumlah toko ditampilkan
            </label>
            <select
              id="top-limit"
              className="form-select form-select-sm w-auto"
              value={topLimit}
              onChange={(event) => setTopLimit(Number(event.target.value))}
            >
              {TOP_LIMIT_OPTIONS.map((limitOption) => (
                <option key={limitOption} value={limitOption}>
                  Top {limitOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {top.isError ? (
          <div className="card-body">
            <div className="alert alert-danger mb-0" role="alert">
              {getErrorMessage(top.error)}
            </div>
          </div>
        ) : top.isPending ? (
          <div className="card-body placeholder-glow" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((placeholderRow) => (
              <span key={placeholderRow} className="placeholder col-12 mb-3 rounded" />
            ))}
          </div>
        ) : topItems.length === 0 ? (
          <EmptyState
            icon="bi-bar-chart"
            title="Belum ada data penjualan"
            description={start_date || end_date ? 'Tidak ada invoice pada periode ini.' : 'Tambahkan invoice pertama Anda.'}
          >
            <Link to="/invoices/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Tambah Invoice
            </Link>
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <table className={`table table-hover align-middle mb-0${top.isPlaceholderData ? ' opacity-50' : ''}`}>
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-center rank-col">
                    No
                  </th>
                  <th scope="col">Nama Toko</th>
                  <th scope="col" className="text-end">
                    Total Penjualan
                  </th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item) => (
                  <tr key={item.store_id}>
                    <td className="text-center">
                      {RANK_BADGES[item.rank] ? (
                        <span className={`badge rounded-pill rank-badge ${RANK_BADGES[item.rank]}`}>{item.rank}</span>
                      ) : (
                        <span className="text-body-secondary">{item.rank}</span>
                      )}
                    </td>
                    <td className="text-break">{item.store_name}</td>
                    <td className="text-end text-nowrap fw-semibold">{formatRupiah(item.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
