import React, { useEffect, useState } from 'react'
import { SellerHeader } from '../../components/seller/SellerHeader'
import { SellerSidebar } from '../../components/seller/SellerSidebar'
import { fetchAdminUsers, fetchCurrentUser } from '../../services/api/authApi'
import {
  connectSellerMarketplace,
  createSellerProduct,
  deleteSellerProduct,
  deleteSellerTeamMember,
  disconnectSellerMarketplace,
  fetchSellerOverview,
  inviteSellerTeamMember,
  simulateSellerMarketplaceWebhook,
  syncAllSellerProducts,
  syncSingleSellerMarketplace,
  triggerMarketplaceAction,
  updateSellerMarketplaceSettings,
  updateSellerOrderShipping,
  updateSellerProductStock,
  updateSellerStoreSettings,
  updateSellerTeamPermissions,
} from '../../services/api/sellerApi'
import { SellerDashboardPage } from '../seller/Dashboard'
import { SellerMarketplacePage } from '../seller/Marketplace'
import { SellerOrdersPage } from '../seller/Orders'
import { SellerProductsPage } from '../seller/Products'
import { SellerReportsPage } from '../seller/Reports'
import { SellerSettingsPage } from '../seller/Settings'
import { SellerSubscriptionPage } from '../seller/Subscription'
import { SellerTeamPage } from '../seller/Team'

const VALID_SELLER_TABS = [
  'dashboard',
  'marketplace',
  'products',
  'orders',
  'reports',
  'team',
  'subscription',
  'settings',
]

