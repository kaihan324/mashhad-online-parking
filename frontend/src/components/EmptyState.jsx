import React from 'react'

export default function EmptyState({ title, subtitle }) {
  return (
    <div className="card p-5 text-center">
      <div className="fw-bold fs-5">{title}</div>
      {subtitle && <div className="text-muted mt-2">{subtitle}</div>}
    </div>
  )
}
