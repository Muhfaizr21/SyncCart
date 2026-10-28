import { getStoredToken } from './authApi'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function authFetch(path, options = {}) {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.error || payload?.message || 'Gagal berkomunikasi dengan server Go')
  }
  return payload
}

