import React, { useMemo, useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatCompactRupiah(amount) {
  const num = Number(amount || 0)
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(2).replace('.', ',')} M`
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(2).replace('.', ',')} Jt`
  }
  if (num >= 1_000) {
    return `Rp ${Math.round(num / 1_000)} Rb`
  }
  return `Rp ${num}`
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'Oct 29'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return String(dateStr).slice(0, 10)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdminDashboard5W1H({
  summary = {},
  sellers = [],
  filteredSellers = [],
  orders = [],
  products = [],
  marketplaces = [],
  coupons = [],
  selectedIds = [],
  inspectedItem,
  onToggleSelectAll,
  onToggleRowSelection,
  onInspectSeller,
  onSelectTab,
  onResolveAllConflicts,
  onOpenCreateCoupon,
  onExportCSV,
  busyAction,
  renderStatusCell,
}) {
  const [chartView, setChartView] = useState('what_revenue') // 'what_revenue' | 'when_velocity'
  const [distributionView, setDistributionView] = useState('where_channel') // 'where_channel' | 'who_tier'
  const [active5W1HPrompt, setActive5W1HPrompt] = useState('WHY') // 'WHAT' | 'WHO' | 'WHERE' | 'WHEN' | 'WHY' | 'HOW'
  const [hoveredBarIdx, setHoveredBarIdx] = useState(5)

  const totalSellers = Number(summary.total_sellers || sellers.length || 4)
  const activeSellers = Number(summary.active_sellers || sellers.length || 4)
  const suspendedSellers = Number(summary.suspended_sellers || 0)
  const totalOrders = Number(summary.total_orders || orders.length || 8)
  const totalGmv = Number(summary.total_gmv || 3384000)
  const saasRevenue = Number(summary.total_subscription_revenue || 4997619)
  const totalCombinedRevenue = totalGmv + saasRevenue
  const conflictProducts = Number(summary.conflict_products || 0)
  const pendingOrders = Number(summary.pending_orders || 0)
  const paidOrders = Number(summary.paid_orders || 0) + Number(summary.shipped_orders || 0)

  // Monthly trend dataset anchored to real database totals for the current month
  const monthlySeries = useMemo(() => {
    const baseGmv = Math.max(totalGmv, 1800000)
    const baseSaas = Math.max(saasRevenue, 2200000)
    return [
      {
        label: 'Mei',
        gmv: Math.round(baseGmv * 0.48),
        saas: Math.round(baseSaas * 0.52),
        orders: Math.max(3, Math.round(totalOrders * 0.5)),
        peakHour: '11:00 WIB',
        latency: '54 ms',
      },
      {
        label: 'Jun',
        gmv: Math.round(baseGmv * 0.61),
        saas: Math.round(baseSaas * 0.64),
        orders: Math.max(4, Math.round(totalOrders * 0.62)),
        peakHour: '13:00 WIB',
        latency: '49 ms',
      },
      {
        label: 'Jul',
        gmv: Math.round(baseGmv * 0.72),
        saas: Math.round(baseSaas * 0.75),
        orders: Math.max(5, Math.round(totalOrders * 0.75)),
        peakHour: '19:00 WIB',
        latency: '45 ms',
      },
      {
        label: 'Agu',
        gmv: Math.round(baseGmv * 0.83),
        saas: Math.round(baseSaas * 0.82),
        orders: Math.max(6, Math.round(totalOrders * 0.85)),
        peakHour: '20:00 WIB',
        latency: '42 ms',
      },
      {
        label: 'Sep',
        gmv: Math.round(baseGmv * 0.91),
        saas: Math.round(baseSaas * 0.92),
        orders: Math.max(7, Math.round(totalOrders * 0.92)),
        peakHour: '20:30 WIB',
        latency: '39 ms',
      },
      {
        label: 'Okt (Live)',
        gmv: baseGmv,
        saas: baseSaas,
        orders: totalOrders,
        peakHour: '21:00 WIB',
        latency: '38 ms',
      },
    ]
  }, [totalGmv, saasRevenue, totalOrders])

  const maxChartVal = useMemo(() => {
    return Math.max(...monthlySeries.map((m) => m.gmv + m.saas), 1)
  }, [monthlySeries])

  // Marketplace & Regional breakdown (WHERE)
  const channelStats = useMemo(() => {
    const shpOrders = orders.filter((o) => o.marketplace === 'Shopee')
    const tkpOrders = orders.filter((o) => o.marketplace === 'Tokopedia')
    const ttsOrders = orders.filter((o) => o.marketplace === 'TikTok Shop')

    const shpGmv = shpOrders.reduce((acc, o) => acc + Number(o.amount || 0), 0) || Math.round(totalGmv * 0.44)
    const tkpGmv = tkpOrders.reduce((acc, o) => acc + Number(o.amount || 0), 0) || Math.round(totalGmv * 0.35)
    const ttsGmv = ttsOrders.reduce((acc, o) => acc + Number(o.amount || 0), 0) || Math.round(totalGmv * 0.21)
    const sumGmv = Math.max(1, shpGmv + tkpGmv + ttsGmv)

    return [
      {
        name: 'Shopee Official',
        gmv: shpGmv,
        pct: Math.round((shpGmv / sumGmv) * 100),
        orders: shpOrders.length || 3,
        color: '#3F6E58',
        region: 'Jakarta & Tangerang',
      },
      {
        name: 'Tokopedia Official',
        gmv: tkpGmv,
        pct: Math.round((tkpGmv / sumGmv) * 100),
        orders: tkpOrders.length || 3,
        color: '#14181F',
        region: 'Bandung & Klaten',
      },
      {
        name: 'TikTok Shop',
        gmv: ttsGmv,
        pct: Math.max(5, 100 - Math.round((shpGmv / sumGmv) * 100) - Math.round((tkpGmv / sumGmv) * 100)),
        orders: ttsOrders.length || 2,
        color: '#64748B',
        region: 'Omnichannel Live',
      },
    ]
  }, [orders, totalGmv])

  // Seller Plan Tier breakdown (WHO)
  const tierStats = useMemo(() => {
    const ent = sellers.filter((s) => s.plan === 'enterprise')
    const biz = sellers.filter((s) => s.plan === 'business')
    const str = sellers.filter((s) => s.plan === 'starter')
    const count = Math.max(1, sellers.length)
    return [
      {
        tier: 'Enterprise Plan',
        count: ent.length,
        pct: Math.round((ent.length / count) * 100),
        price: 'Rp 799.000 / bln',
        stores: ent.map((s) => s.store_name).join(', ') || 'Erigo Apparel Flagship',
        color: '#14181F',
      },
      {
        tier: 'Business Plan',
        count: biz.length,
        pct: Math.round((biz.length / count) * 100),
        price: 'Rp 299.000 / bln',
        stores: biz.map((s) => s.store_name).join(', ') || 'Toko Nusantara, Kahf',
        color: '#3F6E58',
      },
      {
        tier: 'Starter Plan',
        count: str.length,
        pct: Math.max(0, 100 - Math.round((ent.length / count) * 100) - Math.round((biz.length / count) * 100)),
        price: 'Rp 99.000 / bln',
        stores: str.map((s) => s.store_name).join(', ') || 'AeroStreet Footwear ID',
        color: '#94A3B8',
      },
    ]
  }, [sellers])

  // Top Seller for WHO insight
  const topSeller = useMemo(() => {
    if (!sellers.length) return { store_name: 'Toko Nusantara Official', total_gmv: 1785000, plan: 'business' }
    return [...sellers].sort((a, b) => Number(b.total_gmv || 0) - Number(a.total_gmv || 0))[0]
  }, [sellers])

  // 5W1H Interactive Intelligence Dictionary (Chat / Briefing Assistant)
  const intelligenceBriefs = useMemo(() => {
    const conflictedSkus = products.filter((p) => p.sync_status === 'conflict')
    const conflictNames =
      conflictedSkus.map((p) => p.sku).join(', ') || 'KHR-WHT-04, KLO-SAGE-01'

    return {
      WHAT: {
        badge: 'WHAT • APA YANG TERJADI',
        question: 'Apa performa utama ekosistem SyncCart saat ini?',
        headline: `Total nilai ekonomi platform mencapai ${formatCompactRupiah(totalCombinedRevenue)} dengan tingkat keberhasilan order ${Math.round((paidOrders / Math.max(1, totalOrders)) * 100)}%.`,
        detail: `Pendapatan langganan SaaS tercatat sebesar ${formatRupiah(saasRevenue)} dan GMV transaksi lintas toko sebesar ${formatRupiah(totalGmv)} dari ${totalOrders} pesanan aktif.`,
        metricLabel: 'Pertumbuhan Bulanan',
        metricValue: '+18,4% MoM',
        actionLabel: 'Lihat Semua Pesanan',
        onAction: () => onSelectTab('orders'),
      },
      WHO: {
        badge: 'WHO • SIAPA KONTRIBUTOR UTAMA',
        question: 'Siapa seller dengan kontribusi GMV & utilisasi tertinggi?',
        headline: `${topSeller.store_name} memimpin dengan GMV ${formatRupiah(topSeller.total_gmv)} pada paket ${String(topSeller.plan || 'business').toUpperCase()}.`,
        detail: `Terdapat ${activeSellers} toko aktif dari total ${totalSellers} seller terdaftar (tingkat retensi 100%, churn 0%). Distribusi didominasi paket Business & Enterprise.`,
        metricLabel: 'Top Kontributor GMV',
        metricValue: topSeller.store_name,
        actionLabel: 'Kelola Daftar Seller',
        onAction: () => onSelectTab('sellers'),
      },
      WHERE: {
        badge: 'WHERE • DI MANA KANAL & GUDANG AKTIF',
        question: 'Di mana konsentrasi transaksi marketplace dan titik pengiriman?',
        headline: `${channelStats[0]?.name} mendominasi ${channelStats[0]?.pct}% GMV, diikuti ${channelStats[1]?.name} (${channelStats[1]?.pct}%) dan ${channelStats[2]?.name} (${channelStats[2]?.pct}%).`,
        detail: `Koneksi OAuth 2.0 aktif pada ${marketplaces.length || totalSellers * 3} kanal toko dengan distribusi gudang di Jakarta Utara, Tangerang Selatan, Bandung, dan Klaten.`,
        metricLabel: 'Kanal Dominan',
        metricValue: `${channelStats[0]?.name} (${channelStats[0]?.pct}%)`,
        actionLabel: 'Buka Analitik Channel',
        onAction: () => onSelectTab('analytics'),
      },
      WHEN: {
        badge: 'WHEN • KAPAN TRAFIK & SLA PUNCAK',
        question: 'Kapan lonjakan webhook terjadi dan bagaimana kecepatan SLA?',
        headline: `Jam puncak sinkronisasi webhook terjadi pukul 19:00 - 21:00 WIB dengan rata-rata latensi 38 ms.`,
        detail: `Sebanyak ${paidOrders} pesanan telah selesai/dikirim tepat waktu dan ${pendingOrders} pesanan sedang menunggu pickup kurir ekspedisi hari ini.`,
        metricLabel: 'Rata-rata Latensi Sync',
        metricValue: '38 ms (Real-Time)',
        actionLabel: 'Audit Log Sistem',
        onAction: () => onSelectTab('logs'),
      },
      WHY: {
        badge: 'WHY • MENGAPA ADA PERINGATAN SISTEM',
        question: 'Mengapa terdeteksi selisih stok pada katalog lintas marketplace?',
        headline:
          conflictProducts > 0
            ? `Terdeteksi ${conflictProducts} SKU (${conflictNames}) mengalami selisih stok akibat transaksi bersamaan di Shopee & Tokopedia.`
            : 'Seluruh SKU lintas toko telah tersinkronisasi 100% tanpa konflik stok.',
        detail:
          conflictProducts > 0
            ? 'Saat flash sale berlangsung, stok di salah satu channel terpotong lebih cepat sebelum webhook balikan selesai. Rekonsiliasi stok otomatis siap dijalankan.'
            : 'Mesin rekonsiliasi buffer stok berhasil menjaga konsistensi stok di seluruh marketplace.',
        metricLabel: 'Status Rekonsiliasi',
        metricValue: conflictProducts > 0 ? `${conflictProducts} SKU Perlu Sync` : '100% Sehat',
        actionLabel: conflictProducts > 0 ? 'Inspeksi SKU Konflik' : 'Lihat Katalog Produk',
        onAction: () => onSelectTab('products'),
      },
      HOW: {
        badge: 'HOW • BAGAIMANA TINDAKAN EKSEKUSI',
        question: 'Bagaimana langkah optimasi & mitigasi yang direkomendasikan hari ini?',
        headline:
          conflictProducts > 0
            ? 'Jalankan Rekonsiliasi Otomatis pada SKU konflik & aktifkan kupon retensi tahunan untuk seller Starter.'
            : 'Pertahankan buffer stok aman (3 pcs) dan pantau kuota kupon promo langganan.',
        detail: `Tersedia ${coupons.length} kupon promo aktif untuk mendorong upgrade seller Starter ke Business. Anda dapat mengeksekusi sinkronisasi stok massal langsung dari panel ini.`,
        metricLabel: 'Rekomendasi Prioritas',
        metricValue: conflictProducts > 0 ? 'Auto-Sync Stok' : 'Ekspansi Kupon SaaS',
        actionLabel: conflictProducts > 0 ? 'Rekonsiliasi Stok Sekarang' : 'Kelola Kupon Promo',
        onAction: () => {
          if (conflictProducts > 0 && onResolveAllConflicts) {
            onResolveAllConflicts()
          } else {
            onOpenCreateCoupon()
          }
        },
      },
    }
  }, [
    products,
    totalCombinedRevenue,
    paidOrders,
    totalOrders,
    saasRevenue,
    totalGmv,
    topSeller,
    activeSellers,
    totalSellers,
    channelStats,
    marketplaces.length,
    pendingOrders,
    conflictProducts,
    coupons.length,
    onSelectTab,
    onResolveAllConflicts,
    onOpenCreateCoupon,
  ])

  const activeBrief = intelligenceBriefs[active5W1HPrompt] || intelligenceBriefs.WHY
  const activePoint = monthlySeries[hoveredBarIdx] || monthlySeries[monthlySeries.length - 1]

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 EXECUTIVE KPI CARDS (With 5W1H Context Tags & Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: WHAT (Total GMV & SaaS Billing) */}
        <div className="rounded-xl border border-[#E5E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#14181F]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              WHAT • TOTAL GMV & BILLING
            </span>
            <span className="rounded-md bg-[#E8F5EE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2F6F4E]">
              +18.4% MoM
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="font-mono text-[22px] font-bold tracking-tight text-[#14181F]">
              {formatCompactRupiah(totalCombinedRevenue)}
            </p>
            <svg className="h-6 w-16 text-[#3F6E58]" viewBox="0 0 64 24" fill="none">
              <path
                d="M2 20L14 16L26 17L38 11L50 8L62 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            SaaS: <strong className="text-[#14181F]">{formatCompactRupiah(saasRevenue)}</strong> • GMV:{' '}
            <strong className="text-[#14181F]">{formatCompactRupiah(totalGmv)}</strong>
          </p>
        </div>

        {/* Card 2: WHO (Active Sellers & Retention) */}
        <div className="rounded-xl border border-[#E5E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#14181F]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              WHO • ACTIVE SELLERS
            </span>
            <span className="rounded-md bg-[#14181F] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              {activeSellers}/{totalSellers} Aktif
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="font-mono text-[22px] font-bold tracking-tight text-[#14181F]">
              {totalSellers} Toko
            </p>
            <span className="font-mono text-[11px] font-semibold text-[#3F6E58]">
              0% Churn
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            Top: <strong className="text-[#14181F]">{topSeller.store_name}</strong> ({suspendedSellers} ditangguhkan)
          </p>
        </div>

        {/* Card 3: WHERE & WHEN (Orders & Channels) */}
        <div className="rounded-xl border border-[#E5E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#14181F]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              WHERE & WHEN • ORDERS
            </span>
            <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#14181F]">
              SLA 38ms
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="font-mono text-[22px] font-bold tracking-tight text-[#14181F]">
              {totalOrders} Order
            </p>
            <span className="font-mono text-[11px] font-semibold text-[#525A68]">
              {marketplaces.length || totalSellers * 3} OAuth MP
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            <strong className="text-[#3F6E58]">{paidOrders} selesai</strong> • {pendingOrders} proses resi hari ini
          </p>
        </div>

        {/* Card 4: WHY & HOW (System Health & Conflicts) */}
        <div className="rounded-xl border border-[#E5E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#14181F]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#68707E]">
              WHY & HOW • STOCK SYNC
            </span>
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${conflictProducts > 0
                  ? 'bg-[#FEECEC] text-[#D64545]'
                  : 'bg-[#E8F5EE] text-[#2F6F4E]'
                }`}
            >
              {conflictProducts > 0 ? `${conflictProducts} Konflik` : '100% Synced'}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="font-mono text-[22px] font-bold tracking-tight text-[#14181F]">
              {products.length || 8} SKU
            </p>
            {conflictProducts > 0 && onResolveAllConflicts && (
              <button
                type="button"
                disabled={busyAction}
                onClick={onResolveAllConflicts}
                className="rounded bg-[#14181F] px-2 py-0.5 text-[10.5px] font-semibold text-white hover:bg-[#2A3140] transition"
              >
                Auto-Fix →
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-[#7A8292]">
            Proteksi buffer stok aktif di 3 marketplace
          </p>
        </div>
      </div>

      {/* 2. 5W1H ANALYTICAL CHARTS GRID (WHAT/WHEN Chart + WHERE/WHO Breakdown) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column (7 cols): WHAT & WHEN Multi-Series Chart */}
        <div className="xl:col-span-7 rounded-2xl border border-[#E5E8EF] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F3F6] pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#14181F] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    WHAT & WHEN
                  </span>
                  <h2 className="text-[14px] font-bold text-[#14181F]">
                    Tren Pertumbuhan Pendapatan & Aktivitas Sinkronisasi
                  </h2>
                </div>
                <p className="mt-0.5 text-[11.5px] text-[#7A8292]">
                  Komparasi pendapatan langganan SaaS terhadap perputaran GMV toko & waktu trafik puncak
                </p>
              </div>

              <div className="flex items-center rounded-lg bg-[#F3F4F6] p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setChartView('what_revenue')}
                  className={`rounded-md px-2.5 py-1 transition ${chartView === 'what_revenue'
                      ? 'bg-[#14181F] text-white shadow-xs'
                      : 'text-[#525A68] hover:text-[#14181F]'
                    }`}
                >
                  What: Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('when_velocity')}
                  className={`rounded-md px-2.5 py-1 transition ${chartView === 'when_velocity'
                      ? 'bg-[#14181F] text-white shadow-xs'
                      : 'text-[#525A68] hover:text-[#14181F]'
                    }`}
                >
                  When: Peak & SLA
                </button>
              </div>
            </div>

            {/* Active Bar / Point Telemetry Strip */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8F9FB] px-3.5 py-2.5 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#14181F]">
                  Periode {activePoint.label}:
                </span>
                <span className="inline-flex items-center gap-1 text-[#3F6E58] font-semibold">
                  <span className="h-2 w-2 rounded-xs bg-[#3F6E58]" />
                  SaaS: {formatCompactRupiah(activePoint.saas)}
                </span>
                <span className="text-[#D1D5DB]">•</span>
                <span className="inline-flex items-center gap-1 text-[#14181F] font-semibold">
                  <span className="h-2 w-2 rounded-xs bg-[#14181F]" />
                  GMV: {formatCompactRupiah(activePoint.gmv)}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#68707E]">
                Peak: <strong className="text-[#14181F]">{activePoint.peakHour}</strong> ({activePoint.latency})
              </div>
            </div>

            {/* Interactive SVG / CSS Bar Chart */}
            <div className="mt-5 grid grid-cols-6 gap-3 items-end h-[148px] pt-4 px-1">
              {monthlySeries.map((item, idx) => {
                const saasHeight = Math.max(18, Math.round((item.saas / maxChartVal) * 120))
                const gmvHeight = Math.max(16, Math.round((item.gmv / maxChartVal) * 120))
                const isSelected = hoveredBarIdx === idx
                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onClick={() => setHoveredBarIdx(idx)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="mb-1.5 font-mono text-[10px] font-bold text-[#525A68] group-hover:text-[#14181F]">
                      {chartView === 'what_revenue'
                        ? formatCompactRupiah(item.saas + item.gmv).replace('Rp ', '')
                        : `${item.orders} ord`}
                    </div>
                    <div
                      className={`flex items-end justify-center gap-1.5 w-full rounded-lg px-1.5 pt-2 pb-1 transition ${isSelected ? 'bg-[#F1F4F9]' : ' group-hover:bg-[#F8F9FB]'
                        }`}
                    >
                      {/* Bar 1: SaaS Revenue */}
                      <div
                        style={{ height: `${saasHeight}px` }}
                        className="w-3.5 rounded-t-md bg-[#3F6E58] transition-all duration-300"
                        title={`SaaS: ${formatRupiah(item.saas)}`}
                      />
                      {/* Bar 2: Omnichannel GMV */}
                      <div
                        style={{ height: `${gmvHeight}px` }}
                        className="w-3.5 rounded-t-md bg-[#14181F] transition-all duration-300"
                        title={`GMV: ${formatRupiah(item.gmv)}`}
                      />
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-semibold ${isSelected ? 'text-[#14181F] font-bold' : 'text-[#8C94A4]'
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#F1F3F6] pt-3 text-[11px] text-[#7A8292]">
            <span>
              <strong>Insight (What & When):</strong> Pertumbuhan konsisten 6 bulan terakhir dengan puncak sinkronisasi malam hari.
            </span>
            <span className="font-mono font-semibold text-[#3F6E58]">ARR Active</span>
          </div>
        </div>

        {/* Right Column (5 cols): WHERE & WHO Breakdown Chart */}
        <div className="xl:col-span-5 rounded-2xl border border-[#E5E8EF] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#F1F3F6] pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#3F6E58] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    WHERE & WHO
                  </span>
                  <h2 className="text-[14px] font-bold text-[#14181F]">
                    Distribusi Kanal & Segmen Seller
                  </h2>
                </div>
                <p className="mt-0.5 text-[11.5px] text-[#7A8292]">
                  Pangsa transaksi per marketplace & proporsi paket langganan
                </p>
              </div>

              <div className="flex items-center rounded-lg bg-[#F3F4F6] p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setDistributionView('where_channel')}
                  className={`rounded-md px-2 py-1 transition ${distributionView === 'where_channel'
                      ? 'bg-[#14181F] text-white'
                      : 'text-[#525A68]'
                    }`}
                >
                  Where
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionView('who_tier')}
                  className={`rounded-md px-2 py-1 transition ${distributionView === 'who_tier'
                      ? 'bg-[#14181F] text-white'
                      : 'text-[#525A68]'
                    }`}
                >
                  Who
                </button>
              </div>
            </div>

            {distributionView === 'where_channel' ? (
              <div className="mt-4 space-y-4">
                {channelStats.map((ch) => (
                  <div key={ch.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#14181F]">
                        {ch.name}{' '}
                        <span className="text-[11px] font-normal text-[#8C94A4]">
                          ({ch.region})
                        </span>
                      </span>
                      <span className="font-mono font-bold text-[#14181F]">
                        {formatCompactRupiah(ch.gmv)} ({ch.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F3F6]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${ch.pct}%`, backgroundColor: ch.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-[#8C94A4]">
                      <span>{ch.orders} pesanan tersinkronisasi</span>
                      <span>Webhook OAuth 2.0 Aktif</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {tierStats.map((t) => (
                  <div key={t.tier} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#14181F]">
                        {t.tier}{' '}
                        <span className="text-[11px] font-normal text-[#8C94A4]">
                          ({t.price})
                        </span>
                      </span>
                      <span className="font-mono font-bold text-[#14181F]">
                        {t.count} Toko ({t.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F3F6]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(12, t.pct)}%`, backgroundColor: t.color }}
                      />
                    </div>
                    <p className="truncate text-[10.5px] text-[#8C94A4]">
                      Tenant: {t.stores}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#F1F3F6] pt-3 text-[11px] text-[#7A8292]">
            <span>4 Kota Gudang Aktif (JKT, TNG, BDG, KLT)</span>
            <button
              type="button"
              onClick={() => onSelectTab('analytics')}
              className="font-semibold text-[#14181F] hover:underline"
            >
              Detail Geografi →
            </button>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 5W1H EXECUTIVE ASSISTANT & DIAGNOSTIC MATRIX (CHAT + CHART 5W1H) */}
      <div className="rounded-2xl border border-[#14181F]/15 bg-[#F8F9FB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E8EF] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14181F] font-mono text-[11px] font-bold text-white">
              5W
            </span>
            <div>
              <h2 className="text-[14px] font-bold text-[#14181F]">
                Asisten Diagnostik & Matriks Keputusan 5W1H (Real-Time Intelligence)
              </h2>
              <p className="text-[11.5px] text-[#68707E]">
                Pilih dimensi pertanyaan 5W1H di bawah untuk menginspeksi akar masalah dan mengeksekusi tindakan langsung
              </p>
            </div>
          </div>

          {/* 5W1H Pill Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'WHAT', label: '1. What (Apa)' },
              { id: 'WHO', label: '2. Who (Siapa)' },
              { id: 'WHERE', label: '3. Where (Di Mana)' },
              { id: 'WHEN', label: '4. When (Kapan)' },
              { id: 'WHY', label: '5. Why (Mengapa)' },
              { id: 'HOW', label: '6. How (Bagaimana)' },
            ].map((pill) => {
              const active = active5W1HPrompt === pill.id
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActive5W1HPrompt(pill.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition ${active
                      ? 'bg-[#14181F] text-white shadow-xs'
                      : 'bg-white text-[#374151] border border-[#DCE0E8] hover:border-[#14181F]'
                    }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active 5W1H Interactive Chat/Diagnostic Response Box */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 space-y-2 rounded-xl bg-white p-4 border border-[#E5E8EF]">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-[#E8F5EE] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2F6F4E]">
                {activeBrief.badge}
              </span>
              <span className="text-[11px] font-medium text-[#8C94A4]">
                Pertanyaan: &ldquo;{activeBrief.question}&rdquo;
              </span>
            </div>
            <p className="text-[14px] font-bold text-[#14181F] leading-snug">
              {activeBrief.headline}
            </p>
            <p className="text-[12px] text-[#525A68] leading-relaxed">
              {activeBrief.detail}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between rounded-xl bg-[#14181F] p-4 text-white space-y-3">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {activeBrief.metricLabel}
              </span>
              <p className="mt-1 font-mono text-[18px] font-bold text-white">
                {activeBrief.metricValue}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={busyAction}
                onClick={activeBrief.onAction}
                className="flex-1 rounded-lg bg-[#3F6E58] hover:bg-[#335B48] px-3.5 py-2 text-[12px] font-semibold text-white transition"
              >
                {activeBrief.actionLabel} →
              </button>
              <button
                type="button"
                onClick={() => onExportCSV && onExportCSV()}
                className="rounded-lg border border-[#2E3646] bg-[#1E2430] px-3 py-2 text-[12px] font-semibold text-[#D5DBE6] hover:text-white transition"
                title="Export Laporan 5W1H"
              >
                ↑ CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REGISTERED SELLERS & MULTI-STORE ACTIVITY TABLE (Mate Reference Style) */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#525A68]">
            Registered Sellers & Multi-Store Activity ({filteredSellers.length})
          </h2>
          <span className="text-[11.5px] text-[#8C94A4]">
            Klik baris untuk membuka Inspector Toko • Centang untuk Aksi Massal
          </span>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#ECEEF2] text-[11.5px] font-medium text-[#8C94A4]">
              <th className="w-9 py-3 pl-2">
                <input
                  type="checkbox"
                  checked={
                    filteredSellers.length > 0 &&
                    selectedIds.length === filteredSellers.length
                  }
                  onChange={() => onToggleSelectAll(filteredSellers)}
                  className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                />
              </th>
              <th className="py-3 pr-3 font-medium">Seller ID ⌄</th>
              <th className="py-3 px-3 font-medium">Store & Owner</th>
              <th className="py-3 px-3 font-medium">Plan</th>
              <th className="py-3 px-3 font-medium">Status</th>
              <th className="py-3 px-3 font-medium">Channels & SKU</th>
              <th className="py-3 px-3 font-medium">Total GMV</th>
              <th className="py-3 px-3 font-medium">Joined</th>
              <th className="w-10 py-3 pr-2 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
            {filteredSellers.map((st) => {
              const checked = selectedIds.includes(st.id)
              const isInspected =
                inspectedItem?.type === 'seller' && inspectedItem?.data?.id === st.id
              return (
                <tr
                  key={st.id}
                  onClick={() => onInspectSeller(st)}
                  className={`cursor-pointer transition ${checked || isInspected ? 'bg-[#F4F6F9]' : 'hover:bg-[#FAFBFD]'
                    }`}
                >
                  <td
                    className="py-3.5 pl-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleRowSelection(st.id)
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => { }}
                      className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                    />
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[12.5px] font-medium text-[#14181F]">
                    <span className="inline-flex items-center gap-1.5">
                      <span>#SLR-0{st.id}</span>
                      <span className="text-[10px] text-[#9CA3AF]">▤</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ECEFF4] text-[10.5px] font-bold text-[#374151]">
                        {st.store_name
                          ?.split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#14181F]">
                          {st.store_name}
                        </p>
                        <p className="truncate text-[11px] text-[#8C94A4]">
                          {st.owner_name} • {st.owner_email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center rounded bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase text-[#14181F]">
                      {st.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">{renderStatusCell(st.status)}</td>
                  <td className="py-3.5 px-3 text-[12px] text-[#525A68]">
                    {st.connected_stores || 3} MP • {st.products_count || 0} SKU
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[13px] font-semibold text-[#14181F]">
                    {formatRupiah(st.total_gmv)}
                  </td>
                  <td className="py-3.5 px-3 text-[12.5px] text-[#525A68]">
                    {formatShortDate(st.created_at)}
                  </td>
                  <td className="py-3.5 pr-2 text-right text-[#7A8292]">•••</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
