import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const fmt = (v) => {
  if (!v) return ''
  try { return new Date(v).toLocaleString('fa-IR') } catch { return String(v) }
}

const toIsoSeconds = (value) => {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

const nowPlus = (hours) => {
  const d = new Date(Date.now() + hours * 3600 * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const statusLabel = (s) => {
  if (s === 'confirmed') return 'تایید شده'
  if (s === 'pending') return 'در انتظار پرداخت'
  if (s === 'canceled') return 'لغو شده'
  if (s === 'expired') return 'منقضی شده'
  return s
}

export default function ProfilePage() {
  const { user, refreshMe } = useAuth()
  const nav = useNavigate()

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  // profile edit
  const [edit, setEdit] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ username: '', email: '', phone: '' })

  // quick reserve
  const [parkings, setParkings] = useState([])
  const [reserveForm, setReserveForm] = useState({
    parkingId: '',
    start: nowPlus(1),
    durationHours: 2,
    carPlate: '',
  })
  const [reserveLoading, setReserveLoading] = useState(false)
  const [reserveOk, setReserveOk] = useState('')
  const [reserveError, setReserveError] = useState('')
  const [lastReservationId, setLastReservationId] = useState(null)

  useEffect(() => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
  }, [user])

  const loadReservations = async () => {
    setLoading(true)
    setError('')
    try {
      await refreshMe()
      const { data } = await api.get('/api/reservations/', filter ? { params: { status: filter } } : undefined)
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      setError('دریافت رزروها ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  const loadParkings = async () => {
    try {
      const { data } = await api.get('/api/parkings/')
      setParkings(Array.isArray(data) ? data : [])
    } catch {
      // keep silent
    }
  }

  useEffect(() => { loadReservations() }, [filter])
  useEffect(() => { loadParkings() }, [])

  const summary = useMemo(() => {
    const total = reservations.length
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length
    const pending = reservations.filter((r) => r.status === 'pending').length
    return { total, confirmed, pending }
  }, [reservations])

  const cancel = async (id) => {
    if (!confirm('رزرو لغو شود؟')) return
    try {
      await api.post(`/api/reservations/${id}/cancel/`)
      await loadReservations()
    } catch {
      setError('لغو رزرو ناموفق بود.')
    }
  }

  const goPay = (reservationId) => {
    nav(`/payment/${reservationId}`)
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    setError('')
    try {
      await api.patch('/api/auth/me/', {
        username: profileForm.username,
        email: profileForm.email,
        phone: profileForm.phone
      })
      await refreshMe()
      setEdit(false)
    } catch {
      setError('ذخیره پروفایل ناموفق بود.')
    } finally {
      setSavingProfile(false)
    }
  }

  const cancelEdit = () => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setEdit(false)
  }

  const startIso = useMemo(() => toIsoSeconds(reserveForm.start), [reserveForm.start])

  const endIso = useMemo(() => {
    const s = new Date(reserveForm.start)
    const e = new Date(s.getTime() + Number(reserveForm.durationHours || 0) * 3600000)
    return toIsoSeconds(e)
  }, [reserveForm.start, reserveForm.durationHours])

  const selectedParking = useMemo(() => {
    const id = Number(reserveForm.parkingId)
    return parkings.find((p) => Number(p.id) === id) || null
  }, [parkings, reserveForm.parkingId])

  const estimate = useMemo(() => {
    if (!selectedParking) return 0
    return Number(reserveForm.durationHours || 0) * Number(selectedParking.price_per_hour || 0)
  }, [selectedParking, reserveForm.durationHours])

  const submitQuickReserve = async (e) => {
    e.preventDefault()
    setReserveOk('')
    setReserveError('')
    setLastReservationId(null)

    if (!reserveForm.parkingId) {
      setReserveError('پارکینگ را انتخاب کن.')
      return
    }
    if (!reserveForm.carPlate || reserveForm.carPlate.trim().length < 3) {
      setReserveError('پلاک خودرو را درست وارد کن.')
      return
    }
    if (!startIso || !endIso) {
      setReserveError('زمان شروع/پایان نامعتبر است.')
      return
    }

    setReserveLoading(true)
    try {
      const payload = {
        parking: Number(reserveForm.parkingId),
        car_plate: reserveForm.carPlate.trim(),
        start_time: startIso,
        end_time: endIso,
      }
      const { data } = await api.post('/api/reservations/', payload)
      setReserveOk(`رزرو با موفقیت ثبت شد. (کد رزرو: #${data?.id})`)
      setLastReservationId(data?.id || null)

      // refresh list (so user sees it immediately)
      await loadReservations()
    } catch {
      setReserveError('ثبت رزرو ناموفق بود. زمان/ظرفیت را بررسی کن.')
    } finally {
      setReserveLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h5 fw-bold m-0">پروفایل</h1>
              {!edit ? (
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEdit(true)}>ویرایش</button>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? '...' : 'ذخیره'}</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit} disabled={savingProfile}>انصراف</button>
                </div>
              )}
            </div>

            <div className="d-grid gap-2">
              <div>
                <div className="text-muted">نام کاربری</div>
                {!edit ? (
                  <div className="fw-semibold">{user?.username}</div>
                ) : (
                  <input className="form-control" value={profileForm.username} onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))} />
                )}
              </div>
              <div>
                <div className="text-muted">ایمیل</div>
                {!edit ? (
                  <div className="fw-semibold">{user?.email || '—'}</div>
                ) : (
                  <input className="form-control" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
                )}
              </div>
              <div>
                <div className="text-muted">موبایل</div>
                {!edit ? (
                  <div className="fw-semibold">{user?.phone || '—'}</div>
                ) : (
                  <input className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="مثال: 0912..." />
                )}
              </div>
              <div>
                <div className="text-muted">نقش</div>
                <div className="fw-semibold">{user?.role}</div>
              </div>
            </div>

            <hr />

            <div className="d-grid gap-2">
              <Link to="/parkings" className="btn btn-outline-primary">رزرو جدید (لیست پارکینگ‌ها)</Link>
              <Link to="/forgot" className="btn btn-outline-secondary">تغییر رمز (بازیابی)</Link>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Quick reserve */}
          <div className="card p-4 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h6 fw-bold m-0">رزرو سریع از داخل پروفایل</h2>
              <button className="btn btn-sm btn-outline-secondary" onClick={loadParkings}>بروزرسانی لیست پارکینگ‌ها</button>
            </div>

            {reserveOk && (
              <div className="alert alert-success d-flex flex-wrap gap-2 align-items-center">
                <div className="me-auto">{reserveOk}</div>
                {lastReservationId && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => goPay(lastReservationId)}>نهایی‌سازی پرداخت</button>
                    <Link className="btn btn-sm btn-outline-primary" to={`/invoice/${lastReservationId}`}>فاکتور</Link>
                  </>
                )}
              </div>
            )}
            {reserveError && <div className="alert alert-warning">{reserveError}</div>}

            <form onSubmit={submitQuickReserve} className="row g-2 align-items-end">
              <div className="col-md-5">
                <label className="form-label">پارکینگ</label>
                <select
                  className="form-select"
                  value={reserveForm.parkingId}
                  onChange={(e) => setReserveForm((p) => ({ ...p, parkingId: e.target.value }))}
                >
                  <option value="">انتخاب کنید...</option>
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.city}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">شروع</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={reserveForm.start}
                  onChange={(e) => setReserveForm((p) => ({ ...p, start: e.target.value }))}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">مدت (ساعت)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={reserveForm.durationHours}
                  onChange={(e) => setReserveForm((p) => ({ ...p, durationHours: e.target.value }))}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">پلاک</label>
                <input
                  className="form-control"
                  value={reserveForm.carPlate}
                  onChange={(e) => setReserveForm((p) => ({ ...p, carPlate: e.target.value }))}
                  placeholder="مثال: 12الف345"
                />
              </div>

              <div className="col-12 d-flex flex-wrap justify-content-between align-items-center mt-2">
                <div className="text-muted small">
                  {selectedParking ? (
                    <>
                      مبلغ تقریبی: <b>{estimate.toLocaleString()}</b> تومان
                      <span className="mx-2">|</span>
                      پایان: {fmt(endIso)}
                    </>
                  ) : (
                    'برای نمایش مبلغ تقریبی، پارکینگ را انتخاب کن.'
                  )}
                </div>
                <button className="btn btn-primary" type="submit" disabled={reserveLoading}>
                  {reserveLoading ? 'در حال ثبت...' : 'ثبت رزرو'}
                </button>
              </div>
            </form>
          </div>

          {/* Reservations list */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div>
              <h2 className="h5 fw-bold m-0">رزروهای من</h2>
              <div className="text-muted">کل: {summary.total} | تایید: {summary.confirmed} | در انتظار: {summary.pending}</div>
            </div>
            <div className="d-flex gap-2">
              <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 220 }}>
                <option value="">همه</option>
                <option value="pending">در انتظار پرداخت</option>
                <option value="confirmed">تایید شده</option>
                <option value="canceled">لغو شده</option>
                <option value="expired">منقضی</option>
              </select>
              <button className="btn btn-outline-primary" onClick={loadReservations} disabled={loading}>{loading ? '...' : 'بروزرسانی'}</button>
            </div>
          </div>

          {error && <div className="alert alert-warning">{error}</div>}
          {loading && <div className="card p-4 text-center">در حال دریافت...</div>}
          {!loading && !reservations.length && <div className="card p-4 text-center text-muted">رزروی وجود ندارد.</div>}

          {!loading && reservations.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table m-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>کد</th>
                      <th>پارکینگ</th>
                      <th>زمان</th>
                      <th>مبلغ</th>
                      <th>وضعیت</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td className="fw-semibold">{r.id}</td>
                        <td>
                          <div className="fw-semibold">{r.parking_name}</div>
                          <div className="text-muted small">{r.parking_city}</div>
                        </td>
                        <td>
                          <div className="small">{fmt(r.start_time)} تا {fmt(r.end_time)}</div>
                          <div className="text-muted small">ثبت: {fmt(r.created_at)}</div>
                        </td>
                        <td className="fw-semibold">{(r.amount || 0).toLocaleString()} تومان</td>
                        <td>
                          <span className={`badge ${r.status === 'confirmed' ? 'text-bg-success' : r.status === 'pending' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex flex-wrap gap-2 justify-content-end">
                            <Link className="btn btn-sm btn-outline-primary" to={`/invoice/${r.id}`}>فاکتور</Link>
                            {r.status === 'pending' && !r.is_paid && (
                              <button className="btn btn-sm btn-primary" onClick={() => goPay(r.id)}>نهایی‌سازی پرداخت</button>
                            )}
                            {r.status !== 'canceled' && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(r.id)}>لغو</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
