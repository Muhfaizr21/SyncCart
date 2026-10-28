import React, { useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

export function SellerProductsPage({
  products = [],
  onCreateProduct,
  onAdjustStock,
  onSyncAll,
  onDeleteProduct,
  isSyncing,
}) {
  const [search, setSearch] = useState('')
  const [filterIssue, setFilterIssue] = useState('ALL')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formState, setFormState] = useState({
    sku: '',
    name: '',
    category: 'Atasan Pria & Wanita',
    warehouse: 'Gudang Sunter, Jakarta Utara',
    price: '175000',
    stock: '20',
  })
  const [submitting, setSubmitting] = useState(false)

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase()
    const matchText =
      !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    const matchIssue =
      filterIssue === 'ALL' ||
      (filterIssue === 'LOW_STOCK' && p.stock <= 10) ||
      (filterIssue === 'CONFLICT' && p.sync_status === 'conflict')
    return matchText && matchIssue
  })

  async function handleSubmitNewProduct(e) {
    e.preventDefault()
    if (!formState.sku.trim() || !formState.name.trim()) return
    setSubmitting(true)
    try {
      await onCreateProduct({
        sku: formState.sku.trim(),
        name: formState.name.trim(),
        category: formState.category,
        warehouse: formState.warehouse,
        price: Number(formState.price) || 150000,
        stock: Number(formState.stock) || 10,
      })
      setFormState({
        sku: '',
        name: '',
        category: 'Atasan Pria & Wanita',
        warehouse: 'Gudang Sunter, Jakarta Utara',
        price: '175000',
        stock: '20',
      })
      setShowAddForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
            Phase 5 • Manajemen Produk & Sinkronisasi Stok
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
            Katalog Master & Rekonsiliasi Stok 3 Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E]">
            Setiap perubahan stok master langsung disebarkan ke Shopee, Tokopedia, dan TikTok Shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? 'Menyinkronkan...' : 'Sync Semua Stok Sekarang'}
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer shadow-xs"
          >
            {showAddForm ? 'Tutup Form Produk' : '+ Tambah Produk Master'}
          </button>
        </div>
      </div>

      {/* Create Product Modal/Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitNewProduct}
          className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#F6671E] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#EBE8E0] pb-3">
            <h2 className="text-base font-extrabold text-[#141413]">
              Tambah Produk Baru ke Katalog Master (PostgreSQL)
            </h2>
            <span className="text-xs font-bold text-[#9A3408]">
              Otomatis Publish ke Shopee, Tokopedia, & TikTok
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-sku" className="block text-xs font-bold text-[#141413]">
                Kode SKU Master
              </label>
              <input
                id="prod-sku"
                type="text"
                required
                value={formState.sku}
                onChange={(e) => setFormState((s) => ({ ...s, sku: e.target.value }))}
                placeholder="Contoh: KLO-NAVY-02"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-mono-tabular text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-name" className="block text-xs font-bold text-[#141413]">
                Nama Produk
              </label>
              <input
                id="prod-name"
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                placeholder="Contoh: Kemeja Flannel Nusantara Navy"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-category" className="block text-xs font-bold text-[#141413]">
                Kategori
              </label>
              <input
                id="prod-category"
                type="text"
                value={formState.category}
                onChange={(e) => setFormState((s) => ({ ...s, category: e.target.value }))}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-price" className="block text-xs font-bold text-[#141413]">
                Harga Jual Dasar (Rp)
              </label>
              <input
                id="prod-price"
                type="number"
                min="1000"
                required
                value={formState.price}
                onChange={(e) => setFormState((s) => ({ ...s, price: e.target.value }))}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-mono-tabular text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-stock" className="block text-xs font-bold text-[#141413]">
                Stok Awal Sinkron (pcs)
              </label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                required
                value={formState.stock}
                onChange={(e) => setFormState((s) => ({ ...s, stock: e.target.value }))}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-mono-tabular text-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-warehouse" className="block text-xs font-bold text-[#141413]">
                Lokasi Gudang
              </label>
              <input
                id="prod-warehouse"
                type="text"
                value={formState.warehouse}
                onChange={(e) => setFormState((s) => ({ ...s, warehouse: e.target.value }))}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#EBE8E0] text-xs font-bold text-[#52524E] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Menyimpan ke DB...' : 'Simpan & Publish ke 3 Toko'}
            </button>
          </div>
        </form>
      )}

      {/* Filter & Product Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `Semua Produk (${products.length})` },
              {
                id: 'LOW_STOCK',
                label: `Stok Menipis (${products.filter((p) => p.stock <= 10).length})`,
              },
              {
                id: 'CONFLICT',
                label: `Selisih Stok (${products.filter((p) => p.sync_status === 'conflict').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterIssue(tab.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  filterIssue === tab.id
                    ? 'bg-[#F6671E] text-[#141413]'
                    : 'bg-[#FAF9F6] text-[#52524E] border border-[#EBE8E0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            aria-label="Cari SKU atau nama produk"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari SKU atau nama produk..."
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413] placeholder:text-[#52524E]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBE8E0] text-[11px] font-semibold text-[#52524E]">
                <th className="py-3 px-2">SKU & Produk</th>
                <th className="py-3 px-2">Harga Dasar</th>
                <th className="py-3 px-2">Stok Master</th>
                <th className="py-3 px-2">Stok per Marketplace</th>
                <th className="py-3 px-2">Status Sinkron</th>
                <th className="py-3 px-2 text-right">Kontrol Stok Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E0] text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3.5 px-2">
                    <span className="font-mono-tabular text-[11px] font-extrabold text-[#9A3408]">
                      {item.sku}
                    </span>
                    <p className="font-bold text-[#141413]">{item.name}</p>
                    <p className="text-[11px] text-[#52524E]">{item.warehouse}</p>
                  </td>
                  <td className="py-3.5 px-2 font-mono-tabular font-bold text-[#141413]">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="py-3.5 px-2 font-mono-tabular font-extrabold text-sm text-[#141413]">
                    {item.stock} pcs
                  </td>
                  <td className="py-3.5 px-2">
                    <div className="flex flex-wrap gap-1.5 font-mono-tabular text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#EBE8E0] text-[#141413] font-bold">
                        SHP: {item.shopee_stock}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#EBE8E0] text-[#141413] font-bold">
                        TKP: {item.tokopedia_stock}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#EBE8E0] text-[#141413] font-bold">
                        TTS: {item.tiktok_stock}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.sync_status === 'conflict'
                          ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                          : 'bg-[#E6F6EC] text-[#0F5132]'
                      }`}
                    >
                      {item.sync_status === 'conflict' ? 'Selisih Stok' : 'Sinkron 3 Toko'}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAdjustStock(item.id, -1)}
                        disabled={item.stock <= 0}
                        className="px-2.5 py-1.5 rounded-lg border border-[#EBE8E0] bg-[#FAF9F6] hover:bg-[#FFDECE] font-bold text-[#141413] cursor-pointer disabled:opacity-40"
                      >
                        -1 Order
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustStock(item.id, 10)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FFDECE] hover:bg-[#F6671E] font-bold text-[#141413] cursor-pointer"
                      >
                        +10 Restock
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(item.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#F8B4B4] bg-[#FDE8E8] text-[#9B1C1C] font-bold cursor-pointer"
                        title="Hapus produk"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
