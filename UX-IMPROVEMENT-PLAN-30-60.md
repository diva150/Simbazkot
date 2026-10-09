# Perencanaan Perbaikan UI/UX Simbazkot untuk Pengguna Usia 30-60

> **Tanggal:** 2026-10-09
> **Target pengguna:** Amil BAZNAS dan staf pemerintahan/lembaga berusia 30-60 tahun, Indonesia, dengan literasi digital rendah-menengah
> **Dasar riset:** WCAG 2.1/2.2, Nielsen Norman Group, Microsoft Inclusive Design Toolkit, Material Design 3, GOV.UK Design System, Permenpan RB No. 5/2020
> **Status:** Dokumen perencanaan. Belum ada perubahan kode.

---

## 1. Ringkasan Eksekutif

Audit terhadap aplikasi Simbazkot saat ini menunjukkan **banyak hambatan usability untuk pengguna usia 30-60**, terutama yang berusia 40 ke atas. Hambatan terbesar:

| No | Masalah | Dampak pada Amil | Prioritas |
|---|---|---|---|
| 1 | Teks terlalu kecil (10–11px) di 80+ lokasi | Sulit dibaca, mata cepat lelah | **KRITIS** |
| 2 | Tombol aksi < 36px (icon-only) | Susah diklik, salah klik | **KRITIS** |
| 3 | `alert()` dan `window.confirm()` untuk transaksi uang | Tidak bisa undo, memblokir layar, bukan konfirmasi | **KRITIS** |
| 4 | Persetujuan SPK tanpa konfirmasi | Risiko transaksi jutaan rupiah salah klik | **KRITIS** |
| 5 | Fokus hilang (outline dihapus di form) | Tidak bisa navigasi dengan keyboard | **TINGGI** |
| 6 | Bahasa/formalitas campur aduk | Bingung amil non-teknis | **TINGGI** |
| 7 | Filter tidak bisa di-reset | Tampilan kosong tanpa cara pulih | **TINGGI** |
| 8 | Empty/loading state tidak ada | Amil mengira sistem rusak | **SEDANG** |
| 9 | Kontras warna gold 500 gagal WCAG AA | Tidak terbaca di latar putih | **SEDANG** |

**Target akhir:** aplikasi yang bisa dipakai dengan nyaman oleh amil berusia 50+ dengan literasi digital rendah, sesuai dengan **WCAG 2.2 Level AA** (minimum yang disyaratkan Permenpan RB untuk SPBE) dan prinsip-prinsip **GOV.UK Design System**.

---

## 2. Standar Ukuran (Baku Desain Baru)

Sebelum memperbaiki per-bagian, tetapkan baku berikut yang akan dipakai konsisten di seluruh aplikasi:

### 2.1. Tipografi

| Elemen | Ukuran | Weight | Line-height | Keterangan |
|---|---|---|---|---|
| Body / paragraf | **16px** | 400 (regular) | 1.5× (24px) | Minimum absolut untuk konten |
| Body emphasized | 16px | 500 (medium) | 1.5× | Label tombol, sub-judul |
| Helper text | **14px** | 400 | 1.4× | Teks bantuan di bawah field |
| Caption | **13px** | 400 | 1.4× | Minimum untuk teks kecil |
| Heading H3 | 16px | 600 (semibold) | 1.4× | Judul kartu, modal |
| Heading H2 | 20px | 600 | 1.3× | Judul halaman |
| Heading H1 | 24px | 600 | 1.3× | Judul utama |
| Display | 28px | 700 | 1.2× | Angka statistik besar |
| **DILARANG** | < 13px | < 400 | - | Tidak boleh ada |

### 2.2. Ukuran Target Klik

| Elemen | Ukuran | Keterangan |
|---|---|---|
| Tombol primary | **48px** tinggi | BAZNAS green background, teks putih 16px medium |
| Tombol icon (visible) | **44×44px** | Icon di tengah, padding min 12px |
| Tombol tabel (edit/hapus/cetak) | **40px** tinggi | Padding 10px, icon 18px |
| Baris tabel | **56px** tinggi | Baris dengan 2 baris teks/angka |
| Item sidebar | **48px** tinggi | Icon 20px + label 15px medium |
| Item menu mobile | 56px | Tap-friendly |

### 2.3. Kontras Warna

