# Desain UI/UX — Sistem Pengelolaan dan Arsip Data BAZNAS

> **Dokumen ini adalah spesifikasi desain yang hidup (living document).** Diperbarui setelah setiap implementasi selesai.
> Terakhir direvisi: 2026-10-09 — mencerminkan implementasi Phase 1–2 (Beranda Hub, print wiring, notification panel, sidebar collapse, accessibility polish).

Dokumen ini merujuk langsung pada [sistem-informasi-baznas-PRD.md](sistem-informasi-baznas-PRD.md) untuk kebutuhan bisnis dan pada [BACKEND-PLAN.md](BACKEND-PLAN.md) untuk arsitektur data.

---

## 1. Visi Desain & Prinsip UX

Sistem Pengelolaan dan Arsip Data BAZNAS dirancang untuk mendukung operasional amil/petugas di lingkungan BAZNAS. Pendekatan desain mengutamakan:

1. **Human-Centered & Ramah Petugas Non-Teknis:** Antarmuka berbahasa Indonesia yang jelas, bebas jargon teknis rumit, dengan label form yang eksplisit dan petunjuk yang mudah dipahami.
2. **Kecepatan Entri & Pencarian Data (*Frictionless Input*):** Alur pencatatan dibuat seminimal mungkin klik, form mendukung navigasi *keyboard* (Tab & Enter), serta pencarian data muzakki/mustahik dalam hitungan detik.
3. **Kerapian Arsip & Otomatisasi Perhitungan:** Mengeliminasi kesalahan manual melalui kalkulator zakat otomatis (Zakat Profesi 2,5% & Zakat Fitrah) dan penomoran dokumen otomatis.
4. **Siap Cetak 1-Klik (*Print-Ready*):** Seluruh output penting (bukti tanda terima zakat, lembar disposisi, laporan realisasi RKAT, dan LPJ) memiliki tata letak cetak dokumen dinas standar A4/A5 yang rapi dan resmi. ✅ **Print dialog auto-trigger implemented (T5).**

---

## 2. Design System & Tokens

### 2.1. Palet Warna (Color Palette)

Palet warna mencerminkan identitas resmi BAZNAS dengan nuansa hijau islami yang sejuk, dipadukan aksen kuning keemasan yang melambangkan keberkahan dan transparansi:

| Kategori | Nama Token | Kode HEX | Tailwind Class | Penggunaan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | BAZNAS Green 800 | `#0F5132` | `bg-emerald-900` / `bg-[#0F5132]` | Header, sidebar aktif, tombol utama, kop dokumen |
| **Primary Light** | BAZNAS Green 600 | `#198754` | `bg-emerald-700` / `bg-[#198754]` | Hover state tombol utama, ikon aktif, badge sukses |
| **Primary Subtle** | BAZNAS Green 50 | `#E8F5E9` | `bg-emerald-50` | Latar kartu aktif, highlight baris tabel terpilih |
| **Accent / Gold** | BAZNAS Gold 500 | `#F59E0B` | `bg-amber-500` | Tombol aksi sekunder, badge peringatan, aksen grafik |
| **Accent Light** | BAZNAS Gold 100 | `#FEF3C7` | `bg-amber-100` | Latar notifikasi perhatian, badge pending |
| **Neutral Dark** | Slate 900 | `#0F172A` | `text-slate-900` | Teks judul utama, angka nominal penting |
| **Neutral Body** | Slate 700 | `#334155` | `text-slate-700` | Teks paragraf, label form, isi tabel |
| **Neutral Muted** | Slate 400 | `#94A3B8` | `text-slate-400` | Teks placeholder, caption, garis divider |
| **Neutral Light** | Slate 100 | `#F1F5F9` | `bg-slate-100` | Latar form input non-aktif, batas kontainer |
| **Background** | Pure White / Off-White | `#F8FAFC` | `bg-slate-50` | Latar belakang kanvas aplikasi |
| **Surface** | White | `#FFFFFF` | `bg-white` | Kartu konten, modal popup, tabel |
| **Danger / Tolak** | Rose 600 | `#E11D48` | `bg-rose-600` | Tombol batal/hapus, status ditolak, error form |
| **Success** | Emerald 600 | `#059669` | `bg-emerald-600` | Status disetujui, bukti terverifikasi |

