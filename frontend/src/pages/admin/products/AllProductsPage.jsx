import React from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

export default function AllProductsPage({
  filteredProducts = [],
  selectedIds = [],
  storeNameById = {},
  onToggleSelectAll,
  onToggleRowSelection,
  onInspectProduct,
  onResolveConflict,
  busyAction,
  renderStatusCell,
}) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[#ECEEF2] text-[11.5px] font-medium text-[#8C94A4]">
          <th className="w-9 py-3 pl-2">
            <input
              type="checkbox"
              checked={
                filteredProducts.length > 0 &&
                selectedIds.length === filteredProducts.length
              }
              onChange={() => onToggleSelectAll(filteredProducts)}
              className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
            />
          </th>
          <th className="py-3 pr-3 font-medium">SKU ⌄</th>
          <th className="py-3 px-3 font-medium">Product & Seller Store</th>
          <th className="py-3 px-3 font-medium">Sync Status</th>
          <th className="py-3 px-3 font-medium">Channel Stock (SHP / TKP / TTS)</th>
          <th className="py-3 px-3 font-medium">Price</th>
          <th className="py-3 px-3 font-medium">Sold</th>
          <th className="py-3 pl-3 text-right font-medium">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
        {filteredProducts.map((prod) => {
          const checked = selectedIds.includes(prod.id)
          return (
            <tr
              key={prod.id}
              onClick={() => onInspectProduct(prod)}
              className={`cursor-pointer transition ${
                checked ? 'bg-[#F4F6F9]' : 'hover:bg-[#FAFBFD]'
              }`}
            >
              <td
                className="py-3.5 pl-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRowSelection(prod.id)
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                />
              </td>
              <td className="py-3.5 pr-3 font-mono text-[12px] font-bold text-[#14181F]">
                {prod.sku}
              </td>
              <td className="py-3.5 px-3">
                <p className="font-semibold text-[#14181F]">{prod.name}</p>
                <p className="text-[11px] text-[#8C94A4]">
                  {storeNameById[prod.store_id] || `Store #${prod.store_id}`} • {prod.warehouse}
                </p>
              </td>
              <td className="py-3.5 px-3">{renderStatusCell(prod.sync_status)}</td>
              <td className="py-3.5 px-3 font-mono text-[12px] text-[#374151]">
                {prod.shopee_stock} / {prod.tokopedia_stock} / {prod.tiktok_stock} pcs
              </td>
              <td className="py-3.5 px-3 font-mono font-semibold text-[#14181F]">
                {formatRupiah(prod.price)}
              </td>
              <td className="py-3.5 px-3 font-mono text-[12.5px] font-bold text-[#3F6E58]">
                {prod.sold_count}
              </td>
              <td
                className="py-3.5 pl-3 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => onResolveConflict && onResolveConflict([prod.id])}
                  className="rounded-lg border border-[#DCE0E8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#14181F] hover:bg-[#F3F4F6]"
                >
                  Sync Stok
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

