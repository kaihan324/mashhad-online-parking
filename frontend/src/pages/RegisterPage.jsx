import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const me = await register(form)
      const role = me?.role
      if (role === 'admin') return navigate('/admin')
      if (role === 'parking_manager') return navigate('/manager')
      return navigate('/parkings')
    } catch {
      setError('ثبت‌نام ناموفق بود. ممکن است نام کاربری/ایمیل تکراری باشد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card p-4 p-md-5">
            <h1 className="h4 fw-bold mb-3">ثبت‌نام</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={submit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">نام کاربری</label>
                <input className="form-control" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">ایمیل</label>
                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="col-12">
                <label className="form-label">شماره تماس</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">رمز عبور</label>
                <input type="password" className="form-control" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
              </div>
              <div className="col-12 d-grid">
                <button className="btn btn-primary" disabled={loading}>{loading ? '...' : 'ثبت‌نام'}</button>
              </div>
            </form>

            <div className="text-muted mt-3">
              قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
