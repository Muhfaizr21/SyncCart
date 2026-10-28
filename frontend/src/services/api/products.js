import { authFetch } from './client'

export async function createSellerProduct(productInput) {
  const payload = await authFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productInput),
  })
  return payload.data
}

export async function updateSellerProduct(productId, updateInput) {
  const payload = await authFetch(`/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateInput),
  })
  return payload.data
}

export async function duplicateSellerProduct(productId) {
  const payload = await authFetch(`/products/${productId}/duplicate`, {
    method: 'POST',
  })
  return payload.data
}

export async function bulkSellerProductAction(bulkInput) {
  const payload = await authFetch('/products/bulk-action', {
    method: 'POST',
    body: JSON.stringify(bulkInput),
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

