import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

export default function PaymentPage() {
  const { reservationId } = useParams()
  const nav = useNavigate()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setOk('')
    try {
      const { data } = await api.get(`/api/invoices/${reservationId}/`)
      setInvoice(data)
    } catch {
      setError('اطلاعات رزرو/فاکتور یافت نشد.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [reservationId])

  const finalizePayment = async () => {
    setPaying(true)
    setError('')
    setOk('')
    try {
      const { data } = await api.post('/api/payments/initiate/', { reservation_id: Number(reservationId) })
      await api.post('/api/payments/confirm/', { payment_id: data.payment_id })
      setOk('پرداخت با موفقیت انجام شد.')
      await load()
      // هدایت به صفحه فاکتور
      nav(`/invoice/${reservationId}`, { replace: true })
    } catch {
      setError('نهایی‌سازی پرداخت ناموفق بود. دوباره تلاش کن.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="container py-5"><div className="card p-4 text-center">در حال بارگذاری...</div></div>

  if (error) {
    return (
      <div className="container py-5" style={{ maxWidth: 860 }}>
        <div className="alert alert-warning">{error}</div>
        <Link className="btn btn-primary" to="/profile">بازگشت</Link>
      </div>
    )
  }

  if (!invoice) return null

  const r = invoice.reservation
  const p = invoice.parking
  const pay = invoice.payment

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold m-0">پرداخت رزرو #{r.id}</h1>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-primary" to="/profile">رزروهای من</Link>
          <Link className="btn btn-outline-secondary" to={`/invoice/${r.id}`}>فاکتور</Link>
        </div>
      </div>

      {ok && <div className="alert alert-success">{ok}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="text-muted">پارکینگ</div>
            <div className="fw-semibold">{p.name}</div>
            <div className="text-muted small">{p.city} - {p.address}</div>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="text-muted">مبلغ قابل پرداخت</div>
            <div className="fw-bold fs-4">{(r.amount || 0).toLocaleString()} تومان</div>
          </div>
        </div>

        <hr />

        <div className="row g-2">
          <div className="col-md-4"><span className="text-muted">شروع: </span><span className="fw-semibold">{fmt(r.start_time)}</span></div>
          <div className="col-md-4"><span className="text-muted">پایان: </span><span className="fw-semibold">{fmt(r.end_time)}</span></div>
          <div className="col-md-4"><span className="text-muted">وضعیت: </span><span className="fw-semibold">{r.status}</span></div>
        </div>

        <div className="mt-4 d-flex flex-wrap gap-2 justify-content-end">
          {r.is_paid ? (
            <>
              <span className="badge text-bg-success align-self-center">پرداخت شده</span>
              <Link className="btn btn-primary" to={`/invoice/${r.id}`}>مشاهده فاکتور</Link>
            </>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={finalizePayment} disabled={paying}>
              {paying ? 'در حال پرداخت...' : 'نهایی‌سازی پرداخت'}
            </button>
          )}
        </div>

        {pay?.ref_id && <div className="text-muted small mt-2">ref: {pay.ref_id}</div>}
      </div>

      <div className="text-muted small mt-3">
        این پرداخت به‌صورت شبیه‌سازی‌شده (Mock) انجام می‌شود تا منطق سیستم (رزرو → پرداخت → صدور فاکتور/PDF) کامل باشد.
      </div>
    </div>
  )
}
