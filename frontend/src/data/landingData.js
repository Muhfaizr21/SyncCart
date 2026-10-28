export const NAV_PAGES = [
  { id: 'beranda', label: 'Beranda', badge: null },
  { id: 'fitur', label: 'Fitur & Simulasi', badge: null },
  { id: 'cara-kerja', label: 'Cara Kerja', badge: null },
  { id: 'harga', label: 'Harga Paket', badge: null },
  { id: 'studi-kasus-faq', label: 'Studi Kasus & FAQ', badge: null },
]

export const PAIN_POINTS = [
  {
    id: 'tab-switching',
    painTitle: 'Buka Shopee, Tokopedia, dan TikTok satu-satu',
    painDetail: 'Login di banyak tab browser setiap pagi hanya untuk cek pesanan baru dan balas pembeli.',
    reliefTitle: 'Satu layar untuk semua channel',
    reliefDetail: 'Pesanan dari Shopee, Tokopedia, dan TikTok Shop langsung masuk ke satu antrean terpusat.',
    minutesSavedPerDay: 25,
  },
  {
    id: 'price-stock-mismatch',
    painTitle: 'Update harga dan stok manual berulang kali',
    painDetail: 'Ubah harga satu produk harus diedit tiga kali. Lupa satu platform berujung pembatalan pesanan.',
    reliefTitle: 'Ubah sekali, sinkron ke tiga marketplace',
    reliefDetail: 'Potong stok dan perbarui harga otomatis di semua toko saat ada transaksi masuk.',
    minutesSavedPerDay: 20,
  },
  {
    id: 'scattered-orders',
    painTitle: 'Resi dan biaya potongan tercecer',
    painDetail: 'Cetak label pengiriman dari tiga dashboard berbeda dan bingung menghitung laba bersih setelah biaya admin.',
    reliefTitle: 'Cetak resi massal & rekap net profit otomatis',
    reliefDetail: 'Generate resi JNE, J&T, SiCepat, dan Anteraja sekaligus, lengkap dengan potongan biaya per transaksi.',
    minutesSavedPerDay: 15,
  },
]

export const INITIAL_SYNC_PRODUCTS = [
  {
    sku: 'SC-KEMEJA-LINEN-01',
    name: 'Kemeja Linen Oversize Pria Sage',
    price: 149000,
    cost: 89000,
    stock: 24,
    channels: {
      shopee: { connected: true, syncedStock: 24, ordersToday: 9, feePercent: 6.5 },
      tokopedia: { connected: true, syncedStock: 24, ordersToday: 5, feePercent: 5.5 },
      tiktok: { connected: true, syncedStock: 24, ordersToday: 11, feePercent: 6.0 },
    },
  },
  {
    sku: 'SC-CELANA-CHINO-04',
    name: 'Celana Chino Stretch Slim Fit Cream',
    price: 185000,
    cost: 112000,
    stock: 7,
    channels: {
      shopee: { connected: true, syncedStock: 7, ordersToday: 6, feePercent: 6.5 },
      tokopedia: { connected: true, syncedStock: 7, ordersToday: 4, feePercent: 5.5 },
      tiktok: { connected: true, syncedStock: 7, ordersToday: 8, feePercent: 6.0 },
    },
  },
  {
    sku: 'SC-JAKET-PARKA-09',
    name: 'Jaket Parka Canvas Waterproof Olive',
    price: 279000,
    cost: 168000,
    stock: 3,
    channels: {
      shopee: { connected: true, syncedStock: 3, ordersToday: 3, feePercent: 6.5 },
      tokopedia: { connected: true, syncedStock: 3, ordersToday: 2, feePercent: 5.5 },
      tiktok: { connected: true, syncedStock: 3, ordersToday: 5, feePercent: 6.0 },
    },
  },
]