> **Catatan Aksesibilitas:** Teks `text-baznas-gold-500` (`#F59E0B`) di atas putih memiliki rasio kontras ~2.8:1 yang **tidak memenuhi** standar WCAG AA (4.5:1). Untuk teks penting, gunakan `text-amber-600` atau `text-amber-700`. Gold 500 hanya untuk icon, badge, dan elemen dekoratif.

### 2.2. Tipografi (Typography)

Sistem menggunakan kombinasi dua font modern: **Poppins** untuk struktur judul (memberikan kesan berwibawa & terstruktur) dan **Inter** untuk keterbacaan data, tabel, dan formulir.

```
Font Headings: 'Poppins', sans-serif
Font Body/UI:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Font Numbers:  'Inter', tabular-nums (agar angka nominal pada tabel selalu sejajar)
```

| Skala Tipografi | Ukuran & Weight | Penerapan di Sistem |
| :--- | :--- | :--- |
| **Display 1** | `28px / 1.2` (Bold, Poppins) | Judul Beranda Pembuka, Total Akumulasi Keuangan Utama |
| **Heading 1** | `22px / 1.3` (SemiBold, Poppins) | Judul Halaman Kerja / Dashboard Bidang |
| **Heading 2** | `18px / 1.4` (SemiBold, Poppins) | Judul Seksi Kartu, Modal Dialog Title |
| **Heading 3** | `15px / 1.4` (Medium, Poppins) | Sub-header tabel, label kelompok data form |
| **Body Regular** | `14px / 1.5` (Regular, Inter) | Isi tabel, teks form input, deskripsi |
| **Body Medium** | `14px / 1.5` (Medium, Inter) | Label form, teks tombol navigasi, tab header |
| **Caption / Small** | `12px / 1.4` (Regular/Medium, Inter) | Badge status, timestamp, petunjuk helper input |
| **Monospace / Num** | `14px / 1.5` (Medium, Tabular-Nums) | Nomor NIK, No. Rekening, Nominal Rupiah (Rp) |

### 2.3. Sistem Spacing & Radius

