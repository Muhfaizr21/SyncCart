import React, { useMemo, useState } from 'react'

const COURIER_CATALOG = [
  {
    id: 'jne',
    name: 'JNE Express',
    service: 'Reguler, YES & JTR Kargo',
    sla: 'Pickup 14:00 & 17:00 WIB • Cashless Resi Otomatis',
    badge: 'Populer',
  },
  {
    id: 'jnt',
    name: 'J&T Express',
    service: 'EZ Reguler & J&T Super',
    sla: 'Pickup setiap hari • Auto-AWB Termal',
    badge: 'Prioritas',
  },
  {
    id: 'sicepat',
    name: 'SiCepat Ekspres',
    service: 'REG, BEST Besok Sampai & Gokil',
    sla: 'Pickup 15:30 WIB • Rekonsiliasi Berat Otomatis',
    badge: 'Aktif',
  },
  {
    id: 'spx',
    name: 'SPX Express (Shopee)',
    service: 'Standard, Hemat & Instant',
    sla: 'Integrasi Langsung API Shopee Official',
    badge: 'Omnichannel',
  },
  {
    id: 'anteraja',
    name: 'Anteraja',
    service: 'Reguler, Next Day & Same Day',
    sla: 'Pickup kurir terjadwal ke titik gudang utama',
    badge: 'Fleksibel',
  },
  {
    id: 'gosend',
    name: 'GoSend & GrabExpress',
    service: 'Instant 2 Jam & Same Day Delivery',
    sla: 'Request driver otomatis begitu pesanan dikemas',
    badge: 'Instan',
  },
]

const NOTIFICATION_CATALOG = [
  {
    id: 'order_received',
    title: 'Pesanan Baru Masuk dari Marketplace',
    desc: 'Kirim notifikasi real-time saat pesanan baru terbit di Shopee, Tokopedia, atau TikTok Shop.',
    channel: 'Push & Email',
  },
  {
    id: 'low_stock',
    title: 'Peringatan Stok Katalog Menipis',
    desc: 'Beritahu tim gudang saat stok SKU menyentuh batas minimum yang ditentukan.',
    channel: 'Dashboard & Email',
  },
  {
    id: 'token_expiry',
    title: 'Masa Aktif Token OAuth H-7',
    desc: 'Peringatan dini 7 hari sebelum sesi otorisasi API marketplace kedaluwarsa.',
    channel: 'Email Prioritas',
  },
  {
    id: 'webhook_failure',
    title: 'Deteksi Kegagalan Antrean Webhook',
    desc: 'Peringatan instan apabila sinkronisasi stok ke salah satu channel mengalami timeout.',
    channel: 'Webhook & Email',
  },
  {
    id: 'weekly_digest',
    title: 'Rekapitulasi Laba Bersih Mingguan',
    desc: 'Kirim ringkasan GMV, potongan biaya admin, HPP, dan margin bersih setiap Senin pagi.',
    channel: 'Email Eksekutif',
  },
  {
    id: 'security_login',
    title: 'Audit Login Perangkat & Sesi Baru',
    desc: 'Peringatan keamanan saat akun Owner atau Staf RBAC masuk dari alamat IP baru.',
    channel: 'Keamanan 2FA',
  },
]

const BUSINESS_CATEGORIES = [
  'Fashion & Apparel Omnichannel',
  'Beauty, Skincare & Personal Care',
  'Gadget, Elektronik & Aksesoris',
  'FMCG & Kebutuhan Rumah Tangga',
  'Olahraga, Hobi & Gaya Hidup',
  'Kesehatan & Suplemen Resmi',
]