export const CORE_FEATURES = [
  {
    id: 'sync-otomatis',
    category: 'Sinkronisasi Produk, Order & Biaya',
    title: 'Buat Produk Sekali, Terbit di Tiga Marketplace',
    summary:
      'Tambah katalog, atur harga, dan jaga akurasi stok di Shopee, Tokopedia, serta TikTok Shop tanpa pindah tab.',
    highlights: [
      'Buat produk 1 kali di SyncCart, langsung publish ke 3 marketplace sekaligus',
      'Update harga di satu form, seluruh channel berubah otomatis',
      'Rekap potongan biaya admin marketplace agar Anda tahu net profit per pesanan',
    ],
    metricLabel: 'Target akurasi stok lintas channel',
    metricValue: 'Real-time / Webhook + Polling',
  },
  {
    id: 'dashboard-laporan',
    category: 'Dashboard & Analitik Penjualan',
    title: 'Pantau Omzet, Stok Menipis, dan Laba Bersih Sekejap Mata',
    summary:
      'Bandingkan performa Shopee vs Tokopedia vs TikTok Shop dari grafik harian, mingguan, dan bulanan.',
    highlights: [
      'Ringkasan order baru hari ini, total penjualan, dan peringatan stok hampir habis',
      'Analitik produk terlaris dan channel mana yang menghasilkan margin tertinggi',
      'Ekspor laporan keuangan dan penjualan ke format PDF atau Excel',
    ],
    metricLabel: 'Waktu cek laporan harian',
    metricValue: '5-10 menit setiap pagi & sore',
  },
  {
    id: 'kelola-tim',
    category: 'Manajemen Tim & Hak Akses (RBAC)',
    title: 'Undang Karyawan Tanpa Membagikan Password Utama Toko',
    summary:
      'Pisahkan akun login setiap staf dengan izin kerja yang spesifik dan rekaman log aktivitas lengkap.',
    highlights: [
      'Owner memegang akses penuh, staf hanya membuka modul sesuai tugasnya',
      'Atur staf khusus bagian lihat order, proses pengiriman, atau update katalog produk',
      'Keamanan ekstra dengan autentikasi dua faktor (2FA) dan audit log aktivitas staf',
    ],
    metricLabel: 'Kapasitas anggota tim',
    metricValue: 'Hingga 3 staf (Starter), 10 staf (Business), Unlimited (Enterprise)',
  },
  {
    id: 'integrasi-kurir',
    category: 'Integrasi Logistik & Cetak Label',
    title: 'Generate Resi JNE, J&T, SiCepat, dan Anteraja Sekali Klik',
    summary:
      'Input dan terbitkan nomor resi langsung dari SyncCart, panggil kurir pickup, dan cetak label pengiriman massal.',
    highlights: [
      'Terhubung ke ekspedisi utama: JNE, J&T, SiCepat, dan Anteraja',
      'Batch print shipping label untuk puluhan order sekaligus agar siap pickup',
      'Status pengiriman terupdate otomatis kembali ke marketplace asal pembeli',
    ],
    metricLabel: 'Waktu proses per pesanan',
    metricValue: '1-2 menit dari cek item hingga cetak label',
  },
]

export const ONBOARDING_STEPS = [
  {
    stepNumber: '01',
    title: 'Daftar Akun SyncCart',
    duration: '2 menit',
    description:
      'Buat akun kerja toko Anda menggunakan nama toko dan email aktif. Tanpa perlu kartu kredit untuk masa percobaan.',
    deliverable: 'Workspace toko siap digunakan',
  },
  {
    stepNumber: '02',
    title: 'Hubungkan Marketplace Resmi (OAuth)',
    duration: '3-5 menit per marketplace',
    description:
      'Login ke Shopee, Tokopedia, dan TikTok Shop melalui halaman otorisasi resmi untuk menyetujui akses sinkronisasi.',
    deliverable: 'Token terenkripsi AES-256 tersambung',
  },
  {
    stepNumber: '03',
    title: 'Impor atau Buat Katalog Produk',
    duration: '5-10 menit',
    description:
      'Tarik produk yang sudah ada di marketplace secara otomatis, atau buat produk baru di SyncCart lalu pilih channel tujuan.',
    deliverable: 'SKU terhubung lintas marketplace',
  },
  {
    stepNumber: '04',
    title: 'Terima Order & Cetak Resi Terpusat',
    duration: 'Langsung jalan',
    description:
      'Setiap pesanan masuk langsung tampil di dashboard. Cetak label dan input resi satu kali, semua marketplace ikut terupdate.',
    deliverable: 'Stok & status pesanan sinkron otomatis',
  },
]

