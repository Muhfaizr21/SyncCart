import { useState } from 'react'
import {
  FAQ_ITEMS,
  ROADMAP_QUARTERS,
  SELLER_USE_CASES,
} from '../data/landingData'

export function UseCasesFaqPage({ onOpenModal, isDark }) {
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(SELLER_USE_CASES[0].id)
  const [faqCategory, setFaqCategory] = useState('Semua')
  const [faqSearch, setFaqSearch] = useState('')
  const [openFaqIds, setOpenFaqIds] = useState(['faq-keamanan', 'faq-api-down'])

  const categories = [
    'Semua',
    'Keamanan & Data',
    'Teknis & Sinkronisasi',
    'Onboarding',
    'Langganan & Tagihan',
    'Layanan Bantuan',
  ]

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = faqCategory === 'Semua' || item.category === faqCategory
    const matchesSearch =
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function toggleFaq(id) {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const activeUseCase =
    SELLER_USE_CASES.find((u) => u.id === selectedUseCaseId) || SELLER_USE_CASES[0]

  return (
    <div className="w-full">
      {/* Page Hero Header */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.92] text-[clamp(2.8rem,7vw,5.8rem)]">
            STUDI KASUS SELLER, 10 FAQ & ROADMAP
          </h1>
          <p className="mt-4 text-white text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pelajari bagaimana SyncCart menyesuaikan alur kerja untuk seller baru, toko
            omnichannel, reseller multi-supplier, hingga brand enterprise multi-gudang.
          </p>
        </div>
      </section>

      <section
        aria-label="Studi Kasus, Pertanyaan Umum, dan Roadmap"
        className={`py-14 sm:py-20 px-4 sm:px-6 lg:px-10 ${
          isDark ? 'bg-[#111612] text-white' : 'bg-[#F4F7EE] text-[#111612]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-16">
          {/* 4 SELLER USE CASES INTERACTIVE SELECTOR */}
          <div className="space-y-8">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 rounded-full bg-[#161816] text-[#D9F951] text-xs font-extrabold uppercase tracking-wider">
                4 Skenario Implementasi Seller
              </span>
              <h2 className="font-display font-black uppercase text-3xl sm:text-5xl tracking-tight mt-3">
                Pilih Skala Toko yang Paling Sesuai dengan Kondisi Anda
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SELLER_USE_CASES.map((uc) => {
                const isSelected = uc.id === selectedUseCaseId
                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => setSelectedUseCaseId(uc.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[60px] p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#161816] border-2 border-[#D9F951] text-white shadow-lg'
                        : isDark
                          ? 'bg-[#161816]/60 border-white/15 text-[#B8C2B8] hover:text-white'
                          : 'bg-white border-[#111612]/15 text-[#111612] hover:bg-[#161816]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-[#145A43] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
                        {uc.initials}
                      </span>
                      <div>
                        <p className="text-sm font-bold">{uc.personaName}</p>
                        <p className="text-xs opacity-75">{uc.role}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active Use Case Detail Card */}
            <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                  {activeUseCase.badge}
                </span>
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-[#145A43] border border-[#D9F951]/40 text-white font-extrabold text-base inline-flex items-center justify-center shrink-0">
                    {activeUseCase.initials}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">{activeUseCase.personaName}</h3>
                    <p className="text-xs sm:text-sm text-[#B8C2B8]">{activeUseCase.role}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#111612] border border-white/10 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FCA5A5]">
                    Tantangan Awal:
                  </p>
                  <p className="text-xs sm:text-sm text-white leading-relaxed">
                    {activeUseCase.challenge}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#D9F951]">
                  Solusi Operasional dengan SyncCart:
                </h4>
                <ul className="space-y-2.5">
                  {activeUseCase.solutionSteps.map((step, i) => (
                    <li
                      key={step}
                      className="p-3.5 rounded-2xl bg-[#111612] border border-white/10 flex items-center gap-3 text-xs sm:text-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#145A43] text-[#D9F951] font-mono-tabular text-xs font-bold inline-flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#145A43] border border-[#D9F951]/40">
                  <div>
                    <p className="text-xs text-[#D9F951] font-bold">Target Dampak Operasional:</p>
                    <p className="text-sm sm:text-base font-extrabold text-white">
                      {activeUseCase.outcomeMetric}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-[#111612] text-[#D9F951] text-xs font-bold shrink-0">
                    Rekomendasi: {activeUseCase.recommendedPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 10 PRODUCT-SPECIFIC FAQS WITH SEARCH & CATEGORY FILTER */}
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#161816] text-[#D9F951] text-xs font-extrabold uppercase tracking-wider">
                  10 Pertanyaan Teknis & Operasional
                </span>
                <h2 className="font-display font-black uppercase text-3xl sm:text-5xl tracking-tight mt-3">
                  Jawaban Lengkap Seputar Keamanan, API, dan Tagihan
                </h2>
              </div>

              <div className="w-full lg:w-80">
                <label htmlFor="faq-search-input" className="sr-only">
                  Cari topik pertanyaan
                </label>
                <input
                  id="faq-search-input"
                  type="search"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Cari: token, API error, prorata, kurir..."
                  className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm ${
                    isDark
                      ? 'bg-[#161816] border-white/25 text-white placeholder:text-[#8E9B8E]'
                      : 'bg-white border-[#111612]/25 text-[#111612] placeholder:text-[#3D4A3E]'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = faqCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    aria-pressed={active}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#161816] text-[#D9F951] border border-[#D9F951]'
                        : isDark
                          ? 'bg-[#161816] text-white border border-white/15 hover:bg-white/10'
                          : 'bg-white text-[#111612] border border-[#111612]/15 hover:bg-[#161816]/10'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* FAQ Empty State per R-27 */}
            {filteredFaqs.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#161816] text-white border border-white/15 text-center space-y-3">
                <h3 className="text-lg font-bold">
                  Tidak Ditemukan Pertanyaan untuk "{faqSearch}"
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C2B8] max-w-md mx-auto">
                  Silakan reset kata kunci pencarian atau tanyakan langsung kebutuhan teknis toko
                  Anda kepada tim kami.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFaqSearch('')
                      setFaqCategory('Semua')
                    }}
                    className="min-h-[44px] px-5 py-2 rounded-full bg-[#D9F951] text-[#111612] font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    Tampilkan Semua 10 FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenModal('demo')}
                    className="min-h-[44px] px-5 py-2 rounded-full border border-white/25 text-white font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    Tanya Tim via Sesi Demo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqIds.includes(faq.id)
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-2xl border overflow-hidden ${
                        isDark
                          ? 'bg-[#161816] border-white/15 text-white'
                          : 'bg-white border-[#111612]/15 text-[#111612]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        aria-expanded={isOpen}
                        className="w-full min-h-[56px] p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#145A43] text-white">
                            {faq.category}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold">{faq.question}</h3>
                        </div>
                        <span
                          className="w-9 h-9 rounded-full bg-[#161816] text-[#D9F951] font-mono-tabular text-lg font-bold inline-flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          {isOpen ? '-' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-current/10">
                          <p
                            className={`text-sm leading-relaxed ${
                              isDark ? 'text-[#B8C2B8]' : 'text-[#3D4A3E]'
                            }`}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* PRODUCT ROADMAP (From LANDING.MD Q10) */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#145A43] text-white text-xs font-extrabold uppercase tracking-wider">
                Peta Jalan Pengembangan (Roadmap)
              </span>
              <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tight mt-3">
                Fitur yang Sedang Kami Bangun Bersama Seller Aktif
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ROADMAP_QUARTERS.map((rq) => (
                <div
                  key={rq.quarter}
                  className="p-6 rounded-3xl bg-[#161816] text-white border border-white/15 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-2xl font-extrabold uppercase text-[#D9F951]">
                      {rq.quarter}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-white">
                      {rq.status}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {rq.items.map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-[#B8C2B8] flex items-start gap-2.5">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-[#D9F951] shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

