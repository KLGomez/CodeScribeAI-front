import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('codescribe-auth')
    const token = stored ? JSON.parse(stored)?.state?.token : null
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // ignore parse errors
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('codescribe-auth')
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default api
