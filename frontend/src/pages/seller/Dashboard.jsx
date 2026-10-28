import React, { useMemo, useState } from 'react'

const ANALYTICS_SERIES = {
  monthly: [
    { month: 'Jan', primary: 78, secondary: 94, orders: 98, synced: 120 },
    { month: 'Feb', primary: 68, secondary: 84, orders: 86, synced: 108 },
    { month: 'Mar', primary: 52, secondary: 66, orders: 64, synced: 82 },
    { month: 'Apr', primary: 82, secondary: 96, orders: 110, synced: 84 },
    { month: 'May', primary: 48, secondary: 64, orders: 59, synced: 76 },
    { month: 'Jun', primary: 74, secondary: 90, orders: 94, synced: 115 },
    { month: 'Jul', primary: 62, secondary: 76, orders: 79, synced: 96 },
  ],
  annually: [
    { month: 'Jan', primary: 84, secondary: 98, orders: 940, synced: 1120 },
    { month: 'Feb', primary: 76, secondary: 90, orders: 880, synced: 1040 },
    { month: 'Mar', primary: 64, secondary: 80, orders: 760, synced: 910 },
    { month: 'Apr', primary: 90, secondary: 100, orders: 110, synced: 84 },
    { month: 'May', primary: 60, secondary: 76, orders: 710, synced: 860 },
    { month: 'Jun', primary: 82, secondary: 95, orders: 1080, synced: 1190 },
    { month: 'Jul', primary: 72, secondary: 88, orders: 890, synced: 1020 },
  ],
}

const EMPTY_ARRAY = []

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatCompactMillions(amount) {
  const num = Number(amount || 0)
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1).replace('.', ',')} Jt`
  }
  return formatRupiah(num)
}

function ProductVisualBanner({ product, index }) {
  const palettes = [
    {
      bg: 'linear-gradient(135deg, #1E3A34 0%, #2E5A4E 55%, #F6671E 135%)',
      tag: 'Kemeja Linen',
    },
    {
      bg: 'linear-gradient(135deg, #2B2623 0%, #52473F 55%, #D97742 135%)',
      tag: 'Celana Chino',
    },
    {
      bg: 'linear-gradient(135deg, #181816 0%, #33312E 55%, #F6671E 135%)',
      tag: 'Outer Tenun',
    },
  ]
  const style = palettes[index % palettes.length]

  return (
    <div
      className="relative h-28 w-full rounded-xl overflow-hidden p-3 flex flex-col justify-between text-white"
      style={{ background: style.bg }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-bold text-white border border-white/15 truncate">
          {product.category || style.tag}
        </span>
        <span className="font-mono-tabular px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#141413] text-[10px] font-extrabold shrink-0">
          {product.sku}
        </span>
      </div>

      <div className="flex items-end justify-between gap-1.5">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#FFDECE] font-bold">
            Sinkron 3 Toko
          </p>
          <p className="text-[11px] font-extrabold text-white">
            SHP {product.shopee_stock} • TKP {product.tokopedia_stock} • TTS {product.tiktok_stock}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
            product.sync_status === 'conflict'
              ? 'bg-[#FDE8E8] text-[#9B1C1C]'
              : 'bg-[#FFDECE] text-[#141413]'
          }`}
        >
          {product.sync_status === 'conflict' ? 'Selisih' : 'Aktif'}
        </span>
      </div>
    </div>
  )
}

