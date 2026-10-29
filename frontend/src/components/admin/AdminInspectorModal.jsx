import React, { useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

export default function AdminInspectorModal({
  inspectedItem,
  hasRightRail = false,
  onClose,
  onToggleSellerStatus,
  onChangeSellerPlan,
  onSyncSellerCatalog,
  onDeleteSeller,
  onExportItem,
  onPrintItem,
  busyAction,
}) {
  const [subTab, setSubTab] = useState('items')

  if (!inspectedItem) return null

  const { type, data } = inspectedItem
  const isOrder = type === 'order'
  const isSeller = type === 'seller'
  const isProduct = type === 'product'

  const headerTitle = isOrder
    ? `Order #${data.order_number || data.id}`
    : isSeller
    ? `Store #${data.id} • ${data.store_name}`
    : `SKU #${data.sku || data.id}`

  const contactName = isOrder
    ? data.buyer_name
    : isSeller
    ? data.owner_name || 'Seller Owner'
    : data.name

  const contactEmail = isOrder
    ? `${(data.buyer_name || 'buyer').toLowerCase().replace(/[^a-z0-9]/g, '')}@synccart-mail.id`
    : isSeller
    ? data.owner_email || data.support_email
    : `Gudang: ${data.warehouse || 'Jakarta'}`

  const contactPhone = isOrder
    ? data.buyer_phone || '+62 812-8890-4412'
    : isSeller
    ? data.support_phone || '+62 812-8890-4412'
    : `Kategori: ${data.category || 'Omnichannel'}`

  return (
    <div
      className={`fixed bottom-16 ${
        hasRightRail ? 'right-[360px]' : 'right-8'
      } z-40 w-[355px] rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] border border-[#E2E6EE] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200`}
    >
      {/* Dark Obsidian Top Bar */}
      <div className="flex items-center justify-between bg-[#14181F] px-4 py-3 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#7D8797] text-xs tracking-tighter select-none">⋮⋮</span>
          <span className="truncate text-[13px] font-semibold">{headerTitle}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onPrintItem && onPrintItem(data)}
            title="Buka Cetak Ringkasan"
            className="text-[#8F98A8] hover:text-white transition p-1"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Tutup Inspector"
            className="text-[#8F98A8] hover:text-white transition p-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact Metadata Block */}
      <div className="space-y-2 px-4 pt-4 pb-3 text-[12.5px] text-[#3B4252]">
        <div className="flex items-center gap-2.5">
          <svg className="h-3.5 w-3.5 text-[#7A8292] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-semibold text-[#14181F] truncate">{contactName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="h-3.5 w-3.5 text-[#7A8292] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="truncate text-[#525A68]">{contactEmail}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="h-3.5 w-3.5 text-[#7A8292] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="truncate font-mono text-[12px] text-[#525A68]">{contactPhone}</span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-5 border-b border-[#ECEEF2] px-4 text-[12px] font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('items')}
          className={`pb-2.5 border-b-2 transition ${
            subTab === 'items'
              ? 'border-[#14181F] text-[#14181F]'
              : 'border-transparent text-[#8C94A4] hover:text-[#14181F]'
          }`}
        >
          {isSeller ? 'Store & Plan' : 'Order items'}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('delivery')}
          className={`pb-2.5 border-b-2 transition ${
            subTab === 'delivery'
              ? 'border-[#14181F] text-[#14181F]'
              : 'border-transparent text-[#8C94A4] hover:text-[#14181F]'
          }`}
        >
          {isSeller ? 'Channels' : 'Delivery'}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('docs')}
          className={`pb-2.5 border-b-2 transition ${
            subTab === 'docs'
              ? 'border-[#14181F] text-[#14181F]'
              : 'border-transparent text-[#8C94A4] hover:text-[#14181F]'
          }`}
        >
          Docs & Actions
        </button>
      </div>

      {/* Tab Body */}
      <div className="px-4 py-3.5 space-y-3.5 max-h-[250px] overflow-y-auto">
        {subTab === 'items' && isOrder && (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F5F8] border border-[#E4E7EE] text-[10px] font-bold text-[#14181F]">
                {data.marketplace?.slice(0, 3).toUpperCase() || 'SKU'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-[#14181F] leading-snug">
                  {data.product_name} ({data.product_sku})
                </p>
                <p className="mt-1 font-mono text-[12px] text-[#525A68]">
                  {data.quantity || 1} ×{' '}
                  <span className="font-bold text-[#14181F]">
                    {formatRupiah(Math.round((data.amount || 0) / Math.max(1, data.quantity || 1)))}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F5F8] border border-[#E4E7EE] text-[10px] font-bold text-[#3F6E58]">
                LOG
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#14181F] leading-snug">
                  {data.courier || 'J&T Express'} • Resi: {data.tracking_resi || 'Menunggu Pickup'}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8C94A4]">
                  Channel: {data.marketplace} • Status: {data.status}
                </p>
              </div>
            </div>
          </>
        )}

        {subTab === 'items' && isSeller && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[#F7F8FA] p-2.5 border border-[#ECEEF2]">
              <div>
                <p className="text-[11px] text-[#8C94A4]">Paket SaaS Aktif</p>
                <p className="text-[13px] font-bold text-[#14181F] uppercase">
                  {data.plan} ({data.billing_cycle})
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  data.status === 'active'
                    ? 'bg-[#E8F5EE] text-[#2F6F4E]'
                    : 'bg-[#FEECEC] text-[#C93B3B]'
                }`}
              >
                {data.status === 'active' ? '✓ Active' : '✕ Suspended'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-[#ECEEF2] p-2">
                <p className="font-mono text-[13px] font-bold text-[#14181F]">
                  {data.products_count || 0}
                </p>
                <p className="text-[10.5px] text-[#8C94A4]">SKU Produk</p>
              </div>
              <div className="rounded-lg border border-[#ECEEF2] p-2">
                <p className="font-mono text-[13px] font-bold text-[#14181F]">
                  {data.orders_count || 0}
                </p>
                <p className="text-[10.5px] text-[#8C94A4]">Pesanan</p>
              </div>
              <div className="rounded-lg border border-[#ECEEF2] p-2">
                <p className="font-mono text-[13px] font-bold text-[#14181F]">
                  {data.connected_stores || 3}
                </p>
                <p className="text-[10.5px] text-[#8C94A4]">Channel</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              {['starter', 'business', 'enterprise'].map((planOpt) => (
                <button
                  key={planOpt}
                  type="button"
                  disabled={busyAction || data.plan === planOpt}
                  onClick={() =>
                    onChangeSellerPlan &&
                    onChangeSellerPlan(data.id, {
                      plan: planOpt,
                      billingCycle: data.billing_cycle || 'annual',
                    })
                  }
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold capitalize border transition ${
                    data.plan === planOpt
                      ? 'bg-[#14181F] text-white border-[#14181F]'
                      : 'bg-white text-[#525A68] border-[#DCE0E8] hover:border-[#14181F]'
                  }`}
                >
                  {planOpt}
                </button>
              ))}
            </div>
          </div>
        )}

        {subTab === 'items' && isProduct && (
          <div className="space-y-2.5 text-[12px]">
            <p className="font-semibold text-[#14181F]">{data.name}</p>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#F7F8FA] p-2.5 font-mono text-[11.5px]">
              <div>
                <span className="block text-[10px] text-[#8C94A4]">Shopee</span>
                <span className="font-bold text-[#14181F]">{data.shopee_stock} pcs</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#8C94A4]">Tokopedia</span>
                <span className="font-bold text-[#14181F]">{data.tokopedia_stock} pcs</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#8C94A4]">TikTok</span>
                <span className="font-bold text-[#14181F]">{data.tiktok_stock} pcs</span>
              </div>
            </div>
          </div>
        )}

        {subTab === 'delivery' && (
          <div className="space-y-2 text-[12px] text-[#525A68]">
            <p className="font-semibold text-[#14181F]">
              {isSeller
                ? `Channel Terhubung: ${data.connected_channels || 'Shopee, Tokopedia, TikTok Shop'}`
                : `Alamat Pengiriman: ${data.shipping_address || 'Jakarta Selatan'}`}
            </p>
            <p>
              {isSeller
                ? `Gudang Utama: ${data.warehouse_name || 'Gudang Pusat'} (${data.warehouse_city || 'Jakarta'})`
                : `Ekspedisi: ${data.courier || 'J&T Express'} • Resi: ${data.tracking_resi || '-'}`}
            </p>
            <p className="font-mono text-[11px] text-[#8C94A4]">
              {isSeller
                ? `Interval Sinkronisasi: ${data.sync_interval_minutes || 5} menit • Buffer: ${data.safety_stock_buffer || 3} pcs`
                : `Metode Pembayaran: ${data.payment_method || 'QRIS'}`}
            </p>
          </div>
        )}

        {subTab === 'docs' && (
          <div className="space-y-2.5 text-[12px]">
            <p className="text-[#525A68]">
              {isSeller
                ? `NPWP: ${data.tax_npwp || '09.254.294.3-042.000'} • Open API: ${data.open_api_key_masked || 'sk_live_synccart'}`
                : `Kode Pembayaran: ${data.payment_code || data.sku || '-'} • SLA: ${data.sla_deadline || 'Tepat Waktu'}`}
            </p>
            {isSeller && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() =>
                    onToggleSellerStatus &&
                    onToggleSellerStatus(
                      data.id,
                      data.status === 'active' ? 'suspended' : 'active'
                    )
                  }
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-white transition ${
                    data.status === 'active'
                      ? 'bg-[#D97706] hover:bg-[#B45309]'
                      : 'bg-[#2F6F4E] hover:bg-[#24583D]'
                  }`}
                >
                  {data.status === 'active' ? 'Suspend Toko' : 'Aktifkan Toko'}
                </button>
                {data.id !== 1 && (
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => onDeleteSeller && onDeleteSeller(data.id)}
                    className="rounded-lg bg-[#FEECEC] px-3 py-1.5 text-[11.5px] font-semibold text-[#C93B3B] hover:bg-[#FCD6D6] transition"
                  >
                    Hapus
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total Row */}
      <div className="flex items-center justify-between border-t border-[#ECEEF2] px-4 py-3">
        <span className="text-[12.5px] font-medium text-[#525A68]">Total:</span>
        <span className="font-mono text-[14.5px] font-bold text-[#14181F]">
          {formatRupiah(
            isOrder
              ? data.amount
              : isSeller
              ? data.total_gmv
              : (data.price || 0) * (data.stock || 1)
          )}
        </span>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between border-t border-[#ECEEF2] bg-[#FAFBFD] px-3 py-2 text-[11.5px] font-semibold text-[#3B4252]">
        <button
          type="button"
          onClick={() => onExportItem && onExportItem(data)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-[#ECEEF2] transition"
        >
          <span>↑</span>
          <span>Export</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (isSeller && onSyncSellerCatalog) {
              onSyncSellerCatalog(data.id)
            } else if (isSeller && onToggleSellerStatus) {
              onToggleSellerStatus(data.id, data.status === 'active' ? 'suspended' : 'active')
            }
          }}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-[#ECEEF2] transition"
        >
          <span>❐</span>
          <span>{isSeller ? 'Sync SKU' : 'Duplicate'}</span>
        </button>
        <button
          type="button"
          onClick={() => onPrintItem && onPrintItem(data)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-[#ECEEF2] transition"
        >
          <span>⎙</span>
          <span>Print</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab(subTab === 'docs' ? 'items' : 'docs')}
          className="rounded-md px-2 py-1.5 text-[#7A8292] hover:bg-[#ECEEF2] hover:text-[#14181F] transition"
        >
          •••
        </button>
      </div>
    </div>
  )
}

