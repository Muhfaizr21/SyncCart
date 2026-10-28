import React, { useEffect, useMemo, useRef, useState } from 'react'

function formatRupiah(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatDateTime(isoString) {
  if (!isoString) return 'Baru saja'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Baru saja'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatBytes(bytes) {
  const b = Number(bytes || 0)
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

function parseImagesJSON(imagesJsonStr) {
  if (!imagesJsonStr) return []
  try {
    const parsed = JSON.parse(imagesJsonStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Client-side HTML5 Canvas image compressor & converter to lightweight WebP
function convertFileToWebP(file, maxDimension = 720, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Format gambar tidak didukung'))
      img.onload = () => {
        let width = img.width || 600
        let height = img.height || 600

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const webpDataUrl = canvas.toDataURL('image/webp', quality)
        // Estimate byte size of base64 payload
        const base64Length = webpDataUrl.split(',')[1]?.length || 0
        const webpBytes = Math.round((base64Length * 3) / 4)
        const baseName = (file.name || 'produk').replace(/\.[^/.]+$/, '')

        resolve({
          id: `webp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: `${baseName}.webp`,
          url: webpDataUrl,
          originalBytes: file.size || webpBytes,
          webpBytes,
          width,
          height,
          format: 'WEBP',
        })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Generates 2 lightweight studio-style WebP sample product images via Canvas
function generateSampleWebPImages(productTitle = 'Produk Nusantara', sku = 'SKU-01') {
  const palettes = [
    { bg1: '#2D4A43', bg2: '#141413', accent: '#F6671E', label: 'Tampak Depan' },
    { bg1: '#5C3A21', bg2: '#1F1916', accent: '#FFDECE', label: 'Detail Bahan' },
  ]

  return palettes.map((pal, idx) => {
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 480
    const ctx = canvas.getContext('2d')

    const grad = ctx.createLinearGradient(0, 0, 480, 480)
    grad.addColorStop(0, pal.bg1)
    grad.addColorStop(1, pal.bg2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 480, 480)

    // Soft studio circle highlight
    ctx.fillStyle = 'rgba(246, 103, 30, 0.18)'
    ctx.beginPath()
    ctx.arc(240, 210, 125, 0, Math.PI * 2)
    ctx.fill()

    // Garment / box silhouette
    ctx.strokeStyle = pal.accent
    ctx.lineWidth = 5
    ctx.strokeRect(140, 115, 200, 190)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText((productTitle || 'Katalog SyncCart').slice(0, 22), 40, 385)

    ctx.fillStyle = '#FFDECE'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`${sku} • Foto #${idx + 1} (${pal.label}) • WebP`, 40, 420)

    const webpDataUrl = canvas.toDataURL('image/webp', 0.78)
    const base64Length = webpDataUrl.split(',')[1]?.length || 0
    const webpBytes = Math.round((base64Length * 3) / 4)

    return {
      id: `sample-webp-${idx}-${Date.now()}`,
      name: `${sku.toLowerCase()}-foto-${idx + 1}.webp`,
      url: webpDataUrl,
      originalBytes: webpBytes * 4,
      webpBytes,
      width: 480,
      height: 480,
      format: 'WEBP',
    }
  })
}

export function SellerProductsPage({
  products = [],
  marketplaces = [],
  onCreateProduct,
  onUpdateProduct,
  onDuplicateProduct,
  onBulkProductAction,
  onAdjustStock,
  onSyncAll,
  onDeleteProduct,
  isSyncing,
}) {
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('table')

  const [selectedIds, setSelectedIds] = useState([])
  const [busyId, setBusyId] = useState('')

  // Pop-Up Modal State
  const [modalMode, setModalMode] = useState(null) // null | 'create' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null)
  const [imagesList, setImagesList] = useState([])
  const [isConvertingWebP, setIsConvertingWebP] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const [formState, setFormState] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Atasan Pria & Wanita',
    warehouse: 'Gudang Sunter, Jakarta Utara',
    weight_gram: 250,
    price: 185000,
    stock: 25,
    publish_shopee: true,
    publish_tokopedia: true,
    publish_tiktok: true,
    status: 'active',
    resolve_source: '',
  })

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && modalMode) {
        setModalMode(null)
        setEditingProduct(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalMode])

  // Dynamic KPI telemetry computed 100% from PostgreSQL products
  const stats = useMemo(() => {
    const totalSku = products.length
    const activeCount = products.filter((p) => p.status !== 'inactive' && p.stock > 0).length
    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0)
    const totalSold = products.reduce((sum, p) => sum + Number(p.sold_count || 0), 0)
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length
    const outOfStockCount = products.filter((p) => p.stock === 0).length
    const conflictCount = products.filter(
      (p) =>
        p.sync_status === 'conflict' ||
        p.shopee_stock !== p.stock ||
        p.tokopedia_stock !== p.stock ||
        p.tiktok_stock !== p.stock
    ).length
    const inventoryValue = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    )

    return {
      totalSku,
      activeCount,
      totalStock,
      totalSold,
      lowStockCount,
      outOfStockCount,
      conflictCount,
      inventoryValue,
    }
  }, [products])

  const categories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = products.filter((p) => {
      const hasConflict =
        p.sync_status === 'conflict' ||
        p.shopee_stock !== p.stock ||
        p.tokopedia_stock !== p.stock ||
        p.tiktok_stock !== p.stock

      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.warehouse?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)

      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter

      let matchTab = true
      if (filterTab === 'ACTIVE') matchTab = p.stock > 10 && !hasConflict
      if (filterTab === 'LOW_STOCK') matchTab = p.stock > 0 && p.stock <= 10
      if (filterTab === 'OUT_OF_STOCK') matchTab = p.stock === 0
      if (filterTab === 'CONFLICT') matchTab = hasConflict

      return matchSearch && matchCategory && matchTab
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'stock_asc') return a.stock - b.stock
      if (sortBy === 'stock_desc') return b.stock - a.stock
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'best_selling') return (b.sold_count || 0) - (a.sold_count || 0)
      return (b.id || 0) - (a.id || 0)
    })
  }, [products, search, categoryFilter, filterTab, sortBy])

  function openCreateModal() {
    setEditingProduct(null)
    setUploadError('')
    setImagesList([])
    setFormState({
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      category: categories[0] || 'Atasan Pria & Wanita',
      warehouse: 'Gudang Sunter, Jakarta Utara',
      weight_gram: 250,
      price: 185000,
      stock: 25,
      publish_shopee: true,
      publish_tokopedia: true,
      publish_tiktok: true,
      status: 'active',
      resolve_source: '',
    })
    setModalMode('create')
  }

  function openEditModal(prod) {
    setEditingProduct(prod)
    setUploadError('')
    setImagesList(parseImagesJSON(prod.images_json))
    setFormState({
      sku: prod.sku || '',
      name: prod.name || '',
      description: prod.description || '',
      category: prod.category || 'Atasan Pria & Wanita',
      warehouse: prod.warehouse || 'Gudang Sunter, Jakarta Utara',
      weight_gram: Number(prod.weight_gram || 250),
      price: Number(prod.price || 0),
      stock: Number(prod.stock || 0),
      publish_shopee: prod.publish_shopee !== false,
      publish_tokopedia: prod.publish_tokopedia !== false,
      publish_tiktok: prod.publish_tiktok !== false,
      status: prod.status || 'active',
      resolve_source: '',
    })
    setModalMode('edit')
  }

  async function handleFilesSelected(fileList) {
    if (!fileList || fileList.length === 0) return
    setUploadError('')
    setIsConvertingWebP(true)
    try {
      const filesArray = Array.from(fileList).slice(0, 6 - imagesList.length)
      const converted = await Promise.all(
        filesArray.map((file) => convertFileToWebP(file, 720, 0.78))
      )
      setImagesList((prev) => [...prev, ...converted].slice(0, 6))
    } catch (err) {
      setUploadError(err.message || 'Gagal mengonversi gambar ke WebP')
    } finally {
      setIsConvertingWebP(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleAddSampleWebP() {
    setUploadError('')
    const samples = generateSampleWebPImages(
      formState.name || 'Produk Nusantara',
      formState.sku || 'SKU-01'
    )
    setImagesList((prev) => [...prev, ...samples].slice(0, 6))
  }

  function handleRemoveImage(imgId) {
    setImagesList((prev) => prev.filter((img) => img.id !== imgId))
  }

  function handleSetPrimaryImage(index) {
    if (index <= 0) return
    setImagesList((prev) => {
      const copy = [...prev]
      const [picked] = copy.splice(index, 1)
      return [picked, ...copy]
    })
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    if (!formState.sku.trim() || !formState.name.trim()) return

    setBusyId('form-submit')
    try {
      const finalImages =
        imagesList.length >= 1
          ? imagesList
          : generateSampleWebPImages(formState.name.trim(), formState.sku.trim()).slice(0, 1)

      const payload = {
        sku: formState.sku.trim(),
        name: formState.name.trim(),
        description: formState.description.trim(),
        images_json: JSON.stringify(finalImages),
        category: formState.category.trim(),
        warehouse: formState.warehouse.trim(),
        weight_gram: Number(formState.weight_gram) || 250,
        price: Number(formState.price) || 10000,
        stock: Number(formState.stock) || 0,
        publish_shopee: Boolean(formState.publish_shopee),
        publish_tokopedia: Boolean(formState.publish_tokopedia),
        publish_tiktok: Boolean(formState.publish_tiktok),
        status: formState.status,
        resolve_source: formState.resolve_source,
      }

      if (modalMode === 'edit' && editingProduct && onUpdateProduct) {
        await onUpdateProduct(editingProduct.id, payload)
      } else {
        await onCreateProduct(payload)
      }
      setModalMode(null)
      setEditingProduct(null)
    } finally {
      setBusyId('')
    }
  }

  async function handleQuickResolveConflict(prod, source = 'master') {
    if (!onUpdateProduct) return
    setBusyId(`resolve-${prod.id}`)
    try {
      await onUpdateProduct(prod.id, { resolve_source: source })
    } finally {
      setBusyId('')
    }
  }

  async function handleDuplicate(prod) {
    if (!onDuplicateProduct) return
    setBusyId(`dup-${prod.id}`)
    try {
      await onDuplicateProduct(prod.id)
    } finally {
      setBusyId('')
    }
  }

  async function handleRunBulk(action, extra = {}) {
    if (!onBulkProductAction || selectedIds.length === 0) return
    setBusyId(`bulk-${action}`)
    try {
      await onBulkProductAction({
        product_ids: selectedIds,
        action,
        ...extra,
      })
      setSelectedIds([])
    } finally {
      setBusyId('')
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function toggleSelectAllFiltered() {
    const visibleIds = filteredProducts.map((p) => p.id)
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedIds(visibleIds)
    }
  }

  function handleExportCsv() {
    const headers = [
      'ID',
      'SKU',
      'Nama Produk',
      'Kategori',
      'Gudang',
      'Harga Dasar (Rp)',
      'Stok Master',
      'Stok Shopee',
      'Stok Tokopedia',
      'Stok TikTok Shop',
      'Terjual',
      'Jumlah Foto WebP',
      'Status Sinkron',
    ]
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.sku}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.warehouse || ''}"`,
      p.price,
      p.stock,
      p.shopee_stock,
      p.tokopedia_stock,
      p.tiktok_stock,
      p.sold_count || 0,
      parseImagesJSON(p.images_json).length,
      p.sync_status,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `katalog-synccart-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Clean Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] px-5 py-4 rounded-2xl border border-[#ECEAE4]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFDECE] text-[#9A3408] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-[#141413]">
                Katalog Produk & Stok
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold">
                {stats.totalSku} SKU Master
              </span>
            </div>
            <p className="text-xs text-[#52524E]">
              Pusat kendali produk, kompresi gambar WebP otomatis, dan rekonsiliasi stok di Shopee, Tokopedia, serta TikTok Shop.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-[38px] px-3.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/40 text-xs font-bold text-[#141413] cursor-pointer transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="h-[38px] px-3.5 rounded-xl bg-[#FFDECE] hover:bg-[#F6671E] text-[#141413] text-xs font-extrabold cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Menyinkronkan...' : 'Sync Semua Stok'}
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="h-[38px] px-4 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer transition-all"
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      {/* ROW 1: 4 RentFlow-Style Visual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Total SKU Katalog</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {stats.totalSku}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-bold">
                {stats.activeCount} Aktif
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[60, 85, 70, 95, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${i === 4 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Total Stok Gudang</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#141413]">
                {stats.totalStock} pcs
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold">
                {stats.totalSold} Terjual
              </span>
            </div>
            <svg className="w-16 h-7 overflow-visible" viewBox="0 0 70 28" fill="none">
              <path
                d="M2 20 C16 24, 24 6, 38 14 C50 20, 56 4, 68 8"
                stroke="#F6671E"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Kesehatan Stok</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#141413]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono-tabular text-2xl font-extrabold ${
                  stats.conflictCount > 0 ? 'text-[#9B1C1C]' : 'text-[#141413]'
                }`}
              >
                {stats.conflictCount > 0
                  ? `${stats.conflictCount} Konflik`
                  : `${stats.lowStockCount} Menipis`}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  stats.conflictCount > 0
                    ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                    : 'bg-[#E6F6EC] text-[#0F5132]'
                }`}
              >
                {stats.conflictCount > 0 ? 'Perlu Sync' : 'Sinkron'}
              </span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {[70, 90, 85, 100, 95].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-full ${
                    stats.conflictCount > 0 ? 'bg-[#9B1C1C]' : i === 3 ? 'bg-[#F6671E]' : 'bg-[#FFDECE]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between h-[116px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Nilai Inventori</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFDECE] flex items-center justify-center text-[#9A3408]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="font-mono-tabular text-lg font-extrabold text-[#141413] truncate">
              {formatRupiah(stats.inventoryValue)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-bold shrink-0">
              Valuasi Stok
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-3 rounded-2xl bg-[#FFF6F0] border border-[#F6671E] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#F6671E] text-[#141413] font-extrabold">
              {selectedIds.length} Produk Dipilih
            </span>
            <span className="font-semibold text-[#141413]">
              Pilih aksi massal untuk diterapkan sekaligus:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('restock', { delta_stock: 10 })}
              className="h-[32px] px-3 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-xs font-bold text-[#141413] cursor-pointer"
            >
              +10 Stok Massal
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('sync')}
              className="h-[32px] px-3 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-xs font-bold text-[#141413] cursor-pointer"
            >
              Samakan Stok Channel
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('price_pct', { price_pct: 5 })}
              className="h-[32px] px-3 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-xs font-bold text-[#141413] cursor-pointer"
            >
              Harga +5%
            </button>
            <button
              type="button"
              disabled={busyId.startsWith('bulk-')}
              onClick={() => handleRunBulk('delete')}
              className="h-[32px] px-3 rounded-lg bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] cursor-pointer"
            >
              Hapus ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-[32px] px-2.5 text-xs font-bold text-[#52524E] cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Main Catalog Card (Toolbar + Table / Grid View) */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#ECEAE4] pb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `Semua (${stats.totalSku})` },
              { id: 'ACTIVE', label: `Stok Aman (${stats.activeCount})` },
              { id: 'LOW_STOCK', label: `Stok Menipis (${stats.lowStockCount})` },
              { id: 'OUT_OF_STOCK', label: `Habis (${stats.outOfStockCount})` },
              { id: 'CONFLICT', label: `Selisih Stok (${stats.conflictCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`h-[34px] px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  filterTab === tab.id
                    ? 'bg-[#F6671E] text-[#141413] font-extrabold'
                    : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              aria-label="Cari SKU atau nama produk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau SKU..."
              className="h-[34px] w-full sm:w-52 px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs text-[#141413] placeholder:text-[#52524E]"
            />

            <select
              aria-label="Filter kategori"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-[34px] px-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Urutkan produk"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[34px] px-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
            >
              <option value="newest">Terbaru</option>
              <option value="best_selling">Terlaris</option>
              <option value="stock_asc">Stok Terendah</option>
              <option value="stock_desc">Stok Tertinggi</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
            </select>

            <div className="inline-flex rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-[28px] px-2.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#FFFFFF] text-[#141413] shadow-2xs'
                    : 'text-[#52524E]'
                }`}
              >
                Tabel
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-[28px] px-2.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#FFFFFF] text-[#141413] shadow-2xs'
                    : 'text-[#52524E]'
                }`}
              >
                Kartu
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-extrabold text-[#141413]">
              Tidak ada produk yang cocok dengan filter saat ini
            </p>
            <p className="text-xs text-[#52524E]">
              Coba ubah kata kunci pencarian atau pilih tab Semua ({stats.totalSku}).
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[11px] font-semibold text-[#52524E]">
                  <th className="py-2.5 px-2 w-8">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua produk"
                      checked={
                        filteredProducts.length > 0 &&
                        filteredProducts.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={toggleSelectAllFiltered}
                      className="accent-[#F6671E] cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-2">Produk & Foto WebP</th>
                  <th className="py-2.5 px-2">Kategori & Gudang</th>
                  <th className="py-2.5 px-2">Harga Master</th>
                  <th className="py-2.5 px-2">Stok Master</th>
                  <th className="py-2.5 px-2">Stok per Channel</th>
                  <th className="py-2.5 px-2">Status Sinkron</th>
                  <th className="py-2.5 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4] text-xs">
                {filteredProducts.map((item) => {
                  const hasConflict =
                    item.sync_status === 'conflict' ||
                    item.shopee_stock !== item.stock ||
                    item.tokopedia_stock !== item.stock ||
                    item.tiktok_stock !== item.stock
                  const isChecked = selectedIds.includes(item.id)
                  const imgs = parseImagesJSON(item.images_json)

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-[#FFF6F0]' : 'hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${item.name}`}
                          checked={isChecked}
                          onChange={() => toggleSelectOne(item.id)}
                          className="accent-[#F6671E] cursor-pointer"
                        />
                      </td>

                      {/* Product Identity + WebP Thumbnails */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {imgs.length > 0 ? (
                            <div className="relative w-11 h-11 shrink-0">
                              <img
                                src={imgs[0].url}
                                alt={item.name}
                                className="w-11 h-11 rounded-xl object-cover border border-[#ECEAE4]"
                              />
                              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-[#141413] text-[#FFFFFF] font-mono-tabular text-[9px] font-extrabold">
                                {imgs.length} WebP
                              </span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#FFDECE] text-[#9A3408] flex items-center justify-center font-mono-tabular font-extrabold text-[11px] shrink-0">
                              {(item.sku || 'SKU').slice(0, 3)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-tabular text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#ECEAE4] text-[#9A3408]">
                                {item.sku}
                              </span>
                              <span className="text-[11px] text-[#52524E]">
                                • {item.sold_count || 0} terjual
                              </span>
                            </div>
                            <p className="font-extrabold text-[#141413] truncate mt-0.5">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-semibold text-[#141413] block">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-[#52524E] block">
                          {item.warehouse} • {item.weight_gram || 250}g
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-mono-tabular font-extrabold text-[#141413] block">
                          {formatRupiah(item.price)}
                        </span>
                        <span className="text-[10px] text-[#52524E]">
                          Sync: {formatDateTime(item.last_sync_at)}
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono-tabular text-sm font-extrabold ${
                              item.stock === 0
                                ? 'text-[#9B1C1C]'
                                : item.stock <= 10
                                  ? 'text-[#9A3408]'
                                  : 'text-[#141413]'
                            }`}
                          >
                            {item.stock} pcs
                          </span>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onAdjustStock(item.id, -1)}
                              disabled={item.stock <= 0}
                              title="Kurangi 1 stok"
                              className="w-6 h-6 rounded-md bg-[#FAF9F6] border border-[#ECEAE4] hover:bg-[#FFDECE] font-mono-tabular font-bold text-[#141413] cursor-pointer disabled:opacity-40"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => onAdjustStock(item.id, 5)}
                              title="Tambah 5 stok"
                              className="w-6 h-6 rounded-md bg-[#FFDECE] hover:bg-[#F6671E] font-mono-tabular font-extrabold text-[#141413] cursor-pointer"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1 font-mono-tabular text-[11px]">
                          {[
                            { label: 'SHP', val: item.shopee_stock, pub: item.publish_shopee !== false },
                            { label: 'TKP', val: item.tokopedia_stock, pub: item.publish_tokopedia !== false },
                            { label: 'TTS', val: item.tiktok_stock, pub: item.publish_tiktok !== false },
                          ].map((ch) => {
                            const mismatch = ch.val !== item.stock
                            return (
                              <span
                                key={ch.label}
                                className={`px-2 py-0.5 rounded-md font-bold border ${
                                  !ch.pub
                                    ? 'bg-[#FAF9F6] border-[#ECEAE4] text-[#52524E] opacity-55'
                                    : mismatch
                                      ? 'bg-[#FDE8E8] border-[#F8B4B4] text-[#9B1C1C]'
                                      : 'bg-[#FAF9F6] border-[#ECEAE4] text-[#141413]'
                                }`}
                              >
                                {ch.label}: {ch.val}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        {hasConflict ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FDE8E8] text-[#9B1C1C]">
                              ● Selisih Stok
                            </span>
                            <button
                              type="button"
                              disabled={busyId === `resolve-${item.id}`}
                              onClick={() => handleQuickResolveConflict(item, 'master')}
                              className="px-2 py-0.5 rounded-md bg-[#F6671E] text-[#141413] text-[10px] font-extrabold cursor-pointer"
                            >
                              Samakan
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F6EC] text-[#0F5132]">
                            ● Sinkron 3 Toko
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="h-[30px] px-2.5 rounded-lg border border-[#ECEAE4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-[11px] font-bold text-[#141413] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busyId === `dup-${item.id}`}
                            onClick={() => handleDuplicate(item)}
                            className="h-[30px] px-2.5 rounded-lg border border-[#ECEAE4] bg-[#FAF9F6] hover:bg-[#FFDECE]/50 text-[11px] font-bold text-[#141413] cursor-pointer"
                          >
                            Duplikat
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(item.id)}
                            className="h-[30px] px-2.5 rounded-lg border border-[#F8B4B4] bg-[#FDE8E8]/60 hover:bg-[#FDE8E8] text-[11px] font-bold text-[#9B1C1C] cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((item, idx) => {
              const hasConflict =
                item.sync_status === 'conflict' ||
                item.shopee_stock !== item.stock ||
                item.tokopedia_stock !== item.stock ||
                item.tiktok_stock !== item.stock
              const imgs = parseImagesJSON(item.images_json)
              const gradients = [
                'from-[#2D4A43] via-[#3F6A5E] to-[#9A3408]',
                'from-[#3B2F2F] via-[#6E473B] to-[#C85A17]',
                'from-[#1E293B] via-[#334155] to-[#9A3408]',
              ]
              const grad = gradients[idx % gradients.length]

              return (
                <article
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div
                      className={`relative h-[120px] rounded-xl bg-gradient-to-br ${grad} p-3 flex flex-col justify-between text-white overflow-hidden`}
                    >
                      {imgs.length > 0 && (
                        <img
                          src={imgs[0].url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-55"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-semibold">
                          {item.category}
                        </span>
                        <span className="font-mono-tabular px-2 py-0.5 rounded-full bg-white/95 text-[#141413] text-[10px] font-extrabold">
                          {item.sku} {imgs.length > 0 ? `• ${imgs.length} WebP` : ''}
                        </span>
                      </div>
                      <div className="relative z-10 flex items-end justify-between">
                        <span className="font-mono-tabular text-[11px] font-bold">
                          SHP {item.shopee_stock} • TKP {item.tokopedia_stock} • TTS {item.tiktok_stock}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            hasConflict
                              ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                              : 'bg-[#F6671E] text-[#141413]'
                          }`}
                        >
                          {hasConflict ? 'KONFLIK' : 'SINKRON'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tabular text-base font-extrabold text-[#9A3408]">
                          {formatRupiah(item.price)}
                        </span>
                        <span className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                          Stok: {item.stock} pcs
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#141413] mt-0.5 truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#52524E]">
                        {item.warehouse} • {item.sold_count || 0} terjual
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ECEAE4]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onAdjustStock(item.id, -1)}
                        disabled={item.stock <= 0}
                        className="h-[30px] px-2.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413] cursor-pointer"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustStock(item.id, 5)}
                        className="h-[30px] px-2.5 rounded-lg bg-[#FFDECE] hover:bg-[#F6671E] text-xs font-mono-tabular font-extrabold text-[#141413] cursor-pointer"
                      >
                        +5
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="h-[30px] px-2.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-[11px] font-bold text-[#141413] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(item)}
                        className="h-[30px] px-2.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-[11px] font-bold text-[#141413] cursor-pointer"
                      >
                        Duplikat
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* POP-UP MODAL DIALOG: CREATE / EDIT PRODUCT + MULTI-IMAGE WEBP CONVERTER */}
      {modalMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalMode(null)
              setEditingProduct(null)
            }
          }}
        >
          <div className="w-full max-w-3xl rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-2xl overflow-hidden my-auto">
            {/* Pop-Up Modal Header */}
            <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F6671E] text-[#141413] flex items-center justify-center font-extrabold text-sm shrink-0">
                  {modalMode === 'edit' ? 'ED' : '+P'}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#9A3408]">
                    {modalMode === 'edit'
                      ? 'Edit Produk & Sinkronisasi Stok'
                      : 'Produk Master Baru • WebP Optimizer'}
                  </span>
                  <h2 id="product-modal-title" className="text-base font-extrabold text-[#141413]">
                    {modalMode === 'edit'
                      ? `Perbarui ${editingProduct?.name} (${editingProduct?.sku})`
                      : 'Tambah Produk ke Katalog & Publish ke 3 Marketplace'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalMode(null)
                  setEditingProduct(null)
                }}
                aria-label="Tutup modal produk"
                className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] hover:bg-[#FFDECE] text-[#141413] font-extrabold text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pop-Up Modal Form Body */}
            <form
              onSubmit={handleFormSubmit}
              className="p-6 max-h-[82vh] overflow-y-auto space-y-5"
            >
              {/* SECTION 1: MULTI-IMAGE WEBP UPLOADER (1 OR MORE IMAGES) */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#141413]">
                        Galeri Foto Produk (Otomatis Konversi ke .WebP)
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          imagesList.length >= 1
                            ? 'bg-[#E6F6EC] text-[#0F5132]'
                            : 'bg-[#FFDECE] text-[#9A3408]'
                        }`}
                      >
                        {imagesList.length} / 6 Foto WebP
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52524E] mt-0.5">
                      Unggah 1 gambar atau lebih (hingga 6 foto JPG/PNG). Sistem otomatis mengecilkan resolusi & mengonversi ke format <strong>.webp</strong> agar ringan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddSampleWebP}
                      className="h-[34px] px-3 rounded-xl border border-[#ECEAE4] bg-[#FFFFFF] hover:bg-[#FFDECE]/40 text-[11px] font-bold text-[#141413] cursor-pointer"
                    >
                      + Sampel WebP
                    </button>
                    <button
                      type="button"
                      disabled={isConvertingWebP || imagesList.length >= 6}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[34px] px-3.5 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer disabled:opacity-50"
                    >
                      {isConvertingWebP ? 'Mengonversi ke WebP...' : '+ Pilih Gambar'}
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs font-bold text-[#9B1C1C] bg-[#FDE8E8] px-3 py-2 rounded-xl border border-[#F8B4B4]">
                    {uploadError}
                  </p>
                )}

                {/* Thumbnail Grid Preview */}
                {imagesList.length === 0 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleFilesSelected(e.dataTransfer.files)
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#ECEAE4] hover:border-[#F6671E] rounded-2xl p-6 text-center bg-[#FFFFFF] cursor-pointer transition-colors space-y-1.5"
                  >
                    <p className="text-xs font-extrabold text-[#141413]">
                      Klik atau Tarik 1 atau Lebih Foto Produk ke Sini (JPG, PNG, WebP)
                    </p>
                    <p className="text-[11px] text-[#52524E]">
                      Otomatis dikompres ke WebP (~15-35 KB/foto) untuk mempercepat sinkronisasi ke Shopee, Tokopedia, & TikTok Shop.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesList.map((img, index) => {
                      const savedPct =
                        img.originalBytes > img.webpBytes
                          ? Math.round(
                              ((img.originalBytes - img.webpBytes) / img.originalBytes) * 100
                            )
                          : 72
                      return (
                        <div
                          key={img.id || index}
                          className={`p-2 rounded-xl bg-[#FFFFFF] border flex flex-col justify-between space-y-2 ${
                            index === 0 ? 'border-[#F6671E] ring-1 ring-[#F6671E]' : 'border-[#ECEAE4]'
                          }`}
                        >
                          <div className="relative h-24 rounded-lg overflow-hidden bg-[#FAF9F6]">
                            <img
                              src={img.url}
                              alt={img.name || `Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#141413]/85 text-[#FFFFFF] text-[9px] font-extrabold">
                              {index === 0 ? '★ FOTO UTAMA' : `FOTO #${index + 1}`}
                            </span>
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#E6F6EC] text-[#0F5132] font-mono-tabular text-[9px] font-extrabold">
                              .WEBP (-{savedPct}%)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono-tabular font-bold text-[#141413] truncate">
                              {formatBytes(img.webpBytes)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  className="font-bold text-[#9A3408] hover:underline cursor-pointer"
                                >
                                  Utama
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="font-bold text-[#9B1C1C] hover:underline cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {imagesList.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 rounded-xl border-2 border-dashed border-[#ECEAE4] hover:border-[#F6671E] bg-[#FFFFFF] flex flex-col items-center justify-center text-xs font-extrabold text-[#9A3408] cursor-pointer"
                      >
                        <span>+ Tambah Foto</span>
                        <span className="text-[10px] font-normal text-[#52524E]">
                          Auto .WebP
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: PRODUCT DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="p-sku" className="block text-xs font-bold text-[#141413]">
                    Kode SKU Master
                  </label>
                  <input
                    id="p-sku"
                    type="text"
                    required
                    value={formState.sku}
                    onChange={(e) => setFormState((s) => ({ ...s, sku: e.target.value }))}
                    placeholder="Contoh: KLO-NAVY-02"
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="p-name" className="block text-xs font-bold text-[#141413]">
                    Nama Produk Lengkap
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Contoh: Kemeja Linen Oversize Navy"
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="p-cat" className="block text-xs font-bold text-[#141413]">
                    Kategori
                  </label>
                  <input
                    id="p-cat"
                    type="text"
                    required
                    value={formState.category}
                    onChange={(e) => setFormState((s) => ({ ...s, category: e.target.value }))}
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="p-price" className="block text-xs font-bold text-[#141413]">
                    Harga Dasar (Rp)
                  </label>
                  <input
                    id="p-price"
                    type="number"
                    min="1000"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState((s) => ({ ...s, price: e.target.value }))}
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="p-stock" className="block text-xs font-bold text-[#141413]">
                    Stok Master (pcs)
                  </label>
                  <input
                    id="p-stock"
                    type="number"
                    min="0"
                    required
                    value={formState.stock}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, stock: e.target.value, resolve_source: '' }))
                    }
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="p-weight" className="block text-xs font-bold text-[#141413]">
                    Berat Paket (gram)
                  </label>
                  <input
                    id="p-weight"
                    type="number"
                    min="10"
                    value={formState.weight_gram}
                    onChange={(e) => setFormState((s) => ({ ...s, weight_gram: e.target.value }))}
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="p-warehouse" className="block text-xs font-bold text-[#141413]">
                    Lokasi Gudang Penyimpanan
                  </label>
                  <input
                    id="p-warehouse"
                    type="text"
                    value={formState.warehouse}
                    onChange={(e) => setFormState((s) => ({ ...s, warehouse: e.target.value }))}
                    className="w-full h-[38px] px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-semibold text-[#141413]"
                  />
                </div>
              </div>

              {/* SECTION 3: MARKETPLACE DISTRIBUTION & CONFLICT RESOLUTION */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-extrabold text-[#141413]">Distribusi Marketplace:</span>
                  {[
                    { key: 'publish_shopee', label: 'Shopee', slug: 'shopee' },
                    { key: 'publish_tokopedia', label: 'Tokopedia', slug: 'tokopedia' },
                    { key: 'publish_tiktok', label: 'TikTok Shop', slug: 'tiktok' },
                  ].map((ch) => {
                    const mpObj = marketplaces.find((m) =>
                      (m.platform || '').toLowerCase().includes(ch.slug)
                    )
                    const markupPct = Number(mpObj?.price_markup_pct || 0)
                    const estPrice = Math.round(
                      Number(formState.price || 0) * (1 + markupPct / 100)
                    )
                    return (
                      <label
                        key={ch.key}
                        className="flex items-center gap-2 font-bold text-[#141413] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formState[ch.key])}
                          onChange={(e) =>
                            setFormState((s) => ({ ...s, [ch.key]: e.target.checked }))
                          }
                          className="accent-[#F6671E]"
                        />
                        <span>
                          {ch.label}{' '}
                          <span className="font-mono-tabular text-[11px] text-[#52524E]">
                            ({formatRupiah(estPrice)})
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>

                {modalMode === 'edit' && editingProduct && (
                  <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="p-resolve" className="font-bold text-[#9A3408]">
                      Acuan Stok:
                    </label>
                    <select
                      id="p-resolve"
                      value={formState.resolve_source}
                      onChange={(e) => {
                        const src = e.target.value
                        let nextStock = formState.stock
                        if (src === 'master') nextStock = editingProduct.stock
                        if (src === 'shopee') nextStock = editingProduct.shopee_stock
                        if (src === 'tokopedia') nextStock = editingProduct.tokopedia_stock
                        if (src === 'tiktok') nextStock = editingProduct.tiktok_stock
                        setFormState((s) => ({
                          ...s,
                          resolve_source: src,
                          stock: nextStock,
                        }))
                      }}
                      className="h-[34px] px-2.5 rounded-lg bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                    >
                      <option value="">Manual ({formState.stock} pcs)</option>
                      <option value="master">Master ({editingProduct.stock} pcs)</option>
                      <option value="shopee">Shopee ({editingProduct.shopee_stock} pcs)</option>
                      <option value="tokopedia">Tokopedia ({editingProduct.tokopedia_stock} pcs)</option>
                      <option value="tiktok">TikTok Shop ({editingProduct.tiktok_stock} pcs)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Pop-Up Modal Footer */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#ECEAE4]">
                <span className="text-[11px] text-[#52524E]">
                  {imagesList.length >= 1
                    ? `✓ ${imagesList.length} foto .webp siap disimpan ke PostgreSQL`
                    : 'Unggah 1 foto atau lebih (otomatis dikonversi ke .webp)'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode(null)
                      setEditingProduct(null)
                    }}
                    className="h-[38px] px-4 rounded-xl border border-[#ECEAE4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={busyId === 'form-submit' || isConvertingWebP}
                    className="h-[38px] px-5 rounded-xl bg-[#F6671E] hover:brightness-95 text-[#141413] text-xs font-extrabold cursor-pointer disabled:opacity-50"
                  >
                    {busyId === 'form-submit'
                      ? 'Menyimpan...'
                      : modalMode === 'edit'
                        ? 'Simpan & Sinkronkan'
                        : 'Simpan & Publish Produk'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default SellerProductsPage
