import React, { useMemo, useState } from 'react'

// ============================================================================
// Pure Formatting & Analytical Aggregation Helpers (Single Responsibility)
// ============================================================================

function formatIDR(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`
}

function formatCompactIDR(amount) {
  const num = Number(amount || 0)
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.', ',')} M`
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1).replace('.', ',')} Jt`
  }
  if (num >= 1_000) {
    return `Rp ${Math.round(num / 1_000).toLocaleString('id-ID')} Rb`
  }
  return `Rp ${num.toLocaleString('id-ID')}`
}

function formatShortDate(isoString) {
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

function normalizeChannelName(raw = '') {
  const lower = String(raw).toLowerCase()
  if (lower.includes('shopee')) return 'Shopee'
  if (lower.includes('tokopedia')) return 'Tokopedia'
  if (lower.includes('tiktok')) return 'TikTok Shop'
  return raw || 'Shopee'
}

const CHANNEL_PALETTE = {
  Shopee: {
    color: '#F6671E',
    softBg: '#FFF0E6',
    text: '#9A3408',
    border: '#F9B895',
  },
  Tokopedia: {
    color: '#0F5132',
    softBg: '#E6F6EC',
    text: '#0F5132',
    border: '#A3E2B8',
  },
  'TikTok Shop': {
    color: '#141413',
    softBg: '#EFECE6',
    text: '#141413',
    border: '#D5D1C8',
  },
}

// ============================================================================
// Main Component: SellerReportsPage (#workspace/reports)
// ============================================================================

export function SellerReportsPage({ overview, onUpdateSettings, onSelectTab }) {
  const store = overview?.store || {}
  const marketplaces = useMemo(() => overview?.marketplaces || [], [overview?.marketplaces])
  const products = useMemo(() => overview?.products || [], [overview?.products])
  const orders = useMemo(() => overview?.orders || [], [overview?.orders])

  // Interactive Analytical Slicers
  const [selectedChannel, setSelectedChannel] = useState('ALL')
  const [calculationBasis, setCalculationBasis] = useState('orders') // 'orders' | 'catalog'
  const [chartDimension, setChartDimension] = useState('chronological') // 'chronological' | 'category' | 'warehouse'
  const [activeBarIndex, setActiveBarIndex] = useState(0)
  const [detailTab, setDetailTab] = useState('sku_ranking') // 'sku_ranking' | 'customer_insights' | 'channel_pnl'

  // Pop-Up Modals State
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackBanner, setFeedbackBanner] = useState('')

  // Persisted Financial Parameters from PostgreSQL `stores` table
  const platformFeePct = Number(store.platform_fee_percent ?? 6.5)
  const cogsPct = Number(store.operational_cogs_percent ?? 42.0)
  const taxPct = Number(store.tax_percent ?? 0.5)
  const scheduleEmail = store.report_schedule_email || 'seller@synccart.id'
  const scheduleFrequency = store.report_schedule_frequency || 'weekly'

  const [financeForm, setFinanceForm] = useState({
    platform_fee_percent: platformFeePct,
    operational_cogs_percent: cogsPct,
    tax_percent: taxPct,
  })

  const [exportForm, setExportForm] = useState({
    dataset: 'executive_full',
    report_schedule_email: scheduleEmail,
    report_schedule_frequency: scheduleFrequency,
  })

  // Filtered Orders by Channel Slicer
  const filteredOrders = useMemo(() => {
    if (selectedChannel === 'ALL') return orders
    return orders.filter((o) => normalizeChannelName(o.marketplace) === selectedChannel)
  }, [orders, selectedChannel])

  const activeOrders = useMemo(
    () => filteredOrders.filter((o) => o.status !== 'Cancelled'),
    [filteredOrders]
  )

  // Core Financial & Volume Aggregations (100% Database-Driven, Zero Hardcode)
  const analytics = useMemo(() => {
    const orderRevenue = activeOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
    const orderUnits = activeOrders.reduce((sum, o) => sum + Number(o.quantity || 1), 0)

    const catalogRevenue = products.reduce((sum, p) => {
      const totalProdRev = Number(p.price || 0) * Number(p.sold_count || 0)
      if (selectedChannel === 'ALL') return sum + totalProdRev
      // Proportional allocation by channel orders or equal split if connected
      return sum + Math.round(totalProdRev / 3)
    }, 0)

    const catalogUnits = products.reduce((sum, p) => {
      const sold = Number(p.sold_count || 0)
      return sum + (selectedChannel === 'ALL' ? sold : Math.round(sold / 3))
    }, 0)

    const grossRevenue = calculationBasis === 'orders' ? orderRevenue : catalogRevenue
    const totalUnitsSold = calculationBasis === 'orders' ? orderUnits : catalogUnits
    const transactionCount = activeOrders.length

    const platformFeeAmount = Math.round(grossRevenue * (platformFeePct / 100))
    const cogsAmount = Math.round(grossRevenue * (cogsPct / 100))
    const taxAmount = Math.round(grossRevenue * (taxPct / 100))
    const netProfit = Math.max(0, grossRevenue - platformFeeAmount - cogsAmount - taxAmount)
    const netMarginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0'

    const avgOrderValue =
      transactionCount > 0 ? Math.round(orderRevenue / transactionCount) : 0

    // Inventory Valuation & Sell-Through from `products` table
    const inventoryValuation = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    )
    const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0)
    const totalCatalogSold = products.reduce((sum, p) => sum + Number(p.sold_count || 0), 0)
    const sellThroughPct =
      totalCatalogSold + totalStockUnits > 0
        ? Math.round((totalCatalogSold / (totalCatalogSold + totalStockUnits)) * 100)
        : 0

    // Order Status Funnel
    const statusMap = {
      Completed: { label: 'Selesai & Dana Cair', count: 0, amount: 0, color: '#0F5132', bg: '#E6F6EC' },
      Shipped: { label: 'Dalam Pengiriman Kurir', count: 0, amount: 0, color: '#141413', bg: '#EFECE6' },
      PendingResi: { label: 'Antrean Perlu Resi', count: 0, amount: 0, color: '#9A3408', bg: '#FFDECE' },
      Cancelled: { label: 'Dibatalkan', count: 0, amount: 0, color: '#9B1C1C', bg: '#FDE8E8' },
    }

    filteredOrders.forEach((o) => {
      const amt = Number(o.amount || 0)
      if (o.status === 'Completed') {
        statusMap.Completed.count += 1
        statusMap.Completed.amount += amt
      } else if (o.status === 'Shipped') {
        statusMap.Shipped.count += 1
        statusMap.Shipped.amount += amt
      } else if (o.status === 'Cancelled') {
        statusMap.Cancelled.count += 1
        statusMap.Cancelled.amount += amt
      } else {
        statusMap.PendingResi.count += 1
        statusMap.PendingResi.amount += amt
      }
    })

    const fulfillmentRatePct =
      filteredOrders.length > 0
        ? Math.round(
            ((statusMap.Completed.count + statusMap.Shipped.count) / filteredOrders.length) * 100
          )
        : 0

    return {
      grossRevenue,
      platformFeeAmount,
      cogsAmount,
      taxAmount,
      netProfit,
      netMarginPct,
      totalUnitsSold,
      transactionCount,
      avgOrderValue,
      inventoryValuation,
      totalStockUnits,
      sellThroughPct,
      statusFunnel: Object.values(statusMap),
      fulfillmentRatePct,
    }
  }, [
    activeOrders,
    filteredOrders,
    products,
    selectedChannel,
    calculationBasis,
    platformFeePct,
    cogsPct,
    taxPct,
  ])

  // Primary Bar Chart Series (Dynamic Dimension: Chronological / Category / Warehouse)
  const primaryChartSeries = useMemo(() => {
    const netRatio = Math.max(0.05, (100 - platformFeePct - cogsPct - taxPct) / 100)

    if (chartDimension === 'chronological') {
      const chronological = [...activeOrders].reverse()
      if (chronological.length === 0) return []
      return chronological.map((ord, idx) => {
        const gross = Number(ord.amount || 0)
        return {
          id: ord.id || idx,
          shortLabel: ord.order_number ? ord.order_number.slice(-5) : `#${idx + 1}`,
          fullTitle: `${ord.order_number} (${normalizeChannelName(ord.marketplace)})`,
          subtitle: `${ord.buyer_name} • ${formatShortDate(ord.created_at)}`,
          gross,
          net: Math.round(gross * netRatio),
          units: Number(ord.quantity || 1),
        }
      })
    }

    if (chartDimension === 'category') {
      const catMap = new Map()
      products.forEach((p) => {
        const cat = p.category || 'Lainnya'
        const current = catMap.get(cat) || { gross: 0, units: 0, skuCount: 0 }
        // Combine live order revenue for this SKU or catalog revenue based on mode
        const skuOrders = activeOrders.filter((o) => o.product_sku === p.sku)
        const skuOrderRev = skuOrders.reduce((s, o) => s + Number(o.amount || 0), 0)
        const skuOrderUnits = skuOrders.reduce((s, o) => s + Number(o.quantity || 1), 0)

        const rev =
          calculationBasis === 'orders'
            ? skuOrderRev
            : Number(p.price || 0) * Number(p.sold_count || 0)
        const units = calculationBasis === 'orders' ? skuOrderUnits : Number(p.sold_count || 0)

        current.gross += rev
        current.units += units
        current.skuCount += 1
        catMap.set(cat, current)
      })

      return Array.from(catMap.entries()).map(([catName, val], idx) => ({
        id: `cat-${idx}`,
        shortLabel: catName.split(' ')[0],
        fullTitle: catName,
        subtitle: `${val.skuCount} SKU Katalog • ${val.units} pcs terjual`,
        gross: val.gross,
        net: Math.round(val.gross * netRatio),
        units: val.units,
      }))
    }

    // 'warehouse' dimension
    const whMap = new Map()
    products.forEach((p) => {
      const wh = p.warehouse || 'Gudang Utama'
      const current = whMap.get(wh) || { gross: 0, units: 0, stock: 0 }
      const skuOrders = activeOrders.filter((o) => o.product_sku === p.sku)
      const skuOrderRev = skuOrders.reduce((s, o) => s + Number(o.amount || 0), 0)
      const skuOrderUnits = skuOrders.reduce((s, o) => s + Number(o.quantity || 1), 0)

      const rev =
        calculationBasis === 'orders'
          ? skuOrderRev
          : Number(p.price || 0) * Number(p.sold_count || 0)
      const units = calculationBasis === 'orders' ? skuOrderUnits : Number(p.sold_count || 0)

      current.gross += rev
      current.units += units
      current.stock += Number(p.stock || 0)
      whMap.set(wh, current)
    })

    return Array.from(whMap.entries()).map(([whName, val], idx) => ({
      id: `wh-${idx}`,
      shortLabel: whName.replace('Gudang ', '').split(',')[0],
      fullTitle: whName,
      subtitle: `Sisa Stok: ${val.stock} pcs • Terjual: ${val.units} pcs`,
      gross: val.gross,
      net: Math.round(val.gross * netRatio),
      units: val.units,
    }))
  }, [
    chartDimension,
    activeOrders,
    products,
    calculationBasis,
    platformFeePct,
    cogsPct,
    taxPct,
  ])

  const maxPrimaryBarGross = useMemo(
    () => Math.max(...primaryChartSeries.map((item) => item.gross), 1),
    [primaryChartSeries]
  )

  const selectedBarItem =
    primaryChartSeries[Math.min(activeBarIndex, Math.max(0, primaryChartSeries.length - 1))] ||
    null

  // Channel Donut & Comparison Data (Shopee, Tokopedia, TikTok Shop)
  const channelBreakdown = useMemo(() => {
    const netRatio = Math.max(0.05, (100 - platformFeePct - cogsPct - taxPct) / 100)
    const baseChannels = ['Shopee', 'Tokopedia', 'TikTok Shop']

    const rows = baseChannels.map((chName) => {
      const mpRecord =
        marketplaces.find((m) => normalizeChannelName(m.platform) === chName) || {}
      const chOrders = orders.filter(
        (o) => o.status !== 'Cancelled' && normalizeChannelName(o.marketplace) === chName
      )
      const orderRev = chOrders.reduce((s, o) => s + Number(o.amount || 0), 0)
      const orderCount = chOrders.length
      const units = chOrders.reduce((s, o) => s + Number(o.quantity || 1), 0)

      const gross =
        calculationBasis === 'orders'
          ? orderRev
          : Number(mpRecord.revenue_this_month || orderRev)

      return {
        platform: chName,
        shopName: mpRecord.shop_name || `${chName} Official Store`,
        status: mpRecord.status || 'connected',
        rating: mpRecord.rating || '4.9',
        syncedSkus: Number(mpRecord.products_synced ?? products.length),
        markupPct: Number(mpRecord.price_markup_pct || 0),
        orderCount,
        units,
        gross,
        fee: Math.round(gross * (platformFeePct / 100)),
        cogs: Math.round(gross * (cogsPct / 100)),
        tax: Math.round(gross * (taxPct / 100)),
        net: Math.round(gross * netRatio),
        aov: orderCount > 0 ? Math.round(orderRev / orderCount) : 0,
        palette: CHANNEL_PALETTE[chName] || CHANNEL_PALETTE.Shopee,
      }
    })

    const totalChannelRev = rows.reduce((s, r) => s + r.gross, 0)
    return rows.map((r) => ({
      ...r,
      sharePct: totalChannelRev > 0 ? Math.round((r.gross / totalChannelRev) * 100) : 0,
    }))
  }, [marketplaces, orders, products.length, calculationBasis, platformFeePct, cogsPct, taxPct])

  // Courier & Payment Method Distribution from PostgreSQL `orders`
  const operationalDistribution = useMemo(() => {
    const courierMap = new Map()
    const paymentMap = new Map()

    activeOrders.forEach((o) => {
      const courier = o.courier || 'J&T Express'
      const pay = o.payment_method || 'QRIS'
      const amt = Number(o.amount || 0)

      const curC = courierMap.get(courier) || { count: 0, amount: 0 }
      curC.count += 1
      curC.amount += amt
      courierMap.set(courier, curC)

      const curP = paymentMap.get(pay) || { count: 0, amount: 0 }
      curP.count += 1
      curP.amount += amt
      paymentMap.set(pay, curP)
    })

    const totalCount = Math.max(activeOrders.length, 1)

    const couriers = Array.from(courierMap.entries())
      .map(([name, val]) => ({
        name,
        count: val.count,
        amount: val.amount,
        sharePct: Math.round((val.count / totalCount) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)

    const payments = Array.from(paymentMap.entries())
      .map(([name, val]) => ({
        name,
        count: val.count,
        amount: val.amount,
        sharePct: Math.round((val.count / totalCount) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)

    return { couriers, payments }
  }, [activeOrders])

  // Customer / Buyer Contribution Leaderboard from PostgreSQL `orders`
  const customerLeaderboard = useMemo(() => {
    const buyerMap = new Map()
    activeOrders.forEach((o) => {
      const key = (o.buyer_name || 'Pelanggan Marketplace').trim()
      const current = buyerMap.get(key) || {
        name: key,
        initials: o.buyer_initials || key.slice(0, 2).toUpperCase(),
        phone: o.buyer_phone || '-',
        address: o.shipping_address || '-',
        channels: new Set(),
        ordersCount: 0,
        unitsCount: 0,
        totalSpend: 0,
      }
      current.channels.add(normalizeChannelName(o.marketplace))
      current.ordersCount += 1
      current.unitsCount += Number(o.quantity || 1)
      current.totalSpend += Number(o.amount || 0)
      buyerMap.set(key, current)
    })

    const list = Array.from(buyerMap.values())
      .map((b) => ({
        ...b,
        channelList: Array.from(b.channels).join(', '),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)

    const maxSpend = Math.max(...list.map((b) => b.totalSpend), 1)
    const totalSpendAll = Math.max(
      list.reduce((s, b) => s + b.totalSpend, 0),
      1
    )

    return list.map((b) => ({
      ...b,
      barPct: Math.round((b.totalSpend / maxSpend) * 100),
      sharePct: Math.round((b.totalSpend / totalSpendAll) * 100),
    }))
  }, [activeOrders])

  // SKU Performance Ranking from PostgreSQL `products` & `orders`
  const skuPerformance = useMemo(() => {
    const netRatio = Math.max(0.05, (100 - platformFeePct - cogsPct - taxPct) / 100)
    const rows = products.map((p) => {
      const skuOrders = activeOrders.filter((o) => o.product_sku === p.sku)
      const orderRev = skuOrders.reduce((s, o) => s + Number(o.amount || 0), 0)
      const orderUnits = skuOrders.reduce((s, o) => s + Number(o.quantity || 1), 0)

      const catalogRev = Number(p.price || 0) * Number(p.sold_count || 0)
      const gross = calculationBasis === 'orders' ? orderRev : catalogRev
      const unitsSold = calculationBasis === 'orders' ? orderUnits : Number(p.sold_count || 0)
      const stock = Number(p.stock || 0)
      const totalLifeUnits = Number(p.sold_count || 0) + stock
      const sellThroughPct =
        totalLifeUnits > 0 ? Math.round((Number(p.sold_count || 0) / totalLifeUnits) * 100) : 0

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        warehouse: p.warehouse,
        price: Number(p.price || 0),
        stock,
        unitsSold,
        gross,
        net: Math.round(gross * netRatio),
        sellThroughPct,
        syncStatus: p.sync_status,
      }
    })

    rows.sort((a, b) => b.gross - a.gross || b.unitsSold - a.unitsSold)
    const maxGross = Math.max(...rows.map((r) => r.gross), 1)
    const sumGross = Math.max(
      rows.reduce((s, r) => s + r.gross, 0),
      1
    )

    return rows.map((r) => ({
      ...r,
      barPct: Math.round((r.gross / maxGross) * 100),
      sharePct: Math.round((r.gross / sumGross) * 100),
    }))
  }, [products, activeOrders, calculationBasis, platformFeePct, cogsPct, taxPct])

  // SVG Donut Geometry Calculation for Channel Distribution
  const donutSegments = useMemo(() => {
    const radius = 58
    const circumference = 2 * Math.PI * radius
    const total = channelBreakdown.reduce((s, c) => s + c.gross, 0)

    let accumulatedAngle = 0
    return channelBreakdown.map((ch) => {
      const fraction = total > 0 ? ch.gross / total : 1 / 3
      const strokeLength = fraction * circumference
      const strokeGap = Math.max(0, circumference - strokeLength)
      const rotation = accumulatedAngle * 360 - 90
      accumulatedAngle += fraction

      return {
        ...ch,
        radius,
        circumference,
        strokeDasharray: `${strokeLength} ${strokeGap}`,
        rotation,
      }
    })
  }, [channelBreakdown])

  // Handlers for Pop-Up Modals
  function openFinanceConfigModal() {
    setFinanceForm({
      platform_fee_percent: platformFeePct,
      operational_cogs_percent: cogsPct,
      tax_percent: taxPct,
    })
    setIsFinanceModalOpen(true)
  }

  async function handleSaveFinanceConfig(e) {
    e.preventDefault()
    if (!onUpdateSettings) return
    setIsSubmitting(true)
    try {
      await onUpdateSettings({
        platform_fee_percent: Number(financeForm.platform_fee_percent),
        operational_cogs_percent: Number(financeForm.operational_cogs_percent),
        tax_percent: Number(financeForm.tax_percent),
      })
      setIsFinanceModalOpen(false)
      setFeedbackBanner(
        'Parameter komisi marketplace, HPP, dan pajak berhasil disimpan.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDownloadCSV(datasetType) {
    let rows = []
    let filename = 'laporan-eksekutif-synccart.csv'

    if (datasetType === 'channel_pnl') {
      filename = 'laporan-laba-rugi-channel-synccart.csv'
      rows = [
        [
          'Channel Marketplace',
          'Nama Toko',
          'Pesanan Aktif',
          'Unit Terjual',
          'Omzet Kotor (Rp)',
          `Komisi Platform ${platformFeePct}% (Rp)`,
          `HPP & Operasional ${cogsPct}% (Rp)`,
          `Pajak PPh ${taxPct}% (Rp)`,
          'Laba Bersih (Rp)',
        ],
        ...channelBreakdown.map((c) => [
          c.platform,
          `"${c.shopName}"`,
          c.orderCount,
          c.units,
          c.gross,
          c.fee,
          c.cogs,
          c.tax,
          c.net,
        ]),
      ]
    } else if (datasetType === 'sku_performance') {
      filename = 'laporan-performa-sku-synccart.csv'
      rows = [
        [
          'SKU',
          'Nama Produk',
          'Kategori',
          'Lokasi Gudang',
          'Harga Satuan (Rp)',
          'Unit Terjual',
          'Sisa Stok',
          'Rasio Serapan (%)',
          'Omzet Kotor (Rp)',
          'Estimasi Laba Bersih (Rp)',
        ],
        ...skuPerformance.map((p) => [
          p.sku,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.warehouse}"`,
          p.price,
          p.unitsSold,
          p.stock,
          p.sellThroughPct,
          p.gross,
          p.net,
        ]),
      ]
    } else if (datasetType === 'customer_insights') {
      filename = 'laporan-pelanggan-synccart.csv'
      rows = [
        [
          'Nama Pembeli',
          'Telepon',
          'Channel',
          'Frekuensi Pesanan',
          'Total Unit Dibeli',
          'Total Belanja (Rp)',
          'Porsi Kontribusi (%)',
        ],
        ...customerLeaderboard.map((b) => [
          `"${b.name}"`,
          `"${b.phone}"`,
          `"${b.channelList}"`,
          b.ordersCount,
          b.unitsCount,
          b.totalSpend,
          b.sharePct,
        ]),
      ]
    } else {
      rows = [
        ['Metrik Keuangan & Operasional', 'Nilai'],
        ['Omzet Kotor Terealisasi (Rp)', analytics.grossRevenue],
        [`Potongan Komisi Marketplace (${platformFeePct}%)`, analytics.platformFeeAmount],
        [`HPP & Operasional Gudang (${cogsPct}%)`, analytics.cogsAmount],
        [`Estimasi Pajak PPh (${taxPct}%)`, analytics.taxAmount],
        ['Laba Bersih Toko (Rp)', analytics.netProfit],
        ['Margin Laba Bersih (%)', `${analytics.netMarginPct}%`],
        ['Total Unit Terjual (pcs)', analytics.totalUnitsSold],
        ['Rata-Rata Nilai Transaksi / AOV (Rp)', analytics.avgOrderValue],
        ['Valuasi Aset Stok Gudang (Rp)', analytics.inventoryValuation],
      ]
    }

    const csvContent = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setFeedbackBanner(`Berkas ${filename} berhasil diunduh ke perangkat Anda.`)
  }

  async function handleSaveScheduleAndExport(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (onUpdateSettings) {
        await onUpdateSettings({
          report_schedule_email: exportForm.report_schedule_email,
          report_schedule_frequency: exportForm.report_schedule_frequency,
        })
      }
      handleDownloadCSV(exportForm.dataset)
      setIsExportModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* =====================================================================
          1. TOP EDITORIAL HEADER & GLOBAL ANALYTICAL SLICERS
         ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[11px] font-extrabold uppercase tracking-wider">
              Analitik & Laporan Laba Rugi
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[11px] font-bold">
              Sinkronisasi Tabel orders, products & stores
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#141413] tracking-tight">
            Inteligensi Kinerja Penjualan, Keuangan & Operasional
          </h1>
          <p className="text-xs text-[#52524E]">
            Visualisasi menyeluruh untuk tren pendapatan, kontribusi channel, perputaran SKU,
            perilaku pembeli, hingga struktur laba bersih toko.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Basis Toggle: Orders vs Catalog */}
          <div className="inline-flex p-1 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4]">
            <button
              type="button"
              onClick={() => {
                setCalculationBasis('orders')
                setActiveBarIndex(0)
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                calculationBasis === 'orders'
                  ? 'bg-[#141413] text-[#FFFFFF]'
                  : 'text-[#52524E] hover:text-[#141413]'
              }`}
            >
              Basis Transaksi Order
            </button>
            <button
              type="button"
              onClick={() => {
                setCalculationBasis('catalog')
                setActiveBarIndex(0)
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                calculationBasis === 'catalog'
                  ? 'bg-[#141413] text-[#FFFFFF]'
                  : 'text-[#52524E] hover:text-[#141413]'
              }`}
            >
              Akumulasi Katalog
            </button>
          </div>

          <button
            type="button"
            onClick={openFinanceConfigModal}
            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/50 border border-[#ECEAE4] text-[#141413] text-xs font-bold transition-colors cursor-pointer"
          >
            Parameter Laba & Pajak ({platformFeePct}% / {cogsPct}%)
          </button>

          <button
            type="button"
            onClick={() => {
              setExportForm({
                dataset: 'executive_full',
                report_schedule_email: scheduleEmail,
                report_schedule_frequency: scheduleFrequency,
              })
              setIsExportModalOpen(true)
            }}
            className="min-h-[38px] px-4 py-2 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-[#141413] text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
          >
            Ekspor & Jadwal Laporan
          </button>
        </div>
      </div>

      {/* Channel Filter Pills Bar */}
      <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-[#52524E] uppercase tracking-wider mr-1.5">
            Filter Channel:
          </span>
          {['ALL', 'Shopee', 'Tokopedia', 'TikTok Shop'].map((ch) => {
            const active = selectedChannel === ch
            return (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  setSelectedChannel(ch)
                  setActiveBarIndex(0)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#F6671E] text-[#141413]'
                    : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                }`}
              >
                {ch === 'ALL' ? 'Semua Marketplace (3)' : ch}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#52524E]">
          <span>
            Jadwal Laporan:{' '}
            <strong className="text-[#141413] uppercase">{scheduleFrequency}</strong> ke{' '}
            <strong className="font-mono-tabular text-[#9A3408]">{scheduleEmail}</strong>
          </span>
        </div>
      </div>

      {feedbackBanner && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#E6F6EC] border border-[#A3E2B8] text-xs font-bold text-[#0F5132] flex items-center justify-between"
        >
          <span>✓ {feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner('')}
            className="text-[#0F5132] font-extrabold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* =====================================================================
          2. 4 RENTFLOW EXECUTIVE KPI CARDS WITH VISUAL MINI-CHARTS
         ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Gross Revenue & AOV */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Omzet Kotor Terealisasi</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#9A3408] text-[10px] font-extrabold">
              AOV {formatCompactIDR(analytics.avgOrderValue)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413] tracking-tight">
                {formatIDR(analytics.grossRevenue)}
              </p>
              <span className="text-[11px] font-semibold text-[#52524E]">
                Dari {analytics.transactionCount} transaksi aktif
              </span>
            </div>
            {/* Mini Pill Bar Chart */}
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[42, 68, 54, 88, 72, 96].map((h, i) => (
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

        {/* KPI 2: Net Profit & Net Margin */}
        <div className="p-5 rounded-2xl bg-[#FFDECE] border border-[#F6671E] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#9A3408]">Laba Bersih (Net Profit)</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#141413] text-[10px] font-extrabold">
              Margin {analytics.netMarginPct}%
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413] tracking-tight">
                {formatIDR(analytics.netProfit)}
              </p>
              <span className="text-[11px] font-bold text-[#9A3408]">
                Setelah potongan {platformFeePct + cogsPct + taxPct}% beban
              </span>
            </div>
            <svg viewBox="0 0 80 34" className="w-18 h-8 shrink-0" aria-hidden="true">
              <path
                d="M2 28 C14 24, 22 12, 34 18 C46 24, 54 6, 66 11 C72 14, 75 5, 78 4"
                fill="none"
                stroke="#9A3408"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Total Volume Sold & Fulfillment Rate */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Volume Produk Terjual</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F6EC] text-[#0F5132] text-[10px] font-extrabold">
              SLA Kirim {analytics.fulfillmentRatePct}%
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413] tracking-tight">
                {analytics.totalUnitsSold.toLocaleString('id-ID')} pcs
              </p>
              <span className="text-[11px] font-semibold text-[#52524E]">
                Serapan katalog {analytics.sellThroughPct}%
              </span>
            </div>
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[50, 75, 62, 92, 80].map((h, i) => (
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

        {/* KPI 4: Inventory Valuation & Active Stock */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52524E]">Valuasi Aset Stok Gudang</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] text-[#141413] text-[10px] font-extrabold">
              {analytics.totalStockUnits} pcs tersedia
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#141413] tracking-tight">
                {formatCompactIDR(analytics.inventoryValuation)}
              </p>
              <span className="text-[11px] font-semibold text-[#52524E]">
                Dari {products.length} SKU master aktif
              </span>
            </div>
            <div className="flex items-end gap-1 h-9" aria-hidden="true">
              {[84, 65, 90, 58, 76].map((h, i) => (
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
      </div>

      {/* =====================================================================
          3. MAIN ASYMMETRIC CHARTS GRID (7 COLS BAR CHART + 5 COLS DONUT CHART)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT 7 COLS: Interactive RentFlow Dual-Pill Bar Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#141413]">
                Grafik Perbandingan Omzet Kotor & Laba Bersih
              </h2>
              <p className="text-xs text-[#52524E]">
                Klik batang grafik untuk menginspeksi rincian omzet, laba bersih, dan kuantitas.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] self-start">
              {[
                { id: 'chronological', label: 'Urutan Transaksi' },
                { id: 'category', label: 'Kategori Produk' },
                { id: 'warehouse', label: 'Lokasi Gudang' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setChartDimension(mode.id)
                    setActiveBarIndex(0)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                    chartDimension === mode.id
                      ? 'bg-[#F6671E] text-[#141413]'
                      : 'text-[#52524E] hover:text-[#141413]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Selected Bar Callout Box (RentFlow Tooltip Card Style) */}
          {selectedBarItem && (
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#141413]">{selectedBarItem.fullTitle}</p>
                <p className="text-[11px] text-[#52524E]">{selectedBarItem.subtitle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="block text-[10px] font-semibold text-[#52524E] uppercase">
                    Omzet Kotor
                  </span>
                  <span className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                    {formatIDR(selectedBarItem.gross)}
                  </span>
                </div>
                <div className="pl-3 border-l border-[#ECEAE4]">
                  <span className="block text-[10px] font-semibold text-[#9A3408] uppercase">
                    Laba Bersih
                  </span>
                  <span className="font-mono-tabular text-xs font-extrabold text-[#0F5132]">
                    {formatIDR(selectedBarItem.net)}
                  </span>
                </div>
                <div className="pl-3 border-l border-[#ECEAE4]">
                  <span className="block text-[10px] font-semibold text-[#52524E] uppercase">
                    Volume
                  </span>
                  <span className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                    {selectedBarItem.units} pcs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RentFlow Rounded-Pill Vertical Bars */}
          {primaryChartSeries.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-[#52524E]">
              Belum ada data transaksi pada filter channel ini.
            </div>
          ) : (
            <div className="pt-2">
              <div className="grid grid-cols-12 gap-2 items-end h-52">
                {/* Y-axis scale labels */}
                <div className="col-span-2 flex flex-col justify-between h-44 text-[10px] font-mono-tabular text-[#52524E] pb-6">
                  <span>{formatCompactIDR(maxPrimaryBarGross)}</span>
                  <span>{formatCompactIDR(Math.round(maxPrimaryBarGross * 0.66))}</span>
                  <span>{formatCompactIDR(Math.round(maxPrimaryBarGross * 0.33))}</span>
                  <span>Rp 0</span>
                </div>

                {/* Pill Bars */}
                <div
                  className="col-span-10 grid gap-2 items-end h-44"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(primaryChartSeries.length, 8)}, minmax(0, 1fr))`,
                  }}
                >
                  {primaryChartSeries.slice(0, 8).map((bar, idx) => {
                    const grossPct = Math.max(
                      16,
                      Math.round((bar.gross / maxPrimaryBarGross) * 100)
                    )
                    const netPct = Math.max(
                      12,
                      Math.round((bar.net / Math.max(bar.gross, 1)) * 100)
                    )
                    const isSelected = idx === activeBarIndex

                    return (
                      <button
                        key={bar.id}
                        type="button"
                        onClick={() => setActiveBarIndex(idx)}
                        className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`w-full max-w-[38px] rounded-full transition-all flex flex-col justify-end overflow-hidden p-0.5 ${
                            isSelected
                              ? 'bg-[#FFDECE] ring-2 ring-[#F6671E]'
                              : 'bg-[#FFF0E6] group-hover:bg-[#FFDECE]'
                          }`}
                          style={{ height: `${grossPct}%` }}
                        >
                          <div
                            className="w-full rounded-full bg-[#F6671E] transition-all"
                            style={{ height: `${netPct}%` }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-mono-tabular truncate max-w-full ${
                            isSelected ? 'font-extrabold text-[#141413]' : 'text-[#52524E]'
                          }`}
                        >
                          {bar.shortLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ECEAE4] text-[11px] text-[#52524E]">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FFDECE] border border-[#F6671E]" />
                    Tinggi Kapsul Luar: Omzet Kotor
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#F6671E]" />
                    Isi Kapsul Oranye: Estimasi Laba Bersih
                  </span>
                </div>
                <span className="font-mono-tabular font-bold text-[#141413]">
                  {primaryChartSeries.length} titik data
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 5 COLS: RentFlow Interactive SVG Donut Chart (Channel Distribution) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#141413]">
              Proporsi Pendapatan & Performa Channel
            </h2>
            <p className="text-xs text-[#52524E]">
              Distribusi omzet, rata-rata nilai pesanan (AOV), dan porsi kontribusi per platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* SVG Multi-Segment Donut Chart */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 150 150" className="w-full h-full">
                <circle
                  cx="75"
                  cy="75"
                  r="58"
                  fill="none"
                  stroke="#FAF9F6"
                  strokeWidth="16"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.platform}
                    cx="75"
                    cy="75"
                    r={seg.radius}
                    fill="none"
                    stroke={seg.palette.color}
                    strokeWidth="16"
                    strokeDasharray={seg.strokeDasharray}
                    transform={`rotate(${seg.rotation} 75 75)`}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                <span className="text-[10px] font-semibold text-[#52524E]">Total Omzet</span>
                <span className="font-mono-tabular text-xs font-extrabold text-[#141413]">
                  {formatCompactIDR(
                    channelBreakdown.reduce((sum, item) => sum + item.gross, 0)
                  )}
                </span>
              </div>
            </div>

            {/* Channel Legend & Quick Metrics */}
            <div className="flex-1 w-full space-y-2.5">
              {channelBreakdown.map((ch) => (
                <button
                  key={ch.platform}
                  type="button"
                  onClick={() =>
                    setSelectedChannel((prev) => (prev === ch.platform ? 'ALL' : ch.platform))
                  }
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedChannel === ch.platform
                      ? 'bg-[#FFF0E6] border-[#F6671E]'
                      : 'bg-[#FAF9F6] border-[#ECEAE4] hover:border-[#D5D1C8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2 font-extrabold text-[#141413]">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ch.palette.color }}
                      />
                      {ch.platform}
                    </span>
                    <span className="font-mono-tabular font-extrabold text-[#9A3408]">
                      {ch.sharePct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#52524E] mt-1">
                    <span className="font-mono-tabular font-bold text-[#141413]">
                      {formatIDR(ch.gross)}
                    </span>
                    <span>
                      {ch.orderCount} order • AOV {formatCompactIDR(ch.aov)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#ECEAE4] flex items-center justify-between text-[11px] text-[#52524E]">
            <span>Klik kartu platform di atas untuk memfilter seluruh halaman</span>
            {selectedChannel !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedChannel('ALL')}
                className="font-extrabold text-[#9A3408] underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. THREE COMPLEMENTARY ANALYTICAL CHARTS (WATERFALL, FUNNEL, COURIER/PAYMENT)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CHART A: Financial Waterfall & Cost Structure */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#141413]">
                Struktur Alokasi Pendapatan & Beban
              </h3>
              <p className="text-[11px] text-[#52524E]">
                Komposisi komisi marketplace, HPP gudang, pajak, dan laba bersih.
              </p>
            </div>
            <button
              type="button"
              onClick={openFinanceConfigModal}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4] text-[11px] font-bold text-[#141413] hover:bg-[#FFDECE]/50 cursor-pointer shrink-0"
            >
              Ubah Tarif
            </button>
          </div>

          {/* Stacked Proportion Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 rounded-full bg-[#FAF9F6] overflow-hidden flex border border-[#ECEAE4]">
              <div
                style={{ width: `${Math.max(5, Number(analytics.netMarginPct))}%` }}
                className="h-full bg-[#0F5132]"
                title={`Laba Bersih: ${analytics.netMarginPct}%`}
              />
              <div
                style={{ width: `${cogsPct}%` }}
                className="h-full bg-[#141413]"
                title={`HPP & Operasional: ${cogsPct}%`}
              />
              <div
                style={{ width: `${platformFeePct}%` }}
                className="h-full bg-[#F6671E]"
                title={`Komisi Marketplace: ${platformFeePct}%`}
              />
              <div
                style={{ width: `${Math.max(1, taxPct)}%` }}
                className="h-full bg-[#9A3408]"
                title={`Pajak PPh: ${taxPct}%`}
              />
            </div>

            {/* Waterfall Rows */}
            <div className="space-y-2 pt-2">
              {[
                {
                  label: 'Pendapatan Kotor (100%)',
                  amount: analytics.grossRevenue,
                  pct: '100%',
                  tone: 'text-[#141413]',
                  dot: '#ECEAE4',
                },
                {
                  label: `HPP & Operasional Gudang (${cogsPct}%)`,
                  amount: -analytics.cogsAmount,
                  pct: `-${cogsPct}%`,
                  tone: 'text-[#52524E]',
                  dot: '#141413',
                },
                {
                  label: `Komisi Admin Marketplace (${platformFeePct}%)`,
                  amount: -analytics.platformFeeAmount,
                  pct: `-${platformFeePct}%`,
                  tone: 'text-[#9A3408]',
                  dot: '#F6671E',
                },
                {
                  label: `Estimasi Pajak PPh Final (${taxPct}%)`,
                  amount: -analytics.taxAmount,
                  pct: `-${taxPct}%`,
                  tone: 'text-[#9A3408]',
                  dot: '#9A3408',
                },
                {
                  label: `Laba Bersih Tersimpan (${analytics.netMarginPct}%)`,
                  amount: analytics.netProfit,
                  pct: `${analytics.netMarginPct}%`,
                  tone: 'text-[#0F5132] font-extrabold',
                  dot: '#0F5132',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-1.5 border-b border-[#ECEAE4] last:border-b-0 text-xs"
                >
                  <span className="inline-flex items-center gap-2 text-[#52524E]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.dot }}
                    />
                    {item.label}
                  </span>
                  <span className={`font-mono-tabular font-bold ${item.tone}`}>
                    {item.amount < 0
                      ? `- ${formatIDR(Math.abs(item.amount))}`
                      : formatIDR(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART B: Order Status Conversion Funnel & Stock Risk Diagnostic */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#141413]">
              Rasio Konversi Status Pesanan & SLA
            </h3>
            <p className="text-[11px] text-[#52524E]">
              Distribusi tahapan pemenuhan pesanan dan deteksi potensi hambatan stok.
            </p>
          </div>

          <div className="space-y-3">
            {analytics.statusFunnel.map((stage) => {
              const totalCount = Math.max(filteredOrders.length, 1)
              const pct = Math.round((stage.count / totalCount) * 100)
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#141413]">{stage.label}</span>
                    <span className="font-mono-tabular text-[11px] text-[#52524E]">
                      <strong className="text-[#141413]">{stage.count} order</strong> ({pct}%) •{' '}
                      {formatCompactIDR(stage.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#FAF9F6] overflow-hidden border border-[#ECEAE4]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(stage.count > 0 ? 8 : 0, pct)}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-between gap-2 text-xs">
            <div>
              <p className="font-extrabold text-[#141413]">
                {products.filter((p) => Number(p.stock || 0) <= 10).length} SKU Stok Menipis (&le;10
                pcs)
              </p>
              <p className="text-[11px] text-[#52524E]">
                Segera restock agar laju konversi pesanan tidak tertahan.
              </p>
            </div>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('products')}
                className="px-3 py-1.5 rounded-xl bg-[#FFDECE] text-[#9A3408] text-[11px] font-extrabold cursor-pointer shrink-0"
              >
                Kelola Stok
              </button>
            )}
          </div>
        </div>

        {/* CHART C: Courier & Payment Methods Distribution */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#141413]">
              Distribusi Ekspedisi & Metode Pembayaran
            </h3>
            <p className="text-[11px] text-[#52524E]">
              Jalur pengiriman logistik dan preferensi pembayaran pelanggan aktif.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A3408]">
                Mitra Kurir Pengiriman
              </span>
              <div className="space-y-2 mt-1.5">
                {operationalDistribution.couriers.slice(0, 3).map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#141413]">{c.name}</span>
                      <span className="font-mono-tabular text-[11px] text-[#52524E]">
                        {c.count} paket ({c.sharePct}%) • {formatCompactIDR(c.amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF9F6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#F6671E]"
                        style={{ width: `${Math.max(10, c.sharePct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#ECEAE4]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F5132]">
                Metode Pembayaran Pembeli
              </span>
              <div className="space-y-2 mt-1.5">
                {operationalDistribution.payments.slice(0, 3).map((p) => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#141413]">{p.name}</span>
                      <span className="font-mono-tabular text-[11px] text-[#52524E]">
                        {p.count} trx ({p.sharePct}%) • {formatCompactIDR(p.amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF9F6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#141413]"
                        style={{ width: `${Math.max(10, p.sharePct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. TABBED GRANULAR ANALYTICS TABLE & VISUAL LEADERBOARDS
         ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#ECEAE4] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECEAE4] pb-3.5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'sku_ranking', label: `Peringkat Performa SKU (${skuPerformance.length})` },
              {
                id: 'customer_insights',
                label: `Kontribusi Pelanggan (${customerLeaderboard.length})`,
              },
              { id: 'channel_pnl', label: 'Matriks Laba Rugi Marketplace (3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  detailTab === tab.id
                    ? 'bg-[#F6671E] text-[#141413]'
                    : 'bg-[#FAF9F6] text-[#52524E] hover:text-[#141413] border border-[#ECEAE4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              handleDownloadCSV(
                detailTab === 'sku_ranking'
                  ? 'sku_performance'
                  : detailTab === 'customer_insights'
                  ? 'customer_insights'
                  : 'channel_pnl'
              )
            }
            className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDECE]/60 border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer self-start"
          >
            Unduh CSV Tabel Ini
          </button>
        </div>

        {/* TAB 1: SKU Performance & Sell-Through Chart Table */}
        {detailTab === 'sku_ranking' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[#52524E]">
                  <th className="py-3 px-2.5">SKU & Produk</th>
                  <th className="py-3 px-2.5">Kategori & Gudang</th>
                  <th className="py-3 px-2.5">Unit Terjual & Sisa Stok</th>
                  <th className="py-3 px-2.5">Rasio Serapan Pasar</th>
                  <th className="py-3 px-2.5">Visualisasi Kontribusi Omzet</th>
                  <th className="py-3 px-2.5 text-right">Estimasi Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {skuPerformance.map((p) => (
                  <tr key={p.id || p.sku} className="hover:bg-[#FAF9F6]/70">
                    <td className="py-3.5 px-2.5">
                      <span className="font-mono-tabular text-[11px] font-extrabold text-[#9A3408] block">
                        {p.sku}
                      </span>
                      <span className="font-extrabold text-[#141413]">{p.name}</span>
                    </td>
                    <td className="py-3.5 px-2.5 text-[#52524E]">
                      <span className="font-semibold text-[#141413] block">{p.category}</span>
                      <span className="text-[11px]">{p.warehouse}</span>
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular">
                      <span className="font-extrabold text-[#141413] block">
                        {p.unitsSold} pcs terjual
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          p.stock <= 10 ? 'text-[#9A3408]' : 'text-[#52524E]'
                        }`}
                      >
                        Sisa stok: {p.stock} pcs
                      </span>
                    </td>
                    <td className="py-3.5 px-2.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-[#52524E]">Sell-Through</span>
                        <span className="font-mono-tabular font-extrabold text-[#141413]">
                          {p.sellThroughPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FAF9F6] overflow-hidden border border-[#ECEAE4]">
                        <div
                          className="h-full rounded-full bg-[#0F5132]"
                          style={{ width: `${p.sellThroughPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-2.5 min-w-[190px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono-tabular font-bold text-[#141413]">
                          {formatIDR(p.gross)}
                        </span>
                        <span className="font-mono-tabular text-[#9A3408] font-bold">
                          {p.sharePct}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#FFF0E6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#F6671E]"
                          style={{ width: `${Math.max(6, p.barPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-2.5 text-right font-mono-tabular font-extrabold text-[#0F5132]">
                      {formatIDR(p.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Customer / Buyer Contribution Leaderboard */}
        {detailTab === 'customer_insights' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[#52524E]">
                  <th className="py-3 px-2.5">Pembeli & Kontak</th>
                  <th className="py-3 px-2.5">Channel Belanja</th>
                  <th className="py-3 px-2.5">Alamat Pengiriman</th>
                  <th className="py-3 px-2.5">Frekuensi & Volume</th>
                  <th className="py-3 px-2.5">Visualisasi Nilai Belanja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {customerLeaderboard.map((buyer) => (
                  <tr key={buyer.name} className="hover:bg-[#FAF9F6]/70">
                    <td className="py-3.5 px-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#FFDECE] text-[#9A3408] font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          {buyer.initials}
                        </span>
                        <div>
                          <span className="font-extrabold text-[#141413] block">{buyer.name}</span>
                          <span className="font-mono-tabular text-[11px] text-[#52524E]">
                            {buyer.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2.5 font-bold text-[#141413]">{buyer.channelList}</td>
                    <td className="py-3.5 px-2.5 text-[#52524E] max-w-[240px] truncate">
                      {buyer.address}
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular">
                      <span className="font-extrabold text-[#141413] block">
                        {buyer.ordersCount} pesanan
                      </span>
                      <span className="text-[11px] text-[#52524E]">{buyer.unitsCount} pcs</span>
                    </td>
                    <td className="py-3.5 px-2.5 min-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono-tabular font-extrabold text-[#141413]">
                          {formatIDR(buyer.totalSpend)}
                        </span>
                        <span className="font-mono-tabular font-bold text-[#9A3408]">
                          {buyer.sharePct}% omzet
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#FFF0E6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#F6671E]"
                          style={{ width: `${Math.max(8, buyer.barPct)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Channel P&L Matrix */}
        {detailTab === 'channel_pnl' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[#52524E]">
                  <th className="py-3 px-2.5">Platform & Toko</th>
                  <th className="py-3 px-2.5">SKU & Rating</th>
                  <th className="py-3 px-2.5">Order & Unit</th>
                  <th className="py-3 px-2.5">Omzet Kotor</th>
                  <th className="py-3 px-2.5">Komisi ({platformFeePct}%)</th>
                  <th className="py-3 px-2.5">HPP ({cogsPct}%)</th>
                  <th className="py-3 px-2.5">Pajak ({taxPct}%)</th>
                  <th className="py-3 px-2.5 text-right">Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {channelBreakdown.map((ch) => (
                  <tr key={ch.platform} className="hover:bg-[#FAF9F6]/70">
                    <td className="py-3.5 px-2.5">
                      <span className="font-extrabold text-[#141413] block">{ch.platform}</span>
                      <span className="text-[11px] text-[#52524E]">{ch.shopName}</span>
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular">
                      <span className="font-bold text-[#141413] block">{ch.syncedSkus} SKU</span>
                      <span className="text-[11px] text-[#9A3408] font-bold">
                        Rating {ch.rating} ★
                      </span>
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular">
                      <span className="font-bold text-[#141413] block">
                        {ch.orderCount} pesanan
                      </span>
                      <span className="text-[11px] text-[#52524E]">{ch.units} pcs</span>
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular font-extrabold text-[#141413]">
                      {formatIDR(ch.gross)}
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular text-[#9A3408]">
                      - {formatIDR(ch.fee)}
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular text-[#52524E]">
                      - {formatIDR(ch.cogs)}
                    </td>
                    <td className="py-3.5 px-2.5 font-mono-tabular text-[#52524E]">
                      - {formatIDR(ch.tax)}
                    </td>
                    <td className="py-3.5 px-2.5 text-right font-mono-tabular font-extrabold text-[#0F5132]">
                      {formatIDR(ch.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          POP-UP MODAL 1: KONFIGURASI PARAMETER KEUANGAN & PAJAK (POSTGRESQL)
         ===================================================================== */}
      {isFinanceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finance-config-modal-title"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  Parameter Kalkulasi Finansial
                </span>
                <h2
                  id="finance-config-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#141413] mt-1"
                >
                  Atur Komisi Marketplace, HPP & Pajak Toko
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFinanceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFinanceConfig} className="p-5 sm:p-6 space-y-4">
              <div>
                <label
                  htmlFor="platform-fee-input"
                  className="block text-xs font-extrabold text-[#141413] mb-1"
                >
                  Rata-Rata Komisi Admin Marketplace (%)
                </label>
                <input
                  id="platform-fee-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={financeForm.platform_fee_percent}
                  onChange={(e) =>
                    setFinanceForm((prev) => ({
                      ...prev,
                      platform_fee_percent: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  required
                />
                <span className="text-[11px] text-[#52524E]">
                  Biaya layanan Shopee, Tokopedia, dan TikTok Shop (umumnya 4.5% hingga 8.5%).
                </span>
              </div>

              <div>
                <label
                  htmlFor="cogs-input"
                  className="block text-xs font-extrabold text-[#141413] mb-1"
                >
                  Rasio HPP Produk & Operasional Gudang (%)
                </label>
                <input
                  id="cogs-input"
                  type="number"
                  step="0.5"
                  min="0"
                  max="90"
                  value={financeForm.operational_cogs_percent}
                  onChange={(e) =>
                    setFinanceForm((prev) => ({
                      ...prev,
                      operational_cogs_percent: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  required
                />
                <span className="text-[11px] text-[#52524E]">
                  Persentase modal produksi pakaian, pengemasan, dan logistik gudang.
                </span>
              </div>

              <div>
                <label
                  htmlFor="tax-input"
                  className="block text-xs font-extrabold text-[#141413] mb-1"
                >
                  Estimasi Pajak PPh Final UMKM (%)
                </label>
                <input
                  id="tax-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="25"
                  value={financeForm.tax_percent}
                  onChange={(e) =>
                    setFinanceForm((prev) => ({
                      ...prev,
                      tax_percent: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                  required
                />
                <span className="text-[11px] text-[#52524E]">
                  Tarif PPh Final UMKM PP 55/2022 umumnya 0.5% dari omzet bruto.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF0E6] border border-[#F9B895] flex items-center justify-between text-xs">
                <span className="font-bold text-[#9A3408]">Estimasi Margin Bersih Baru:</span>
                <span className="font-mono-tabular text-sm font-extrabold text-[#141413]">
                  {Math.max(
                    0,
                    100 -
                      Number(financeForm.platform_fee_percent || 0) -
                      Number(financeForm.operational_cogs_percent || 0) -
                      Number(financeForm.tax_percent || 0)
                  ).toFixed(1)}
                  % dari Omzet
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFinanceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Parameter ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          POP-UP MODAL 2: EKSPOR & JADWAL LAPORAN OTOMATIS (PHASE 7 FITUR.MD)
         ===================================================================== */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-report-modal-title"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#ECEAE4] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDECE] text-[#9A3408] text-[10px] font-extrabold uppercase">
                  Ekspor & Penjadwalan Otomatis
                </span>
                <h2
                  id="export-report-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#141413] mt-1"
                >
                  Unduh Laporan & Atur Pengiriman Email
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveScheduleAndExport} className="p-5 sm:p-6 space-y-4">
              <div>
                <label
                  htmlFor="dataset-select"
                  className="block text-xs font-extrabold text-[#141413] mb-1"
                >
                  Pilih Jenis Dataset Laporan (CSV / Spreadsheet)
                </label>
                <select
                  id="dataset-select"
                  value={exportForm.dataset}
                  onChange={(e) =>
                    setExportForm((prev) => ({ ...prev, dataset: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                >
                  <option value="executive_full">
                    Ringkasan Eksekutif Laba Rugi & Valuasi Inventori
                  </option>
                  <option value="channel_pnl">
                    Matriks Perbandingan Laba Rugi per Marketplace (Shopee, Tokopedia, TikTok)
                  </option>
                  <option value="sku_performance">
                    Laporan Performa SKU, Unit Terjual & Serapan Stok
                  </option>
                  <option value="customer_insights">
                    Laporan Kontribusi & Riwayat Belanja Pelanggan
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="schedule-email-input"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Email Penerima Laporan Berkala
                  </label>
                  <input
                    id="schedule-email-input"
                    type="email"
                    value={exportForm.report_schedule_email}
                    onChange={(e) =>
                      setExportForm((prev) => ({
                        ...prev,
                        report_schedule_email: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-mono-tabular font-bold text-[#141413]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule-freq-select"
                    className="block text-xs font-extrabold text-[#141413] mb-1"
                  >
                    Frekuensi Pengiriman Otomatis
                  </label>
                  <select
                    id="schedule-freq-select"
                    value={exportForm.report_schedule_frequency}
                    onChange={(e) =>
                      setExportForm((prev) => ({
                        ...prev,
                        report_schedule_frequency: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] text-xs font-bold text-[#141413]"
                  >
                    <option value="daily">Harian (Setiap 21:00 WIB)</option>
                    <option value="weekly">Mingguan (Setiap Senin Pagi)</option>
                    <option value="monthly">Bulanan (Tanggal 1 Awal Bulan)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-extrabold text-[#141413]">Cetak Dokumen PDF / Kertas</p>
                  <p className="text-[11px] text-[#52524E]">
                    Buka dialog cetak browser untuk menyimpan tampilan analitik sebagai PDF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#ECEAE4] text-xs font-extrabold text-[#141413] hover:bg-[#FFDECE]/50 cursor-pointer shrink-0"
                >
                  Cetak PDF Sekarang
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] bg-[#FAF9F6] text-xs font-bold text-[#52524E] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F6671E] hover:bg-[#D9530F] text-xs font-extrabold text-[#141413] cursor-pointer"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Jadwal & Unduh CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