export const DAILY_WORKFLOW_SCHEMAS = [
  {
    id: 'pagi',
    period: 'Rutinitas Pagi',
    duration: '10 Menit',
    manualDuration: '25 Menit (Manual 3 Aplikasi)',
    tasks: [
      'Buka 1 dashboard SyncCart tanpa login berulang di 3 tab berbeda',
      'Periksa jumlah pesanan baru yang masuk semalam dari Shopee, Tokopedia, dan TikTok',
      'Cek daftar peringatan stok yang hampir habis agar siap restock',
      'Lihat ringkasan produk paling laku dari penjualan kemarin',
    ],
  },
  {
    id: 'siang',
    period: 'Proses Order Harian',
    duration: '1-2 Menit / Order',
    manualDuration: '5-7 Menit / Order (Manual)',
    tasks: [
      'Klik pesanan yang masuk untuk mengecek item, alamat, dan status pembayaran',
      'Hubungi pembeli bila ada konfirmasi varian atau catatan pengiriman',
      'Generate resi kurir (JNE, J&T, SiCepat, Anteraja) dan cetak label batch',
      'Status pengiriman di marketplace asal berubah otomatis tanpa input ulang',
    ],
  },
  {
    id: 'sore',
    period: 'Evaluasi Sore',
    duration: '5 Menit',
    manualDuration: '20 Menit (Rekap Spreadsheet Manual)',
    tasks: [
      'Cek grafik laporan penjualan dan potongan biaya hari ini',
      'Sesuaikan harga promo satu kali jika diperlukan untuk semua marketplace',
      'Tambah stok barang masuk dari gudang atau supplier agar siap dijual besok',
    ],
  },
]

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    subtitle: 'Uji coba operasional dasar selama 14 hari (30 hari khusus promo Early Adopter).',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    priceDisplay: 'Gratis',
    periodDisplay: '14-30 hari masa percobaan',
    channelLimit: '1 marketplace terhubung',
    productLimit: 'Maksimal 50 produk',
    orderLimit: 'Hingga 100 order / bulan',
    staffLimit: '1 user (Owner saja)',
    syncInterval: 'Sinkronisasi standar',
    recommended: false,
    recommendReason: null,
    included: [
      '1 marketplace terhubung',
      'Maksimal 50 produk aktif',
      'Hingga 100 pesanan per bulan',
      'Dashboard ringkasan basic',
      'Notifikasi pesanan via email',
      'Akses forum komunitas seller',
    ],
    excluded: [
      'Anggota tim / staf tambahan',
      'Laporan keuangan & net profit detail',
      'Integrasi kurir & cetak resi batch',
      'Dukungan prioritas',
    ],
    ctaLabel: 'Mulai Uji Coba Gratis',
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    subtitle: 'Dirancang untuk seller awal yang mulai berjualan di 2 marketplace sekaligus.',
    monthlyPrice: 99000,
    annualMonthlyPrice: 79000,
    priceDisplay: 'Rp 99.000',
    periodDisplay: '/ bulan',
    channelLimit: 'Maksimal 2 marketplace',
    productLimit: 'Maksimal 500 produk',
    orderLimit: 'Hingga 1.000 order / bulan',
    staffLimit: 'Hingga 3 anggota staf',
    syncInterval: 'Auto-sync setiap 30 menit',
    recommended: false,
    recommendReason: null,
    included: [
      'Maksimal 2 marketplace terhubung',
      'Maksimal 500 produk & 1.000 order/bulan',
      'Dashboard lengkap dengan grafik penjualan',
      'Laporan dasar penjualan & produk',
      'Hingga 3 akun staf dengan hak akses terpisah',
      'Auto-sync setiap 30 menit',
      'Integrasi kurir & cetak label pengiriman',
      'Email support (estimasi respon 24 jam)',
    ],
    excluded: [
      'Webhook real-time instan',
      'Laporan keuangan & multi-warehouse',
      'Akses REST API untuk integrasi eksternal',
    ],
    ctaLabel: 'Pilih Paket Starter',
  },
  {
    id: 'business',
    name: 'Business Plan',
    subtitle: 'Untuk seller scale-up dengan 3+ marketplace, tim operasional, dan kebutuhan webhook.',
    monthlyPrice: 299000,
    annualMonthlyPrice: 239000,
    priceDisplay: 'Rp 299.000',
    periodDisplay: '/ bulan',
    channelLimit: 'Maksimal 5 marketplace',
    productLimit: 'Maksimal 5.000 produk',
    orderLimit: 'Hingga 10.000 order / bulan',
    staffLimit: 'Hingga 10 anggota staf',
    syncInterval: 'Webhook real-time + Auto-sync 15 menit',
    recommended: true,
    recommendReason: 'Pilihan utama untuk 3 marketplace + Webhook Real-time',
    included: [
      'Maksimal 5 marketplace & 5.000 produk',
      'Hingga 10.000 pesanan per bulan',
      'Webhook real-time + auto-sync setiap 15 menit',
      'Laporan lengkap: sales, produk, marketplace, keuangan',
      'Hingga 10 akun staf + pengaturan permission RBAC',
      'Dukungan multi-warehouse (gudang pusat & cabang)',
      'Ekspor laporan PDF/Excel & jadwal kirim email otomatis',
      'Akses REST API (OpenAPI/Swagger) & Priority Support (4 jam)',
    ],
    excluded: [
      'Dedicated account manager khusus',
      'On-site training & kustomisasi SLA korporat',
    ],
    ctaLabel: 'Ambil Promo Business (Hemat 20%)',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    subtitle: 'Solusi korporat untuk brand multi-toko dengan ratusan staf dan integrasi ERP khusus.',
    monthlyPrice: null,
    annualMonthlyPrice: null,
    priceDisplay: 'Custom',
    periodDisplay: 'Sesuai skala toko & gudang',
    channelLimit: 'Unlimited marketplace & multi-toko',
    productLimit: 'Unlimited produk',
    orderLimit: 'Unlimited order / bulan',
    staffLimit: 'Unlimited anggota staf',
    syncInterval: 'Real-time penuh (5 menit + Webhook)',
    recommended: false,
    recommendReason: null,
    included: [
      'Unlimited marketplace, produk, order, dan staf',
      'Dukungan multi-toko dari 1 dashboard korporat',
      'Auto-sync real-time (5 menit) & keamanan lanjutan',
      'Integrasi custom ke sistem ERP & akuntansi',
      'Dedicated Account Manager & dukungan telepon 24/7',
      'Laporan custom untuk rapat direksi & jaminan SLA',
      'Pelatihan langsung (training) untuk seluruh tim operasional',
    ],
    excluded: [],
    ctaLabel: 'Diskusikan Kebutuhan Enterprise',
  },
]

