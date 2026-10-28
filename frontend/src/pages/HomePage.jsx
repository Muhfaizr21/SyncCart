import { useState } from 'react'
import { PAIN_POINTS } from '../data/landingData'
import {
  DoodleBird,
  DoodleCloud,
  DoodleWings,
  SoftCloudBed,
} from '../components/doodles/WinglyDoodles'

export function HomePage({ onNavigate, onOpenModal, isDark }) {
  const [heroStock, setHeroStock] = useState(24)
  const [heroOrders, setHeroOrders] = useState(148)
  const [heroRevenue, setHeroRevenue] = useState(14850000)
  const [lastSyncedChannel, setLastSyncedChannel] = useState('Shopee')

  // Interactive ROI calculator state based on LANDING.MD
  const [marketplaceCount, setMarketplaceCount] = useState(3)
  const [dailyOrders, setDailyOrders] = useState(35)

  function handleSimulateSale(channelName) {
    if (heroStock <= 0) return
    setHeroStock((prev) => Math.max(0, prev - 1))
    setHeroOrders((prev) => prev + 1)
    setHeroRevenue((prev) => prev + 149000)
    setLastSyncedChannel(channelName)
  }

  function handleResetHeroDemo() {
    setHeroStock(24)
    setHeroOrders(148)
    setHeroRevenue(14850000)
    setLastSyncedChannel('Semua Channel')
  }

  // LANDING.MD math: ~15 mins per marketplace check + ~1.5 min saved per order batch
  const manualMinutesPerDay = marketplaceCount * 15 + Math.round(dailyOrders * 1.4)
  const synccartMinutesPerDay = 12 + Math.round(dailyOrders * 0.35)
  const savedMinutesPerDay = Math.max(15, manualMinutesPerDay - synccartMinutesPerDay)
  const savedHoursPerMonth = Math.round((savedMinutesPerDay * 30) / 60)
  const savedHoursPerYear = savedHoursPerMonth * 12

  return (
    <div className="w-full">
      {/* HERO SECTION (Wingly Visual Language Reference) */}
      <section
        aria-labelledby="hero-display-heading"
        className="relative overflow-hidden pt-4 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-10"
      >
        {/* Decorative Comic Cloud in Upper-Left Sky */}
        <div className="pointer-events-none select-none hidden md:block">
          <div className="absolute top-24 left-[12%] z-0">
            <DoodleCloud className="w-24 h-16" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Giant Condensed Uppercase Display Headline */}
          <div className="text-center max-w-4xl mx-auto pt-2 sm:pt-4">
            <h1
              id="hero-display-heading"
              className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.9] text-[clamp(3.3rem,9vw,7.4rem)] drop-shadow-xs"
            >
              BEBAS RIBET
              <span className="block">KELOLA 3 TOKO</span>
            </h1>
            <p className="mt-4 text-white text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Kelola toko online Anda di Shopee, Tokopedia, dan TikTok Shop dari satu
              dashboard. Sinkronisasi produk, stok, dan resi otomatis tanpa pindah tab.
            </p>
          </div>

          {/* 3-Column Wingly Stage: Left Floating Dark Cards | Center Cloud & Wings | Right Floating Dark Card with Bird */}
          <div className="mt-8 lg:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            {/* LEFT FLOATING DARK WIDGETS */}
            <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
              <div className="p-4 sm:p-5 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#145A43] border border-[#D9F951]/40 flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-[#D9F951]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="M3 10H21M7 15H11" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">
                    Hubungkan 3 toko dalam 15 menit.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('cara-kerja')}
                    className="mt-1 min-h-[44px] inline-flex items-center text-xs font-bold text-[#D9F951] hover:underline cursor-pointer"
                  >
                    Lihat alur setup OAuth
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-xl space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Bagi tugas dengan tim staf
                  </p>
                  <p className="text-xs text-[#B8C2B8] mt-0.5">
                    3 peran aktif [Simulasi Demo]
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* Honest initial-based avatars per R-23 */}
                  <div className="flex items-center -space-x-2" aria-label="Inisial anggota tim">
                    <span className="w-9 h-9 rounded-full bg-[#145A43] border-2 border-[#161816] text-xs font-bold text-white inline-flex items-center justify-center">
                      OA
                    </span>
                    <span className="w-9 h-9 rounded-full bg-[#2C6DB4] border-2 border-[#161816] text-xs font-bold text-white inline-flex items-center justify-center">
                      GD
                    </span>
                    <span className="w-9 h-9 rounded-full bg-[#FFFFFF] border-2 border-[#161816] text-xs font-bold text-[#111612] inline-flex items-center justify-center">
                      +3
                    </span>
                  </div>
                  <span className="font-mono-tabular text-sm font-bold text-[#D9F951]">
                    {heroOrders} ORDER
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER STAGE: Wings + Interactive Multi-Channel Sync Controller on Cloud Bed + Primary Lime Pill CTA */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center order-1 lg:order-2 py-4">
              {/* Hand-drawn Comic Wings behind centerpiece */}
              <div className="w-full max-w-md mx-auto -mb-14 sm:-mb-20 relative z-10 pointer-events-none">
                <DoodleWings />
              </div>

              {/* Center Interactive Seller Sync Console sitting on the cloud */}
              <div className="relative z-20 w-full max-w-md rounded-3xl bg-[#161816] text-white border-2 border-white/20 p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/15">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8C2B8]">
                      Simulasi Sinkronisasi Stok Langsung
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Kemeja Linen Oversize Sage
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#D9F951] text-[#111612] font-mono-tabular text-xs font-extrabold">
                    Stok: {heroStock} pcs
                  </span>
                </div>

                {/* 3 Marketplace Sync Pills */}
                <div className="grid grid-cols-3 gap-2.5 my-4">
                  {[
                    { name: 'Shopee', tag: 'SHP' },
                    { name: 'Tokopedia', tag: 'TKP' },
                    { name: 'TikTok Shop', tag: 'TTS' },
                  ].map((ch) => (
                    <div
                      key={ch.name}
                      className={`p-3 rounded-2xl border transition-colors ${
                        lastSyncedChannel === ch.name
                          ? 'bg-[#145A43] border-[#D9F951]'
                          : 'bg-[#111612] border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-[#B8C2B8]">
                        <span className="font-bold text-white">{ch.tag}</span>
                        <span className="w-2 h-2 rounded-full bg-[#D9F951]" aria-hidden="true" />
                      </div>
                      <p className="mt-1.5 font-mono-tabular text-lg font-extrabold text-[#D9F951]">
                        {heroStock}
                      </p>
                      <p className="text-[11px] text-[#B8C2B8] truncate">{ch.name}</p>
                    </div>
                  ))}
                </div>

                {/* Interactive Trigger Buttons inside Centerpiece */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {['Shopee', 'Tokopedia', 'TikTok Shop'].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleSimulateSale(ch)}
                        disabled={heroStock === 0}
                        className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#D9F951] hover:text-[#111612] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                      >
                        +1 Order {ch.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  {heroStock < 24 && (
                    <button
                      type="button"
                      onClick={handleResetHeroDemo}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D9F951] hover:underline cursor-pointer"
                    >
                      Reset (24)
                    </button>
                  )}
                </div>
              </div>

              {/* Sculpted Cloud Bed underneath the Console + Small Comic Cloud on its right edge */}
              <div className="w-full max-w-2xl -mt-12 sm:-mt-16 relative z-10 pointer-events-none">
                <SoftCloudBed />
                <div className="hidden md:block absolute top-10 right-2 z-20">
                  <DoodleCloud className="w-20 h-14" />
                </div>
              </div>

              {/* Signature Wingly Pill CTA sitting at the base of the cloud */}
              <div className="-mt-12 sm:-mt-16 relative z-30 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenModal('trial')}
                  className="min-h-[56px] pl-7 pr-2.5 py-2 rounded-full bg-[#D9F951] text-[#111612] font-extrabold text-base shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-transform inline-flex items-center gap-4 cursor-pointer"
                >
                  <span>Mulai Gratis 30 Hari</span>
                  <span
                    className="w-11 h-11 rounded-full bg-[#161816] text-[#D9F951] inline-flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7M17 7H8M17 7V16" />
                    </svg>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('fitur')}
                  className="min-h-[52px] px-6 py-2.5 rounded-full bg-[#161816] text-white border border-white/25 font-bold text-sm hover:bg-[#111612] transition-colors cursor-pointer"
                >
                  Buka Halaman Simulasi Fitur
                </button>
              </div>
            </div>

            {/* RIGHT FLOATING DARK WIDGET WITH PERCHED DOODLE BIRD */}
            <div className="lg:col-span-3 order-3 relative pt-12 lg:pt-8">
              <div className="relative p-5 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-2xl space-y-4">
                {/* Perched Hand-Drawn Bird standing directly on top edge of the card */}
                <div className="absolute -top-[52px] left-5 z-20 pointer-events-none">
                  <DoodleBird className="w-16 h-14" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-[#B8C2B8]">
                    Omzet Terkumpul [Demo]
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                    Aktif
                  </span>
                </div>

                <div className="font-mono-tabular text-2xl sm:text-3xl font-extrabold text-[#D9F951]">
                  Rp {heroRevenue.toLocaleString('id-ID')}
                </div>

                {/* Inner Emerald-to-Lime Virtual Card (Matching Wingly's green Virtual Card) */}
                <div
                  className="p-4 rounded-2xl text-white flex flex-col justify-between min-h-[128px] border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, #74C67A 0%, #1E8E6E 55%, #145A43 100%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#111612] bg-[#D9F951] px-2.5 py-0.5 rounded-md whitespace-nowrap">
                      {lastSyncedChannel}
                    </span>
                    <span className="text-xs font-semibold text-white whitespace-nowrap">
                      Multi-Channel
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-6">
                    <span className="font-mono-tabular text-xs font-bold tracking-widest text-white">
                      SKU •••• 4441
                    </span>
                    <div className="flex items-center -space-x-2" aria-hidden="true">
                      <span className="w-6 h-6 rounded-full bg-[#111612]/60 inline-block" />
                      <span className="w-6 h-6 rounded-full bg-[#D9F951]/85 inline-block" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Horizon Statement (Matching Wingly's "Give your money wings for seamless payments") */}
          <div className="mt-10 sm:mt-14 text-center max-w-2xl mx-auto">
            <h2
              className={`text-2xl sm:text-4xl font-bold tracking-tight leading-tight ${
                isDark ? 'text-white' : 'text-[#111612]'
              }`}
            >
              Berikan sayap pada operasional toko Anda. Fokus jualan dan produk, bukan
              rekap admin berulang.
            </h2>
          </div>
        </div>
      </section>

      {/* SECTION 2: PAIN POINTS VS RELIEF & INTERACTIVE TIME SAVING CALCULATOR */}
      <section
        aria-labelledby="pain-vs-solution-heading"
        className={`py-16 sm:py-24 px-4 sm:px-6 lg:px-10 ${
          isDark ? 'bg-[#111612] text-white' : 'bg-[#F4F7EE] text-[#111612]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#161816] text-[#D9F951] text-xs font-bold uppercase tracking-wider">
              Masalah Harian Seller vs Solusi SyncCart
            </span>
            <h2
              id="pain-vs-solution-heading"
              className="font-display font-black uppercase text-4xl sm:text-5xl tracking-tight mt-3"
            >
              Kenapa Kelola 3 Marketplace Secara Manual Menguras Waktu Anda?
            </h2>
            <p className={`mt-3 text-base sm:text-lg ${isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'}`}>
              Setiap kali ada barang terjual di Shopee, Anda harus buru-buru mengurangi stok di
              Tokopedia dan TikTok Shop agar tidak terjadi pesanan ganda (over-selling).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Pain vs Relief Rows */}
            <div className="lg:col-span-7 space-y-4">
              {PAIN_POINTS.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl border transition-colors ${
                    isDark
                      ? 'bg-[#161816] border-white/15'
                      : 'bg-white border-[#111612]/15 shadow-xs'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-2xl bg-[#5C1A1B]/10 border border-[#5C1A1B]/25">
                      <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#5C1A1B] text-white">
                        Cara Manual Lama
                      </span>
                      <h3 className="mt-2 font-bold text-base">
                        {item.painTitle}
                      </h3>
                      <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'}`}>
                        {item.painDetail}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#145A43]/15 border border-[#145A43]/35">
                      <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#145A43] text-white">
                        Dengan SyncCart (-{item.minutesSavedPerDay} mnt/hari)
                      </span>
                      <h3 className="mt-2 font-bold text-base">
                        {item.reliefTitle}
                      </h3>
                      <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'}`}>
                        {item.reliefDetail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 Cols: Interactive ROI & Time Calculator from LANDING.MD */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-xl space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                  Kalkulator Efisiensi Operasional
                </span>
                <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight mt-3">
                  Hitung Waktu Admin yang Bisa Anda Hemat
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
                  Berdasarkan estimasi alur kerja harian di dokumentasi sistem SyncCart.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                    <label htmlFor="calc-marketplaces">Jumlah Marketplace Aktif</label>
                    <span className="font-mono-tabular text-[#D9F951] font-bold">
                      {marketplaceCount} Marketplace
                    </span>
                  </div>
                  <input
                    id="calc-marketplaces"
                    type="range"
                    min="1"
                    max="5"
                    value={marketplaceCount}
                    onChange={(e) => setMarketplaceCount(Number(e.target.value))}
                    className="w-full accent-[#D9F951] h-2.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#B8C2B8] mt-1">
                    <span>1 Toko</span>
                    <span>3 Toko (Shopee, Tokopedia, TikTok)</span>
                    <span>5 Toko</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                    <label htmlFor="calc-orders">Rata-rata Pesanan per Hari</label>
                    <span className="font-mono-tabular text-[#D9F951] font-bold">
                      {dailyOrders} Order / hari
                    </span>
                  </div>
                  <input
                    id="calc-orders"
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={dailyOrders}
                    onChange={(e) => setDailyOrders(Number(e.target.value))}
                    className="w-full accent-[#D9F951] h-2.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#B8C2B8] mt-1">
                    <span>5 Order</span>
                    <span>100 Order</span>
                    <span>200 Order</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111612] border border-white/15 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#B8C2B8]">Waktu Hemat / Bulan</p>
                  <p className="font-mono-tabular text-2xl sm:text-3xl font-extrabold text-[#D9F951] mt-1">
                    ~{savedHoursPerMonth} Jam
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B8C2B8]">Akumulasi / Tahun</p>
                  <p className="font-mono-tabular text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    ~{savedHoursPerYear} Jam
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#B8C2B8]">
                <p>
                  Waktu manual: <strong className="text-white">{manualMinutesPerDay} menit/hari</strong> vs
                  SyncCart: <strong className="text-[#D9F951]">{synccartMinutesPerDay} menit/hari</strong>.
                </p>
                <p>
                  Potensi kerugian stok selisih (cancel order Rp 100.000 - Rp 500.000/bulan)
                  dapat ditekan karena pemotongan stok berjalan otomatis.
                </p>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenModal('trial')}
                  className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm cursor-pointer"
                >
                  Coba Gratis 30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('harga')}
                  className="w-full min-h-[46px] px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 cursor-pointer"
                >
                  Bandingkan Paket
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DEDICATED PAGE EXPLORER (Direct Navigation to Every Menu Page) */}
      <section
        aria-labelledby="explore-pages-heading"
        className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-10 border-t ${
          isDark
            ? 'bg-[#161816] text-white border-white/10'
            : 'bg-[#E9F0DC] text-[#111612] border-[#111612]/10'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#145A43] text-white">
                Arsitektur Multi-Halaman
              </span>
              <h2
                id="explore-pages-heading"
                className="font-display font-black uppercase text-3xl sm:text-5xl tracking-tight mt-3"
              >
                Jelajahi Setiap Modul SyncCart Lebih Dalam
              </h2>
            </div>
            <p className={`text-sm sm:text-base max-w-md ${isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'}`}>
              Setiap menu pada bilah navigasi di atas memiliki halaman khusus yang interaktif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'fitur',
                step: 'Halaman 01',
                title: 'Fitur & Simulasi Live',
                desc: 'Uji langsung sinkronisasi stok 3 marketplace, cetak resi kurir batch, dan pengaturan izin staf (RBAC).',
                cta: 'Buka Halaman Fitur',
              },
              {
                id: 'cara-kerja',
                step: 'Halaman 02',
                title: 'Cara Kerja & Alur Harian',
                desc: 'Pelajari 4 langkah setup (25 menit), jadwal kerja Pagi-Siang-Sore, dan simulasi antrean saat API marketplace gangguan.',
                cta: 'Buka Halaman Cara Kerja',
              },
              {
                id: 'harga',
                step: 'Halaman 03',
                title: 'Harga Paket & Prorata',
                desc: 'Bandingkan Free Trial, Starter (Rp 99K), Business (Rp 299K), dan Enterprise beserta simulasi upgrade prorata.',
                cta: 'Buka Halaman Harga',
              },
              {
                id: 'studi-kasus-faq',
                step: 'Halaman 04',
                title: 'Studi Kasus, 10 FAQ & Roadmap',
                desc: 'Lihat penerapan untuk 4 tipe seller, cari jawaban di 10 FAQ lengkap, dan cek peta jalan fitur Q1-Q4.',
                cta: 'Buka Studi Kasus & FAQ',
              },
            ].map((card) => (
              <div
                key={card.id}
                className="p-6 rounded-3xl bg-[#161816] text-white border border-white/15 flex flex-col justify-between gap-6 shadow-lg"
              >
                <div className="space-y-3">
                  <span className="inline-block text-xs font-mono-tabular font-bold text-[#D9F951]">
                    {card.step}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8C2B8] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(card.id)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#D9F951] text-[#111612] font-bold text-xs sm:text-sm hover:brightness-95 transition-all cursor-pointer"
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

