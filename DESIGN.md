# SyncCart: Design System & Visual Direction (`DESIGN.md`)

## 1. Brand Identity & Personality
- **Product**: SyncCart (Multi-Channel Commerce Orchestration Platform untuk Shopee, Tokopedia, dan TikTok Shop).
- **Tagline**: "Satu Dashboard, Semua Channel"
- **Visual Reference (Landing Page)**: Wingly Editorial Aesthetic (langit cerah bergradasi ke padang hijau limau di bagian bawah, tipografi display condensed huruf kapital berwarna Electric Lime, kartu mengambang berwarna karbon gelap `#161816`, serta ilustrasi garis tinta komik/doodle sayap, awan, dan burung kurir).
- **Visual Reference (Seller Dashboard)**: RentFlow Clean Operational Workspace (`#FFFFFF` permukaan kartu putih bersih di atas kanvas hangat `#F8F7F4`, `#F6671E` aksen utama Tangerine Orange, `#FFDECE` aksen sekunder Soft Peach, serta teks kontras tinggi `#141413` dan `#9A3408`).
- **Dial**: `ENERGY 3 / RHYTHM 3 / MOTION 2`

## 2. Color Palette (3 Core Colors + 1 Deliberate Accent: R-29)
### A. Public Landing Page Palette
- **Core 1: Atmospheric Sky Blue (`#1E5B94` ke `#22609A`)**: Latar atas hero yang memberikan kedalaman ruang dan kontras tinggi (`5.91:1` terhadap `#D9F951` dan `6.55:1` terhadap `#FFFFFF`).
- **Core 2: Matte Carbon (`#161816`)**: Permukaan kartu widget mengambang dan panel instrumen operasional (`14.98:1` dengan `#D9F951`, `17.85:1` dengan `#FFFFFF`).
- **Core 3: Meadow Alabaster & Forest Emerald (`#F4F7EE` & `#145A43`)**: Latar halaman konten yang tenang di mata serta aksen kartu virtual marketplace (`#111612` di `#F4F7EE` adalah `16.90:1`; `#FFFFFF` di `#145A43` adalah `8.16:1`).
- **Accent: Electric Lime Chartreuse (`#D9F951`)**: Digunakan secara terarah pada headline utama hero, tombol CTA utama, dan indikator status aktif.

### B. Seller Dashboard Palette (`media_1793184549294_31043bdd.png`)
- **Surface Primary (`#FFFFFF`) & Canvas (`#F8F7F4`)**: Permukaan kartu, sidebar, dan tabel putih bersih dengan tepi halus `#EBE8E0`.
- **Ink Primary (`#141413`) & Slate Secondary (`#52524E`)**: Teks utama dan angka metrik dengan rasio kontras WCAG AA/AAA (`18.43:1` dan `7.85:1` di atas `#FFFFFF`).
- **Primary Brand Accent (`#F6671E` Tangerine Orange) & Deep Burnt Orange (`#9A3408`)**: Digunakan untuk grafik batang utama, cincin donut Shopee, badge ikon utama, dan kartu upgrade sidebar (`#141413` di atas `#F6671E` adalah `6.04:1`; `#9A3408` di atas `#FFFFFF` adalah `7.32:1`).
- **Secondary Tint (`#FFDECE` Soft Peach)**: Digunakan untuk latar menu sidebar aktif, kapasitas grafik batang sekunder, dan badge aksen lembut (`#141413` di atas `#FFDECE` adalah `14.56:1`; `#9A3408` di atas `#FFDECE` adalah `5.78:1`).

## 3. Typography & Hierarchy (R-06, R-31)
- **Display Font (`Barlow Condensed`, 800-900 weight)**: Digunakan untuk headline utama landing page dan metrik KPI besar.
- **UI & Body Font (`Plus Jakarta Sans`, 400-700 weight)**: Dipilih karena keterbacaan optimal untuk navigasi sidebar, tabel pesanan, dan formulir operasional Seller.
- **Data & SKU Font (`JetBrains Mono`, `tabular-nums`)**: Digunakan khusus untuk kode SKU, ID pesanan (`ID: 22739`), nomor resi, dan nominal Rupiah agar angka sejajar vertikal.

## 4. One-Line Purpose Log (R-31 & Group 2 Purpose-Gate)
- **Why Asymmetric 8/4 Dashboard Grid on Seller Overview**: Menempatkan metrik analitik & tabel pesanan yang butuh pemindaian lebar di kolom kiri (8 kolom), sementara kartu katalog produk unggulan tersusun vertikal di kolom kanan (4 kolom) persis seperti referensi RentFlow.
- **Why Stacked Pill Bar Chart + Donut Chart in Seller Dashboard**: Grafik batang menjawab pertanyaan tren pesanan bulanan vs kapasitas stok (`Jan - Jul`), sedangkan grafik donut menjawab proporsi kontribusi omzet antar Shopee, Tokopedia, dan TikTok Shop.
- **Why Honest Initials Badges in Recent Orders Table (R-23)**: Menampilkan inisial nama pembeli nyata dari PostgreSQL (`DL`, `JK`, `RR`, `AS`, `RW`) tanpa menggunakan foto wajah stok atau potret AI palsu.