function parseCsvList(raw, fallback = []) {
  if (!raw || typeof raw !== 'string') return fallback
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function SellerSettingsPage({
  store,
  currentUser,
  syncLogs = [],
  onUpdateSettings,
  onRotateStoreKeys,
  onTestStoreWebhook,
}) {
  const [activeSubTab, setActiveSubTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  // Pop-Up Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showRotateModal, setShowRotateModal] = useState(false)
  const [showLabelPreviewModal, setShowLabelPreviewModal] = useState(false)

  // Form states synchronized with store prop
  const [storeName, setStoreName] = useState(store?.store_name || 'Toko Nusantara Official')
  const [storeSlug, setStoreSlug] = useState(store?.store_slug || 'toko-nusantara-official')
  const [businessCategory, setBusinessCategory] = useState(
    store?.business_category || BUSINESS_CATEGORIES[0]
  )
  const [supportPhone, setSupportPhone] = useState(store?.support_phone || '+62 812-8890-4412')
  const [supportEmail, setSupportEmail] = useState(store?.support_email || 'cs@tokonusantara.id')
  const [taxNpwp, setTaxNpwp] = useState(store?.tax_npwp || '09.254.294.3-042.000')

  const [warehouseName, setWarehouseName] = useState(
    store?.warehouse_name || 'Gudang Pusat Sunter Hub A1'
  )
  const [warehouseAddress, setWarehouseAddress] = useState(
    store?.warehouse_address || 'Jl. Danau Sunter Utara Blok G-12, Jakarta Utara 14350'
  )
  const [warehouseCity, setWarehouseCity] = useState(
    store?.warehouse_city || 'Jakarta Utara, DKI Jakarta'
  )
  const [warehousePostal, setWarehousePostal] = useState(store?.warehouse_postal || '14350')
  const [pickupCutoffTime, setPickupCutoffTime] = useState(
    store?.pickup_cutoff_time || '16:00 WIB'
  )
  const [thermalPaperSize, setThermalPaperSize] = useState(
    store?.thermal_paper_size || 'A6_100x150'
  )
  const [autoPrintLabel, setAutoPrintLabel] = useState(store?.auto_print_label ?? true)
  const [activeCouriers, setActiveCouriers] = useState(() =>
    parseCsvList(store?.active_couriers, ['jne', 'jnt', 'sicepat', 'spx', 'gosend'])
  )

  const [lowStockThreshold, setLowStockThreshold] = useState(
    Number(store?.low_stock_threshold ?? 10)
  )
  const [safetyStockBuffer, setSafetyStockBuffer] = useState(
    Number(store?.safety_stock_buffer ?? 2)
  )
  const [autoZeroOutOfStock, setAutoZeroOutOfStock] = useState(
    store?.auto_zero_out_of_stock ?? true
  )
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(
    Number(store?.sync_interval_minutes ?? 5)
  )

  const [notificationPrefs, setNotificationPrefs] = useState(() =>
    parseCsvList(store?.notification_prefs, [
      'order_received',
      'low_stock',
      'token_expiry',
      'webhook_failure',
      'security_login',
    ])
  )

  const [webhookEndpointUrl, setWebhookEndpointUrl] = useState(
    store?.webhook_endpoint_url || 'https://erp.tokonusantara.id/webhooks/synccart'
  )
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(store?.two_factor_enforced ?? true)

  // Account Modal states
  const [ownerFullName, setOwnerFullName] = useState(currentUser?.full_name || 'Budi Pratama')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [rotateTarget, setRotateTarget] = useState('both')

  const securityAuditLogs = useMemo(() => {
    return syncLogs.slice(0, 6)
  }, [syncLogs])

  function handleCopyText(label, text) {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(''), 2000)
  }

  function toggleCourier(courierId) {
    setActiveCouriers((prev) =>
      prev.includes(courierId) ? prev.filter((id) => id !== courierId) : [...prev, courierId]
    )
  }

  function toggleNotification(prefId) {
    setNotificationPrefs((prev) =>
      prev.includes(prefId) ? prev.filter((id) => id !== prefId) : [...prev, prefId]
    )
  }

  async function handleSaveAllSettings(e) {
    if (e) e.preventDefault()
    if (!onUpdateSettings) return
    setIsSaving(true)
    try {
      await onUpdateSettings({
        store_name: storeName,
        store_slug: storeSlug,
        business_category: businessCategory,
        support_phone: supportPhone,
        support_email: supportEmail,
        tax_npwp: taxNpwp,
        warehouse_name: warehouseName,
        warehouse_address: warehouseAddress,
        warehouse_city: warehouseCity,
        warehouse_postal: warehousePostal,
        pickup_cutoff_time: pickupCutoffTime,
        active_couriers: activeCouriers.join(','),
        thermal_paper_size: thermalPaperSize,
        auto_print_label: autoPrintLabel,
        low_stock_threshold: Number(lowStockThreshold),
        safety_stock_buffer: Number(safetyStockBuffer),
        auto_zero_out_of_stock: autoZeroOutOfStock,
        sync_interval_minutes: Number(syncIntervalMinutes),
        notification_prefs: notificationPrefs.join(','),
        webhook_endpoint_url: webhookEndpointUrl,
        two_factor_enforced: twoFactorEnforced,
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveOwnerAccount(e) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword && newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus terdiri dari 6 karakter.')
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        store_name: storeName,
        owner_full_name: ownerFullName,
      }
      if (newPassword) {
        payload.new_password = newPassword
      }
      await onUpdateSettings(payload)
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmRotateKeys(e) {
    e.preventDefault()
    if (!onRotateStoreKeys) return
    setIsSaving(true)
    try {
      await onRotateStoreKeys(rotateTarget)
      setShowRotateModal(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePingWebhook() {
    if (!onTestStoreWebhook) return
    setIsTestingWebhook(true)
    try {
      await onTestStoreWebhook()
    } finally {
      setIsTestingWebhook(false)
    }
  }

  // Example simulation for stock buffer preview
  const samplePhysicalStock = 25
  const samplePublishedStock = Math.max(0, samplePhysicalStock - Number(safetyStockBuffer || 0))

  return (
    <div className="space-y-4">
      {/* Top Executive Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1E8] border border-[#F6671E]/20 flex items-center justify-center text-[#F6671E] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#141413] tracking-tight">
                Pengaturan Operasional Toko, Gudang & Keamanan API
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-extrabold">
                Status Operasional Aktif
              </span>
            </div>
            <p className="text-xs text-[#6E6D68] mt-0.5">
              Pusat kendali profil bisnis <strong className="text-[#141413]">{storeName}</strong>, gudang ekspedisi, aturan sinkronisasi stok anti-overselling, serta kredensial Open API.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLabelPreviewModal(true)}
            className="h-9 px-3.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#141413] border border-[#E5E2DA] text-xs font-bold cursor-pointer transition-colors"
          >
            Pratinjau Label Resi
          </button>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="h-9 px-3.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#141413] border border-[#E5E2DA] text-xs font-bold cursor-pointer transition-colors"
          >
            Akun & Kata Sandi
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAllSettings}
            className="h-9 px-4 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </div>

      {/* 4 Live Operational Governance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Store Identity */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Identitas & Legalitas</span>
            <span className="px-2 py-0.5 rounded-md bg-[#FFF1E8] text-[#9A3408] text-[10px] font-extrabold">
              NPWP Terdaftar
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-sm font-extrabold text-[#141413] truncate">{storeName}</p>
            <p className="font-mono-tabular text-[11px] text-[#6E6D68] mt-0.5">
              /{storeSlug}
            </p>
          </div>
          <p className="text-[11px] text-[#52524E] truncate">{businessCategory}</p>
        </div>

        {/* Card 2: Warehouse & Active Couriers */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Gudang & Kurir Pickup</span>
            <span className="font-mono-tabular text-[11px] font-extrabold text-[#F6671E]">
              Cutoff {pickupCutoffTime}
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {activeCouriers.length}
              </span>
              <span className="text-xs font-bold text-[#6E6D68]">
                / {COURIER_CATALOG.length} Ekspedisi Aktif
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#6E6D68] truncate">
            {warehouseName} ({thermalPaperSize === 'A6_100x150' ? 'Resi A6' : 'Resi 80mm'})
          </p>
        </div>

        {/* Card 3: Sync & Stock Protection */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Proteksi Anti-Overselling</span>
            <span className="px-2 py-0.5 rounded-md bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
              Interval {syncIntervalMinutes}m
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-xl font-extrabold text-[#141413]">
                Buffer {safetyStockBuffer} pcs
              </span>
              <span className="text-xs font-semibold text-[#6E6D68]">
                • Alert &le; {lowStockThreshold} pcs
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#6E6D68]">
            {autoZeroOutOfStock
              ? 'Kunci otomatis stok 0 di semua channel aktif'
              : 'Mode sinkronisasi stok standar'}
          </p>
        </div>

        {/* Card 4: Security & Webhook API */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Keamanan & Webhook API</span>
            <span className="px-2 py-0.5 rounded-md bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
              {twoFactorEnforced ? '2FA Wajib' : 'Standar'}
            </span>
          </div>
          <div className="my-1.5">
            <p className="font-mono-tabular text-xs font-extrabold text-[#141413] truncate">
              {store?.open_api_key_masked || 'sk_live_synccart_8821_9904a7d2'}
            </p>
            <p className="text-[11px] text-[#6E6D68] mt-0.5">
              {notificationPrefs.length} Kanal Notifikasi Operasional Aktif
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRotateModal(true)}
            className="text-left text-[11px] font-extrabold text-[#F6671E] hover:underline cursor-pointer"
          >
            Rotasi Kunci Kredensial API &rarr;
          </button>
        </div>
      </div>

      {/* Modular Sub-Navigation Tabs */}
      <div className="p-1.5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-wrap items-center gap-1.5">
        {[
          { id: 'profile', label: '1. Profil & Legalitas Toko' },
          { id: 'warehouse', label: '2. Gudang & Ekspedisi Kurir' },
          { id: 'sync_rules', label: '3. Aturan Sinkronisasi & Buffer Stok' },
          { id: 'notifications', label: '4. Notifikasi Operasional' },
          { id: 'security_api', label: '5. Keamanan, Webhook & Open API' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#141413] text-[#FFFFFF]'
                : 'text-[#6E6D68] hover:text-[#141413] hover:bg-[#FAF9F6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STORE IDENTITY & BUSINESS PROFILE */}
      {activeSubTab === 'profile' && (
        <form
          onSubmit={handleSaveAllSettings}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
            <div className="border-b border-[#F2EFE9] pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Identitas Toko Utama & Informasi Pajak
              </h2>
              <p className="text-xs text-[#6E6D68]">
                Informasi ini digunakan pada cetakan label resi pengiriman, faktur pajak langganan, dan header omnichannel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nama Toko Utama
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Slug URL Toko Omnichannel
                </label>
                <input
                  type="text"
                  value={storeSlug}
                  onChange={(e) =>
                    setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Kategori Industri Bisnis
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nomor NPWP Badan / PKP
                </label>
                <input
                  type="text"
                  value={taxNpwp}
                  onChange={(e) => setTaxNpwp(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nomor WhatsApp / Telepon CS Resi
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Email Operasional & Komplain Retur
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil Toko'}
              </button>
            </div>
          </div>

          {/* Right 4 Cols: Owner Card & Quick Preview */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
            <h3 className="text-sm font-extrabold text-[#141413]">
              Pemilik Utama & Otoritas Toko
            </h3>
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6E6D68]">Nama Pemilik</span>
                <span className="font-extrabold text-[#141413]">
                  {currentUser?.full_name || ownerFullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6D68]">Email Login</span>
                <span className="font-mono-tabular font-bold text-[#141413]">
                  {currentUser?.email || 'seller@synccart.id'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6D68]">Peran Otoritas</span>
                <span className="px-2 py-0.5 rounded bg-[#FFF1E8] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  {currentUser?.role || 'Owner'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full h-9 rounded-xl bg-[#141413] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
            >
              Ubah Nama Pemilik & Kata Sandi
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: WAREHOUSE & COURIER LOGISTICS */}
      {activeSubTab === 'warehouse' && (
        <form
          onSubmit={handleSaveAllSettings}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          {/* Left 5 Cols: Warehouse Origin & Thermal Label Specs */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
            <div className="border-b border-[#F2EFE9] pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Titik Gudang Pickup & Standar Cetak Resi
              </h2>
              <p className="text-xs text-[#6E6D68]">
                Alamat ini dicetak sebagai pengirim (Origin) pada seluruh resi termal.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nama Gudang / Hub Distribusi
                </label>
                <input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Alamat Lengkap Titik Penjemputan Kurir
                </label>
                <textarea
                  rows={3}
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-semibold text-[#141413]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Kota / Provinsi
                  </label>
                  <input
                    type="text"
                    value={warehouseCity}
                    onChange={(e) => setWarehouseCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Kode Pos Gudang
                  </label>
                  <input
                    type="text"
                    value={warehousePostal}
                    onChange={(e) => setWarehousePostal(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Jam Cutoff Pickup Harian
                  </label>
                  <select
                    value={pickupCutoffTime}
                    onChange={(e) => setPickupCutoffTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                  >
                    <option value="14:00 WIB">14:00 WIB (Sesi Siang)</option>
                    <option value="16:00 WIB">16:00 WIB (Standar Sore)</option>
                    <option value="18:00 WIB">18:00 WIB (Sesi Malam)</option>
                    <option value="20:00 WIB">20:00 WIB (24/7 Fulfillment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Ukuran Kertas Printer Termal
                  </label>
                  <select
                    value={thermalPaperSize}
                    onChange={(e) => setThermalPaperSize(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                  >
                    <option value="A6_100x150">A6 Standar (100 × 150 mm)</option>
                    <option value="THERMAL_80MM">Continuous Roll (80 × 100 mm)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrintLabel}
                  onChange={(e) => setAutoPrintLabel(e.target.checked)}
                  className="accent-[#F6671E]"
                />
                <span>
                  Buka dialog cetak resi termal otomatis sesaat setelah nomor AWB diterbitkan
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowLabelPreviewModal(true)}
                className="h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413] cursor-pointer"
              >
                Uji Tampilan Resi
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Gudang & Kurir'}
              </button>
            </div>
          </div>

          {/* Right 7 Cols: 6 Interactive Courier Fleet Cards */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                  Mitra Ekspedisi & Kurir Pickup Terintegrasi
                </h2>
                <p className="text-xs text-[#6E6D68]">
                  Pilih armada kurir yang diizinkan mengambil paket di gudang Anda.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#FFF1E8] text-[#9A3408] text-xs font-extrabold">
                {activeCouriers.length} Kurir Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COURIER_CATALOG.map((courier) => {
                const enabled = activeCouriers.includes(courier.id)
                return (
                  <label
                    key={courier.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 cursor-pointer transition-all ${
                      enabled
                        ? 'bg-[#FFF6F0] border-[#F6671E]'
                        : 'bg-[#FAF9F6]/70 border-[#ECEAE4]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#141413]">
                            {courier.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#E5E2DA] text-[10px] font-bold text-[#6E6D68]">
                            {courier.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#9A3408] mt-0.5">
                          {courier.service}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleCourier(courier.id)}
                        className="mt-0.5 accent-[#F6671E]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6E6D68] border-t border-[#ECEAE4] pt-2">
                      {courier.sla}
                    </p>
                  </label>
                )
              })}
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: OMNICHANNEL SYNC RULES & ANTI-OVERSELLING BUFFER */}
      {activeSubTab === 'sync_rules' && (
        <form
          onSubmit={handleSaveAllSettings}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
            <div className="border-b border-[#F2EFE9] pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Aturan Mesin Sinkronisasi & Proteksi Anti-Overselling
              </h2>
              <p className="text-xs text-[#6E6D68]">
                Konfigurasi bagaimana stok fisik gudang disiarkan ke Shopee, Tokopedia, dan TikTok Shop saat kampanye flash sale.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Interval Sinkronisasi (Menit)
                </label>
                <select
                  value={syncIntervalMinutes}
                  onChange={(e) => setSyncIntervalMinutes(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                >
                  <option value={1}>Setiap 1 Menit (Real-Time)</option>
                  <option value={5}>Setiap 5 Menit (Rekomendasi)</option>
                  <option value={15}>Setiap 15 Menit</option>
                  <option value={30}>Setiap 30 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Ambang Peringatan Stok Tipis (pcs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Cadangan Safety Buffer (pcs)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={safetyStockBuffer}
                  onChange={(e) => setSafetyStockBuffer(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={autoZeroOutOfStock}
                onChange={(e) => setAutoZeroOutOfStock(e.target.checked)}
                className="mt-0.5 accent-[#F6671E]"
              />
              <div>
                <p className="font-extrabold text-[#141413]">
                  Kunci Otomatis Stok Marketplace ke 0 Saat Menyentuh Safety Buffer
                </p>
                <p className="text-[11px] text-[#6E6D68] mt-0.5">
                  Mencegah penalti pembatalan pesanan di Shopee/Tokopedia/TikTok saat beberapa pembeli melakukan checkout pada detik yang sama.
                </p>
              </div>
            </label>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Aturan Sinkronisasi'}
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Live Buffer Formula Simulator */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-3.5">
            <h3 className="text-sm font-extrabold text-[#141413]">
              Simulasi Distribusi Stok ke Marketplace
            </h3>
            <p className="text-xs text-[#6E6D68]">
              Contoh perhitungan otomatis apabila stok fisik di gudang berjumlah{' '}
              <strong className="text-[#141413]">{samplePhysicalStock} pcs</strong>:
            </p>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6E6D68]">Stok Fisik Master Gudang</span>
                <span className="font-mono-tabular font-extrabold text-[#141413]">
                  {samplePhysicalStock} pcs
                </span>
              </div>
              <div className="flex justify-between text-[#9A3408]">
                <span>Dikurangi Safety Buffer Cadangan</span>
                <span className="font-mono-tabular font-bold">-{safetyStockBuffer} pcs</span>
              </div>
              <div className="pt-2 border-t border-[#E5E2DA] flex justify-between font-extrabold text-[#0F5132]">
                <span>Stok Ditampilkan di Shopee / Tokopedia / TikTok</span>
                <span className="font-mono-tabular text-sm">{samplePublishedStock} pcs</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF6F0] border border-[#F6671E]/30 text-[11px] text-[#52524E]">
              Notifikasi stok tipis akan dikirim ke tim gudang begitu sisa stok fisik berada di bawah{' '}
              <strong className="text-[#141413]">{lowStockThreshold} pcs</strong>.
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: OPERATIONAL NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <form
          onSubmit={handleSaveAllSettings}
          className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFE9] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Preferensi Notifikasi & Peringatan Dini Operasional
              </h2>
              <p className="text-xs text-[#6E6D68]">
                Atur jenis insiden atau laporan yang dikirimkan ke email operasional{' '}
                <strong className="text-[#141413]">{supportEmail}</strong>.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Preferensi Notifikasi'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NOTIFICATION_CATALOG.map((item) => {
              const active = notificationPrefs.includes(item.id)
              return (
                <label
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    active
                      ? 'bg-[#FFF6F0] border-[#F6671E]'
                      : 'bg-[#FAF9F6]/70 border-[#ECEAE4]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#141413]">{item.title}</span>
                      <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E5E2DA] text-[10px] font-bold text-[#6E6D68]">
                        {item.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E6D68]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleNotification(item.id)}
                    className="mt-1 accent-[#F6671E]"
                  />
                </label>
              )
            })}
          </div>
        </form>
      )}

      {/* TAB 5: SECURITY, WEBHOOK ERP & OPEN API KEYS */}
      {activeSubTab === 'security_api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 7 Cols: Webhook & Open API Credentials */}
          <form
            onSubmit={handleSaveAllSettings}
            className="lg:col-span-7 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                  Integrasi Webhook ERP & Kredensial Open API
                </h2>
                <p className="text-xs text-[#6E6D68]">
                  Hubungkan SyncCart dengan sistem ERP/WMS internal Anda menggunakan tanda tangan HMAC-SHA256.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePingWebhook}
                disabled={isTestingWebhook}
                className="h-9 px-3.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FFF1E8] text-[#141413] hover:text-[#9A3408] border border-[#E5E2DA] text-xs font-extrabold cursor-pointer"
              >
                {isTestingWebhook ? 'Mengirim Ping...' : 'Uji Ping Webhook'}
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  URL Endpoint Webhook Tujuan (HTTPS)
                </label>
                <input
                  type="url"
                  value={webhookEndpointUrl}
                  onChange={(e) => setWebhookEndpointUrl(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Webhook HMAC Signing Secret
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={store?.webhook_secret_key || 'whsec_synccart_live_98f2a4c7e1b0'}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#9A3408]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'webhook',
                        store?.webhook_secret_key || 'whsec_synccart_live_98f2a4c7e1b0'
                      )
                    }
                    className="h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#141413] cursor-pointer"
                  >
                    {copiedField === 'webhook' ? 'Tersalin ✓' : 'Salin'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Production Open API Key (Bearer Token)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={store?.open_api_key_masked || 'sk_live_synccart_8821_9904a7d2'}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] font-mono-tabular text-xs font-bold text-[#141413]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'openapi',
                        store?.open_api_key_masked || 'sk_live_synccart_8821_9904a7d2'
                      )
                    }
                    className="h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#141413] cursor-pointer"
                  >
                    {copiedField === 'openapi' ? 'Tersalin ✓' : 'Salin'}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413] cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnforced}
                  onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                  className="accent-[#F6671E]"
                />
                <span>
                  Wajibkan verifikasi keamanan 2 Langkah (2FA) untuk seluruh anggota tim RBAC
                </span>
              </label>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowRotateModal(true)}
                className="h-10 px-4 rounded-xl bg-[#141413] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
              >
                Rotasi Kunci Rahasia API
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Keamanan'}
              </button>
            </div>
          </form>

          {/* Right 5 Cols: Recent Security & Settings Audit Logs */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-3.5">
            <h3 className="text-sm font-extrabold text-[#141413]">
              Log Audit Konfigurasi & Keamanan Terbaru
            </h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {securityAuditLogs.length === 0 ? (
                <p className="text-xs text-[#6E6D68]">Belum ada riwayat aktivitas audit.</p>
              ) : (
                securityAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#141413]">{log.platform}</span>
                      <span className="font-mono-tabular text-[10px] text-[#6E6D68]">
                        {log.executed_at}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52524E]">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 1: OWNER PROFILE & PASSWORD CHANGE */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Kredensial Pemilik Utama
                </span>
                <h3 className="text-base font-extrabold text-[#141413]">
                  Ubah Profil & Kata Sandi Akun
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOwnerAccount} className="p-5 space-y-3.5">
              {passwordError && (
                <div className="p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C]">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nama Lengkap Pemilik Toko
                </label>
                <input
                  type="text"
                  required
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Kata Sandi Baru (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs text-[#141413]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-10 px-4 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Akun Pemilik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: ROTATE API & WEBHOOK KEYS */}
      {showRotateModal && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowRotateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Keamanan Kredensial Produksi
                </span>
                <h3 className="text-base font-extrabold text-[#141413]">
                  Rotasi Kunci Rahasia API & Webhook
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRotateModal(false)}
                className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRotateKeys} className="p-5 space-y-4">
              <p className="text-xs text-[#52524E]">
                Merotasi kunci akan menerbitkan token baru secara instan dan mencabut masa berlaku kunci lama.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'both', label: 'Rotasi Keduanya (Webhook Secret + Open API Key)' },
                  { id: 'webhook', label: 'Hanya Webhook HMAC Signing Secret' },
                  { id: 'openapi', label: 'Hanya Production Open API Key' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold cursor-pointer ${
                      rotateTarget === opt.id
                        ? 'bg-[#FFF6F0] border-[#F6671E] text-[#141413]'
                        : 'bg-[#FAF9F6] border-[#ECEAE4] text-[#52524E]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rotate_target"
                      checked={rotateTarget === opt.id}
                      onChange={() => setRotateTarget(opt.id)}
                      className="accent-[#F6671E]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setShowRotateModal(false)}
                  className="h-10 px-4 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 px-5 rounded-xl bg-[#141413] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
                >
                  {isSaving ? 'Merotasi...' : 'Rotasi Kunci Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 3: THERMAL SHIPPING LABEL HEADER PREVIEW */}
      {showLabelPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowLabelPreviewModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#141413] text-[#FFFFFF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Standar Kertas {thermalPaperSize === 'A6_100x150' ? 'A6 (100×150mm)' : 'Roll 80mm'}
                </span>
                <h3 className="text-base font-extrabold">Pratinjau Header Resi Pengiriman</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLabelPreviewModal(false)}
                className="w-8 h-8 rounded-lg bg-[#2A2A28] text-xs font-extrabold text-[#FFFFFF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-[#141413] bg-[#FAF9F6] space-y-3 text-xs font-mono-tabular">
                <div className="flex items-center justify-between border-b border-[#141413] pb-2">
                  <span className="font-extrabold text-sm text-[#141413]">{storeName}</span>
                  <span className="px-2 py-0.5 rounded bg-[#141413] text-[#FFFFFF] text-[10px] font-extrabold">
                    CASHLESS AWB
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-[#141413]">
                  <p className="font-bold">PENGIRIM (ORIGIN): {warehouseName}</p>
                  <p>{warehouseAddress}</p>
                  <p>
                    {warehouseCity} • Kode Pos {warehousePostal}
                  </p>
                  <p>CS / Retur: {supportPhone}</p>
                </div>
                <div className="pt-2 border-t border-[#141413] flex items-center justify-between text-[10px] text-[#52524E]">
                  <span>Cutoff Pickup: {pickupCutoffTime}</span>
                  <span>{activeCouriers.length} Kurir Terotorisasi</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-9 px-4 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  Cetak Sampel Resi
                </button>
                <button
                  type="button"
                  onClick={() => setShowLabelPreviewModal(false)}
                  className="h-9 px-4 rounded-xl bg-[#F6671E] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
