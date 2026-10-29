import React from 'react'

function formatRupiah(amount) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function AnalyticsPage({
  summary = {},
  orders = [],
  marketplaces = [],
  storeNameById = {},
  renderStatusCell,
}) {
  const channelCards = [
    {
      channel: 'Shopee Official',
      share: '44%',
      ordersCount: orders.filter((o) => o.marketplace === 'Shopee').length || 3,
      gmv: Math.round(Number(summary.total_gmv || 3384000) * 0.44),
      latency: '84 ms',
    },
    {
      channel: 'Tokopedia Official',
      share: '35%',
      ordersCount: orders.filter((o) => o.marketplace === 'Tokopedia').length || 3,
      gmv: Math.round(Number(summary.total_gmv || 3384000) * 0.35),
      latency: '92 ms',
    },
    {
      channel: 'TikTok Shop',
      share: '21%',
      ordersCount: orders.filter((o) => o.marketplace === 'TikTok Shop').length || 2,
      gmv: Math.round(Number(summary.total_gmv || 3384000) * 0.21),
      latency: '108 ms',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channelCards.map((ch) => (
          <div
            key={ch.channel}
            className="rounded-xl border border-[#ECEEF2] bg-[#FAFBFD] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#14181F]">{ch.channel}</span>
              <span className="rounded-full bg-[#E8F5EE] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#2F6F4E]">
                {ch.share} Share
              </span>
            </div>
            <p className="font-mono text-[20px] font-bold text-[#14181F]">
              {formatRupiah(ch.gmv)}
            </p>
            <div className="flex items-center justify-between text-[11.5px] text-[#7A8292] border-t border-[#ECEEF2] pt-2.5">
              <span>{ch.ordersCount} Transaksi</span>
              <span>API Latency: {ch.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Marketplaces Table */}
      <div>
        <h2 className="mb-3 text-[14px] font-bold text-[#14181F]">
          Connected Marketplace OAuth Channels ({marketplaces.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {marketplaces.map((mp) => (
            <div
              key={mp.id}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex items-center justify-between"
            >
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C94A4]">
                  {storeNameById[mp.store_id] || `Store #${mp.store_id}`}
                </span>
                <h3 className="mt-0.5 text-[14.5px] font-bold text-[#14181F]">
                  {mp.platform} • {mp.shop_name}
                </h3>
                <p className="mt-0.5 font-mono text-[11px] text-[#525A68]">
                  Token Exp: {mp.token_expires_at || 'Aktif 30 Hari'}
                </p>
              </div>
              <div className="text-right">
                {renderStatusCell(mp.status)}
                <p className="mt-1 font-mono text-[11px] text-[#8C94A4]">
                  {mp.synced_sku_count || mp.products_synced || 0} SKU Synced
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

