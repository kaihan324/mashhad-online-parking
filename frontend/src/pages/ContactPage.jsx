import React, { useState } from 'react'
import api from '../api/client'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await api.post('/api/contact/', {
        name: form.name,
        email: form.email,
        message: form.message,
      })
      setSent(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setError('ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card p-4 p-md-5">
            <h1 className="h4 fw-bold mb-2">تماس با ما</h1>
            <p className="text-muted mb-4">پیام شما برای تیم پشتیبانی ثبت می‌شود و در اسرع وقت بررسی خواهد شد.</p>

            {sent && <div className="alert alert-success">پیام شما با موفقیت ثبت شد. ممنون از شما!</div>}
            {error && <div className="alert alert-warning">{error}</div>}

            <form className="row g-3" onSubmit={submit}>
              <div className="col-md-6">
                <label className="form-label">نام</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">ایمیل</label>
                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="col-12">
                <label className="form-label">پیام</label>
                <textarea className="form-control" rows="5" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required />
              </div>
              <div className="col-12 d-grid">
                <button className="btn btn-primary" disabled={sending}>{sending ? '...' : 'ارسال پیام'}</button>
              </div>
            </form>

            <hr className="my-4" />

            <div className="text-muted small">
              <div className="fw-semibold mb-1">راهنما</div>
              <ul className="mb-0">
                <li>اگر مشکل رزرو/پرداخت دارید، بهتر است از منوی «پشتیبانی» هم تیکت ثبت کنید.</li>
                <li>برای پیگیری سریع‌تر، ایمیل صحیح وارد کنید.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
