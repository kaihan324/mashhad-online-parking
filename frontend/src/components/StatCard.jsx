import React from 'react'

export default function StatCard({ title, value, hint }) {
  return (
    <div className="card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="text-muted mb-1">{title}</div>
          <div className="fs-3 fw-bold">{value}</div>
          {hint && <div className="text-muted mt-1">{hint}</div>}
        </div>
        <span className="badge badge-soft">گزارش</span>
      </div>
    </div>
  )
}
