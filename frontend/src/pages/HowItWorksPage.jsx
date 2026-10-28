import { useState } from 'react'
import { DAILY_WORKFLOW_SCHEMAS, ONBOARDING_STEPS } from '../data/landingData'

export function HowItWorksPage({ onNavigate, onOpenModal, isDark }) {
  const [sellerType, setSellerType] = useState('existing') // new | existing
  const [activePeriod, setActivePeriod] = useState('pagi')

  const currentPeriodData =
    DAILY_WORKFLOW_SCHEMAS.find((item) => item.id === activePeriod) ||
    DAILY_WORKFLOW_SCHEMAS[0]

  return (
    <div className="w-full">
      {/* Page Hero Header */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.92] text-[clamp(2.8rem,7vw,5.8rem)]">
            ALUR SETUP & CARA KERJA HARIAN
          </h1>
          <p className="mt-4 text-white text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Dari pendaftaran akun, otorisasi OAuth ke 3 marketplace, hingga rutinitas harian
            pagi dan sore yang memangkas waktu admin Anda hingga 2 jam setiap hari.
          </p>
        </div>
      </section>

      <section
        aria-label="Tahapan Onboarding dan Rutinitas Harian"
        className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-10 ${
          isDark ? 'bg-[#111612] text-white' : 'bg-[#F4F7EE] text-[#111612]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-16">
          {/* 4-STEP ONBOARDING FLOW (Real 4-step workflow from LANDING.MD) */}
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#161816] text-[#D9F951] text-xs font-extrabold uppercase tracking-wider">
                  4 Langkah Onboarding Seller
                </span>
                <h2 className="font-display font-black uppercase text-3xl sm:text-5xl tracking-tight mt-3">
                  Siap Jualan di 3 Marketplace Dalam ~20-25 Menit
                </h2>
              </div>

              {/* Toggle Seller Baru vs Seller Existing (100+ Produk) from LANDING.MD Q3 */}
              <div className="inline-flex p-1.5 rounded-2xl bg-[#161816] border border-white/15">
                <button
                  type="button"
                  onClick={() => setSellerType('existing')}
                  aria-pressed={sellerType === 'existing'}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    sellerType === 'existing'
                      ? 'bg-[#D9F951] text-[#111612]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Seller Lama (100+ Produk: ~20 Menit)
                </button>
                <button
                  type="button"
                  onClick={() => setSellerType('new')}
                  aria-pressed={sellerType === 'new'}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    sellerType === 'new'
                      ? 'bg-[#D9F951] text-[#111612]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Seller Baru (Mulai Nol: ~25 Menit)
                </button>
              </div>
            </div>

            {/* Breakdown Banner for Selected Seller Type */}
            <div className="p-6 rounded-3xl bg-[#145A43] text-white border border-[#D9F951]/40 grid grid-cols-1 sm:grid-cols-4 gap-4">
              {sellerType === 'existing' ? (
                <>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 1</p>
                    <p className="text-base font-extrabold mt-0.5">Daftar Akun: 2 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 2</p>
                    <p className="text-base font-extrabold mt-0.5">Konek 3 Toko: 10 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 3</p>
                    <p className="text-base font-extrabold mt-0.5">Auto-Import 100+ SKU: 5 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#D9F951] text-[#111612]">
                    <p className="text-xs font-extrabold uppercase">Total Setup</p>
                    <p className="font-mono-tabular text-xl font-black mt-0.5">~20 Menit Siap Jalan</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 1</p>
                    <p className="text-base font-extrabold mt-0.5">Daftar Akun: 2 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 2</p>
                    <p className="text-base font-extrabold mt-0.5">OAuth 3 Marketplace: 9 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111612]/40">
                    <p className="text-xs text-[#D9F951] font-bold">Langkah 3</p>
                    <p className="text-base font-extrabold mt-0.5">Buat 10 Produk Awal: 10 Menit</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#D9F951] text-[#111612]">
                    <p className="text-xs font-extrabold uppercase">Total Setup</p>
                    <p className="font-mono-tabular text-xl font-black mt-0.5">~25 Menit Siap Jalan</p>
                  </div>
                </>
              )}
            </div>

            {/* 4 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {ONBOARDING_STEPS.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-6 rounded-3xl bg-[#161816] text-white border border-white/15 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-2xl font-black text-[#D9F951]">
                        {step.stepNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold text-white">
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-[#B8C2B8] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-xs font-semibold text-[#D9F951]">
                    Hasil: {step.deliverable}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVE DAILY WORKFLOW (Pagi 10 Menit | Proses Order 1-2 Menit | Sore 5 Menit) */}
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-xl space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                  Jadwal Operasional Harian Seller
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mt-3">
                  Bagaimana Hari Kerja Anda Berubah Bersama SyncCart
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {DAILY_WORKFLOW_SCHEMAS.map((item) => {
                  const selected = activePeriod === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePeriod(item.id)}
                      aria-pressed={selected}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#D9F951] text-[#111612]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {item.period} ({item.duration})
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#111612] border border-white/15 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#B8C2B8] font-bold">
                    Durasi dengan SyncCart
                  </p>
                  <p className="font-mono-tabular text-3xl font-extrabold text-[#D9F951] mt-1">
                    {currentPeriodData.duration}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-[#B8C2B8] font-bold">
                    Bandingkan Cara Manual
                  </p>
                  <p className="font-mono-tabular text-base font-bold text-[#FCA5A5] mt-1">
                    {currentPeriodData.manualDuration}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentPeriodData.tasks.map((task, idx) => (
                  <div
                    key={task}
                    className="p-4 rounded-2xl bg-[#111612] border border-white/10 flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#145A43] text-[#D9F951] font-mono-tabular text-xs font-extrabold inline-flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-white leading-relaxed">{task}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Banner to Pricing */}
          <div className="p-8 rounded-3xl bg-[#161816] text-white border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Siap memilih paket yang sesuai dengan jumlah SKU dan toko Anda?
              </h3>
              <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
                Cek perbandingan transparan antara paket Free Trial, Starter, Business, dan Enterprise.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('harga')}
                className="min-h-[46px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm cursor-pointer"
              >
                Lihat Halaman Harga Paket
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

