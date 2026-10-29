import React, { useMemo, useState } from 'react'

// ============================================================================
// Enterprise 20-Module RBAC Catalog Across 6 Operational Domains + Extensible
// ============================================================================

const BASE_RBAC_PERMISSION_CATALOG = [
  // 1. Katalog & Inventori Gudang (4 Modul)
  {
    id: 'lihat_produk',
    label: 'Lihat Katalog & Detail SKU',
    category: 'Katalog & Inventori',
    description: 'Melihat daftar produk, varian harga, dan rincian stok lintas gudang.',
  },
  {
    id: 'edit_produk',
    label: 'Tambah, Edit & Duplikasi Produk',
    category: 'Katalog & Inventori',
    description: 'Membuat SKU master baru, mengubah harga dasar, dan mengunggah foto .webp.',
  },
  {
    id: 'hapus_produk',
    label: 'Hapus SKU & Eksekusi Massal Katalog',
    category: 'Katalog & Inventori',
    description: 'Menghapus produk dari katalog dan menjalankan bulk action arsip SKU.',
  },
  {
    id: 'kelola_stok',
    label: 'Penyesuaian Stok & Rekonsiliasi Gudang',
    category: 'Katalog & Inventori',
    description: 'Menambah/mengurangi stok fisik gudang dan menyamakan selisih stok channel.',
  },

  // 2. Operasional Pesanan & Pengiriman (4 Modul)
  {
    id: 'lihat_order',
    label: 'Lihat Daftar Pesanan & Pembeli',
    category: 'Operasional Order',
    description: 'Mengakses antrean pesanan masuk, rincian alamat, dan kontak pelanggan.',
  },
  {
    id: 'proses_order',
    label: 'Input Resi & Cetak Slip Label Thermal',
    category: 'Operasional Order',
    description: 'Memilih ekspedisi, men-generate nomor resi, dan mencetak label pengiriman.',
  },
  {
    id: 'buat_order_manual',
    label: 'Buat Pesanan Manual / Kasir POS',
    category: 'Operasional Order',
    description: 'Menginput transaksi manual ke database dan memotong stok 3 toko otomatis.',
  },
  {
    id: 'batal_refund_order',
    label: 'Batalkan Pesanan, Retur & Restorasi Stok',
    category: 'Operasional Order',
    description: 'Membatalkan transaksi bermasalah dan mengembalikan stok ke gudang master.',
  },

  // 3. Integrasi Marketplace & Webhook (3 Modul)
  {
    id: 'kelola_marketplace',
    label: 'Hubungkan & Putuskan OAuth 2.0 Toko',
    category: 'Integrasi Marketplace',
    description: 'Mengelola otorisasi token AES-256 Shopee, Tokopedia, dan TikTok Shop.',
  },
  {
    id: 'konfigurasi_markup_sync',
    label: 'Atur Markup Harga & Interval Auto-Sync',
    category: 'Integrasi Marketplace',
    description: 'Mengubah persentase markup harga per platform dan jadwal sinkronisasi.',
  },
  {
    id: 'simulasi_audit_webhook',
    label: 'Uji Webhook & Resolusi Konflik Stok',
    category: 'Integrasi Marketplace',
    description: 'Menjalankan simulator webhook real-time dan memaksa sinkronisasi penuh.',
  },

  // 4. Keuangan, Pajak & Analitik (3 Modul)
  {
    id: 'lihat_laporan',
    label: 'Lihat Analitik Omzet & Performa SKU',
    category: 'Keuangan & Analitik',
    description: 'Mengakses grafik pendapatan, kontribusi channel, dan peringkat pelanggan.',
  },
  {
    id: 'atur_parameter_laba',
    label: 'Ubah Rasio Komisi, HPP & Tarif Pajak',
    category: 'Keuangan & Analitik',
    description: 'Mengonfigurasi persentase potongan marketplace, HPP gudang, dan PPh UMKM.',
  },
  {
    id: 'ekspor_jadwal_laporan',
    label: 'Ekspor CSV/PDF & Jadwal Email Laporan',
    category: 'Keuangan & Analitik',
    description: 'Mengunduh berkas laporan keuangan dan mengatur pengiriman email berkala.',
  },

  // 5. Organisasi Tim & Keamanan IAM (3 Modul)
  {
    id: 'kelola_tim',
    label: 'Undang Staf & Ubah Matriks Izin RBAC',
    category: 'Tim & Keamanan IAM',
    description: 'Menambahkan personel baru, mengatur departemen, dan memodifikasi izin.',
  },
  {
    id: 'kontrol_sesi_2fa',
    label: 'Putuskan Sesi Perangkat (Kick) & 2FA',
    category: 'Tim & Keamanan IAM',
    description: 'Menghentikan paksa sesi login mencurigakan dan mewajibkan verifikasi 2FA.',
  },
  {
    id: 'transfer_kepemilikan',
    label: 'Transfer Otoritas Owner Utama Toko',
    category: 'Tim & Keamanan IAM',
    description: 'Memindahkan hak kepemilikan tertinggi toko kepada staf eksekutif lain.',
  },

  // 6. Pengaturan Toko & Billing Langganan (3 Modul)
  {
    id: 'manage_settings',
    label: 'Ubah Profil Toko & Konfigurasi Gudang',
    category: 'Pengaturan & Billing',
    description: 'Mengubah identitas toko utama, preferensi operasional, dan alamat gudang.',
  },
  {
    id: 'kelola_langganan',
    label: 'Upgrade Paket SaaS & Metode Pembayaran',
    category: 'Pengaturan & Billing',
    description: 'Mengelola paket langganan Free, Starter, Business, atau Enterprise.',
  },
  {
    id: 'unduh_invoice_billing',
    label: 'Akses Riwayat Tagihan & Faktur SaaS',
    category: 'Pengaturan & Billing',
    description: 'Melihat riwayat pembayaran langganan dan mengunduh invoice resmi.',
  },
]

