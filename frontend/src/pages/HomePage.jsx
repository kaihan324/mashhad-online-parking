import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { getParkingImage } from '../utils/parkingImages'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [parkings, setParkings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  // نمایش ظرفیت آزاد در صفحه اصلی (بازه پیش‌فرض: الان تا ۲ ساعت بعد)
  const [freeById, setFreeById] = useState({})

  // ⬅️ برای همه لود می‌شود (نه فقط لاگین)
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/parkings/')
        setParkings(Array.isArray(data) ? data : [])
      } catch {
        setError('دریافت لیست پارکینگ‌ها با مشکل مواجه شد.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const stats = useMemo(() => {
    const totalCapacity = parkings.reduce((s, p) => s + (p.total_capacity || 0), 0)
    const avgRating =
      parkings.length > 0
        ? (
            parkings.reduce((s, p) => s + (p.avg_rating || 0), 0) /
            parkings.length
          ).toFixed(1)
        : '—'

    return {
      count: parkings.length,
      totalCapacity,
      avgRating,
    }
  }, [parkings])

  // پیشنهاد روز (رندوم پایدار)
  const suggestion = useMemo(() => {
    if (!parkings.length) return null
    const dayKey = new Date().toISOString().slice(0, 10)
    const sorted = [...parkings].sort(
      (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)
    )
    const top = sorted.slice(0, Math.min(10, sorted.length))
    const hash = [...dayKey].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) % 1000, 7)
    return top[hash % top.length]
  }, [parkings])

  const suggestionReason = useMemo(() => {
    if (!suggestion) return ''
    if ((suggestion.total_capacity || 0) > 800)
      return 'به دلیل ظرفیت بالا، احتمال پیدا کردن جای پارک بیشتر است.'
    if ((suggestion.price_per_hour || 0) <= 20000)
      return 'به دلیل قیمت اقتصادی، گزینه‌ای به‌صرفه محسوب می‌شود.'
    if (/حرم|امام رضا|شیرازی/.test(suggestion.address || ''))
      return 'به دلیل نزدیکی به حرم، انتخاب مناسبی برای ترددهای زیارتی است.'
    return 'به دلیل امتیاز کاربران و دسترسی مناسب، پیشنهاد امروز ماست.'
  }, [suggestion])

  const featured = useMemo(() => {
    return [...parkings]
      .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
      .slice(0, 3)
  }, [parkings])

  useEffect(() => {
    const run = async () => {
      if (!featured.length) {
        setFreeById({})
        return
      }

      const start = new Date()
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
      const startIso = start.toISOString()
      const endIso = end.toISOString()

      try {
        const results = await Promise.all(
          featured.map(async (p) => {
            try {
              const { data } = await api.get(
                `/api/parkings/${p.id}/availability/?start=${encodeURIComponent(
                  startIso
                )}&end=${encodeURIComponent(endIso)}`
              )
              return [p.id, data?.free_capacity]
            } catch {
              return [p.id, null]
            }
          })
        )
        const map = {}
        for (const [id, free] of results) map[id] = free
        setFreeById(map)
      } catch {
        // در صورت خطا، فقط نمایش آزاد را خالی می‌کنیم
        setFreeById({})
      }
    }
    run()
  }, [featured])

  const goSearch = () => {
    const q = query.trim()
    navigate(q ? `/parkings?q=${encodeURIComponent(q)}` : '/parkings')
  }

  return (
    <div className="container py-5">
      {/* ================= HERO ================= */}
      <div className="hero p-4 p-md-5 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="badge-soft rounded-pill px-3 py-2 mb-3 d-inline-block">
              مشهد · رزرو آنلاین پارکینگ
            </span>

            <h1 className="display-6 fw-bold mb-3">
              جای پارک را قبل از رسیدن رزرو کن
            </h1>

            <p className="lead text-muted mb-2">
              لیست پارکینگ‌های منتخب مشهد، بررسی ظرفیت و رزرو آنلاین با فاکتور.
            </p>

            <div className="text-muted small mb-4">
              بدون تماس تلفنی • اطلاعات شفاف • مناسب ساعات شلوغ شهری
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    ثبت‌نام و شروع
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg">
                    ورود
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/parkings" className="btn btn-primary btn-lg">
                    مشاهده پارکینگ‌ها
                  </Link>
                  <Link to="/profile" className="btn btn-outline-primary btn-lg">
                    رزروهای من
                  </Link>
                </>
              )}
            </div>

            <div className="input-group input-group-lg">
              <span className="input-group-text">جستجو</span>
              <input
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثلاً: امام رضا، احمدآباد، وکیل‌آباد"
                onKeyDown={(e) => e.key === 'Enter' && goSearch()}
              />
              <button className="btn btn-primary" onClick={goSearch}>
                نمایش
              </button>
            </div>
            <div className="text-muted small mt-2">
              پیشنهاد: «حرم»، «۱۷ شهریور»، «پارک ملت»
            </div>
          </div>

          {/* کارت پیشنهاد */}
          <div className="col-lg-5">
            <div className="card p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted">برای یک انتخاب مطمئن</div>
                  <div className="fw-bold">اطلاعات واقعی‌نما + امتیاز کاربران</div>
                </div>
                <span className="badge text-bg-success rounded-pill">
                  Trusted
                </span>
              </div>
              <hr />
              <div className="row g-3">
                <div className="col-6">
                  <div className="card p-3">
                    <div className="text-muted">شهر</div>
                    <div className="fw-bold">مشهد</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card p-3">
                    <div className="text-muted">پرداخت</div>
                    <div className="fw-bold">آنلاین</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted">پیشنهاد امروز</div>
                        <div className="fw-bold">
                          {suggestion ? suggestion.name : '—'}
                        </div>
                      </div>
                      <span className="rating-badge">
                        {suggestion?.avg_rating
                          ? `★ ${suggestion.avg_rating}`
                          : '★ —'}
                      </span>
                    </div>
                    <div className="text-muted small mt-2">
                      {suggestionReason || 'بر اساس امتیاز کاربران'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= آمار ================= */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-4">
            <div className="text-muted">تعداد پارکینگ‌ها</div>
            <div className="fs-3 fw-bold">{loading ? '...' : stats.count}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4">
            <div className="text-muted">ظرفیت کل</div>
            <div className="fs-3 fw-bold">
              {loading ? '...' : stats.totalCapacity}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4">
            <div className="text-muted">میانگین امتیاز کاربران</div>
            <div className="fs-3 fw-bold">{stats.avgRating}</div>
          </div>
        </div>
      </div>

      {/* ================= منتخب‌ها ================= */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h5 fw-bold m-0">منتخب‌های مشهد</h2>
          <Link to="/parkings" className="fw-semibold text-primary">
            همه پارکینگ‌ها
          </Link>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {featured.map((p) => (
                <div key={p.id} className="col-md-4">
                  <div className="card h-100 overflow-hidden">
                    <div className="ratio ratio-4x3">
                      <img
                        src={p.image_url || getParkingImage(p)}
                        alt={p.name}
                        className="card-img-top object-fit-cover"
                      />
                    </div>

                    <div className="card-body">
                      <h6 className="card-title mb-1">{p.name}</h6>
                      <p className="card-text text-muted small mb-3">
                        {p.address}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge text-bg-light border">
                          ظرفیت کل: {p.total_capacity ?? '—'}
                        </span>
                        <span className="badge text-bg-light border">
                          ظرفیت آزاد (۲ ساعت):
                          {' '}
                          {freeById[p.id] === 0 || freeById[p.id]
                            ? freeById[p.id]
                            : '—'}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <span className="rating-badge">
                          {p.avg_rating ? `★ ${p.avg_rating}` : '★ —'}
                        </span>

                        <Link
                          to={`/parkings/${p.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          جزئیات و رزرو
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!featured.length && (
              <div className="card p-5 text-center text-muted">
                <div className="fs-4 mb-2">🚗</div>
                <div>پارکینگی برای نمایش وجود ندارد.</div>
                <div className="small mt-2">اولین پارکینگ را ثبت کنید!</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}