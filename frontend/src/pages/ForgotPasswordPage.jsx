import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/password-reset/', { email })
      setDone(true)
    } catch {
      setError('ارسال درخواست بازیابی با مشکل مواجه شد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <div className="card p-4 p-md-5">
        <h1 className="h4 fw-bold mb-2">فراموشی رمز عبور</h1>
        <p className="text-muted mb-4">ایمیل ثبت‌شده را وارد کن. در حالت توسعه، اطلاعات uid و token در ترمینال بک‌اند چاپ می‌شود.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        {done ? (
          <div className="alert alert-success">درخواست ثبت شد. سپس وارد صفحه <Link to="/reset" className="fw-semibold">تغییر رمز</Link> شو.</div>
        ) : (
          <form onSubmit={submit} className="d-grid gap-3">
            <div>
              <label className="form-label">ایمیل</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? '...' : 'ارسال لینک'}</button>
            <div className="d-flex justify-content-between">
              <Link className="text-primary" to="/login">ورود</Link>
              <Link className="text-primary" to="/register">ثبت‌نام</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
