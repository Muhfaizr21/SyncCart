import React, { useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

export function SellerOrdersPage({ orders = [], onShipOrder }) {
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [activeResiModalOrder, setActiveResiModalOrder] = useState(null)
  const [courierInput, setCourierInput] = useState('J&T Express')
  const [resiInput, setResiInput] = useState('')

  const filtered = orders.filter((o) => {
    const matchChannel = channelFilter === 'ALL' || o.marketplace === channelFilter
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchChannel && matchStatus
  })

  function openResiModal(order) {
    setActiveResiModalOrder(order)
    setCourierInput(order.courier || 'J&T Express')
    setResiInput(order.tracking_resi || '')
  }

  async function handleConfirmShip(e) {
    e.preventDefault()
    if (!activeResiModalOrder) return
    await onShipOrder(activeResiModalOrder.id, {
      courier: courierInput,
      tracking_resi: resiInput,
      status: 'Shipped',
    })
    setActiveResiModalOrder(null)
  }

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
            Phase 6 • Manajemen Pesanan & SLA Pengiriman
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
            Antrean Pesanan Lintas Marketplace & Input Resi
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E]">
            Pantau hitung mundur SLA pengiriman dan masukkan resi JNE, J&T, SiCepat, atau Anteraja.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'Shopee', 'Tokopedia', 'TikTok Shop'].map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                channelFilter === ch
                  ? 'bg-[#F6671E] text-[#141413]'
                  : 'bg-[#FAF9F6] text-[#52524E] border border-[#EBE8E0]'
              }`}
            >
              {ch === 'ALL' ? 'Semua Channel' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Resi Input Form Card when an order is selected */}
      {activeResiModalOrder && (
        <form
          onSubmit={handleConfirmShip}
          className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#F6671E] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#EBE8E0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#141413]">
                Input Resi Pengiriman • {activeResiModalOrder.order_number}
              </h2>
              <p className="text-xs text-[#52524E]">
                Pembeli: {activeResiModalOrder.buyer_name} ({activeResiModalOrder.marketplace})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveResiModalOrder(null)}
              className="text-xs font-bold text-[#9A3408] cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="ship-courier" className="block text-xs font-bold text-[#141413]">
                Ekspedisi Kurir
              </label>
              <select
                id="ship-courier"
                value={courierInput}
                onChange={(e) => setCourierInput(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-bold text-[#141413]"
              >
                <option value="J&T Express">J&T Express</option>
                <option value="JNE Reguler">JNE Reguler</option>
                <option value="SiCepat BEST">SiCepat BEST</option>
                <option value="Anteraja Reguler">Anteraja Reguler</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="ship-resi" className="block text-xs font-bold text-[#141413]">
                Nomor Resi (Kosongkan untuk Auto-Generate)
              </label>
              <input
                id="ship-resi"
                type="text"
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value)}
                placeholder="Contoh: JP8849201923"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-mono-tabular text-[#141413]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveResiModalOrder(null)}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#EBE8E0] text-xs font-bold text-[#52524E] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
            >
              Konfirmasi Pengiriman & Update Marketplace
            </button>
          </div>
        </form>
      )}

      {/* Orders List Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Perlu Resi', 'Pending', 'Shipped', 'Completed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#FFDECE] text-[#9A3408] border border-[#F6671E]'
                  : 'bg-[#FAF9F6] text-[#52524E] border border-[#EBE8E0]'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : st}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBE8E0] text-[11px] font-semibold text-[#52524E]">
                <th className="py-3 px-2">No. Invoice & Channel</th>
                <th className="py-3 px-2">Pembeli</th>
                <th className="py-3 px-2">Produk & Qty</th>
                <th className="py-3 px-2">Kurir & No. Resi</th>
                <th className="py-3 px-2">Total Tagihan</th>
                <th className="py-3 px-2">Status & SLA</th>
                <th className="py-3 px-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E0] text-xs">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3.5 px-2">
                    <span className="font-mono-tabular font-extrabold text-[#141413] block">
                      {order.order_number}
                    </span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
                      {order.marketplace}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-bold text-[#141413]">{order.buyer_name}</td>
                  <td className="py-3.5 px-2">
                    <p className="font-bold text-[#141413]">{order.product_name}</p>
                    <p className="text-[11px] text-[#52524E]">
                      SKU: {order.product_sku} • {order.quantity} pcs
                    </p>
                  </td>
                  <td className="py-3.5 px-2">
                    <p className="font-bold text-[#141413]">{order.courier}</p>
                    <p className="font-mono-tabular text-[11px] text-[#52524E]">
                      {order.tracking_resi || 'Belum ada resi'}
                    </p>
                  </td>
                  <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(order.amount)}
                  </td>
                  <td className="py-3.5 px-2">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        order.status === 'Perlu Resi'
                          ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                          : 'bg-[#E6F6EC] text-[#0F5132]'
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-[11px] text-[#52524E] mt-0.5">{order.sla_deadline}</p>
                  </td>
                  <td className="py-3.5 px-2 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openResiModal(order)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] font-bold text-[11px] cursor-pointer"
                      >
                        {order.tracking_resi ? 'Ubah Resi' : 'Input Resi'}
                      </button>
                      {order.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() =>
                            onShipOrder(order.id, {
                              courier: order.courier,
                              tracking_resi: order.tracking_resi,
                              status: 'Completed',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-[#EBE8E0] bg-[#FAF9F6] hover:bg-[#E6F6EC] text-[#0F5132] font-bold text-[11px] cursor-pointer"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
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
