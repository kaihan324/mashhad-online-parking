import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import PARKING_DESCRIPTIONS from '../data/parkingDescriptions.json'
import { getParkingImage } from '../utils/parkingImages'

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

export default function ParkingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()

  const [parking, setParking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [start, setStart] = useState(nowPlus(1))
  const [durationHours, setDurationHours] = useState(2)
  const [carPlate, setCarPlate] = useState('')

  const [availability, setAvailability] = useState(null)
  const [availabilityError, setAvailabilityError] = useState('')

  const [reservation, setReservation] = useState(null)
  const [reserveLoading, setReserveLoading] = useState(false)
  const [reserveError, setReserveError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const description = PARKING_DESCRIPTIONS[id]

  const endIso = useMemo(() => {
    const s = new Date(start)
    const e = new Date(s.getTime() + durationHours * 3600000)
    return toIsoSeconds(e)
  }, [start, durationHours])

  const startIso = useMemo(() => toIsoSeconds(start), [start])

  const estimate = useMemo(() => {
    if (!parking) return 0
    return durationHours * (parking.price_per_hour || 0)
  }, [durationHours, parking])

  const avgRating = useMemo(() => {
    if (!reviews.length) return null
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  const loadParking = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/api/parkings/${id}/`)
      setParking(data)
    } catch {
      setError('پارکینگ یافت نشد')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/api/parkings/${id}/reviews/`)
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      // keep silent
    }
  }

  const loadAvailability = async () => {
    if (!startIso || !endIso) return
    setAvailabilityError('')
    try {
      const { data } = await api.get(`/api/parkings/${id}/availability/`, { params: { start: startIso, end: endIso } })
      setAvailability(data)
    } catch {
      setAvailability(null)
      setAvailabilityError('دریافت ظرفیت آزاد ناموفق بود.')
    }
  }

  useEffect(() => { loadParking(); loadReviews() }, [id])
  useEffect(() => { loadAvailability() }, [id, startIso, endIso])

  const createReservation = async (e) => {
    e.preventDefault()
    if (!user) {
      setReserveError('برای رزرو، ابتدا وارد حساب کاربری شوید.')
      return
    }
    setReserveLoading(true)
    setReserveError('')
    try {
      const payload = {
        parking: Number(id),
        car_plate: carPlate,
        start_time: startIso,
        end_time: endIso,
      }
      const { data } = await api.post('/api/reservations/', payload)
      setReservation(data)
      await loadAvailability()
    } catch {
      setReserveError('رزرو ناموفق بود')
    } finally {
      setReserveLoading(false)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) return
    setReviewSaving(true)
    setReviewError('')
    try {
      await api.post(`/api/parkings/${id}/reviews/`, {
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      })
      setReviewForm({ rating: 5, title: '', comment: '' })
      await loadReviews()
    } catch {
      setReviewError('ثبت نظر ناموفق بود.')
    } finally {
      setReviewSaving(false)
    }
  }

  if (loading) return <div className="container py-5 text-center">در حال بارگذاری...</div>

  if (error || !parking) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">{error}</div>
        <Link to="/parkings" className="btn btn-primary">بازگشت</Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="h4 fw-bold mb-1">{parking.name}</h1>
      <p className="text-muted mb-2">{parking.address}</p>

      <div className="card overflow-hidden mb-3">
        <div className="ratio ratio-21x9">
          <img
            src={parking.image_url || getParkingImage(parking)}
            alt={parking.name}
            className="object-fit-cover"
          />
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge text-bg-light border">ظرفیت کل: {parking.total_capacity}</span>
        <span className="badge text-bg-light border">قیمت/ساعت: {(parking.price_per_hour || 0).toLocaleString()} تومان</span>
        {availability && (
          <span className={`badge ${availability.free_capacity > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>
            ظرفیت آزاد در بازه انتخابی: {availability.free_capacity}
          </span>
        )}
        {availabilityError && <span className="badge text-bg-warning">{availabilityError}</span>}
      </div>

      {/* معرفی */}
      <div className="card p-4 mb-4">
        <p className="mb-2">
          {description?.intro || 'این پارکینگ در یکی از محدوده‌های پرتردد شهر مشهد قرار دارد و دسترسی مناسبی به معابر اطراف دارد.'}
        </p>
        <p className="mb-3">
          {description?.details || 'مدیریت منظم، ظرفیت مناسب و امکان رزرو آنلاین باعث شده استفاده از این پارکینگ ساده و قابل اعتماد باشد.'}
        </p>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark fs-6">★ {avgRating ?? (parking.avg_rating ?? '—')} از 5</span>
          <span className="text-muted">( {reviews.length} نظر )</span>
        </div>
      </div>

      <div className="row g-4">
        {/* رزرو */}
        <div className="col-lg-6">
          <div className="card p-4">
            <h5 className="fw-bold mb-3">رزرو جای پارک</h5>

            {reserveError && <div className="alert alert-danger">{reserveError}</div>}

            {!reservation ? (
              <>
                {!user && (
                  <div className="alert alert-secondary">برای رزرو، ابتدا وارد حساب کاربری شوید.</div>
                )}
                <form onSubmit={createReservation} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">شروع</label>
                  <input type="datetime-local" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">مدت زمان</label>
                  <select className="form-select" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))}>
                    {[1, 2, 3, 4, 6, 8].map((h) => (
                      <option key={h} value={h}>{h} ساعت</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">پلاک خودرو</label>
                  <input className="form-control" value={carPlate} onChange={(e) => setCarPlate(e.target.value)} required />
                </div>

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <div>مبلغ: <b>{estimate.toLocaleString()} تومان</b></div>
                  <button className="btn btn-primary" disabled={!user || reserveLoading || (availability && availability.free_capacity <= 0)}>
                    {reserveLoading ? '...' : 'ثبت رزرو'}
                  </button>
                </div>
                {availability && availability.free_capacity <= 0 && (
                  <div className="col-12"><div className="alert alert-warning mb-0">در این بازه ظرفیت آزاد وجود ندارد.</div></div>
                )}
              </form>
              </>
            ) : (
              <>
                <div className="alert alert-success">
                  رزرو با موفقیت ثبت شد. برای کامل شدن فرآیند، پرداخت را نهایی کن.
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={() => nav(`/payment/${reservation.id}`)}>نهایی‌سازی پرداخت</button>
                  <button className="btn btn-outline-primary" onClick={() => nav('/profile')}>رزروهای من</button>
                  <button className="btn btn-outline-secondary" onClick={() => setReservation(null)}>رزرو جدید</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* نظرات */}
        <div className="col-lg-6">
          <div className="card p-4">
            <h5 className="fw-bold mb-3">نظرات کاربران</h5>

            {reviews.map((r) => (
              <div key={r.id} className="border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <b>{r.user_display || r.user}</b>
                  <span className="badge bg-warning text-dark">★ {r.rating} از 5</span>
                </div>
                {r.title && <div className="fw-semibold mt-1">{r.title}</div>}
                <div className="text-muted small mt-1">{r.comment}</div>
                {r.admin_reply && (
                  <div className="bg-light border rounded p-2 mt-2 small">
                    <b>پاسخ مدیریت:</b> {r.admin_reply}
                  </div>
                )}
              </div>
            ))}

            {!reviews.length && <div className="text-muted">نظری ثبت نشده است.</div>}

            <hr className="my-4" />

            {!user && (
              <div className="alert alert-secondary mb-0">برای ثبت نظر، ابتدا وارد حساب کاربری شوید.</div>
            )}

            {user && (
              <form onSubmit={submitReview} className="row g-2">
                {reviewError && <div className="col-12"><div className="alert alert-danger mb-0">{reviewError}</div></div>}
                <div className="col-md-4">
                  <label className="form-label">امتیاز</label>
                  <select className="form-select" value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))}>
                    {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label">عنوان (اختیاری)</label>
                  <input className="form-control" value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label">نظر</label>
                  <textarea className="form-control" rows="3" value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} required />
                </div>
                <div className="col-12 d-grid">
                  <button className="btn btn-primary" disabled={reviewSaving}>{reviewSaving ? '...' : 'ثبت نظر'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
