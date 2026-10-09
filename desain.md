# Desain UI/UX — Sistem Pengelolaan dan Arsip Data BAZNAS

Dokumen spesifikasi desain antarmuka (UI) dan pengalaman pengguna (UX) ini disusun sebagai pedoman pengembangan tampilan sistem, merujuk langsung pada [sistem-informasi-baznas-PRD.md](file:///c:/xamppp/htdocs/webs/sistem-informasi-baznas-PRD.md).

---

## 1. Visi Desain & Prinsip UX

Sistem Pengelolaan dan Arsip Data BAZNAS dirancang untuk mendukung operasional amil/petugas di lingkungan BAZNAS. Pendekatan desain mengutamakan:

1. **Human-Centered & Ramah Petugas Non-Teknis:** Antarmuka berbahasa Indonesia yang jelas, bebas jargon teknis rumit, dengan label form yang eksplisit dan petunjuk yang mudah dipahami.
2. **Kecepatan Entri & Pencarian Data (*Frictionless Input*):** Alur pencatatan dibuat seminimal mungkin klik, form mendukung navigasi *keyboard* (Tab & Enter), serta pencarian data muzakki/mustahik dalam hitungan detik.
3. **Kerapian Arsip & Otomatisasi Perhitungan:** Mengeliminasi kesalahan manual melalui kalkulator zakat otomatis (Zakat Profesi 2,5% & Zakat Fitrah) dan penomoran dokumen otomatis.
4. **Siap Cetak 1-Klik (*Print-Ready*):** Seluruh output penting (bukti tanda terima zakat, lembar disposisi, laporan realisasi RKAT, dan LPJ) memiliki tata letak cetak dokumen dinas standar A4/A5 yang rapi dan resmi.

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

---

## 3. Komponen Inti UI (Core Components)

### 3.1. Top Navigation Bar (Header Terpadu)

Terpasang di bagian atas layar desktop:
1. **Sisi Kiri:** Logo BAZNAS (resmi hijau-kuning) + Teks *"Sistem Informasi & Arsip Data BAZNAS"*.
2. **Sisi Tengah:** Kotak Pencarian Cepat Global (*Quick Search Omnibox*) dengan shortcut `Ctrl + K`. Mampu mencari nama muzakki, mustahik, nomor bukti setoran, atau nomor surat masuk dalam 1 kotak.
3. **Sisi Kanan:**
   - **Indikator Tanggal:** Tanggal Masehi dan Hijriah aktif (mis. *23 September 2026 / 11 Rabiul Awwal 1448 H*).
   - **Lonceng Notifikasi / Task Alerts:** Menampilkan *badge* angka merah jika ada permohonan pencairan dana yang butuh persetujuan atau surat masuk yang belum ditindaklanjuti.
   - **Profil Pengguna:** Foto/Inisial Amil, Nama Petugas, Badge Bidang (misal: `Bidang I - Pengumpulan`), dan menu dropdown (*Ganti Password*, *Panduan*, *Keluar*).

### 3.2. Sidebar Navigasi Adaptif (Berdasarkan Hak Akses)

Sidebar dapat dilipat (*collapsible*) dan menampilkan menu sesuai peran login:

```
┌──────────────────────────────────────────────┐
│ [Logo BAZNAS] SIK-BAZNAS                     │
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
└──────────────────────────────────────────────┘
```

### 3.3. Kartu Metrik Ringkasan (*Statistic Stat-Cards*)

Menampilkan angka penting secara seketika pada Beranda dan masing-masing Bidang:
- **Ikon Berwarna:** Berlatar belakang bundar warna lembut (`bg-emerald-100 text-emerald-800` atau `bg-amber-100 text-amber-800`).
- **Judul Metrik:** Font berukuran kecil abu-abu (`text-xs text-slate-500 font-medium uppercase tracking-wider`).
- **Nilai Utama:** Angka besar tebal (`text-2xl font-bold text-slate-900 font-poppins`).
- **Keterangan Tren:** Teks perbandingan dengan bulan lalu atau target RKAT.

### 3.4. Tabel Data Cerdas (*Smart Data Tables*)

Komponen tabel standar untuk daftar Muzakki, Mustahik, Surat, dan Keuangan:
- **Toolbar Atas:** Search bar lokal, filter kategori instansi/bidang/status, dan tombol aksi utama (*Tambah Data*, *Export Excel*, *Cetak Daftar*).
- **Tampilan Data:** Spasi baris yang nyaman (`py-3`), batas garis halus (`border-slate-200`), dan efek hover baris (`hover:bg-slate-50`).
- **Status Badges:**
  - `Aktif` / `Disetujui`: Hijau muda (`bg-emerald-100 text-emerald-800`).
  - `Menunggu` / `Diajukan`: Kuning amber (`bg-amber-100 text-amber-800`).
  - `Ditolak` / `Nonaktif`: Merah mawar (`bg-rose-100 text-rose-800`).
  - `Arsip` / `Lulus`: Abu-abu netral (`bg-slate-100 text-slate-700`).
- **Kolom Aksi Kanan:** Tombol ikon ringkas (*Detail*, *Edit*, *Cetak Bukti*, *Hapus/Arsipkan*).

---

## 4. Alur Layar & Wireframe Antarmuka

### 4.1. Layar Beranda Pembuka (Home Hub Lintas Bidang)

Halaman utama yang muncul seketika setelah amil berhasil login:

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: [Logo BAZNAS]   [🔍 Cari Muzakki, Mustahik, No. Bukti... Ctrl+K]   [📅 23 Sep 2026] [👤 Amil] |
+----------------------------------------------------------------------------------------------------+
| SIDEBAR |  SELAMAT DATANG DI SISTEM INFORMASI BAZNAS                                               |
|         |  "Mengelola ZIS-DSKL Amanah, Transparan, dan Akuntabel"                                  |
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
|         |  | Total ZIS Masuk   | | Total Penyaluran  | | Mustahik Terbantu | | Saldo Kas Aktif   | |
|         |  | Rp 1.482.350.000  | | Rp 1.120.400.000  | | 642 Jiwa / KK     | | Rp 361.950.000    | |
|         |  +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
|         |                                                                                          |
|         |  [ PENGINGAT TUGAS & NOTIFIKASI ]             [ AKTIVITAS TERBARU ]                      |
|         |  ⚠ 2 Permohonan pencairan dana butuh persetujuan  • Bpk. H. Ahmad setor Zakat Rp 5.000.000   |
|         |  ✉ 1 Surat masuk dari Pemda menunggu disposisi     • Bantuan Pendidikan 15 Santri disalurkan |
+----------------------------------------------------------------------------------------------------+
```

### 4.2. Form Input Penerimaan ZIS & Kalkulator Zakat Otomatis (Bidang I)

Formulir yang dirancang agar kasir/amil loket dapat mencatat pembayaran dan mencetak tanda terima dalam waktu kurang dari 1 menit:

```
+----------------------------------------------------------------------------------------------------+
| BIDANG I / FORMULIR PENERIMAAN ZIS-DSKL                                                            |
+----------------------------------------------------------------------------------------------------+
|  1. DATA MUZAKKI                                                                                   |
|  Cari NIK / Nama Muzakki: [ [Ketik NIK atau Nama...] 🔍 ]  atau  [ + Muzakki Baru ]                |
|  Nama Lengkap : H. Hendra Setiawan              NIK      : 7171092801820003                        |
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

### 4.3. Layar Pengajuan & Persetujuan Pencairan Dana (Bidang II & III)

Alur verifikasi berjenjang untuk mencegah penyaluran dana yang tidak sesuai SOP:
- Tampilan dua tab: **Pengajuan Baru** dan **Daftar Permohonan**.
- Pada permohonan yang menunggu persetujuan (*Pending Approval*), pimpinan berwenang diberikan ringkasan:
  - Nama Program (misal: *Program Beasiswa BAZNAS Cerdas*).
  - Alokasi Pagu RKAT vs Realisasi yang sudah keluar.
  - Jumlah nominal yang diajukan beserta daftar mustahik penerima.
  - Dokumen pendukung (Surat permohonan mustahik, SKTM, proposal).
  - Dua tombol aksi tegas: `[ ✕ Tolak Permohonan ]` (dengan isian alasan wajib) dan `[ ✓ Setujui & Terbitkan SPK ]`.

### 4.4. Halaman Profil Lembaga & Bagan Struktur Organisasi Interaktif

Menampilkan profil BAZNAS dan visualisasi relasi kepemimpinan yang dapat diedit oleh Admin:
- **Tab 1 — Profil:** Visi, Misi, Sejarah, Alamat Kantor, Rekening Resmi ZIS BAZNAS.
- **Tab 2 — Bagan Struktur Organisasi:**
  - Ditampilkan dalam format diagram hierarki (*Tree Hierarchy Chart*):
    - **Pimpinan / Ketua BAZNAS**
    - **Wakil Ketua I (Pengumpulan)** -> Staf Amil Pelaksana Bidang I
    - **Wakil Ketua II (Pendistribusian & Pendayagunaan)** -> Staf Amil Pelaksana Bidang II
    - **Wakil Ketua III (Keuangan & Pelaporan)** -> Bendahara & Staf Akuntansi
    - **Wakil Ketua IV (Administrasi, SDM & Umum)** -> Staf Tata Usaha & Logistik
  - Tombol aksi admin: `[ + Tambah Personil / Jabatan ]`, `[ Urutkan Bagan ]`, dan `[ Edit Data Pejabat ]`.

---

## 5. Spesifikasi Dokumen Siap Cetak (Print & PDF Specs)

Kemampuan cetak dokumen merupakan target kemenangan pertama sistem (*first win*). Semua layout cetak dirancang menggunakan CSS `@media print` murni sehingga dapat langsung dicetak rapi melalui dialog browser (`Ctrl + P`) tanpa merusak format.

### 5.1. Bukti Tanda Terima Setoran ZIS (Ukuran 1/2 Halaman A4 atau Kertas Struk A5 Landscape)

```
+----------------------------------------------------------------------------------------------------+
|  BADAN AMIL ZAKAT NASIONAL (BAZNAS)                                   NO. BUKTI: BZ-202609-00142   |
|  Jl. Contoh Alamat Kantor BAZNAS No. 123                              TANGGAL  : 23 September 2026 |
|  Telp/WA: 0812-XXXX-XXXX | Email: info@baznas.go.id                   METODE   : Tunai di Loket    |
|----------------------------------------------------------------------------------------------------|
|  BUKTI PENERIMAAN ZAKAT, INFAQ, SEDEKAH & DSKL                                                     |
|                                                                                                    |
|  Telah diterima dari : Bpk. H. Hendra Setiawan                                                     |
|  NIK                 : 7171092801820003                                                            |
|  Instansi / OPD      : Dinas Pendidikan Daerah                                                     |
|  Alamat              : Lingkungan III, Kel. Sario, Kota Manado                                     |
|                                                                                                    |
|  RINCIAN PEMBAYARAN:                                                                               |
|  1. Zakat Profesi (Penghasilan Rp 10.000.000 x 2,5%) ......................... Rp     250.000      |
|  2. Infaq / Sedekah Terikat .................................................. Rp      50.000      |
|  ------------------------------------------------------------------------------------------------  |
|  TOTAL PEMBAYARAN ............................................................ Rp     300.000      |
|  Terbilang: "Tiga Ratus Ribu Rupiah"                                                               |
|                                                                                                    |
|  Doa untuk Muzakki:                                                                                |
|  "Aajarokallahu fiima a'thoita, wa baaraka fiima abqoita, waja'alahu laka thohuran."               |
|                                                                                                    |
|            Muzakki / Penyetor,                           Petugas Amil Penerima,                    |
|                                                                                                    |
|                                                                                                    |
|         ( H. Hendra Setiawan )                               ( Ahmad Fauzi, S.E )                  |
+----------------------------------------------------------------------------------------------------+
```

### 5.2. Lembar Disposisi Surat Dinas (Ukuran A5 Portrait)

Digunakan oleh Bidang IV untuk meneruskan instruksi pimpinan atas surat masuk:
- **Kop Surat:** Logo BAZNAS dan instansi.
- **Identitas Surat:** Asal Surat, Nomor Surat, Tanggal Masuk, Perihal.
- **Tabel Checklist Penerima Arahan:** Pilihan checkbox untuk Waka I, Waka II, Waka III, Waka IV, Sekretaris.
- **Instruksi Arahan:** Checkbox tindakan (*Tindak lanjuti*, *Hadiri/Wakili*, *Pelajari/Siapkan Telaah*, *Arsipkan*).
- **Kolom Catatan Pimpinan:** Ruang kosong bergaris untuk catatan tulisan tangan atau catatan digital yang sudah diketik sistem.

### 5.3. Format Laporan Realisasi RKAT & Keuangan (Ukuran A4 Landscape)

Digunakan oleh Bidang III untuk pelaporan resmi kepada pimpinan dan audit:
- Margin standar dokumen: 1.5 cm di setiap sisi.
- Tabel dengan kolom: No, Kode Akun/Bidang, Nama Program, Pagu RKAT (Rp), Realisasi s.d Bulan Ini (Rp), Selisih / Sisa Anggaran (Rp), dan % Pencapaian.
- Kolom tanda tangan di lembar penutup:
  - Mengetahui: Ketua BAZNAS
  - Diverifikasi: Wakil Ketua III (Bidang Keuangan)
  - Disusun oleh: Staf Akuntansi / Keuangan

---

## 6. Pedoman Responsivitas & Aksesibilitas (Responsive & A11y Guidelines)

1. **Dukungan Layar:**
   - **Desktop Kantor (1280px - 1920px):** Tata letak kerja utama dengan sidebar tetap, tabel lebar, dan multi-kolom form.
   - **Tablet / Laptop Ringkas (768px - 1024px):** Sidebar otomatis berubah menjadi ikon / *drawer off-canvas*, tabel dilengkapi scroll horizontal halus.
   - **Smartphone (375px - 480px):** Diprioritaskan untuk fungsi peninjauan cepat, notifikasi persetujuan pimpinan saat dinas luar, dan pencarian cepat data mustahik/muzakki.
2. **Aksesibilitas & Keterbacaan:**
   - Rasio kontras teks terhadap latar belakang minimal 4.5:1 (memenuhi standar WCAG AA). Teks di atas warna hijau BAZNAS selalu menggunakan putih murni (`#FFFFFF`).
   - Setiap elemen input memiliki `<label>` yang terhubung secara semantik (`htmlFor`).
   - Notifikasi sukses atau peringatan menggunakan teks eksplisit disertai ikon penjelas (tidak hanya mengandalkan perubahan warna).
3. **Penyimpanan Lokal & Performa:**
   - Transisi halaman tanpa reload (Next.js client-side navigation).
   - Indikator pemuatan data (*skeleton loading*) pada kartu metrik dan tabel untuk menjaga kenyamanan mata petugas.

---

## 7. Rangkuman Pemetaan Fitur ke Komponen UI

| Bidang | Modul Utama | Komponen UI Utama | Aksi Kunci |
| :--- | :--- | :--- | :--- |
| **Lintas Bidang** | Beranda & Hub | Stat-cards, Quick shortcuts, Task alerts | Navigasi 1-klik ke bidang masing-masing |
| **Lintas Bidang** | Profil & Struktur | Content editor, Interactive Org Chart | Update data profil & susunan amil |
| **Bidang I** | Data Muzakki | Data table per OPD, modal form muzakki | Filter per instansi, riwayat setoran |
| **Bidang I** | Penerimaan ZIS | Form kalkulator ZIS, preview cetak A5 | Hitung 2.5% otomatis, cetak bukti 1-klik |
| **Bidang II** | Data Mustahik | Data table dengan badge 4 pilar program | Cek status kelayakan penerima manfaat |
| **Bidang II** | Penyaluran Dana | Wizard pengajuan pencairan, upload berkas | Tracking SPK dan upload foto bantuan |
| **Bidang III** | RKAT & Keuangan | Progress bar realisasi anggaran, tabel rekap | Cetak laporan keuangan & LPJ program |
| **Bidang IV** | Persuratan & Disposisi | Agenda surat masuk, modal disposisi arahan | Buat lembar disposisi siap cetak |
| **Bidang IV** | Kepegawaian & Aset | Tabel personil amil, inventaris kantor | Monitoring kondisi aset & riwayat amil |
| **Admin** | Manajemen Akun | User list table, role selector (Admin, I-IV) | Tambah amil, reset password, backup data |
