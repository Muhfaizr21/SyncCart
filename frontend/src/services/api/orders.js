import { authFetch } from './client'

export async function createSellerOrder(orderInput) {
  const payload = await authFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderInput),
  })
  return payload.data
}

export async function updateSellerOrderShipping(orderId, shippingPayload) {
  const payload = await authFetch(`/orders/${orderId}/ship`, {
    method: 'POST',
    body: JSON.stringify(shippingPayload),
  })
  return payload.data
}

export async function bulkSellerOrderAction(bulkInput) {
  const payload = await authFetch('/orders/bulk-action', {
    method: 'POST',
    body: JSON.stringify(bulkInput),
  })
  return payload.data
}

export async function deleteSellerOrder(orderId) {
  const payload = await authFetch(`/orders/${orderId}`, {
    method: 'DELETE',
  })
  return payload.data
}

