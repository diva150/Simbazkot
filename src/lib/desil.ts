import type { DesilType, UserType } from "./types";

/**
 * Klasifikasi pengguna berdasarkan Desil (single source of truth).
 *
 * Aturan BAZNAS Kota Gorontalo:
 *   - Desil 1–5  → Mustahik  (penerima zakat / bantuan)
 *   - Desil 6–10 → Muzakki   (pemberi zakat / donatur)
 *
 * Dipakai di seluruh modul: Bidang I (Muzakki), Bidang II (Mustahik),
 * Ketua dashboard, Excel import, dan print kwitansi.
 */

export const MUSTAHIK_DESIL_BAND: [number, number] = [1, 5];
export const MUZAKKI_DESIL_BAND: [number, number] = [6, 10];

export const DESIL_OPTIONS: { value: DesilType; label: string }[] = [
  { value: "Desil 1",  label: "Desil 1 (Ekstrem)" },
  { value: "Desil 2",  label: "Desil 2 (Miskin)" },
  { value: "Desil 3",  label: "Desil 3 (Hampir Miskin)" },
  { value: "Desil 4",  label: "Desil 4 (Rentan)" },
  { value: "Desil 5",  label: "Desil 5 (Rentan / Produktif)" },
  { value: "Desil 6",  label: "Desil 6 (Menengah Bawah)" },
  { value: "Desil 7",  label: "Desil 7 (Menengah)" },
  { value: "Desil 8",  label: "Desil 8 (Mampu)" },
  { value: "Desil 9",  label: "Desil 9 (Mampu Atas)" },
  { value: "Desil 10", label: "Desil 10 (Kaya / Sangat Mampu)" },
];

/** Numerik 1–10 dari string desil. Return null jika tidak valid. */
export function desilNumber(desil: DesilType | undefined): number | null {
  if (!desil) return null;
  const m = /^Desil (\d+)$/.exec(desil);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : null;
}

/**
 * Klasifikasi utama: penerima (mustahik) atau pemberi (muzakki).
 * Default: jika desil tidak diketahui, dianggap "mustahik" (lebih aman).
 */
export function getUserType(desil: DesilType | undefined): UserType {
  const n = desilNumber(desil);
  if (n === null) return "mustahik";
  return n >= 6 ? "muzakki" : "mustahik";
}

export interface KlasifikasiInfo {
  type: UserType;
  label: string;        // "Mustahik" | "Muzakki"
  sublabel: string;     // "Penerima Manfaat" | "Pemberi Zakat"
  badgeClass: string;   // Tailwind classes (BAZNAS palette only)
  dotClass: string;     // untuk indicator dot
}

/**
 * Klasifikasi lengkap untuk badge / label / display.
 * BAZNAS palette — NO pastel, NO gradient.
 */
export function getKlasifikasi(desil: DesilType | undefined): KlasifikasiInfo {
  const type = getUserType(desil);
  if (type === "muzakki") {
    return {
      type: "muzakki",
      label: "Muzakki",
      sublabel: "Pemberi Zakat",
      badgeClass: "bg-baznas-paper border border-baznas-green-700 text-baznas-green-900",
      dotClass: "bg-baznas-green-700",
    };
  }
  return {
    type: "mustahik",
    label: "Mustahik",
    sublabel: "Penerima Manfaat",
    badgeClass: "bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/85",
    dotClass: "bg-baznas-gold-display",
  };
}

/**
 * Class untuk badge desil itu sendiri (angka, bukan klasifikasi).
 * 3-tier: 1 = gold accent (paling miskin), 2-5 = ink, 6-10 = green border.
 */
export function desilBadgeClass(desil: DesilType | undefined | string): string {
  const n = desilNumber(desil as DesilType);
  if (n === null) return "bg-baznas-paper border border-baznas-ink-12 text-baznas-ink/70";
  if (n === 1) return "bg-baznas-paper border border-baznas-gold-display text-baznas-ink";
  if (n <= 5) return "bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/85";
  if (n <= 8) return "bg-baznas-paper border border-baznas-green-600 text-baznas-green-900";
  return "bg-baznas-paper border border-baznas-green-800 text-baznas-green-900";
}

