import React, { useState } from 'react'

export function SellerSettingsPage({ store, currentUser, onUpdateSettings }) {
  const [storeName, setStoreName] = useState(store?.store_name || 'Toko Nusantara Official')
  const [warehouseAddress, setWarehouseAddress] = useState(
    'Jl. Danau Sunter Utara Blok G-12, Jakarta Utara 14350'
  )
  const [couriers, setCouriers] = useState({
    jne: true,
    jnt: true,
    sicepat: true,
    anteraja: false,
  })
  const [notifications, setNotifications] = useState({
    orderReceived: true,
    lowStockAlert: true,
    tokenExpiry: true,
    weeklyDigest: false,
  })
  const [savedNotice, setSavedNotice] = useState('')

  async function handleSaveStore(e) {
    e.preventDefault()
    await onUpdateSettings({ store_name: storeName })
    setSavedNotice('Profil toko, gudang pengiriman, dan kurir berhasil disimpan ke PostgreSQL.')
  }

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs">
        <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
          Phase 10 • Pengaturan Toko, Ekspedisi Kurir, & Keamanan
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
          Konfigurasi Operasional Toko & Integrasi Kurir
        </h1>
        <p className="text-xs sm:text-sm text-[#52524E]">
          Kelola identitas toko utama, alamat gudang pickup, kurir aktif, serta preferensi notifikasi.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-[#E6F6EC] border border-[#A3E2B8] text-xs font-bold text-[#0F5132]">
          {savedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <form
          onSubmit={handleSaveStore}
          className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-4"
        >
          <h2 className="text-base font-extrabold text-[#141413]">
            Profil Toko & Gudang Utama (PostgreSQL)
          </h2>

          <div className="space-y-1">
            <label htmlFor="setting-store-name" className="block text-xs font-bold text-[#141413]">
              Nama Toko Utama
            </label>
            <input
              id="setting-store-name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-bold text-[#141413]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="setting-owner-email" className="block text-xs font-bold text-[#141413]">
              Email Pemilik Terdaftar
            </label>
            <input
              id="setting-owner-email"
              type="email"
              disabled
              value={currentUser?.email || 'seller@synccart.id'}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#EBE8E0]/50 border border-[#EBE8E0] text-xs text-[#52524E]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="setting-warehouse" className="block text-xs font-bold text-[#141413]">
              Alamat Gudang Pickup Utama
            </label>
            <textarea
              id="setting-warehouse"
              rows={3}
              value={warehouseAddress}
              onChange={(e) => setWarehouseAddress(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
            />
          </div>

          <button
            type="submit"
            className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
          >
            Simpan Pengaturan Toko
          </button>
        </form>

        <div className="lg:col-span-5 space-y-5">
          {/* Courier Integration Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-3">
            <h2 className="text-base font-extrabold text-[#141413]">Integrasi Kurir Pickup</h2>
            {[
              { key: 'jne', name: 'JNE Express (Reguler & YES)' },
              { key: 'jnt', name: 'J&T Express (Auto-Resi)' },
              { key: 'sicepat', name: 'SiCepat Ekspres (BEST & Reg)' },
              { key: 'anteraja', name: 'Anteraja Same Day / Reguler' },
            ].map((c) => (
              <label
                key={c.key}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs cursor-pointer"
              >
                <span className="font-bold text-[#141413]">{c.name}</span>
                <input
                  type="checkbox"
                  checked={couriers[c.key]}
                  onChange={() =>
                    setCouriers((prev) => ({ ...prev, [c.key]: !prev[c.key] }))
                  }
                  className="accent-[#F6671E]"
                />
              </label>
            ))}
          </div>

          {/* Notification Preferences Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-3">
            <h2 className="text-base font-extrabold text-[#141413]">Notifikasi Operasional</h2>
            {[
              { key: 'orderReceived', label: 'Pesanan baru masuk dari marketplace' },
              { key: 'lowStockAlert', label: 'Peringatan stok produk di bawah 10 pcs' },
              { key: 'tokenExpiry', label: 'Peringatan masa aktif token OAuth H-7' },
              { key: 'weeklyDigest', label: 'Rekap laporan laba bersih mingguan via email' },
            ].map((n) => (
              <label
                key={n.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs cursor-pointer"
              >
                <span className="font-semibold text-[#141413]">{n.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))
                  }
                  className="accent-[#F6671E]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
