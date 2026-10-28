import { NAV_PAGES } from '../../data/landingData'
import { SyncCartLogoMark } from '../doodles/WinglyDoodles'

export function Footer({ activePage, onNavigate, onOpenModal }) {
  return (
    <footer className="bg-[#161816] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Identity & Value Proposition */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2.5">
              <SyncCartLogoMark className="w-9 h-7" />
              <span className="text-2xl font-bold tracking-tight text-white">
                synccart
              </span>
            </div>
            <p className="text-[#B8C2B8] text-sm sm:text-base max-w-xl leading-relaxed">
              Platform orkestrasi multi-channel untuk menghubungkan toko Shopee, Tokopedia,
              dan TikTok Shop Anda dari satu ruang kerja. Stok sinkron otomatis, pesanan
              tercatat rapi, dan laporan laba bersih terekap tanpa rekap manual.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenModal('trial')}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm hover:brightness-95 transition-all cursor-pointer"
              >
                Mulai Gratis 30 Hari
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('demo')}
                className="min-h-[44px] px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Jadwalkan Demo 1-on-1
              </button>
            </div>
          </div>

          {/* Right Purposeful Page Navigation & Channel Status */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D9F951] mb-3">
                Menu Halaman
              </h2>
              <ul className="space-y-2">
                {NAV_PAGES.map((page) => (
                  <li key={page.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(page.id)}
                      className={`min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
                        activePage === page.id
                          ? 'text-[#D9F951] font-semibold'
                          : 'text-[#B8C2B8] hover:text-white'
                      }`}
                    >
                      <span>{page.label}</span>
                      {activePage === page.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#D9F951]">
                          Dibuka
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D9F951]">
                Konektor Marketplace & Kurir
              </h2>
              <p className="text-xs text-[#B8C2B8] leading-relaxed">
                Otorisasi resmi OAuth 2.0 dengan enkripsi token AES-256 dan antrean retry otomatis:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Shopee', 'Tokopedia', 'TikTok Shop', 'JNE', 'J&T', 'SiCepat', 'Anteraja'].map(
                  (partner) => (
                    <span
                      key={partner}
                      className="px-2.5 py-1 rounded-lg bg-[#111612] border border-white/15 text-xs font-medium text-white"
                    >
                      {partner}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#B8C2B8]">
          <p>© 2025 SyncCart. Satu Dashboard, Semua Channel.</p>
          <p>
            Tanpa biaya tersembunyi, tanpa kontrak mengikat, ekspor data Excel tersedia kapan saja.
          </p>
        </div>
      </div>
    </footer>
  )
}

