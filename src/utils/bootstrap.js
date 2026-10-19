// Akses class Bootstrap JS (Modal, Collapse, Toast) dari bundle yang sama dengan main.jsx.
import * as bundle from 'bootstrap/dist/js/bootstrap.bundle.min.js'

const bootstrap = bundle.default ?? bundle

export const { Modal, Collapse, Toast } = bootstrap