export function SellerDashboardPage({
  overview,
  globalSearch = '',
  onAdjustStock,
  onShipOrder,
  onSelectTab,
}) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState('annually')
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(3)
  const [paymentSearch, setPaymentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [catalogSort, setCatalogSort] = useState('popular')
  const [selectedOrderIds, setSelectedOrderIds] = useState([])

  const products = overview?.products || EMPTY_ARRAY
  const orders = overview?.orders || EMPTY_ARRAY
  const marketplaces = overview?.marketplaces || EMPTY_ARRAY
  const metrics = overview?.metrics || {}

  const series = ANALYTICS_SERIES[analyticsPeriod]
  const activePoint = series[selectedMonthIdx] || series[3]

  const filteredOrders = useMemo(() => {
    const query = (paymentSearch || globalSearch).trim().toLowerCase()
    const list = orders.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      const matchesQuery =
        !query ||
        item.order_number?.toLowerCase().includes(query) ||
        item.payment_code?.toLowerCase().includes(query) ||
        item.buyer_name?.toLowerCase().includes(query) ||
        item.product_name?.toLowerCase().includes(query) ||
        item.marketplace?.toLowerCase().includes(query)
      return matchesStatus && matchesQuery
    })

    if (sortBy === 'amount_desc') {
      return [...list].sort((a, b) => b.amount - a.amount)
    }
    return list
  }, [orders, paymentSearch, globalSearch, statusFilter, sortBy])

  const sortedCatalog = useMemo(() => {
    const query = globalSearch.trim().toLowerCase()
    const base = products.filter(
      (p) =>
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.warehouse?.toLowerCase().includes(query)
    )
    if (catalogSort === 'low_stock') {
      return [...base].sort((a, b) => a.stock - b.stock)
    }
    if (catalogSort === 'price_desc') {
      return [...base].sort((a, b) => b.price - a.price)
    }
    return [...base].sort((a, b) => b.sold_count - a.sold_count)
  }, [products, catalogSort, globalSearch])

  function handleToggleOrderSelect(orderId) {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const totalCatalogUnits = Number(metrics.total_sold || 0) + Number(metrics.total_stock || 0)
  const totalOrdersAllChannels = Number(metrics.total_orders ?? orders.length)
  const totalSyncedListings =
    metrics.total_synced_listings !== undefined
      ? Number(metrics.total_synced_listings)
      : marketplaces.reduce(
          (acc, m) => acc + (m.status === 'connected' ? Number(m.products_synced || 0) : 0),
          0
        )
  const liveTotalRevenue = marketplaces.reduce(
    (acc, m) => acc + Number(m.revenue_this_month || 0),
    0
  )
  const safeRevDenominator = liveTotalRevenue > 0 ? liveTotalRevenue : 1
  const shopeePct = Math.round(
    (Number(marketplaces[0]?.revenue_this_month || 0) / safeRevDenominator) * 100
  )
  const tokpedPct = Math.round(
    (Number(marketplaces[1]?.revenue_this_month || 0) / safeRevDenominator) * 100
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
      {/* LEFT MAIN AREA (9 cols on XL matching RentFlow exact ratio) */}
      <div className="xl:col-span-9 flex flex-col gap-4">
        {/* TOP ROW: 3 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KPI Card 1 */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#52524E]">Produk & Terjual</span>
              <span className="w-8 h-8 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-center text-[#141413]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 21H21M5 21V7L12 3L19 7V21M9 21V13H15V21"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                  {totalCatalogUnits.toLocaleString('id-ID')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                  +8.0%
                </span>
              </div>

              <div className="flex items-end gap-1.5 h-9" aria-hidden="true">
                {[55, 75, 100, 84, 65, 58].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-2 rounded-full ${
                      i === 2 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* KPI Card 2 */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#52524E]">Pesanan Bulan Ini</span>
              <span className="w-8 h-8 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-center text-[#141413]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M11 4H4V20H20V13M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                  {totalOrdersAllChannels.toLocaleString('id-ID')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                  +4.2%
                </span>
              </div>

              <svg width="72" height="34" viewBox="0 0 74 38" fill="none" aria-hidden="true">
                <path
                  d="M2 34C9 34 11 8 18 8C25 8 28 28 35 28C42 28 45 12 52 12C59 12 63 26 72 6"
                  stroke="#D97742"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* KPI Card 3 */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#52524E]">Listing Tersinkron</span>
              <span className="w-8 h-8 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-center text-[#141413]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" stroke="#141413" strokeWidth="1.8" />
                  <path
                    d="M3 19C3 16 5.5 14 9 14C12.5 14 15 16 15 19M16 11H21M18.5 8.5V13.5"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                  {totalSyncedListings.toLocaleString('id-ID')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                  +8.0%
                </span>
              </div>

              <div className="flex items-end gap-1.5 h-9" aria-hidden="true">
                {[45, 70, 100, 62, 50].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-2 rounded-full ${
                      i === 2 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Sales Analytics Bar Chart + Marketplace Overview Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left (7 cols): Sales Analytics with Floating Callout matching RentFlow */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-extrabold text-[#141413]">Sales Analytics</h2>

              <div className="flex items-center gap-2">
                <div className="p-0.5 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] flex items-center text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod('monthly')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                      analyticsPeriod === 'monthly'
                        ? 'bg-[#F6671E] text-[#141413]'
                        : 'text-[#52524E] hover:text-[#141413]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod('annually')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                      analyticsPeriod === 'annually'
                        ? 'bg-[#F6671E] text-[#141413]'
                        : 'text-[#52524E] hover:text-[#141413]'
                    }`}
                  >
                    Annually
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTab('reports')}
                  title="Buka laporan lengkap"
                  className="w-7 h-7 rounded-lg border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/40 flex items-center justify-center text-[#141413] font-bold cursor-pointer"
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Chart Area with Floating Callout matching RentFlow Apr Callout */}
            <div className="relative mt-4 pt-2">
              <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-4 z-10 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-md text-[11px] space-y-0.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#52524E] font-medium">
                    Order Selesai ({activePoint.month})
                  </span>
                  <strong className="font-mono-tabular font-extrabold text-[#9A3408]">
                    {activePoint.orders}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#52524E] font-medium">Sync Stok</span>
                  <strong className="font-mono-tabular font-extrabold text-[#141413]">
                    {activePoint.synced}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-end h-44">
                <div className="col-span-2 h-full flex flex-col justify-between text-[11px] font-mono-tabular text-[#52524E] pb-6">
                  <span>15k</span>
                  <span>10k</span>
                  <span>5k</span>
                  <span>1k</span>
                  <span>0</span>
                </div>

                <div className="col-span-10 h-full grid grid-cols-7 gap-2 items-end">
                  {series.map((item, idx) => {
                    const isSelected = idx === selectedMonthIdx
                    return (
                      <button
                        key={item.month}
                        type="button"
                        onClick={() => setSelectedMonthIdx(idx)}
                        onMouseEnter={() => setSelectedMonthIdx(idx)}
                        className="group h-full flex flex-col items-center justify-end gap-1.5 cursor-pointer focus:outline-none"
                        aria-label={`Analitik bulan ${item.month}: ${item.orders} pesanan selesai`}
                      >
                        <div className="relative w-7 sm:w-8 h-36 flex items-end justify-center">
                          <div
                            style={{ height: `${item.secondary}%` }}
                            className="w-full rounded-full bg-[#FFDECE] transition-all duration-300 flex items-end overflow-hidden"
                          >
                            <div
                              style={{ height: `${item.primary}%` }}
                              className={`w-full rounded-full bg-[#F6671E] transition-all duration-300 ${
                                isSelected ? 'brightness-95' : ''
                              }`}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-medium ${
                            isSelected ? 'text-[#141413] font-extrabold' : 'text-[#52524E]'
                          }`}
                        >
                          {item.month}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right (5 cols): Marketplace Overview Donut Chart */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-[#141413]">Marketplace Overview</h2>
              <button
                type="button"
                onClick={() => onSelectTab('marketplace')}
                title="Kelola koneksi marketplace"
                className="w-7 h-7 rounded-lg border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/40 flex items-center justify-center text-[#141413] font-bold cursor-pointer"
              >
                ⋮
              </button>
            </div>

            <div className="my-auto py-2 flex items-center justify-between gap-4">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                <svg width="136" height="136" viewBox="0 0 42 42" className="-rotate-90">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#FFDECE"
                    strokeWidth="5.5"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#F6671E"
                    strokeWidth="5.5"
                    strokeDasharray={`${shopeePct} ${100 - shopeePct}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#F99B6B"
                    strokeWidth="5.5"
                    strokeDasharray={`${tokpedPct} ${100 - tokpedPct}`}
                    strokeDashoffset={`-${shopeePct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                  <span className="font-mono-tabular text-xs sm:text-sm font-extrabold text-[#141413]">
                    {formatCompactMillions(liveTotalRevenue)}
                  </span>
                  <span className="text-[10px] font-medium text-[#52524E]">Total Revenue</span>
                </div>
              </div>

              <div className="space-y-2.5 w-full">
                {marketplaces.map((mp, index) => {
                  const dotColors = ['bg-[#F6671E]', 'bg-[#F99B6B]', 'bg-[#FFDECE]']
                  return (
                    <div key={mp.id || mp.platform} className="flex items-start gap-2">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          dotColors[index % dotColors.length]
                        }`}
                      />
                      <div>
                        <p className="text-xs font-extrabold text-[#141413] leading-tight">
                          {mp.platform}{' '}
                          <span className="text-[10px] font-normal text-[#52524E]">
                            ({mp.orders_this_month} order)
                          </span>
                        </p>
                        <p className="font-mono-tabular text-[11px] font-medium text-[#52524E]">
                          {formatRupiah(mp.revenue_this_month)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Recent Orders & Payments Table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h2 className="text-[15px] font-extrabold text-[#141413]">Recent Payments & Orders</h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <label htmlFor="recent-orders-search" className="sr-only">
                  Cari pesanan
                </label>
                <input
                  id="recent-orders-search"
                  type="search"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search"
                  className="h-[32px] px-3 rounded-lg bg-[#F7F6F3] border border-[#ECEAE4] text-xs text-[#141413] placeholder:text-[#767470] focus:outline-none focus:border-[#F6671E]"
                />
              </div>

              <select
                aria-label="Filter status pesanan"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-[32px] px-2.5 rounded-lg bg-[#F7F6F3] border border-[#ECEAE4] text-xs font-semibold text-[#141413] cursor-pointer"
              >
                <option value="ALL">Filter: Semua</option>
                <option value="Pending">Pending</option>
                <option value="Perlu Resi">Perlu Resi</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  setSortBy((prev) => (prev === 'newest' ? 'amount_desc' : 'newest'))
                }
                className="h-[32px] px-2.5 rounded-lg bg-[#F7F6F3] border border-[#ECEAE4] hover:bg-[#FFDECE]/40 text-xs font-semibold text-[#141413] cursor-pointer"
              >
                ⇅ {sortBy === 'newest' ? 'Sort by' : 'Nominal'}
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-center space-y-1">
              <p className="text-xs font-bold text-[#141413]">
                Tidak ada pesanan yang cocok dengan filter
              </p>
              <p className="text-[11px] text-[#52524E]">
                Ubah kata kunci pencarian atau pilih Filter: Semua.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEAE4] text-[11px] font-medium text-[#767470]">
                    <th className="py-2 pr-2 w-7">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua pesanan"
                        checked={
                          filteredOrders.length > 0 &&
                          selectedOrderIds.length === filteredOrders.length
                        }
                        onChange={(e) =>
                          setSelectedOrderIds(
                            e.target.checked ? filteredOrders.map((o) => o.id) : []
                          )
                        }
                        className="rounded border-[#ECEAE4] accent-[#F6671E]"
                      />
                    </th>
                    <th className="py-2 px-2">Payment ID</th>
                    <th className="py-2 px-2">Produk & Info Channel</th>
                    <th className="py-2 px-2">Customer Name</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 pl-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAE4] text-xs">
                  {filteredOrders.map((order) => {
                    const isDanger = order.status === 'Perlu Resi' || order.status === 'Failed'
                    return (
                      <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-2.5 pr-2">
                          <input
                            type="checkbox"
                            aria-label={`Pilih pesanan ${order.payment_code}`}
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => handleToggleOrderSelect(order.id)}
                            className="rounded border-[#ECEAE4] accent-[#F6671E]"
                          />
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular font-bold text-[#141413] whitespace-nowrap">
                          {order.payment_code || `ID: ${order.id}`}
                        </td>
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-[#141413] leading-tight">
                            {order.product_name}
                          </p>
                          <p className="text-[11px] text-[#767470] truncate max-w-[210px]">
                            {order.property_sub}
                          </p>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full bg-[#FFDECE] border border-[#F6671E]/40 flex items-center justify-center font-mono-tabular text-[10px] font-extrabold text-[#141413] shrink-0"
                              aria-hidden="true"
                            >
                              {order.buyer_initials || 'SC'}
                            </span>
                            <span className="font-semibold text-[#141413]">{order.buyer_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono-tabular font-bold text-[#141413] whitespace-nowrap">
                          {formatRupiah(order.amount)}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isDanger
                                ? 'bg-[#FDE8E8] text-[#9B1C1C] border-[#F8B4B4]'
                                : 'bg-[#E6F6EC] text-[#0F5132] border-[#A3E2B8]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                          {order.status === 'Perlu Resi' || order.status === 'Pending' ? (
                            <button
                              type="button"
                              onClick={() =>
                                onShipOrder(order.id, {
                                  courier: order.courier,
                                  tracking_resi: '',
                                  status: 'Shipped',
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Input Resi
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectTab('orders')}
                              className="px-2 py-0.5 rounded-lg text-[#52524E] hover:text-[#141413] font-bold cursor-pointer"
                              title="Lihat detail pesanan"
                            >
                              ⋮
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN PANEL (3 cols on XL matching "My Properties" width in RentFlow screenshot) */}
      <aside className="xl:col-span-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold text-[#141413]">Katalog Toko</h2>

            <select
              aria-label="Urutkan katalog unggulan"
              value={catalogSort}
              onChange={(e) => setCatalogSort(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#F7F6F3] border border-[#ECEAE4] text-[11px] font-semibold text-[#52524E] cursor-pointer"
            >
              <option value="popular">Recent / Terlaris</option>
              <option value="low_stock">Stok Menipis</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>

          <div className="space-y-3">
            {sortedCatalog.slice(0, 3).map((product, index) => (
              <article
                key={product.id || product.sku}
                className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-2 hover:border-[#F6671E]/50 transition-colors"
              >
                <ProductVisualBanner product={product} index={index} />

                <div className="space-y-0.5 px-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-mono-tabular text-sm font-extrabold text-[#9A3408]">
                      {formatRupiah(product.price)}{' '}
                      <span className="text-[11px] font-normal text-[#767470]">/ pcs</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onAdjustStock(product.id, -1)}
                        disabled={product.stock <= 0}
                        className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-[10px] font-bold text-[#141413] cursor-pointer disabled:opacity-40"
                        title="Kurangi 1 stok"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustStock(product.id, 5)}
                        className="px-1.5 py-0.5 rounded bg-[#FFDECE] hover:bg-[#F6671E] text-[10px] font-bold text-[#141413] cursor-pointer"
                        title="Tambah 5 stok"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <h3 className="text-[13px] font-extrabold text-[#141413] truncate">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-[#767470] truncate">
                    📍 {product.warehouse}
                  </p>
                </div>

                {/* 3 Metadata Specs Row matching "3 Bed | 2 Bath | 1200 Sqft" */}
                <div className="pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[10px] font-semibold text-[#52524E] px-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6671E]" />
                    <strong className="font-mono-tabular text-[#141413]">
                      {product.stock} Stok
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6671E]" />
                    <strong className="font-mono-tabular text-[#141413]">
                      {product.sold_count} Terjual
                    </strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#9A3408] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6671E]" />3 Channel
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('products')}
          className="w-full h-[36px] px-3 rounded-xl bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-xs font-extrabold transition-colors cursor-pointer"
        >
          Kelola Semua Produk ({products.length} SKU)
        </button>
      </aside>
    </div>
  )
}
