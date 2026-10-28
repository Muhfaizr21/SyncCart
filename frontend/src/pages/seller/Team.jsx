import React, { useState } from 'react'

const ALL_PERMISSIONS = [
  { id: 'lihat_produk', label: 'Lihat Produk' },
  { id: 'edit_produk', label: 'Edit Produk & Stok' },
  { id: 'lihat_order', label: 'Lihat Pesanan' },
  { id: 'proses_order', label: 'Input Resi & Proses Order' },
  { id: 'lihat_laporan', label: 'Lihat Laporan Keuangan' },
  { id: 'kelola_marketplace', label: 'Kelola Koneksi Marketplace' },
  { id: 'kelola_tim', label: 'Kelola Tim & RBAC' },
]

export function SellerTeamPage({
  team = [],
  onInviteMember,
  onUpdatePermissions,
  onDeleteMember,
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Staff Admin Order')
  const [selectedPerms, setSelectedPerms] = useState([
    'lihat_produk',
    'lihat_order',
    'proses_order',
  ])
  const [editingMember, setEditingMember] = useState(null)

  function togglePerm(permId) {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    )
  }

  async function handleInviteSubmit(e) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return
    await onInviteMember({
      full_name: fullName.trim(),
      email: email.trim(),
      role,
      permissions: selectedPerms.join(','),
    })
    setFullName('')
    setEmail('')
  }

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] shadow-xs">
        <span className="px-2.5 py-1 rounded-full bg-[#FFDECE] text-[#9A3408] text-xs font-extrabold uppercase">
          Phase 8 • Manajemen Tim & Hak Akses RBAC
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#141413] mt-2">
          Delegasi Staf Toko & Matriks Izin Operasional
        </h1>
        <p className="text-xs sm:text-sm text-[#52524E]">
          Undang admin pesanan, staf gudang, atau staf keuangan dengan hak akses spesifik.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Team List */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-4">
          <h2 className="text-base font-extrabold text-[#141413]">
            Daftar Anggota Tim Aktif ({team.length} Staf)
          </h2>

          <div className="space-y-3">
            {team.map((member) => {
              const perms = (member.permissions || '').split(',').filter(Boolean)
              const initials = (member.full_name || 'ST')
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join('')

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E0] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#FFDECE] border border-[#F6671E]/50 flex items-center justify-center font-mono-tabular text-xs font-extrabold text-[#141413]">
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-[#141413]">{member.full_name}</p>
                        <p className="text-xs text-[#52524E]">
                          {member.email} • <strong className="text-[#9A3408]">{member.role}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#52524E]">
                        {member.last_active}
                      </span>
                      {member.role !== 'Owner Toko' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            className="px-2.5 py-1 rounded-lg bg-[#FFDECE] text-[#141413] text-[11px] font-bold cursor-pointer"
                          >
                            Ubah Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMember(member.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#FDE8E8] text-[#9B1C1C] text-[11px] font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#EBE8E0] text-[11px] font-semibold text-[#141413]"
                      >
                        {p.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {editingMember && (
            <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#F6671E] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-[#141413]">
                  Perbarui Hak Akses: {editingMember.full_name}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="text-xs font-bold text-[#9A3408] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const currentList = (editingMember.permissions || '').split(',').filter(Boolean)
                  const active = currentList.includes(perm.id)
                  return (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? currentList.filter((x) => x !== perm.id)
                          : [...currentList, perm.id]
                        setEditingMember({ ...editingMember, permissions: next.join(',') })
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        active
                          ? 'bg-[#F6671E] text-[#141413]'
                          : 'bg-[#FFFFFF] text-[#52524E] border border-[#EBE8E0]'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {perm.label}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await onUpdatePermissions(
                    editingMember.id,
                    editingMember.permissions,
                    editingMember.role
                  )
                  setEditingMember(null)
                }}
                className="px-4 py-2 rounded-xl bg-[#141413] text-[#FFFFFF] text-xs font-bold cursor-pointer"
              >
                Simpan Hak Akses RBAC
              </button>
            </div>
          )}
        </div>

        {/* Right: Invite Member Form */}
        <form
          onSubmit={handleInviteSubmit}
          className="lg:col-span-5 p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE8E0] space-y-4"
        >
          <h2 className="text-base font-extrabold text-[#141413]">Undang Anggota Tim Baru</h2>

          <div className="space-y-1">
            <label htmlFor="team-name" className="block text-xs font-bold text-[#141413]">
              Nama Lengkap Staf
            </label>
            <input
              id="team-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Hendra Pratama"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="team-email" className="block text-xs font-bold text-[#141413]">
              Email Kerja
            </label>
            <input
              id="team-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: hendra@nusantara.id"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="team-role" className="block text-xs font-bold text-[#141413]">
              Peran Staf
            </label>
            <select
              id="team-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs font-bold text-[#141413]"
            >
              <option value="Staff Admin Order">Staff Admin Order</option>
              <option value="Staff Gudang & Stok">Staff Gudang & Stok</option>
              <option value="Staff Finance & Laporan">Staff Finance & Laporan</option>
            </select>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#141413]">Hak Akses RBAC</span>
            <div className="grid grid-cols-1 gap-1.5">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF9F6] border border-[#EBE8E0] text-xs text-[#141413] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    className="accent-[#F6671E]"
                  />
                  <span className="font-semibold">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer"
          >
            Kirim Undangan & Aktifkan RBAC
          </button>
        </form>
      </div>
    </div>
  )
}
