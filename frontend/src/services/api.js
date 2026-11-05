import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('packora_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, try one silent refresh then retry the original request
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthCall = original.url?.includes('/auth/')
    if (error.response?.status !== 401 || isAuthCall || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true
    try {
      refreshing = refreshing || refreshTokens()
      await refreshing
      const token = localStorage.getItem('packora_access')
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch (refreshError) {
      clearSession()
      return Promise.reject(refreshError)
    } finally {
      refreshing = null
    }
  },
)

export function saveTokens(access, refresh) {
  localStorage.setItem('packora_access', access)
  localStorage.setItem('packora_refresh', refresh)
}

export function clearSession() {
  localStorage.removeItem('packora_access')
  localStorage.removeItem('packora_refresh')
  localStorage.removeItem('packora_user')
}

async function refreshTokens() {
  const refresh = localStorage.getItem('packora_refresh')
  if (!refresh) throw new Error('No refresh token')
  const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh })
  saveTokens(data.access, data.refresh || refresh)
}
