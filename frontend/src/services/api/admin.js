import { authFetch } from './client'

export async function fetchAdminOverview() {
  const res = await authFetch('/admin/overview')
  return res.data
}

export async function createAdminSeller(payload) {
  const res = await authFetch('/admin/sellers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateAdminSellerProfile(storeId, payload) {
  const res = await authFetch(`/admin/sellers/${storeId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function syncAdminSellerCatalog(storeId) {
  const res = await authFetch(`/admin/sellers/${storeId}/sync`, {
    method: 'POST',
  })
  return res.data
}

export async function updateAdminSellerStatus(storeId, status) {
  const res = await authFetch(`/admin/sellers/${storeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return res.data
}

export async function updateAdminSellerPlan(storeId, { plan, billingCycle }) {
  const res = await authFetch(`/admin/sellers/${storeId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({
      plan,
      billing_cycle: billingCycle,
    }),
  })
  return res.data
}

export async function deleteAdminSeller(storeId) {
  const res = await authFetch(`/admin/sellers/${storeId}`, {
    method: 'DELETE',
  })
  return res
}

export async function executeAdminBulkAction({ targetType, ids, action }) {
  const res = await authFetch('/admin/bulk-action', {
    method: 'POST',
    body: JSON.stringify({
      target_type: targetType,
      ids,
      action,
    }),
  })
  return res.data
}

export async function updateAdminUserRole(userId, role) {
  const res = await authFetch(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return res.data
}

export async function createAdminCoupon(payload) {
  const res = await authFetch('/admin/subscriptions/coupon', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function deleteAdminCoupon(couponId) {
  const res = await authFetch(`/admin/subscriptions/coupon/${couponId}`, {
    method: 'DELETE',
  })
  return res
}

export async function updateAdminSettings(payload) {
  const res = await authFetch('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data
}

