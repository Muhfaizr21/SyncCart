import { useState } from 'react'
import { CORE_FEATURES, INITIAL_SYNC_PRODUCTS } from '../data/landingData'

export function FeaturesPage({ onNavigate, onOpenModal, isDark }) {
  const [products, setProducts] = useState(INITIAL_SYNC_PRODUCTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [syncViewState, setSyncViewState] = useState('ready') // ready | loading | error | empty
  const [selectedCourier, setSelectedCourier] = useState('JNE Reguler')
  const [generatedResiList, setGeneratedResiList] = useState([
    { orderId: 'ORD-SHP-8821', channel: 'Shopee', courier: 'JNE Reguler', resi: 'JNE882910441ID', status: 'Siap Pickup' },
    { orderId: 'ORD-TKP-4419', channel: 'Tokopedia', courier: 'SiCepat BEST', resi: '004918274612', status: 'Tercetak' },
  ])
  const [staffPermissions, setStaffPermissions] = useState({
    viewOrders: true,
    processResi: true,
    editCatalog: false,
    viewFinance: false,
  })

  const filteredProducts =
    syncViewState === 'empty'
      ? []
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )

  function handleUpdateStock(sku, delta) {
    setSyncViewState('loading')
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((item) => {
          if (item.sku !== sku) return item
          const nextStock = Math.max(0, item.stock + delta)
          return {
            ...item,
            stock: nextStock,
            channels: {
              shopee: { ...item.channels.shopee, syncedStock: nextStock },
              tokopedia: { ...item.channels.tokopedia, syncedStock: nextStock },
              tiktok: { ...item.channels.tiktok, syncedStock: nextStock },
            },
          }
        })
      )
      setSyncViewState('ready')
    }, 350)
  }

  function handleGenerateBatchResi() {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000)
    const prefix = selectedCourier.split(' ')[0].toUpperCase()
    const newEntry = {
      orderId: `ORD-TTS-${Math.floor(1000 + Math.random() * 8999)}`,
      channel: 'TikTok Shop',
      courier: selectedCourier,
      resi: `${prefix}${randomDigits}ID`,
      status: 'Siap Pickup (Auto-Synced)',
    }
    setGeneratedResiList((prev) => [newEntry, ...prev.slice(0, 4)])
  }

  function togglePermission(key) {
    setStaffPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full">
      {/* Page Hero Header */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.92] text-[clamp(2.8rem,7vw,5.8rem)]">
            FITUR & SIMULASI OPERASIONAL
          </h1>
          <p className="mt-4 text-white text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Uji langsung bagaimana SyncCart menyinkronkan harga dan stok ke 3 marketplace,
            menghitung net profit setelah potongan biaya admin, mencetak resi kurir, dan
            mengatur izin akses staf.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <section
        aria-label="Simulasi dan Detail Fitur"
        className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-10 ${
          isDark ? 'bg-[#111612] text-white' : 'bg-[#F4F7EE] text-[#111612]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-16">
          {/* FLAGSHIP INTERACTIVE SANDBOX: Stock, Price & Net Profit Sync across 3 Marketplaces */}
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/15">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                  1. Simulasi Sinkronisasi Produk, Stok & Net Profit [Data Simulasi]
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mt-2">
                  Ubah Stok Sekali, Tiga Marketplace Ikut Berubah
                </h2>
              </div>

              {/* UI State Switcher to verify Empty, Loading, Error & Ready States per R-27 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#B8C2B8] mr-1">
                  Uji Status UI:
                </span>
                {[
                  { id: 'ready', label: 'Data Aktif' },
                  { id: 'loading', label: 'Saat Sync (Loading)' },
                  { id: 'empty', label: 'Katalog Kosong' },
                  { id: 'error', label: 'Saat API Gangguan' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSyncViewState(st.id)}
                    aria-pressed={syncViewState === st.id}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      syncViewState === st.id
                        ? 'bg-[#D9F951] text-[#111612]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <label htmlFor="sku-search" className="sr-only">
                  Cari nama produk atau kode SKU
                </label>
                <input
                  id="sku-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (syncViewState === 'empty') setSyncViewState('ready')
                  }}
                  placeholder="Cari nama produk atau kode SKU (contoh: Kemeja Linen)"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setProducts(INITIAL_SYNC_PRODUCTS)
                  setSearchQuery('')
                  setSyncViewState('ready')
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-white/25 text-xs sm:text-sm font-semibold text-[#D9F951] hover:bg-white/10 cursor-pointer"
              >
                Reset Katalog Awal
              </button>
            </div>

            {/* STATE 1: LOADING */}
            {syncViewState === 'loading' && (
              <div
                role="status"
                aria-live="polite"
                className="p-8 rounded-2xl bg-[#111612] border border-[#D9F951]/40 text-center space-y-3"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                  Sedang Menyinkronkan
                </div>
                <p className="text-base sm:text-lg font-bold text-white">
                  Mengirim pembaruan stok ke API Shopee, Tokopedia, dan TikTok Shop...
                </p>
                <p className="text-xs sm:text-sm text-[#B8C2B8]">
                  Proses ini berjalan otomatis di latar belakang melalui webhook dan antrean pekerja.
                </p>
                <button
                  type="button"
                  onClick={() => setSyncViewState('ready')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white/15 text-white text-xs font-bold cursor-pointer"
                >
                  Tampilkan Hasil Sekarang
                </button>
              </div>
            )}

            {/* STATE 2: ERROR / QUEUE FALLBACK */}
            {syncViewState === 'error' && (
              <div
                role="alert"
                className="p-6 rounded-2xl bg-[#5C1A1B] border border-[#FCA5A5] text-white space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-white text-[#5C1A1B] text-xs font-extrabold">
                    Peringatan Koneksi Marketplace (Auto-Retry Aktif)
                  </span>
                  <span className="font-mono-tabular text-xs text-[#FCA5A5]">
                    Antrean #Q-9921
                  </span>
                </div>
                <h3 className="text-lg font-bold">
                  API Tokopedia sedang melambat. Perubahan stok Anda aman di dalam Queue System.
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Shopee dan TikTok Shop sudah terupdate. SyncCart akan mencoba ulang (auto-retry)
                  sinkronisasi ke Tokopedia setiap 30 detik, atau Anda dapat menekan tombol picu
                  manual di bawah.
                </p>
                <div className="pt-1 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSyncViewState('ready')}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D9F951] text-[#111612] text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Picu Manual Sync Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: EMPTY */}
            {syncViewState !== 'loading' && filteredProducts.length === 0 && (
              <div className="p-8 rounded-2xl bg-[#111612] border border-white/15 text-center space-y-3">
                <h3 className="text-lg font-bold text-white">
                  Belum Ada Produk yang Ditampilkan
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C2B8] max-w-md mx-auto">
                  {searchQuery
                    ? `Tidak ditemukan produk dengan kata kunci "${searchQuery}".`
                    : 'Katalog toko Anda masih kosong. Anda dapat menarik produk yang sudah ada di marketplace atau mereset filter.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSyncViewState('ready')
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    Muat Contoh Katalog (3 SKU)
                  </button>
                </div>
              </div>
            )}

            {/* STATE 4: READY DATA TABLE / CARDS */}
            {syncViewState !== 'loading' && filteredProducts.length > 0 && (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const avgFeePercent = 6.0
                  const feeAmount = Math.round((product.price * avgFeePercent) / 100)
                  const netProfit = product.price - product.cost - feeAmount
                  const isLowStock = product.stock <= 5

                  return (
                    <div
                      key={product.sku}
                      className="p-5 rounded-2xl bg-[#111612] border border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
                    >
                      <div className="lg:col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tabular text-xs text-[#D9F951] font-bold">
                            {product.sku}
                          </span>
                          {isLowStock && (
                            <span className="px-2 py-0.5 rounded-md bg-[#5C1A1B] border border-[#FCA5A5] text-[11px] font-bold text-white">
                              Stok Hampir Habis ({product.stock})
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white">{product.name}</h3>
                        <p className="text-xs text-[#B8C2B8]">
                          Harga Jual:{' '}
                          <strong className="text-white font-mono-tabular">
                            Rp {product.price.toLocaleString('id-ID')}
                          </strong>{' '}
                          | Estimasi Net Profit:{' '}
                          <strong className="text-[#D9F951] font-mono-tabular">
                            Rp {netProfit.toLocaleString('id-ID')}/pcs
                          </strong>
                        </p>
                      </div>

                      {/* 3 Channel Stock Status */}
                      <div className="lg:col-span-5 grid grid-cols-3 gap-2">
                        {[
                          { label: 'Shopee', data: product.channels.shopee },
                          { label: 'Tokopedia', data: product.channels.tokopedia },
                          { label: 'TikTok', data: product.channels.tiktok },
                        ].map((ch) => (
                          <div
                            key={ch.label}
                            className="p-2.5 rounded-xl bg-[#161816] border border-white/10 text-center"
                          >
                            <p className="text-[11px] text-[#B8C2B8] font-semibold">{ch.label}</p>
                            <p className="font-mono-tabular text-base font-extrabold text-[#D9F951] mt-0.5">
                              {ch.data.syncedStock} pcs
                            </p>
                            <p className="text-[10px] text-[#B8C2B8]">
                              Fee ~{ch.data.feePercent}%
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Action Controls */}
                      <div className="lg:col-span-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(product.sku, -1)}
                          disabled={product.stock === 0}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                        >
                          -1 Terjual
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(product.sku, 5)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#145A43] hover:bg-[#1E8E6E] border border-[#D9F951]/40 text-white text-xs font-bold cursor-pointer"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* INTERACTIVE MODULE 2 & 3: Courier Batch Resi Generator + Staff RBAC Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Courier Resi Simulator (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border border-white/15 space-y-5">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#145A43] text-white text-xs font-bold">
                  2. Integrasi Kurir & Cetak Label Massal
                </span>
                <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight mt-3">
                  Generate Resi & Request Pickup Sekali Klik
                </h2>
                <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
                  Terhubung ke JNE, J&T, SiCepat, dan Anteraja. Input atau buat resi satu kali,
                  status pengiriman di marketplace otomatis terupdate.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <label htmlFor="courier-select" className="sr-only">
                  Pilih Ekspedisi Kurir
                </label>
                <select
                  id="courier-select"
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#111612] border border-white/25 text-white text-sm font-semibold flex-1"
                >
                  <option value="JNE Reguler">JNE Reguler</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat BEST">SiCepat BEST</option>
                  <option value="Anteraja Reguler">Anteraja Reguler</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateBatchResi}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D9F951] text-[#111612] font-extrabold text-xs sm:text-sm cursor-pointer"
                >
                  + Simulasikan Generate Resi
                </button>
              </div>

              <div className="space-y-2.5">
                {generatedResiList.map((item) => (
                  <div
                    key={item.resi}
                    className="p-3.5 rounded-2xl bg-[#111612] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono-tabular font-bold text-[#D9F951]">
                        {item.orderId}
                      </span>{' '}
                      <span className="text-[#B8C2B8]">({item.channel})</span>
                      <p className="text-white font-semibold mt-0.5">
                        {item.courier}: <span className="font-mono-tabular">{item.resi}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#145A43] text-white font-bold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-User RBAC Simulator (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border border-white/15 space-y-5">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#145A43] text-white text-xs font-bold">
                  3. Kelola Tim & Hak Akses Staf (RBAC)
                </span>
                <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight mt-3">
                  Atur Izin Kerja Karyawan Tanpa Bagi Password Utama
                </h2>
                <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
                  Setiap staf memiliki login terpisah dengan keamanan 2FA dan pencatatan activity
                  log. Klik tombol di bawah untuk menguji konfigurasi akses staf:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'viewOrders', label: 'Lihat Pesanan Masuk', desc: 'Akses daftar order harian' },
                  { key: 'processResi', label: 'Proses & Cetak Resi', desc: 'Input resi & panggil pickup' },
                  { key: 'editCatalog', label: 'Ubah Harga & Produk', desc: 'Tambah/edit SKU & stok' },
                  { key: 'viewFinance', label: 'Buka Laporan Keuangan', desc: 'Lihat net profit & omzet' },
                ].map((perm) => {
                  const active = staffPermissions[perm.key]
                  return (
                    <button
                      key={perm.key}
                      type="button"
                      onClick={() => togglePermission(perm.key)}
                      aria-pressed={active}
                      className={`p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#145A43] border-[#D9F951] text-white'
                          : 'bg-[#111612] border-white/15 text-[#B8C2B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {perm.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                            active
                              ? 'bg-[#D9F951] text-[#111612]'
                              : 'bg-white/10 text-[#B8C2B8]'
                          }`}
                        >
                          {active ? 'Diizinkan' : 'Dibatasi'}
                        </span>
                      </div>
                      <p className="text-xs mt-1 opacity-85">{perm.desc}</p>
                    </button>
                  )
                })}
              </div>

              <div className="p-4 rounded-2xl bg-[#111612] border border-white/10 text-xs text-[#B8C2B8]">
                <strong className="text-[#D9F951]">Ringkasan Peran Staf Saat Ini:</strong> Staf
                dapat mengakses{' '}
                <strong className="text-white">
                  {Object.values(staffPermissions).filter(Boolean).length} dari 4 modul
                </strong>
                . Seluruh perubahan tercatat di Activity Log Owner.
              </div>
            </div>
          </div>

          {/* 4 Pillar Summary Breakdown */}
          <div className="space-y-6">
            <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tight">
              Rincian Lengkap 4 Pilar Fitur SyncCart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CORE_FEATURES.map((feat) => (
                <article
                  key={feat.id}
                  className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between gap-5 ${
                    isDark
                      ? 'bg-[#161816] border-white/15 text-white'
                      : 'bg-white border-[#111612]/15 text-[#111612] shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#161816] text-[#D9F951]">
                      {feat.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold">{feat.title}</h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'}`}>
                      {feat.summary}
                    </p>
                    <ul className="space-y-2 pt-2">
                      {feat.highlights.map((point) => (
                        <li key={point} className="text-xs sm:text-sm flex items-start gap-2.5">
                          <span className="mt-1 w-2 h-2 rounded-full bg-[#145A43] shrink-0" aria-hidden="true" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-current/10 flex items-center justify-between text-xs">
                    <span className="opacity-75">{feat.metricLabel}:</span>
                    <strong className="font-mono-tabular px-2.5 py-1 rounded-lg bg-[#161816] text-[#D9F951]">
                      {feat.metricValue}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Bottom Navigation Bar to Next Page */}
          <div className="p-8 rounded-3xl bg-[#161816] text-white border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Ingin melihat seberapa cepat proses setup awal toko Anda?
              </h3>
              <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
                Lanjutkan ke halaman Cara Kerja untuk melihat panduan 4 langkah dari daftar hingga
                siap jualan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('cara-kerja')}
                className="min-h-[46px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm cursor-pointer"
              >
                Lanjut ke Cara Kerja
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('trial')}
                className="min-h-[46px] px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 cursor-pointer"
              >
                Mulai Gratis 30 Hari
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