const ROLE_PRESETS = [
  {
    role: 'Staff Admin Order',
    department: 'Operasional & Order',
    permissions: [
      'lihat_produk',
      'lihat_order',
      'proses_order',
      'buat_order_manual',
      'batal_refund_order',
    ],
  },
  {
    role: 'Staff Gudang & Stok',
    department: 'Gudang & Logistik',
    permissions: [
      'lihat_produk',
      'edit_produk',
      'kelola_stok',
      'lihat_order',
      'proses_order',
    ],
  },
  {
    role: 'Staff Finance & Laporan',
    department: 'Keuangan & Akuntansi',
    permissions: [
      'lihat_order',
      'lihat_laporan',
      'atur_parameter_laba',
      'ekspor_jadwal_laporan',
      'unduh_invoice_billing',
    ],
  },
  {
    role: 'Spesialis Integrasi Marketplace',
    department: 'Manajemen & Integrasi',
    permissions: [
      'lihat_produk',
      'edit_produk',
      'kelola_stok',
      'kelola_marketplace',
      'konfigurasi_markup_sync',
      'simulasi_audit_webhook',
    ],
  },
  {
    role: 'Supervisor Operasional (Full Staff)',
    department: 'Manajemen & Integrasi',
    permissions: [
      'lihat_produk',
      'edit_produk',
      'hapus_produk',
      'kelola_stok',
      'lihat_order',
      'proses_order',
      'buat_order_manual',
      'batal_refund_order',
      'kelola_marketplace',
      'konfigurasi_markup_sync',
      'simulasi_audit_webhook',
      'lihat_laporan',
      'ekspor_jadwal_laporan',
      'kelola_tim',
    ],
  },
]

const AVAILABLE_CHANNELS = ['Shopee', 'Tokopedia', 'TikTok Shop']

