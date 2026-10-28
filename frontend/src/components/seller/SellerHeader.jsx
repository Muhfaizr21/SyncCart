import React, { useState } from 'react'

export function SellerHeader({
  currentUser,
  store,
  globalSearch,
  onGlobalSearchChange,
  onSyncAll,
  isSyncing,
  lowStockCount = 0,
  needsResiCount = 0,
  onSelectTab,
  onReturnToLanding,
  onSwitchAccount,
  onLogout,
  onOpenMobileSidebar,
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const initials = (currentUser?.full_name || 'Seller SyncCart')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-30 h-[66px] bg-[#FFFFFF] border-b border-[#ECEAE4] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Hamburger + Search Task Input matching RentFlow reference */}
      <div className="flex items-center gap-3 flex-1 max-w-[340px]">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-9 h-9 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-center text-[#141413] cursor-pointer"
          aria-label="Buka navigasi sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M4 12H20M4 17H14"
              stroke="#141413"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative flex-1">
          <label htmlFor="seller-global-search" className="sr-only">
            Cari tugas, produk, atau pesanan
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#52524E]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#52524E" strokeWidth="2" />
              <path d="M20 20L16.5 16.5" stroke="#52524E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="seller-global-search"
            type="search"
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder="Search task"
            className="w-full h-[38px] pl-9 pr-12 rounded-full bg-[#F7F6F3] border border-[#ECEAE4] text-xs font-medium text-[#141413] placeholder:text-[#767470] focus:outline-none focus:border-[#F6671E]"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono-tabular text-[11px] font-bold text-[#141413]">
            ⌘ F
          </span>
        </div>
      </div>

      {/* Right: Sync / Inbox Icon, Notification Bell, & User Profile Pill matching RentFlow */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onReturnToLanding}
          className="hidden md:inline-flex h-[36px] px-3 rounded-full border border-[#ECEAE4] bg-[#F7F6F3] hover:bg-[#FFDECE]/50 text-[11px] font-bold text-[#141413] items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>← Landing Page</span>
        </button>

        {/* Sync / Message Icon Circle matching RentFlow */}
        <button
          type="button"
          onClick={onSyncAll}
          disabled={isSyncing}
          title="Sinkronkan seluruh stok Shopee, Tokopedia, & TikTok Shop"
          aria-label="Sinkronkan seluruh stok 3 marketplace"
          className="w-[38px] h-[38px] rounded-full border border-[#ECEAE4] bg-[#F7F6F3] hover:bg-[#FFDECE]/40 flex items-center justify-center text-[#141413] cursor-pointer transition-colors disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={isSyncing ? 'animate-spin' : ''}
            aria-hidden="true"
          >
            <rect
              x="3.5"
              y="5.5"
              width="17"
              height="13"
              rx="2.5"
              stroke="#141413"
              strokeWidth="1.7"
            />
            <path
              d="M4.5 7L12 12.5L19.5 7"
              stroke="#F6671E"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Notification Bell Circle matching RentFlow */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifikasi operasional toko"
            className="relative w-[38px] h-[38px] rounded-full border border-[#ECEAE4] bg-[#F7F6F3] hover:bg-[#FFDECE]/40 flex items-center justify-center text-[#141413] cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="#141413"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21A2 2 0 0 1 10.27 21"
                stroke="#F6671E"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            {(lowStockCount > 0 || needsResiCount > 0) && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#F6671E]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl p-3.5 space-y-2.5 z-50">
              <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-2">
                <span className="text-xs font-extrabold text-[#141413]">Notifikasi Toko</span>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-bold text-[#9A3408] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('orders')
                  setNotifOpen(false)
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/40 border border-[#ECEAE4] text-xs cursor-pointer"
              >
                <p className="font-bold text-[#141413]">
                  {needsResiCount} Pesanan Perlu Input Resi
                </p>
                <p className="text-[#52524E] mt-0.5">Klik untuk memproses pengiriman.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('products')
                  setNotifOpen(false)
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/40 border border-[#ECEAE4] text-xs cursor-pointer"
              >
                <p className="font-bold text-[#141413]">
                  {lowStockCount} SKU Perlu Rekonsiliasi Stok
                </p>
                <p className="text-[#52524E] mt-0.5">Klik untuk membuka katalog produk.</p>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Pill matching Esther Howard top-right in RentFlow */}
        <div className="relative pl-1.5">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
          >
            <div
              className="w-9 h-9 rounded-full bg-[#141413] text-[#FFFFFF] flex items-center justify-center font-mono-tabular text-xs font-extrabold shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[13px] font-bold text-[#141413]">
                {currentUser?.full_name?.replace(' (Seller)', '') || 'Budi Pratama'}
              </p>
              <p className="text-[11px] text-[#52524E]">
                {currentUser?.email || 'seller@synccart.id'}
              </p>
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl p-2.5 space-y-1 z-50 text-xs">
              <div className="px-2.5 py-2 border-b border-[#ECEAE4]">
                <p className="font-extrabold text-[#141413]">
                  {store?.store_name || 'Toko Nusantara Official'}
                </p>
                <p className="text-[11px] text-[#9A3408] font-bold uppercase mt-0.5">
                  Paket {store?.plan || 'Business'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onSyncAll()
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#FAF9F6] font-bold text-[#141413] cursor-pointer"
              >
                Sync Stok 3 Channel
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onSwitchAccount()
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#FAF9F6] font-bold text-[#141413] cursor-pointer"
              >
                Ganti Akun (Seller / Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onReturnToLanding()
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#FAF9F6] font-bold text-[#141413] cursor-pointer"
              >
                Lihat Landing Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onLogout()
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#FDE8E8] font-bold text-[#9B1C1C] cursor-pointer"
              >
                Keluar (Logout)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
