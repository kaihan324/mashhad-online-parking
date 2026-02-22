import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

const statusText = (s) => {
  if (s === 'open') return 'باز'
  if (s === 'in_progress') return 'در حال بررسی'
  if (s === 'closed') return 'بسته'
  return s
}

export default function SupportPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/tickets/')
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setError('دریافت تیکت‌ها ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id])

  const submit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSending(true)
    setError('')
    try {
      await api.post('/api/tickets/', { subject: form.subject, message: form.message })
      setForm({ subject: '', message: '' })
      await load()
    } catch {
      setError('ارسال تیکت ناموفق بود.')
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/tickets/${id}/`, { status })
      await load()
    } catch {
      setError('بروزرسانی وضعیت ناموفق بود.')
    }
  }

  const openCount = useMemo(() => tickets.filter((t) => t.status === 'open').length, [tickets])

  if (!user) {
    return (
      <div className="container py-5">
        <div className="card p-4 p-md-5 text-center">
          <h1 className="h4 fw-bold mb-2">پشتیبانی</h1>
          <p className="text-muted mb-4">برای مشاهده/ارسال تیکت، ابتدا وارد حساب کاربری شوید.</p>
          <div className="d-flex justify-content-center gap-2">
            <Link className="btn btn-primary" to="/login">ورود</Link>
            <Link className="btn btn-outline-primary" to="/register">ثبت‌نام</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold m-0">پشتیبانی</h1>
          <div className="text-muted">تیکت‌های {isAdmin ? 'همه کاربران' : 'شما'} | باز: {openCount}</div>
        </div>
        <button className="btn btn-outline-primary" onClick={load} disabled={loading}>{loading ? '...' : 'بروزرسانی'}</button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card p-4">
            <h2 className="h5 fw-bold">ارسال درخواست</h2>
            <form onSubmit={submit} className="d-grid gap-3 mt-3">
              <div>
                <label className="form-label">موضوع</label>
                <input className="form-control" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">پیام</label>
                <textarea className="form-control" rows="5" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required></textarea>
              </div>
              <button className="btn btn-primary" disabled={sending}>{sending ? '...' : 'ارسال تیکت'}</button>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          {loading && <div className="card p-4 text-center">در حال دریافت...</div>}
          {!loading && !tickets.length && <div className="card p-4 text-center text-muted">تیکتی ثبت نشده است.</div>}
          <div className="d-grid gap-3">
            {tickets.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="fw-bold">#{t.id} {t.subject}</div>
                    <div className="text-muted small">{fmt(t.created_at)}</div>
                    {isAdmin && <div className="text-muted small">کاربر: {t.user_username} ({t.user_email})</div>}
                  </div>
                  <span className={`badge ${t.status === 'open' ? 'text-bg-primary' : t.status === 'in_progress' ? 'text-bg-warning' : 'text-bg-success'}`}>{statusText(t.status)}</span>
                </div>
                <div className="text-muted mt-3" style={{ whiteSpace: 'pre-wrap' }}>{t.message}</div>
                {isAdmin && (
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => updateStatus(t.id, 'open')}>باز</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => updateStatus(t.id, 'in_progress')}>در حال بررسی</button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(t.id, 'closed')}>بستن</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
