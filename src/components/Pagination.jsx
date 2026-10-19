import { getPageItems } from '../utils/pagination'

export function Pagination({ page, totalPages, total, limit, onChange, disabled = false }) {
  const firstItemNumber = total === 0 ? 0 : Math.min((page - 1) * limit + 1, total)
  const lastItemNumber = Math.min(page * limit, total)
  const canGoPrevious = page > 1 && !disabled
  const canGoNext = page < totalPages && !disabled

  const goToPage = (targetPage) => {
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== page) onChange(targetPage)
  }

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
      <div className="text-body-secondary small" aria-live="polite">
        Menampilkan {firstItemNumber} - {lastItemNumber} dari {total} data
      </div>

      {totalPages > 1 && (
        <nav aria-label="Navigasi halaman">
          {/* HP: Sebelumnya · Hal. X dari Y · Berikutnya */}
          <div className="d-flex d-md-none align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
              onClick={() => goToPage(page - 1)}
              disabled={!canGoPrevious}
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
              Sebelumnya
            </button>
            <span className="small text-nowrap px-1">
              Hal. {page} dari {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
              onClick={() => goToPage(page + 1)}
              disabled={!canGoNext}
            >
              Berikutnya
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          </div>

          {/* Tablet & desktop: nomor halaman */}
          <ul className="pagination mb-0 d-none d-md-flex">
            <li className={`page-item${canGoPrevious ? '' : ' disabled'}`}>
              <button type="button" className="page-link" onClick={() => goToPage(page - 1)} aria-label="Halaman sebelumnya">
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </button>
            </li>
            {getPageItems(page, totalPages).map((item) =>
              typeof item === 'number' ? (
                <li key={item} className={`page-item${item === page ? ' active' : ''}${disabled ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => goToPage(item)}
                    aria-current={item === page ? 'page' : undefined}
                    aria-label={`Halaman ${item}`}
                  >
                    {item}
                  </button>
                </li>
              ) : (
                <li key={item} className="page-item disabled" aria-hidden="true">
                  <span className="page-link">…</span>
                </li>
              ),
            )}
            <li className={`page-item${canGoNext ? '' : ' disabled'}`}>
              <button type="button" className="page-link" onClick={() => goToPage(page + 1)} aria-label="Halaman berikutnya">
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
