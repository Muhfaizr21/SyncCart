import { useEffect, useState } from 'react'
import { NAV_PAGES } from '../../data/landingData'
import { SyncCartLogoMark } from '../doodles/WinglyDoodles'

export function Navbar({
  activePage,
  onNavigate,
  onOpenModal,
  isDark,
  onToggleTheme,
  currentUser,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  function handleSelectPage(pageId) {
    onNavigate(pageId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="relative z-40 w-full">
      <nav
        aria-label="Navigasi Utama SyncCart"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-4 flex items-center justify-between gap-4"
      >
        {/* Brand Identity */}
        <button
          type="button"
          onClick={() => handleSelectPage('beranda')}
          className="min-h-[44px] px-2 -ml-2 inline-flex items-center gap-2.5 rounded-xl text-white hover:opacity-95 transition-opacity cursor-pointer"
        >
          <SyncCartLogoMark className="w-9 h-7 shrink-0" />
          <span className="text-2xl font-bold tracking-tight text-white">
            synccart
          </span>
        </button>

        {/* Desktop Centered Page Menu */}
        <ul className="hidden xl:flex items-center gap-1 bg-[#111612]/25 px-2 py-1.5 rounded-full border border-white/20">
          {NAV_PAGES.map((page) => {
            const isActive = activePage === page.id
            return (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => handleSelectPage(page.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#D9F951] text-[#111612] font-semibold'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  {page.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Right Actions: Theme Toggle + Auth / Workspace Actions + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Ganti ke mode siang' : 'Ganti ke mode malam'}
            className="min-h-[44px] px-3 py-2 rounded-full border border-white/40 bg-[#111612]/30 text-white text-xs font-medium hover:bg-[#111612]/50 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDark ? 'bg-[#D9F951]' : 'bg-white'
              }`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{isDark ? 'Malam' : 'Siang'}</span>
          </button>

          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectPage('workspace')}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activePage === 'workspace'
                    ? 'bg-[#D9F951] text-[#111612]'
                    : 'bg-[#161816] text-white border border-[#D9F951]'
                }`}
              >
                {currentUser.role === 'super_admin' ? 'Panel SuperAdmin' : 'Workspace Seller'}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[44px] px-3.5 py-2 rounded-full bg-[#5C1A1B] text-white border border-white/25 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectPage('auth')}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activePage === 'auth'
                    ? 'bg-[#D9F951] text-[#111612]'
                    : 'bg-[#161816] text-white border border-white/35 hover:border-[#D9F951]'
                }`}
              >
                Masuk / Daftar
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('trial')}
                className="hidden md:inline-flex min-h-[44px] items-center justify-center px-4 py-2 rounded-full border-2 border-white/80 bg-[#111612]/25 hover:bg-[#D9F951] hover:border-[#D9F951] hover:text-[#111612] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Trial 30 Hari
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger with explicit "Menu" label */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            className="xl:hidden min-h-[44px] px-4 py-2 rounded-full bg-[#161816] text-white border border-white/30 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#D9F951]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <path d="M4 7H20M4 12H20M4 17H14" />
              )}
            </svg>
            <span>{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-panel"
          className="xl:hidden mx-4 mt-2 p-4 rounded-3xl bg-[#161816] text-white border border-white/20 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B8C2B8] px-3 mb-2">
            Pilih Halaman
          </p>
          <ul className="flex flex-col gap-1.5">
            {NAV_PAGES.map((page) => {
              const isActive = activePage === page.id
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPage(page.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-2xl text-left text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#D9F951] text-[#111612]'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{page.label}</span>
                    {isActive && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#111612] text-[#D9F951]">
                        Aktif
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row gap-2.5">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectPage('workspace')}
                  className="w-full min-h-[44px] px-5 py-3 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm text-center cursor-pointer"
                >
                  Buka Workspace ({currentUser.role})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full min-h-[44px] px-5 py-3 rounded-full bg-[#5C1A1B] text-white font-semibold text-sm text-center cursor-pointer"
                >
                  Keluar (Logout)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectPage('auth')}
                  className="w-full min-h-[44px] px-5 py-3 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm text-center cursor-pointer"
                >
                  Masuk / Daftar Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onOpenModal('trial')
                  }}
                  className="w-full min-h-[44px] px-5 py-3 rounded-full bg-white/10 text-white font-semibold text-sm text-center hover:bg-white/20 cursor-pointer"
                >
                  Trial Gratis 30 Hari
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