export function WorkspacePage({
  currentUser,
  activeSubRoute = 'dashboard',
  onSelectSubRoute,
  onUserUpdated,
  onLogout,
  onNavigate,
}) {
  const [overview, setOverview] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingState, setLoadingState] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [adminViewMode, setAdminViewMode] = useState('seller_preview')

  const activeTab = VALID_SELLER_TABS.includes(activeSubRoute) ? activeSubRoute : 'dashboard'
  const isSuperAdmin = currentUser?.role === 'super_admin'

  function showToast(msg) {
    setToastMsg(msg)
    window.clearTimeout(window.__synccartToastTimer)
    window.__synccartToastTimer = window.setTimeout(() => {
      setToastMsg('')
    }, 4200)
  }

  async function loadAllData() {
    if (!currentUser) return
    setLoadingState('loading')
    setErrorMsg('')
    try {
      const [freshProfile, sellerData] = await Promise.all([
        fetchCurrentUser(),
        fetchSellerOverview(),
      ])
      onUserUpdated(freshProfile)
      setOverview(sellerData)

      if (freshProfile.role === 'super_admin') {
        const usersList = await fetchAdminUsers()
        setAdminUsers(usersList || [])
      }
      setLoadingState('idle')
    } catch (err) {
      setLoadingState('error')
      setErrorMsg(err.message || 'Gagal memuat data dari server Go')
    }
  }

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role])

  async function handleSyncAllChannels() {
    setIsSyncing(true)
    try {
      await syncAllSellerProducts()
      const fresh = await fetchSellerOverview()
      setOverview(fresh)
      showToast('Seluruh stok produk berhasil disinkronkan ke Shopee, Tokopedia, & TikTok Shop.')
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleAdjustStock(productId, delta) {
    try {
      await updateSellerProductStock(productId, delta)
      const fresh = await fetchSellerOverview()
      setOverview(fresh)
      showToast(
        delta > 0
          ? `Stok produk ditambah +${delta} pcs & disinkronkan ke 3 toko.`
          : `Stok produk dikurangi ${delta} pcs & disinkronkan ke 3 toko.`
      )
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  async function handleCreateProduct(productInput) {
    const created = await createSellerProduct(productInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Produk ${created.sku} berhasil disimpan ke PostgreSQL & disinkronkan ke 3 toko.`)
  }

  async function handleDeleteProduct(productId) {
    await deleteSellerProduct(productId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Produk dihapus dari katalog.')
  }

  async function handleShipOrder(orderId, payload) {
    await updateSellerOrderShipping(orderId, payload)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Nomor resi dan status pengiriman berhasil disimpan ke PostgreSQL.')
  }

  async function handleMarketplaceAction(mpId, action) {
    await triggerMarketplaceAction(mpId, action)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Konfigurasi integrasi marketplace berhasil diperbarui di PostgreSQL.')
  }

  async function handleConnectMarketplace(mpId, oauthInput) {
    const updated = await connectSellerMarketplace(mpId, oauthInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`OAuth 2.0 ${updated.platform} berhasil dihubungkan & stok SKU disinkronkan.`)
  }

  async function handleDisconnectMarketplace(mpId) {
    const updated = await disconnectSellerMarketplace(mpId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Koneksi OAuth 2.0 ${updated.platform} diputuskan & dicatat di sync_logs.`)
  }

  async function handleSyncSingleMarketplace(mpId) {
    const updated = await syncSingleSellerMarketplace(mpId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Sinkronisasi stok ${updated.platform} selesai & dicatat di tabel sync_logs.`)
  }

  async function handleUpdateMarketplaceSettings(mpId, settingsInput) {
    const updated = await updateSellerMarketplaceSettings(mpId, settingsInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Pengaturan ${updated.platform} disimpan ke PostgreSQL.`)
  }

  async function handleSimulateWebhook(webhookInput) {
    await simulateSellerMarketplaceWebhook(webhookInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(
      webhookInput.event_type === 'stock_mismatch'
        ? `Webhook ${webhookInput.platform}: Selisih stok eksternal terdeteksi di PostgreSQL.`
        : `Webhook ${webhookInput.platform}: Pesanan baru masuk ke tabel orders & stok otomatis dipotong.`
    )
  }

  async function handleInviteMember(memberInput) {
    await inviteSellerTeamMember(memberInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Staf ${memberInput.full_name} berhasil ditambahkan ke tim.`)
  }

  async function handleUpdatePermissions(memberId, permissions, role) {
    await updateSellerTeamPermissions(memberId, permissions, role)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Hak akses RBAC berhasil diperbarui.')
  }

  async function handleDeleteMember(memberId) {
    await deleteSellerTeamMember(memberId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Anggota tim dihapus.')
  }

  async function handleUpdateStoreSettings(settingsInput) {
    await updateSellerStoreSettings(settingsInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Pengaturan toko & paket langganan disimpan ke PostgreSQL.')
  }

  if (!currentUser) {
    return (
      <section className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-lg text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F6671E] flex items-center justify-center text-white font-extrabold text-lg">
            S
          </div>
          <h1 className="text-2xl font-extrabold text-[#141413]">Sesi Login Diperlukan</h1>
          <p className="text-xs sm:text-sm text-[#52524E]">
            Silakan masuk menggunakan akun Seller (
            <strong className="text-[#141413]">seller@synccart.id</strong>) atau Super Admin untuk
            mengakses dashboard operasional.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F6671E] text-[#141413] font-extrabold text-xs cursor-pointer"
            >
              Masuk ke Akun SyncCart
            </button>
            <button
              type="button"
              onClick={() => onNavigate('beranda')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-[#141413] font-bold text-xs cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>
    )
  }

  const store = overview?.store || currentUser.stores?.[0] || {
    store_name: 'Toko Nusantara Official',
    plan: 'business',
    connected_channels: 'Shopee,Tokopedia,TikTok Shop',
  }
  const metrics = overview?.metrics || {}

  return (
    <div className="min-h-screen w-full bg-[#F7F6F3] text-[#141413] flex">
      {/* LEFT SELLER SIDEBAR (Sticky 100vh matching RentFlow reference) */}
      <SellerSidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setAdminViewMode('seller_preview')
          onSelectSubRoute(tabId)
        }}
        storePlan={store.plan || 'business'}
        needsResiCount={metrics.needs_resi_count || 0}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* RIGHT MAIN CONTENT COLUMN (100% Full Width Edge-to-Edge) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <SellerHeader
          currentUser={currentUser}
          store={store}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onSyncAll={handleSyncAllChannels}
          isSyncing={isSyncing}
          lowStockCount={metrics.low_stock_count || 0}
          needsResiCount={metrics.needs_resi_count || 0}
          onSelectTab={onSelectSubRoute}
          onReturnToLanding={() => onNavigate('beranda')}
          onSwitchAccount={() => onNavigate('auth')}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <div className="flex-1 w-full p-3.5 sm:p-4 space-y-4">
          {/* Super Admin Switcher Bar */}
          {isSuperAdmin && (
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#F6671E]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#F6671E] text-[#141413] font-extrabold uppercase">
                  Mode Super Admin
                </span>
                <span className="font-semibold text-[#52524E]">
                  Pantau akun pengguna PostgreSQL atau pratinjau Dashboard Seller.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('seller_preview')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                    adminViewMode === 'seller_preview'
                      ? 'bg-[#F6671E] text-[#141413]'
                      : 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
                  }`}
                >
                  Dashboard Seller
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('admin_table')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                    adminViewMode === 'admin_table'
                      ? 'bg-[#F6671E] text-[#141413]'
                      : 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
                  }`}
                >
                  Daftar Akun PostgreSQL ({adminUsers.length})
                </button>
              </div>
            </div>
          )}

          {/* Toast Feedback Banner */}
          {toastMsg && (
            <div
              role="status"
              className="p-3 rounded-xl bg-[#FFF6F0] border border-[#F6671E] text-xs font-extrabold text-[#141413] flex items-center justify-between"
            >
              <span>✓ {toastMsg}</span>
              <button
                type="button"
                onClick={() => setToastMsg('')}
                className="text-[#9A3408] font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Error State */}
          {loadingState === 'error' && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] text-xs space-y-2"
            >
              <p className="font-extrabold">Gagal menyinkronkan data dari server Go (PostgreSQL):</p>
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={loadAllData}
                className="px-3.5 py-1.5 rounded-xl bg-[#9B1C1C] text-white font-bold cursor-pointer"
              >
                Coba Muat Ulang
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loadingState === 'loading' && !overview ? (
            <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] text-center space-y-1.5">
              <p className="text-sm font-extrabold text-[#141413]">
                Memuat data Seller Workspace dari PostgreSQL (synccart)...
              </p>
              <p className="text-xs text-[#52524E]">
                Menyinkronkan katalog produk, pesanan, marketplace, dan anggota tim.
              </p>
            </div>
          ) : isSuperAdmin && adminViewMode === 'admin_table' ? (
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#141413]">
                    Seluruh Akun Pengguna di PostgreSQL ({adminUsers.length} Akun)
                  </h2>
                  <p className="text-xs text-[#52524E]">
                    Data langsung dari tabel users dan stores di database synccart
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="px-4 py-2 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
                >
                  + Registrasi Akun Baru
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-xs font-extrabold text-[#9A3408]">
                        ID #{u.id} • {u.role.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-bold">
                        {u.status}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-[#141413]">{u.full_name}</p>
                    <p className="font-mono-tabular text-xs text-[#52524E]">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <SellerDashboardPage
                  overview={overview}
                  globalSearch={globalSearch}
                  onAdjustStock={handleAdjustStock}
                  onShipOrder={handleShipOrder}
                  onSelectTab={onSelectSubRoute}
                />
              )}
              {activeTab === 'marketplace' && (
                <SellerMarketplacePage
                  marketplaces={overview?.marketplaces || []}
                  products={overview?.products || []}
                  onMarketplaceAction={handleMarketplaceAction}
                  onConnectMarketplace={handleConnectMarketplace}
                  onDisconnectMarketplace={handleDisconnectMarketplace}
                  onSyncSingleMarketplace={handleSyncSingleMarketplace}
                  onUpdateMarketplaceSettings={handleUpdateMarketplaceSettings}
                  onSimulateWebhook={handleSimulateWebhook}
                  onSyncAll={handleSyncAllChannels}
                  onSelectTab={onSelectSubRoute}
                  isSyncing={isSyncing}
                />
              )}
              {activeTab === 'products' && (
                <SellerProductsPage
                  products={overview?.products || []}
                  onCreateProduct={handleCreateProduct}
                  onAdjustStock={handleAdjustStock}
                  onSyncAll={handleSyncAllChannels}
                  onDeleteProduct={handleDeleteProduct}
                  isSyncing={isSyncing}
                />
              )}
              {activeTab === 'orders' && (
                <SellerOrdersPage
                  orders={overview?.orders || []}
                  onShipOrder={handleShipOrder}
                />
              )}
              {activeTab === 'reports' && <SellerReportsPage overview={overview} />}
              {activeTab === 'team' && (
                <SellerTeamPage
                  team={overview?.team || []}
                  onInviteMember={handleInviteMember}
                  onUpdatePermissions={handleUpdatePermissions}
                  onDeleteMember={handleDeleteMember}
                />
              )}
              {activeTab === 'subscription' && (
                <SellerSubscriptionPage
                  store={store}
                  onUpdateSettings={handleUpdateStoreSettings}
                />
              )}
              {activeTab === 'settings' && (
                <SellerSettingsPage
                  store={store}
                  currentUser={currentUser}
                  onUpdateSettings={handleUpdateStoreSettings}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
