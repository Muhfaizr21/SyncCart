import React from 'react'

const SELLER_MENU_GROUPS = [
  {
    groupLabel: 'Home',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'marketplace', label: 'Marketplace' },
      { id: 'products', label: 'Produk & Stok' },
      { id: 'orders', label: 'Pesanan & Resi' },
      { id: 'reports', label: 'Analytics' },
      { id: 'team', label: 'Tim & RBAC' },
    ],
  },
  {
    groupLabel: 'Others',
    items: [
      { id: 'subscription', label: 'Langganan' },
      { id: 'settings', label: 'Pengaturan' },
    ],
  },
]

function SidebarIcon({ id, active }) {
  const strokeColor = active ? '#F6671E' : '#52524E'

  switch (id) {
    case 'dashboard':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="3"
            width="7.5"
            height="7.5"
            rx="1.8"
            fill={active ? '#F6671E' : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <rect
            x="13.5"
            y="3"
            width="7.5"
            height="7.5"
            rx="1.8"
            fill={active ? '#F6671E' : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <rect
            x="3"
            y="13.5"
            width="7.5"
            height="7.5"
            rx="1.8"
            fill={active ? '#F6671E' : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <rect
            x="13.5"
            y="13.5"
            width="7.5"
            height="7.5"
            rx="1.8"
            fill={active ? '#F6671E' : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'marketplace':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9.5L5.6 4.5H18.4L20 9.5M4 9.5C4 11.15 5.34 12.5 7 12.5C8.66 12.5 10 11.15 10 9.5M4 9.5V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V9.5M10 9.5C10 11.15 11.34 12.5 13 12.5C14.66 12.5 16 11.15 16 9.5M16 9.5C16 11.15 17.34 12.5 19 12.5C19.35 12.5 19.69 12.44 20 12.33"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'products':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 21H21M5 21V7L12 3L19 7V21M9 21V13H15V21"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'orders':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="5"
            y="3.5"
            width="14"
            height="17"
            rx="2.5"
            stroke={strokeColor}
            strokeWidth="1.75"
          />
          <path
            d="M8.5 8.5H15.5M8.5 12.5H15.5M8.5 16.5H12.5"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'reports':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="3"
            stroke={strokeColor}
            strokeWidth="1.75"
          />
          <path
            d="M8 16V12M12 16V8M16 16V10"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'team':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="8.5" r="3.2" stroke={strokeColor} strokeWidth="1.75" />
          <path
            d="M3.5 19C3.5 15.96 5.96 13.5 9 13.5C12.04 13.5 14.5 15.96 14.5 19"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="16.5" cy="9.5" r="2.3" stroke={strokeColor} strokeWidth="1.6" />
          <path
            d="M15.5 14C18 14.2 20 16.25 20 18.8"
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'subscription':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
            stroke={strokeColor}
            strokeWidth="1.75"
          />
          <path d="M3 10H21" stroke={strokeColor} strokeWidth="1.75" />
          <path d="M7 15H11" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      )
    case 'settings':
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3.5"
            y="4.5"
            width="17"
            height="16"
            rx="2.5"
            stroke={strokeColor}
            strokeWidth="1.75"
          />
          <path
            d="M8 3V6M16 3V6M3.5 9.5H20.5"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}

export function SellerSidebar({
  activeTab,
  onSelectTab,
  needsResiCount = 0,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navigasi Seller SyncCart"
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-[228px] h-screen shrink-0 bg-[#FFFFFF] border-r border-[#ECEAE4] flex flex-col justify-between px-4 py-4 select-none transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section: Brand + Menu Groups */}
        <div className="space-y-4">
          {/* Brand Header aligned with Top Header bar */}
          <div className="h-10 flex items-center justify-between px-1.5">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
            >
              <span className="w-7 h-7 rounded-lg bg-[#F6671E] flex items-center justify-center shadow-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 4L20 19H4L12 4Z" fill="#FFFFFF" />
                </svg>
              </span>
              <span className="text-[16px] font-extrabold tracking-tight text-[#141413]">
                SyncCart
              </span>
            </button>

            <span className="text-[#8A8884] hidden lg:inline-flex items-center" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9H18M6 15H18"
                  stroke="#9A9893"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-lg border border-[#ECEAE4] flex items-center justify-center text-[#141413]"
              aria-label="Tutup menu navigasi"
            >
              ✕
            </button>
          </div>

          {/* Menu Groups matching RentFlow spacing & active pill */}
          <nav className="space-y-4">
            {SELLER_MENU_GROUPS.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <p className="px-2.5 text-[11px] font-medium text-[#767470]">{group.groupLabel}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id
                    const showDot = item.id === 'orders' && needsResiCount > 0

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id)
                          if (onCloseMobile) onCloseMobile()
                        }}
                        className={`w-full h-[38px] px-3 rounded-xl flex items-center justify-between text-[13px] transition-all cursor-pointer focus:outline-none ${
                          isActive
                            ? 'bg-[#FFF3EC] border border-[#F6671E]/55 text-[#9A3408] font-bold'
                            : 'bg-transparent border border-transparent text-[#52524E] font-medium hover:bg-[#FAF7F4] hover:text-[#141413]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <SidebarIcon id={item.id} active={isActive} />
                          <span className="truncate">{item.label}</span>
                        </span>

                        {showDot && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#F6671E] shrink-0"
                            title={`${needsResiCount} pesanan menunggu resi`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Upgrade to Premium Card matching RentFlow reference */}
        <div className="p-4 rounded-2xl bg-[#F6671E] text-[#141413] space-y-2.5 shadow-[0_10px_24px_rgba(246,103,30,0.22)]">
          <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] flex items-center justify-center shadow-xs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3L19 6V11.5C19 16.2 15.98 20.38 12 21.8C8.02 20.38 5 16.2 5 11.5V6L12 3Z"
                fill="#F6671E"
              />
              <path
                d="M9.5 12L11.2 13.7L14.8 10.1"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-[14px] font-extrabold text-[#141413] leading-tight">
              Upgrade to Premium
            </h3>
            <p className="text-[11px] font-medium text-[#141413] leading-snug">
              Unlock all features including analytics, reports, and unlimited stores.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('subscription')}
            className="w-full h-[36px] px-3 rounded-full bg-[#FFFFFF] text-[#141413] text-xs font-extrabold hover:bg-[#FFF5EF] transition-colors cursor-pointer shadow-xs"
          >
            Upgrade Account
          </button>
        </div>
      </aside>
    </>
  )
}
