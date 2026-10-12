"use client";

import React, { useState } from "react";
import {
  Calculator,
  Lock,
  Compass,
  Target,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Stethoscope,
  HeartHandshake,
  Briefcase,
  ChevronDown,
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  Send,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Sparkles,
  Quote,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { BerandaContent } from "@/lib/types";
import { initialBerandaContent, strukturOrganisasiResmiData } from "@/lib/mock-data";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
// (KhatRule removed — tidak lagi pakai Star SVG)

interface PublicLandingViewProps {
  onOpenLogin: () => void;
  berandaContent?: BerandaContent;
}

// ─── Logo BAZNAS resmi (sudah di /public/baznas-logo.png) ─────
const PROGRAM_PHOTOS = {
  cerdas:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
  sehat:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
  makmur:
    "https://images.unsplash.com/photo-1556746769-d4c2f5d3a3ff?auto=format&fit=crop&w=600&q=80",
  peduli:
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
};

// ─── Inline data (4 Pilar, Programs, Testimoni, FAQ) ───────────
const PILAR_PROGRAM = [
  {
    key: "cerdas",
    label: "Cerdas",
    title: "BAZNAS Cerdas",
    desc: "Beasiswa pendidikan untuk santri, siswa, dan mahasiswa dari keluarga kurang mampu.",
    icon: GraduationCap,
    color: "text-baznas-ink",
  },
  {
    key: "sehat",
    label: "Sehat",
    title: "BAZNAS Sehat",
    desc: "Bantuan biaya kesehatan, ambulance dhuafa, dan operasi katarak gratis.",
    icon: Stethoscope,
    color: "text-baznas-ink",
  },
  {
    key: "peduli",
    label: "Peduli",
    desc: "Bantuan sosial kemanusiaan untuk masyarakat terdampak bencana dan kaum dhuafa.",
    icon: HeartHandshake,
    color: "text-baznas-ink",
  },
  {
    key: "makmur",
    label: "Makmur",
    title: "BAZNAS Mandiri",
    desc: "Modal usaha mikro, pelatihan vokasi, dan pendampingan menuju kemandirian ekonomi.",
    icon: Briefcase,
    color: "text-baznas-ink",
  },
];

const PROGRAM_UNGGULAN = [
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

const TESTIMONI_LIST = [
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

const FAQ_LIST = [
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

// ─── Helpers ────────────────────────────────────────────────────
function monogram(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

// Subtle paper-grain texture
const PAPER_GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

// Zakat Maal breakdown (simplified — for demonstration)
const ZAKAT_MAAL_FIELDS = [
  { key: "tabungan", label: "Tabungan & Deposito", placeholder: "0" },
  { key: "emas", label: "Emas & Logam Mulia (gram)", placeholder: "0" },
  { key: "aset", label: "Aset Produktif (properti, saham, dll)", placeholder: "0" },
  { key: "piutang", label: "Piutang yang Dapat Ditagih", placeholder: "0" },
];

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onOpenLogin,
  berandaContent = initialBerandaContent,
}) => {
  // Calculator state — Profesi
  const [gajiPublik, setGajiPublik] = useState<number>(7500000);
  // Calculator state — Maal
  const [hartaMaal, setHartaMaal] = useState({
    tabungan: 0,
    emas: 0,
    aset: 0,
    piutang: 0,
  });
  // Tab switcher
  const [calcTab, setCalcTab] = useState<"profesi" | "maal">("profesi");
  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const zakatProfesi = Math.round(gajiPublik * 0.025);
  const totalHartaMaal = Object.values(hartaMaal).reduce((a, b) => a + (b || 0), 0);
  // Approx nisab maal (522 kg beras × ~Rp 15.000/kg ≈ Rp 7,83 jt per tahun / 12 bulan)
  // For simplicity, use totalHartaMaal × 2.5% if above a nisab threshold
  const nisabMaalBulanan = 7_830_000;
  const zakatMaal =
    totalHartaMaal >= nisabMaalBulanan
      ? Math.round((totalHartaMaal * 2.5) / 100)
      : 0;

  const handleMaalChange = (key: keyof typeof hartaMaal, value: number) => {
    setHartaMaal((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pb-0">
      {/* Skip-to-content link (a11y) */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-baznas-ink focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      >
        Lewati ke konten utama
      </a>

      {/* ─────────────────────────────────────────────── */}
      {/* 1. HERO — editorial 2-col, photo + sub-stats    */}
      {/* ─────────────────────────────────────────────── */}
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="relative overflow-hidden bg-baznas-paper scroll-mt-20"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url("${PAPER_GRAIN}")` }}
        />
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Kiri: copy */}
            <div className="lg:col-span-7 order-2 lg:order-1 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-baznas-ink/90">
                  Lembaga Zakat Nasional · Provinsi Gorontalo
                </span>
              </div>

              <h1
                id="hero-heading"
                className="display-hero text-baznas-ink"
              >
                Amanah dalam
                <br />
                setiap titipan{" "}
                <span className="relative inline-block text-baznas-green-900 group">
                  zakat
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-[3px] bg-baznas-gold-display origin-left scale-x-100 transition-transform duration-500 group-hover:scale-x-110"
                  />
                </span>{" "}
                Anda.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-baznas-ink/90 max-w-xl leading-relaxed">
                {berandaContent.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("kalkulator");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 text-white px-6 py-3 text-sm font-bold transition-all duration-200 min-h-t-target-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2 active:scale-[0.98] relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-baznas-green-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" aria-hidden="true" />
                  <Calculator className="h-4 w-4 text-baznas-gold-display relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Hitung Zakat Anda</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="group inline-flex items-center gap-2 border border-baznas-ink-20 bg-white hover:border-baznas-green-800 hover:text-baznas-green-900 text-baznas-ink px-6 py-3 text-sm font-bold transition-all duration-200 min-h-t-target-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <Lock className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Portal Petugas</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Sub-stats: lembaga dalam angka */}
              <div className="mt-10 grid grid-cols-3 gap-px bg-baznas-ink-12 border border-baznas-ink-12 max-w-md">
                <div className="bg-baznas-paper p-3 transition-colors duration-200 hover:bg-white group">
                  <p className="text-[10px] uppercase tracking-wider text-baznas-ink/90 font-bold group-hover:text-baznas-green-800 transition-colors">
                    Muzakki
                  </p>
                  <p className="display-3 editorial-num text-baznas-ink leading-none mt-1 group-hover:scale-105 origin-left transition-transform duration-200">
                    1.247
                  </p>
                </div>
                <div className="bg-baznas-paper p-3 transition-colors duration-200 hover:bg-white group">
                  <p className="text-[10px] uppercase tracking-wider text-baznas-ink/90 font-bold group-hover:text-baznas-green-800 transition-colors">
                    Program
                  </p>
                  <p className="display-3 editorial-num text-baznas-ink leading-none mt-1 group-hover:scale-105 origin-left transition-transform duration-200">
                    16
                  </p>
                </div>
                <div className="bg-baznas-paper p-3 transition-colors duration-200 hover:bg-white group">
                  <p className="text-[10px] uppercase tracking-wider text-baznas-ink/90 font-bold group-hover:text-baznas-gold-display transition-colors">
                    Pilar
                  </p>
                  <p className="display-3 editorial-num text-baznas-gold-display leading-none mt-1 group-hover:scale-105 origin-left transition-transform duration-200">
                    4
                  </p>
                </div>
              </div>

              {/* Trust line */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-baznas-ink/90">
                <span className="flex items-center gap-2 transition-colors hover:text-baznas-green-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-baznas-green-800" />
                  Opini audit WTP
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-baznas-green-900 border border-baznas-ink-12 px-1.5 py-0.5 transition-colors hover:bg-baznas-green-800 hover:text-white">
                    PSAK 109
                  </span>
                  Standar Akuntansi Zakat
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-baznas-green-900 border border-baznas-ink-12 px-1.5 py-0.5 transition-colors hover:bg-baznas-green-800 hover:text-white">
                    ISO 37001
                  </span>
                  Anti-Penyuapan
                </span>
              </div>
            </div>

            {/* Kanan: Logo BAZNAS resmi — benar-benar tanpa frame */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center">
              <img
                src="/baznas-logo.png"
                alt="Logo Resmi BAZNAS Kota Gorontalo — Badan Amil Zakat Nasional"
                className="w-full max-w-2xl h-auto"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 2. STATS — 1 jumbo + 3 medium + breakdown       */}
      {/* ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="stats-heading"
        className="bg-baznas-ink text-white relative overflow-hidden"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="mb-12 flex items-center gap-3">
            <span className="h-px w-12 bg-baznas-gold-display" aria-hidden="true" />
            <span className="text-[10px] font-bold tracking-[0.22em] text-baznas-gold-display uppercase">
              Capaian Tahun 2026
            </span>
            <span className="h-px w-12 bg-baznas-gold-display" aria-hidden="true" />
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-end mb-10">
            {/* Jumbo stat — Total Penghimpunan dengan YoY */}
            <div className="lg:col-span-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-baznas-gold-display font-bold mb-3">
                Total Penghimpunan
              </p>
              <p className="display-1 editorial-num text-white leading-none">
                {berandaContent.totalPenghimpunan}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-baznas-green-800/40 text-baznas-paper text-xs font-bold">
                  <TrendingUp className="h-3 w-3" />
                  +18,2% YoY
                </span>
                <span className="text-xs text-white/85">
                  vs Rp 1,25 M di periode sama 2025
                </span>
              </div>
              <p className="mt-4 text-sm text-white/85 max-w-md">
                Akumulasi setoran zakat, infak, sedekah, dan DSKL per Oktober 2026
                dari muzakki individu, ASN, dan OPD di seluruh Provinsi Gorontalo.
              </p>
            </div>

            {/* 3 medium stats */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/90 font-bold mb-2">
                  Penerima Manfaat
                </p>
                <p className="display-3 editorial-num text-white">
                  {berandaContent.totalMustahik}
                </p>
                <p className="text-xs text-white/90 mt-1.5">
                  Mustahik Desil 1–5 · aktif &amp; tersurvey
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/90 font-bold mb-2">
                  Penyaluran
                </p>
                <p className="display-3 editorial-num text-white">
                  {berandaContent.tingkatPenyaluran}
                </p>
                <p className="text-xs text-white/90 mt-1.5">Dari pagu RKAT 2026</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/90 font-bold mb-2">
                  Opini Audit
                </p>
                <p className="display-3 editorial-num text-baznas-gold-display">
                  {berandaContent.opiniAudit}
                </p>
                <p className="text-xs text-white/90 mt-1.5">
                  Wajar Tanpa Pengecualian
                </p>
              </div>
            </div>
          </div>

          {/* Komposisi penghimpunan per jenis — visual breakdown */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/90 font-bold mb-3">
              Komposisi Penghimpunan per Jenis
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Zakat", pct: 62, color: "bg-baznas-gold-display" },
                { label: "Infak", pct: 23, color: "bg-baznas-green-800" },
                { label: "Sedekah", pct: 11, color: "bg-emerald-500" },
                { label: "DSKL", pct: 4, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/85">
                      {item.label}
                    </span>
                    <span className="text-sm font-extrabold text-white editorial-num">
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.label}: ${item.pct} persen`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 3. KALKULATOR — Tab Profesi / Maal              */}
      {/* ─────────────────────────────────────────────── */}
      <section
        id="kalkulator"
        aria-labelledby="calc-heading"
        className="bg-baznas-paper py-20 lg:py-24 scroll-mt-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-ink/90 font-bold mb-3">
              Kalkulator Mandiri
            </p>
            <h2
              id="calc-heading"
              className="display-3 text-baznas-ink"
            >
              Hitung kewajiban zakat Anda.
            </h2>
            <p className="mt-4 text-sm text-baznas-ink/90 max-w-xl mx-auto">
              Pilih jenis zakat Anda — Profesi (2,5% dari gaji) atau Maal (2,5%
              dari harta simpanan). Hasil perhitungan bersifat indikatif.
            </p>
          </div>

          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="Pilih jenis zakat"
            className="flex items-center border border-baznas-ink-8 bg-white max-w-md mx-auto mb-8"
          >
            {[
              { key: "profesi", label: "Zakat Profesi", icon: Briefcase },
              { key: "maal", label: "Zakat Maal", icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = calcTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCalcTab(tab.key as "profesi" | "maal")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 ${
                    isActive
                      ? "bg-baznas-ink text-white"
                      : "text-baznas-ink/90 hover:text-baznas-ink hover:bg-baznas-paper/40"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Input column */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 border border-baznas-ink-8">
              {calcTab === "profesi" ? (
                <>
                  <label
                    htmlFor="kalkulator-gaji"
                    className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-2"
                  >
                    Penghasilan bersih per bulan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-baznas-ink/90">
                      Rp
                    </span>
                    <input
                      id="kalkulator-gaji"
                      type="number"
                      step="500000"
                      value={gajiPublik}
                      onChange={(e) => setGajiPublik(Number(e.target.value))}
                      className="w-full border border-baznas-ink-20 bg-white pl-10 pr-4 py-3 text-2xl font-extrabold editorial-num text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target-lg"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-baznas-ink/90">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Saran:
                    </span>
                    {[5_000_000, 7_500_000, 10_000_000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setGajiPublik(v)}
                        className="px-2.5 py-1 border border-baznas-ink-12 hover:border-baznas-green-800 hover:text-baznas-green-900 text-baznas-ink/90"
                      >
                        {formatRupiah(v)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-baznas-ink/90 mt-5 leading-relaxed">
                    Nisab bulanan: ± <strong className="text-baznas-ink">Rp 7,83 jt</strong>{" "}
                    (setara 522 kg beras). Penghasilan di atas nisab &amp; sudah haul
                    (1 tahun) → wajib zakat 2,5%.
                  </p>
                </>
              ) : (
                <>
                  <p className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-3">
                    Harta yang dimiliki (per bulan)
                  </p>
                  <div className="space-y-3">
                    {ZAKAT_MAAL_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={`maal-${field.key}`}
                          className="block text-xs text-baznas-ink/90 mb-1"
                        >
                          {field.label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-baznas-ink/90">
                            Rp
                          </span>
                          <input
                            id={`maal-${field.key}`}
                            type="number"
                            value={hartaMaal[field.key as keyof typeof hartaMaal] || ""}
                            onChange={(e) =>
                              handleMaalChange(
                                field.key as keyof typeof hartaMaal,
                                Number(e.target.value)
                              )
                            }
                            placeholder={field.placeholder}
                            className="w-full border border-baznas-ink-20 bg-white pl-10 pr-4 py-2.5 text-sm font-bold editorial-num text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-baznas-ink/90 mt-4 leading-relaxed">
                    Nisab maal: ± <strong className="text-baznas-ink">85 gram emas</strong>{" "}
                    (± Rp 131,7 jt). Harta di atas nisab &amp; haul 1 tahun → wajib zakat
                    2,5%.
                  </p>
                </>
              )}
            </div>

            {/* Result column — paper-textured, gold-accented */}
            <div className="lg:col-span-5 relative bg-white p-6 sm:p-7 border-l-4 border-baznas-gold-display">
              <p className="text-[11px] uppercase tracking-[0.18em] text-baznas-ink/90 font-bold">
                {calcTab === "profesi" ? "Zakat 2,5% per bulan" : "Zakat 2,5% per tahun"}
              </p>
              <p className="display-2 editorial-num text-baznas-green-900 mt-2">
                {calcTab === "profesi" ? formatRupiah(zakatProfesi) : formatRupiah(zakatMaal)}
              </p>
              <p className="mt-3 text-xs text-baznas-ink/90">
                {calcTab === "profesi" ? (
                  <>
                    Disetahunkan:{" "}
                    <strong className="text-baznas-ink">
                      {formatRupiah(zakatProfesi * 12)}
                    </strong>
                  </>
                ) : (
                  <>
                    Total harta:{" "}
                    <strong className="text-baznas-ink">
                      {formatRupiah(totalHartaMaal)}
                    </strong>
                    {totalHartaMaal < nisabMaalBulanan && (
                      <span className="block mt-1 text-rose-700">
                        Belum mencapai nisab, zakat tidak wajib.
                      </span>
                    )}
                  </>
                )}
              </p>

              <button
                onClick={onOpenLogin}
                className="mt-6 inline-flex items-center gap-2 bg-baznas-green-900 hover:bg-baznas-green-800 text-white px-5 py-2.5 text-sm font-bold transition-colors min-h-t-target-lg"
              >
                <span>Bayar via Petugas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 4. TENTANG — 2-col + 4 Pilar                   */}
      {/* ─────────────────────────────────────────────── */}
      <section
        id="tentang"
        aria-labelledby="tentang-heading"
        className="bg-white py-20 lg:py-24 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-3">
                Mengenal Lembaga
              </p>
              <h2
                id="tentang-heading"
                className="display-2 text-baznas-ink"
              >
                Tentang BAZNAS.
              </h2>
              <p className="mt-5 text-base text-baznas-ink/90 leading-relaxed">
                Badan Amil Zakat Nasional (BAZNAS) adalah badan resmi yang
                dibentuk oleh pemerintah yang memiliki tugas dan fungsi
                menghimpun dan menyalurkan zakat, infak, dan sedekah (ZIS)
                secara amanah dan akuntabel.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-12">
              {/* Visi Lembaga — dengan logo BAZNAS sebagai visual anchor */}
              <div>
                <div className="flex items-center gap-2 text-baznas-ink mb-5">
                  <Compass className="h-4 w-4 text-baznas-gold-display" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    Visi Lembaga
                  </h3>
                </div>
                <div className="bg-baznas-paper/40 border-l-4 border-baznas-gold-display p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
                    {/* Logo BAZNAS sebagai visual anchor */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <img
                        src="/baznas-logo.png"
                        alt="Logo Resmi BAZNAS — Badan Amil Zakat Nasional"
                        className="h-20 sm:h-24 w-auto"
                        draggable={false}
                      />
                    </div>
                    {/* Visi quote */}
                    <p className="text-xl sm:text-2xl font-display font-medium text-baznas-green-900 leading-snug italic flex-1">
                      &ldquo;{berandaContent.visi}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Misi Utama */}
              <div>
                <div className="flex items-center gap-2 text-baznas-ink mb-5">
                  <Target className="h-4 w-4 text-baznas-gold-display" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    Misi Utama
                  </h3>
                </div>
                <ol className="space-y-3">
                  {berandaContent.misiList.map((misi, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-sm text-baznas-ink/90 leading-relaxed p-3 sm:p-4 bg-baznas-paper/30 border border-baznas-ink-8 hover:border-baznas-gold-display transition-colors"
                    >
                      <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 text-[11px] font-bold text-baznas-gold-display border border-baznas-gold-display mt-0.5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">{misi}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* 4 Pilar — program utama */}
          <div className="mt-16 pt-12 border-t border-baznas-ink-8">
            <div className="text-center mb-10">
              <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
                Program Unggulan
              </p>
              <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-baznas-ink">
                Empat Pilar Penyaluran.
              </h3>
              <p className="mt-2 text-sm text-baznas-ink/90 max-w-xl mx-auto">
                Setiap dana yang Anda titipkan akan dialokasikan ke salah satu
                dari empat pilar program di bawah ini, sesuai kebutuhan mustahik.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PILAR_PROGRAM.map((pilar) => {
                const Icon = pilar.icon;
                return (
                  <div
                    key={pilar.key}
                    className="group bg-baznas-paper/40 p-5 border border-baznas-ink-8 hover:border-baznas-gold-display transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-extrabold text-baznas-gold-display uppercase tracking-[0.2em]">
                        Pilar
                      </span>
                      <span className="text-[10px] font-bold text-baznas-ink/90 uppercase tracking-wider">
                        {pilar.label}
                      </span>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center bg-baznas-ink text-baznas-gold-display mb-4">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h4 className="text-base font-poppins font-bold text-baznas-ink">
                      {pilar.key === "cerdas" || pilar.key === "makmur"
                        ? pilar.title
                        : pilar.key === "peduli"
                        ? "BAZNAS Peduli"
                        : "BAZNAS Sehat"}
                    </h4>
                    <p className="mt-2 text-xs text-baznas-ink/90 leading-snug">
                      {pilar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 5. PROGRAM UNGGULAN — cards with photo           */}
      {/* ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="program-heading"
        className="bg-baznas-paper py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
              Program Prioritas
            </p>
            <h2
              id="program-heading"
              className="display-2 text-baznas-ink"
            >
              Aksi Nyata, Dampak Terukur.
            </h2>
            <p className="mt-3 text-sm text-baznas-ink/90">
              Empat program unggulan yang sedang berjalan di tahun 2026 dengan
              target penerima dan pagu anggaran transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAM_UNGGULAN.map((program, idx) => (
              <article
                key={program.key}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="group bg-white border border-baznas-ink-8 overflow-hidden hover:border-baznas-green-800 transition-all duration-300 hover:shadow-rest hover:-translate-y-1 animate-fade-in-up"
              >
                <div className="relative aspect-[4/3] bg-baznas-ink overflow-hidden">
                  <img
                    src={program.photo}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-baznas-ink/0 group-hover:bg-baznas-ink/20 transition-colors duration-500" aria-hidden="true" />
                  <div className="absolute top-3 left-3 bg-baznas-ink/90 backdrop-blur-xs px-2 py-1 text-[10px] font-bold text-baznas-gold-display uppercase tracking-wider group-hover:bg-baznas-gold-display group-hover:text-baznas-ink transition-colors duration-300">
                    Pilar {idx + 1}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-poppins font-bold text-baznas-ink group-hover:text-baznas-green-900 transition-colors duration-200">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-xs text-baznas-ink/90 leading-snug min-h-[3em]">
                    {program.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-baznas-ink-8 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-baznas-ink/90 font-bold">
                        Target
                      </p>
                      <p className="text-xs font-bold text-baznas-ink mt-0.5">
                        {program.target}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-baznas-ink/90 font-bold">
                        Pagu 2026
                      </p>
                      <p className="text-xs font-extrabold text-baznas-green-900 editorial-num mt-0.5">
                        {program.pagu}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 6. STRUKTUR ORGANISASI — consistent (semua light)*/}
      {/* ─────────────────────────────────────────────── */}
      <section
        id="struktur"
        aria-labelledby="struktur-heading"
        className="bg-white py-20 lg:py-24 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
              Tata Kelola Lembaga
            </p>
            <h2
              id="struktur-heading"
              className="display-2 text-baznas-ink"
            >
              Struktur Organisasi.
            </h2>
            <p className="mt-3 text-sm text-baznas-ink/90">
              Pimpinan dan pembagian empat bidang kerja operasional.
            </p>
          </div>

          {/* Ketua — visual hierarchy: light + border-l-4 gold */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-md bg-baznas-paper border-l-4 border-baznas-gold-display p-7 text-center">
              <div className="relative mx-auto mb-4 h-24 w-24 flex items-center justify-center bg-white border-2 border-baznas-gold-display">
                <span className="display-1 text-baznas-green-900">
                  {monogram(strukturOrganisasiResmiData.ketua.nama)}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-baznas-gold-display font-bold">
                Ketua Lembaga
              </p>
              <h3 className="mt-1 text-lg font-poppins font-bold text-baznas-ink">
                {strukturOrganisasiResmiData.ketua.nama}
              </h3>
              <span className="inline-block mt-1.5 bg-baznas-ink px-3 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                {strukturOrganisasiResmiData.ketua.jabatan}
              </span>
              <p className="text-[11px] text-baznas-ink/90 mt-2">
                Penanggung Jawab Utama Kebijakan Lembaga
              </p>
            </div>
          </div>

          {/* Connector line — visual link */}
          <div className="flex justify-center mb-10" aria-hidden="true">
            <div className="h-8 w-px bg-baznas-ink-20" />
          </div>

          {/* 4 Wakil Ketua — consistent light cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strukturOrganisasiResmiData.wakilKetuaList.map((waka) => (
              <div
                key={waka.id}
                className="group bg-baznas-paper border-l-4 border-baznas-gold-display p-5 hover:border-baznas-green-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-14 w-14 flex items-center justify-center bg-white border border-baznas-ink-12">
                    <span className="text-base font-bold text-baznas-green-900">
                      {monogram(waka.nama)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[10px] uppercase tracking-wider text-baznas-gold-display font-bold">
                      Wakil Ketua
                    </p>
                    <h4 className="text-sm font-bold text-baznas-ink leading-tight mt-0.5">
                      {waka.nama}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-bold text-baznas-green-900 bg-white px-2 py-0.5 uppercase tracking-wide border border-baznas-ink-8">
                      {waka.jabatan}
                    </span>
                  </div>
                </div>

                {waka.stafList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-baznas-ink-8 space-y-2 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink/90">
                      Pelaksana / Staf
                    </p>
                    {waka.stafList.map((staf, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2.5 text-xs">
                        <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-white border border-baznas-ink-12">
                          <span className="text-[10px] font-bold text-baznas-green-900">
                            {monogram(staf.nama)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-baznas-ink text-xs truncate">
                            {staf.nama}
                          </p>
                          <p className="text-[10px] text-baznas-ink/90 truncate">
                            {staf.bidangTugas}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 7. TESTIMONI — trust signals                     */}
      {/* ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="testimoni-heading"
        className="bg-baznas-paper py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
              Suara Muzakki &amp; Mustahik
            </p>
            <h2
              id="testimoni-heading"
              className="display-2 text-baznas-ink"
            >
              Kepercayaan yang Terbangun.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {TESTIMONI_LIST.map((t, idx) => (
              <figure
                key={idx}
                style={{ animationDelay: `${idx * 120}ms` }}
                className="group bg-white p-6 sm:p-7 border-l-4 border-baznas-gold-display transition-all duration-300 hover:border-l-baznas-green-800 hover:shadow-rest hover:-translate-y-0.5 animate-fade-in-up"
              >
                <Quote
                  className="h-7 w-7 text-baznas-gold-display mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  aria-hidden="true"
                />
                <blockquote className="text-sm sm:text-base text-baznas-ink/90 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 pt-4 border-t border-baznas-ink-8">
                  <div className="shrink-0 h-11 w-11 flex items-center justify-center bg-baznas-ink text-white transition-transform duration-300 group-hover:bg-baznas-green-800 group-hover:scale-110">
                    <span className="text-xs font-bold tracking-tight">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-baznas-ink">{t.nama}</p>
                    <p className="text-[11px] text-baznas-ink/90">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 8. FAQ — accordion                                */}
      {/* ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="faq-heading"
        className="bg-white py-20 lg:py-24"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
              Pertanyaan Umum
            </p>
            <h2
              id="faq-heading"
              className="display-2 text-baznas-ink"
            >
              Sebelum Anda Bertanya.
            </h2>
            <p className="mt-3 text-sm text-baznas-ink/90">
              Jawaban untuk pertanyaan yang paling sering diajukan mengenai
              zakat, infak, dan sedekah.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border bg-white overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "border-baznas-gold-display shadow-rest"
                      : "border-baznas-ink-8 hover:border-baznas-ink-20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 transition-colors duration-200 hover:bg-baznas-paper/30"
                  >
                    <span className="text-sm sm:text-base font-bold text-baznas-ink flex items-center gap-3">
                      <span
                        className={`shrink-0 inline-flex items-center justify-center w-7 h-7 text-[11px] font-mono font-bold transition-colors duration-300 ${
                          isOpen
                            ? "bg-baznas-ink text-white"
                            : "bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/90"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-7 h-7 border transition-all duration-300 ${
                        isOpen
                          ? "bg-baznas-ink border-baznas-ink text-white rotate-180"
                          : "border-baznas-ink-20 text-baznas-ink/90 group-hover:border-baznas-ink-40"
                      }`}
                      aria-hidden="true"
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${idx}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                    aria-hidden={!isOpen}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-0 text-sm text-baznas-ink/90 leading-relaxed border-t border-baznas-ink-8">
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 9. CTA BANNER — pre-footer                        */}
      {/* ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="bg-baznas-ink text-white relative overflow-hidden"
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <Sparkles className="h-6 w-6 text-baznas-gold-display mx-auto mb-4" aria-hidden="true" />
          <h2
            id="cta-heading"
            className="display-3 text-white"
          >
            Siap menunaikan zakat?
          </h2>
          <p className="mt-4 text-base text-white/85 max-w-xl mx-auto">
            Mulai hitung dan bayar zakat Anda hari ini. Setiap rupiah yang Anda
            titipkan adalah harapan bagi mereka yang membutuhkan.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById("kalkulator");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-baznas-gold-display hover:bg-baznas-gold-display/90 text-baznas-ink px-7 py-3 text-sm font-bold transition-colors min-h-t-target-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-ink"
            >
              <Calculator className="h-4 w-4" />
              Hitung Zakat Anda
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 border border-white/30 bg-transparent hover:bg-white/10 hover:border-white/50 text-white px-7 py-3 text-sm font-bold transition-all duration-200 min-h-t-target-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-ink"
            >
              <Lock className="h-4 w-4" />
              Portal Petugas
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* 10. FOOTER — 4-col + social + legal              */}
      {/* ─────────────────────────────────────────────── */}
      <footer className="bg-baznas-green-950 text-white relative">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="mb-4">
                <BAZNASMark variant="mark" size="md" className="text-white" />
              </div>
              <p className="text-sm text-white/85 leading-relaxed max-w-sm">
                Badan Amil Zakat Nasional — lembaga resmi pemerintah pengelola
                zakat, infak, sedekah, dan DSKL di Indonesia.
              </p>
              {/* Social */}
              <div className="mt-5 flex items-center gap-2" aria-label="Media sosial">
                {[
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Youtube, label: "YouTube" },
                  { Icon: Send, label: "Telegram" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="inline-flex items-center justify-center w-9 h-9 border border-white/30 text-white/90 hover:text-baznas-gold-display hover:border-baznas-gold-display transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-gold-display"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Tautan Cepat */}
            <div className="md:col-span-2">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-gold-display mb-4">
                Tautan Cepat
              </h4>
              <ul className="space-y-2 text-sm text-white/85">
                {[
                  { label: "Beranda", href: "#hero" },
                  { label: "Tentang BAZNAS", href: "#tentang" },
                  { label: "Struktur", href: "#struktur" },
                  { label: "Kalkulator", href: "#kalkulator" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(link.href.slice(1))
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-baznas-gold-display transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rekening */}
            <div className="md:col-span-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-gold-display mb-4">
                Rekening Resmi
              </h4>
              <div className="space-y-2.5 text-sm text-white/85">
                <div>
                  <span className="block text-white/85 text-[11px] uppercase tracking-wider">
                    Bank Sulutgo
                  </span>
                  <span className="font-mono text-white text-xs">
                    {berandaContent.bankSulutgo}
                  </span>
                </div>
                <div>
                  <span className="block text-white/85 text-[11px] uppercase tracking-wider">
                    Bank Muamalat
                  </span>
                  <span className="font-mono text-white text-xs">
                    {berandaContent.bankMuamalat}
                  </span>
                </div>
                <div>
                  <span className="block text-white/85 text-[11px] uppercase tracking-wider">
                    Bank BTN Syariah
                  </span>
                  <span className="font-mono text-white text-xs">
                    {berandaContent.bankBtn}
                  </span>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div className="md:col-span-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-gold-display mb-4">
                Kontak &amp; Alamat
              </h4>
              <div className="space-y-2.5 text-sm text-white/85">
                <p className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-baznas-gold-display mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{berandaContent.alamat}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-baznas-gold-display shrink-0" aria-hidden="true" />
                  <a href={`tel:${berandaContent.telepon}`} className="hover:text-baznas-gold-display transition-colors">
                    {berandaContent.telepon}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-baznas-gold-display shrink-0" aria-hidden="true" />
                  <a href={`mailto:${berandaContent.email}`} className="hover:text-baznas-gold-display transition-colors">
                    {berandaContent.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/85">
            <p>© 2026 Badan Amil Zakat Nasional. Seluruh hak cipta dilindungi.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-baznas-gold-display transition-colors">
                Privasi
              </a>
              <a href="#" className="hover:text-baznas-gold-display transition-colors">
                Syarat &amp; Ketentuan
              </a>
              <span className="text-white/85">·</span>
              <span className="font-mono">Simbazkot v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingView;