export const SELLER_USE_CASES = [
  {
    id: 'seller-baru',
    badge: 'Skenario 1 [ Contoh Profil Seller ]',
    personaName: 'Budi',
    initials: 'BD',
    role: 'Seller Baru (Mulai Jualan di 3 Platform)',
    challenge:
      'Ingin langsung berjualan di Shopee, Tokopedia, dan TikTok Shop sekaligus tanpa harus mempelajari tiga dashboard admin yang berbeda.',
    solutionSteps: [
      'Setup 1 dashboard SyncCart dan hubungkan 3 marketplace dalam 25 menit',
      'Unggah 10 produk pertama satu kali untuk langsung tayang di 3 channel',
      'Terima dan proses seluruh pesanan yang masuk dari satu layar terpadu',
    ],
    outcomeMetric: 'Hemat ~14-16 jam waktu admin setiap bulan',
    recommendedPlan: 'Starter Plan (Rp 99.000/bln)',
  },
  {
    id: 'seller-scaling',
    badge: 'Skenario 2 [ Contoh Studi Kasus ]',
    personaName: 'Lina & Tim Omnichannel',
    initials: 'LN',
    role: 'Fashion Seller (50+ Produk di 3 Marketplace)',
    challenge:
      'Sering terlambat memotong stok saat satu barang laku keras di satu platform, sehingga pesanan di platform lain terpaksa dibatalkan.',
    solutionSteps: [
      'Mengaktifkan sinkronisasi stok otomatis lintas Shopee, Tokopedia, dan TikTok',
      'Membagi tugas ke staf admin menggunakan permission RBAC terpisah',
      'Mengevaluasi marketplace mana yang memberi laba bersih tertinggi setiap minggu',
    ],
    outcomeMetric: 'Nol pembatalan akibat selisih stok & waktu proses 3x lebih ringkas',
    recommendedPlan: 'Business Plan (Rp 299.000/bln)',
  },
  {
    id: 'reseller-dropshipper',
    badge: 'Skenario 3 [ Contoh Profil Reseller ]',
    personaName: 'Citra',
    initials: 'CT',
    role: 'Reseller & Dropshipper (3 Supplier Berbeda)',
    challenge:
      'Mengelola ratusan varian barang dari 3 supplier berbeda sendirian sambil menjaga kecepatan pengiriman di bawah 24 jam.',
    solutionSteps: [
      'Menggabungkan inventori dari 3 supplier ke dalam satu katalog terpusat',
      'Mengandalkan peringatan stok menipis (low stock alert) untuk restock tepat waktu',
      'Memantau margin keuntungan bersih per produk setelah biaya admin marketplace',
    ],
    outcomeMetric: 'Mampu mengelola 500+ SKU tanpa staf tambahan',
    recommendedPlan: 'Starter / Business Plan',
  },
  {
    id: 'brand-enterprise',
    badge: 'Skenario 4 [ Contoh Profil Korporat ]',
    personaName: 'PT Fashion Nusantara',
    initials: 'FN',
    role: 'Brand Multi-Toko (5 Toko & Gudang Cabang)',
    challenge:
      'Membutuhkan visibilitas stok gudang pusat dan cabang secara serentak serta laporan yang terhubung langsung ke sistem ERP dan akuntansi.',
    solutionSteps: [
      'Mengelola 5 toko online dan fisik melalui 1 dashboard corporate',
      'Mengatur hak akses bertingkat (RBAC) untuk puluhan staf operasional dan gudang',
      'Menghubungkan REST API & Webhook SyncCart ke sistem akuntansi perusahaan',
    ],
    outcomeMetric: 'Laporan konsolidasi siap unduh dalam 1 klik untuk CFO',
    recommendedPlan: 'Enterprise Plan (Custom)',
  },
]

