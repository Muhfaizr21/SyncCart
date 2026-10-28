import React, { useState } from 'react'

const PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    priceLabel: 'Rp 0 / 14 hari',
    marketplaces: '1 Marketplace',
    skuLimit: '50 SKU Produk',
    staffLimit: '1 Akun Owner',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: 'Rp 99.000 / bln',
    marketplaces: '2 Marketplace',
    skuLimit: '500 SKU Produk',
    staffLimit: '2 Akun Staf',
  },
  {
    id: 'business',
    name: 'Business',
    priceLabel: 'Rp 299.000 / bln',
    marketplaces: '3 Marketplace (Shopee, Tokopedia, TikTok)',
    skuLimit: '5.000 SKU Produk',
    staffLimit: '10 Akun Staf RBAC',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Rp 799.000 / bln',
    marketplaces: 'Unlimited Toko & Cabang',
    skuLimit: 'Unlimited SKU Produk',
    staffLimit: 'Unlimited Staf & Multi-Gudang',
  },
]

const INVOICES = [
  { id: 'INV-SUB-202610', date: '01 Okt 2026', plan: 'Business', amount: 299000, status: 'Paid' },
  { id: 'INV-SUB-202609', date: '01 Sep 2026', plan: 'Business', amount: 299000, status: 'Paid' },
  { id: 'INV-SUB-202608', date: '01 Agu 2026', plan: 'Starter', amount: 99000, status: 'Paid' },
]

export function SellerSubscriptionPage({ store, onUpdateSettings }) {
  const [savingPlan, setSavingPlan] = useState('')
  const [feedback, setFeedback] = useState('')

  const currentPlan = (store?.plan || 'business').toLowerCase()

  async function handleSelectPlan(planId) {
    setSavingPlan(planId)
    setFeedback('')
    try {
      await onUpdateSettings({ plan: planId })
      setFeedback(`Paket toko berhasil diperbarui ke ${planId.toUpperCase()} di PostgreSQL.`)
    } finally {
      setSavingPlan('')
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs">
        <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
          Phase 9 • Langganan, Kuota Toko, & Riwayat Invoice
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
          Paket Langganan SyncCart & Tagihan Bulanan
        </h1>
        <p className="text-xs sm:text-sm text-[#52524E]">
          Paket aktif saat ini:{' '}
          <strong className="text-[#9A3408] uppercase">{currentPlan}</strong> untuk toko{' '}
          <strong className="text-[#141413]">{store?.store_name}</strong>.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#E6F6EC] border border-[#A3E2B8] text-xs font-bold text-[#0F5132]">
          {feedback}
        </div>
      )}

      {/* 4 Plan Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl flex flex-col justify-between space-y-5 border ${
                isCurrent
                  ? 'bg-[#FFF6F0] border-2 border-[#F6671E] shadow-sm'
                  : 'bg-[#FFFFFF] border-[#EBE8E0]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#141413]">{plan.name}</h2>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F6671E] text-[#141413] text-[10px] font-extrabold uppercase">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="font-mono-tabular text-lg font-extrabold text-[#9A3408]">
                  {plan.priceLabel}
                </p>

                <ul className="space-y-1.5 pt-2 text-xs text-[#52524E]">
                  <li>• {plan.marketplaces}</li>
                  <li>• {plan.skuLimit}</li>
                  <li>• {plan.staffLimit}</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isCurrent || savingPlan === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full min-h-[40px] py-2 px-3 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-[#EBE8E0] text-[#52524E] cursor-default'
                    : 'bg-[#F6671E] hover:brightness-95 text-[#141413]'
                }`}
              >
                {isCurrent
                  ? 'Paket Saat Ini'
                  : savingPlan === plan.id
                    ? 'Memproses...'
                    : `Pilih ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Invoice History */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-4">
        <h2 className="text-base font-extrabold text-[#141413]">Riwayat Tagihan (Invoices)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EBE8E0] text-[#52524E]">
                <th className="py-3 px-2">No. Invoice</th>
                <th className="py-3 px-2">Tanggal Tagihan</th>
                <th className="py-3 px-2">Paket</th>
                <th className="py-3 px-2">Nominal</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E0]">
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-2 font-mono-tabular font-bold text-[#141413]">{inv.id}</td>
                  <td className="py-3 px-2 text-[#52524E]">{inv.date}</td>
                  <td className="py-3 px-2 font-bold text-[#141413]">{inv.plan}</td>
                  <td className="py-3 px-2 font-mono-tabular font-bold text-[#141413]">
                    Rp {inv.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] font-bold">
                      {inv.status}
                    </span>
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
