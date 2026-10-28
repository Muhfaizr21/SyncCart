import { authFetch } from './client'

export async function fetchSellerOverview() {
  const payload = await authFetch('/seller/overview')
  return payload.data
}

export async function updateSellerStoreSettings(settingsInput) {
  const payload = await authFetch('/stores/settings', {
    method: 'PATCH',
    body: JSON.stringify(settingsInput),
  })
  return payload.data
}

export async function rotateSellerStoreKeys(target = 'both') {
  const payload = await authFetch('/stores/rotate-keys', {
    method: 'POST',
    body: JSON.stringify({ target }),
  })
  return payload.data
}

export async function testSellerStoreWebhook() {
  const payload = await authFetch('/stores/test-webhook', {
    method: 'POST',
  })
  return payload.data
}
