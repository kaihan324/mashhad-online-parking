import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  getStoredUser,
  setStoredUser,
  clearSession,
  setSession,
  getAccessToken,
} from '../utils/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [ready, setReady] = useState(false)

  const syncMe = async () => {
    try {
      const { data } = await api.get('/api/auth/me/')
      setUser(data)
      setStoredUser(data)
      return data
    } catch {
      setUser(null)
      setStoredUser(null)
      return null
    }
  }

  useEffect(() => {
    // اگر توکن داریم ولی user ذخیره نشده، یک بار me را بگیر.
    const bootstrap = async () => {
      try {
        const hasToken = Boolean(getAccessToken())
        if (hasToken && !user) {
          await syncMe()
        }
      } finally {
        setReady(true)
      }
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setStoredUser(null)
    }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/token/', { username, password })
    setSession({ access: data.access, refresh: data.refresh })
    const me = await syncMe()
    return me
  }

  const register = async (payload) => {
    await api.post('/api/auth/register/', payload)
    const me = await login(payload.username, payload.password)
    return me
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setStoredUser(null)
  }

  // Backward-compatible alias: some pages expect refreshMe()
  const value = useMemo(
    () => ({ user, ready, login, register, logout, syncMe, refreshMe: syncMe }),
    [user, ready]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