- **Grid Spacing:** Berbasis 8px (`p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Corner Radius:**
  - Tombol & Form Input: `rounded-lg` (8px).
  - Kartu & Modal Panel: `rounded-xl` (12px).
  - Pill Badge Status: `rounded-full` (9999px).
- **Shadows:** Menggunakan *subtle soft shadows* (`shadow-sm` untuk kartu default, `shadow-md` untuk hover card, `shadow-xl` untuk modal & dropdown).

### 2.4. Global Focus Styles ✅ (Implemented)

```css
*:focus-visible {
  outline: 2px solid #0F5132;
  outline-offset: 2px;
  border-radius: 4px;
}
```

Diterapkan di `app/globals.css`. Berlaku untuk semua elemen interaktif (button, link, input, select, textarea).

---

## 3. Komponen Inti UI (Core Components)

### 3.1. Top Navigation Bar (Header Terpadu) ✅

Terpasang di bagian atas layar desktop:

1. **Sisi Kiri:** Logo BAZNAS (resmi hijau-kuning) + Teks *"Sistem Informasi & Arsip Data BAZNAS"*. **Tombol hamburger mobile** dengan `aria-label="Buka Navigasi"`.
2. **Sisi Tengah:** Kotak Pencarian Cepat Global (*Quick Search Omnibox*) dengan shortcut `Ctrl + K`. Mampu mencari nama muzakki, mustahik, nomor bukti setoran, atau nomor surat masuk dalam 1 kotak.
3. **Sisi Kanan:**
   - **Indikator Tanggal:** ⚠️ Saat ini hardcoded (`Rabu, 23 Sep 2026 / 11 Rabiul Awwal 1448 H`). Akan dibuat dinamis.
   - **Lonceng Notifikasi / Task Alerts:** ✅ **Real notification dropdown implemented.** Menampilkan badge angka merah dengan total tertunda. Klik membuka panel berisi:
     - "Permohonan Pencairan Dana" (count + navigasi ke Bidang II → tab Pencairan)
     - "Surat Masuk Belum Disposisi" (count + navigasi ke Bidang IV → tab Surat Masuk)
     - Footer "Tutup"
   - **Profil Pengguna:** Foto/Inisial Amil, Nama Petugas, Badge Bidang (misal: `Bidang I - Pengumpulan`), dan menu dropdown (*Ganti Password*, *Panduan*, *Keluar*).

### 3.2. Sidebar Navigasi Adaptif (Berdasarkan Hak Akses) ✅ (Mostly)

Sidebar adaptif dengan menu sesuai peran login:

**Status implementasi:**
- ✅ Role-based menu (Bidang I, II, III, IV, Ketua, Admin)
- ✅ Mobile drawer dengan overlay
- ✅ Active state highlighting dengan border + background
- ✅ **Beranda Utama** ditambahkan di paling atas (T2 implementasi)
- ✅ **Collapsible toggle** ditambahkan di footer (T4 implementasi) — toggle `w-64` ↔ `w-16` (icon-only)
- ✅ ARIA labels + `aria-current="page"` untuk active state

**Belum diimplementasi:**
- ⚠️ Per-bidang color theming di active state — saat ini seragam hijau BAZNAS (desain lama tidak konsisten). Sudah distandardisasi ke satu warna brand.

Struktur menu saat ini:

```
┌──────────────────────────────────────────────┐
│ [Home] Beranda Utama              ← T2 added │
├──────────────────────────────────────────────┤
│ LINTAS BIDANG                                │
│  ✦ Beranda Utama (Hub Lintas Bidang)         │
│  ✦ Profil Lembaga & Struktur Organisasi      │
│                                              │
│ BIDANG I — PENGUMPULAN                       │
│  ├─ Data Muzakki (Individu & Instansi)       │
│  ├─ Penerimaan ZIS-DSKL                      │
│  └─ Riwayat & Cetak Bukti Setoran            │
│                                              │
│ BIDANG II — PENDISTRIBUSIAN & PENDAYAGUNAAN  │
│  ├─ Data Mustahik & Kelayakan                │
│  ├─ Program Penyaluran (4 Pilar)             │
│  ├─ Permohonan & Persetujuan Pencairan       │
│  └─ Dokumentasi Bukti Penyaluran             │
│                                              │
│ BIDANG III — KEUANGAN                        │
│  ├─ RKAT Tahunan                             │
│  ├─ Realisasi Anggaran vs RKAT               │
│  ├─ Laporan Keuangan Otomatis                │
│  └─ Laporan Pertanggungjawaban (LPJ)         │
│                                              │
│ BIDANG IV — ADMINISTRASI, SDM & UMUM         │
│  ├─ Agenda Surat Masuk & Keluar              │
│  ├─ Lembar & Riwayat Disposisi               │
│  ├─ Repositori SOP BAZNAS                    │
│  ├─ Data Pegawai / Amil                      │
│  └─ Inventaris Aset Kantor                   │
│                                              │
│ PENGATURAN (Khusus Admin)                    │
│  ├─ Manajemen Akun & Hak Akses               │
│  └─ Cadangan & Pemulihan Data (Backup)       │
│                                              │
│ [⏴ Ciutkan Sidebar]                          │
└──────────────────────────────────────────────┘
```

### 3.3. Kartu Metrik Ringkasan (*Statistic Stat-Cards*) ✅

Menampilkan angka penting secara seketika pada Beranda dan masing-masing Bidang:
- **Ikon Berwarna:** Berlatar belakang bundar warna lembut (`bg-emerald-100 text-emerald-800` atau `bg-amber-100 text-amber-800`).
- **Judul Metrik:** Font berukuran kecil abu-abu (`text-xs text-slate-500 font-medium uppercase tracking-wider`).
- **Nilai Utama:** Angka besar tebal (`text-2xl font-bold text-slate-900 font-poppins`).
- **Keterangan Tren:** Teks perbandingan dengan bulan lalu atau target RKAT.

**Implementasi di Beranda (`BerandaView.tsx`):**
- Total ZIS Masuk
- Telah Disalurkan (% Pagu)
- Penerima Manfaat (Aktif)
- Saldo Kas Tersedia

### 3.4. Tabel Data Cerdas (*Smart Data Tables*) ✅ + Mobile Scroll

Komponen tabel standar untuk daftar Muzakki, Mustahik, Surat, dan Keuangan:
- **Toolbar Atas:** Search bar lokal, filter kategori instansi/bidang/status, dan tombol aksi utama (*Tambah Data*, *Export Excel*, *Cetak Daftar*).
- **Tampilan Data:** Spasi baris yang nyaman (`py-3`), batas garis halus (`border-slate-200`), dan efek hover baris (`hover:bg-slate-50`).
- **Status Badges:**
  - `Aktif` / `Disetujui`: Hijau muda (`bg-emerald-100 text-emerald-800`).
  - `Menunggu` / `Diajukan`: Kuning amber (`bg-amber-100 text-amber-800`).
  - `Ditolak` / `Nonaktif`: Merah mawar (`bg-rose-100 text-rose-800`).
  - `Arsip` / `Lulus`: Abu-abu netral (`bg-slate-100 text-slate-700`).
- **Kolom Aksi Kanan:** Tombol ikon ringkas (*Detail*, *Edit*, *Cetak Bukti*, *Hapus/Arsipkan*).

**Status Aksesibilitas:**
- ✅ Mobile horizontal scroll (T6) — semua 13 tabel di Bidang I/II/III/IV dibungkus `overflow-x-auto` + `min-w-[600px]`
- ✅ Modal close buttons (×) punya `aria-label="Tutup"`
- ✅ Icon-only action buttons punya `aria-label` (Edit, Hapus, Cetak, Detail)
- ⏳ Skeleton loading — belum diimplementasi (planned for Phase 3)

---

## 4. Alur Layar & Wireframe Antarmuka

### 4.1. Layar Beranda Pembuka (Home Hub Lintas Bidang) ✅ IMPLEMENTED

Halaman utama yang muncul seketika setelah amil berhasil login. **BerandaView.tsx** sekarang adalah komponen pertama yang dirender setelah `handleLoginSuccess`, dengan tombol **"Beranda Utama"** di Sidebar untuk kembali kapan saja.

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: [Logo BAZNAS]   [🔍 Cari Muzakki, Mustahik, No. Bukti... Ctrl+K]   [🔔 {total}] [👤 Amil] |
+----------------------------------------------------------------------------------------------------+
| SIDEBAR |  [Banner Selamat Datang — gradient baznas-green]                                       |
|         |  "Pusat Kendali Operasional Terpadu BAZNAS"                                            |
| [Menu]  |                                                                                          |
|         |  [ 4 PINTASAN BIDANG KERJA CEPAT ]                                                       |
|         |  +--------------------+ +--------------------+ +--------------------+ +----------------+ |
|         |  | 🏛 BIDANG I        | | 🤝 BIDANG II       | | 💰 BIDANG III      | | 📁 BIDANG IV   | |
|         |  | PENGUMPULAN        | | PENDISTRIBUSIAN    | | KEUANGAN & RKAT    | | ADM, SDM & ASET| |
|         |  | [Buka Dashboard →] | | [Buka Dashboard →] | | [Buka Dashboard →] | | [Buka Dashb. →]| |
|         |  +--------------------+ +--------------------+ +--------------------+ +----------------+ |
|         |                                                                                          |
|         |  [ RINGKASAN DATA REAL-TIME ]                                                            |
|         |  +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
|         |  | Total ZIS Masuk   | | Telah Disalurkan  | | Penerima Manfaat  | | Saldo Kas Tersedia| |
|         |  | Rp 1.482.350.000  | | Rp 1.120.400.000  | | 642 Jiwa / KK     | | Rp 361.950.000    | |
|         |  +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
|         |                                                                                          |
|         |  [ PENGINGAT TUGAS (2/3 kolom) ]            [ AKTIVITAS TERBARU (1/3 kolom) ]           |
|         |  ⚠ Permohonan pencairan dana butuh persetujuan    • Setoran ZIS Terkini (3 latest)    |
|         |  ✉ Surat masuk menunggu disposisi                 • Klik "Lihat Kwitansi Resmi" →      |
|         |                                                     auto-open print dialog             |
+----------------------------------------------------------------------------------------------------+
```

**State management:**
- `showBeranda: boolean` di `app/page.tsx` — `true` setelah login, `false` saat user pilih bidang
- Tombol **"Beranda Utama"** di Sidebar (icon Home, paling atas) → set `showBeranda(true)`
- Klik shortcut card di BerandaView → set `showBeranda(false)` + `setActiveRoleView(bidang)`

### 4.2. Form Input Penerimaan ZIS & Kalkulator Zakat Otomatis (Bidang I) ✅

Formulir yang dirancang agar kasir/amil loket dapat mencatat pembayaran dan mencetak tanda terima dalam waktu kurang dari 1 menit:

```
+----------------------------------------------------------------------------------------------------+
| BIDANG I / FORMULIR PENERIMAAN ZIS-DSKL                                                            |
+----------------------------------------------------------------------------------------------------+
|  1. DATA MUZAKKI                                                                                   |
|  Cari NIK / Nama Muzakki: [ [Ketik NIK atau Nama...] 🔍 ]  atau  [ + Muzakki Baru ]                |
|  Nama Lengkap : H. Hendra Setiawan              NIK      : 7171092801820003 (16-digit enforced)   |
|  Instansi/OPD : Dinas Pendidikan Daerah         No. WA   : 081234567890                            |
|                                                                                                    |
|  2. RINCIAN PEMBAYARAN                                                                             |
|  Jenis Penerimaan: (•) Zakat Profesi   ( ) Zakat Fitrah   ( ) Infaq/Sedekah   ( ) DSKL (Qurban)    |
|                                                                                                    |
|  [ KALKULATOR ZAKAT PROFESI OTOMATIS ]                                                             |
|  Penghasilan / Gaji Bulanan : [ Rp 10.000.000            ]                                         |
|  Persentase Standar         : [ 2,5 %                    ] (Terkunci otomatis)                     |
|  Kewajiban Zakat            : [ Rp    250.000            ]                                         |
|                                                                                                    |
|  Metode Bayar : (•) Tunai di Loket   ( ) Transfer Bank                                             |
|  Pilihan Rekening Bank : [ Bank Sulutgo - No. 001.02.11.000123.0  ▼ ]                              |
|  Tanggal Setor         : [ 23 / 09 / 2026 ]                                                        |
|  Keterangan / Niat     : [ Pembayaran Zakat Profesi Bulan September 2026                         ] |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | [ Batal ]                          [ Simpan Draft ]               [ 🖨 SIMPAN & CETAK BUKTI ] |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

**Status:**
- ✅ Auto-calculator Zakat Profesi 2,5%
- ✅ Multi-criteria filter (NIK, NPWZ, Desil, Instansi, Tipe)
- ✅ Dual-mode input (database select + manual typing)
- ⏳ NIK 16-digit validation — planned for next sprint
- ✅ Excel export + CSV import

### 4.3. Layar Pengajuan & Persetujuan Pencairan Dana (Bidang II & III) ✅

Alur verifikasi berjenjang untuk mencegah penyaluran dana yang tidak sesuai SOP:
- Tampilan dua tab: **Pengajuan Baru** dan **Daftar Permohonan**.
- Pada permohonan yang menunggu persetujuan (*Pending Approval*), pimpinan berwenang diberikan ringkasan:
  - Nama Program (misal: *Program Beasiswa BAZNAS Cerdas*).
  - Alokasi Pagu RKAT vs Realisasi yang sudah keluar.
  - Jumlah nominal yang diajukan beserta daftar mustahik penerima.
  - Dokumen pendukung (Surat permohonan mustahik, SKTM, proposal).
  - Dua tombol aksi tegas: `[ ✕ Tolak Permohonan ]` (dengan isian alasan wajib) dan `[ ✓ Setujui & Teruskan SPK ]`.

**Status workflow pencairan:**
```
diajukan → disetujui_ketua → dikonfirmasi_bidang2 → selesai
                  ↓
                ditolak
```

### 4.4. Halaman Profil Lembaga & Bagan Struktur Organisasi ⏳ PARTIAL

Menampilkan profil BAZNAS dan visualisasi relasi kepemimpinan:
- ✅ **Tab 1 — Profil:** Visi, Misi, Alamat Kantor, Rekening Resmi ZIS BAZNAS (read-only via `ProfilOrganisasiView.tsx`).
- ⏳ **Tab 2 — Bagan Struktur Organisasi:** Tree hierarchy view (Ketua → 4 Wakil Ketua → Staf). **Belum interaktif** — admin belum bisa edit. Akan diintegrasikan dengan `struktur_organisasi` table saat backend online.

---

## 5. Spesifikasi Dokumen Siap Cetak (Print & PDF Specs) ✅ IMPLEMENTED

Kemampuan cetak dokumen merupakan target kemenangan pertama sistem (*first win*). Semua layout cetak dirancang menggunakan CSS `@media print` murni sehingga dapat langsung dicetak rapi melalui dialog browser (`Ctrl + P`).

**Print wiring ✅:** Saat modal cetak dibuka, `window.print()` otomatis terpicu 500ms setelah modal render. Tombol "Cetak" manual di dalam modal tetap berfungsi untuk reprint.

### 5.1. Bukti Tanda Terima Setoran ZIS ✅ IMPLEMENTED

**File:** `src/components/print/KwitansiZisPrint.tsx`

Layout lengkap dengan:
- ✅ Kop BAZNAS resmi (logo "B" + nama lembaga + alamat)
- ✅ Nomor Bukti otomatis (format `BZ-YYYYMM-NNNNN`)
- ✅ Tanggal + metode pembayaran
- ✅ Identitas Muzakki (Nama, NPWZ, NIK, Instansi, Metode)
- ✅ Tabel rincian pembayaran dengan dasar nisab/gaji
- ✅ Terbilang otomatis (Indonesia currency words)
- ✅ Doa untuk Muzakki (Arabic + terjemahan)
- ✅ Dual signature (Muzakki + Petugas Amil)
- ✅ QR Code verifikasi keabsahan (visual)

**Ukuran:** A4 portrait, dengan `.print-page` class untuk clean output.

### 5.2. Lembar Disposisi Surat Dinas ✅ IMPLEMENTED

**File:** `src/components/print/DisposisiPrint.tsx`

Layout lengkap dengan:
- ✅ Kop BAZNAS + judul Lembar Disposisi
- ✅ Identitas surat (Asal, Nomor, Tanggal, Perihal)
- ✅ Checkbox Diteruskan Kepada (Waka I, II, III, IV, Sekretariat)
- ✅ Checkbox Petunjuk/Instruksi (Tindak lanjuti, Hadiri, Pelajari, Arsipkan, dst.)
- ✅ Kolom Catatan/Catatan Pimpinan (pre-filled dari `catatanArahan` field)
- ✅ Tanda tangan Ketua BAZNAS

**Ukuran:** A5 portrait.

### 5.3. Format Laporan Realisasi RKAT & Keuangan ✅ IMPLEMENTED

**File:** `src/components/print/LaporanKeuanganPrint.tsx`

Layout lengkap dengan:
- ✅ Kop BAZNAS + judul "Laporan Realisasi RKAT"
- ✅ Ringkasan 4 metrik (Total Pagu, Realisasi, Sisa, % Serapan)
- ✅ Tabel program per bidang dengan kolom (No, Kode, Nama Program, Pagu, Realisasi, Sisa, %)
- ✅ Total row dengan grand total
- ✅ Triple signature (Staf Akuntansi, Wakil Ketua III, Ketua BAZNAS)

**Ukuran:** A4 landscape (via `size: A4 landscape` CSS).

### 5.4. CSS Print Utilities

```css
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-page { box-shadow: none; border: none; margin: 0; padding: 0; width: 100%; }
  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  @page { size: auto; margin: 10mm; }
}
```

---

## 6. Pedoman Responsivitas & Aksesibilitas (Responsive & A11y Guidelines) ✅

### 6.1. Dukungan Layar

- **Desktop Kantor (1280px - 1920px):** Tata letak kerja utama dengan sidebar tetap, tabel lebar, dan multi-kolom form.
- **Tablet / Laptop Ringkas (768px - 1024px):** Sidebar otomatis berubah menjadi ikon / *drawer off-canvas*, tabel dilengkapi scroll horizontal halus. ✅
- **Smartphone (375px - 480px):** Diprioritaskan untuk fungsi peninjauan cepat, notifikasi persetujuan pimpinan saat dinas luar, dan pencarian cepat data mustahik/muzakki. ✅

### 6.2. Aksesibilitas & Keterbacaan ✅

- ✅ **Focus indicators:** Global `*:focus-visible` rule di `globals.css` — outline 2px solid `#0F5132` dengan offset 2px.
- ✅ **ARIA labels:** Icon-only buttons (hamburger, bell, close, edit, delete, print) memiliki `aria-label` yang sesuai.
- ✅ **Notification panel:** `role="menu"` + `role="menuitem"`, dengan `aria-haspopup` + `aria-expanded` di trigger.
- ✅ **Beranda navigation:** `aria-label="Buka Beranda Utama"` + `aria-current="page"` saat aktif.
- ✅ **Modal close buttons:** `aria-label="Tutup"`.
- ⚠️ **Color contrast:** Teks `text-baznas-gold-500` di atas putih **gagal WCAG AA** — gunakan `text-amber-600`/`text-amber-700` untuk teks penting.
- ✅ **Semantic HTML:** Header dengan `<header>`, navigation dengan `<nav>`, modal dengan `role="menu"`.