| Pasangan | Rasio | Status |
|---|---|---|
| BAZNAS Green 800 (#0F5132) di putih | 9.1:1 | ✅ AAA |
| Slate 900 (#0F172A) di putih | 17.4:1 | ✅ AAA |
| Slate 700 (#334155) di putih | 10.4:1 | ✅ AAA |
| Slate 500 (#64748B) di putih | 4.6:1 | ✅ AA (min) |
| **Gold 500 (#F59E0B) di putih** | **2.9:1** | **❌ GAGAL AA** |
| Gold 600 (#D97706) di putih | 3.7:1 | ✅ AA (large text) |
| Gold 700 (#B45309) di putih | 4.9:1 | ✅ AA |
| Hijau sukses di putih | min 4.5:1 | Gunakan emerald-700 (#15803D) |
| Merah error di putih | min 4.5:1 | Gunakan red-700 (#B91C1C) |
| Amber warning di putih | min 4.5:1 | Gunakan amber-700 (#B45309) |

**Aturan:** `text-baznas-gold-500` diganti dengan `text-amber-600` (untuk teks) atau hanya untuk icon/garis dekoratif.

### 2.4. Spacing & Container

| Elemen | Nilai |
|---|---|
| Padding container (mobile) | 16px |
| Padding container (desktop) | 24–32px |
| Card padding | 20–24px |
| Jarak antar field dalam form | 16–20px |
| Jarak antar section | 24–32px |
| Border radius tombol | 8px (rounded-lg) |
| Border radius kartu | 12px (rounded-xl) |

---

## 3. Inventarisasi Masalah (dari Audit Kode)

### 3.1. CRITICAL — Transaksi Uang Tanpa Konfirmasi

**Lokasi:** `KetuaView.tsx:494-509` (Approve/Reject SPK)

**Masalah:** Klik tombol "Setujui SPK" langsung memutasi state tanpa konfirmasi. Untuk nominal Rp 18.000.000 ke atas, risiko salah klik sangat tinggi.

**Solusi:**
- Modal konfirmasi wajib dengan:
  - Ringkasan SPK (nomor, program, nominal, jumlah mustahik)
  - Pernyataan "Saya menyetujui pencairan dana Rp X untuk Y mustahik"
  - Checkbox konfirmasi "Saya telah memverifikasi dokumen pendukung"
  - 2 tombol: "Batal" + "Konfirmasi & Setujui"
- Untuk Reject: modal yang sama tapi field "Alasan Penolakan" wajib diisi (min 20 karakter)
- Audit trail: simpan `{action, user, timestamp, ip}` ke log

### 3.2. CRITICAL — `alert()` & `window.confirm()` di Banyak Lokasi

**Lokasi:**
- `Bidang1View.tsx:185, 315, 327, 1349` (alert)
- `Bidang2View.tsx:303` (window.confirm untuk hapus)
- `Bidang4View.tsx:841` (alert palsu "Dokumen resmi tersimpan aman")
- `Header.tsx` (validasi form edit akun)

**Masalah:** Dialog native browser memblokir layar, tidak bisa di-styling, tidak ada undo, tidak konsisten dengan bahasa aplikasi.

**Solusi:** Buat komponen `<Toast>` + `<ConfirmDialog>` reusable, ganti semua alert/confirm dengan itu.

```typescript
// Komponen baru di src/components/common/
// - Toast.tsx (success/error/info dengan auto-dismiss 5 detik + tombol Urungkan)
// - ConfirmDialog.tsx (modal konfirmasi dengan judul, pesan, tombol)
// - FormError.tsx (inline error di bawah field)
```

### 3.3. CRITICAL — Teks Terlalu Kecil (80+ Lokasi)

**Lokasi:** `text-[10px]` (80), `text-[11px]` (84), `text-xs` (398) di semua view.

**Masalah:** Untuk pengguna 50+, 10-12px sangat sulit dibaca. Standar minimum 13-14px untuk body text.

**Solusi (sweep global):**
- Ganti SEMUA `text-[10px]` → `text-xs` (12px → **13px minimum**, idealnya 14px) — khusus untuk badge/status: pakai 12-13px
- Ganti `text-[11px]` → `text-xs` (13px)
- Ganti `text-xs` (12px) → `text-sm` (14px) untuk body, pertahankan 12-13px untuk badge/label
- **Larangan keras:** tidak ada teks di bawah 12px

**File yang paling banyak:** `Bidang2View.tsx` (25× `text-[10px]`), `Bidang1View.tsx` (11×), `Bidang4View.tsx` (9×), `KetuaView.tsx` (9×).

### 3.4. CRITICAL — Tombol Icon-Only Terlalu Kecil

**Lokasi:**
- `Bidang2View.tsx:606, 614, 622, 899, 906, 913, 1190, 1197, 1204` (~24px tinggi)
- `KetuaView.tsx:354-356` (printer icon)
- `Header.tsx:171, 228, 465, 489`
- `Sidebar.tsx:131-133`

**Masalah:** Tap target < 30px sangat sulit diklik oleh pengguna 40+ dengan jari lebih besar atau presisi berkurang.

**Solusi:** Buat wrapper button 40×40 dengan icon 18px di tengah:

```tsx
// Before: <button className="p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
// After:
<button 
  className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
  aria-label="Hapus data mustahik"
>
  <Trash2 className="h-4 w-4" />
</button>
```

### 3.5. HIGH — Form Kompleks (Bidang 1 Setoran)

**Lokasi:** `Bidang1View.tsx:693-1115` (form setoran 420+ baris)

**Masalah:** 3 sub-tab × 2 mode (database/manual) × 3 kategori × 6+ field = banyak keputusan sebelum bisa simpan. Zakat Profesi auto-komputasi 2.5% yang bisa mengejutkan amil.

**Solusi:** Wizard 4 langkah (Stepper Pattern):
1. **Langkah 1: Pilih Muzakki** (cari atau tambah baru)
2. **Langkah 2: Pilih Jenis Zakat** (4 opsi visual sebagai kartu, bukan dropdown)
3. **Langkah 3: Hitung & Bayar** (auto-komputasi dengan slider, metode bayar, bank)
4. **Langkah 4: Konfirmasi & Simpan** (review semua data, checkbox "Data sudah benar", tombol "Simpan & Cetak")

Tombol "Kembali" di kiri, "Lanjut" di kanan, progress bar 1-4 di atas.

### 3.6. HIGH — Clickable Div Tanpa Aksesibilitas

**Lokasi:** `BerandaView.tsx:129-214` (4 kartu quick-pick)

**Masalah:** `<div onClick>` tidak bisa di-tab atau di-Enter. Tidak ada role="button" / tabindex.

**Solusi:** Ganti dengan `<button>` (atau tambahkan `role="button"`, `tabIndex={0}`, `onKeyDown` handler).

### 3.7. HIGH — Fokus Hilang di Form

**Lokasi:** Banyak form (10+ file) menggunakan `focus:outline-none` lalu hanya `focus:border-baznas-green-700`.

**Masalah:** Global `*:focus-visible` di `globals.css:83-86` ditimpa. Amil yang navigasi dengan keyboard (Tab) tidak tahu posisi kursor.

**Solusi:** Hapus SEMUA `focus:outline-none` dari form input. Biarkan global focus-visible aktif. Border focus yang lebih gelap sudah cukup, tapi tambahkan ring di beberapa tempat.

### 3.8. HIGH — Bahasa/Jargon Tidak Konsisten

**Lokasi:** Banyak view, istilah NPWZ, Desil, Asnaf, BAST, SPK, SKTM tidak dijelaskan.

**Solusi:** Tambahkan tooltip info (icon ⓘ) di samping jargon dengan popup penjelasan singkat. Contoh:
- "NPWZ (Nomor Pokok Wajib Zakat) — nomor unik yang diterbitkan BAZNAS untuk setiap muzakki"
- "Desil — klasifikasi ekonomi rumah tangga dari BPS (Desil 1 = termiskin, Desil 4 = rentan)"

### 3.9. MEDIUM — Empty/Loading States

**Lokasi:** Semua tabel (RKAT, muzakki, mustahik, surat, pencairan, dll.)

**Masalah:** Tidak ada skeleton, tidak ada empty state, tidak ada loading spinner.

**Solusi:** Komponen `<EmptyState>` dan `<SkeletonTable>` reusable.

### 3.10. MEDIUM — Filter Tidak Bisa Di-reset

**Lokasi:** `Bidang1View.tsx:549-611` (5 filter Muzakki)

**Masalah:** Jika amil over-filter, tabel kosong tanpa cara jelas untuk pulih.

**Solusi:** Tombol "Reset Filter" di kanan toolbar, badge "X filter aktif" yang bisa diklik untuk clear individual filter.

---

## 4. Rencana Implementasi per Fase

### FASE 1 — Fondasi Sistem (Minggu 1, 1 developer)

**Target:** Baku desain di §2 diterapkan secara global.

| Task | File | Detail |
|---|---|---|
| 1.1 | `tailwind.config.ts` | Tambahkan `fontSize: { 'xs': ['13px', ...] }`, `fontSize: { 'sm': ['14px', ...] }` |
| 1.2 | `app/globals.css` | Naikkan `body { font-size: 16px }` eksplisit, `line-height: 1.5` |
| 1.3 | `app/globals.css` | Pastikan `*:focus-visible` tidak ditimpa, hapus `focus:outline-none` dari form input |
| 1.4 | `src/components/common/Button.tsx` (baru) | Primary/Secondary/Danger/Ghost variants dengan min-h-12 |
| 1.5 | `src/components/common/Toast.tsx` (baru) | Toast component dengan auto-dismiss 5 detik + tombol Urungkan |
| 1.6 | `src/components/common/ConfirmDialog.tsx` (baru) | Modal konfirmasi reusable |
| 1.7 | `src/components/common/EmptyState.tsx` (baru) | Empty state dengan icon, judul, deskripsi, aksi |
| 1.8 | `src/components/common/SkeletonTable.tsx` (baru) | Loading skeleton dengan animation |

**Verifikasi:** Visual regression check di 1 modul penuh (Bidang I) sebelum lanjut.

### FASE 2 — Komponen Kritis (Minggu 2)

**Target:** KetuaView (persetujuan SPK) dan Bidang2View (mustahik) menjadi aman untuk amil.

| Task | File | Detail |
|---|---|---|
| 2.1 | `KetuaView.tsx:494-509` | Konfirmasi modal untuk Approve/Reject SPK (lihat §3.1) |
| 2.2 | `Bidang2View.tsx:303` | Ganti `window.confirm` dengan `<ConfirmDialog>` untuk hapus mustahik |
| 2.3 | `Bidang2View.tsx` | Sweep font size: `text-[10px]` → 13px, `text-[11px]` → 13px, `text-xs` (12) → `text-sm` (14) |
| 2.4 | `Bidang2View.tsx` | Tombol tabel edit/hapus/share: ubah ke 40×40 wrapper dengan icon 18px |
| 2.5 | `Bidang4View.tsx:841` | Hapus `alert()` palsu "Buka Berkas", ganti dengan toast atau implementasi file viewer |

**Verifikasi:** User testing dengan 2-3 amil sungguhan (50+, 55+, 60+).

### FASE 3 — Form Setoran Wizard (Minggu 3)

**Target:** Form setoran Bidang I menjadi lebih mudah untuk amil.

| Task | File | Detail |
|---|---|---|
| 3.1 | `Bidang1View.tsx:693-1115` | Refactor ke wizard 4 langkah dengan stepper (lihat §3.5) |
| 3.2 | `Bidang1View.tsx` | Pilih jenis zakat sebagai kartu visual (4 kartu), bukan dropdown |
| 3.3 | `Bidang1View.tsx:185,315,327,1349` | Ganti `alert()` dengan `<Toast>` |
| 3.4 | `Bidang1View.tsx:549-611` | Tombol "Reset Filter" + badge per filter |
| 3.5 | `Bidang1View.tsx` | Sweep font size |
| 3.6 | `Bidang1View.tsx` | Tombol tabel 40×40 |

### FASE 4 — Aksesibilitas & Polish (Minggu 4)

**Target:** Header, Sidebar, BerandaView, AdminView mengikuti baku.

| Task | File | Detail |
|---|---|---|
| 4.1 | `Header.tsx` | Logout button: 48px tinggi, label "Keluar" selalu visible, bukan icon-only |
| 4.2 | `Header.tsx` | Notification dropdown menu items: 56px tinggi, 14px body text |
| 4.3 | `Sidebar.tsx` | Item sidebar 48px tinggi, font 15px |
| 4.4 | `Sidebar.tsx` | Sub-menu items: 44px tinggi |
| 4.5 | `BerandaView.tsx:129-214` | Ganti `<div onClick>` dengan `<button>` |
| 4.6 | `BerandaView.tsx` | Quick-pick card labels: 14px bukan 11px |
| 4.7 | `AdminUserManagementView.tsx` | Password strength meter di edit-akun |
| 4.8 | Global | Ganti `text-baznas-gold-500` untuk teks → `text-amber-700`; pertahankan gold untuk icon/underline |

### FASE 5 — Dokumentasi & Panduan (Minggu 5)

| Task | File | Detail |
|---|---|---|
| 5.1 | `desain.md` | Update §2.1 (palet warna) dengan rasio kontras dan aturan baru |
| 5.2 | `desain.md` | Tambah §2.5 "Standar Tipografi Usia 40+" |
| 5.3 | `desain.md` | Tambah §2.6 "Standar Ukuran Klik" |
| 5.4 | `desain.md` | Tambah §6.3 "Panduan Bahasa & Jargon" |
| 5.5 | (baru) `PANDUAN_AMIL.md` | Quick-start 1 halaman untuk amil baru, screenshot tombol penting |

---

## 5. Komponen yang Akan Dibuat

```
src/components/common/
  Button.tsx           — Primary/Secondary/Danger/Ghost/Link variants
  Toast.tsx            — Auto-dismiss + Urungkan
  ConfirmDialog.tsx    — Modal konfirmasi
  EmptyState.tsx       — Empty state dengan icon + CTA
  SkeletonTable.tsx    — Loading skeleton (sudah ada)
  SkeletonCard.tsx     — Loading skeleton untuk stat card
  FormError.tsx        — Inline error/help text
  FormField.tsx        — Label + input + helper + error wrapper
  JargonTooltip.tsx    — Icon ⓘ dengan popup penjelasan
```

---

## 6. Metrik Keberhasilan

Sebelum implementasi, ukur baseline:

| Metrik | Cara Ukur | Target |
|---|---|---|
| Touch target compliance | Audit otomatis: cari button dengan `h-` < 10 | 0 violations |
| Font size compliance | Audit: cari `text-[10px]`, `text-[11px]`, `text-xs` | 0 violations (kecuali badge/label) |
| Color contrast | Lighthouse a11y audit | Skor ≥ 95 |
| Critical safety | Cek ada/tidaknya konfirmasi sebelum transaksi | 100% (semua mutasi uang) |
| Form completion | User test 5 amil, 1 form each, tanpa bantuan | ≥ 80% first-try success |
| Time to complete setoran | User test, stopwatch | ≤ 2 menit |
| WCAG 2.2 AA | Automated (axe-core) | 0 critical violations |

---

## 7. Yang TIDAK Akan Dilakukan (di Luar Scope)

Untuk menjaga scope tetap realistis, item berikut **tidak** masuk fase 1-5:

- Migrasi backend (lihat `BACKEND-PLAN.md` untuk itu)
- Re-branding logo BAZNAS
- Penerjemahan bahasa daerah
- Mobile native app (saat ini web-responsive cukup)
- Voice input / accessibility untuk tuna netra (akan jadi fase berikutnya)
- Dashboard analytics untuk admin (advanced charts)
- Offline mode / PWA

---

## 8. Referensi

- **Audit lengkap:** Lihat output agent di `~/.claude/.../tasks/ad6d16a25ee2aa123.output`
- **Riset UX:** Lihat output agent di `~/.claude/.../tasks/a961838cafa9ff1bf.output`
- **File terkait:**
  - `sistem-informasi-baznas-PRD.md` — kebutuhan bisnis
  - `desain.md` — spesifikasi desain (akan diupdate setelah fase 1)
  - `BACKEND-PLAN.md` — blueprint backend (di luar scope fase ini)
  - `DESIGN-IMPLEMENTATION-PLAN.md` — task list sebelumnya

---

## 9. Keputusan yang Perlu Persetujuan

Sebelum implementasi, mohon konfirmasi:

1. **Scope:** Apakah 5 fase di atas (5 minggu) sesuai dengan target? Atau perlu dipotong/diperluas?
2. **Warna gold:** Setuju ganti `text-baznas-gold-500` ke `text-amber-700` di teks (di mana WCAG AA gagal)?
3. **Auto-print:** Apakah amil sudah paham auto-print 500ms setelah modal terbuka? Atau perlu preview step dulu?
4. **Toast vs Modal konfirmasi:** Untuk transaksi non-keuangan (misal: simpan draft), pakai toast dengan tombol Urungkan. Untuk transaksi keuangan (setujui SPK, hapus data), pakai modal konfirmasi. Setuju?
5. **Panduan Amil:** Perlu dibuatkan 1 halaman panduan ringkas (`PANDUAN_AMIL.md`) atau cukup dokumentasi di `desain.md`?

Setelah persetujuan, saya akan mulai dari Fase 1 (fondasi sistem).
