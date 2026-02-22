import axios from 'axios'
import { getAccessToken, getRefreshToken, setSession, clearSession } from '../utils/session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000'
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

api.interceptors.response.use(
  (r) => r,
  async (e) => {
    const status = e?.response?.status
    const original = e?.config

    // اگر توکن منقضی شد، یکبار refresh انجام بده و درخواست را تکرار کن
    if (status === 401 && !original?._retry) {
      const refresh = getRefreshToken()
      if (!refresh) {
        clearSession()
        window.dispatchEvent(new Event('session-expired'))
        return Promise.reject(e)
      }

      original._retry = true

      try {
        if (!refreshing) {
          refreshing = api.post('/api/auth/refresh/', { refresh })
            .then(({ data }) => {
              setSession({ access: data.access })
              return data.access
            })
            .finally(() => { refreshing = null })
        }

        const newAccess = await refreshing
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch {
        clearSession()
        window.dispatchEvent(new Event('session-expired'))
        return Promise.reject(e)
      }
    }

    return Promise.reject(e)
  }
)

export default api
