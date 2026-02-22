import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { getParkingImage } from '../utils/parkingImages'

export default function ParkingsPage() {
  const [params, setParams] = useSearchParams()
  const [parkings, setParkings] = useState([])
  const [q, setQ] = useState(params.get('q') || '')
  const [minCap, setMinCap] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/parkings/')
        setParkings(Array.isArray(data) ? data : [])
      } catch {
        setError('دریافت اطلاعات پارکینگ‌ها ناموفق بود.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    const cleaned = q.trim()
    if (cleaned) setParams({ q: cleaned })
    else setParams({})
  }, [q])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const min = minCap ? Number(minCap) : null
    const max = maxPrice ? Number(maxPrice) : null

    return parkings.filter((p) => {
      const hay = `${p.name || ''} ${p.city || ''} ${p.address || ''}`.toLowerCase()
      const okQ = !query || hay.includes(query)
      const okMin = min == null || (p.total_capacity || 0) >= min
      const okMax = max == null || (p.price_per_hour || 0) <= max
      return okQ && okMin && okMax
    })
  }, [parkings, q, minCap, maxPrice])

  return (
    <div className="container py-5">
      {/* ===== Header ===== */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-4">
        <div>
          <h1 className="h4 fw-bold m-0">پارکینگ‌های مشهد</h1>
          <div className="text-muted">
            مقایسه قیمت، ظرفیت، امکانات و رزرو آنلاین
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="input-group input-group-lg" style={{ minWidth: 260 }}>
            <span className="input-group-text">جستجو</span>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام یا آدرس"
            />
          </div>

          <div className="input-group input-group-lg" style={{ width: 200 }}>
            <span className="input-group-text">ظرفیت ≥</span>
            <input
              className="form-control"
              value={minCap}
              onChange={(e) => setMinCap(e.target.value)}
              type="number"
              min="0"
            />
          </div>

          <div className="input-group input-group-lg" style={{ width: 220 }}>
            <span className="input-group-text">قیمت ≤</span>
            <input
              className="form-control"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              min="0"
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-4">
        {loading && (
          <div className="col-12">
            <div className="card p-4 text-center">در حال دریافت اطلاعات…</div>
          </div>
        )}

        {!loading && !filtered.length && (
          <div className="col-12">
            <div className="card p-4 text-center text-muted">
              پارکینگی مطابق جستجو پیدا نشد.
            </div>
          </div>
        )}

        {filtered.map((p) => (
          <div key={p.id} className="col-md-6 col-lg-4">
            <div className="card h-100 overflow-hidden shadow-sm">

              {/* ===== Image ===== */}
              <div className="ratio ratio-4x3">
                <img
                  src={p.image_url || getParkingImage(p)}
                  alt={p.name}
                  className="card-img-top object-fit-cover"
                />
              </div>

              {/* ===== Body ===== */}
              <div className="card-body d-flex flex-column">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">{p.name}</h6>
                  <span className="badge bg-warning text-dark fw-semibold">
                    ★ {p.avg_rating ?? '—'}
                  </span>
                </div>

                {/* Address */}
                <div className="text-muted small mb-3" style={{ minHeight: 40 }}>
                  {p.address}
                </div>

                {/* Amenities */}
                {!!(p.amenities || []).length && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {(p.amenities || []).slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="badge rounded-pill text-bg-light border"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto" />

                {/* Footer */}
                <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold text-primary">
                      {(p.price_per_hour || 0).toLocaleString()} تومان
                    </div>
                    <div className="text-muted small">به‌ازای هر ساعت</div>
                  </div>

                  <div className="text-muted small">
                    ظرفیت: {p.total_capacity}
                  </div>

                  <Link
                    to={`/parkings/${p.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    رزرو
                  </Link>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
