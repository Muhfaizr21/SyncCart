import React from 'react'

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

export default function AdminRightRail({
  summary = {},
  sellers = [],
  marketplaces = [],
  onInspectSeller,
}) {
  const totalSellers = Number(summary.total_sellers || sellers.length || 4)
  const activeSellers = Number(summary.active_sellers || sellers.length || 4)
  const suspendedSellers = Number(summary.suspended_sellers || 0)
  const totalOrders = Number(summary.total_orders || 0)
  const totalGmv = Number(summary.total_gmv || 0)
  const subRevenue = Number(summary.total_subscription_revenue || 0)
  const totalPlatformRevenue = totalGmv + subRevenue
  const totalProducts = Number(summary.total_products || 1)
  const conflictProducts = Number(summary.conflict_products || 0)

  const activeConnections =
    marketplaces.filter((m) => m.status === 'connected').length || totalSellers * 3

  // Marketplace distribution across connected stores
  const shopeePct = 44
  const tokopediaPct = 35
  const tiktokPct = 21

  // Semi-circle gauge SVG math (Active Seller & SLA Health %)
  const healthPct =
    totalSellers > 0 ? Math.round((activeSellers / totalSellers) * 100) : 92
  const radius = 76
  const circumference = Math.PI * radius
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(20, healthPct)) / 100) * circumference

  const rankedSellers = [...sellers].sort(
    (a, b) => Number(b.total_gmv || 0) - Number(a.total_gmv || 0)
  )

  const churnRate =
    totalSellers > 0 ? ((suspendedSellers / totalSellers) * 100).toFixed(1) : '0.0'

  return (
    <aside className="flex w-[320px] xl:w-[348px] shrink-0 flex-col justify-between border-l border-[#ECEEF2] bg-white px-6 py-6 overflow-y-auto">
      <div className="space-y-7">
        {/* 1. RECEIPT OF GOODS & GMV GAUGE */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-[0.08em] text-[#14181F] uppercase">
              RECEIPT OF GOODS
            </h3>
            <span className="text-[11px] font-medium text-[#8C94A4]">All-Time ⌄</span>
          </div>

          <div className="relative mt-4 flex flex-col items-center">
            <svg className="h-[112px] w-[196px] overflow-visible" viewBox="0 0 180 100">
              <path
                d="M 14 90 A 76 76 0 0 1 166 90"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M 14 90 A 76 76 0 0 1 166 90"
                fill="none"
                stroke="#3F6E58"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="-mt-12 text-center">
              <p className="font-mono text-[24px] font-bold tracking-tight text-[#14181F]">
                {formatCompactRupiah(totalPlatformRevenue)}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-[#8C94A4]">
                {totalSellers} sellers • {totalOrders} orders
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pt-1">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-[#3F6E58]" />
                <span className="font-mono text-[14px] font-bold text-[#14181F]">
                  {formatCompactRupiah(subRevenue)}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">SaaS Subscriptions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-[#D1D5DB]" />
                <span className="font-mono text-[14px] font-bold text-[#14181F]">
                  {formatCompactRupiah(totalGmv)}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">Omnichannel GMV</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F0F2F5]" />

        {/* 2. MARKETPLACE DISTRIBUTION */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-[0.08em] text-[#14181F] uppercase">
              MARKETPLACE SHARE
            </h3>
            <span className="text-[11.5px] font-medium text-[#7A8292]">
              {activeConnections} Active ⌄
            </span>
          </div>

          {/* Segmented Horizontal Progress Bar */}
          <div className="mt-3.5 flex h-2 w-full overflow-hidden rounded-full bg-[#F1F3F6] gap-0.5">
            <div
              className="h-full rounded-l-full bg-[#3F6E58]"
              style={{ width: `${shopeePct}%` }}
            />
            <div
              className="h-full bg-[#14181F]"
              style={{ width: `${tokopediaPct}%` }}
            />
            <div
              className="h-full rounded-r-full bg-[#D1D5DB]"
              style={{ width: `${tiktokPct}%` }}
            />
          </div>

          <div className="mt-4 space-y-2.5 text-[12.5px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#525A68]">
                <span className="h-2 w-2 rounded-[2px] bg-[#3F6E58]" />
                <span>Shopee Official</span>
              </span>
              <span className="font-mono font-semibold text-[#68707E]">{shopeePct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#525A68]">
                <span className="h-2 w-2 rounded-[2px] bg-[#14181F]" />
                <span>Tokopedia Official</span>
              </span>
              <span className="font-mono font-bold text-[#14181F]">{tokopediaPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#525A68]">
                <span className="h-2 w-2 rounded-[2px] bg-[#D1D5DB]" />
                <span>TikTok Shop</span>
              </span>
              <span className="font-mono font-bold text-[#14181F]">{tiktokPct}%</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F0F2F5]" />

        {/* 3. PLATFORM OVERVIEW 2x3 KPI GRID */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-[0.08em] text-[#14181F] uppercase">
              PLATFORM OVERVIEW
            </h3>
            <span className="text-[11.5px] font-medium text-[#7A8292]">This month ⌄</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-3">
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {activeSellers} / {totalSellers}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">Active sellers</p>
            </div>
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {activeConnections}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">OAuth channels</p>
            </div>
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {formatCompactRupiah(subRevenue)}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">SaaS MRR/ARR</p>
            </div>
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {totalProducts} SKU
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">Synced catalog</p>
            </div>
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {churnRate}%
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">Seller churn rate</p>
            </div>
            <div>
              <p className="font-mono text-[15.5px] font-bold text-[#14181F]">
                {((conflictProducts / Math.max(1, totalProducts)) * 100).toFixed(1)}%
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#8C94A4]">Stock conflict rate</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F0F2F5]" />

        {/* 4. TOP SELLERS BY REVENUE */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-[0.08em] text-[#14181F] uppercase">
              TOP SELLERS
            </h3>
            <span className="text-[11.5px] font-medium text-[#7A8292]">By revenue ⌄</span>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {rankedSellers.slice(0, 4).map((seller, idx) => (
              <button
                key={seller.id || idx}
                type="button"
                onClick={() => onInspectSeller && onInspectSeller(seller)}
                className="flex w-full items-center justify-between rounded-xl p-2 text-left hover:bg-[#F7F8FA] transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F7] border border-[#E3E6EC] text-[11px] font-bold text-[#14181F] group-hover:bg-[#14181F] group-hover:text-white transition">
                    {seller.store_name
                      ?.split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-[#14181F]">
                      {seller.store_name}
                    </p>
                    <p className="truncate text-[11px] text-[#8C94A4]">
                      {seller.plan?.toUpperCase()} • {formatCompactRupiah(seller.total_gmv)}
                    </p>
                  </div>
                </div>
                <span className="ml-2 shrink-0 font-mono text-[12px] font-bold text-[#3F6E58]">
                  {seller.orders_count || 0} ord
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