function parsePermissions(raw = '') {
  return String(raw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseChannels(raw = '') {
  const list = String(raw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return list.length > 0 ? list : AVAILABLE_CHANNELS
}

function getInitials(name = 'ST') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'ST'
  )
}

function slugifyPermissionId(label = '') {
  return String(label)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function humanizePermId(permId = '') {
  return String(permId)
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getStatusBadge(status = 'active') {
  const normalized = String(status).toLowerCase()
  if (normalized === 'active') {
    return {
      label: 'Aktif Terverifikasi',
      bg: 'bg-[#E6F6EC]',
      text: 'text-[#0F5132]',
      border: 'border-[#A3E2B8]',
      dot: 'bg-[#0F5132]',
    }
  }
  if (normalized === 'pending') {
    return {
      label: 'Menunggu Konfirmasi',
      bg: 'bg-[#FFDECE]',
      text: 'text-[#9A3408]',
      border: 'border-[#F9B895]',
      dot: 'bg-[#F6671E]',
    }
  }
  return {
    label: 'Akses Dibekukan',
    bg: 'bg-[#FDE8E8]',
    text: 'text-[#9B1C1C]',
    border: 'border-[#F8B4B4]',
    dot: 'bg-[#9B1C1C]',
  }
}

function formatAuditTime(isoString) {
  if (!isoString) return 'Baru saja'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Baru saja'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================================
// Main Component: SellerTeamPage (#workspace/team)
// ============================================================================

export function SellerTeamPage({
  team = [],
  syncLogs = [],
  store = {},
  onInviteMember,
  onUpdatePermissions,
  onTeamSessionAction,
  onTransferOwnership,
  onDeleteMember,
}) {
  // Navigation & Filtering State
  const [activeViewTab, setActiveViewTab] = useState('directory') // 'directory' | 'matrix' | 'security'
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState('ALL')
  const [modalCategoryFilter, setModalCategoryFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Custom Extensible Permissions State
  const [customPermissions, setCustomPermissions] = useState([])
  const [newCustomPermLabel, setNewCustomPermLabel] = useState('')
  const [newCustomPermCategory, setNewCustomPermCategory] = useState('Izin Kustom Toko')

  // Pop-Up Modals State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [targetOwnerId, setTargetOwnerId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Staff Admin Order',
    department: 'Operasional & Order',
    permissions: [
      'lihat_produk',
      'lihat_order',
      'proses_order',
      'buat_order_manual',
      'batal_refund_order',
    ],
    assigned_channels: ['Shopee', 'Tokopedia', 'TikTok Shop'],
    two_factor_enabled: true,
    status: 'active',
  })

  // Dynamic Catalog: Merges 20 Base Enterprise Permissions + Any Custom Permissions in DB or Session
  const permissionCatalog = useMemo(() => {
    const map = new Map()
    BASE_RBAC_PERMISSION_CATALOG.forEach((p) => map.set(p.id, p))
    customPermissions.forEach((p) => map.set(p.id, p))

    // Also auto-discover any custom permission IDs already stored in PostgreSQL `team_members`
    team.forEach((member) => {
      parsePermissions(member.permissions).forEach((permId) => {
        if (!map.has(permId)) {
          map.set(permId, {
            id: permId,
            label: humanizePermId(permId),
            category: 'Izin Kustom Toko',
            description: `Hak akses khusus modul ${humanizePermId(permId)} yang tersimpan di database.`,
          })
        }
      })
    })

    return Array.from(map.values())
  }, [team, customPermissions])

  const permissionCategories = useMemo(() => {
    const set = new Set(permissionCatalog.map((p) => p.category))
    return ['ALL', ...Array.from(set)]
  }, [permissionCatalog])

  const filteredModalPermissions = useMemo(() => {
    if (modalCategoryFilter === 'ALL') return permissionCatalog
    return permissionCatalog.filter((p) => p.category === modalCategoryFilter)
  }, [permissionCatalog, modalCategoryFilter])

  const filteredMatrixPermissions = useMemo(() => {
    if (matrixCategoryFilter === 'ALL') return permissionCatalog
    return permissionCatalog.filter((p) => p.category === matrixCategoryFilter)
  }, [permissionCatalog, matrixCategoryFilter])

  // KPI Metrics Computed 100% from PostgreSQL `team_members`
  const metrics = useMemo(() => {
    const totalMembers = team.length
    const activeCount = team.filter((m) => (m.status || 'active') === 'active').length
    const pendingCount = team.filter((m) => m.status === 'pending').length
    const suspendedCount = team.filter((m) => m.status === 'suspended').length
    const twoFactorCount = team.filter((m) => m.two_factor_enabled !== false).length
    const twoFactorPct = totalMembers > 0 ? Math.round((twoFactorCount / totalMembers) * 100) : 0

    const totalPermGrants = team.reduce(
      (sum, m) => sum + parsePermissions(m.permissions).length,
      0
    )
    const avgPerms = totalMembers > 0 ? (totalPermGrants / totalMembers).toFixed(1) : '0.0'

    const totalActions = team.reduce((sum, m) => sum + Number(m.actions_count || 0), 0)

    return {
      totalMembers,
      activeCount,
      pendingCount,
      suspendedCount,
      twoFactorCount,
      twoFactorPct,
      avgPerms,
      totalPermGrants,
      totalActions,
    }
  }, [team])

  const departments = useMemo(() => {
    const set = new Set(team.map((m) => m.department || 'Operasional & Order'))
    return ['ALL', ...Array.from(set)]
  }, [team])

  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const mStatus = (member.status || 'active').toLowerCase()
      if (statusFilter !== 'ALL' && mStatus !== statusFilter.toLowerCase()) {
        return false
      }
      const mDept = member.department || 'Operasional & Order'
      if (departmentFilter !== 'ALL' && mDept !== departmentFilter) {
        return false
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const haystack = [
          member.full_name,
          member.email,
          member.role,
          member.department,
          member.phone,
          member.session_ip,
          member.session_device,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [team, statusFilter, departmentFilter, searchQuery])

  const nonOwnerMembers = useMemo(
    () => team.filter((m) => m.role !== 'Owner Toko'),
    [team]
  )

  // Handlers
  function handleApplyRolePreset(selectedRoleName) {
    const preset = ROLE_PRESETS.find((r) => r.role === selectedRoleName)
    if (preset) {
      setInviteForm((prev) => ({
        ...prev,
        role: preset.role,
        department: preset.department,
        permissions: [...preset.permissions],
      }))
    } else {
      setInviteForm((prev) => ({ ...prev, role: selectedRoleName }))
    }
  }

  function handleAddCustomPermission(targetMode) {
    const label = newCustomPermLabel.trim()
    if (!label) return
    const id = slugifyPermissionId(label)
    if (!id) return

    const newEntry = {
      id,
      label,
      category: newCustomPermCategory || 'Izin Kustom Toko',
      description: `Izin kustom untuk otoritas ${label}.`,
    }

    setCustomPermissions((prev) => [
      ...prev.filter((item) => item.id !== id),
      newEntry,
    ])

    if (targetMode === 'invite') {
      setInviteForm((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(id)
          ? prev.permissions
          : [...prev.permissions, id],
      }))
    } else if (targetMode === 'edit' && editingMember) {
      setEditingMember((prev) => ({
        ...prev,
        parsedPermissions: prev.parsedPermissions.includes(id)
          ? prev.parsedPermissions
          : [...prev.parsedPermissions, id],
      }))
    }

    setNewCustomPermLabel('')
  }

  function toggleInvitePermission(permId) {
    setInviteForm((prev) => {
      const exists = prev.permissions.includes(permId)
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      }
    })
  }

  function toggleCategoryPermissionsInInvite(categoryName) {
    const targetIds = permissionCatalog
      .filter((p) => categoryName === 'ALL' || p.category === categoryName)
      .map((p) => p.id)

    setInviteForm((prev) => {
      const allSelected = targetIds.every((id) => prev.permissions.includes(id))
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((id) => !targetIds.includes(id)),
        }
      }
      const merged = new Set([...prev.permissions, ...targetIds])
      return {
        ...prev,
        permissions: Array.from(merged),
      }
    })
  }

  function toggleInviteChannel(channelName) {
    setInviteForm((prev) => {
      const exists = prev.assigned_channels.includes(channelName)
      const next = exists
        ? prev.assigned_channels.filter((c) => c !== channelName)
        : [...prev.assigned_channels, channelName]
      return {
        ...prev,
        assigned_channels: next.length > 0 ? next : [channelName],
      }
    })
  }

  async function handleInviteSubmit(e) {
    e.preventDefault()
    if (!inviteForm.full_name.trim() || !inviteForm.email.trim()) return
    setIsSubmitting(true)
    try {
      await onInviteMember({
        full_name: inviteForm.full_name.trim(),
        email: inviteForm.email.trim(),
        phone: inviteForm.phone.trim() || '0812-8800-1122',
        department: inviteForm.department,
        role: inviteForm.role,
        permissions: inviteForm.permissions.join(','),
        assigned_channels: inviteForm.assigned_channels.join(','),
        two_factor_enabled: inviteForm.two_factor_enabled,
        status: inviteForm.status,
      })
      setInviteForm({
        full_name: '',
        email: '',
        phone: '',
        role: 'Staff Admin Order',
        department: 'Operasional & Order',
        permissions: [
          'lihat_produk',
          'lihat_order',
          'proses_order',
          'buat_order_manual',
          'batal_refund_order',
        ],
        assigned_channels: ['Shopee', 'Tokopedia', 'TikTok Shop'],
        two_factor_enabled: true,
        status: 'active',
      })
      setIsInviteModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditModal(member) {
    setModalCategoryFilter('ALL')
    setEditingMember({
      ...member,
      parsedPermissions: parsePermissions(member.permissions),
      parsedChannels: parseChannels(member.assigned_channels),
      department: member.department || 'Operasional & Order',
      phone: member.phone || '0812-8000-0000',
      two_factor_enabled: member.two_factor_enabled !== false,
      status: member.status || 'active',
    })
  }

  async function handleSaveMemberEdit(e) {
    e.preventDefault()
    if (!editingMember) return
    setIsSubmitting(true)
    try {
      await onUpdatePermissions(editingMember.id, {
        full_name: editingMember.full_name,
        email: editingMember.email,
        phone: editingMember.phone,
        department: editingMember.department,
        role: editingMember.role,
        permissions: editingMember.parsedPermissions.join(','),
        assigned_channels: editingMember.parsedChannels.join(','),
        two_factor_enabled: editingMember.two_factor_enabled,
        status: editingMember.status,
      })
      setEditingMember(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleQuickToggleMatrixCell(member, permId) {
    if (member.role === 'Owner Toko') return
    const current = parsePermissions(member.permissions)
    const exists = current.includes(permId)
    const next = exists ? current.filter((p) => p !== permId) : [...current, permId]
    await onUpdatePermissions(member.id, {
      permissions: next.join(','),
      role: member.role,
    })
  }

  async function handleTransferSubmit(e) {
    e.preventDefault()
    if (!targetOwnerId || !onTransferOwnership) return
    setIsSubmitting(true)
    try {
      await onTransferOwnership(Number(targetOwnerId))
      setIsTransferModalOpen(false)
      setTargetOwnerId('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleExportTeamCSV() {
    const rows = [
      [
        'ID',
        'Nama Lengkap',
        'Email',
        'Telepon',
        'Departemen',
        'Peran RBAC',
        'Status',
        '2FA',
        'Cakupan Channel',
        'Jumlah Izin RBAC',
        'Daftar Izin RBAC',
        'Perangkat Sesi Terakhir',
        'Alamat IP',
      ],
      ...team.map((m) => [
        m.id,
        `"${m.full_name}"`,
        m.email,
        `"${m.phone || '-'}"`,
        `"${m.department || 'Operasional'}"`,
        `"${m.role}"`,
        m.status || 'active',
        m.two_factor_enabled !== false ? 'Aktif' : 'Nonaktif',
        `"${m.assigned_channels || 'Shopee,Tokopedia,TikTok Shop'}"`,
        parsePermissions(m.permissions).length,
        `"${m.permissions}"`,
        `"${m.session_device || '-'}"`,
        m.session_ip || '-',
      ]),
    ]
    const csvContent = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'direktori-tim-rbac-synccart.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* =====================================================================
          1. TOP STARTUP IAM HEADER & PRIMARY CTAS
         ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[11px] font-extrabold uppercase tracking-wider">
              Enterprise IAM & {permissionCatalog.length} Modul RBAC
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-bold">
              6 Divisi Operasional + Izin Kustom Dinamis
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#141413] tracking-tight">
            Manajemen Organisasi Tim, Matriks Izin & Keamanan Sesi
          </h1>
          <p className="text-xs text-[#52524E]">
            Atur delegasi wewenang staf lintas {permissionCatalog.length} kapabilitas sistem (atau
            buat izin kustom baru), batasi akses channel marketplace, dan pantau sesi perangkat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportTeamCSV}
            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/50 border border-[#ECEAE4] text-[#141413] text-xs font-bold transition-colors cursor-pointer"
          >
            Export CSV Tim
          </button>

          {nonOwnerMembers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setTargetOwnerId(String(nonOwnerMembers[0]?.id || ''))
                setIsTransferModalOpen(true)
              }}
              className="min-h-[38px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/50 border border-[#ECEAE4] text-[#9A3408] text-xs font-extrabold transition-colors cursor-pointer"
            >
              Transfer Kepemilikan
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setModalCategoryFilter('ALL')
              setIsInviteModalOpen(true)
            }}
            className="min-h-[38px] px-4 py-2 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-[#141413] text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
          >
            + Undang Anggota Tim Baru
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. 4 RENTFLOW IAM KPI CARDS WITH VISUAL MINI-CHARTS
         ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Personnel */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Total Personel Terdaftar</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
              {metrics.activeCount} Aktif
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413]">
                {metrics.totalMembers} Staf
              </p>
              <span className="text-[11px] text-[#52524E]">
                {metrics.pendingCount} pending • {metrics.suspendedCount} dibekukan
              </span>
            </div>
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[70, 95, 65, 85, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#FFDECE] flex flex-col justify-end overflow-hidden"
                  style={{ height: '34px' }}
                >
                  <div
                    className="w-full rounded-full bg-[#F6671E]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: 2FA & Session Security */}
        <div className="p-5 rounded-2xl bg-[#FFDECE] border border-[#F6671E] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#9A3408]">Proteksi Sesi & 2FA</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#141413] text-[10px] font-extrabold">
              {metrics.twoFactorCount} / {metrics.totalMembers} Akun
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413]">
                {metrics.twoFactorPct}%
              </p>
              <span className="text-[11px] font-bold text-[#9A3408]">
                Verifikasi 2 langkah aktif
              </span>
            </div>
            <svg viewBox="0 0 80 34" className="w-18 h-8 shrink-0" aria-hidden="true">
              <path
                d="M2 26 C18 22, 24 14, 38 15 C52 16, 58 6, 78 5"
                fill="none"
                stroke="#9A3408"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Permission Granularity */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Katalog Kapabilitas RBAC</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#9A3408] text-[10px] font-extrabold">
              {permissionCatalog.length} Modul Aktif
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413]">
                {metrics.avgPerms} Izin
              </p>
              <span className="text-[11px] text-[#52524E]">
                Rata-rata dari {permissionCatalog.length} modul per staf
              </span>
            </div>
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[100, 38, 38, 25, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col justify-end overflow-hidden"
                  style={{ height: '34px' }}
                >
                  <div
                    className="w-full rounded-full bg-[#141413]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Operational Activity */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Jejak Audit & Aktivitas</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
              Tercatat Otomatis
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413]">
                {metrics.totalActions} Aksi
              </p>
              <span className="text-[11px] text-[#52524E]">
                Eksekusi produk, resi, & konfigurasi
              </span>
            </div>
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[48, 66, 82, 74, 94].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-[#E6F6EC] flex flex-col justify-end overflow-hidden"
                  style={{ height: '34px' }}
                >
                  <div
                    className="w-full rounded-full bg-[#0F5132]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. WORKSPACE NAVIGATION TABS & MULTI-FILTER BAR
         ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#ECEAE4] pb-3.5">
          {/* View Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'directory', label: `Direktori Anggota & Sesi (${team.length})` },
              {
                id: 'matrix',
                label: `Matriks Izin RBAC Interaktif (${permissionCatalog.length} Modul)`,
              },
              { id: 'security', label: 'Log Audit & Keamanan Perangkat' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveViewTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  activeViewTab === tab.id
                    ? 'bg-[#F6671E] text-[#141413]'
                    : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Department Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, IP, atau peran..."
              aria-label="Cari anggota tim"
              className="w-full sm:w-60 px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413]"
            />

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filter departemen"
              className="px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'Semua Departemen' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        {activeViewTab === 'directory' && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: `Semua (${team.length})` },
                { id: 'active', label: `Aktif (${metrics.activeCount})` },
                { id: 'pending', label: `Undangan Pending (${metrics.pendingCount})` },
                { id: 'suspended', label: `Dibekukan (${metrics.suspendedCount})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === pill.id
                      ? 'bg-[#141413] text-[#FFFFFF]'
                      : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#52524E]">
              Menampilkan <strong className="text-[#141413]">{filteredTeam.length}</strong> dari{' '}
              {team.length} anggota tim
            </span>
          </div>
        )}

        {/* ===================================================================
            VIEW TAB 1: ENTERPRISE TEAM DIRECTORY TABLE
           =================================================================== */}
        {activeViewTab === 'directory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[#52524E]">
                  <th className="py-3 px-2.5">Personel & Departemen</th>
                  <th className="py-3 px-2.5">Peran & Cakupan Marketplace</th>
                  <th className="py-3 px-2.5">Otoritas Modul RBAC</th>
                  <th className="py-3 px-2.5">Perangkat, IP & Keamanan</th>
                  <th className="py-3 px-2.5">Status Akun</th>
                  <th className="py-3 px-2.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {filteredTeam.map((member) => {
                  const perms = parsePermissions(member.permissions)
                  const channels = parseChannels(member.assigned_channels)
                  const badge = getStatusBadge(member.status)
                  const isOwner = member.role === 'Owner Toko'

                  return (
                    <tr key={member.id} className="hover:bg-[#FAF9F6]/80 align-top">
                      {/* Column 1: Profile & Department */}
                      <td className="py-4 px-2.5 min-w-[220px]">
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono-tabular text-xs font-extrabold shrink-0 ${
                              isOwner
                                ? 'bg-[#F6671E] text-[#141413]'
                                : 'bg-[#FFDECE] text-[#9A3408] border border-[#F9B895]'
                            }`}
                          >
                            {getInitials(member.full_name)}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[#141413] text-xs">
                                {member.full_name}
                              </span>
                              {isOwner && (
                                <span className="px-2 py-0.5 rounded-full bg-[#141413] text-[#FFFFFF] text-[10px] font-extrabold uppercase">
                                  Owner
                                </span>
                              )}
                            </div>
                            <p className="font-mono-tabular text-[11px] text-[#52524E]">
                              {member.email}
                            </p>
                            <p className="text-[11px] text-[#52524E]">
                              {member.department || 'Operasional & Order'} •{' '}
                              <span className="font-mono-tabular">{member.phone || '-'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Role & Assigned Channels */}
                      <td className="py-4 px-2.5 min-w-[180px]">
                        <span className="font-extrabold text-[#9A3408] block">{member.role}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {channels.map((ch) => (
                            <span
                              key={ch}
                              className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAE4] text-[10px] font-bold text-[#141413]"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Column 3: Permissions List */}
                      <td className="py-4 px-2.5 min-w-[240px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono-tabular text-[11px] font-extrabold text-[#141413]">
                            {perms.length} / {permissionCatalog.length} Modul Diizinkan
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {perms.slice(0, 4).map((permId) => {
                            const meta = permissionCatalog.find((p) => p.id === permId)
                            return (
                              <span
                                key={permId}
                                className="px-2 py-0.5 rounded-full bg-[#FFF0E6] border border-[#F9B895] text-[#9A3408] text-[10px] font-bold"
                              >
                                {meta ? meta.label : humanizePermId(permId)}
                              </span>
                            )
                          })}
                          {perms.length > 4 && (
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              className="px-2 py-0.5 rounded-full bg-[#FAF9F6] hover:bg-[#FFDECE] border border-[#ECEAE4] text-[#141413] text-[10px] font-extrabold cursor-pointer"
                            >
                              +{perms.length - 4} modul lainnya
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Device, IP & 2FA */}
                      <td className="py-4 px-2.5 min-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              member.two_factor_enabled !== false
                                ? 'bg-[#E6F6EC] text-[#0F5132]'
                                : 'bg-[#FFF0E6] text-[#9A3408]'
                            }`}
                          >
                            {member.two_factor_enabled !== false ? '2FA Aktif' : '2FA Nonaktif'}
                          </span>
                          <span className="font-mono-tabular text-[10px] text-[#52524E]">
                            IP {member.session_ip || '103.144.22.18'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#141413] font-medium truncate max-w-[210px]">
                          {member.session_device || 'Web Session (Indonesia)'}
                        </p>
                        <p className="text-[10px] text-[#52524E] mt-0.5">
                          Aktivitas: {member.last_active} ({member.actions_count || 1} aksi)
                        </p>
                      </td>

                      {/* Column 5: Account Status */}
                      <td className="py-4 px-2.5 min-w-[140px]">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                        <span className="block text-[10px] text-[#52524E] mt-1">
                          {member.invite_expires_at || 'Terverifikasi'}
                        </span>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-4 px-2.5 text-right min-w-[190px]">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-[11px] font-extrabold transition-colors cursor-pointer"
                          >
                            Atur RBAC
                          </button>

                          {!isOwner && (
                            <>
                              {member.status === 'pending' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTeamSessionAction &&
                                    onTeamSessionAction(member.id, 'activate')
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-[#E6F6EC] text-[#0F5132] text-[11px] font-extrabold cursor-pointer"
                                >
                                  Verifikasi
                                </button>
                              ) : member.status === 'suspended' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTeamSessionAction &&
                                    onTeamSessionAction(member.id, 'activate')
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-[#E6F6EC] text-[#0F5132] text-[11px] font-extrabold cursor-pointer"
                                >
                                  Pulihkan
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onTeamSessionAction &&
                                    onTeamSessionAction(member.id, 'suspend')
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-[#52524E] hover:text-[#141413] text-[11px] font-bold cursor-pointer"
                                >
                                  Bekukan
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteMember(member.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#FDE8E8] text-[#9B1C1C] text-[11px] font-bold cursor-pointer"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ===================================================================
            VIEW TAB 2: INTERACTIVE RBAC PERMISSION MATRIX GRID (20+ MODULES)
           =================================================================== */}
        {activeViewTab === 'matrix' && (
          <div className="space-y-3">
            {/* Domain Filter Bar for Matrix */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-[#52524E] mr-1">
                  Filter Divisi Modul:
                </span>
                {permissionCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatrixCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                      matrixCategoryFilter === cat
                        ? 'bg-[#F6671E] text-[#141413]'
                        : 'bg-[#FFFFFF] text-[#52524E] border border-[#ECEAE4]'
                    }`}
                  >
                    {cat === 'ALL' ? `Semua Divisi (${permissionCatalog.length})` : cat}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-[#9A3408]">
                Klik sel matriks untuk mengubah otoritas secara langsung di sistem
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#ECEAE4] text-[#52524E]">
                    <th className="py-3 px-3 min-w-[250px]">
                      Modul & Kapabilitas Sistem ({filteredMatrixPermissions.length})
                    </th>
                    {team.map((member) => (
                      <th key={member.id} className="py-3 px-3 text-center min-w-[130px]">
                        <span className="font-extrabold text-[#141413] block">
                          {member.full_name}
                        </span>
                        <span className="text-[10px] text-[#9A3408] font-bold block">
                          {member.role}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAE4]">
                  {filteredMatrixPermissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-[#FAF9F6]/70">
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-extrabold uppercase text-[#9A3408] block">
                          {perm.category}
                        </span>
                        <span className="font-extrabold text-[#141413] block">{perm.label}</span>
                        <span className="text-[11px] text-[#52524E]">{perm.description}</span>
                      </td>

                      {team.map((member) => {
                        const memberPerms = parsePermissions(member.permissions)
                        const hasPerm = memberPerms.includes(perm.id)
                        const isOwner = member.role === 'Owner Toko'

                        return (
                          <td key={`${member.id}-${perm.id}`} className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={isOwner}
                              onClick={() => handleQuickToggleMatrixCell(member, perm.id)}
                              aria-label={`${perm.label} untuk ${member.full_name}`}
                              className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all inline-flex items-center justify-center ${
                                isOwner
                                  ? 'bg-[#141413] text-[#FFFFFF] cursor-not-allowed opacity-90'
                                  : hasPerm
                                  ? 'bg-[#F6671E] text-[#141413] cursor-pointer shadow-2xs'
                                  : 'bg-[#FAF9F6] border border-[#ECEAE4] text-[#52524E] hover:border-[#F6671E] cursor-pointer'
                              }`}
                            >
                              {hasPerm || isOwner ? '✓' : '·'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW TAB 3: DEVICE SESSION SECURITY & AUDIT LOGS
           =================================================================== */}
        {activeViewTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 6 Cols: Active Sessions & Kick Control */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-sm font-extrabold text-[#141413]">
                Sesi Login Perangkat & Proteksi 2FA
              </h3>
              <div className="space-y-2.5">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#141413]">
                          {member.full_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-[10px] font-bold text-[#9A3408]">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#141413] font-semibold">
                        {member.session_device || 'Web Browser Session'}
                      </p>
                      <p className="font-mono-tabular text-[11px] text-[#52524E]">
                        IP: {member.session_ip || '103.144.22.10'} • Status: {member.last_active}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onTeamSessionAction && onTeamSessionAction(member.id, 'toggle_2fa')
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer ${
                          member.two_factor_enabled !== false
                            ? 'bg-[#E6F6EC] text-[#0F5132]'
                            : 'bg-[#FFF0E6] text-[#9A3408]'
                        }`}
                      >
                        {member.two_factor_enabled !== false ? '2FA: Aktif' : 'Aktifkan 2FA'}
                      </button>

                      {member.role !== 'Owner Toko' && (
                        <button
                          type="button"
                          onClick={() =>
                            onTeamSessionAction &&
                            onTeamSessionAction(member.id, 'revoke_session')
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-[#FDE8E8] text-[#9B1C1C] text-[11px] font-extrabold cursor-pointer"
                        >
                          Putuskan Sesi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 6 Cols: Live Audit Trail */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-sm font-extrabold text-[#141413]">
                Jejak Audit Aktivitas Tim & Sistem
              </h3>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {syncLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] font-extrabold uppercase">
                        {log.platform} • {log.action_type}
                      </span>
                      <span className="font-mono-tabular text-[#52524E]">
                        {formatAuditTime(log.created_at)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#141413]">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          POP-UP MODAL 1: UNDANG ANGGOTA TIM BARU & KONFIGURASI 20+ MODUL RBAC
         ===================================================================== */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-team-modal-title"
        >
          <div className="w-full max-w-3xl rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden my-8">
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  Onboarding Personel & Delegasi {permissionCatalog.length} Modul RBAC
                </span>
                <h2
                  id="invite-team-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#141413] mt-1"
                >
                  Undang Anggota Tim Baru ke {store.store_name || 'Toko'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="invite-name"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Nama Lengkap Staf
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    required
                    value={inviteForm.full_name}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    placeholder="Contoh: Hendra Wijaya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-email"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Email Kerja
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="hendra@nusantara.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-semibold text-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-phone"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    id="invite-phone"
                    type="text"
                    value={inviteForm.phone}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="0812-8890-1122"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-semibold text-[#141413]"
                  />
                </div>
              </div>

              {/* Preset Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="invite-role"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Template Peran (Role Preset)
                  </label>
                  <select
                    id="invite-role"
                    value={inviteForm.role}
                    onChange={(e) => handleApplyRolePreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    {ROLE_PRESETS.map((preset) => (
                      <option key={preset.role} value={preset.role}>
                        {preset.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="invite-dept"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Departemen Divisi
                  </label>
                  <select
                    id="invite-dept"
                    value={inviteForm.department}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="Operasional & Order">Operasional & Order</option>
                    <option value="Gudang & Logistik">Gudang & Logistik</option>
                    <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                    <option value="Manajemen & Integrasi">Manajemen & Integrasi</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="invite-status"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Mode Aktivasi Akun
                  </label>
                  <select
                    id="invite-status"
                    value={inviteForm.status}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="active">Langsung Aktif Terverifikasi</option>
                    <option value="pending">Kirim Tautan Undangan (Berlaku 7 Hari)</option>
                  </select>
                </div>
              </div>

              {/* Channel Access Scope */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#141413]">
                    Otorisasi Channel Marketplace:
                  </span>
                  {AVAILABLE_CHANNELS.map((ch) => {
                    const checked = inviteForm.assigned_channels.includes(ch)
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleInviteChannel(ch)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                          checked
                            ? 'bg-[#F6671E] text-[#141413]'
                            : 'bg-[#FFFFFF] text-[#52524E] border border-[#ECEAE4]'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}
                        {ch}
                      </button>
                    )
                  })}
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#141413] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inviteForm.two_factor_enabled}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        two_factor_enabled: e.target.checked,
                      }))
                    }
                    className="accent-[#F6671E]"
                  />
                  Wajibkan Proteksi 2FA
                </label>
              </div>

              {/* 20+ Granular Permissions Checkboxes with Domain Filter & Custom Permission Adder */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#141413]">
                    Pilih Hak Akses Modul RBAC ({inviteForm.permissions.length} /{' '}
                    {permissionCatalog.length} terpilih)
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCategoryPermissionsInInvite(modalCategoryFilter)}
                      className="text-[11px] font-extrabold text-[#9A3408] underline cursor-pointer"
                    >
                      {modalCategoryFilter === 'ALL'
                        ? 'Pilih / Lepas Semua Modul'
                        : `Pilih / Lepas Divisi ${modalCategoryFilter}`}
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills inside Modal */}
                <div className="flex flex-wrap gap-1.5">
                  {permissionCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModalCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        modalCategoryFilter === cat
                          ? 'bg-[#141413] text-[#FFFFFF]'
                          : 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
                      }`}
                    >
                      {cat === 'ALL' ? `Semua (${permissionCatalog.length})` : cat}
                    </button>
                  ))}
                </div>

                {/* Scrollable 2-Column Grid of Granular Permissions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredModalPermissions.map((perm) => {
                    const active = inviteForm.permissions.includes(perm.id)
                    return (
                      <label
                        key={perm.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#FFF0E6] border-[#F6671E]'
                            : 'bg-[#FAF9F6] border-[#ECEAE4]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleInvitePermission(perm.id)}
                          className="mt-0.5 accent-[#F6671E]"
                        />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#9A3408] block">
                            {perm.category}
                          </span>
                          <span className="text-xs font-extrabold text-[#141413] block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-[#52524E]">{perm.description}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* Add Custom Permission Bar */}
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={newCustomPermLabel}
                    onChange={(e) => setNewCustomPermLabel(e.target.value)}
                    placeholder="Tambah hak akses kustom baru (mis: Approve Diskon Grosir)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-xs text-[#141413]"
                  />
                  <select
                    value={newCustomPermCategory}
                    onChange={(e) => setNewCustomPermCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="Izin Kustom Toko">Izin Kustom Toko</option>
                    <option value="Katalog & Inventori">Katalog & Inventori</option>
                    <option value="Operasional Order">Operasional Order</option>
                    <option value="Keuangan & Analitik">Keuangan & Analitik</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddCustomPermission('invite')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer shrink-0"
                  >
                    + Tambah Modul
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Aktifkan Anggota Tim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          POP-UP MODAL 2: EDIT HAK AKSES RBAC & PROFIL ANGGOTA TIM
         ===================================================================== */}
      {editingMember && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-rbac-modal-title"
        >
          <div className="w-full max-w-3xl rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden my-8">
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  Pembaruan Hak Akses Modul RBAC ({editingMember.parsedPermissions.length} /{' '}
                  {permissionCatalog.length} Modul)
                </span>
                <h2
                  id="edit-rbac-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#141413] mt-1"
                >
                  Konfigurasi RBAC: {editingMember.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="edit-member-name"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="edit-member-name"
                    type="text"
                    required
                    value={editingMember.full_name}
                    onChange={(e) =>
                      setEditingMember((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-member-role"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Peran (Role)
                  </label>
                  <input
                    id="edit-member-role"
                    type="text"
                    disabled={editingMember.role === 'Owner Toko'}
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-member-dept"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Departemen
                  </label>
                  <select
                    id="edit-member-dept"
                    value={editingMember.department}
                    onChange={(e) =>
                      setEditingMember((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="Operasional & Order">Operasional & Order</option>
                    <option value="Gudang & Logistik">Gudang & Logistik</option>
                    <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                    <option value="Manajemen & Integrasi">Manajemen & Integrasi</option>
                  </select>
                </div>
              </div>

              {/* Channel Scope */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#141413]">Cakupan Channel:</span>
                  {AVAILABLE_CHANNELS.map((ch) => {
                    const checked = editingMember.parsedChannels.includes(ch)
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? editingMember.parsedChannels.filter((c) => c !== ch)
                            : [...editingMember.parsedChannels, ch]
                          setEditingMember((prev) => ({
                            ...prev,
                            parsedChannels: next.length > 0 ? next : [ch],
                          }))
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                          checked
                            ? 'bg-[#F6671E] text-[#141413]'
                            : 'bg-[#FFFFFF] text-[#52524E] border border-[#ECEAE4]'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}
                        {ch}
                      </button>
                    )
                  })}
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#141413] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMember.two_factor_enabled}
                    onChange={(e) =>
                      setEditingMember((prev) => ({
                        ...prev,
                        two_factor_enabled: e.target.checked,
                      }))
                    }
                    className="accent-[#F6671E]"
                  />
                  Proteksi 2FA Aktif
                </label>
              </div>

              {/* Category Filter Pills inside Edit Modal */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {permissionCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModalCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        modalCategoryFilter === cat
                          ? 'bg-[#141413] text-[#FFFFFF]'
                          : 'bg-[#FAF9F6] text-[#52524E] border border-[#ECEAE4]'
                      }`}
                    >
                      {cat === 'ALL' ? `Semua (${permissionCatalog.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredModalPermissions.map((perm) => {
                  const active = editingMember.parsedPermissions.includes(perm.id)
                  const isOwner = editingMember.role === 'Owner Toko'
                  return (
                    <label
                      key={perm.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                        active
                          ? 'bg-[#FFF0E6] border-[#F6671E]'
                          : 'bg-[#FAF9F6] border-[#ECEAE4]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isOwner}
                        checked={active || isOwner}
                        onChange={() => {
                          const next = active
                            ? editingMember.parsedPermissions.filter((p) => p !== perm.id)
                            : [...editingMember.parsedPermissions, perm.id]
                          setEditingMember((prev) => ({ ...prev, parsedPermissions: next }))
                        }}
                        className="mt-0.5 accent-[#F6671E]"
                      />
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-[#9A3408] block">
                          {perm.category}
                        </span>
                        <span className="text-xs font-extrabold text-[#141413] block">
                          {perm.label}
                        </span>
                        <span className="text-[11px] text-[#52524E]">{perm.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Add Custom Permission Bar in Edit Modal */}
              {editingMember.role !== 'Owner Toko' && (
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={newCustomPermLabel}
                    onChange={(e) => setNewCustomPermLabel(e.target.value)}
                    placeholder="Tambah hak akses kustom baru untuk staf ini..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-xs text-[#141413]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomPermission('edit')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer shrink-0"
                  >
                    + Tambah & Berikan Izin
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan RBAC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          POP-UP MODAL 3: TRANSFER KEPEMILIKAN TOKO (PHASE 8 FITUR.MD)
         ===================================================================== */}
      {isTransferModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-owner-modal-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  Otoritas Tertinggi Toko
                </span>
                <h2
                  id="transfer-owner-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#141413] mt-1"
                >
                  Transfer Kepemilikan Utama
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-[#52524E]">
                Anggota tim yang dipilih akan dipromosikan menjadi{' '}
                <strong className="text-[#141413]">Owner Toko</strong> dengan akses penuh (
                {permissionCatalog.length} modul RBAC), sedangkan Owner sebelumnya menjadi{' '}
                <strong className="text-[#141413]">Co-Owner & Manager Operasional</strong>.
              </p>

              <div>
                <label
                  htmlFor="transfer-target-select"
                  className="block text-xs font-extrabold text-[#141413] mb-1"
                >
                  Pilih Penerima Kepemilikan Toko
                </label>
                <select
                  id="transfer-target-select"
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  required
                >
                  {nonOwnerMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.role} • {m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#141413] hover:bg-[#2C2C2A] text-xs font-extrabold text-[#FFFFFF] cursor-pointer"
                >
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Transfer Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
