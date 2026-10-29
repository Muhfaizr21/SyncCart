import React, { useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminRightRail from '../../components/admin/AdminRightRail'
import AdminInspectorModal from '../../components/admin/AdminInspectorModal'
import DashboardPage from './dashboard/DashboardPage'
import SellersPage from './sellers/SellersPage'
import AllProductsPage from './products/AllProductsPage'
import AllOrdersPage from './orders/AllOrdersPage'
import { SubscriptionsPage } from './subscriptions/SubscriptionsPage'
import { AnalyticsPage } from './analytics/AnalyticsPage'
import { UsersPage } from './users/UsersPage'
import { SystemLogsPage } from './logs/SystemLogsPage'
import { SettingsPage } from './settings/SettingsPage'
import {
  fetchAdminOverview,
  createAdminSeller,
  updateAdminSellerStatus,
  updateAdminSellerPlan,
  updateAdminSellerProfile,
  syncAdminSellerCatalog,
  deleteAdminSeller,
  executeAdminBulkAction,
  updateAdminUserRole,
  createAdminCoupon,
  deleteAdminCoupon,
  updateAdminSettings,
} from '../../services/api/admin'

function renderStatusCell(status) {
  const norm = String(status || '').toLowerCase()
  if (
    norm === 'completed' ||
    norm === 'paid' ||
    norm === 'shipped' ||
    norm === 'active' ||
    norm === 'synced' ||
    norm === 'connected' ||
    norm === 'success'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3F6E58]">
        <span>✓</span>
        <span className="capitalize">
          {norm === 'completed' || norm === 'shipped' ? 'Paid' : status}
        </span>
      </span>
    )
  }
  if (
    norm === 'cancelled' ||
    norm === 'suspended' ||
    norm === 'error' ||
    norm === 'conflict' ||
    norm === 'disconnected'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#D64545]">
        <span>✕</span>
        <span className="capitalize">{status}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#525A68]">
      <span>↺</span>
      <span className="capitalize">{status || 'Pending'}</span>
    </span>
  )
}

