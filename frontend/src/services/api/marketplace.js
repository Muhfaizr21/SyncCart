import { authFetch } from './client'

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

