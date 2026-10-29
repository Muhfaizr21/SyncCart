import React from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'Oct 29'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return String(dateStr).slice(0, 10)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AllOrdersPage({
  filteredOrders = [],
  selectedIds = [],
  inspectedItem,
  storeNameById = {},
  onToggleSelectAll,
  onToggleRowSelection,
  onInspectOrder,
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
                filteredOrders.length > 0 &&
                selectedIds.length === filteredOrders.length
              }
              onChange={() => onToggleSelectAll(filteredOrders)}
              className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
            />
          </th>
          <th className="py-3 pr-3 font-medium">Order ⌄</th>
          <th className="py-3 px-3 font-medium">Customer & Store</th>
          <th className="py-3 px-3 font-medium">Type</th>
          <th className="py-3 px-3 font-medium">Status</th>
          <th className="py-3 px-3 font-medium">Product</th>
          <th className="py-3 px-3 font-medium">Total</th>
          <th className="py-3 px-3 font-medium">Date</th>
          <th className="w-10 py-3 pr-2 text-right" />
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
        {filteredOrders.map((ord) => {
          const checked = selectedIds.includes(ord.id)
          const isInspected =
            inspectedItem?.type === 'order' && inspectedItem?.data?.id === ord.id
          return (
            <tr
              key={ord.id}
              onClick={() => onInspectOrder(ord)}
              className={`cursor-pointer transition ${
                checked || isInspected ? 'bg-[#F4F6F9]' : 'hover:bg-[#FAFBFD]'
              }`}
            >
              <td
                className="py-3.5 pl-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRowSelection(ord.id)
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-[#D1D5DB] accent-[#14181F]"
                />
              </td>
              <td className="py-3.5 pr-3 font-mono text-[12.5px] font-medium text-[#14181F]">
                <span className="inline-flex items-center gap-1.5">
                  <span>#{ord.order_number?.slice(-6) || ord.id}</span>
                  <span className="text-[10px] text-[#9CA3AF]">▤</span>
                </span>
              </td>
              <td className="py-3.5 px-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ECEFF4] text-[10.5px] font-bold text-[#374151]">
                    {ord.buyer_initials || 'SC'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#14181F]">{ord.buyer_name}</p>
                    <p className="truncate text-[10.5px] text-[#8C94A4]">
                      {storeNameById[ord.store_id] || `Store #${ord.store_id}`}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-3 text-[#374151]">{ord.marketplace || 'Shipping'}</td>
              <td className="py-3.5 px-3">{renderStatusCell(ord.status)}</td>
              <td className="py-3.5 px-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 font-mono text-[10.5px] font-semibold text-[#374151]">
                    {ord.product_sku}
                  </span>
                  <span className="truncate max-w-[140px] text-[12px] text-[#525A68]">
                    {ord.product_name}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-3 font-mono text-[13px] font-semibold text-[#14181F]">
                {formatRupiah(ord.amount)}
              </td>
              <td className="py-3.5 px-3 text-[12.5px] text-[#525A68]">
                {formatShortDate(ord.created_at)}
              </td>
              <td className="py-3.5 pr-2 text-right text-[#7A8292]">•••</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

