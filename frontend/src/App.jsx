import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import AppNavbar from './components/AppNavbar'
import Footer from './components/Footer'


import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ParkingsPage from './pages/ParkingsPage'
import ParkingDetailPage from './pages/ParkingDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import ContactPage from './pages/ContactPage'
import SupportPage from './pages/SupportPage'
import InvoicePage from './pages/InvoicePage'
import PaymentPage from './pages/PaymentPage'

import ProtectedRoute from './components/ProtectedRoute'




export default function App() {
  return (
    <>
      <AppNavbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />

        {/* Public browsing */}
        <Route path="/parkings" element={<ParkingsPage />} />
        <Route path="/parkings/:id" element={<ParkingDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Auth-only */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/invoice/:reservationId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
        <Route path="/payment/:reservationId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

        {/* Role panels */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute roles={['parking_manager']}><ManagerDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer/>
    </>
  )
}
