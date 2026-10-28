const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const TOKEN_STORAGE_KEY = 'synccart_auth_token'
const USER_STORAGE_KEY = 'synccart_auth_user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAuthSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

async function requestJSON(path, options = {}) {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error(
      'Tidak dapat terhubung ke server Go API (http://localhost:8080). Pastikan server backend sedang berjalan.'
    )
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Terjadi kesalahan saat memproses permintaan ke server.')
  }

  return payload.data
}

export async function loginUser({ email, password }) {
  const data = await requestJSON('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveAuthSession(data.token, data.user)
  return data
}

export async function registerUser({ fullName, email, password, storeName, channels }) {
  const data = await requestJSON('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      store_name: storeName,
      channels,
    }),
  })
  saveAuthSession(data.token, data.user)
  return data
}

export async function fetchCurrentUser() {
  return requestJSON('/auth/me', { method: 'GET' })
}

export async function fetchAdminUsers() {
  return requestJSON('/admin/users', { method: 'GET' })
}

export async function logoutUser() {
  try {
    await requestJSON('/auth/logout', { method: 'POST' })
  } catch {
    // Local session still cleared if backend is unreachable during logout.
  } finally {
    clearAuthSession()
  }
}