### 6.3. Penyimpanan Lokal & Performa

- ✅ Transisi halaman tanpa reload (Next.js client-side navigation).
- ⏳ **Skeleton loading** pada kartu metrik dan tabel — planned for Phase 3 (perlu refactor data fetch untuk async).
- ✅ Auto-print trigger 500ms after modal open (no flash, no blocking).

---

## 7. Rangkuman Pemetaan Fitur ke Komponen UI

| Bidang | Modul Utama | Komponen UI Utama | Status | Aksi Kunci |
| :--- | :--- | :--- | :--- | :--- |
| **Lintas Bidang** | Beranda & Hub | Stat-cards, Quick shortcuts, Task alerts | ✅ | Navigasi 1-klik ke bidang masing-masing |
| **Lintas Bidang** | Profil & Struktur | Content editor (read-only), Tree view | ⏳ | Update profil (admin only) |
| **Bidang I** | Data Muzakki | Data table per OPD, modal form muzakki | ✅ | Filter per instansi, riwayat setoran |
| **Bidang I** | Penerimaan ZIS | Form kalkulator ZIS, preview cetak A5 | ✅ | Hitung 2.5% otomatis, cetak bukti 1-klik |
| **Bidang II** | Data Mustahik | Data table dengan badge 4 pilar program | ✅ | Cek status kelayakan penerima manfaat |
| **Bidang II** | Penyaluran Dana | Wizard pengajuan pencairan, upload berkas | ✅ | Tracking SPK dan upload foto bantuan |
| **Bidang III** | RKAT & Keuangan | Progress bar realisasi anggaran, tabel rekap | ✅ | Cetak laporan keuangan & LPJ program |
| **Bidang IV** | Persuratan & Disposisi | Agenda surat masuk, modal disposisi arahan | ✅ | Buat lembar disposisi siap cetak |
| **Bidang IV** | Kepegawaian & Aset | Tabel personil amil, inventaris kantor | ✅ | Monitoring kondisi aset & riwayat amil |
| **Admin** | Manajemen Akun | User list table, role selector | ✅ | Tambah amil, reset password, backup data |

