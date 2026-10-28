import { getStoredToken } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function authFetch(path, options = {}) {
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

export async function fetchSellerOverview() {
  const payload = await authFetch('/seller/overview')
  return payload.data
}

export async function createSellerProduct(productInput) {
  const payload = await authFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productInput),
  })
  return payload.data
}

export async function updateSellerProductStock(productId, delta, price = null) {
  const body = { delta }
  if (price !== null) body.price = price
  const payload = await authFetch(`/products/${productId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return payload.data
}

export async function syncAllSellerProducts() {
  const payload = await authFetch('/products/sync-stock', {
    method: 'POST',
  })
  return payload.data
}

export async function deleteSellerProduct(productId) {
  const payload = await authFetch(`/products/${productId}`, {
    method: 'DELETE',
  })
  return payload.data
}

export async function updateSellerOrderShipping(orderId, { courier, tracking_resi, status }) {
  const payload = await authFetch(`/orders/${orderId}/ship`, {
    method: 'POST',
    body: JSON.stringify({ courier, tracking_resi, status }),
  })
  return payload.data
}

// Marketplace Integration (Phase 4 FITUR.MD)
export async function triggerMarketplaceAction(marketplaceId, action = 'sync') {
  const payload = await authFetch(`/marketplace/${marketplaceId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
  return payload.data
}

export async function connectSellerMarketplace(marketplaceId, oauthInput) {
  const payload = await authFetch(`/marketplace/${marketplaceId}/connect`, {
    method: 'POST',
    body: JSON.stringify(oauthInput),
  })
  return payload.data
}

export async function disconnectSellerMarketplace(marketplaceId) {
  const payload = await authFetch(`/marketplace/${marketplaceId}/disconnect`, {
    method: 'POST',
  })
  return payload.data
}

export async function syncSingleSellerMarketplace(marketplaceId) {
  const payload = await authFetch(`/marketplace/${marketplaceId}/sync`, {
    method: 'POST',
  })
  return payload.data
}

export async function updateSellerMarketplaceSettings(marketplaceId, settingsInput) {
  const payload = await authFetch(`/marketplace/${marketplaceId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(settingsInput),
  })
  return payload.data
}

export async function simulateSellerMarketplaceWebhook(webhookInput) {
  const payload = await authFetch('/marketplace/webhooks/simulate', {
    method: 'POST',
    body: JSON.stringify(webhookInput),
  })
  return payload.data
}

// Team & RBAC Management (Phase 8 FITUR.MD)
export async function inviteSellerTeamMember(memberInput) {
  const payload = await authFetch('/team/invite', {
    method: 'POST',
    body: JSON.stringify(memberInput),
  })
  return payload.data
}

export async function updateSellerTeamPermissions(memberId, permissions, role) {
  const payload = await authFetch(`/team/${memberId}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ permissions, role }),
  })
  return payload.data
}

export async function deleteSellerTeamMember(memberId) {
  const payload = await authFetch(`/team/${memberId}`, {
    method: 'DELETE',
  })
  return payload.data
}

export async function updateSellerStoreSettings(settingsInput) {
  const payload = await authFetch('/stores/settings', {
    method: 'PATCH',
    body: JSON.stringify(settingsInput),
  })
  return payload.data
}