export const FAQ_ITEMS = [
  {
    id: 'faq-keamanan',
    category: 'Keamanan & Data',
    question: 'Apakah SyncCart aman? Bagaimana perlindungan token marketplace saya?',
    answer:
      'Token akses marketplace Anda dienkripsi menggunakan standar AES-256 dan seluruh komunikasi data berjalan di atas koneksi SSL/HTTPS dengan pencadangan (backup) harian. SyncCart menggunakan otorisasi resmi OAuth 2.0 sehingga kami hanya menyinkronkan produk, pesanan, resi, dan analitik. Kami tidak pernah memiliki akses untuk menarik dana dari saldo toko Anda, tidak mengambil data pribadi sensitif di luar kebutuhan pengiriman, dan tidak membagikan data toko Anda ke pihak ketiga.',
  },
  {
    id: 'faq-api-down',
    category: 'Teknis & Sinkronisasi',
    question: 'Bagaimana kalau API dari salah satu marketplace sedang error atau gangguan?',
    answer:
      'SyncCart dilengkapi mekanisme antrean (queue system) dan percobaan ulang otomatis (auto-retry). Jika API Shopee, Tokopedia, atau TikTok sedang melambat atau down, perubahan stok dan pesanan akan disimpan di antrean dan disinkronkan begitu koneksi pulih. Kami juga menggabungkan metode webhook dengan polling berkala serta menyediakan tombol Manual Sync Trigger dan notifikasi status.',
  },
  {
    id: 'faq-waktu-setup',
    category: 'Onboarding',
    question: 'Berapa lama waktu yang dibutuhkan untuk setup awal hingga siap jualan?',
    answer:
      'Untuk seller baru: daftar akun (2 menit), sambungkan Shopee, Tokopedia, dan TikTok melalui OAuth (masing-masing ~3 menit), lalu unggah 10 produk pertama (~10 menit) sehingga total sekitar 25 menit. Untuk seller lama yang sudah memiliki 100+ produk di marketplace, fitur impor otomatis memungkinkan seluruh katalog tertarik ke SyncCart dalam waktu sekitar 20 menit.',
  },
  {
    id: 'faq-cancel-data',
    category: 'Langganan & Tagihan',
    question: 'Kalau saya berhenti berlangganan (cancel subscription), bagaimana nasib data toko saya?',
    answer:
      'Anda dapat mengunduh seluruh katalog produk dan laporan riwayat transaksi ke dalam format Excel kapan saja. Setelah pembatalan, kami menyediakan masa tenggang (grace period) selama 14 hari jika Anda ingin mengaktifkan kembali akun tanpa kehilangan konfigurasi. Sesuai kebijakan privasi data, penghapusan permanen baru dilakukan setelah 30 hari tidak aktif.',
  },
  {
    id: 'faq-support',
    category: 'Layanan Bantuan',
    question: 'Apa saja jalur bantuan (support) yang tersedia jika saya mengalami kendala?',
    answer:
      'Paket Starter mendapatkan dukungan email (respon maksimal 24 jam), pusat panduan video, dan forum komunitas seller. Paket Business mendapatkan dukungan email prioritas (respon maksimal 4 jam), live chat pada jam kerja, serta sesi webinar bulanan. Paket Enterprise mendapatkan Dedicated Account Manager, dukungan telepon 24/7, dan pelatihan langsung untuk tim.',
  },
  {
    id: 'faq-hidden-fee',
    category: 'Langganan & Tagihan',
    question: 'Apakah ada biaya tambahan tersembunyi atau potongan komisi per transaksi?',
    answer:
      'Tidak ada. Harga yang tertera pada halaman paket adalah nominal yang Anda bayarkan. Tidak ada biaya setup awal, tidak ada potongan komisi dari omzet penjualan Anda, dan tidak ada biaya tambahan saat toko Anda sedang mengadakan kampanye promo besar. Anda bebas memilih tagihan bulanan atau tahunan dan dapat membatalkan kapan saja tanpa penalti kontrak.',
  },
  {
    id: 'faq-upgrade-downgrade',
    category: 'Langganan & Tagihan',
    question: 'Bagaimana perhitungan biaya jika saya upgrade atau downgrade paket di tengah bulan?',
    answer:
      'Jika Anda melakukan upgrade (misalnya dari Starter Rp 99.000 ke Business Rp 299.000 di pertengahan bulan), fitur baru langsung aktif detik itu juga dan Anda cukup membayar selisih prorata untuk sisa hari di bulan berjalan. Jika melakukan downgrade, perubahan paket dan penyesuaian batas kuota akan berlaku pada siklus tagihan bulan berikutnya.',
  },
  {
    id: 'faq-multi-toko',
    category: 'Teknis & Sinkronisasi',
    question: 'Apakah satu akun SyncCart bisa digunakan untuk mengelola beberapa toko berbeda?',
    answer:
      'Paket Starter mendukung 1 toko (hingga 2 marketplace) dan paket Business mendukung 1 toko yang terhubung hingga 5 marketplace sekaligus. Jika Anda memiliki beberapa entitas toko berbeda di satu marketplace yang sama, Anda dapat menggunakan Paket Enterprise yang mendukung multi-toko terpusat, atau membuka akun terpisah per entitas toko.',
  },
  {
    id: 'faq-api-docs',
    category: 'Teknis & Sinkronisasi',
    question: 'Apakah tersedia dokumentasi API untuk dihubungkan ke sistem ERP atau akuntansi kami?',
    answer:
      'Tersedia untuk pelanggan Business Plan dan Enterprise Plan. Kami menyediakan dokumentasi REST API berstandar OpenAPI/Swagger, dokumentasi Webhook real-time, serta contoh kode integrasi dalam bahasa Go, Node.js, Python, dan PHP untuk mempermudah sinkronisasi dengan sistem ERP atau pembukuan internal Anda.',
  },
  {
    id: 'faq-roadmap',
    category: 'Onboarding',
    question: 'Apa saja fitur yang sedang dikembangkan dalam peta jalan (roadmap) SyncCart?',
    answer:
      'Tahap Q1 menghadirkan integrasi toko resmi tambahan, notifikasi dan balasan chat via WhatsApp, serta modul manajemen retur/refund. Tahap Q2-Q3 mencakup aplikasi mobile iOS & Android, kotak masuk chat terpadu (marketplace + sosial media), manajemen supplier, integrasi aplikasi akuntansi lokal (seperti Jurnal dan Kledo), serta rekomendasi harga berbasis analitik.',
  },
]

