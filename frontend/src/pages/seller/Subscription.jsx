import React, { useMemo, useState } from 'react'

const PLAN_CATALOG = [
  {
    id: 'free',
    name: 'Free Trial',
    tagline: 'Uji coba omnichannel 14 hari untuk seller pemula',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    limits: {
      marketplaces: 1,
      skuLimit: 50,
      staffLimit: 1,
      storageMb: 250,
    },
    highlights: [
      '1 Integrasi Toko Marketplace',
      'Maksimal 50 SKU Katalog Produk',
      '1 Kursi Akun Owner Utama',
      'Sinkronisasi Stok Otomatis Dasar',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Fondasi sinkronisasi stok & resi untuk toko bertumbuh',
    monthlyPrice: 99000,
    annualMonthlyPrice: 79000,
    limits: {
      marketplaces: 2,
      skuLimit: 500,
      staffLimit: 3,
      storageMb: 2048,
    },
    highlights: [
      '2 Integrasi Toko Marketplace',
      'Hingga 500 SKU Katalog & WebP',
      '3 Kursi Staf RBAC Operasional',
      'Cetak Label Resi Termal Massal',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Skala penuh omnichannel Shopee, Tokopedia & TikTok Shop',
    popular: true,
    monthlyPrice: 299000,
    annualMonthlyPrice: 239000,
    limits: {
      marketplaces: 3,
      skuLimit: 5000,
      staffLimit: 10,
      storageMb: 15360,
    },
    highlights: [
      '3 Channel Penuh (Shopee, Tokopedia, TikTok)',
      'Hingga 5.000 SKU & Konversi WebP',
      '10 Kursi Staf dengan 20 Modul RBAC',
      'Analitik Finansial & Rekonsiliasi Margin',
      'Webhook Real-Time & Anti-Overselling',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Kapasitas tanpa batas & SLA prioritas untuk brand besar',
    monthlyPrice: 799000,
    annualMonthlyPrice: 639000,
    limits: {
      marketplaces: 99,
      skuLimit: 50000,
      staffLimit: 50,
      storageMb: 102400,
    },
    highlights: [
      'Multi-Toko & Multi-Cabang Tanpa Batas',
      'Hingga 50.000 SKU & Dedicated CDN WebP',
      '50 Kursi Staf + Izin Kustom RBAC',
      'Dedicated Account Manager & SLA 99.95%',
      'Audit Keamanan Sesi & Custom Webhook API',
    ],
  },
]

const ADDON_CATALOG = [
  {
    id: 'addon_extra_store',
    title: '+1 Slot Toko Marketplace',
    desc: 'Tambahkan 1 koneksi toko ekstra di luar kuota paket utama Anda.',
    monthlyPrice: 49000,
    bonus: { marketplaces: 1, skuLimit: 0, staffLimit: 0 },
  },
  {
    id: 'addon_extra_sku',
    title: '+2.000 Kuota SKU & Cloud WebP',
    desc: 'Perluas kapasitas katalog produk master beserta penyimpanan gambar WebP.',
    monthlyPrice: 39000,
    bonus: { marketplaces: 0, skuLimit: 2000, staffLimit: 0 },
  },
  {
    id: 'addon_extra_seats',
    title: '+5 Kursi Staf RBAC',
    desc: 'Tambah 5 kursi anggota tim operasional dengan kontrol 20 modul RBAC.',
    monthlyPrice: 45000,
    bonus: { marketplaces: 0, skuLimit: 0, staffLimit: 5 },
  },
  {
    id: 'addon_priority_sla',
    title: 'Priority Webhook & SLA 24/7',
    desc: 'Jalur antrean webhook prioritas < 150ms & dukungan teknis langsung.',
    monthlyPrice: 65000,
    bonus: { marketplaces: 0, skuLimit: 0, staffLimit: 0 },
  },
]

const PAYMENT_METHODS = [
  {
    id: 'Midtrans • BCA Virtual Account',
    gateway: 'Midtrans',
    masked: 'BCA VA •••• 8821',
    type: 'Virtual Account Instan',
  },
  {
    id: 'Xendit • Mandiri Bill Payment',
    gateway: 'Xendit',
    masked: 'Mandiri VA •••• 4409',
    type: 'Virtual Account Korporat',
  },
  {
    id: 'Visa Corporate Credit Card',
    gateway: 'Stripe / Midtrans CC',
    masked: 'VISA •••• 9012 (Exp 08/28)',
    type: 'Kartu Kredit Auto-Debit',
  },
  {
    id: 'QRIS Enterprise Instant',
    gateway: 'Xendit QRIS',
    masked: 'QRIS Merchant SyncCart',
    type: 'Dompet Digital & E-Wallet',
  },
]

function formatRupiah(value) {
  return `Rp ${Math.round(Number(value || 0)).toLocaleString('id-ID')}`
}

function parseAddons(csv) {
  if (!csv || typeof csv !== 'string') return []
  return csv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function SellerSubscriptionPage({
  overview,
  store,
  onUpdateSettings,
  onCheckoutSubscription,
}) {
  const currentPlanId = (store?.plan || 'business').toLowerCase()
  const persistedCycle = store?.billing_cycle === 'annual' ? 'annual' : 'monthly'

  const [selectedCycle, setSelectedCycle] = useState(persistedCycle)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceCycleFilter, setInvoiceCycleFilter] = useState('ALL')

  // Pop-Up Modal States
  const [checkoutModalPlan, setCheckoutModalPlan] = useState(null)
  const [checkoutCycle, setCheckoutCycle] = useState(persistedCycle)
  const [checkoutAddons, setCheckoutAddons] = useState(() => parseAddons(store?.active_addons))
  const [checkoutGateway, setCheckoutGateway] = useState(
    store?.payment_gateway || PAYMENT_METHODS[0].id
  )
  const [checkoutMasked, setCheckoutMasked] = useState(
    store?.payment_account_masked || PAYMENT_METHODS[0].masked
  )
  const [checkoutAutoRenew, setCheckoutAutoRenew] = useState(store?.auto_renew ?? true)
  const [promoCodeInput, setPromoCodeInput] = useState(store?.coupon_code || '')
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentFormGateway, setPaymentFormGateway] = useState(
    store?.payment_gateway || PAYMENT_METHODS[0].id
  )
  const [paymentFormMasked, setPaymentFormMasked] = useState(
    store?.payment_account_masked || PAYMENT_METHODS[0].masked
  )
  const [paymentFormAutoRenew, setPaymentFormAutoRenew] = useState(store?.auto_renew ?? true)
  const [isSavingPayment, setIsSavingPayment] = useState(false)

  const [previewInvoice, setPreviewInvoice] = useState(null)

  const activeAddonsList = useMemo(
    () => parseAddons(store?.active_addons),
    [store?.active_addons]
  )

  const currentPlanSpec = useMemo(
    () => PLAN_CATALOG.find((p) => p.id === currentPlanId) || PLAN_CATALOG[2],
    [currentPlanId]
  )

  // Live resource usage from PostgreSQL overview
  const usageMetrics = useMemo(() => {
    const marketplaces = overview?.marketplaces || []
    const products = overview?.products || []
    const team = overview?.team || []

    const connectedChannels = marketplaces.filter((m) => m.connected).length
    const totalSku = products.length
    const totalStaff = team.length

    // Calculate total images across products for WebP storage calculation
    const totalImages = products.reduce((acc, p) => {
      if (!p.image_urls) return acc + 1
      return acc + p.image_urls.split('\n').filter(Boolean).length
    }, 0)
    const estimatedWebpMb = Number((totalImages * 0.18).toFixed(2))

    // Add bonus limits from active add-ons
    const addonBonus = activeAddonsList.reduce(
      (acc, addonId) => {
        const found = ADDON_CATALOG.find((a) => a.id === addonId)
        if (found) {
          acc.marketplaces += found.bonus.marketplaces
          acc.skuLimit += found.bonus.skuLimit
          acc.staffLimit += found.bonus.staffLimit
        }
        return acc
      },
      { marketplaces: 0, skuLimit: 0, staffLimit: 0 }
    )

    const maxChannels = currentPlanSpec.limits.marketplaces + addonBonus.marketplaces
    const maxSku = currentPlanSpec.limits.skuLimit + addonBonus.skuLimit
    const maxStaff = currentPlanSpec.limits.staffLimit + addonBonus.staffLimit
    const maxStorageMb = currentPlanSpec.limits.storageMb

    return {
      connectedChannels,
      maxChannels,
      channelPct: Math.min(100, Math.round((connectedChannels / Math.max(1, maxChannels)) * 100)),
      totalSku,
      maxSku,
      skuPct: Math.min(100, Math.round((totalSku / Math.max(1, maxSku)) * 100)),
      totalStaff,
      maxStaff,
      staffPct: Math.min(100, Math.round((totalStaff / Math.max(1, maxStaff)) * 100)),
      estimatedWebpMb,
      maxStorageMb,
      totalImages,
    }
  }, [overview, currentPlanSpec, activeAddonsList])

  const rawInvoicesList = useMemo(
    () => overview?.invoices || overview?.subscription_invoices || [],
    [overview?.invoices, overview?.subscription_invoices]
  )

  const invoices = useMemo(() => {
    return rawInvoicesList
      .map((inv) => ({
        ...inv,
        issued_at: inv.issued_at || inv.period_start || '-',
        period_label:
          inv.period_label ||
          (inv.period_start && inv.period_end
            ? `${inv.period_start} s/d ${inv.period_end}`
            : inv.addons_summary || '-'),
        payment_method: inv.payment_method || inv.payment_gateway || 'Midtrans • BCA Virtual Account',
      }))
      .filter((inv) => {
        const matchCycle =
          invoiceCycleFilter === 'ALL' ||
          (inv.billing_cycle || '').toLowerCase() === invoiceCycleFilter.toLowerCase()
        const q = invoiceSearch.trim().toLowerCase()
        const matchSearch =
          !q ||
          (inv.invoice_number || '').toLowerCase().includes(q) ||
          (inv.plan_name || '').toLowerCase().includes(q) ||
          (inv.payment_method || '').toLowerCase().includes(q)
        return matchCycle && matchSearch
      })
  }, [rawInvoicesList, invoiceCycleFilter, invoiceSearch])

  // Open Checkout Modal for a target plan or add-on upgrade
  function openCheckoutModal(planObj, customCycle = selectedCycle, initialAddons = activeAddonsList) {
    setCheckoutModalPlan(planObj)
    setCheckoutCycle(customCycle)
    setCheckoutAddons(initialAddons)
    setCheckoutGateway(store?.payment_gateway || PAYMENT_METHODS[0].id)
    setCheckoutMasked(store?.payment_account_masked || PAYMENT_METHODS[0].masked)
    setCheckoutAutoRenew(store?.auto_renew ?? true)
    setPromoCodeInput(store?.coupon_code || '')
  }

  // Live Checkout Calculation (Base + Addons - Discount + 11% PPN)
  const checkoutCalculation = useMemo(() => {
    if (!checkoutModalPlan) return null
    const months = checkoutCycle === 'annual' ? 12 : 1
    const baseMonthly =
      checkoutCycle === 'annual'
        ? checkoutModalPlan.annualMonthlyPrice
        : checkoutModalPlan.monthlyPrice
    const baseSubtotal = baseMonthly * months

    const addonsMonthly = checkoutAddons.reduce((sum, id) => {
      const item = ADDON_CATALOG.find((a) => a.id === id)
      return sum + (item ? item.monthlyPrice : 0)
    }, 0)
    const addonsSubtotal = addonsMonthly * months

    const grossSubtotal = baseSubtotal + addonsSubtotal
    const cleanPromo = promoCodeInput.trim().toUpperCase()
    let discountAmount = 0
    if (cleanPromo === 'SYNCCART10' || cleanPromo === 'OMNI10') {
      discountAmount = Math.round(grossSubtotal * 0.1)
    } else if (cleanPromo === 'STARTUP20') {
      discountAmount = Math.round(grossSubtotal * 0.2)
    }

    const netSubtotal = Math.max(0, grossSubtotal - discountAmount)
    const taxAmount = Math.round(netSubtotal * 0.11)
    const totalAmount = netSubtotal + taxAmount

    return {
      months,
      baseMonthly,
      baseSubtotal,
      addonsMonthly,
      addonsSubtotal,
      grossSubtotal,
      discountAmount,
      netSubtotal,
      taxAmount,
      totalAmount,
      cleanPromo,
    }
  }, [checkoutModalPlan, checkoutCycle, checkoutAddons, promoCodeInput])

  async function handleConfirmCheckout(e) {
    e.preventDefault()
    if (!checkoutModalPlan || !onCheckoutSubscription) return
    setIsSubmittingCheckout(true)
    try {
      await onCheckoutSubscription({
        plan: checkoutModalPlan.id,
        billing_cycle: checkoutCycle,
        payment_gateway: checkoutGateway,
        payment_account_masked: checkoutMasked,
        active_addons: checkoutAddons.join(','),
        coupon_code: promoCodeInput.trim().toUpperCase(),
        auto_renew: checkoutAutoRenew,
      })
      setSelectedCycle(checkoutCycle)
      setCheckoutModalPlan(null)
    } finally {
      setIsSubmittingCheckout(false)
    }
  }

  async function handleSavePaymentSettings(e) {
    e.preventDefault()
    if (!onUpdateSettings) return
    setIsSavingPayment(true)
    try {
      await onUpdateSettings({
        payment_gateway: paymentFormGateway,
        payment_account_masked: paymentFormMasked,
        auto_renew: paymentFormAutoRenew,
      })
      setShowPaymentModal(false)
    } finally {
      setIsSavingPayment(false)
    }
  }

  function handleExportInvoicesCsv() {
    if (!invoices.length) return
    const headers = [
      'No Invoice',
      'Tanggal Terbit',
      'Paket',
      'Siklus',
      'Metode Pembayaran',
      'Subtotal',
      'Diskon',
      'PPN 11%',
      'Total Tagihan',
      'Status',
    ]
    const rows = invoices.map((inv) => [
      inv.invoice_number,
      inv.issued_at,
      inv.plan_name,
      inv.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan',
      inv.payment_method,
      inv.base_amount,
      inv.discount_amount,
      inv.tax_amount,
      inv.total_amount,
      inv.status,
    ])
    const csvContent = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SyncCart_Invoices_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Top Executive Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1E8] border border-[#F6671E]/20 flex items-center justify-center text-[#F6671E] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#141413] tracking-tight">
                Langganan SaaS, Kuota Omnichannel & Tagihan
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1E8] text-[#F6671E] text-[11px] font-extrabold uppercase">
                Paket {currentPlanSpec.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-extrabold">
                {persistedCycle === 'annual' ? 'Siklus Tahunan (Hemat 20%)' : 'Siklus Bulanan'}
              </span>
            </div>
            <p className="text-xs text-[#6E6D68] mt-0.5">
              Kelola kapasitas toko <strong className="text-[#141413]">{store?.store_name || 'SyncCart Official Store'}</strong>, modul add-on tambahan, metode pembayaran auto-debit, serta faktur pajak resmi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPaymentFormGateway(store?.payment_gateway || PAYMENT_METHODS[0].id)
              setPaymentFormMasked(store?.payment_account_masked || PAYMENT_METHODS[0].masked)
              setPaymentFormAutoRenew(store?.auto_renew ?? true)
              setShowPaymentModal(true)
            }}
            className="h-9 px-3.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#141413] border border-[#E5E2DA] text-xs font-bold cursor-pointer transition-colors"
          >
            Metode Pembayaran
          </button>
          <button
            type="button"
            onClick={handleExportInvoicesCsv}
            className="h-9 px-3.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#141413] border border-[#E5E2DA] text-xs font-bold cursor-pointer transition-colors"
          >
            Export CSV Faktur
          </button>
          <button
            type="button"
            onClick={() => openCheckoutModal(currentPlanSpec, persistedCycle, activeAddonsList)}
            className="h-9 px-4 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer shadow-xs transition-colors"
          >
            Perbarui Paket / Add-on
          </button>
        </div>
      </div>

      {/* 4 Real-Time Usage & Quota Meter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Active Plan & Renewal Status */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Paket & Jatuh Tempo</span>
            <span className="px-2 py-0.5 rounded-md bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
              {store?.auto_renew !== false ? 'Auto-Debit Aktif' : 'Manual'}
            </span>
          </div>
          <div className="my-2">
            <p className="font-mono-tabular text-xl font-extrabold text-[#141413]">
              {currentPlanSpec.name}
            </p>
            <p className="text-[11px] text-[#6E6D68] mt-0.5">
              Perpanjangan: <strong className="text-[#141413]">{store?.subscription_renews_at || '28 Nov 2026'}</strong>
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F4F2ED]">
            <span className="text-[#6E6D68] truncate max-w-[170px]">
              {store?.payment_account_masked || 'BCA VA •••• 8821'}
            </span>
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="font-extrabold text-[#F6671E] hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* Card 2: Marketplace Channel Quota */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Kuota Toko Marketplace</span>
            <span className="font-mono-tabular text-[11px] font-extrabold text-[#F6671E]">
              {usageMetrics.channelPct}% Terpakai
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {usageMetrics.connectedChannels}
              </span>
              <span className="text-xs font-bold text-[#6E6D68]">
                / {usageMetrics.maxChannels} Channel Aktif
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F3F1EC] overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#F6671E] transition-all"
                style={{ width: `${usageMetrics.channelPct}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#6E6D68]">
            Shopee, Tokopedia & TikTok Shop tersinkronisasi
          </p>
        </div>

        {/* Card 3: Master SKU & WebP Cloud Storage Quota */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Kuota Katalog SKU & WebP</span>
            <span className="font-mono-tabular text-[11px] font-extrabold text-[#0F5132]">
              {usageMetrics.estimatedWebpMb} MB WebP
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {usageMetrics.totalSku}
              </span>
              <span className="text-xs font-bold text-[#6E6D68]">
                / {usageMetrics.maxSku.toLocaleString('id-ID')} SKU Master
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F3F1EC] overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#198754] transition-all"
                style={{ width: `${Math.max(4, usageMetrics.skuPct)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#6E6D68]">
            {usageMetrics.totalImages} aset foto terkompresi WebP di CDN
          </p>
        </div>

        {/* Card 4: Team RBAC Seats Quota */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E6D68]">Kuota Kursi Staf RBAC</span>
            <span className="font-mono-tabular text-[11px] font-extrabold text-[#141413]">
              {usageMetrics.staffPct}% Kursi
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {usageMetrics.totalStaff}
              </span>
              <span className="text-xs font-bold text-[#6E6D68]">
                / {usageMetrics.maxStaff} Anggota Tim
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F3F1EC] overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#141413] transition-all"
                style={{ width: `${usageMetrics.staffPct}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#6E6D68]">
            Mendukung 20 modul RBAC & matriks izin kustom
          </p>
        </div>
      </div>

      {/* Billing Cycle Switcher & Plan Comparison Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F2EFE9]">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
              Pilih Paket Kapasitas Omnichannel
            </h2>
            <p className="text-xs text-[#6E6D68]">
              Upgrade atau sesuaikan paket kapan saja. Seluruh perubahan kapasitas langsung aktif seketika.
            </p>
          </div>

          {/* Monthly vs Annual Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] self-start">
            <button
              type="button"
              onClick={() => setSelectedCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                selectedCycle === 'monthly'
                  ? 'bg-[#141413] text-[#FFFFFF]'
                  : 'text-[#6E6D68] hover:text-[#141413]'
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('annual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 ${
                selectedCycle === 'annual'
                  ? 'bg-[#F6671E] text-[#FFFFFF]'
                  : 'text-[#6E6D68] hover:text-[#141413]'
              }`}
            >
              <span>Tahunan</span>
              <span className="px-1.5 py-0.2 rounded bg-[#FFF1E8] text-[#9A3408] text-[10px] font-extrabold">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 SaaS Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLAN_CATALOG.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id
            const isSameCycle = persistedCycle === selectedCycle
            const displayPrice =
              selectedCycle === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl flex flex-col justify-between border transition-all ${
                  isCurrentPlan
                    ? 'bg-[#FFF6F0] border-2 border-[#F6671E] shadow-xs'
                    : plan.popular
                      ? 'bg-[#FFFFFF] border-[#F6671E]/50'
                      : 'bg-[#FAF9F6]/60 border-[#ECEAE4]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-[#141413]">{plan.name}</h3>
                    {isCurrentPlan ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F6671E] text-[#FFFFFF] text-[10px] font-extrabold uppercase">
                        Paket Aktif
                      </span>
                    ) : plan.popular ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1E8] text-[#9A3408] text-[10px] font-extrabold uppercase">
                        Paling Populer
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-[#6E6D68] min-h-[32px]">{plan.tagline}</p>

                  <div className="pt-1 pb-2 border-b border-[#ECEAE4]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                        {displayPrice === 0 ? 'Gratis' : formatRupiah(displayPrice)}
                      </span>
                      {displayPrice > 0 && (
                        <span className="text-xs font-semibold text-[#6E6D68]">/ bulan</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E6D68] mt-0.5">
                      {displayPrice === 0
                        ? 'Aktif selama 14 hari percobaan'
                        : selectedCycle === 'annual'
                          ? `Ditagih tahunan ${formatRupiah(displayPrice * 12)} / thn`
                          : 'Ditagih setiap bulan (bisa dibatalkan kapan saja)'}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-1 text-xs text-[#3F3E3A]">
                    {plan.highlights.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <span className="text-[#F6671E] font-extrabold mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-4">
                  <button
                    type="button"
                    onClick={() => openCheckoutModal(plan, selectedCycle, activeAddonsList)}
                    className={`w-full h-10 px-3 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      isCurrentPlan && isSameCycle
                        ? 'bg-[#FFFFFF] hover:bg-[#F3F1EC] text-[#141413] border border-[#D8D4C8]'
                        : 'bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF]'
                    }`}
                  >
                    {isCurrentPlan && isSameCycle
                      ? 'Perpanjang / Kelola Add-on'
                      : isCurrentPlan && !isSameCycle
                        ? `Ubah ke Siklus ${selectedCycle === 'annual' ? 'Tahunan' : 'Bulanan'}`
                        : `Pilih Paket ${plan.name}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modular Add-ons & Payment Method Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Modular Capacity Add-ons */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Modul Ekstensi & Add-on Kapasitas
              </h2>
              <p className="text-xs text-[#6E6D68]">
                Tambahkan kuota ekstra tanpa harus berpindah tier paket utama.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]">
              {activeAddonsList.length} Add-on Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADDON_CATALOG.map((addon) => {
              const isAdded = activeAddonsList.includes(addon.id)
              return (
                <div
                  key={addon.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                    isAdded
                      ? 'bg-[#FFF6F0] border-[#F6671E]'
                      : 'bg-[#FAF9F6]/70 border-[#ECEAE4]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-extrabold text-[#141413]">{addon.title}</h3>
                      {isAdded && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E6D68] mt-1">{addon.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#ECEAE4]">
                    <span className="font-mono-tabular text-xs font-extrabold text-[#9A3408]">
                      +{formatRupiah(addon.monthlyPrice)} / bln
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextAddons = isAdded
                          ? activeAddonsList.filter((id) => id !== addon.id)
                          : [...activeAddonsList, addon.id]
                        openCheckoutModal(currentPlanSpec, persistedCycle, nextAddons)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
                        isAdded
                          ? 'bg-[#FFFFFF] text-[#52524E] border border-[#D8D4C8] hover:bg-[#F3F1EC]'
                          : 'bg-[#141413] text-[#FFFFFF] hover:bg-[#2A2A28]'
                      }`}
                    >
                      {isAdded ? 'Kelola Add-on' : '+ Aktifkan'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 4 Cols: Payment Method & Billing Governance */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
                Metode Pembayaran & Auto-Debit
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#FFF1E8] text-[#9A3408] text-[10px] font-extrabold">
                Terverifikasi
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E6D68]">Gateway Pembayaran</span>
                <span className="text-xs font-extrabold text-[#141413]">
                  {store?.payment_gateway || 'Midtrans • BCA Virtual Account'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E6D68]">Nomor Terdaftar</span>
                <span className="font-mono-tabular text-xs font-extrabold text-[#9A3408]">
                  {store?.payment_account_masked || 'BCA VA •••• 8821'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E6D68]">Perpanjangan Otomatis</span>
                <span className="text-xs font-extrabold text-[#0F5132]">
                  {store?.auto_renew !== false ? 'Aktif (Auto-Renew)' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E6D68]">Kupon Promo Aktif</span>
                <span className="font-mono-tabular text-xs font-bold text-[#141413]">
                  {store?.coupon_code || 'SYNCCART10 (Diskon 10%)'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF6F0] border border-[#F6671E]/30 text-[11px] text-[#52524E] space-y-1">
              <p className="font-extrabold text-[#141413]">Tips Efisiensi Tagihan Startup:</p>
              <p>
                Gunakan kode kupon <strong className="text-[#9A3408]">SYNCCART10</strong> (hemat 10%) atau <strong className="text-[#9A3408]">STARTUP20</strong> (hemat 20%) saat checkout pembaruan paket.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPaymentFormGateway(store?.payment_gateway || PAYMENT_METHODS[0].id)
              setPaymentFormMasked(store?.payment_account_masked || PAYMENT_METHODS[0].masked)
              setPaymentFormAutoRenew(store?.auto_renew ?? true)
              setShowPaymentModal(true)
            }}
            className="w-full h-10 rounded-xl bg-[#141413] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-extrabold cursor-pointer transition-colors"
          >
            Konfigurasi Metode Pembayaran
          </button>
        </div>
      </div>

      {/* Subscription Invoice History Table */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#141413]">
              Riwayat Faktur & Tagihan Langganan
            </h2>
            <p className="text-xs text-[#6E6D68]">
              Seluruh transaksi upgrade paket, perpanjangan, dan rincian PPN 11% tercatat permanen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              placeholder="Cari no. invoice atau paket..."
              className="h-9 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs text-[#141413] focus:outline-none focus:border-[#F6671E]"
            />
            <select
              value={invoiceCycleFilter}
              onChange={(e) => setInvoiceCycleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
            >
              <option value="ALL">Semua Siklus ({rawInvoicesList.length})</option>
              <option value="monthly">Bulanan</option>
              <option value="annual">Tahunan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#ECEAE4] text-[#6E6D68] bg-[#FAF9F6]">
                <th className="py-3 px-3 font-bold rounded-tl-xl">No. Invoice</th>
                <th className="py-3 px-3 font-bold">Tanggal & Periode</th>
                <th className="py-3 px-3 font-bold">Paket & Siklus</th>
                <th className="py-3 px-3 font-bold">Metode Pembayaran</th>
                <th className="py-3 px-3 font-bold">Total Tagihan (Inc. PPN)</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right rounded-tr-xl">Faktur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEAE4]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#6E6D68]">
                    Belum ada faktur yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id || inv.invoice_number} className="hover:bg-[#FAF9F6]/70">
                    <td className="py-3 px-3 font-mono-tabular font-extrabold text-[#141413]">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#141413]">{inv.issued_at}</p>
                      <p className="text-[11px] text-[#6E6D68]">{inv.period_label}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-[#141413]">{inv.plan_name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-[#FFF1E8] text-[#9A3408] text-[10px] font-bold uppercase">
                        {inv.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#52524E] font-medium">
                      {inv.payment_method}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-extrabold text-[#141413]">
                      {formatRupiah(inv.total_amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-extrabold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#FFF1E8] text-[#141413] hover:text-[#9A3408] border border-[#E5E2DA] text-[11px] font-extrabold cursor-pointer transition-colors"
                      >
                        Lihat Faktur
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL 1: CHECKOUT & UPGRADE SUBSCRIPTION */}
      {checkoutModalPlan && checkoutCalculation && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setCheckoutModalPlan(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Checkout Langganan & Faktur Pajak Otomatis
                </span>
                <h3 className="text-base font-extrabold text-[#141413]">
                  Konfirmasi Paket {checkoutModalPlan.name} ({store?.store_name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalPlan(null)}
                className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] hover:text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Cycle Selector inside Checkout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutCycle('monthly')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    checkoutCycle === 'monthly'
                      ? 'bg-[#FFF6F0] border-2 border-[#F6671E]'
                      : 'bg-[#FAF9F6] border-[#ECEAE4]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#141413]">Siklus Bulanan</span>
                    <span className="font-mono-tabular text-xs font-extrabold text-[#9A3408]">
                      {formatRupiah(checkoutModalPlan.monthlyPrice)}/bln
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6D68] mt-1">
                    Tagihan fleksibel setiap 30 hari.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutCycle('annual')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    checkoutCycle === 'annual'
                      ? 'bg-[#FFF6F0] border-2 border-[#F6671E]'
                      : 'bg-[#FAF9F6] border-[#ECEAE4]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#141413]">
                      Siklus Tahunan (Hemat 20%)
                    </span>
                    <span className="font-mono-tabular text-xs font-extrabold text-[#0F5132]">
                      {formatRupiah(checkoutModalPlan.annualMonthlyPrice)}/bln
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6D68] mt-1">
                    Ditagih 12 bulan sekaligus + prioritas SLA.
                  </p>
                </button>
              </div>

              {/* Modular Add-ons Checklist */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#141413]">
                  Pilih Modul Add-on Ekstra (Opsional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADDON_CATALOG.map((addon) => {
                    const checked = checkoutAddons.includes(addon.id)
                    return (
                      <label
                        key={addon.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                          checked
                            ? 'bg-[#FFF6F0] border-[#F6671E]'
                            : 'bg-[#FAF9F6] border-[#ECEAE4]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setCheckoutAddons((prev) =>
                              prev.includes(addon.id)
                                ? prev.filter((id) => id !== addon.id)
                                : [...prev, addon.id]
                            )
                          }}
                          className="mt-0.5 accent-[#F6671E]"
                        />
                        <div className="text-xs">
                          <p className="font-extrabold text-[#141413]">{addon.title}</p>
                          <p className="font-mono-tabular text-[11px] font-bold text-[#9A3408]">
                            +{formatRupiah(addon.monthlyPrice)} / bln
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Payment Gateway & Promo Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Metode Pembayaran Gateway
                  </label>
                  <select
                    value={checkoutGateway}
                    onChange={(e) => {
                      const val = e.target.value
                      setCheckoutGateway(val)
                      const found = PAYMENT_METHODS.find((m) => m.id === val)
                      if (found) setCheckoutMasked(found.masked)
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-bold text-[#141413]"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.id} ({pm.masked})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Kode Promo / Kupon Diskon
                  </label>
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: SYNCCART10 atau STARTUP20"
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-mono-tabular font-bold text-[#141413] uppercase"
                  />
                </div>
              </div>

              {/* Invoice Breakdown Box */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#52524E]">
                  <span>
                    Paket {checkoutModalPlan.name} ({checkoutCalculation.months} bulan)
                  </span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(checkoutCalculation.baseSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#52524E]">
                  <span>
                    Modul Add-on ({checkoutAddons.length} item × {checkoutCalculation.months} bln)
                  </span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(checkoutCalculation.addonsSubtotal)}
                  </span>
                </div>
                {checkoutCalculation.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#0F5132] font-bold">
                    <span>Diskon Kupon ({checkoutCalculation.cleanPromo})</span>
                    <span className="font-mono-tabular">
                      -{formatRupiah(checkoutCalculation.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#52524E]">
                  <span>PPN Pertambahan Nilai (11%)</span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(checkoutCalculation.taxAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E2DA] flex items-center justify-between text-sm font-extrabold text-[#141413]">
                  <span>Total Pembayaran Tagihan</span>
                  <span className="font-mono-tabular text-base text-[#F6671E]">
                    {formatRupiah(checkoutCalculation.totalAmount)}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#52524E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkoutAutoRenew}
                  onChange={(e) => setCheckoutAutoRenew(e.target.checked)}
                  className="accent-[#F6671E]"
                />
                <span>
                  Aktifkan perpanjangan otomatis (Auto-Debit) pada akhir periode tagihan.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setCheckoutModalPlan(null)}
                  className="h-10 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#52524E] text-xs font-extrabold border border-[#E5E2DA] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCheckout}
                  className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCheckout
                    ? 'Memproses Pembayaran...'
                    : `Bayar & Aktifkan (${formatRupiah(checkoutCalculation.totalAmount)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: PAYMENT METHOD & AUTO-RENEW CONFIGURATION */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Pengaturan Billing & Auto-Debit
                </span>
                <h3 className="text-base font-extrabold text-[#141413]">
                  Metode Pembayaran Default Toko
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#141413]">
                  Pilih Kanal Pembayaran Utama
                </label>
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                      paymentFormGateway === pm.id
                        ? 'bg-[#FFF6F0] border-[#F6671E]'
                        : 'bg-[#FAF9F6] border-[#ECEAE4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment_gateway"
                        checked={paymentFormGateway === pm.id}
                        onChange={() => {
                          setPaymentFormGateway(pm.id)
                          setPaymentFormMasked(pm.masked)
                        }}
                        className="accent-[#F6671E]"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-[#141413]">{pm.id}</p>
                        <p className="text-[11px] text-[#6E6D68]">{pm.type}</p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-[#9A3408]">
                      {pm.masked}
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Identitas Rekening / Nomor Kartu Terenkripsi
                </label>
                <input
                  type="text"
                  value={paymentFormMasked}
                  onChange={(e) => setPaymentFormMasked(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-mono-tabular font-bold text-[#141413]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#141413] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentFormAutoRenew}
                  onChange={(e) => setPaymentFormAutoRenew(e.target.checked)}
                  className="accent-[#F6671E]"
                />
                <span>Izinkan pendebitan otomatis saat masa aktif langganan berakhir</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="h-10 px-4 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-xs font-extrabold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="h-10 px-5 rounded-xl bg-[#F6671E] hover:bg-[#E05612] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
                >
                  {isSavingPayment ? 'Menyimpan...' : 'Simpan Metode Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 3: PRINTABLE OFFICIAL TAX INVOICE SLIP */}
      {previewInvoice && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setPreviewInvoice(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#141413] text-[#FFFFFF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F6671E]">
                  Faktur Pajak & Bukti Pembayaran Sah
                </span>
                <h3 className="text-base font-extrabold font-mono-tabular">
                  {previewInvoice.invoice_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="w-8 h-8 rounded-lg bg-[#2A2A28] text-xs font-extrabold text-[#FFFFFF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-[#ECEAE4] pb-3">
                <div>
                  <p className="text-[11px] text-[#6E6D68]">Diterbitkan Untuk:</p>
                  <p className="font-extrabold text-sm text-[#141413]">
                    {store?.store_name || 'SyncCart Official Store'}
                  </p>
                  <p className="text-[11px] text-[#52524E]">{previewInvoice.period_label}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#E6F6EC] text-[#0F5132] font-extrabold">
                    {previewInvoice.status}
                  </span>
                  <p className="text-[11px] text-[#6E6D68] mt-1">
                    Tanggal: {previewInvoice.issued_at}
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#ECEAE4]">
                <div className="flex justify-between">
                  <span className="text-[#6E6D68]">Paket Langganan</span>
                  <span className="font-extrabold text-[#141413]">
                    {previewInvoice.plan_name} (
                    {previewInvoice.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6D68]">Metode Pembayaran</span>
                  <span className="font-bold text-[#141413]">{previewInvoice.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6D68]">Harga Dasar Paket</span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(previewInvoice.base_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6D68]">Biaya Modul Add-on</span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(previewInvoice.addons_amount)}
                  </span>
                </div>
                {previewInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-[#0F5132] font-bold">
                    <span>Potongan Diskon Promo</span>
                    <span className="font-mono-tabular">
                      -{formatRupiah(previewInvoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6E6D68]">PPN (11%)</span>
                  <span className="font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(previewInvoice.tax_amount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E2DA] flex justify-between text-sm font-extrabold text-[#141413]">
                  <span>Total Dibayar</span>
                  <span className="font-mono-tabular text-[#F6671E]">
                    {formatRupiah(previewInvoice.total_amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-9 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] border border-[#E5E2DA] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  Cetak Faktur PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="h-9 px-4 rounded-xl bg-[#F6671E] text-[#FFFFFF] text-xs font-extrabold cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