/**
 * Filter predicate — cocok untuk `.filter()` di tabel.
 *   filterByKlasifikasi(muzakkiList, "muzakki") → hanya Desil 6–10
 */
export function filterByKlasifikasi<T extends { desil?: DesilType }>(
  items: T[],
  type: UserType | "all",
): T[] {
  if (type === "all") return items;
  return items.filter((item) => getUserType(item.desil) === type);
}

/**
 * Kriteria tampilan untuk tab "Pengaturan" di Bidang II.
 * Setiap entry: label klasifikasi, rentang pendapatan, dan deskripsi singkat.
 */
export interface KriteriaDesil {
  desil: DesilType;
  klasifikasi: UserType;
  label: string;
  pendapatan: string;
  deskripsi: string;
}

export const KRITERIA_DESIL: KriteriaDesil[] = [
  {
    desil: "Desil 1",
    klasifikasi: "mustahik",
    label: "Desil 1 (Ekstrem)",
    pendapatan: "< Rp 500.000 / kapita / bulan",
    deskripsi: "Prioritas utama bantuan reguler dan bantuan darurat.",
  },
  {
    desil: "Desil 2",
    klasifikasi: "mustahik",
    label: "Desil 2 (Miskin)",
    pendapatan: "Rp 500.000 – Rp 800.000 / kapita",
    deskripsi: "Program bantuan pendidikan dan kesehatan dasar.",
  },
  {
    desil: "Desil 3",
    klasifikasi: "mustahik",
    label: "Desil 3 (Hampir Miskin)",
    pendapatan: "Rp 800.000 – Rp 1.200.000 / kapita",
    deskripsi: "Bantuan pendidikan, kesehatan, dan dakwah.",
  },
  {
    desil: "Desil 4",
    klasifikasi: "mustahik",
    label: "Desil 4 (Rentan)",
    pendapatan: "Rp 1.200.000 – Rp 1.500.000 / kapita",
    deskripsi: "Pendayagunaan ekonomi produktif dan vokasi.",
  },
  {
    desil: "Desil 5",
    klasifikasi: "mustahik",
    label: "Desil 5 (Rentan Produktif)",
    pendapatan: "Rp 1.500.000 – Rp 2.000.000 / kapita",
    deskripsi: "Batas atas penerima — fokus pada penguatan ekonomi.",
  },
  {
    desil: "Desil 6",
    klasifikasi: "muzakki",
    label: "Desil 6 (Menengah Bawah)",
    pendapatan: "Rp 2.000.000 – Rp 2.500.000 / kapita",
    deskripsi: "Mulai mampu — calon Muzakki (wajib zakat profesi 2,5%).",
  },
  {
    desil: "Desil 7",
    klasifikasi: "muzakki",
    label: "Desil 7 (Menengah)",
    pendapatan: "Rp 2.500.000 – Rp 3.500.000 / kapita",
    deskripsi: "Muzakki aktif — rutin setor zakat profesi / maal.",
  },
  {
    desil: "Desil 8",
    klasifikasi: "muzakki",
    label: "Desil 8 (Mampu)",
    pendapatan: "Rp 3.500.000 – Rp 5.000.000 / kapita",
    deskripsi: "Muzakki — zakat maal, infak terikat, dan sedekah.",
  },
  {
    desil: "Desil 9",
    klasifikasi: "muzakki",
    label: "Desil 9 (Mampu Atas)",
    pendapatan: "Rp 5.000.000 – Rp 7.500.000 / kapita",
    deskripsi: "Muzakki utama — kontribusi ZIS signifikan.",
  },
  {
    desil: "Desil 10",
    klasifikasi: "muzakki",
    label: "Desil 10 (Kaya / Sangat Mampu)",
    pendapatan: "> Rp 7.500.000 / kapita",
    deskripsi: "Muzakki institusional / high net-worth — donasi besar.",
  },
];
