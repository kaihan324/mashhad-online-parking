import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="container py-5">
        <div className="card p-4 text-center">در حال بارگذاری...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  // supports both <ProtectedRoute><Page/></ProtectedRoute> and nested routing
  return children ? children : <Outlet />
}
