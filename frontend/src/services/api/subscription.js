import { authFetch } from './client'

export async function fetchSubscriptionInvoices() {
  const payload = await authFetch('/subscription/invoices')
  return payload.data
}

export async function checkoutSellerSubscription(checkoutInput) {
  const payload = await authFetch('/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutInput),
  })
  return payload.data
}

