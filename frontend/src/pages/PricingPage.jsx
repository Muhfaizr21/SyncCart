import { useState } from 'react'
import { PRICING_PLANS } from '../data/landingData'

export function PricingPage({ onNavigate, onOpenModal, isDark }) {
  const [earlyAdopterDiscount, setEarlyAdopterDiscount] = useState(true)
  const [remainingDays, setRemainingDays] = useState(15)

  // Proration math from LANDING.MD Q7 (Starter 99K -> Business 299K, difference 200K full month)
  const fullMonthDiff = 299000 - 99000
  const proratedAmount = Math.round((fullMonthDiff * remainingDays) / 30)

  return (
    <div className="w-full">
      {/* Page Hero Header */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.92] text-[clamp(2.8rem,7vw,5.8rem)]">
            HARGA TRANSPARAN TANPA BIAYA TERSEMBUNYI
          </h1>
          <p className="mt-4 text-white text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pilih kapasitas sesuai skala toko Anda hari ini. Tanpa biaya setup, tanpa potongan
            komisi per transaksi, dan bebas upgrade atau batalkan kapan saja.
          </p>
        </div>
      </section>

      <section
        aria-label="Daftar Paket dan Simulasi Prorata"
        className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-10 ${
          isDark ? 'bg-[#111612] text-white' : 'bg-[#F4F7EE] text-[#111612]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Early Adopter Promo Bar (from LANDING.MD lines 576-594) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border-2 border-[#D9F951] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold uppercase">
                Penawaran Early Adopter
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
                Diskon 20% Selama 12 Bulan Pertama + 30 Hari Free Trial
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C2B8]">
                Contoh pada Business Plan: harga normal Rp 299.000/bulan menjadi{' '}
                <strong className="text-[#D9F951]">Rp 239.000/bulan</strong> (hemat Rp
                60.000/bulan atau Rp 720.000/tahun), ditambah sesi konsultasi onboarding gratis.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#111612] p-1.5 rounded-2xl border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setEarlyAdopterDiscount(true)}
                aria-pressed={earlyAdopterDiscount}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  earlyAdopterDiscount
                    ? 'bg-[#D9F951] text-[#111612]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Harga Promo (-20%)
              </button>
              <button
                type="button"
                onClick={() => setEarlyAdopterDiscount(false)}
                aria-pressed={!earlyAdopterDiscount}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  !earlyAdopterDiscount
                    ? 'bg-[#D9F951] text-[#111612]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Harga Normal Bulanan
              </button>
            </div>
          </div>

          {/* 4-Tier Pricing Grid (Matching LANDING.MD Free, Starter, Business, Enterprise) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {PRICING_PLANS.map((plan) => {
              const displayNominal =
                plan.monthlyPrice === null
                  ? 'Custom'
                  : plan.monthlyPrice === 0
                    ? 'Gratis'
                    : earlyAdopterDiscount
                      ? `Rp ${plan.annualMonthlyPrice.toLocaleString('id-ID')}`
                      : `Rp ${plan.monthlyPrice.toLocaleString('id-ID')}`

              return (
                <div
                  key={plan.id}
                  className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between gap-6 border ${
                    plan.recommended
                      ? 'bg-[#161816] text-white border-2 border-[#D9F951] shadow-2xl'
                      : isDark
                        ? 'bg-[#161816] text-white border-white/15'
                        : 'bg-white text-[#111612] border-[#111612]/15 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                        {plan.name}
                      </h3>
                      {plan.recommended && (
                        <span className="px-2.5 py-1 rounded-full bg-[#D9F951] text-[#111612] text-[11px] font-extrabold">
                          3+ Marketplace
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        plan.recommended || isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'
                      }`}
                    >
                      {plan.subtitle}
                    </p>

                    <div className="pt-2 pb-4 border-b border-current/10">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-mono-tabular text-3xl sm:text-4xl font-black ${
                            plan.recommended ? 'text-[#D9F951]' : ''
                          }`}
                        >
                          {displayNominal}
                        </span>
                        <span className="text-xs opacity-75">{plan.periodDisplay}</span>
                      </div>
                      {earlyAdopterDiscount && plan.monthlyPrice > 0 && (
                        <p className="text-xs mt-1 text-[#145A43] dark:text-[#D9F951] font-semibold">
                          Harga normal: Rp {plan.monthlyPrice.toLocaleString('id-ID')}/bln
                        </p>
                      )}
                    </div>

                    {/* Core Quotas */}
                    <div className="p-3.5 rounded-2xl bg-current/5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="opacity-75">Channel:</span>
                        <strong>{plan.channelLimit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Katalog:</span>
                        <strong>{plan.productLimit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Pesanan:</span>
                        <strong>{plan.orderLimit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Akses Tim:</span>
                        <strong>{plan.staffLimit}</strong>
                      </div>
                    </div>

                    {/* Included Features */}
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                        Yang Anda Dapatkan:
                      </p>
                      <ul className="space-y-2">
                        {plan.included.map((inc) => (
                          <li key={inc} className="text-xs flex items-start gap-2">
                            <span
                              className="mt-0.5 w-4 h-4 rounded-full bg-[#145A43] text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0"
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Excluded Features if any */}
                    {plan.excluded.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-current/10">
                        <p className="text-[11px] font-bold uppercase tracking-wider opacity-65">
                          Belum Termasuk:
                        </p>
                        <ul className="space-y-1">
                          {plan.excluded.map((exc) => (
                            <li key={exc} className="text-xs opacity-70 flex items-start gap-2">
                              <span aria-hidden="true">-</span>
                              <span>{exc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal(plan.id === 'enterprise' ? 'demo' : 'trial', plan.name)
                    }
                    className={`w-full min-h-[46px] px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      plan.recommended
                        ? 'bg-[#D9F951] text-[#111612] hover:brightness-95'
                        : 'bg-[#145A43] text-white hover:bg-[#1E8E6E]'
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Interactive Proration Simulator (LANDING.MD Q7) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#145A43] text-white text-xs font-bold">
                Simulasi Upgrade Paket Fleksibel (Prorata)
              </span>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight">
                Mulai dari Starter, Upgrade ke Business Kapan Saja
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C2B8] leading-relaxed">
                Jika toko Anda berkembang di tengah bulan dan membutuhkan tambahan kuota marketplace
                atau fitur Webhook Real-time, Anda cukup membayar selisih hari yang tersisa di bulan
                tersebut.
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                  <label htmlFor="prorata-days">
                    Sisa Hari pada Siklus Tagihan Bulan Ini:
                  </label>
                  <span className="font-mono-tabular text-[#D9F951] font-bold">
                    {remainingDays} Hari Tersisa
                  </span>
                </div>
                <input
                  id="prorata-days"
                  type="range"
                  min="1"
                  max="30"
                  value={remainingDays}
                  onChange={(e) => setRemainingDays(Number(e.target.value))}
                  className="w-full accent-[#D9F951] h-2.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111612] border border-white/15 space-y-3">
              <p className="text-xs text-[#B8C2B8]">
                Estimasi Selisih Upgrade (Starter Rp 99.000 ke Business Rp 299.000):
              </p>
              <p className="font-mono-tabular text-3xl font-black text-[#D9F951]">
                Rp {proratedAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-[#B8C2B8]">
                Fitur Business langsung aktif detik itu juga. Jika Anda melakukan downgrade,
                perubahan berlaku di akhir bulan tanpa biaya penalti.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('studi-kasus-faq')}
                  className="min-h-[44px] text-xs font-bold text-[#D9F951] hover:underline cursor-pointer"
                >
                  Baca 10 pertanyaan umum soal tagihan & keamanan data
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

