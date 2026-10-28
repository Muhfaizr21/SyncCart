import React, { useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

export function SellerReportsPage({ overview }) {
  const [reportTab, setReportTab] = useState('finance')
  const [exportStatus, setExportStatus] = useState('')

  const marketplaces = overview?.marketplaces || []
  const products = overview?.products || []

  const grossRevenue =
    marketplaces.reduce((sum, m) => sum + (m.revenue_this_month || 0), 0) || 53500000
  const platformFees = Math.round(grossRevenue * 0.065)
  const operationalCost = Math.round(grossRevenue * 0.42)
  const netProfit = grossRevenue - platformFees - operationalCost
  const marginPct = ((netProfit / grossRevenue) * 100).toFixed(1)

  function handleExportCSV() {
    const rows = [
      ['Channel', 'Order Bulan Ini', 'Omzet Kotor (Rp)', 'Rating'],
      ...marketplaces.map((m) => [
        m.platform,
        m.orders_this_month,
        m.revenue_this_month,
        m.rating,
      ]),
    ]
    const csvContent = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'laporan-keuangan-synccart.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setExportStatus('Laporan CSV berhasil diunduh ke perangkat Anda.')
  }

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
            Phase 7 • Laporan Penjualan, Produk, & Laba Bersih
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
            Rekapitulasi Keuangan & Performa Omnichannel
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E]">
            Kalkulasi laba bersih otomatis setelah dipotong komisi marketplace dan HPP produk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
          >
            Unduh Laporan (CSV / Excel)
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className="p-3.5 rounded-xl bg-[#E6F6EC] border border-[#A3E2B8] text-xs font-bold text-[#0F5132]">
          {exportStatus}
        </div>
      )}

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0]">
          <span className="text-xs font-semibold text-[#52524E]">Total Omzet Kotor</span>
          <p className="font-mono-tabular text-xl font-extrabold text-[#141413] mt-1">
            {formatRupiah(grossRevenue)}
          </p>
          <span className="text-[11px] font-bold text-[#0F5132]">100% Pendapatan Channel</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0]">
          <span className="text-xs font-semibold text-[#52524E]">Biaya Admin Marketplace (6.5%)</span>
          <p className="font-mono-tabular text-xl font-extrabold text-[#9A3408] mt-1">
            - {formatRupiah(platformFees)}
          </p>
          <span className="text-[11px] text-[#52524E]">Shopee, Tokopedia, & TikTok</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0]">
          <span className="text-xs font-semibold text-[#52524E]">HPP & Operasional Gudang</span>
          <p className="font-mono-tabular text-xl font-extrabold text-[#141413] mt-1">
            - {formatRupiah(operationalCost)}
          </p>
          <span className="text-[11px] text-[#52524E]">Estimasi 42% modal barang</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFDECE] border border-[#F6671E]">
          <span className="text-xs font-extrabold text-[#9A3408]">Laba Bersih (Net Profit)</span>
          <p className="font-mono-tabular text-xl font-extrabold text-[#141413] mt-1">
            {formatRupiah(netProfit)}
          </p>
          <span className="text-[11px] font-extrabold text-[#141413]">
            Margin Bersih: {marginPct}%
          </span>
        </div>
      </div>

      {/* Sub-report Selector */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[#EBE8E0] pb-3">
          {[
            { id: 'finance', label: 'Perbandingan Marketplace' },
            { id: 'products', label: 'Produk Terlaris (Top Selling)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                reportTab === tab.id
                  ? 'bg-[#F6671E] text-[#141413]'
                  : 'bg-[#FAF9F6] text-[#52524E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {reportTab === 'finance' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EBE8E0] text-[#52524E]">
                  <th className="py-3 px-2">Platform Marketplace</th>
                  <th className="py-3 px-2">Nama Toko</th>
                  <th className="py-3 px-2">Jumlah Pesanan</th>
                  <th className="py-3 px-2">Omzet Bulan Ini</th>
                  <th className="py-3 px-2">Estimasi Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8E0]">
                {marketplaces.map((m) => (
                  <tr key={m.id || m.platform}>
                    <td className="py-3.5 px-2 font-extrabold text-[#141413]">{m.platform}</td>
                    <td className="py-3.5 px-2 text-[#52524E]">{m.shop_name}</td>
                    <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#141413]">
                      {m.orders_this_month} order
                    </td>
                    <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#141413]">
                      {formatRupiah(m.revenue_this_month)}
                    </td>
                    <td className="py-3.5 px-2 font-mono-tabular font-extrabold text-[#0F5132]">
                      {formatRupiah(Math.round(m.revenue_this_month * 0.515))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EBE8E0] text-[#52524E]">
                  <th className="py-3 px-2">SKU</th>
                  <th className="py-3 px-2">Nama Produk</th>
                  <th className="py-3 px-2">Unit Terjual</th>
                  <th className="py-3 px-2">Harga Satuan</th>
                  <th className="py-3 px-2">Total Kontribusi Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8E0]">
                {[...products]
                  .sort((a, b) => b.sold_count - a.sold_count)
                  .map((p) => (
                    <tr key={p.id || p.sku}>
                      <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#9A3408]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-[#141413]">{p.name}</td>
                      <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#141413]">
                        {p.sold_count} pcs
                      </td>
                      <td className="py-3.5 px-2 font-mono-tabular text-[#52524E]">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-3.5 px-2 font-mono-tabular font-extrabold text-[#141413]">
                        {formatRupiah(p.price * p.sold_count)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
