import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Collapse } from '../utils/bootstrap'

const MENU = [
  { to: '/', label: 'Home', icon: 'bi-house-door' },
  { to: '/invoices', label: 'Daftar Invoice', icon: 'bi-list-ul' },
  { to: '/invoices/new', label: 'Tambah Invoice', icon: 'bi-plus-circle' },
]

export function AppNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const collapseRef = useRef(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // Tutup menu hamburger setelah memilih menu (HP/tablet).
  const closeMenu = () => {
    const collapseElement = collapseRef.current
    if (collapseElement?.classList.contains('show')) {
      Collapse.getOrCreateInstance(collapseElement, { toggle: false }).hide()
    }
  }

  const handleLogout = async () => {
    closeMenu()
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // Session lokal tetap dibersihkan oleh AuthProvider walau request gagal.
    }
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg bg-primary sticky-top shadow-sm" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-semibold" to="/" onClick={closeMenu}>
          <i className="bi bi-receipt fs-4" aria-hidden="true" />
          Invoice Penjualan
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Buka menu navigasi"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar" ref={collapseRef}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {MENU.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) => `nav-link d-flex align-items-center gap-2${isActive ? ' active fw-semibold' : ''}`}
                  onClick={closeMenu}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 pb-2 pb-lg-0">
            <span className="navbar-text d-flex align-items-center gap-2 text-white">
              <i className="bi bi-person-circle fs-5" aria-hidden="true" />
              <span className="text-truncate app-username">{user?.username}</span>
            </span>
            <button
              type="button"
              className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              ) : (
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
              )}
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
