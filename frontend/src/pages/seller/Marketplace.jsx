import React, { useMemo, useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatDateTime(isoString) {
  if (!isoString) return 'Belum pernah'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Baru saja'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PlatformBadgeIcon({ platform }) {
  const name = (platform || '').toLowerCase()
  if (name.includes('shopee')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#F6671E] text-[#141413] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
        SHP
      </div>
    )
  }
  if (name.includes('tokopedia')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#FFDECE] text-[#9A3408] border border-[#F6671E]/30 flex items-center justify-center font-extrabold text-xs shrink-0">
        TKP
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-[#141413] text-[#FFFFFF] flex items-center justify-center font-extrabold text-xs shrink-0">
      TTS
    </div>
  )
}

export function SellerMarketplacePage({
  marketplaces = [],
  products = [],
  onConnectMarketplace,
  onDisconnectMarketplace,
  onSyncSingleMarketplace,
  onUpdateMarketplaceSettings,
  onSimulateWebhook,
  onSyncAll,
  onSelectTab,
  isSyncing,
}) {
  const [activeSettingsMp, setActiveSettingsMp] = useState(null)
  const [settingsForm, setSettingsForm] = useState({
    shop_name: '',
    shop_external_id: '',
    auto_sync: true,
    webhook_enabled: true,
    sync_interval_minutes: 5,
    price_markup_pct: 0,
  })
  const [activeOAuthMp, setActiveOAuthMp] = useState(null)
  const [oauthForm, setOauthForm] = useState({
    shop_name: '',
    shop_external_id: '',
    auth_code: '',
    sync_interval_minutes: 5,
  })

  const [webhookForm, setWebhookForm] = useState({
    event_type: 'order_created',
    platform: 'Shopee',
    product_id: '',
    quantity: 1,
    buyer_name: 'Nadia Putri',
    courier: 'J&T Express',
  })
  const [busyActionId, setBusyActionId] = useState('')

  // Dynamic metrics computed 100% from live PostgreSQL state
  const telemetry = useMemo(() => {
    const connectedList = marketplaces.filter((m) => m.status === 'connected')
    const totalSyncedListings = marketplaces.reduce(
      (sum, m) => sum + (m.status === 'connected' ? Number(m.products_synced || 0) : 0),
      0
    )
    const totalConflicts = marketplaces.reduce(
      (sum, m) => sum + Number(m.conflict_count || 0),
      0
    )
    const totalOrders = marketplaces.reduce(
      (sum, m) => sum + Number(m.orders_this_month || 0),
      0
    )
    const totalRevenue = marketplaces.reduce(
      (sum, m) => sum + Number(m.revenue_this_month || 0),
      0
    )
    return {
      connectedCount: connectedList.length,
      totalChannels: marketplaces.length,
      totalSyncedListings,
      totalConflicts,
      totalOrders,
      totalRevenue,
    }
  }, [marketplaces])

  function openSettingsModal(mp) {
    setActiveOAuthMp(null)
    setActiveSettingsMp(mp)
    setSettingsForm({
      shop_name: mp.shop_name || '',
      shop_external_id: mp.shop_external_id || '',
      auto_sync: Boolean(mp.auto_sync),
      webhook_enabled: mp.webhook_enabled !== false,
      sync_interval_minutes: Number(mp.sync_interval_minutes || 5),
      price_markup_pct: Number(mp.price_markup_pct || 0),
    })
  }

  function openOAuthModal(mp) {
    setActiveSettingsMp(null)
    setActiveOAuthMp(mp)
    setOauthForm({
      shop_name: mp.shop_name || `Toko Nusantara ${mp.platform}`,
      shop_external_id:
        mp.shop_external_id || `${(mp.platform_slug || 'SHP').toUpperCase()}-ID-994821`,
      auth_code: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      sync_interval_minutes: Number(mp.sync_interval_minutes || 5),
    })
  }

  async function handleSaveSettings(e) {
    e.preventDefault()
    if (!activeSettingsMp) return
    setBusyActionId(`settings-${activeSettingsMp.id}`)
    try {
      await onUpdateMarketplaceSettings(activeSettingsMp.id, {
        shop_name: settingsForm.shop_name,
        shop_external_id: settingsForm.shop_external_id,
        auto_sync: settingsForm.auto_sync,
        webhook_enabled: settingsForm.webhook_enabled,
        sync_interval_minutes: Number(settingsForm.sync_interval_minutes),
        price_markup_pct: Number(settingsForm.price_markup_pct),
      })
      setActiveSettingsMp(null)
    } finally {
      setBusyActionId('')
    }
  }

  async function handleRefreshToken(mp) {
    setBusyActionId(`refresh-${mp.id}`)
    try {
      await onUpdateMarketplaceSettings(mp.id, { refresh_token: true })
    } finally {
      setBusyActionId('')
    }
  }

  async function handleCompleteOAuth(e) {
    e.preventDefault()
    if (!activeOAuthMp) return
    setBusyActionId(`oauth-${activeOAuthMp.id}`)
    try {
      await onConnectMarketplace(activeOAuthMp.id, oauthForm)
      setActiveOAuthMp(null)
    } finally {
      setBusyActionId('')
    }
  }

  async function handleDisconnect(mp) {
    setBusyActionId(`disconnect-${mp.id}`)
    try {
      await onDisconnectMarketplace(mp.id)
    } finally {
      setBusyActionId('')
    }
  }

  async function handleSyncOne(mp) {
    setBusyActionId(`sync-${mp.id}`)
    try {
      await onSyncSingleMarketplace(mp.id)
    } finally {
      setBusyActionId('')
    }
  }

  async function handleTriggerWebhook(e) {
    e.preventDefault()
    const targetProductId =
      Number(webhookForm.product_id) || (products[0] ? products[0].id : 0)
    setBusyActionId('webhook-sim')
    try {
      await onSimulateWebhook({
        event_type: webhookForm.event_type,
        platform: webhookForm.platform,
        product_id: targetProductId,
        quantity: Number(webhookForm.quantity) || 1,
        buyer_name: webhookForm.buyer_name,
        courier: webhookForm.courier,
      })
    } finally {
      setBusyActionId('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Clean Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] px-5 py-4 rounded-2xl border border-[#ECEAE4]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFDECE] text-[#9A3408] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-[#141413]">
                Integrasi Marketplace
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
                {telemetry.connectedCount}/{telemetry.totalChannels} Channel Aktif
              </span>
            </div>
            <p className="text-xs text-[#52524E]">
              Kelola koneksi OAuth 2.0, sinkronisasi stok real-time, dan aturan harga di Shopee, Tokopedia, serta TikTok Shop.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('products')}
            className="h-[38px] px-3.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/40 text-xs font-bold text-[#141413] cursor-pointer transition-colors"
          >
            Katalog ({products.length} SKU)
          </button>
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="h-[38px] px-4 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Semua Toko'}</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 RentFlow-Style Visual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Connected Stores */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Toko Terhubung</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.5-5h15L21 9M3 9h18M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {telemetry.connectedCount}/{telemetry.totalChannels}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                OAuth 2.0
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[55, 80, 100, 75, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${i === 4 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* KPI 2: Total Synced Listings */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Listing Tersinkron</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {telemetry.totalSyncedListings}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold">
                {products.length} Master SKU
              </span>
            </div>
            <svg className="w-16 h-7 overflow-visible" viewBox="0 0 70 28" fill="none">
              <path
                d="M2 22 C14 20, 20 8, 32 14 C44 20, 50 4, 68 6"
                stroke="#F6671E"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Stock Reconciliation */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Akurasi Stok Channel</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono-tabular text-2xl font-extrabold ${
                  telemetry.totalConflicts > 0 ? 'text-[#9B1C1C]' : 'text-[#141413]'
                }`}
              >
                {telemetry.totalConflicts === 0 ? '100%' : `${telemetry.totalConflicts} Selisih`}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  telemetry.totalConflicts > 0
                    ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                    : 'bg-[#E6F6EC] text-[#0F5132]'
                }`}
              >
                {telemetry.totalConflicts > 0 ? 'Perlu Sync' : 'Sinkron'}
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[80, 95, 100, 90, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${
                    telemetry.totalConflicts > 0 ? 'bg-[#9B1C1C]' : i === 4 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* KPI 4: Total Multi-Channel Revenue */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Total Omzet Channel</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFDECE] flex items-center justify-center text-[#9A3408]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="font-mono-tabular text-xl font-extrabold text-[#141413] block">
                {formatRupiah(telemetry.totalRevenue)}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold shrink-0">
              {telemetry.totalOrders} Pesanan
            </span>
          </div>
        </div>
      </div>

      {/* OAuth 2.0 Modal / Drawer Banner */}
      {activeOAuthMp && (
        <form
          onSubmit={handleCompleteOAuth}
          className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#F6671E] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-3">
            <div className="flex items-center gap-3">
              <PlatformBadgeIcon platform={activeOAuthMp.platform} />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#9A3408]">
                  Otorisasi OAuth 2.0
                </span>
                <h2 className="text-sm font-extrabold text-[#141413]">
                  Hubungkan {activeOAuthMp.platform} ke SyncCart
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveOAuthMp(null)}
              className="h-8 px-3 rounded-lg bg-[#FAF9F6] text-xs font-bold text-[#52524E] hover:text-[#141413] cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="space-y-1">
              <label htmlFor="oauth-shop-name" className="block text-xs font-bold text-[#141413]">
                Nama Toko
              </label>
              <input
                id="oauth-shop-name"
                type="text"
                required
                value={oauthForm.shop_name}
                onChange={(e) => setOauthForm((s) => ({ ...s, shop_name: e.target.value }))}
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="oauth-shop-id" className="block text-xs font-bold text-[#141413]">
                Merchant / Shop ID
              </label>
              <input
                id="oauth-shop-id"
                type="text"
                required
                value={oauthForm.shop_external_id}
                onChange={(e) => setOauthForm((s) => ({ ...s, shop_external_id: e.target.value }))}
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="oauth-code" className="block text-xs font-bold text-[#141413]">
                Kode Otorisasi OAuth
              </label>
              <input
                id="oauth-code"
                type="text"
                required
                value={oauthForm.auth_code}
                onChange={(e) => setOauthForm((s) => ({ ...s, auth_code: e.target.value }))}
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="oauth-interval" className="block text-xs font-bold text-[#141413]">
                Interval Auto-Sync
              </label>
              <select
                id="oauth-interval"
                value={oauthForm.sync_interval_minutes}
                onChange={(e) =>
                  setOauthForm((s) => ({ ...s, sync_interval_minutes: Number(e.target.value) }))
                }
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
              >
                <option value={5}>Setiap 5 Menit</option>
                <option value={10}>Setiap 10 Menit</option>
                <option value={15}>Setiap 15 Menit</option>
                <option value={30}>Setiap 30 Menit</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveOAuthMp(null)}
              className="h-[36px] px-4 rounded-xl border border-[#ECEAE4] text-xs font-bold text-[#52524E] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busyActionId === `oauth-${activeOAuthMp.id}`}
              className="h-[36px] px-5 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
            >
              {busyActionId === `oauth-${activeOAuthMp.id}`
                ? 'Menghubungkan...'
                : 'Otorisasi & Hubungkan'}
            </button>
          </div>
        </form>
      )}

      {/* Channel Configuration Drawer */}
      {activeSettingsMp && (
        <form
          onSubmit={handleSaveSettings}
          className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#F6671E] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-3">
            <div className="flex items-center gap-3">
              <PlatformBadgeIcon platform={activeSettingsMp.platform} />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#9A3408]">
                  Pengaturan Channel
                </span>
                <h2 className="text-sm font-extrabold text-[#141413]">
                  Konfigurasi {activeSettingsMp.platform} ({activeSettingsMp.shop_name})
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSettingsMp(null)}
              className="h-8 px-3 rounded-lg bg-[#FAF9F6] text-xs font-bold text-[#52524E] hover:text-[#141413] cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="space-y-1">
              <label htmlFor="mp-set-name" className="block text-xs font-bold text-[#141413]">
                Nama Toko
              </label>
              <input
                id="mp-set-name"
                type="text"
                required
                value={settingsForm.shop_name}
                onChange={(e) => setSettingsForm((s) => ({ ...s, shop_name: e.target.value }))}
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-set-id" className="block text-xs font-bold text-[#141413]">
                Shop ID
              </label>
              <input
                id="mp-set-id"
                type="text"
                required
                value={settingsForm.shop_external_id}
                onChange={(e) =>
                  setSettingsForm((s) => ({ ...s, shop_external_id: e.target.value }))
                }
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-set-interval" className="block text-xs font-bold text-[#141413]">
                Interval Auto-Sync
              </label>
              <select
                id="mp-set-interval"
                value={settingsForm.sync_interval_minutes}
                onChange={(e) =>
                  setSettingsForm((s) => ({
                    ...s,
                    sync_interval_minutes: Number(e.target.value),
                  }))
                }
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
              >
                <option value={5}>Setiap 5 Menit</option>
                <option value={10}>Setiap 10 Menit</option>
                <option value={15}>Setiap 15 Menit</option>
                <option value={30}>Setiap 30 Menit</option>
                <option value={60}>Setiap 60 Menit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="mp-set-markup" className="block text-xs font-bold text-[#141413]">
                Markup Harga Channel (%)
              </label>
              <input
                id="mp-set-markup"
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={settingsForm.price_markup_pct}
                onChange={(e) =>
                  setSettingsForm((s) => ({ ...s, price_markup_pct: e.target.value }))
                }
                className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 font-bold text-[#141413] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.auto_sync}
                  onChange={(e) =>
                    setSettingsForm((s) => ({ ...s, auto_sync: e.target.checked }))
                  }
                  className="accent-[#F6671E]"
                />
                <span>Auto-Sync Stok & Harga</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-[#141413] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.webhook_enabled}
                  onChange={(e) =>
                    setSettingsForm((s) => ({ ...s, webhook_enabled: e.target.checked }))
                  }
                  className="accent-[#F6671E]"
                />
                <span>Webhook Pesanan Real-Time</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSettingsMp(null)}
                className="h-[36px] px-4 rounded-xl border border-[#ECEAE4] text-xs font-bold text-[#52524E] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busyActionId === `settings-${activeSettingsMp.id}`}
                className="h-[36px] px-5 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ROW 2: 3 Refined Marketplace Channel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {marketplaces.map((mp) => {
          const isConnected = mp.status === 'connected'
          const hasConflict = Number(mp.conflict_count || 0) > 0
          const sampleProductPrice = products[0]?.price || 185000
          const adjustedSamplePrice = Math.round(
            sampleProductPrice * (1 + Number(mp.price_markup_pct || 0) / 100)
          )

          return (
            <article
              key={mp.id || mp.platform}
              className={`p-5 rounded-2xl bg-[#FFFFFF] border flex flex-col justify-between space-y-4 transition-all ${
                hasConflict ? 'border-[#F8B4B4]' : 'border-[#ECEAE4]'
              }`}
            >
              <div className="space-y-4">
                {/* 1. Clean Brand Identity Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformBadgeIcon platform={mp.platform} />
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold text-[#141413] truncate">
                        {mp.shop_name}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#52524E]">
                        <span className="font-semibold text-[#141413]">{mp.platform}</span>
                        <span>•</span>
                        <span className="font-mono-tabular">{mp.shop_external_id || 'ID-ACTIVE'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                      isConnected
                        ? 'bg-[#E6F6EC] text-[#0F5132]'
                        : 'bg-[#FDE8E8] text-[#9B1C1C]'
                    }`}
                  >
                    {isConnected ? '● Terhubung' : '● Terputus'}
                  </span>
                </div>

                {/* 2. Highlighted Revenue & Markup Banner */}
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-[#52524E] block">
                      Omzet Channel
                    </span>
                    <strong className="font-mono-tabular text-lg font-extrabold text-[#141413]">
                      {formatRupiah(mp.revenue_this_month)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
                      Markup +{Number(mp.price_markup_pct || 0)}%
                    </span>
                    <span className="block font-mono-tabular text-[11px] font-semibold text-[#52524E] mt-0.5">
                      Est: {formatRupiah(adjustedSamplePrice)}
                    </span>
                  </div>
                </div>

                {/* 3. Crisp 3-Column Metrics Grid */}
                <div className="grid grid-cols-3 divide-x divide-[#ECEAE4] py-1 text-center">
                  <div className="px-2">
                    <span className="text-[11px] text-[#52524E] block">Katalog</span>
                    <strong className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                      {mp.products_synced}/{products.length} SKU
                    </strong>
                    {hasConflict && (
                      <span className="block text-[10px] font-extrabold text-[#9B1C1C]">
                        {mp.conflict_count} Selisih
                      </span>
                    )}
                  </div>

                  <div className="px-2">
                    <span className="text-[11px] text-[#52524E] block">Pesanan</span>
                    <strong className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                      {mp.orders_this_month} Order
                    </strong>
                  </div>

                  <div className="px-2">
                    <span className="text-[11px] text-[#52524E] block">Rating</span>
                    <strong className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                      ★ {mp.rating}
                    </strong>
                  </div>
                </div>

                {/* 4. Subtle Sync & Token Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-[#52524E] pt-2 border-t border-[#ECEAE4]">
                  <span>
                    Sync: <strong className="text-[#141413]">{formatDateTime(mp.last_sync_at)}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span>
                      Token:{' '}
                      <strong className="text-[#141413]">
                        {isConnected ? `${mp.token_expiry_days} hr` : 'Nonaktif'}
                      </strong>
                    </span>
                    {isConnected && (
                      <button
                        type="button"
                        onClick={() => handleRefreshToken(mp)}
                        disabled={busyActionId === `refresh-${mp.id}`}
                        className="text-[11px] font-extrabold text-[#9A3408] hover:underline cursor-pointer"
                      >
                        {busyActionId === `refresh-${mp.id}` ? '...' : 'Perbarui'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Single-Row Sleek Action Footer */}
              <div className="flex items-center gap-2 pt-1">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      disabled={busyActionId === `sync-${mp.id}`}
                      onClick={() => handleSyncOne(mp)}
                      className={`flex-1 h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                        hasConflict
                          ? 'bg-[#F6671E] text-[#141413]'
                          : 'bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413]'
                      }`}
                    >
                      {busyActionId === `sync-${mp.id}`
                        ? 'Menyinkronkan...'
                        : hasConflict
                          ? 'Perbaiki Stok'
                          : 'Sync Sekarang'}
                    </button>

                    <button
                      type="button"
                      onClick={() => openSettingsModal(mp)}
                      className="h-[36px] px-3 rounded-xl border border-[#ECEAE4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-xs font-bold text-[#141413] cursor-pointer"
                    >
                      Atur
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(mp)}
                      disabled={busyActionId === `disconnect-${mp.id}`}
                      title="Putuskan Koneksi OAuth"
                      className="h-[36px] px-2.5 rounded-xl border border-[#F8B4B4] bg-[#FDE8E8]/50 hover:bg-[#FDE8E8] text-[11px] font-bold text-[#9B1C1C] cursor-pointer"
                    >
                      Putuskan
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openOAuthModal(mp)}
                      className="flex-1 h-[36px] px-4 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer"
                    >
                      Hubungkan OAuth 2.0
                    </button>
                    <button
                      type="button"
                      onClick={() => openSettingsModal(mp)}
                      className="h-[36px] px-3 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#141413] cursor-pointer"
                    >
                      Atur
                    </button>
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* ROW 3: Balanced 8:4 Split: Webhook Simulator (Left) & Channel Distribution (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Clean Webhook Order & Stock Simulator */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#141413]">
                Simulasi Webhook Pesanan & Tes Potong Stok Otomatis
              </h2>
              <p className="text-xs text-[#52524E] mt-0.5">
                Uji skenario pesanan masuk atau selisih stok dari marketplace untuk melihat perubahan langsung pada katalog dan omzet.
              </p>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
              Real-Time Engine
            </span>
          </div>

          <form onSubmit={handleTriggerWebhook} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label htmlFor="wh-event" className="block text-xs font-bold text-[#141413]">
                  Skenario Event
                </label>
                <select
                  id="wh-event"
                  value={webhookForm.event_type}
                  onChange={(e) =>
                    setWebhookForm((s) => ({ ...s, event_type: e.target.value }))
                  }
                  className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                >
                  <option value="order_created">Pesanan Baru Masuk (Potong Stok)</option>
                  <option value="stock_mismatch">Selisih Stok Eksternal (Konflik)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="wh-platform" className="block text-xs font-bold text-[#141413]">
                  Channel Asal
                </label>
                <select
                  id="wh-platform"
                  value={webhookForm.platform}
                  onChange={(e) => setWebhookForm((s) => ({ ...s, platform: e.target.value }))}
                  className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Tokopedia">Tokopedia</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="wh-buyer" className="block text-xs font-bold text-[#141413]">
                  {webhookForm.event_type === 'order_created' ? 'Nama Pembeli' : 'Mode Simulasi'}
                </label>
                {webhookForm.event_type === 'order_created' ? (
                  <input
                    id="wh-buyer"
                    type="text"
                    value={webhookForm.buyer_name}
                    onChange={(e) =>
                      setWebhookForm((s) => ({ ...s, buyer_name: e.target.value }))
                    }
                    placeholder="Nama pembeli"
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                ) : (
                  <div className="h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex items-center text-xs font-semibold text-[#52524E]">
                    Simulasi Drift Stok Channel
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-7 space-y-1">
                <label htmlFor="wh-product" className="block text-xs font-bold text-[#141413]">
                  Pilih Produk Master
                </label>
                <select
                  id="wh-product"
                  value={webhookForm.product_id || (products[0]?.id ?? '')}
                  onChange={(e) =>
                    setWebhookForm((s) => ({ ...s, product_id: Number(e.target.value) }))
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

              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="wh-qty" className="block text-xs font-bold text-[#141413]">
                  Jumlah (Qty)
                </label>
                <input
                  id="wh-qty"
                  type="number"
                  min="1"
                  max="10"
                  disabled={webhookForm.event_type !== 'order_created'}
                  value={webhookForm.quantity}
                  onChange={(e) =>
                    setWebhookForm((s) => ({ ...s, quantity: Number(e.target.value) }))
                  }
                  className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413] disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={busyActionId === 'webhook-sim'}
                  className="w-full h-[38px] px-4 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer transition-all disabled:opacity-50"
                >
                  {busyActionId === 'webhook-sim' ? 'Memproses...' : 'Kirim Simulasi'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 4 Cols: Kontribusi Omzet per Channel (RentFlow Style Breakdown) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#141413]">
                Kontribusi per Channel
              </h2>
              <span className="text-[11px] font-bold text-[#9A3408]">
                {telemetry.totalOrders} Order
              </span>
            </div>
            <p className="text-xs text-[#52524E] mt-0.5">
              Proporsi omzet dan pesanan aktif dari tiap marketplace.
            </p>
          </div>

          <div className="space-y-3">
            {marketplaces.map((mp) => {
              const rev = Number(mp.revenue_this_month || 0)
              const pct =
                telemetry.totalRevenue > 0
                  ? Math.round((rev / telemetry.totalRevenue) * 100)
                  : 0
              return (
                <div key={mp.id || mp.platform} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#141413]">
                      {mp.platform}{' '}
                      <span className="font-normal text-[#52524E]">
                        ({mp.orders_this_month} pesanan)
                      </span>
                    </span>
                    <span className="font-mono-tabular font-extrabold text-[#141413]">
                      {formatRupiah(rev)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] overflow-hidden">
                    <div
                      style={{ width: `${Math.max(pct, 6)}%` }}
                      className="h-full rounded-full bg-[#F6671E]"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px] text-[#52524E]">
            <span>Keamanan Kredensial</span>
            <span className="font-bold text-[#0F5132]">● Enkripsi AES-256 Aktif</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SellerMarketplacePage
