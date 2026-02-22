import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const me = await login(form.username, form.password)
      const role = me?.role
      if (role === 'admin') return navigate('/admin')
      if (role === 'parking_manager') return navigate('/manager')
      return navigate('/parkings')
    } catch {
      setError('نام کاربری یا رمز عبور اشتباه است.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 p-md-5">
            <h1 className="h4 fw-bold mb-3">ورود</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={submit} className="d-grid gap-3">
              <div>
                <label className="form-label">نام کاربری</label>
                <input className="form-control" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">رمز عبور</label>
                <input type="password" className="form-control" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
              </div>
              <button className="btn btn-primary" disabled={loading}>{loading ? '...' : 'ورود'}</button>
            </form>

            <div className="text-muted mt-3">
              حساب ندارید؟ <Link to="/register">ثبت‌نام</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
