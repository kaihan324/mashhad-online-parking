import React, { useEffect, useMemo, useState } from 'react'
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

export default function AdminDashboard() {
  const [tab, setTab] = useState('summary')

  const [summary, setSummary] = useState(null)
  const [parkings, setParkings] = useState([])
  const [reservations, setReservations] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [contacts, setContacts] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [parkingForm, setParkingForm] = useState({ name: '', city: 'مشهد', address: '', total_capacity: 100, price_per_hour: 10000, image_url: '' })
  const [savingParking, setSavingParking] = useState(false)

  const [editingParking, setEditingParking] = useState(null)
  const [editParkingForm, setEditParkingForm] = useState({ name: '', city: '', address: '', total_capacity: 0, price_per_hour: 0, image_url: '' })
  const [savingEditParking, setSavingEditParking] = useState(false)

  const [userForm, setUserForm] = useState({ username: '', email: '', phone: '', role: 'user', password: '' })
  const [savingUser, setSavingUser] = useState(false)

  const [broadcast, setBroadcast] = useState({ title: '', body: '' })
  const [broadcasting, setBroadcasting] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, p, r, u, rev, c] = await Promise.all([
        api.get('/api/reports/summary/'),
        api.get('/api/parkings/'),
        api.get('/api/reservations/'),
        api.get('/api/users/'),
        api.get('/api/reviews/'),
        api.get('/api/contact/')
      ])
      setSummary(s.data)
      setParkings(Array.isArray(p.data) ? p.data : [])
      setReservations(Array.isArray(r.data) ? r.data : [])
      setUsers(Array.isArray(u.data) ? u.data : [])
      setReviews(Array.isArray(rev.data) ? rev.data : [])
      setContacts(Array.isArray(c.data) ? c.data : [])
    } catch {
      setError('دریافت اطلاعات پنل ادمین ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const createParking = async (e) => {
    e.preventDefault()
    setSavingParking(true)
    setError('')
    try {
      await api.post('/api/parkings/', {
        name: parkingForm.name,
        city: parkingForm.city,
        address: parkingForm.address,
        total_capacity: Number(parkingForm.total_capacity),
        price_per_hour: Number(parkingForm.price_per_hour),
        ...(parkingForm.image_url ? { image_url: parkingForm.image_url } : {})
      })
      setParkingForm({ name: '', city: 'مشهد', address: '', total_capacity: 100, price_per_hour: 10000, image_url: '' })
      await loadAll()
    } catch {
      setError('ایجاد پارکینگ ناموفق بود.')
    } finally {
      setSavingParking(false)
    }
  }

  const deleteParking = async (id) => {
    if (!confirm('پارکینگ حذف شود؟')) return
    try {
      await api.delete(`/api/parkings/${id}/`)
      await loadAll()
    } catch {
      setError('حذف پارکینگ ناموفق بود.')
    }
  }

  const openEditParking = (p) => {
    setEditingParking(p)
    setEditParkingForm({
      name: p.name || '',
      city: p.city || '',
      address: p.address || '',
      total_capacity: Number(p.total_capacity || 0),
      price_per_hour: Number(p.price_per_hour || 0),
      image_url: p.image_url || ''
    })
  }

  const saveEditParking = async (e) => {
    e.preventDefault()
    if (!editingParking) return
    setSavingEditParking(true)
    setError('')
    try {
      await api.patch(`/api/parkings/${editingParking.id}/`, {
        name: editParkingForm.name,
        city: editParkingForm.city,
        address: editParkingForm.address,
        total_capacity: Number(editParkingForm.total_capacity),
        price_per_hour: Number(editParkingForm.price_per_hour),
        image_url: editParkingForm.image_url || null,
      })
      setEditingParking(null)
      await loadAll()
    } catch {
      setError('ویرایش پارکینگ ناموفق بود.')
    } finally {
      setSavingEditParking(false)
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

  const approveReservation = async (id) => {
    if (!confirm('رزرو تایید شود؟')) return
    try {
      await api.post(`/api/reservations/${id}/approve/`)
      await loadAll()
    } catch {
      setError('تایید رزرو ناموفق بود.')
    }
  }

  const rejectReservation = async (id) => {
    const reason = prompt('دلیل رد/لغو (اختیاری):') || ''
    try {
      await api.post(`/api/reservations/${id}/reject/`, reason ? { reason } : {})
      await loadAll()
    } catch {
      setError('رد/لغو رزرو ناموفق بود.')
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    setSavingUser(true)
    setError('')
    try {
      await api.post('/api/users/', {
        username: userForm.username,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        password: userForm.password,
        is_active: true
      })
      setUserForm({ username: '', email: '', phone: '', role: 'user', password: '' })
      await loadAll()
    } catch {
      setError('ساخت کاربر ناموفق بود.')
    } finally {
      setSavingUser(false)
    }
  }

  const updateUser = async (u, patch) => {
    try {
      await api.patch(`/api/users/${u.id}/`, patch)
      await loadAll()
    } catch {
      setError('ویرایش کاربر ناموفق بود.')
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('کاربر حذف شود؟')) return
    try {
      await api.delete(`/api/users/${id}/`)
      await loadAll()
    } catch {
      setError('حذف کاربر ناموفق بود.')
    }
  }

  const replyReview = async (reviewId) => {
    const admin_reply = prompt('پاسخ مدیریت:')
    if (!admin_reply) return
    try {
      await api.patch(`/api/reviews/${reviewId}/reply/`, { admin_reply })
      await loadAll()
    } catch {
      setError('ثبت پاسخ ناموفق بود.')
    }
  }

  const sendBroadcast = async (e) => {
    e.preventDefault()
    setBroadcasting(true)
    setError('')
    try {
      await api.post('/api/notifications/broadcast/', { title: broadcast.title, body: broadcast.body })
      setBroadcast({ title: '', body: '' })
      await loadAll()
    } catch {
      setError('ارسال اعلان همگانی ناموفق بود.')
    } finally {
      setBroadcasting(false)
    }
  }

  const byStatus = useMemo(() => {
    const map = new Map()
    ;(summary?.by_status || []).forEach((x) => map.set(x.status, x.count))
    return map
  }, [summary])

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold m-0">پنل ادمین</h1>
          <div className="text-muted">گزارش‌ها و مدیریت سامانه</div>
        </div>
        <button className="btn btn-outline-primary" onClick={loadAll} disabled={loading}>{loading ? '...' : 'بروزرسانی'}</button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <ul className="nav nav-pills gap-2 mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>خلاصه</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'parkings' ? 'active' : ''}`} onClick={() => setTab('parkings')}>پارکینگ‌ها</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>رزروها</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>کاربران</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>نظرات</button></li>
        {contacts.length > 0 && (
          <li className="nav-item"><button className={`nav-link ${tab === 'contact' ? 'active' : ''}`} onClick={() => setTab('contact')}>تماس با ما</button></li>
        )}
        <li className="nav-item"><button className={`nav-link ${tab === 'broadcast' ? 'active' : ''}`} onClick={() => setTab('broadcast')}>اعلان همگانی</button></li>
      </ul>

      {tab === 'summary' && (
        <div className="row g-3">
          <div className="col-md-3"><div className="card p-4"><div className="text-muted">کل رزروها</div><div className="fs-3 fw-bold">{summary?.total_reservations ?? '—'}</div></div></div>
          <div className="col-md-3"><div className="card p-4"><div className="text-muted">کل کاربران</div><div className="fs-3 fw-bold">{summary?.total_users ?? '—'}</div></div></div>
          <div className="col-md-3"><div className="card p-4"><div className="text-muted">کاربران فعال</div><div className="fs-3 fw-bold">{summary?.active_users ?? '—'}</div></div></div>
          <div className="col-md-3"><div className="card p-4"><div className="text-muted">درآمد تایید شده</div><div className="fs-3 fw-bold">{(summary?.total_revenue || 0).toLocaleString()} تومان</div></div></div>
          <div className="col-12">
            <div className="card p-4">
              <div className="fw-bold mb-2">وضعیت رزروها</div>
              <div className="d-flex flex-wrap gap-2">
                {['pending','confirmed','canceled','expired'].map((k) => (
                  <span key={k} className="badge text-bg-light border">{statusLabel(k)}: {byStatus.get(k) || 0}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'parkings' && (
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="card p-4">
              <div className="fw-bold mb-3">افزودن پارکینگ</div>
              <form onSubmit={createParking} className="row g-3">
                <div className="col-12"><label className="form-label">نام</label><input className="form-control" value={parkingForm.name} onChange={(e) => setParkingForm((p) => ({ ...p, name: e.target.value }))} required /></div>
                <div className="col-12"><label className="form-label">شهر</label><input className="form-control" value={parkingForm.city} onChange={(e) => setParkingForm((p) => ({ ...p, city: e.target.value }))} required /></div>
                <div className="col-12"><label className="form-label">آدرس</label><textarea className="form-control" rows="3" value={parkingForm.address} onChange={(e) => setParkingForm((p) => ({ ...p, address: e.target.value }))} required></textarea></div>
                <div className="col-md-6"><label className="form-label">ظرفیت کل</label><input className="form-control" type="number" min="0" value={parkingForm.total_capacity} onChange={(e) => setParkingForm((p) => ({ ...p, total_capacity: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">قیمت/ساعت</label><input className="form-control" type="number" min="0" value={parkingForm.price_per_hour} onChange={(e) => setParkingForm((p) => ({ ...p, price_per_hour: e.target.value }))} required /></div>
                <div className="col-12"><label className="form-label">آدرس تصویر (اختیاری)</label><input className="form-control" value={parkingForm.image_url} onChange={(e) => setParkingForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>
                <div className="col-12 d-grid"><button className="btn btn-primary" disabled={savingParking}>{savingParking ? '...' : 'ثبت'}</button></div>
              </form>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table m-0 align-middle">
                  <thead className="table-light"><tr><th>نام</th><th>شهر</th><th>ظرفیت</th><th>قیمت</th><th className="text-end">عملیات</th></tr></thead>
                  <tbody>
                    {parkings.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.name}</td>
                        <td className="text-muted">{p.city}</td>
                        <td>{p.total_capacity}</td>
                        <td>{(p.price_per_hour || 0).toLocaleString()}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEditParking(p)}>ویرایش</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteParking(p.id)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table m-0 align-middle">
              <thead className="table-light"><tr><th>کد</th><th>کاربر</th><th>پارکینگ</th><th>زمان</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.id}</td>
                    <td className="text-muted">{r.user}</td>
                    <td>
                      <div className="fw-semibold">{r.parking_name}</div>
                      <div className="text-muted small">{r.parking_city}</div>
                    </td>
                    <td className="small">{fmt(r.start_time)} تا {fmt(r.end_time)}</td>
                    <td>{(r.amount || 0).toLocaleString()}</td>
                    <td><span className={`badge ${r.status === 'confirmed' ? 'text-bg-success' : r.status === 'pending' ? 'text-bg-warning' : 'text-bg-secondary'}`}>{statusLabel(r.status)}</span></td>
                    <td className="text-end">
                      <div className="d-flex flex-wrap gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-success" onClick={() => approveReservation(r.id)} disabled={r.status === 'confirmed'}>تایید</button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => rejectReservation(r.id)} disabled={r.status === 'canceled'}>رد</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelReservation(r.id)} disabled={r.status === 'canceled'}>لغو</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="card p-4">
              <div className="fw-bold mb-3">افزودن کاربر</div>
              <form onSubmit={createUser} className="row g-3">
                <div className="col-12"><label className="form-label">نام کاربری</label><input className="form-control" value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} required /></div>
                <div className="col-12"><label className="form-label">ایمیل</label><input className="form-control" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="col-12"><label className="form-label">موبایل</label><input className="form-control" value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div className="col-md-6"><label className="form-label">نقش</label>
                  <select className="form-select" value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
                    <option value="user">user</option>
                    <option value="parking_manager">parking_manager</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="col-md-6"><label className="form-label">رمز عبور</label><input className="form-control" type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} required /></div>
                <div className="col-12 d-grid"><button className="btn btn-primary" disabled={savingUser}>{savingUser ? '...' : 'ثبت'}</button></div>
              </form>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table m-0 align-middle">
                  <thead className="table-light"><tr><th>کد</th><th>نام کاربری</th><th>ایمیل</th><th>نقش</th><th>فعال</th><th></th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="fw-semibold">{u.id}</td>
                        <td>{u.username}</td>
                        <td className="text-muted">{u.email || '—'}</td>
                        <td style={{ width: 180 }}>
                          <select className="form-select form-select-sm" value={u.role} onChange={(e) => updateUser(u, { role: e.target.value })}>
                            <option value="user">user</option>
                            <option value="parking_manager">parking_manager</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td style={{ width: 120 }}>
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" checked={!!u.is_active} onChange={(e) => updateUser(u, { is_active: e.target.checked })} />
                          </div>
                        </td>
                        <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u.id)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table m-0 align-middle">
              <thead className="table-light"><tr><th>کد</th><th>پارکینگ</th><th>کاربر</th><th>امتیاز</th><th>نظر</th><th>پاسخ</th><th></th></tr></thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev.id}>
                    <td className="fw-semibold">{rev.id}</td>
                    <td className="fw-semibold">{rev.parking}</td>
                    <td className="text-muted">{rev.user_display || rev.user}</td>
                    <td>{rev.rating}</td>
                    <td style={{ maxWidth: 420 }} className="small">{rev.comment}</td>
                    <td style={{ maxWidth: 320 }} className="small">{rev.admin_reply || '—'}</td>
                    <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => replyReview(rev.id)}>پاسخ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table m-0 align-middle">
              <thead className="table-light">
                <tr><th>کد</th><th>نام</th><th>ایمیل</th><th>پیام</th><th>زمان</th></tr>
              </thead>
              <tbody>
                {contacts.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-semibold">{m.id}</td>
                    <td className="fw-semibold">{m.name}</td>
                    <td className="text-muted">{m.email}</td>
                    <td style={{ maxWidth: 520 }} className="small">{m.message}</td>
                    <td className="small">{fmt(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="card p-4">
          <div className="fw-bold mb-3">ارسال اعلان برای همه کاربران</div>
          <form onSubmit={sendBroadcast} className="row g-3">
            <div className="col-12"><label className="form-label">عنوان</label><input className="form-control" value={broadcast.title} onChange={(e) => setBroadcast((p) => ({ ...p, title: e.target.value }))} required /></div>
            <div className="col-12"><label className="form-label">متن</label><textarea className="form-control" rows="4" value={broadcast.body} onChange={(e) => setBroadcast((p) => ({ ...p, body: e.target.value }))} required></textarea></div>
            <div className="col-12 d-grid"><button className="btn btn-primary" disabled={broadcasting}>{broadcasting ? '...' : 'ارسال'}</button></div>
          </form>
        </div>
      )}

      {editingParking && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">ویرایش پارکینگ</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setEditingParking(null)} />
                </div>
                <form onSubmit={saveEditParking}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">نام</label>
                        <input className="form-control" value={editParkingForm.name} onChange={(e) => setEditParkingForm((p) => ({ ...p, name: e.target.value }))} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">شهر</label>
                        <input className="form-control" value={editParkingForm.city} onChange={(e) => setEditParkingForm((p) => ({ ...p, city: e.target.value }))} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label">آدرس</label>
                        <textarea className="form-control" rows="3" value={editParkingForm.address} onChange={(e) => setEditParkingForm((p) => ({ ...p, address: e.target.value }))} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">ظرفیت کل</label>
                        <input className="form-control" type="number" min="0" value={editParkingForm.total_capacity} onChange={(e) => setEditParkingForm((p) => ({ ...p, total_capacity: e.target.value }))} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">قیمت/ساعت</label>
                        <input className="form-control" type="number" min="0" value={editParkingForm.price_per_hour} onChange={(e) => setEditParkingForm((p) => ({ ...p, price_per_hour: e.target.value }))} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label">آدرس تصویر</label>
                        <input className="form-control" value={editParkingForm.image_url} onChange={(e) => setEditParkingForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                        <div className="text-muted small mt-1">اگر خالی باشد، در UI از تصاویر پیش‌فرض مرتبط با پارکینگ استفاده می‌شود.</div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingParking(null)} disabled={savingEditParking}>انصراف</button>
                    <button type="submit" className="btn btn-primary" disabled={savingEditParking}>{savingEditParking ? '...' : 'ذخیره تغییرات'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setEditingParking(null)} />
        </>
      )}
    </div>
  )
}
