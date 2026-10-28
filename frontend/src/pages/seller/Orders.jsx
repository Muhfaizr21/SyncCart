import React, { useEffect, useMemo, useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatDateTime(isoString) {
  if (!isoString) return 'Hari ini'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Hari ini'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case 'Perlu Resi':
      return 'bg-[#FDE8E8] text-[#9B1C1C]'
    case 'Pending':
      return 'bg-[#FFDECE] text-[#9A3408]'
    case 'Shipped':
      return 'bg-[#E6F6EC] text-[#0F5132]'
    case 'Completed':
      return 'bg-[#E6F6EC] text-[#0F5132]'
    case 'Cancelled':
      return 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
    default:
      return 'bg-[#FFDECE] text-[#9A3408]'
  }
}

export function SellerOrdersPage({
  orders = [],
  products = [],
  store,
  onCreateOrder,
  onShipOrder,
  onBulkOrderAction,
  onDeleteOrder,
}) {
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const [selectedIds, setSelectedIds] = useState([])
  const [busyId, setBusyId] = useState('')

  // Pop-Up Modal 1: Order Detail / Input Resi / Shipping Label Preview
  const [activeOrderModal, setActiveOrderModal] = useState(null)
  const [modalTab, setModalTab] = useState('resi') // 'resi' | 'label'
  const [shipForm, setShipForm] = useState({
    courier: 'J&T Express',
    tracking_resi: '',
    status: 'Shipped',
    buyer_phone: '',
    shipping_address: '',
    notes: '',
  })

  // Pop-Up Modal 2: Create New Order (Connected to PostgreSQL products)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    marketplace: 'Shopee',
    product_id: '',
    quantity: 1,
    buyer_name: '',
    buyer_phone: '0812-9982-3310',
    shipping_address: 'Jl. Kemang Raya No. 18, Jakarta Selatan',
    courier: 'J&T Express',
    payment_method: 'QRIS / Virtual Account',
    notes: '',
  })

  // Close modals on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActiveOrderModal(null)
        setShowCreateModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dynamic KPI telemetry computed 100% from PostgreSQL orders
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled')
    const totalOrders = orders.length
    const totalItems = activeOrders.reduce((sum, o) => sum + Number(o.quantity || 1), 0)
    const needsResiCount = orders.filter(
      (o) => o.status === 'Perlu Resi' || o.status === 'Pending'
    ).length
    const shippedOrCompletedCount = orders.filter(
      (o) => o.status === 'Shipped' || o.status === 'Completed'
    ).length
    const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length
    const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
    const fulfillmentRate =
      activeOrders.length > 0
        ? Math.round((shippedOrCompletedCount / activeOrders.length) * 100)
        : 100

    return {
      totalOrders,
      totalItems,
      needsResiCount,
      shippedOrCompletedCount,
      cancelledCount,
      totalRevenue,
      fulfillmentRate,
    }
  }, [orders])

  // Filtered & sorted orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = orders.filter((o) => {
      const matchChannel =
        channelFilter === 'ALL' ||
        (o.marketplace || '').toLowerCase().includes(channelFilter.toLowerCase())

      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter

      const matchSearch =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.buyer_name?.toLowerCase().includes(q) ||
        o.product_name?.toLowerCase().includes(q) ||
        o.product_sku?.toLowerCase().includes(q) ||
        o.tracking_resi?.toLowerCase().includes(q)

      return matchChannel && matchStatus && matchSearch
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0)
      if (sortBy === 'sla_priority') {
        const aUrgent = a.status === 'Perlu Resi' || a.status === 'Pending' ? 0 : 1
        const bUrgent = b.status === 'Perlu Resi' || b.status === 'Pending' ? 0 : 1
        if (aUrgent !== bUrgent) return aUrgent - bUrgent
      }
      return (b.id || 0) - (a.id || 0)
    })
  }, [orders, channelFilter, statusFilter, search, sortBy])

  function openOrderModal(order, defaultTab = 'resi') {
    setActiveOrderModal(order)
    setModalTab(defaultTab)
    setShipForm({
      courier: order.courier || 'J&T Express',
      tracking_resi: order.tracking_resi || '',
      status:
        order.status === 'Perlu Resi' || order.status === 'Pending'
          ? 'Shipped'
          : order.status,
      buyer_phone: order.buyer_phone || '0812-8890-4412',
      shipping_address:
        order.shipping_address || 'Jl. Sudirman No. 45, Jakarta Selatan',
      notes: order.notes || '',
    })
  }

  function openCreateOrderModal() {
    setCreateForm({
      marketplace: 'Shopee',
      product_id: products[0]?.id || '',
      quantity: 1,
      buyer_name: '',
      buyer_phone: '0812-9982-3310',
      shipping_address: 'Jl. Kemang Raya No. 18, Jakarta Selatan',
      courier: 'J&T Express',
      payment_method: 'QRIS / Virtual Account',
      notes: '',
    })
    setShowCreateModal(true)
  }

  async function handleSaveShipModal(e) {
    e.preventDefault()
    if (!activeOrderModal) return
    setBusyId(`ship-${activeOrderModal.id}`)
    try {
      await onShipOrder(activeOrderModal.id, shipForm)
      setActiveOrderModal(null)
    } finally {
      setBusyId('')
    }
  }

  async function handleSubmitCreateOrder(e) {
    e.preventDefault()
    if (!createForm.buyer_name.trim() || !onCreateOrder) return
    const targetProductId = Number(createForm.product_id) || products[0]?.id || 0
    if (!targetProductId) return

    setBusyId('create-order')
    try {
      await onCreateOrder({
        marketplace: createForm.marketplace,
        product_id: targetProductId,
        quantity: Number(createForm.quantity) || 1,
        buyer_name: createForm.buyer_name.trim(),
        buyer_phone: createForm.buyer_phone.trim(),
        shipping_address: createForm.shipping_address.trim(),
        courier: createForm.courier,
        payment_method: createForm.payment_method,
        notes: createForm.notes.trim(),
      })
      setShowCreateModal(false)
    } finally {
      setBusyId('')
    }
  }

  async function handleQuickStatus(order, nextStatus) {
    setBusyId(`quick-${order.id}`)
    try {
      await onShipOrder(order.id, {
        courier: order.courier,
        tracking_resi: order.tracking_resi,
        status: nextStatus,
      })
    } finally {
      setBusyId('')
    }
  }

  async function handleRunBulk(action) {
    if (!onBulkOrderAction || selectedIds.length === 0) return
    setBusyId(`bulk-${action}`)
    try {
      await onBulkOrderAction({
        order_ids: selectedIds,
        action,
      })
      setSelectedIds([])
    } finally {
      setBusyId('')
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function toggleSelectAllFiltered() {
    const visibleIds = filteredOrders.map((o) => o.id)
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedIds(visibleIds)
    }
  }

  function handleExportCsv() {
    const headers = [
      'No. Invoice',
      'Marketplace',
      'Pembeli',
      'Telepon',
      'Produk',
      'SKU',
      'Qty',
      'Total (Rp)',
      'Kurir',
      'No. Resi',
      'Status',
    ]
    const rows = filteredOrders.map((o) => [
      `"${o.order_number}"`,
      `"${o.marketplace}"`,
      `"${(o.buyer_name || '').replace(/"/g, '""')}"`,
      `"${o.buyer_phone || ''}"`,
      `"${(o.product_name || '').replace(/"/g, '""')}"`,
      `"${o.product_sku || ''}"`,
      o.quantity,
      o.amount,
      `"${o.courier || ''}"`,
      `"${o.tracking_resi || ''}"`,
      `"${o.status || ''}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pesanan-synccart-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Clean Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] px-5 py-4 rounded-2xl border border-[#ECEAE4]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFDECE] text-[#9A3408] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-[#141413]">
                Pesanan & Resi Pengiriman
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  stats.needsResiCount > 0
                    ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                    : 'bg-[#E6F6EC] text-[#0F5132]'
                }`}
              >
                {stats.needsResiCount > 0
                  ? `${stats.needsResiCount} Perlu Resi`
                  : 'Semua Resi Terkirim'}
              </span>
            </div>
            <p className="text-xs text-[#52524E]">
              Kelola pesanan lintas marketplace, input nomor resi ekspedisi, cetak slip pengiriman, dan pantau batas SLA.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-[38px] px-3.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/40 text-xs font-bold text-[#141413] cursor-pointer transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={openCreateOrderModal}
            className="h-[38px] px-4 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer transition-all"
          >
            + Buat Pesanan Baru
          </button>
        </div>
      </div>

      {/* ROW 1: 4 RentFlow-Style Visual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pesanan */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Total Pesanan</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {stats.totalOrders}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold">
                {stats.totalItems} Unit
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[50, 75, 65, 90, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${i === 4 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* KPI 2: Antrean Perlu Resi */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Antrean Perlu Resi</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono-tabular text-2xl font-extrabold ${
                  stats.needsResiCount > 0 ? 'text-[#9B1C1C]' : 'text-[#141413]'
                }`}
              >
                {stats.needsResiCount} Order
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  stats.needsResiCount > 0
                    ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                    : 'bg-[#E6F6EC] text-[#0F5132]'
                }`}
              >
                {stats.needsResiCount > 0 ? 'Segera Kirim' : 'Terkendali'}
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[80, 60, 95, 70, 85].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${
                    stats.needsResiCount > 0 && i === 2 ? 'bg-[#9B1C1C]' : 'bg-[#FFDECE]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* KPI 3: Terkirim & Selesai */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Terkirim & Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {stats.shippedOrCompletedCount}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                {stats.fulfillmentRate}% SLA
              </span>
            </div>
            <svg className="w-16 h-7 overflow-visible" viewBox="0 0 70 28" fill="none">
              <path
                d="M2 22 C14 18, 24 10, 36 14 C48 18, 56 4, 68 6"
                stroke="#F6671E"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: Nilai Transaksi */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Nilai Pesanan Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFDECE] flex items-center justify-center text-[#9A3408]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="font-mono-tabular text-lg font-extrabold text-[#141413] truncate">
              {formatRupiah(stats.totalRevenue)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold shrink-0">
              Omzet Masuk
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-3 rounded-2xl bg-[#FFF6F0] border border-[#F6671E] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#F6671E] text-[#141413] font-extrabold">
              {selectedIds.length} Pesanan Dipilih
            </span>
            <span className="font-semibold text-[#141413]">
              Pilih aksi pemrosesan massal:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('ship')}
              className="h-[32px] px-3 rounded-lg bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
            >
              Proses & Generate Resi Massal
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('complete')}
              className="h-[32px] px-3 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#E6F6EC] text-xs font-bold text-[#0F5132] cursor-pointer"
            >
              Tandai Selesai
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('cancel')}
              className="h-[32px] px-3 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FDE8E8] text-xs font-bold text-[#9B1C1C] cursor-pointer"
            >
              Batalkan & Kembalikan Stok
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('delete')}
              className="h-[32px] px-3 rounded-lg bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] cursor-pointer"
            >
              Hapus ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-[32px] px-2.5 text-xs font-bold text-[#52524E] cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Main Orders Table Card */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        {/* Multi-Dimension Filter & Search Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#ECEAE4] pb-3.5">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `Semua (${orders.length})` },
              {
                id: 'Perlu Resi',
                label: `Perlu Resi (${orders.filter((o) => o.status === 'Perlu Resi').length})`,
              },
              {
                id: 'Pending',
                label: `Pending (${orders.filter((o) => o.status === 'Pending').length})`,
              },
              {
                id: 'Shipped',
                label: `Shipped (${orders.filter((o) => o.status === 'Shipped').length})`,
              },
              {
                id: 'Completed',
                label: `Selesai (${orders.filter((o) => o.status === 'Completed').length})`,
              },
              {
                id: 'Cancelled',
                label: `Batal (${orders.filter((o) => o.status === 'Cancelled').length})`,
              },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`h-[34px] px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#F6671E] text-[#141413] font-extrabold'
                    : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Channel Selector, Search & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              aria-label="Cari nomor invoice, pembeli, atau resi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Invoice, pembeli, resi..."
              className="h-[34px] w-full sm:w-52 px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413] placeholder:text-[#52524E]"
            />

            <select
              aria-label="Filter channel marketplace"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-[34px] px-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
            >
              <option value="ALL">Semua Channel</option>
              <option value="Shopee">Shopee</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="TikTok Shop">TikTok Shop</option>
            </select>

            <select
              aria-label="Urutkan pesanan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[34px] px-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
            >
              <option value="newest">Terbaru</option>
              <option value="sla_priority">Prioritas SLA (Perlu Resi)</option>
              <option value="amount_desc">Nominal Tertinggi</option>
              <option value="amount_asc">Nominal Terendah</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-extrabold text-[#141413]">
              Tidak ada pesanan yang sesuai dengan filter saat ini
            </p>
            <p className="text-xs text-[#52524E]">
              Coba pilih tab Semua atau buat pesanan baru untuk menguji pemotongan stok.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[11px] font-semibold text-[#52524E]">
                  <th className="py-2.5 px-2 w-8">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua pesanan"
                      checked={
                        filteredOrders.length > 0 &&
                        filteredOrders.every((o) => selectedIds.includes(o.id))
                      }
                      onChange={toggleSelectAllFiltered}
                      className="accent-[#F6671E] cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-2">No. Invoice & Channel</th>
                  <th className="py-2.5 px-2">Pembeli & Tujuan</th>
                  <th className="py-2.5 px-2">Produk & Qty</th>
                  <th className="py-2.5 px-2">Ekspedisi & Resi</th>
                  <th className="py-2.5 px-2">Total Tagihan</th>
                  <th className="py-2.5 px-2">Status & SLA</th>
                  <th className="py-2.5 px-2 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4] text-xs">
                {filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.id)
                  const needsResi =
                    order.status === 'Perlu Resi' || order.status === 'Pending'

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-[#FFF6F0]' : 'hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${order.order_number}`}
                          checked={isChecked}
                          onChange={() => toggleSelectOne(order.id)}
                          className="accent-[#F6671E] cursor-pointer"
                        />
                      </td>

                      {/* Invoice & Channel */}
                      <td className="py-3 px-2">
                        <span className="font-mono-tabular font-extrabold text-[#141413] block">
                          {order.order_number}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
                            {order.marketplace}
                          </span>
                          <span className="text-[10px] text-[#52524E]">
                            {formatDateTime(order.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Buyer & Address */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center font-extrabold text-[10px] text-[#9A3408] shrink-0">
                            {order.buyer_initials || 'PL'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-[#141413] truncate">
                              {order.buyer_name}
                            </p>
                            <p className="text-[11px] text-[#52524E] truncate max-w-[180px]">
                              {order.shipping_address || 'Jakarta Selatan'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Product & Qty */}
                      <td className="py-3 px-2">
                        <p className="font-bold text-[#141413] truncate max-w-[210px]">
                          {order.product_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono-tabular text-[10px] font-bold text-[#9A3408]">
                            {order.product_sku}
                          </span>
                          <span className="text-[11px] text-[#52524E]">
                            • <strong>{order.quantity} pcs</strong>
                          </span>
                        </div>
                      </td>

                      {/* Courier & Tracking Resi */}
                      <td className="py-3 px-2">
                        <span className="font-bold text-[#141413] block">
                          {order.courier}
                        </span>
                        {order.tracking_resi ? (
                          <span className="font-mono-tabular text-[11px] font-extrabold text-[#0F5132]">
                            {order.tracking_resi}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9B1C1C] font-semibold">
                            Belum ada resi
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-2">
                        <span className="font-mono-tabular font-extrabold text-[#141413] block">
                          {formatRupiah(order.amount)}
                        </span>
                        <span className="text-[10px] text-[#52524E]">
                          {order.payment_method || 'QRIS / VA'}
                        </span>
                      </td>

                      {/* Status & SLA */}
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-[10px] text-[#52524E] mt-0.5">
                          {order.sla_deadline}
                        </p>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openOrderModal(order, 'resi')}
                            className={`h-[30px] px-3 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
                              needsResi
                                ? 'bg-[#F6671E] text-[#141413]'
                                : 'bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413]'
                            }`}
                          >
                            {order.tracking_resi ? 'Detail & Resi' : 'Input Resi'}
                          </button>

                          <button
                            type="button"
                            onClick={() => openOrderModal(order, 'label')}
                            className="h-[30px] px-2.5 rounded-lg border border-[#ECEAE4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-[11px] font-bold text-[#141413] cursor-pointer"
                          >
                            Label
                          </button>

                          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              disabled={busyId === `quick-${order.id}`}
                              onClick={() => handleQuickStatus(order, 'Completed')}
                              className="h-[30px] px-2.5 rounded-lg border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#E6F6EC] text-[11px] font-bold text-[#0F5132] cursor-pointer"
                            >
                              Selesai
                            </button>
                          )}

                          {onDeleteOrder && (
                            <button
                              type="button"
                              onClick={() => onDeleteOrder(order.id)}
                              className="h-[30px] px-2 rounded-lg border border-[#F8B4B4] bg-[#FDE8E8]/60 hover:bg-[#FDE8E8] text-[11px] font-bold text-[#9B1C1C] cursor-pointer"
                              title="Hapus pesanan"
                            >
                              Hapus
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
        )}
      </div>

      {/* POP-UP MODAL 1: INPUT RESI, DETAIL PESANAN, & CETAK LABEL PENGIRIMAN */}
      {activeOrderModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveOrderModal(null)
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
                    {activeOrderModal.marketplace}
                  </span>
                  <span className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                    {activeOrderModal.order_number}
                  </span>
                </div>
                <h2 id="order-modal-title" className="text-base font-extrabold text-[#141413] mt-0.5">
                  Pemrosesan Pengiriman & Label Resi
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] p-0.5">
                  <button
                    type="button"
                    onClick={() => setModalTab('resi')}
                    className={`h-[28px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                      modalTab === 'resi'
                        ? 'bg-[#F6671E] text-[#141413] font-extrabold'
                        : 'text-[#52524E]'
                    }`}
                  >
                    Input Resi
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('label')}
                    className={`h-[28px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                      modalTab === 'label'
                        ? 'bg-[#F6671E] text-[#141413] font-extrabold'
                        : 'text-[#52524E]'
                    }`}
                  >
                    Slip Label
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveOrderModal(null)}
                  aria-label="Tutup modal pesanan"
                  className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-[#141413] font-extrabold text-sm flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {modalTab === 'resi' ? (
              <form onSubmit={handleSaveShipModal} className="p-6 space-y-4">
                {/* Summary Banner */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#52524E] block">Item Pesanan</span>
                    <strong className="text-sm font-extrabold text-[#141413]">
                      {activeOrderModal.product_name} ({activeOrderModal.quantity} pcs)
                    </strong>
                    <span className="block font-mono-tabular text-[11px] text-[#9A3408]">
                      SKU: {activeOrderModal.product_sku}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#52524E] block">Total Pembayaran</span>
                    <strong className="font-mono-tabular text-base font-extrabold text-[#141413]">
                      {formatRupiah(activeOrderModal.amount)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label htmlFor="m-courier" className="block text-xs font-bold text-[#141413]">
                      Ekspedisi Kurir
                    </label>
                    <select
                      id="m-courier"
                      value={shipForm.courier}
                      onChange={(e) => setShipForm((s) => ({ ...s, courier: e.target.value }))}
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                    >
                      <option value="J&T Express">J&T Express</option>
                      <option value="JNE Reguler">JNE Reguler</option>
                      <option value="SiCepat BEST">SiCepat BEST</option>
                      <option value="Anteraja Reguler">Anteraja Reguler</option>
                      <option value="GoSend Instant">GoSend Instant</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="m-status" className="block text-xs font-bold text-[#141413]">
                      Status Pesanan
                    </label>
                    <select
                      id="m-status"
                      value={shipForm.status}
                      onChange={(e) => setShipForm((s) => ({ ...s, status: e.target.value }))}
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                    >
                      <option value="Perlu Resi">Perlu Resi</option>
                      <option value="Pending">Pending (Sedang Dikemas)</option>
                      <option value="Shipped">Shipped (Dalam Pengiriman)</option>
                      <option value="Completed">Completed (Selesai)</option>
                      <option value="Cancelled">Cancelled (Batalkan & Kembalikan Stok)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="m-resi" className="block text-xs font-bold text-[#141413]">
                        Nomor Resi Pengiriman (Kosongkan untuk Auto-Generate)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShipForm((s) => ({
                            ...s,
                            tracking_resi: `JT-${Math.floor(10000000 + Math.random() * 90000000)}`,
                          }))
                        }
                        className="text-[11px] font-extrabold text-[#9A3408] hover:underline cursor-pointer"
                      >
                        + Generate Nomor Resi Otomatis
                      </button>
                    </div>
                    <input
                      id="m-resi"
                      type="text"
                      value={shipForm.tracking_resi}
                      onChange={(e) =>
                        setShipForm((s) => ({ ...s, tracking_resi: e.target.value }))
                      }
                      placeholder="Contoh: JT-88492019"
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="m-phone" className="block text-xs font-bold text-[#141413]">
                      No. Telepon Penerima
                    </label>
                    <input
                      id="m-phone"
                      type="text"
                      value={shipForm.buyer_phone}
                      onChange={(e) =>
                        setShipForm((s) => ({ ...s, buyer_phone: e.target.value }))
                      }
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular text-[#141413]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="m-notes" className="block text-xs font-bold text-[#141413]">
                      Catatan Kurir / Gudang
                    </label>
                    <input
                      id="m-notes"
                      type="text"
                      value={shipForm.notes}
                      onChange={(e) => setShipForm((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Contoh: Packing bubble wrap"
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="m-addr" className="block text-xs font-bold text-[#141413]">
                      Alamat Pengiriman Lengkap
                    </label>
                    <input
                      id="m-addr"
                      type="text"
                      value={shipForm.shipping_address}
                      onChange={(e) =>
                        setShipForm((s) => ({ ...s, shipping_address: e.target.value }))
                      }
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413]"
                    />
                  </div>
                </div>

                {shipForm.status === 'Cancelled' && (
                  <p className="p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C]">
                    Perhatian: Membatalkan pesanan ini akan otomatis mengembalikan stok sebanyak {activeOrderModal.quantity} pcs ke SKU {activeOrderModal.product_sku} di Shopee, Tokopedia, dan TikTok Shop.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#ECEAE4]">
                  <button
                    type="button"
                    onClick={() => setActiveOrderModal(null)}
                    className="h-[38px] px-4 rounded-xl border border-[#ECEAE4] text-xs font-bold text-[#52524E] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={busyId === `ship-${activeOrderModal.id}`}
                    className="h-[38px] px-5 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer"
                  >
                    {busyId === `ship-${activeOrderModal.id}`
                      ? 'Menyimpan...'
                      : 'Simpan Resi & Update Marketplace'}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: PRINTABLE THERMAL SHIPPING LABEL PREVIEW */
              <div className="p-6 space-y-4">
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#141413] space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b-2 border-[#141413] pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-[#141413] text-[#FFFFFF] font-extrabold text-[10px]">
                        {activeOrderModal.marketplace.toUpperCase()}
                      </span>
                      <p className="font-mono-tabular text-sm font-extrabold text-[#141413] mt-1">
                        {activeOrderModal.order_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#52524E] block">
                        EKSPEDISI
                      </span>
                      <strong className="text-sm font-extrabold text-[#9A3408]">
                        {shipForm.courier || activeOrderModal.courier}
                      </strong>
                    </div>
                  </div>

                  {/* Simulated Barcode Strip */}
                  <div className="py-2.5 px-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-center space-y-1">
                    <div className="flex items-center justify-center gap-0.5 h-9">
                      {[2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 3, 4, 2, 1, 2].map(
                        (w, idx) => (
                          <div
                            key={idx}
                            style={{ width: `${w * 2}px` }}
                            className="h-full bg-[#141413]"
                          />
                        )
                      )}
                    </div>
                    <p className="font-mono-tabular text-xs font-extrabold tracking-widest text-[#141413]">
                      {shipForm.tracking_resi ||
                        activeOrderModal.tracking_resi ||
                        `SC-${activeOrderModal.id}99201`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-[#ECEAE4] pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#52524E]">
                        Penerima:
                      </span>
                      <p className="font-extrabold text-[#141413] mt-0.5">
                        {activeOrderModal.buyer_name}
                      </p>
                      <p className="font-mono-tabular text-[11px] text-[#141413]">
                        {shipForm.buyer_phone}
                      </p>
                      <p className="text-[11px] text-[#52524E] mt-0.5">
                        {shipForm.shipping_address}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#52524E]">
                        Pengirim:
                      </span>
                      <p className="font-extrabold text-[#141413] mt-0.5">
                        {store?.store_name || 'Toko Nusantara Official'}
                      </p>
                      <p className="text-[11px] text-[#52524E]">
                        Gudang Sunter, Jakarta Utara
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-bold text-[#141413] block">
                        {activeOrderModal.product_name}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#52524E]">
                        SKU: {activeOrderModal.product_sku}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-sm font-extrabold text-[#141413] px-2.5 py-1 rounded-lg bg-[#FFDECE]">
                      Qty: {activeOrderModal.quantity} pcs
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-[38px] px-5 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
                  >
                    Cetak Slip Label (Print)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: BUAT PESANAN BARU (CONNECTED TO POSTGRESQL PRODUCTS) */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-order-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#9A3408]">
                  Input Pesanan & Potong Stok Otomatis
                </span>
                <h2 id="create-order-modal-title" className="text-base font-extrabold text-[#141413]">
                  Buat Pesanan Baru ke Database
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Tutup modal buat pesanan"
                className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-[#141413] font-extrabold text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="co-mp" className="block text-xs font-bold text-[#141413]">
                    Channel Marketplace
                  </label>
                  <select
                    id="co-mp"
                    value={createForm.marketplace}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, marketplace: e.target.value }))
                    }
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="co-courier" className="block text-xs font-bold text-[#141413]">
                    Kurir Pengiriman
                  </label>
                  <select
                    id="co-courier"
                    value={createForm.courier}
                    onChange={(e) => setCreateForm((s) => ({ ...s, courier: e.target.value }))}
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="J&T Express">J&T Express</option>
                    <option value="JNE Reguler">JNE Reguler</option>
                    <option value="SiCepat BEST">SiCepat BEST</option>
                    <option value="Anteraja Reguler">Anteraja Reguler</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="co-prod" className="block text-xs font-bold text-[#141413]">
                    Pilih Produk dari Katalog Master
                  </label>
                  <select
                    id="co-prod"
                    value={createForm.product_id || (products[0]?.id ?? '')}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, product_id: Number(e.target.value) }))
                    }
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} • {p.name} (Stok: {p.stock} pcs • {formatRupiah(p.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="co-buyer" className="block text-xs font-bold text-[#141413]">
                    Nama Pembeli
                  </label>
                  <input
                    id="co-buyer"
                    type="text"
                    required
                    value={createForm.buyer_name}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, buyer_name: e.target.value }))
                    }
                    placeholder="Contoh: Raka Pratama"
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="co-qty" className="block text-xs font-bold text-[#141413]">
                      Jumlah (Qty)
                    </label>
                    <input
                      id="co-qty"
                      type="number"
                      min="1"
                      max="25"
                      required
                      value={createForm.quantity}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, quantity: Number(e.target.value) }))
                      }
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="co-phone" className="block text-xs font-bold text-[#141413]">
                      No. WhatsApp
                    </label>
                    <input
                      id="co-phone"
                      type="text"
                      value={createForm.buyer_phone}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, buyer_phone: e.target.value }))
                      }
                      className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular text-[#141413]"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="co-addr" className="block text-xs font-bold text-[#141413]">
                    Alamat Tujuan Pengiriman
                  </label>
                  <input
                    id="co-addr"
                    type="text"
                    required
                    value={createForm.shipping_address}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, shipping_address: e.target.value }))
                    }
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-[38px] px-4 rounded-xl border border-[#ECEAE4] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyId === 'create-order'}
                  className="h-[38px] px-5 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {busyId === 'create-order'
                    ? 'Memproses...'
                    : 'Buat Pesanan & Potong Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default SellerOrdersPage
