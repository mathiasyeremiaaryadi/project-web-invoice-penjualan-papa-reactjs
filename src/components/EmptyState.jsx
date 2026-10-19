export function EmptyState({ icon = 'bi-inbox', title, description, children }) {
  return (
    <div className="text-center py-5 px-3">
      <i className={`bi ${icon} display-5 text-body-tertiary d-block mb-3`} aria-hidden="true" />
      <h2 className="h5">{title}</h2>
      {description && <p className="text-body-secondary mb-3">{description}</p>}
      {children}
    </div>
  )
}
