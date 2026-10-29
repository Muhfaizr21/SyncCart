import React from 'react'

const PRIMARY_ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'sellers', label: 'Sellers', icon: 'sellers' },
  { id: 'products', label: 'All Products', icon: 'inventory' },
  { id: 'orders', label: 'All Orders', icon: 'orders' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'payments' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
]

const SECONDARY_ADMIN_NAV = [
  { id: 'users', label: 'Users & RBAC', icon: 'customers' },
  { id: 'logs', label: 'System Logs & Alerts', icon: 'notifications', hasBadge: true },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function NavIcon({ type, active }) {
  const stroke = active ? '#FFFFFF' : '#8A93A2'
  switch (type) {
    case 'dashboard':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'sellers':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'orders':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="13" y2="14" />
        </svg>
      )
    case 'inventory':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    case 'payments':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    case 'analytics':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'customers':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'notifications':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    default:
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
  }
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  notificationCount = 5,
  currentUser,
  onSwitchToSellerPreview,
  onLogout,
  onNavigateLanding,
}) {
  const displayName = currentUser?.full_name || 'Super Admin SyncCart'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="flex w-[242px] shrink-0 flex-col justify-between bg-[#11141A] text-[#E6E9EF] select-none border-r border-[#1F242F]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="flex items-center gap-2.5 text-left group"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E232E] text-white border border-[#2C3342]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
              </svg>
            </span>
            <div>
              <span className="block text-[16px] font-bold tracking-tight text-white leading-none">
                SyncCart
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#7D8797] mt-0.5">
                SuperAdmin
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={onSwitchToSellerPreview}
            title="Pratinjau Seller Workspace"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A93A2] hover:bg-[#1D222C] hover:text-white transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between rounded-lg bg-[#1A1E27] border border-[#262C39] px-3 py-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg className="h-3.5 w-3.5 shrink-0 text-[#7D8797]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search seller, SKU, order"
                className="w-full bg-transparent text-[12.5px] text-white placeholder-[#7D8797] focus:outline-none"
              />
            </div>
            <span className="ml-1.5 shrink-0 rounded bg-[#232936] px-1.5 py-0.5 text-[10px] font-medium text-[#8A93A2]">
              ⌘ F
            </span>
          </div>
        </div>

        {/* Primary SuperAdmin Navigation (FITUR.MD pages/admin/*) */}
        <nav className="space-y-0.5 px-2.5">
          {PRIMARY_ADMIN_NAV.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                  active
                    ? 'bg-[#202531] text-white shadow-xs'
                    : 'text-[#8F98A8] hover:bg-[#191D26] hover:text-[#D5DBE6]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <NavIcon type={item.icon} active={active} />
                  <span>{item.label}</span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="my-3.5 mx-4 border-t border-[#1F2531]" />

        {/* Secondary Governance & System Navigation */}
        <nav className="space-y-0.5 px-2.5">
          {SECONDARY_ADMIN_NAV.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                  active
                    ? 'bg-[#202531] text-white shadow-xs'
                    : 'text-[#8F98A8] hover:bg-[#191D26] hover:text-[#D5DBE6]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <NavIcon type={item.icon} active={active} />
                  <span>{item.label}</span>
                </span>
                {item.hasBadge && notificationCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile & Mode Switcher */}
      <div className="p-3.5 border-t border-[#1F2531] space-y-2.5">
        <button
          type="button"
          onClick={onSwitchToSellerPreview}
          className="flex w-full items-center justify-between rounded-lg bg-[#1A1F2B] hover:bg-[#242B3A] border border-[#293040] px-3 py-2 text-[11px] font-semibold text-[#C9D1DF] transition"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span>Pratinjau Seller UI</span>
          </span>
          <span className="text-[#8A93A2]">→</span>
        </button>

        <div className="flex items-center justify-between px-1.5 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#384152] to-[#1E232E] text-[11px] font-bold text-white border border-[#3E485B]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-white">{displayName}</p>
              <p className="truncate text-[10.5px] text-[#7D8797]">
                {currentUser?.email || 'superadmin@synccart.id'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Keluar Sesi"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8A93A2] hover:bg-[#1D222C] hover:text-white transition"
          >
            <span className="text-sm tracking-widest">•••</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