export const ROADMAP_QUARTERS = [
  {
    quarter: 'Fase Q1',
    status: 'Dalam Pengembangan Aktif',
    items: [
      'Dukungan ekspansi channel Official Store tambahan',
      'Integrasi notifikasi dan komunikasi pesanan via WhatsApp',
      'Modul manajemen komplain, retur, dan pengembalian dana (refund)',
      'Analitik bagi hasil (revenue sharing) antar cabang atau mitra',
    ],
  },
  {
    quarter: 'Fase Q2 - Q3',
    status: 'Terjadwal Berikutnya',
    items: [
      'Aplikasi mobile SyncCart untuk iOS dan Android',
      'Kotak masuk chat terpadu (Shopee, Tokopedia, TikTok, dan pesan langsung)',
      'Modul manajemen pembelian dan stok supplier (Supplier Management)',
      'Integrasi langsung ke software akuntansi (Jurnal, Kledo)',
    ],
  },
  {
    quarter: 'Fase Q4 & Selanjutnya',
    status: 'Rencana Jangka Panjang',
    items: [
      'Dukungan marketplace regional Asia Tenggara (Malaysia & sekitarnya)',
      'Fitur pengelolaan grosir B2B (Wholesale)',
      'Solusi White-Label khusus jaringan korporat besar',
    ],
  },
]

