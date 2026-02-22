import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

export default function InvoicePage() {
  const { reservationId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const downloadPdf = async () => {
    try {
      const res = await api.get(`/api/invoices/${reservationId}/pdf/`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_reservation_${reservationId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('دانلود PDF ناموفق بود.')
    }
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/api/invoices/${reservationId}/`)
        setData(data)
      } catch {
        setError('فاکتور یافت نشد.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [reservationId])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card p-4 text-center">در حال دریافت...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">{error}</div>
        <Link className="btn btn-primary" to="/profile">بازگشت</Link>
      </div>
    )
  }

  if (!data) return null

  const r = data.reservation
  const p = data.parking
  const u = data.user
  const pay = data.payment

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold m-0">فاکتور رزرو #{r.id}</h1>
        <Link className="btn btn-outline-primary" to="/profile">رزروهای من</Link>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <div className="fw-bold mb-2">اطلاعات پارکینگ</div>
            <div className="text-muted">{p.city}</div>
            <div className="fw-semibold mt-1">{p.name}</div>
            <div className="text-muted mt-2">{p.address}</div>
            <hr />
            <div className="d-flex justify-content-between">
              <div className="text-muted">قیمت/ساعت</div>
              <div className="fw-semibold">{(p.price_per_hour || 0).toLocaleString()} تومان</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <div className="fw-bold mb-2">اطلاعات کاربر</div>
            <div className="d-flex justify-content-between">
              <div className="text-muted">نام کاربری</div>
              <div className="fw-semibold">{u.username}</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="text-muted">ایمیل</div>
              <div className="fw-semibold">{u.email || '—'}</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="text-muted">موبایل</div>
              <div className="fw-semibold">{u.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mt-3">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="text-muted">پلاک</div>
            <div className="fw-semibold">{r.car_plate}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted">شروع</div>
            <div className="fw-semibold">{fmt(r.start_time)}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted">پایان</div>
            <div className="fw-semibold">{fmt(r.end_time)}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted">مبلغ</div>
            <div className="fw-bold fs-5">{(r.amount || 0).toLocaleString()} تومان</div>
          </div>
        </div>
        <hr />
        <div className="row g-3">
          <div className="col-md-6">
            <div className="text-muted">وضعیت رزرو</div>
            <div className="fw-semibold">{r.status} | paid: {String(r.is_paid)}</div>
          </div>
          <div className="col-md-6">
            <div className="text-muted">پرداخت</div>
            <div className="fw-semibold">{pay ? `${pay.status} (${pay.provider})` : 'ثبت نشده'}</div>
            {pay?.ref_id && <div className="text-muted small">ref: {pay.ref_id}</div>}
          </div>
        </div>
      </div>

      <div className="mt-3 d-flex flex-wrap gap-2 justify-content-end">
        <button className="btn btn-outline-primary" onClick={downloadPdf}>دانلود PDF</button>
        <button className="btn btn-outline-secondary" onClick={() => window.print()}>چاپ</button>
      </div>
    </div>
  )
}