---

## 8. Riwayat Implementasi

### Phase 1 — Foundation & Print (Completed 2026-10-09)
- ✅ T1 — BerandaView wiring ke `app/page.tsx` (post-login landing)
- ✅ T2 — Beranda entry di Sidebar (icon Home, aria-label)
- ✅ T3 — Notification bell dropdown (per-category counts + navigation on click)
- ✅ T4 — Sidebar collapsible toggle (w-64 ↔ w-16, mobile-preserved)
- ✅ T5 — Auto-print dialog trigger (500ms after modal open)
- ✅ T6 — Mobile table horizontal scroll, focus indicators, ARIA labels
- ✅ Print components reviewed — KwitansiZisPrint, DisposisiPrint, LaporanKeuanganPrint

### Phase 2 — Backend Integration (Planned)
- ⏳ Schema migration (17 tables per `BACKEND-PLAN.md`)
- ⏳ API routes (35+ endpoints)
- ⏳ Better Auth integration
- ⏳ TanStack Query migration (replace `useState` with `useQuery`)
- ⏳ Real-time dashboard counters (replace hardcoded values in BerandaView)

### Phase 3 — Polish (Planned)
- ⏳ Skeleton loading components + integration in all views
- ⏳ Dynamic Hijriah date computation
- ⏳ NIK 16-digit validation
- ⏳ Interactive Org Chart with admin edit
- ⏳ Toast notifications (replace `alert()`)

### Phase 4 — Advanced (Planned)
- ⏳ Email notifications for pencairan approval
- ⏳ Audit log for sensitive operations
- ⏳ Data backup & restore per PRD Section 5
- ⏳ Photo upload for bukti penyaluran

---

## 9. Referensi Cepat

| Dokumen | Isi |
|---|---|
| [sistem-informasi-baznas-PRD.md](sistem-informasi-baznas-PRD.md) | Kebutuhan bisnis, user flow, 17-tabel database schema |
| [BACKEND-PLAN.md](BACKEND-PLAN.md) | Blueprint backend: Drizzle schema, API routes, auth, migration order |
| [DESIGN-IMPLEMENTATION-PLAN.md](DESIGN-IMPLEMENTATION-PLAN.md) | 14-task plan dengan file locations |
| [Tailwind Config](tailwind.config.ts) | Custom BAZNAS color tokens |
| [globals.css](app/globals.css) | Print utilities, focus styles, scrollbar styles |

---

*Dokumen ini adalah living document. Setiap perubahan UI/UX harus diupdate di sini sebelum/bersamaan dengan commit kode.*
