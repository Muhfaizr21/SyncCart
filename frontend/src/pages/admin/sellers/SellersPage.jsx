import React, { useMemo, useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'Oct 29'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return String(dateStr).slice(0, 10)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function SellersPage({
  sellers = [],
  filteredSellers = [],
  selectedIds = [],
  inspectedItem,
  planFilter = 'ALL',
  statusFilter = 'ALL',
  onChangePlanFilter,
  onChangeStatusFilter,
  onResetFilters,
  onToggleSelectAll,
  onToggleRowSelection,
  onInspectSeller,
  onChangeSellerPlan,
  onToggleSellerStatus,
  onUpdateSellerProfile,
  onSyncSellerCatalog,
  onDeleteSeller,
  busyAction,
  renderStatusCell,
}) {
  const [cycleFilter, setCycleFilter] = useState('ALL')
  const [editingSeller, setEditingSeller] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const displayedSellers = useMemo(() => {
    if (cycleFilter === 'ALL') return filteredSellers
    return filteredSellers.filter(
      (s) => String(s.billing_cycle || 'annual').toLowerCase() === cycleFilter.toLowerCase()
    )
  }, [filteredSellers, cycleFilter])

  const kpis = useMemo(() => {
    const total = sellers.length
    const active = sellers.filter((s) => s.status === 'active').length
    const suspended = sellers.filter((s) => s.status === 'suspended').length
    const entCount = sellers.filter((s) => s.plan === 'enterprise').length
    const bizCount = sellers.filter((s) => s.plan === 'business').length
    const strCount = sellers.filter((s) => s.plan === 'starter').length
    const totalSku = sellers.reduce((acc, s) => acc + Number(s.products_count || 0), 0)
    const totalChannels = sellers.reduce((acc, s) => acc + Number(s.connected_stores || 3), 0)
    const totalGmv = sellers.reduce((acc, s) => acc + Number(s.total_gmv || 0), 0)
    const avgGmv = total > 0 ? Math.round(totalGmv / total) : 0

    return {
      total,
      active,
      suspended,
      entCount,
      bizCount,
      strCount,
      totalSku,
      totalChannels,
      totalGmv,
      avgGmv,
    }
  }, [sellers])

  const openEditModal = (seller) => {
    setEditingSeller(seller)
    setEditForm({
      store_name: seller.store_name || '',
      owner_full_name: seller.owner_name || '',
      owner_email: seller.owner_email || '',
      business_category: seller.business_category || 'Fashion & Apparel Omnichannel',
      warehouse_name: seller.warehouse_name || 'Gudang Pusat',
      warehouse_city: seller.warehouse_city || 'Jakarta',
      support_phone: seller.support_phone || '+62 812-8890-4412',
      support_email: seller.support_email || seller.owner_email || '',
      tax_npwp: seller.tax_npwp || '09.254.294.3-042.000',
      safety_stock_buffer: Number(seller.safety_stock_buffer ?? 3),
      sync_interval_minutes: Number(seller.sync_interval_minutes ?? 5),
      plan: seller.plan || 'business',
      billing_cycle: seller.billing_cycle || 'annual',
      status: seller.status || 'active',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingSeller || !editForm || !onUpdateSellerProfile) return
    await onUpdateSellerProfile(editingSeller.id, {
      ...editForm,
      safety_stock_buffer: Number(editForm.safety_stock_buffer || 3),
      sync_interval_minutes: Number(editForm.sync_interval_minutes || 5),
    })
    setEditingSeller(null)
    setEditForm(null)
  }

  return (
    <div className="space-y-6">
      {/* 1. SELLER GOVERNANCE KPI SUMMARY CARDS (No Platform Revenue Gauge) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[#E5E8EF] bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              TENANT SELLERS
            </span>
            <span className="rounded-md bg-[#E8F5EE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2F6F4E]">
              {kpis.active} Active
            </span>
          </div>
          <p className="mt-2 font-mono text-[22px] font-bold text-[#14181F]">
            {kpis.total} Toko Resmi
          </p>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            {kpis.suspended} ditangguhkan • 100% Terverifikasi NPWP
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E8EF] bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              KOMPOSISI PAKET SAAS
            </span>
            <span className="rounded-md bg-[#14181F] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              3 Tier
            </span>
          </div>
          <p className="mt-2 font-mono text-[18px] font-bold text-[#14181F]">
            {kpis.entCount} Ent • {kpis.bizCount} Biz • {kpis.strCount} Str
          </p>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            Mayoritas berlangganan siklus tahunan (Annual)
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E8EF] bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              KATALOG & KANAL SELLER
            </span>
            <span className="rounded-md bg-[#E8F5EE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2F6F4E]">
              OAuth 2.0
            </span>
          </div>
          <p className="mt-2 font-mono text-[22px] font-bold text-[#14181F]">
            {kpis.totalSku} SKU • {kpis.totalChannels} MP
          </p>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            Tersinkronisasi ke Shopee, Tokopedia & TikTok Shop
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E8EF] bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              VOLUME TRANSAKSI SELLER
            </span>
            <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#14181F]">
              GMV Toko
            </span>
          </div>
          <p className="mt-2 font-mono text-[20px] font-bold text-[#14181F]">
            {formatRupiah(kpis.totalGmv)}
          </p>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            Rata-rata per toko: <strong className="text-[#14181F]">{formatRupiah(kpis.avgGmv)}</strong>
          </p>
        </div>
      </div>

      {/* 2. FILTER PILL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEEF2] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter Pills */}
          {['ALL', 'enterprise', 'business', 'starter'].map((planOpt) => {
            const active = planFilter === planOpt
            return (
              <button
                key={planOpt}
                type="button"
                onClick={() => onChangePlanFilter(planOpt)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition ${
                  active
                    ? 'bg-[#14181F] text-white'
                    : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                }`}
              >
                {planOpt === 'ALL' ? 'Semua Plan (3)' : `Plan: ${planOpt}`}
              </button>
            )
          })}

          <span className="mx-1 h-4 w-[1px] bg-[#E5E7EB]" />

          {/* Status Filter Pill */}
          <button
            type="button"
            onClick={() =>
              onChangeStatusFilter(
                statusFilter === 'ALL'
                  ? 'PAID'
                  : statusFilter === 'PAID'
                  ? 'CANCELLED'
                  : 'ALL'
              )
            }
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              statusFilter !== 'ALL'
                ? 'bg-[#14181F] text-white'
                : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
            }`}
          >
            Status:{' '}
            {statusFilter === 'ALL'
              ? 'Semua'
              : statusFilter === 'PAID'
              ? 'Active'
              : 'Suspended'}{' '}
            ⌄
          </button>

          {/* Billing Cycle Filter Pill */}
          <button
            type="button"
            onClick={() =>
              setCycleFilter((prev) =>
                prev === 'ALL' ? 'annual' : prev === 'annual' ? 'monthly' : 'ALL'
              )
            }
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              cycleFilter !== 'ALL'
                ? 'bg-[#14181F] text-white'
                : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
            }`}
          >
            Siklus: {cycleFilter === 'ALL' ? 'Semua' : cycleFilter.toUpperCase()} ⌄
          </button>

          {(planFilter !== 'ALL' || statusFilter !== 'ALL' || cycleFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setCycleFilter('ALL')
                onResetFilters()
              }}
              className="rounded-full bg-[#FEECEC] px-3 py-1.5 text-[11.5px] font-semibold text-[#D64545] hover:bg-[#FCD6D6] transition"
            >
              ✕ Reset Filter
            </button>
          )}
        </div>

        <span className="text-[11.5px] font-medium text-[#8C94A4]">
          Menampilkan <strong className="text-[#14181F]">{displayedSellers.length}</strong> dari{' '}
          {sellers.length} toko terdaftar
        </span>
      </div>

      {/* 3. FULL-WIDTH SELLERS GOVERNANCE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#ECEEF2] text-[11.5px] font-medium text-[#8C94A4]">
              <th className="w-9 py-3 pl-2">
                <input
                  type="checkbox"
                  checked={
                    displayedSellers.length > 0 &&
                    selectedIds.length === displayedSellers.length
                  }
                  onChange={() => onToggleSelectAll(displayedSellers)}
                  className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                />
              </th>
              <th className="py-3 pr-3 font-medium">Store ID ⌄</th>
              <th className="py-3 px-3 font-medium">Seller & Flagship Store</th>
              <th className="py-3 px-3 font-medium">Owner & Legal NPWP</th>
              <th className="py-3 px-3 font-medium">SaaS Plan & Cycle</th>
              <th className="py-3 px-3 font-medium">Status</th>
              <th className="py-3 px-3 font-medium">Warehouse, Buffer & SKU</th>
              <th className="py-3 px-3 font-medium">GMV & Orders</th>
              <th className="py-3 pl-3 text-right font-medium">Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
            {displayedSellers.map((st) => {
              const checked = selectedIds.includes(st.id)
              const isInspected =
                inspectedItem?.type === 'seller' && inspectedItem?.data?.id === st.id
              return (
                <tr
                  key={st.id}
                  onClick={() => onInspectSeller(st)}
                  className={`cursor-pointer transition ${
                    checked || isInspected ? 'bg-[#F4F6F9]' : 'hover:bg-[#FAFBFD]'
                  }`}
                >
                  <td
                    className="py-4 pl-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleRowSelection(st.id)
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                    />
                  </td>

                  <td className="py-4 pr-3 font-mono text-[12.5px] font-semibold text-[#14181F]">
                    <span className="inline-flex items-center gap-1.5">
                      <span>#SLR-0{st.id}</span>
                      <span className="text-[10px] text-[#9CA3AF]">▤</span>
                    </span>
                    <span className="block text-[10.5px] font-normal text-[#8C94A4]">
                      {formatShortDate(st.created_at)}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14181F] text-[11px] font-bold text-white">
                        {st.store_name
                          ?.split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#14181F]">{st.store_name}</p>
                        <p className="text-[11px] text-[#8C94A4]">
                          /{st.store_slug} • {st.business_category || 'Omnichannel'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <p className="font-medium text-[#14181F]">{st.owner_name}</p>
                    <p className="text-[11px] text-[#68707E]">{st.owner_email}</p>
                    <span className="mt-0.5 inline-block font-mono text-[10px] text-[#8C94A4]">
                      NPWP: {st.tax_npwp || '09.254.294.3-042.000'}
                    </span>
                  </td>

                  <td
                    className="py-4 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <select
                        value={st.plan}
                        disabled={busyAction}
                        onChange={(e) =>
                          onChangeSellerPlan(st.id, {
                            plan: e.target.value,
                            billingCycle: st.billing_cycle || 'annual',
                          })
                        }
                        className="rounded-lg border border-[#DCE0E8] bg-white px-2.5 py-1 text-[11.5px] font-bold uppercase text-[#14181F] focus:border-[#14181F] focus:outline-none"
                      >
                        <option value="starter">Starter</option>
                        <option value="business">Business</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={() =>
                          onChangeSellerPlan(st.id, {
                            plan: st.plan,
                            billingCycle: st.billing_cycle === 'annual' ? 'monthly' : 'annual',
                          })
                        }
                        title="Klik untuk ubah siklus tagihan (Annual / Monthly)"
                        className="rounded bg-[#F3F4F6] px-2 py-1 font-mono text-[10px] font-semibold uppercase text-[#525A68] hover:bg-[#E5E7EB]"
                      >
                        {st.billing_cycle || 'annual'}
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-3">{renderStatusCell(st.status)}</td>

                  <td className="py-4 px-3">
                    <p className="text-[12px] font-medium text-[#14181F]">
                      {st.warehouse_city || 'Jakarta'}
                    </p>
                    <p className="font-mono text-[11px] text-[#68707E]">
                      {st.connected_stores || 3} MP • {st.products_count || 0} SKU • Buf{' '}
                      {st.safety_stock_buffer ?? 3}
                    </p>
                  </td>

                  <td className="py-4 px-3">
                    <p className="font-mono text-[13px] font-bold text-[#14181F]">
                      {formatRupiah(st.total_gmv)}
                    </p>
                    <p className="font-mono text-[11px] text-[#3F6E58]">
                      {st.orders_count || 0} pesanan selesai
                    </p>
                  </td>

                  <td
                    className="py-4 pl-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={() => openEditModal(st)}
                        className="rounded-lg border border-[#DCE0E8] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#14181F] hover:bg-[#F3F4F6] transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={() => onSyncSellerCatalog && onSyncSellerCatalog(st.id)}
                        className="rounded-lg border border-[#DCE0E8] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3F6E58] hover:bg-[#E8F5EE] transition"
                        title="Paksa sinkronisasi stok seluruh SKU toko ini"
                      >
                        Sync SKU
                      </button>
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={() =>
                          onToggleSellerStatus(
                            st.id,
                            st.status === 'active' ? 'suspended' : 'active'
                          )
                        }
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                          st.status === 'active'
                            ? 'border border-[#F3D9A4] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7]'
                            : 'bg-[#E8F5EE] text-[#2F6F4E] hover:bg-[#D1FAE5]'
                        }`}
                      >
                        {st.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      {st.id !== 1 && (
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={() => onDeleteSeller(st.id)}
                          className="rounded-lg bg-[#FEECEC] px-2.5 py-1.5 text-[11px] font-semibold text-[#D64545] hover:bg-[#FCD6D6] transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 4. MODAL: EDIT SELLER & STORE CONFIGURATION */}
      {editingSeller && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECEEF2] pb-3.5">
              <div>
                <h3 className="text-[16px] font-bold text-[#14181F]">
                  Edit Profil & Kuota Operasional Seller (#SLR-0{editingSeller.id})
                </h3>
                <p className="text-[11.5px] text-[#8C94A4]">
                  Perubahan langsung disimpan ke database dan diterapkan pada workspace Seller
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSeller(null)
                  setEditForm(null)
                }}
                className="text-[#8C94A4] hover:text-[#14181F]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-[12.5px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Nama Toko Flagship
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.store_name}
                    onChange={(e) => setEditForm({ ...editForm, store_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Kategori Bisnis
                  </label>
                  <input
                    type="text"
                    value={editForm.business_category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, business_category: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Nama Pemilik (Owner)
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.owner_full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, owner_full_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Email Login Owner
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.owner_email}
                    onChange={(e) => setEditForm({ ...editForm, owner_email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Kota Gudang Utama
                  </label>
                  <input
                    type="text"
                    value={editForm.warehouse_city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, warehouse_city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Nomor NPWP Badan / PKP
                  </label>
                  <input
                    type="text"
                    value={editForm.tax_npwp}
                    onChange={(e) => setEditForm({ ...editForm, tax_npwp: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#525A68]">
                    Paket SaaS
                  </label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-2.5 py-2 font-semibold uppercase"
                  >
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#525A68]">
                    Siklus Tagihan
                  </label>
                  <select
                    value={editForm.billing_cycle}
                    onChange={(e) =>
                      setEditForm({ ...editForm, billing_cycle: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-2.5 py-2"
                  >
                    <option value="annual">Annual (Tahunan)</option>
                    <option value="monthly">Monthly (Bulanan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#525A68]">
                    Buffer Stok (pcs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.safety_stock_buffer}
                    onChange={(e) =>
                      setEditForm({ ...editForm, safety_stock_buffer: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-2.5 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#525A68]">
                    Interval Sync (mnt)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editForm.sync_interval_minutes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sync_interval_minutes: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-2.5 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#ECEEF2] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSeller(null)
                    setEditForm(null)
                  }}
                  className="rounded-lg border border-[#DCE0E8] px-4 py-2 text-[12px] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="rounded-lg bg-[#14181F] px-5 py-2 text-[12px] font-semibold text-white hover:bg-[#252C38]"
                >
                  Simpan Perubahan Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

