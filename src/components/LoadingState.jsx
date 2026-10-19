export function LoadingState({ text = 'Memuat data...', fullScreen = false }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center gap-3 text-body-secondary ${
        fullScreen ? 'min-vh-100' : 'py-5'
      }`}
      role="status"
    >
      <div className="spinner-border text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}
