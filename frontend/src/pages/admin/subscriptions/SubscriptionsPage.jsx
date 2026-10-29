import React from 'react'

function formatRupiah(amount) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function SubscriptionsPage({
  coupons = [],
  invoices = [],
  storeNameById = {},
  onDeleteCoupon,
  onOpenCreateCoupon,
  renderStatusCell,
}) {
  return (
    <div className="space-y-8">
      {/* Promo Coupons Card */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#14181F]">
            Active SaaS Promo Coupons ({coupons.length})
          </h2>
          {onOpenCreateCoupon && (
            <button
              type="button"
              onClick={onOpenCreateCoupon}
              className="rounded-lg bg-[#14181F] px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-[#252C38] transition"
            >
              + Buat Kupon Promo
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {coupons.map((cp) => (
            <div
              key={cp.id}
              className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFBFD] p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#14181F] px-2.5 py-1 font-mono text-[12px] font-bold text-white">
                    {cp.code}
                  </span>
                  <span className="font-mono text-[13px] font-bold text-[#3F6E58]">
                    -{cp.discount_percent}% OFF
                  </span>
                </div>
                <p className="mt-2.5 text-[12px] text-[#525A68]">{cp.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#ECEEF2] pt-2.5 text-[11px] text-[#8C94A4]">
                <span>
                  Dipakai: {cp.used_count}/{cp.max_uses} • Exp: {cp.expires_at}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteCoupon(cp.id)}
                  className="font-semibold text-[#D64545] hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Subscription Invoices Table */}
      <div>
        <h2 className="mb-3 text-[14px] font-bold text-[#14181F]">
          All Store Subscription Invoices ({invoices.length})
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[#ECEEF2] bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ECEEF2] bg-[#FAFBFD] text-[11.5px] font-medium text-[#8C94A4]">
                <th className="py-3 pl-4 pr-3">Invoice #</th>
                <th className="py-3 px-3">Store</th>
                <th className="py-3 px-3">Plan & Cycle</th>
                <th className="py-3 px-3">Gateway</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total (Incl. Tax)</th>
                <th className="py-3 pl-3 pr-4">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAFBFD]">
                  <td className="py-3.5 pl-4 pr-3 font-mono text-[12px] font-semibold text-[#14181F]">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[#14181F]">
                    {storeNameById[inv.store_id] || `Store #${inv.store_id}`}
                  </td>
                  <td className="py-3.5 px-3 capitalize text-[#374151]">
                    {inv.plan_name} ({inv.billing_cycle})
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-[#525A68]">
                    {inv.payment_gateway}
                  </td>
                  <td className="py-3.5 px-3">{renderStatusCell(inv.status)}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#14181F]">
                    {formatRupiah(inv.total_amount)}
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-[12px] text-[#8C94A4]">
                    {inv.period_start} - {inv.period_end}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

