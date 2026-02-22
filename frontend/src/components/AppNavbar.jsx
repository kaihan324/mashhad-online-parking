import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NavItem = ({ to, children, end }) => (
  <li className="nav-item">
    <NavLink end={end} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{children}</NavLink>
  </li>
)

export default function AppNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold" to="/">پارکینگ آنلاین</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <NavItem to="/" end>خانه</NavItem>
            <NavItem to="/parkings">پارکینگ‌ها</NavItem>
            {user && <NavItem to="/profile">پروفایل</NavItem>}
            {user && <NavItem to="/notifications">اعلان‌ها</NavItem>}
            <NavItem to="/contact">تماس با ما</NavItem>
            <NavItem to="/support">پشتیبانی</NavItem>
            {user?.role === 'admin' && <NavItem to="/admin">ادمین</NavItem>}
            {user?.role === 'parking_manager' && <NavItem to="/manager">مدیریت پارکینگ</NavItem>}
          </ul>
          <div className="d-flex gap-2">
            {!user && (
              <>
                <Link className="btn btn-outline-primary" to="/login">ورود</Link>
                <Link className="btn btn-primary" to="/register">ثبت‌نام</Link>
              </>
            )}
            {user && (
              <>
                <span className="d-none d-lg-inline text-muted align-self-center">{user.username}</span>
                <button className="btn btn-outline-danger" onClick={doLogout}>خروج</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
