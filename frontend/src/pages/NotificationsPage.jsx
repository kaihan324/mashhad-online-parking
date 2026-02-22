import React, { useEffect, useState } from 'react'
import api from '../api/client'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

export default function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/notifications/')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('دریافت اعلان‌ها ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fallback = [
    { id: 'demo-1', title: 'خوش آمدید', body: 'حساب شما فعال است. برای رزرو، از صفحه «پارکینگ‌ها» یک گزینه را انتخاب کنید.', created_at: new Date() },
    { id: 'demo-2', title: 'یادآوری', body: 'قبل از حرکت، زمان رزرو را چک کنید تا در محدوده‌های شلوغ معطل نشوید.', created_at: new Date(Date.now() - 3600 * 1000) },
    { id: 'demo-3', title: 'نکته کاربردی', body: 'در روزهای شلوغ، پارکینگ‌های ظرفیت بالا مثل «رضا» و «الماس شرق» معمولاً انتخاب مطمئنی هستند.', created_at: new Date(Date.now() - 5 * 3600 * 1000) },
  ]

  const list = items.length ? items : fallback

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold m-0">اعلان‌ها</h1>
        <button className="btn btn-outline-primary" onClick={load} disabled={loading}>{loading ? '...' : 'بروزرسانی'}</button>
      </div>
      {error && <div className="alert alert-warning">{error}</div>}
      {loading && <div className="card p-4 text-center">در حال دریافت...</div>}
      {!loading && !items.length && <div className="card p-4 text-center text-muted">هنوز اعلانی برای شما ثبت نشده؛ چند نمونه پیش‌فرض نمایش داده شده است.</div>}
      <div className="row g-3">
        {list.map((n) => (
          <div key={n.id} className="col-md-6">
            <div className="card p-4 h-100">
              <div className="d-flex justify-content-between gap-2">
                <div className="fw-bold">{n.title}</div>
                <div className="text-muted small">{fmt(n.created_at)}</div>
              </div>
              <div className="text-muted mt-2">{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
