import { authFetch } from './client'

export async function inviteSellerTeamMember(memberInput) {
  const payload = await authFetch('/team/invite', {
    method: 'POST',
    body: JSON.stringify(memberInput),
  })
  return payload.data
}

export async function updateSellerTeamPermissions(memberId, permissionsOrPayload, role) {
  const bodyObj =
    typeof permissionsOrPayload === 'object' && permissionsOrPayload !== null
      ? permissionsOrPayload
      : { permissions: permissionsOrPayload, role }
  const payload = await authFetch(`/team/${memberId}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify(bodyObj),
  })
  return payload.data
}

export async function executeSellerTeamSessionAction(memberId, action) {
  const payload = await authFetch(`/team/${memberId}/session-action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
  return payload.data
}

export async function transferSellerStoreOwnership(targetMemberId) {
  const payload = await authFetch('/team/transfer-ownership', {
    method: 'POST',
    body: JSON.stringify({ target_member_id: Number(targetMemberId) }),
  })
  return payload.data
}

export async function deleteSellerTeamMember(memberId) {
  const payload = await authFetch(`/team/${memberId}`, {
    method: 'DELETE',
  })
  return payload.data
}

