/** Header tabel yang bisa diklik untuk sort. Klik pertama ASC, klik berikutnya membalik arah. */
export function SortableTh({ field, label, sortBy, sortOrder, onSort, className = '' }) {
  const active = sortBy === field
  const nextOrder = active && sortOrder === 'asc' ? 'desc' : 'asc'
  const icon = !active ? 'bi-arrow-down-up' : sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down'
  const ariaSort = !active ? 'none' : sortOrder === 'asc' ? 'ascending' : 'descending'

  return (
    <th scope="col" className={className} aria-sort={ariaSort}>
      <button
        type="button"
        className={`btn btn-link p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1 sort-btn${active ? ' text-primary' : ' text-body'}`}
        onClick={() => onSort(field, nextOrder)}
        title={`Urutkan berdasarkan ${label.toLowerCase()}`}
      >
        {label}
        <i className={`bi ${icon}${active ? '' : ' text-body-tertiary'}`} aria-hidden="true" />
      </button>
    </th>
  )
}
