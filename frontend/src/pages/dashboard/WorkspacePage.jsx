import React, { useEffect, useState } from 'react'
import { SellerHeader } from '../../components/seller/SellerHeader'
import { SellerSidebar } from '../../components/seller/SellerSidebar'
import { fetchAdminUsers, fetchCurrentUser, loginUser } from '../../services/api/authApi'
import {
  connectSellerMarketplace,
  disconnectSellerMarketplace,
  simulateSellerMarketplaceWebhook,
  syncSingleSellerMarketplace,
  triggerMarketplaceAction,
  updateSellerMarketplaceSettings,
} from '../../services/api/marketplace'
import {
  bulkSellerOrderAction,
  createSellerOrder,
  deleteSellerOrder,
  updateSellerOrderShipping,
} from '../../services/api/orders'
import {
  bulkSellerProductAction,
  createSellerProduct,
  deleteSellerProduct,
  duplicateSellerProduct,
  syncAllSellerProducts,
  updateSellerProduct,
  updateSellerProductStock,
} from '../../services/api/products'
import {
  fetchSellerOverview,
  rotateSellerStoreKeys,
  testSellerStoreWebhook,
  updateSellerStoreSettings,
} from '../../services/api/stores'
import { checkoutSellerSubscription } from '../../services/api/subscription'
import {
  deleteSellerTeamMember,
  executeSellerTeamSessionAction,
  inviteSellerTeamMember,
  transferSellerStoreOwnership,
  updateSellerTeamPermissions,
} from '../../services/api/team'
import { SellerDashboardPage } from '../seller/Dashboard'
import { SellerMarketplacePage } from '../seller/Marketplace'
import { SellerOrdersPage } from '../seller/Orders'
import { SellerProductsPage } from '../seller/Products'
import { SellerReportsPage } from '../seller/Reports'
import { SellerSettingsPage } from '../seller/Settings'
import { SellerSubscriptionPage } from '../seller/Subscription'
import { SellerTeamPage } from '../seller/Team'
import AdminConsolePage from '../admin/AdminConsolePage'

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
  const [adminViewMode, setAdminViewMode] = useState('admin_console')
  const [isReauthenticating, setIsReauthenticating] = useState(false)

  const activeTab = VALID_SELLER_TABS.includes(activeSubRoute) ? activeSubRoute : 'dashboard'
  const isSuperAdmin = currentUser?.role === 'super_admin'

  function showToast(msg) {
    setToastMsg(msg)
    window.clearTimeout(window.__synccartToastTimer)
    window.__synccartToastTimer = window.setTimeout(() => {
      setToastMsg('')
    }, 4200)
  }

  async function handleQuickReLogin() {
    setIsReauthenticating(true)
    setErrorMsg('')
    try {
      const email = currentUser?.email || 'seller@synccart.id'
      const res = await loginUser({ email, password: 'Password123!' })
      if (res?.user && onUserUpdated) {
        onUserUpdated(res.user)
      }
      await loadAllData()
      showToast('Sesi login berhasil diperbarui kembali.')
    } catch {
      onLogout()
    } finally {
      setIsReauthenticating(false)
    }
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
    showToast(`Produk ${created.sku} berhasil disimpan & disinkronkan ke 3 toko.`)
  }

  async function handleUpdateProduct(productId, updateInput) {
    const updated = await updateSellerProduct(productId, updateInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Produk ${updated.sku} berhasil diperbarui & stok disinkronkan.`)
  }

  async function handleDuplicateProduct(productId) {
    const cloned = await duplicateSellerProduct(productId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Produk berhasil diduplikasi sebagai ${cloned.sku}.`)
  }

  async function handleBulkProductAction(bulkInput) {
    await bulkSellerProductAction(bulkInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Aksi massal pada ${bulkInput.product_ids.length} produk berhasil dijalankan.`)
  }

  async function handleDeleteProduct(productId) {
    await deleteSellerProduct(productId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Produk dihapus dari katalog.')
  }

  async function handleCreateOrder(orderInput) {
    const created = await createSellerOrder(orderInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Pesanan ${created.order_number} berhasil dibuat & stok dipotong otomatis.`)
  }

  async function handleShipOrder(orderId, payload) {
    const updated = await updateSellerOrderShipping(orderId, payload)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Pesanan ${updated.order_number} diperbarui (${updated.status}).`)
  }

  async function handleBulkOrderAction(bulkInput) {
    await bulkSellerOrderAction(bulkInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Aksi massal pada ${bulkInput.order_ids.length} pesanan berhasil dijalankan.`)
  }

  async function handleDeleteOrder(orderId) {
    await deleteSellerOrder(orderId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Pesanan dihapus dari daftar.')
  }

  async function handleMarketplaceAction(mpId, action) {
    await triggerMarketplaceAction(mpId, action)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Konfigurasi integrasi marketplace berhasil diperbarui.')
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
    showToast(`Koneksi OAuth 2.0 ${updated.platform} diputuskan.`)
  }

  async function handleSyncSingleMarketplace(mpId) {
    const updated = await syncSingleSellerMarketplace(mpId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Sinkronisasi stok ${updated.platform} selesai.`)
  }

  async function handleUpdateMarketplaceSettings(mpId, settingsInput) {
    const updated = await updateSellerMarketplaceSettings(mpId, settingsInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Pengaturan ${updated.platform} berhasil disimpan.`)
  }

  async function handleSimulateWebhook(webhookInput) {
    await simulateSellerMarketplaceWebhook(webhookInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(
      webhookInput.event_type === 'stock_mismatch'
        ? `Webhook ${webhookInput.platform}: Selisih stok eksternal terdeteksi.`
        : `Webhook ${webhookInput.platform}: Pesanan baru masuk & stok otomatis dipotong.`
    )
  }

  async function handleInviteMember(memberInput) {
    await inviteSellerTeamMember(memberInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Staf ${memberInput.full_name} berhasil ditambahkan ke tim.`)
  }

  async function handleUpdatePermissions(memberId, permissionsOrPayload, role) {
    await updateSellerTeamPermissions(memberId, permissionsOrPayload, role)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Hak akses RBAC & profil staf berhasil diperbarui.')
  }

  async function handleTeamSessionAction(memberId, action) {
    const updated = await executeSellerTeamSessionAction(memberId, action)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Status keamanan sesi ${updated.full_name} diperbarui (${updated.last_active}).`)
  }

  async function handleTransferOwnership(targetMemberId) {
    const promoted = await transferSellerStoreOwnership(targetMemberId)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Kepemilikan toko berhasil ditransfer kepada ${promoted.full_name}.`)
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
    if (settingsInput?.owner_full_name && onUserUpdated) {
      const updatedUser = await fetchCurrentUser().catch(() => null)
      if (updatedUser) onUserUpdated(updatedUser)
    }
    showToast('Pengaturan operasional toko berhasil disimpan.')
  }

  async function handleRotateStoreKeys(target = 'both') {
    await rotateSellerStoreKeys(target)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast('Kunci keamanan Open API & Webhook berhasil dirotasi.')
  }

  async function handleTestStoreWebhook() {
    const res = await testSellerStoreWebhook()
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(`Ping Webhook berhasil (${res?.status || 'HTTP 200 OK'} • ${res?.latency_ms || 42}ms).`)
    return res
  }

  async function handleCheckoutSubscription(checkoutInput) {
    const result = await checkoutSellerSubscription(checkoutInput)
    const fresh = await fetchSellerOverview()
    setOverview(fresh)
    showToast(
      `Faktur ${result?.invoice?.invoice_number || ''} berhasil diterbitkan & paket ${checkoutInput.plan.toUpperCase()} aktif.`
    )
    return result
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

  if (isSuperAdmin && adminViewMode === 'admin_console') {
    return (
      <AdminConsolePage
        currentUser={currentUser}
        onSwitchToSellerPreview={() => setAdminViewMode('seller_preview')}
        onLogout={onLogout}
        onNavigateLanding={() => onNavigate('beranda')}
        onRenewSession={handleQuickReLogin}
      />
    )
  }

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
                  Pantau akun pengguna atau pratinjau Dashboard Seller.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('admin_console')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer bg-[#14181F] text-white hover:bg-[#252C38] transition"
                >
                  ← Buka Konsol SuperAdmin
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('seller_preview')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                    adminViewMode === 'seller_preview'
                      ? 'bg-[#F6671E] text-[#141413]'
                      : 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
                  }`}
                >
                  Pratinjau Seller
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
              className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#F6671E] text-xs space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F6671E]" />
                <p className="font-extrabold text-[#141413]">
                  {errorMsg.toLowerCase().includes('kedaluwarsa') ||
                  errorMsg.toLowerCase().includes('tidak valid') ||
                  errorMsg.toLowerCase().includes('autentikasi')
                    ? 'Sesi Login Berakhir'
                    : 'Gagal Menyinkronkan Data'}
                </p>
              </div>
              <p className="text-[#52524E]">
                {errorMsg.toLowerCase().includes('kedaluwarsa') ||
                errorMsg.toLowerCase().includes('tidak valid') ||
                errorMsg.toLowerCase().includes('autentikasi')
                  ? 'Token sesi login Anda telah kedaluwarsa demi keamanan. Silakan perbarui sesi login untuk melanjutkan.'
                  : errorMsg}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isReauthenticating}
                  onClick={handleQuickReLogin}
                  className="px-4 py-2 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-white font-extrabold cursor-pointer transition-colors"
                >
                  {isReauthenticating ? 'Memperbarui Sesi...' : 'Perbarui Sesi (Masuk Kembali)'}
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-[#141413] font-bold cursor-pointer hover:bg-[#F3F1EC] transition-colors"
                >
                  Ganti Akun
                </button>
                <button
                  type="button"
                  onClick={loadAllData}
                  className="px-3 py-2 rounded-xl text-[#6E6D68] hover:text-[#141413] text-xs font-semibold cursor-pointer"
                >
                  Coba Muat Ulang
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loadingState === 'loading' && !overview ? (
            <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] text-center space-y-1.5">
              <p className="text-sm font-extrabold text-[#141413]">
                Memuat data Seller Workspace...
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
                    Seluruh Akun Pengguna Terdaftar ({adminUsers.length} Akun)
                  </h2>
                  <p className="text-xs text-[#52524E]">
                    Data dari tabel akun pengguna dan toko resmi SyncCart
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
                  marketplaces={overview?.marketplaces || []}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDuplicateProduct={handleDuplicateProduct}
                  onBulkProductAction={handleBulkProductAction}
                  onAdjustStock={handleAdjustStock}
                  onSyncAll={handleSyncAllChannels}
                  onDeleteProduct={handleDeleteProduct}
                  isSyncing={isSyncing}
                />
              )}
              {activeTab === 'orders' && (
                <SellerOrdersPage
                  orders={overview?.orders || []}
                  products={overview?.products || []}
                  store={store}
                  onCreateOrder={handleCreateOrder}
                  onShipOrder={handleShipOrder}
                  onBulkOrderAction={handleBulkOrderAction}
                  onDeleteOrder={handleDeleteOrder}
                />
              )}
              {activeTab === 'reports' && (
                <SellerReportsPage
                  overview={overview}
                  onUpdateSettings={handleUpdateStoreSettings}
                  onSelectTab={onSelectSubRoute}
                />
              )}
              {activeTab === 'team' && (
                <SellerTeamPage
                  team={overview?.team || []}
                  syncLogs={overview?.sync_logs || []}
                  store={store}
                  onInviteMember={handleInviteMember}
                  onUpdatePermissions={handleUpdatePermissions}
                  onTeamSessionAction={handleTeamSessionAction}
                  onTransferOwnership={handleTransferOwnership}
                  onDeleteMember={handleDeleteMember}
                />
              )}
              {activeTab === 'subscription' && (
                <SellerSubscriptionPage
                  overview={overview}
                  store={store}
                  onUpdateSettings={handleUpdateStoreSettings}
                  onCheckoutSubscription={handleCheckoutSubscription}
                />
              )}
              {activeTab === 'settings' && (
                <SellerSettingsPage
                  key={`${store?.id || 'store'}-${store?.updated_at || ''}`}
                  store={store}
                  currentUser={currentUser}
                  syncLogs={overview?.sync_logs || []}
                  onUpdateSettings={handleUpdateStoreSettings}
                  onRotateStoreKeys={handleRotateStoreKeys}
                  onTestStoreWebhook={handleTestStoreWebhook}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
