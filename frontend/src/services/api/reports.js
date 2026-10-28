import { authFetch } from './client'

export async function fetchSellerReportSummary() {
  const payload = await authFetch('/reports/summary')
  return payload.data
}

