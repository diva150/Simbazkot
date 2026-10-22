/**
 * landing-data — static content for the public BAZNAS landing page.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The landing page was a single 1,345-line `PublicLandingView.tsx` with every
 * photo URL, pilar description, testimonial and FAQ answer inlined into the
 * component body. That made the file impossible to diff, impossible for two
 * people to edit at once, and — worse — it let copy drift between the two
 * places a pilar is described (the "Tentang" grid and the "Program" cards).
 *
 * Pulling the content out here means the twelve section components are pure
 * layout: they decide *where* something goes, this file decides *what* it says.
 *
 * RULES FOR EDITING
 * -----------------
 * 1. All copy is Bahasa Indonesia in an institutional tone — BAZNAS is a
 *    government body, not a startup.
 * 2. Region is **BAZNAS Kota Gorontalo, Provinsi Gorontalo**. Phone code
 *    (0435), NIK prefix 7571, bank partner **Bank Sulutgo**.
 * 3. NEVER invent a statistic. Every figure here is either a literal already
 *    published on the old landing page, or is read back out of an existing
 *    record (see `PILLAR_DETAIL` below, which derives its `statLine` from
 *    `PROGRAM_UNGGULAN` so the two can never disagree). Live figures that an
 *    admin can edit arrive via the `BerandaContent` prop instead.
 * 4. This module has no JSX and no hooks — it does not need `"use client"`,
 *    so it can be imported from server or client components alike.
 *
 * IMPORT
 * ------
 *   import { SECTION_IDS, PILAR_DETAIL, CARA_BERZAKAT_STEPS } from
 *     "@/components/public/landing/landing-data";
 */

