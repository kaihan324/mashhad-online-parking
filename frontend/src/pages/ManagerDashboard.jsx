import React, { useEffect, useState } from 'react'
import api from '../api/client'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

const statusLabel = (s) => {
  if (s === 'confirmed') return 'تایید'
  if (s === 'pending') return 'در انتظار'
  if (s === 'canceled') return 'لغو'
  if (s === 'expired') return 'منقضی'
  return s
}

export default function ManagerDashboard() {
  const [parkings, setParkings] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', city: 'مشهد', address: '', total_capacity: 120, price_per_hour: 10000 })
  const [saving, setSaving] = useState(false)

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', city: 'مشهد', address: '', total_capacity: 0, price_per_hour: 0 })
  const [savingEdit, setSavingEdit] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      // mine=1 => only current manager's parkings
      const [p, r] = await Promise.all([
        api.get('/api/parkings/', { params: { mine: 1 } }),
        api.get('/api/reservations/')
      ])
      setParkings(Array.isArray(p.data) ? p.data : [])
      setReservations(Array.isArray(r.data) ? r.data : [])
    } catch {
      setError('دریافت اطلاعات مدیریت ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const createParking = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/parkings/', {
        name: form.name,
        city: form.city,
        address: form.address,
        total_capacity: Number(form.total_capacity),
        price_per_hour: Number(form.price_per_hour)
      })
      setForm({ name: '', city: 'مشهد', address: '', total_capacity: 120, price_per_hour: 10000 })
      await loadAll()
    } catch {
      setError('ثبت پارکینگ ناموفق بود.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p) => {
    setEditId(p.id)
    setEditForm({
      name: p.name || '',
      city: p.city || 'مشهد',
      address: p.address || '',
      total_capacity: Number(p.total_capacity || 0),
      price_per_hour: Number(p.price_per_hour || 0),
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm({ name: '', city: 'مشهد', address: '', total_capacity: 0, price_per_hour: 0 })
  }

  const saveEdit = async () => {
    if (!editId) return
    setSavingEdit(true)
    setError('')
    try {
      await api.patch(`/api/parkings/${editId}/`, {
        name: editForm.name,
        city: editForm.city,
        address: editForm.address,
        total_capacity: Number(editForm.total_capacity),
        price_per_hour: Number(editForm.price_per_hour),
      })
      cancelEdit()
      await loadAll()
    } catch {
      setError('ویرایش پارکینگ ناموفق بود.')
    } finally {
      setSavingEdit(false)
    }
  }

  const cancelReservation = async (id) => {
    if (!confirm('رزرو لغو شود؟')) return
    try {
      await api.post(`/api/reservations/${id}/cancel/`)
      await loadAll()
    } catch {
      setError('لغو رزرو ناموفق بود.')
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold m-0">پنل مدیر پارکینگ</h1>
          <div className="text-muted">مدیریت ظرفیت و مشاهده رزروهای مرتبط</div>
        </div>
        <button className="btn btn-outline-primary" onClick={loadAll} disabled={loading}>{loading ? '...' : 'بروزرسانی'}</button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card p-4">
            <div className="fw-bold mb-3">افزودن پارکینگ</div>
            <form onSubmit={createParking} className="row g-3">
              <div className="col-12"><label className="form-label">نام</label><input className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
              <div className="col-12"><label className="form-label">شهر</label><input className="form-control" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required /></div>
              <div className="col-12"><label className="form-label">آدرس</label><textarea className="form-control" rows="3" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required></textarea></div>
              <div className="col-md-6"><label className="form-label">ظرفیت</label><input className="form-control" type="number" min="0" value={form.total_capacity} onChange={(e) => setForm((p) => ({ ...p, total_capacity: e.target.value }))} required /></div>
              <div className="col-md-6"><label className="form-label">قیمت/ساعت</label><input className="form-control" type="number" min="0" value={form.price_per_hour} onChange={(e) => setForm((p) => ({ ...p, price_per_hour: e.target.value }))} required /></div>
              <div className="col-12 d-grid"><button className="btn btn-primary" disabled={saving}>{saving ? '...' : 'ثبت'}</button></div>
            </form>
          </div>

          <div className="card p-4 mt-3">
            <div className="fw-bold mb-3">پارکینگ‌ها</div>
            <div className="d-grid gap-2">
              {parkings.map((p) => (
                <div key={p.id} className="border rounded-4 p-3">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="text-muted small">{p.city}</div>
                      <div className="text-muted small mt-1">ظرفیت: {p.total_capacity} | قیمت: {(p.price_per_hour || 0).toLocaleString()} تومان</div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(p)}>ویرایش</button>
                  </div>
                </div>
              ))}
              {!parkings.length && <div className="text-muted">پارکینگی ثبت نشده است.</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table m-0 align-middle">
                <thead className="table-light"><tr><th>کد</th><th>پارکینگ</th><th>پلاک</th><th>زمان</th><th>وضعیت</th><th></th></tr></thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.id}</td>
                      <td className="fw-semibold">{r.parking_name}</td>
                      <td className="text-muted">{r.car_plate}</td>
                      <td className="small">{fmt(r.start_time)} تا {fmt(r.end_time)}</td>
                      <td><span className={`badge ${r.status === 'confirmed' ? 'text-bg-success' : r.status === 'pending' ? 'text-bg-warning' : 'text-bg-secondary'}`}>{statusLabel(r.status)}</span></td>
                      <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => cancelReservation(r.id)} disabled={r.status === 'canceled'}>لغو</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal (simple inline card) */}
      {editId && (
        <div className="modal-backdrop show" style={{ display: 'block' }}>
          <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">ویرایش پارکینگ</h5>
                  <button type="button" className="btn-close" onClick={cancelEdit} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12"><label className="form-label">نام</label><input className="form-control" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} /></div>
                    <div className="col-12"><label className="form-label">شهر</label><input className="form-control" value={editForm.city} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} /></div>
                    <div className="col-12"><label className="form-label">آدرس</label><textarea className="form-control" rows="3" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}></textarea></div>
                    <div className="col-md-6"><label className="form-label">ظرفیت</label><input className="form-control" type="number" min="0" value={editForm.total_capacity} onChange={(e) => setEditForm((p) => ({ ...p, total_capacity: e.target.value }))} /></div>
                    <div className="col-md-6"><label className="form-label">قیمت/ساعت</label><input className="form-control" type="number" min="0" value={editForm.price_per_hour} onChange={(e) => setEditForm((p) => ({ ...p, price_per_hour: e.target.value }))} /></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={cancelEdit} disabled={savingEdit}>انصراف</button>
                  <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? '...' : 'ذخیره'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