export default function AdminConsolePage({
  currentUser,
  onSwitchToSellerPreview,
  onLogout,
  onNavigateLanding,
  onRenewSession,
}) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [overview, setOverview] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [busyAction, setBusyAction] = useState(false)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [planFilter, setPlanFilter] = useState('ALL')

  // Multi-row checkbox selection & floating inspector
  const [selectedIds, setSelectedIds] = useState([])
  const [inspectedItem, setInspectedItem] = useState(null)

  // Modals for Create Store & Create Coupon
  const [showCreateSellerModal, setShowCreateSellerModal] = useState(false)
  const [newSellerForm, setNewSellerForm] = useState({
    full_name: '',
    email: '',
    store_name: '',
    business_category: 'Fashion & Apparel Omnichannel',
    plan: 'business',
    billing_cycle: 'annual',
    warehouse_city: 'Jakarta Selatan, DKI Jakarta',
  })

  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false)
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    description: '',
    discount_percent: 15,
    max_uses: 250,
    applicable_plans: 'starter,business,enterprise',
    expires_at: '31 Des 2026',
  })

  // Platform settings editable state
  const [settingsForm, setSettingsForm] = useState(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev))
    }, 3600)
  }

  const loadOverview = async (preserveInspector = true) => {
    setErrorMsg('')
    try {
      const data = await fetchAdminOverview()
      setOverview(data)
      if (data?.platform_settings) {
        setSettingsForm(data.platform_settings)
      }
      if (!preserveInspector && data?.sellers?.length > 0) {
        setInspectedItem({ type: 'seller', data: data.sellers[0] })
        setSelectedIds([data.sellers[0].id])
      } else if (preserveInspector && inspectedItem?.type === 'seller' && data?.sellers) {
        const updatedSeller = data.sellers.find((s) => s.id === inspectedItem.data?.id)
        if (updatedSeller) {
          setInspectedItem({ type: 'seller', data: updatedSeller })
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat data konsol SuperAdmin.')
    }
  }

  useEffect(() => {
    fetchAdminOverview()
      .then((data) => {
        setOverview(data)
        if (data?.platform_settings) {
          setSettingsForm(data.platform_settings)
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Gagal memuat data konsol SuperAdmin.')
      })
  }, [])

  const sellers = useMemo(() => overview?.sellers || [], [overview?.sellers])
  const orders = useMemo(() => overview?.orders || [], [overview?.orders])
  const products = useMemo(() => overview?.products || [], [overview?.products])
  const invoices = overview?.invoices || []
  const coupons = overview?.coupons || []
  const users = overview?.users || []
  const syncLogs = overview?.sync_logs || []
  const marketplaces = overview?.marketplaces || []
  const summary = overview?.summary || {}

  // Store name lookup map
  const storeNameById = useMemo(() => {
    const map = {}
    sellers.forEach((s) => {
      map[s.id] = s.store_name
    })
    return map
  }, [sellers])

  // Clear selection when switching tabs
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    setSelectedIds([])
    if (tabId === 'orders' && orders.length > 0) {
      setInspectedItem({ type: 'order', data: orders[0] })
    } else if (tabId === 'sellers' && sellers.length > 0) {
      setInspectedItem({ type: 'seller', data: sellers[0] })
    } else if (tabId === 'products' && products.length > 0) {
      setInspectedItem({ type: 'product', data: products[0] })
    } else {
      setInspectedItem(null)
    }
  }

  // Filtered datasets
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const match =
          String(o.order_number || '').toLowerCase().includes(q) ||
          String(o.buyer_name || '').toLowerCase().includes(q) ||
          String(o.product_name || '').toLowerCase().includes(q) ||
          String(o.marketplace || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (channelFilter !== 'ALL' && o.marketplace !== channelFilter) return false
      if (statusFilter !== 'ALL') {
        const norm = String(o.status || '').toLowerCase()
        if (statusFilter === 'PAID' && norm !== 'completed' && norm !== 'shipped') return false
        if (statusFilter === 'PENDING' && norm !== 'perlu resi' && norm !== 'pending') return false
        if (statusFilter === 'CANCELLED' && norm !== 'cancelled') return false
      }
      return true
    })
  }, [orders, searchQuery, channelFilter, statusFilter])

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const match =
          String(s.store_name || '').toLowerCase().includes(q) ||
          String(s.owner_name || '').toLowerCase().includes(q) ||
          String(s.owner_email || '').toLowerCase().includes(q) ||
          String(s.warehouse_city || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (planFilter !== 'ALL' && s.plan !== planFilter) return false
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PAID' && s.status !== 'active') return false
        if (statusFilter === 'CANCELLED' && s.status !== 'suspended') return false
      }
      return true
    })
  }, [sellers, searchQuery, planFilter, statusFilter])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const match =
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.sku || '').toLowerCase().includes(q) ||
          String(p.warehouse || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter === 'CANCELLED' && p.sync_status !== 'conflict') return false
      if (statusFilter === 'PAID' && p.sync_status !== 'synced') return false
      return true
    })
  }, [products, searchQuery, statusFilter])

  const toggleRowSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = (items) => {
    const allIds = items.map((i) => i.id)
    if (selectedIds.length === allIds.length && allIds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(allIds)
    }
  }

  // Export CSV helper
  const handleExportCSV = (customItems) => {
    const source =
      customItems ||
      (activeTab === 'orders'
        ? filteredOrders
        : activeTab === 'products'
        ? filteredProducts
        : filteredSellers)
    if (!source || source.length === 0) {
      showToast('Tidak ada baris data untuk diekspor.')
      return
    }
    const headers = Object.keys(source[0]).filter(
      (k) => typeof source[0][k] !== 'object'
    )
    const csvRows = [
      headers.join(','),
      ...source.map((row) =>
        headers
          .map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `synccart-superadmin-${activeTab}-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Berhasil mengekspor ${source.length} baris data ke CSV.`)
  }

  // Print helper
  const handlePrintSelection = (singleItem) => {
    const title = singleItem
      ? `Ringkasan Audit SuperAdmin: ${singleItem.order_number || singleItem.store_name || singleItem.sku}`
      : `Laporan Konsol SuperAdmin SyncCart (${activeTab.toUpperCase()})`
    showToast(`Dokumen "${title}" siap dicetak.`)
    window.print()
  }

  // Mutations
  const handleToggleSellerStatus = async (storeId, nextStatus) => {
    setBusyAction(true)
    try {
      await updateAdminSellerStatus(storeId, nextStatus)
      await loadOverview(true)
      setInspectedItem((prev) =>
        prev && prev.type === 'seller' && prev.data.id === storeId
          ? { ...prev, data: { ...prev.data, status: nextStatus } }
          : prev
      )
      showToast(
        `Status toko #${storeId} berhasil diperbarui menjadi ${nextStatus.toUpperCase()}.`
      )
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleChangeSellerPlan = async (storeId, { plan, billingCycle }) => {
    setBusyAction(true)
    try {
      await updateAdminSellerPlan(storeId, { plan, billingCycle })
      await loadOverview(true)
      setInspectedItem((prev) =>
        prev && prev.type === 'seller' && prev.data.id === storeId
          ? { ...prev, data: { ...prev.data, plan, billing_cycle: billingCycle } }
          : prev
      )
      showToast(`Paket langganan toko #${storeId} diubah ke ${plan.toUpperCase()}.`)
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleUpdateSellerProfile = async (storeId, payload) => {
    setBusyAction(true)
    try {
      await updateAdminSellerProfile(storeId, payload)
      await loadOverview(true)
      showToast(`Profil & konfigurasi toko #${storeId} berhasil diperbarui.`)
      return true
    } catch (err) {
      showToast(err.message)
      return false
    } finally {
      setBusyAction(false)
    }
  }

  const handleSyncSellerCatalog = async (storeId) => {
    setBusyAction(true)
    try {
      const res = await syncAdminSellerCatalog(storeId)
      await loadOverview(true)
      showToast(
        res?.message ||
          `Sinkronisasi katalog & stok toko #${storeId} lintas 3 marketplace berhasil.`
      )
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleDeleteSeller = async (storeId) => {
    setBusyAction(true)
    try {
      await deleteAdminSeller(storeId)
      setInspectedItem(null)
      await loadOverview(true)
      showToast(`Toko #${storeId} berhasil dihapus dari ekosistem.`)
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleCreateSellerSubmit = async (e) => {
    e.preventDefault()
    setBusyAction(true)
    try {
      await createAdminSeller(newSellerForm)
      setShowCreateSellerModal(false)
      setNewSellerForm({
        full_name: '',
        email: '',
        store_name: '',
        business_category: 'Fashion & Apparel Omnichannel',
        plan: 'business',
        billing_cycle: 'annual',
        warehouse_city: 'Jakarta Selatan, DKI Jakarta',
      })
      await loadOverview(true)
      showToast('Toko & akun Seller baru berhasil ditambahkan.')
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleBulkActionExecute = async (action, overrideIds, overrideTarget) => {
    const idsToRun = overrideIds || selectedIds
    if (idsToRun.length === 0) return
    setBusyAction(true)
    try {
      const targetType =
        overrideTarget ||
        (activeTab === 'orders'
          ? 'orders'
          : activeTab === 'products'
          ? 'products'
          : 'sellers')
      await executeAdminBulkAction({
        targetType,
        ids: idsToRun,
        action,
      })
      await loadOverview(true)
      showToast(
        `Aksi massal (${action}) berhasil dijalankan pada ${idsToRun.length} baris.`
      )
      if (!overrideIds) {
        setSelectedIds([])
      }
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleResolveAllConflicts = async () => {
    const conflictIds = products
      .filter((p) => p.sync_status === 'conflict')
      .map((p) => p.id)
    if (conflictIds.length === 0) {
      showToast('Seluruh stok SKU sudah tersinkronisasi.')
      return
    }
    setBusyAction(true)
    try {
      await executeAdminBulkAction({
        targetType: 'products',
        ids: conflictIds,
        action: 'resolve_conflict',
      })
      await loadOverview(true)
      showToast(
        `Rekonsiliasi stok otomatis berhasil menyamakan ${conflictIds.length} SKU konflik di 3 marketplace.`
      )
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleChangeUserRole = async (userId, nextRole) => {
    setBusyAction(true)
    try {
      await updateAdminUserRole(userId, nextRole)
      await loadOverview(true)
      showToast(`Otoritas pengguna #${userId} diperbarui ke ${nextRole}.`)
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault()
    setBusyAction(true)
    try {
      await createAdminCoupon({
        ...newCouponForm,
        discount_percent: Number(newCouponForm.discount_percent || 10),
        max_uses: Number(newCouponForm.max_uses || 100),
      })
      setShowCreateCouponModal(false)
      setNewCouponForm({
        code: '',
        description: '',
        discount_percent: 15,
        max_uses: 250,
        applicable_plans: 'starter,business,enterprise',
        expires_at: '31 Des 2026',
      })
      await loadOverview(true)
      showToast('Kupon promo platform baru berhasil diterbitkan.')
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    setBusyAction(true)
    try {
      await deleteAdminCoupon(couponId)
      await loadOverview(true)
      showToast('Kupon promo berhasil dihapus.')
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const handleSavePlatformSettings = async (e) => {
    e.preventDefault()
    if (!settingsForm) return
    setBusyAction(true)
    try {
      const updated = await updateAdminSettings({
        ...settingsForm,
        default_trial_days: Number(settingsForm.default_trial_days || 14),
        webhook_rate_limit_per_min: Number(settingsForm.webhook_rate_limit_per_min || 1200),
        max_concurrent_sync_workers: Number(settingsForm.max_concurrent_sync_workers || 16),
      })
      setSettingsForm(updated)
      await loadOverview(true)
      showToast('Konfigurasi global platform berhasil disimpan.')
    } catch (err) {
      showToast(err.message)
    } finally {
      setBusyAction(false)
    }
  }

  const pageTitleMap = {
    dashboard: 'Admin Dashboard',
    sellers: 'Sellers Management',
    products: 'All Products & Stock Sync',
    orders: 'All Orders (Omnichannel)',
    subscriptions: 'Subscriptions, Revenue & Coupons',
    analytics: 'Platform Growth & Channel Analytics',
    users: 'Users & RBAC Governance',
    logs: 'System Logs & Alerts',
    settings: 'Platform Settings & API Keys',
  }

  const alertBadgeCount =
    Number(summary.conflict_products || 0) + Number(summary.pending_orders || 0) || 5

  // Only show Right Rail on Orders tab (matching Mate Orders reference), keeping Dashboard & Sellers 100% full-width without PLATFORM REVENUE right rail
  const showRightRail = activeTab === 'orders'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#11141A] p-2.5 font-sans text-[#14181F]">
      {/* Left Dark Obsidian Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notificationCount={alertBadgeCount}
        currentUser={currentUser}
        onSwitchToSellerPreview={onSwitchToSellerPreview}
        onLogout={onLogout}
        onNavigateLanding={onNavigateLanding}
      />

      {/* Main White Rounded Surface */}
      <div className="relative flex flex-1 overflow-hidden rounded-[22px] bg-white shadow-2xl">
        {/* Toast Banner */}
        {toastMsg && (
          <div className="fixed top-6 right-8 z-50 flex items-center gap-2.5 rounded-xl bg-[#14181F] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-xl border border-[#2C3342]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Center High-Density Workspace */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-white">
          {/* Top Title & Action Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 px-8 pt-7 pb-4">
            <div>
              <h1 className="text-[27px] font-bold tracking-tight text-[#14181F]">
                {pageTitleMap[activeTab] || 'Admin Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              {activeTab === 'subscriptions' ? (
                <button
                  type="button"
                  onClick={() => setShowCreateCouponModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#252C38] transition"
                >
                  <span>+</span>
                  <span>Buat Kupon Promo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateSellerModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#252C38] transition"
                >
                  <span>+</span>
                  <span>Tambah Seller / Toko</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleExportCSV()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE0E8] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#14181F] hover:bg-[#F7F8FA] transition"
              >
                <span>↑</span>
                <span>Export</span>
              </button>
            </div>
          </header>

          {/* Error Banner with 1-Click Session Renewal */}
          {errorMsg && (
            <div className="mx-8 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-[12.5px] text-[#842029]">
              <div>
                <p className="font-bold">Gagal memuat data konsol SuperAdmin:</p>
                <p>{errorMsg}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadOverview(true)}
                  className="rounded-lg bg-[#842029] px-3 py-1.5 text-[11.5px] font-semibold text-white"
                >
                  Coba Muat Ulang
                </button>
                {onRenewSession && (
                  <button
                    type="button"
                    onClick={onRenewSession}
                    className="rounded-lg bg-[#14181F] px-3 py-1.5 text-[11.5px] font-semibold text-white"
                  >
                    Perbarui Sesi Login
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Pill Bar for Dashboard, Orders, Products (Sellers has its own richer filter bar inside SellersPage) */}
          {(activeTab === 'dashboard' ||
            activeTab === 'orders' ||
            activeTab === 'products') && (
            <div className="flex flex-wrap items-center gap-2 px-8 pb-4">
              {activeTab === 'dashboard' && (
                <button
                  type="button"
                  onClick={() =>
                    setPlanFilter((prev) =>
                      prev === 'ALL'
                        ? 'enterprise'
                        : prev === 'enterprise'
                        ? 'business'
                        : prev === 'business'
                        ? 'starter'
                        : 'ALL'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#14181F] px-3.5 py-1.5 text-[12px] font-semibold text-white transition"
                >
                  <span>
                    Plan{' '}
                    <span className="text-[#9CA3AF]">
                      {planFilter === 'ALL' ? '3' : planFilter.toUpperCase()}
                    </span>
                  </span>
                  <span className="text-[10px]">⌄</span>
                </button>
              )}

              {activeTab === 'orders' && (
                <button
                  type="button"
                  onClick={() =>
                    setChannelFilter((prev) =>
                      prev === 'ALL'
                        ? 'Shopee'
                        : prev === 'Shopee'
                        ? 'Tokopedia'
                        : prev === 'Tokopedia'
                        ? 'TikTok Shop'
                        : 'ALL'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#14181F] px-3.5 py-1.5 text-[12px] font-semibold text-white transition"
                >
                  <span>
                    Channel{' '}
                    <span className="text-[#9CA3AF]">
                      {channelFilter === 'ALL' ? '3' : channelFilter}
                    </span>
                  </span>
                  <span className="text-[10px]">⌄</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setStatusFilter((prev) =>
                    prev === 'ALL'
                      ? 'PAID'
                      : prev === 'PAID'
                      ? 'PENDING'
                      : prev === 'PENDING'
                      ? 'CANCELLED'
                      : 'ALL'
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  statusFilter !== 'ALL'
                    ? 'bg-[#14181F] text-white'
                    : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                }`}
              >
                <span>Status {statusFilter !== 'ALL' ? `(${statusFilter})` : ''}</span>
                <span className="text-[10px]">⌄</span>
              </button>

              <button
                type="button"
                onClick={() => loadOverview(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-[12px] font-semibold text-[#374151] hover:bg-[#E5E7EB] transition"
              >
                <span>Date range</span>
                <span className="text-[10px]">⌄</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChannelFilter('ALL')
                  setStatusFilter('ALL')
                  setPlanFilter('ALL')
                  setSearchQuery('')
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-[12px] font-semibold text-[#374151] hover:bg-[#E5E7EB] transition"
              >
                <span>All filters</span>
                <span className="text-[10px]">⌄</span>
              </button>
            </div>
          )}

          {/* Scrollable Feature Content Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-24">
            {/* FEATURE 1: dashboard/DashboardPage.jsx (5W1H Executive Intelligence) */}
            {activeTab === 'dashboard' && (
              <DashboardPage
                summary={summary}
                sellers={sellers}
                filteredSellers={filteredSellers}
                orders={orders}
                products={products}
                marketplaces={marketplaces}
                coupons={coupons}
                selectedIds={selectedIds}
                inspectedItem={inspectedItem}
                onToggleSelectAll={toggleSelectAll}
                onToggleRowSelection={toggleRowSelection}
                onInspectSeller={(st) => setInspectedItem({ type: 'seller', data: st })}
                onSelectTab={handleSelectTab}
                onResolveAllConflicts={handleResolveAllConflicts}
                onOpenCreateCoupon={() => setShowCreateCouponModal(true)}
                onExportCSV={() => handleExportCSV(filteredSellers)}
                busyAction={busyAction}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 2: sellers/SellersPage.jsx (Full-Width Seller Governance without Platform Revenue Rail) */}
            {activeTab === 'sellers' && (
              <SellersPage
                sellers={sellers}
                filteredSellers={filteredSellers}
                selectedIds={selectedIds}
                inspectedItem={inspectedItem}
                planFilter={planFilter}
                statusFilter={statusFilter}
                onChangePlanFilter={() =>
                  setPlanFilter((prev) =>
                    prev === 'ALL'
                      ? 'enterprise'
                      : prev === 'enterprise'
                      ? 'business'
                      : prev === 'business'
                      ? 'starter'
                      : 'ALL'
                  )
                }
                onChangeStatusFilter={() =>
                  setStatusFilter((prev) =>
                    prev === 'ALL' ? 'PAID' : prev === 'PAID' ? 'CANCELLED' : 'ALL'
                  )
                }
                onResetFilters={() => {
                  setPlanFilter('ALL')
                  setStatusFilter('ALL')
                  setSearchQuery('')
                }}
                onToggleSelectAll={toggleSelectAll}
                onToggleRowSelection={toggleRowSelection}
                onInspectSeller={(st) => setInspectedItem({ type: 'seller', data: st })}
                onChangeSellerPlan={handleChangeSellerPlan}
                onToggleSellerStatus={handleToggleSellerStatus}
                onUpdateSellerProfile={handleUpdateSellerProfile}
                onSyncSellerCatalog={handleSyncSellerCatalog}
                onDeleteSeller={handleDeleteSeller}
                busyAction={busyAction}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 3: products/AllProductsPage.jsx */}
            {activeTab === 'products' && (
              <AllProductsPage
                filteredProducts={filteredProducts}
                selectedIds={selectedIds}
                storeNameById={storeNameById}
                onToggleSelectAll={toggleSelectAll}
                onToggleRowSelection={toggleRowSelection}
                onInspectProduct={(prod) => setInspectedItem({ type: 'product', data: prod })}
                onResolveConflict={(prodId) =>
                  handleBulkActionExecute('resolve_conflict', [prodId], 'products')
                }
                busyAction={busyAction}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 4: orders/AllOrdersPage.jsx */}
            {activeTab === 'orders' && (
              <AllOrdersPage
                filteredOrders={filteredOrders}
                selectedIds={selectedIds}
                inspectedItem={inspectedItem}
                storeNameById={storeNameById}
                onToggleSelectAll={toggleSelectAll}
                onToggleRowSelection={toggleRowSelection}
                onInspectOrder={(ord) => setInspectedItem({ type: 'order', data: ord })}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 5: subscriptions/SubscriptionsPage.jsx */}
            {activeTab === 'subscriptions' && (
              <SubscriptionsPage
                coupons={coupons}
                invoices={invoices}
                storeNameById={storeNameById}
                onDeleteCoupon={handleDeleteCoupon}
                onOpenCreateCoupon={() => setShowCreateCouponModal(true)}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 6: analytics/AnalyticsPage.jsx */}
            {activeTab === 'analytics' && (
              <AnalyticsPage
                summary={summary}
                orders={orders}
                marketplaces={marketplaces}
                storeNameById={storeNameById}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 7: users/UsersPage.jsx */}
            {activeTab === 'users' && (
              <UsersPage
                users={users}
                busyAction={busyAction}
                onChangeUserRole={handleChangeUserRole}
              />
            )}

            {/* FEATURE 8: logs/SystemLogsPage.jsx */}
            {activeTab === 'logs' && (
              <SystemLogsPage
                syncLogs={syncLogs}
                renderStatusCell={renderStatusCell}
              />
            )}

            {/* FEATURE 9: settings/SettingsPage.jsx */}
            {activeTab === 'settings' && (
              <SettingsPage
                settingsForm={settingsForm}
                setSettingsForm={setSettingsForm}
                onSavePlatformSettings={handleSavePlatformSettings}
                busyAction={busyAction}
              />
            )}
          </div>

          {/* Floating Dark Bottom Bulk-Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14181F] text-white shadow-xl hover:bg-[#252C38] transition"
              >
                ✕
              </button>
              <div className="flex items-center gap-4 rounded-xl bg-[#14181F] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-xl">
                <span className="text-[#9CA3AF]">
                  Selected: <strong className="text-white">{selectedIds.length}</strong>
                </span>
                <span className="h-3.5 w-[1px] bg-[#2E3545]" />
                <button
                  type="button"
                  onClick={() => handleExportCSV()}
                  className="flex items-center gap-1.5 hover:text-[#10B981] transition"
                >
                  <span>↑</span>
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintSelection()}
                  className="flex items-center gap-1.5 hover:text-[#10B981] transition"
                >
                  <span>⎙</span>
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() =>
                    handleBulkActionExecute(
                      activeTab === 'orders'
                        ? 'mark_shipped'
                        : activeTab === 'products'
                        ? 'resolve_conflict'
                        : 'activate'
                    )
                  }
                  className="flex items-center gap-1.5 hover:text-[#10B981] transition"
                >
                  <span>❐</span>
                  <span>
                    {activeTab === 'orders'
                      ? 'Mark Paid/Shipped'
                      : activeTab === 'products'
                      ? 'Resolve Conflict'
                      : 'Activate Sellers'}
                  </span>
                </button>
                <span className="h-3.5 w-[1px] bg-[#2E3545]" />
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() =>
                    handleBulkActionExecute(
                      activeTab === 'orders' ? 'mark_completed' : 'suspend'
                    )
                  }
                  className="text-[#9CA3AF] hover:text-white transition"
                >
                  •••
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Floating Dark-Header Inspector Card */}
        <AdminInspectorModal
          inspectedItem={inspectedItem}
          onClose={() => setInspectedItem(null)}
          onToggleSellerStatus={handleToggleSellerStatus}
          onChangeSellerPlan={handleChangeSellerPlan}
          onSyncSellerCatalog={handleSyncSellerCatalog}
          onDeleteSeller={handleDeleteSeller}
          onExportItem={(item) => handleExportCSV([item])}
          onPrintItem={(item) => handlePrintSelection(item)}
          busyAction={busyAction}
          hasRightRail={showRightRail}
        />

        {/* Right Telemetry Rail (Rendered only on Orders tab for RECEIPT OF GOODS) */}
        {showRightRail && (
          <AdminRightRail
            summary={summary}
            sellers={sellers}
            marketplaces={marketplaces}
            onInspectSeller={(seller) => setInspectedItem({ type: 'seller', data: seller })}
          />
        )}
      </div>

      {/* Modal: + Tambah Toko / Seller Baru */}
      {showCreateSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECEEF2] pb-3">
              <h3 className="text-[16px] font-bold text-[#14181F]">
                Tambah Toko & Akun Seller Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateSellerModal(false)}
                className="text-[#8C94A4] hover:text-[#14181F]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSellerSubmit} className="mt-4 space-y-3.5 text-[13px]">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#525A68]">
                  Nama Toko Flagship
                </label>
                <input
                  type="text"
                  required
                  value={newSellerForm.store_name}
                  onChange={(e) =>
                    setNewSellerForm({ ...newSellerForm, store_name: e.target.value })
                  }
                  placeholder="Contoh: Kopi Kenangan Official"
                  className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Nama Pemilik (Owner)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSellerForm.full_name}
                    onChange={(e) =>
                      setNewSellerForm({ ...newSellerForm, full_name: e.target.value })
                    }
                    placeholder="Dimas Prasetyo"
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Email Login Seller
                  </label>
                  <input
                    type="email"
                    required
                    value={newSellerForm.email}
                    onChange={(e) =>
                      setNewSellerForm({ ...newSellerForm, email: e.target.value })
                    }
                    placeholder="owner@brand.id"
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Paket Langganan
                  </label>
                  <select
                    value={newSellerForm.plan}
                    onChange={(e) =>
                      setNewSellerForm({ ...newSellerForm, plan: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  >
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Kota Gudang Utama
                  </label>
                  <input
                    type="text"
                    value={newSellerForm.warehouse_city}
                    onChange={(e) =>
                      setNewSellerForm({ ...newSellerForm, warehouse_city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSellerModal(false)}
                  className="rounded-lg border border-[#DCE0E8] px-4 py-2 text-[12px] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="rounded-lg bg-[#14181F] px-4 py-2 text-[12px] font-semibold text-white"
                >
                  Simpan & Aktifkan Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: + Buat Kupon Promo */}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECEEF2] pb-3">
              <h3 className="text-[16px] font-bold text-[#14181F]">
                Terbitkan Kupon Promo Langganan
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateCouponModal(false)}
                className="text-[#8C94A4] hover:text-[#14181F]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCouponSubmit} className="mt-4 space-y-3.5 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Kode Kupon
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponForm.code}
                    onChange={(e) =>
                      setNewCouponForm({
                        ...newCouponForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="PROMO25"
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#525A68]">
                    Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponForm.discount_percent}
                    onChange={(e) =>
                      setNewCouponForm({
                        ...newCouponForm,
                        discount_percent: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#525A68]">
                  Deskripsi Program Promo
                </label>
                <input
                  type="text"
                  required
                  value={newCouponForm.description}
                  onChange={(e) =>
                    setNewCouponForm({ ...newCouponForm, description: e.target.value })
                  }
                  placeholder="Potongan khusus kampanye Harbolnas"
                  className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCouponModal(false)}
                  className="rounded-lg border border-[#DCE0E8] px-4 py-2 text-[12px] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="rounded-lg bg-[#14181F] px-4 py-2 text-[12px] font-semibold text-white"
                >
                  Terbitkan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