import {
  Calculator,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Landmark,
  FileCheck2,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
 * SECTION REGISTRY
 * The single source of truth for anchor ids. The navbar scroll-spy, the
 * footer link list and every `<Section id=…>` must all agree — so they all
 * read from here rather than hand-typing strings.
 * ──────────────────────────────────────────────────────────────────────── */

export const SECTION_IDS = [
  "hero",
  "kalkulator",
  "cara-berzakat",
  "tentang",
  "program",
  "struktur",
  "testimoni",
  "faq",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface NavLink {
  /** Anchor id — must be a member of `SECTION_IDS`. */
  id: SectionId;
  label: string;
}

/**
 * Navbar / footer link list.
 *
 * ⚠ INTEGRATION NOTE for whoever wires this into `PublicNavbar`: its
 * `handleNavigateSection` special-cases the string `"beranda"` to scroll to
 * the top of the page. Here the hero anchor is called `"hero"`, so either
 * add `"hero"` to that special case or map `id === "hero"` → scroll to 0.
 */
export const NAV_LINKS: NavLink[] = [
  { id: "hero", label: "Beranda" },
  { id: "tentang", label: "Tentang" },
  { id: "program", label: "Program" },
  { id: "struktur", label: "Struktur" },
  { id: "faq", label: "FAQ" },
];

/* ────────────────────────────────────────────────────────────────────────
 * PHOTOS
 * Remote editorial photography for the program cards. Kept as-is from the
 * previous landing build so the visual identity does not change mid-rebuild;
 * each `<img>` must still ship an `onError` fallback because a third-party
 * CDN going down should degrade to the card, not to a broken icon.
 * ──────────────────────────────────────────────────────────────────────── */

export type PilarKey = "cerdas" | "sehat" | "makmur" | "peduli";

export const PROGRAM_PHOTOS: Record<PilarKey, string> = {
  cerdas:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
  sehat:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
  makmur:
    "https://images.unsplash.com/photo-1556746769-d4c2f5d3a3ff?auto=format&fit=crop&w=600&q=80",
  peduli:
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
};

/* ────────────────────────────────────────────────────────────────────────
 * EMPAT PILAR
 * ──────────────────────────────────────────────────────────────────────── */

export interface Pilar {
  key: PilarKey;
  /** Short Indonesian label — "Cerdas", "Sehat", … */
  label: string;
  /** Formal program name — "BAZNAS Cerdas". */
  title: string;
  desc: string;
  icon: LucideIcon;
}

/**
 * The four pillars, in the order the-icons-were-originally-declared.
 * NOTE: every entry carries a `title` — the old inline list omitted it for
 * "peduli" and the component had to branch on `key` to invent one. Typed as a
 * uniform `Pilar[]` so that fallback can never come back.
 */
export const PILAR_PROGRAM: Pilar[] = [
  {
    key: "cerdas",
    label: "Cerdas",
    title: "BAZNAS Cerdas",
    desc: "Beasiswa pendidikan untuk santri, siswa, dan mahasiswa dari keluarga kurang mampu.",
    icon: GraduationCap,
  },
  {
    key: "sehat",
    label: "Sehat",
    title: "BAZNAS Sehat",
    desc: "Bantuan biaya kesehatan, ambulance dhuafa, dan operasi katarak gratis.",
    icon: Stethoscope,
  },
  {
    key: "peduli",
    label: "Peduli",
    title: "BAZNAS Peduli",
    desc: "Bantuan sosial kemanusiaan untuk masyarakat terdampak bencana dan kaum dhuafa.",
    icon: HeartHandshake,
  },
  {
    key: "makmur",
    label: "Makmur",
    title: "BAZNAS Mandiri",
    desc: "Modal usaha mikro, pelatihan vokasi, dan pendampingan menuju kemandirian ekonomi.",
    icon: Briefcase,
  },
];

export interface ProgramUnggulan {
  key: PilarKey;
  title: string;
  /** Sasaran penerima, e.g. "150 Santri & Siswa". */
  target: string;
  desc: string;
  photo: string;
  /** Pagu anggaran 2026, e.g. "Rp 180 jt". */
  pagu: string;
}

export const PROGRAM_UNGGULAN: ProgramUnggulan[] = [
  {
    key: "cerdas",
    title: "BAZNAS Cerdas",
    target: "150 Santri & Siswa",
    desc: "Beasiswa penuh untuk pendidikan formal dan pesantren selama satu tahun ajaran.",
    photo: PROGRAM_PHOTOS.cerdas,
    pagu: "Rp 180 jt",
  },
  {
    key: "sehat",
    title: "BAZNAS Sehat",
    target: "210 Pasien SKTM",
    desc: "Bantuan biaya rawat inap, operasi katarak, dan ambulance dhuafa 24 jam.",
    photo: PROGRAM_PHOTOS.sehat,
    pagu: "Rp 95 jt",
  },
  {
    key: "makmur",
    title: "BAZNAS Mandiri",
    target: "30 Pelaku UMKM",
    desc: "Modal usaha mikro Z-Mart, pendampingan bisnis, dan akses pasar untuk mustahik produktif.",
    photo: PROGRAM_PHOTOS.makmur,
    pagu: "Rp 150 jt",
  },
  {
    key: "peduli",
    title: "BAZNAS Peduli",
    target: "500 KK Terdampak",
    desc: "Bantuan tanggap bencana, paket Ramadhan, dan qurban untuk masyarakat prasejahtera.",
    photo: PROGRAM_PHOTOS.peduli,
    pagu: "Rp 110 jt",
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * PILLAR_DETAIL — the richer, "Tentang"-section flavour of the same data
 *
 * WHY IT IS DERIVED INSTEAD OF HAND-WRITTEN
 * -----------------------------------------
 * The old landing described each pilar twice (once in the "Tentang" grid, once in
 * the program cards) with slightly different figures — the program cards even
 * ordered them differently from the pilar grid, so "Pilar 01" meant a
 * different pilar depending on which block you were looking at. Here the
 * long-form `desc` is the only authored text, and `statLine` is read straight
 * out of `PROGRAM_UNGGULAN` at module load. Edit a figure in one place and
 * both surfaces move together.
 * ──────────────────────────────────────────────────────────────────────── */

export interface PilarDetail extends Pilar {
  /** One-line summary carrying the published figure, e.g. "150 Santri & Siswa · Pagu Rp 180 jt". */
  statLine: string;
}

const PILAR_LONG_DESC: Record<PilarKey, string> = {
  cerdas:
    "Beasiswa pendidikan untuk santri, siswa, dan mahasiswa dari keluarga prasejahtera — mencakup biaya kuliah, asrama, hingga perlengkapan belajar.",
  sehat:
    "Bantuan biaya kesehatan, ambulance dhuafa 24 jam, dan operasi katarak gratis bagi mustahik yang tercatat resmi di BAZNAS.",
  peduli:
    "Bantuan sosial kemanusiaan untuk masyarakat terdampak bencana dan kaum dhuafa, termasuk paket Ramadhan, qurban, dan bantuan darurat.",
  makmur:
    "Modal usaha mikro, pelatihan vokasi, dan pendampingan berkelanjutan menuju kemandirian ekonomi mustahik produktif.",
};

export const PILLAR_DETAIL: PilarDetail[] = PILAR_PROGRAM.map((pilar) => {
  const program = PROGRAM_UNGGULAN.find((p) => p.key === pilar.key);
  return {
    ...pilar,
    desc: PILAR_LONG_DESC[pilar.key],
    statLine: program ? `${program.target} · Pagu ${program.pagu}` : "",
  };
});

/* ────────────────────────────────────────────────────────────────────────
 * CARA BERZAKAT — the three-step payment journey
 * Installed between the kalkulator ("hitung") and the about section
 * ("program"), so it closes the loop: compute → transfer → receipt.
 * ──────────────────────────────────────────────────────────────────────── */

export interface CaraBerzakatStep {
  id: string;
  /** Zero-padded step numeral — "01" | "02" | "03". */
  step: "01" | "02" | "03";
  title: string;
  desc: string;
  icon: LucideIcon;
  /** Optional supporting line (threshold, bank list, legal note). */
  detail?: string;
}

export const CARA_BERZAKAT_STEPS: CaraBerzakatStep[] = [
  {
    id: "hitung-zakat",
    step: "01",
    title: "Hitung Zakat",
    desc: "Gunakan kalkulator zakat di halaman ini untuk mengetahui estimasi zakat Anda dalam hitungan detik.",
    icon: Calculator,
    detail: "Nisab bulanan ± Rp 7,83 jt (setara 522 kg beras). Hasil bersifat indikatif.",
  },
  {
    id: "transfer-resmi",
    step: "02",
    title: "Transfer ke Rekening Resmi",
    desc: "Setorkan ke rekening resmi BAZNAS Kota Gorontalo: Bank Sulutgo, Bank Muamalat, atau Bank BTN Syariah. Kuitansi diterbitkan otomatis.",
    icon: Landmark,
    detail: "Gunakan nomor rekening resmi yang tercantum pada footer halaman ini.",
  },
  {
    id: "terima-kuitansi",
    step: "03",
    title: "Terima Kuitansi Resmi",
    desc: "Kirim bukti transfer ke layanan@baznas.go.id. Kuitansi resmi dapat Anda pakai sebagai pengurang penghasilan kena pajak.",
    icon: FileCheck2,
    detail: "Kuitansi sah sebagai pengurang penghasilan bruto sesuai UU No. 23/2011.",
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * TESTIMONI — trust signals from muzakki & mustahik
 * ──────────────────────────────────────────────────────────────────────── */

export interface Testimoni {
  quote: string;
  nama: string;
  /** Peran, e.g. "Muzakki ASN · Disdik Gorontalo". */
  role: string;
  /** Inisial untuk avatar monogram — opsional, derivable via `monogram()`. */
  initials: string;
}

export const TESTIMONI_LIST: Testimoni[] = [
  {
    quote:
      "Saya titip zakat melalui BAZNAS karena laporan dananya transparan — saya bisa lihat sendiri program-program yang dibiayai. Hati saya tenang.",
    nama: "Haji Ramli, S.Pd",
    role: "Muzakki ASN · Disdik Gorontalo",
    initials: "HR",
  },
  {
    quote:
      "Alhamdulillah, BAZNAS Cerdas memberikan beasiswa untuk anak saya yang sedang kuliah di UNIMA. Tanpa bantuan ini, ia tidak akan bisa lanjut.",
    nama: "Ibu Maryam",
    role: "Mustahik · Gorontalo",
    initials: "IM",
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * FAQ
 * ──────────────────────────────────────────────────────────────────────── */

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_LIST: FaqItem[] = [
  {
    q: "Apa itu zakat profesi dan berapa nisabnya?",
    a: "Zakat profesi adalah zakat yang dikeluarkan dari penghasilan kerja (gaji, honor, dll) sebesar 2,5%. Nisab zakat profesi dihitung dari harga emas 85 gram per tahun. Jika penghasilan bulanan Anda setara 522 kg beras dan sudah mencapai haul (1 tahun), maka wajib zakat.",
  },
  {
    q: "Bagaimana cara membayar zakat melalui BAZNAS?",
    a: "Anda bisa membayar dengan dua cara: (1) Datang langsung ke loket Kantor BAZNAS Kota Gorontalo dengan membawa KTP/NIK, atau (2) Transfer ke rekening resmi BAZNAS (Bank Sulutgo, Bank Muamalat, atau Bank BTN Syariah), lalu kirim bukti transfer ke layanan@baznas.go.id untuk diterbitkan kuitansi resmi.",
  },
  {
    q: "Apakah donasi saya benar-benar sampai ke yang berhak?",
    a: "Ya. Setiap donasi dicatat dalam sistem digital, didistribusikan melalui 4 pilar program yang telah diaudit KAP independen dengan opini Wajar Tanpa Pengecualian (WTP). Anda akan menerima kuitansi resmi dan laporan distribusi periodik.",
  },
  {
    q: "Apakah zakat saya bisa dikurangkan dari penghasilan kena pajak?",
    a: "Ya, sesuai UU PPh Pasal 22 dan UU No. 23/2011 tentang Pengelolaan Zakat, zakat yang dibayarkan melalui BAZNAS dapat menjadi pengurang penghasilan bruto. Kami akan menerbitkan kuitansi resmi yang dapat digunakan untuk keperluan pajak Anda.",
  },
  {
    q: "Bolehkan saya membayar zakat untuk orang lain (sebagai wakaf)?",
    a: "Boleh. Jika Anda membayar zakat atas nama orang lain (orang tua, saudara, dll), cukup sertakan nama dan NIK mereka saat setor. Sistem kami akan mencatatkan sebagai zakat atas nama yang ditunjuk, dengan Anda sebagai pembayar.",
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * KALKULATOR — Maal input fields
 * ──────────────────────────────────────────────────────────────────────── */

export type ZakatMaalKey = "tabungan" | "emas" | "aset" | "piutang";

export interface ZakatMaalField {
  key: ZakatMaalKey;
  label: string;
  placeholder: string;
}

/**
 * Typed as a union rather than a bare string[] so the calculator can index
 * its state with `field.key` directly — the old inline version needed an
 * `as keyof typeof hartaMaal` cast on every render.
 */
export const ZAKAT_MAAL_FIELDS: ZakatMaalField[] = [
  { key: "tabungan", label: "Tabungan & Deposito", placeholder: "0" },
  { key: "emas", label: "Emas & Logam Mulia (gram)", placeholder: "0" },
  { key: "aset", label: "Aset Produktif (properti, saham, dll)", placeholder: "0" },
  { key: "piutang", label: "Piutang yang Dapat Ditagih", placeholder: "0" },
];

/* ────────────────────────────────────────────────────────────────────────
 * HELPERS
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Two-letter monogram from a person's name — used by the struktur section
 * in place of a portrait, so the hierarchy reads without eight stock photos.
 */
export function monogram(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

/**
 * Inline SVG fractal-noise grain. Applied at very low opacity over the
 * `bg-baznas-paper` hero so the cream surface reads as warm paper rather than
 * flat digital beige. Paired with `mix-blend-multiply` at ~60% opacity.
 */
export const PAPER_GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";