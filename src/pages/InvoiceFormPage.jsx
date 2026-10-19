import { useEffect, useId, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '../components/LoadingState'
import { useToast } from '../components/toastContext'
import { getErrorMessage, getFieldErrors, isNotFound } from '../api/client'
import { useDebounce } from '../hooks/useDebounce'
import { useInvoice } from '../hooks/useInvoice'
import { useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices'
import { useStores } from '../hooks/useStores'
import { todayJakarta } from '../utils/formatDate'
import { createInvoiceSchema } from '../utils/invoiceSchema'
import { formatAmountInput } from '../utils/parseAmount'

const LEAVE_MESSAGE = 'Perubahan belum disimpan. Yakin ingin meninggalkan halaman ini?'

/** Peringatan saat meninggalkan halaman (navigasi di aplikasi maupun tutup tab) jika form berubah. */
function useUnsavedChangesWarning(when) {
  const blocker = useBlocker(when)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm(LEAVE_MESSAGE)) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!when) return
    const warnBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [when])
}

function InvoiceForm({ invoice }) {
  const isEdit = Boolean(invoice)
  const navigate = useNavigate()
  const toast = useToast()
  const datalistId = useId()
  const today = todayJakarta()
  const schema = useMemo(() => createInvoiceSchema(today), [today])

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: isEdit
      ? {
          store_name: invoice.store_name,
          sale_date: invoice.sale_date,
          amount: formatAmountInput(invoice.amount),
        }
      : { store_name: '', sale_date: today, amount: '' },
  })

  const storeName = useWatch({ control, name: 'store_name' })
  const debouncedStoreName = useDebounce(storeName ?? '', 300)
  const stores = useStores(debouncedStoreName)

  const createMutation = useCreateInvoice()
  const updateMutation = useUpdateInvoice(invoice?.id)

  useUnsavedChangesWarning(isDirty && !isSubmitting)

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(values)
        toast.success('Invoice berhasil diperbarui')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Invoice berhasil disimpan')
      }
      navigate('/invoices')
    } catch (error) {
      const fields = getFieldErrors(error)
      if (fields) {
        const fieldNames = Object.keys(fields)
        fieldNames.forEach((fieldName) => setError(fieldName, { type: 'server', message: fields[fieldName] }))
        if (fieldNames[0]) setFocus(fieldNames[0])
        return
      }
      toast.error(isNotFound(error) ? 'Invoice tidak ditemukan' : getErrorMessage(error, 'Gagal menyimpan invoice'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label htmlFor="store_name" className="form-label">
          Nama Toko <span className="text-danger">*</span>
        </label>
        <input
          id="store_name"
          type="text"
          className={`form-control${errors.store_name ? ' is-invalid' : ''}`}
          list={datalistId}
          autoComplete="off"
          maxLength={150}
          placeholder="Contoh: Bearing Jaya"
          aria-invalid={errors.store_name ? 'true' : 'false'}
          aria-describedby="store_name_help"
          autoFocus={!isEdit}
          {...register('store_name')}
        />
        <datalist id={datalistId}>
          {(stores.data ?? []).map((store) => (
            <option key={store.id} value={store.name} />
          ))}
        </datalist>
        {errors.store_name ? (
          <div className="invalid-feedback">{errors.store_name.message}</div>
        ) : (
          <div id="store_name_help" className="form-text">
            Pilih dari daftar atau ketik nama toko baru.
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="sale_date" className="form-label">
          Tanggal Penjualan <span className="text-danger">*</span>
        </label>
        <input
          id="sale_date"
          type="date"
          className={`form-control${errors.sale_date ? ' is-invalid' : ''}`}
          max={today}
          aria-invalid={errors.sale_date ? 'true' : 'false'}
          {...register('sale_date')}
        />
        {errors.sale_date && <div className="invalid-feedback">{errors.sale_date.message}</div>}
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="form-label">
          Penjualan (IDR) <span className="text-danger">*</span>
        </label>
        <div className="input-group has-validation">
          <span className="input-group-text">Rp</span>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <input
                id="amount"
                ref={field.ref}
                name={field.name}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                className={`form-control text-end fw-semibold${errors.amount ? ' is-invalid' : ''}`}
                aria-invalid={errors.amount ? 'true' : 'false'}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(formatAmountInput(event.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.amount && <div className="invalid-feedback">{errors.amount.message}</div>}
        </div>
      </div>

      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          type="submit"
          className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 order-md-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          ) : (
            <i className="bi bi-save" aria-hidden="true" />
          )}
          {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
        </button>
        <Link to="/invoices" className="btn btn-outline-secondary order-md-1">
          Batal
        </Link>
      </div>
    </form>
  )
}

export function InvoiceFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const invoiceQuery = useInvoice(isEdit ? id : null)
  const title = isEdit ? 'Edit Invoice' : 'Tambah Invoice'

  let content
  if (isEdit && invoiceQuery.isPending) {
    content = <LoadingState text="Memuat invoice..." />
  } else if (isEdit && invoiceQuery.isError) {
    content = isNotFound(invoiceQuery.error) ? (
      <div className="text-center py-4">
        <i className="bi bi-file-earmark-x display-5 text-body-tertiary d-block mb-3" aria-hidden="true" />
        <h2 className="h5">Invoice tidak ditemukan</h2>
        <p className="text-body-secondary">Invoice mungkin sudah dihapus.</p>
        <Link to="/invoices" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Kembali ke Daftar Invoice
        </Link>
      </div>
    ) : (
      <div className="alert alert-danger mb-0" role="alert">
        {getErrorMessage(invoiceQuery.error, 'Gagal memuat invoice')}
      </div>
    )
  } else {
    content = <InvoiceForm key={id ?? 'new'} invoice={isEdit ? invoiceQuery.data : null} />
  }

  return (
    <div className="form-page mx-auto">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/invoices">Daftar Invoice</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h1 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} text-primary`} aria-hidden="true" />
            {title}
          </h1>
          {content}
        </div>
      </div>
    </div>
  )
}
