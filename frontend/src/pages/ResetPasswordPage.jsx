import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ResetPasswordPage() {
  const [uid, setUid] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/password-reset-confirm/', { uid, token, new_password: newPassword })
      setDone(true)
    } catch {
      setError('اطلاعات نامعتبر است یا توکن منقضی شده.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 660 }}>
      <div className="card p-4 p-md-5">
        <h1 className="h4 fw-bold mb-2">تغییر رمز عبور</h1>
        <p className="text-muted mb-4">uid و token را از ترمینال بک‌اند کپی کن و رمز جدید را ثبت کن.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        {done ? (
          <div className="alert alert-success">رمز عبور با موفقیت تغییر کرد. <Link to="/login" className="fw-semibold">ورود</Link></div>
        ) : (
          <form onSubmit={submit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">uid</label>
              <input className="form-control" value={uid} onChange={(e) => setUid(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">token</label>
              <input className="form-control" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label">رمز جدید</label>
              <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="col-12 d-grid">
              <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? '...' : 'ثبت رمز جدید'}</button>
            </div>
            <div className="col-12 d-flex justify-content-between">
              <Link className="text-primary" to="/forgot">ارسال دوباره لینک</Link>
              <Link className="text-primary" to="/login">ورود</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
