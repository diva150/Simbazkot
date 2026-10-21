"use client";

import React, { useMemo } from "react";
import {
  BidangType,
  SetoranZIS,
  PermohonanPencairan,
  Surat,
  ItemRKAT,
  Mustahik,
  Muzakki,
  UserSession,
} from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import {
  HandCoins,
  HeartHandshake,
  LineChart,
  FolderArchive,
  TrendingUp,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Printer,
  Wallet,
  Sparkles,
  Receipt,
  ArrowDownRight,
  Inbox,
} from "lucide-react";
import {
  FadeUp,
  Stagger,
  StaggerItem,
  Lift,
  AnimatedNumber,
  GlassCard,
  GhostNumber,
} from "@/components/motion";

interface BerandaViewProps {
  user?: UserSession;
  onSelectBidang: (bidang: BidangType) => void;
  setoranList: SetoranZIS[];
  pencairanList: PermohonanPencairan[];
  suratList: Surat[];
  mustahikList: Mustahik[];
  muzakkiList: Muzakki[];
  rkatList: ItemRKAT[];
  onViewKwitansi: (setoran: SetoranZIS) => void;
}

const BIDANG_META: Partial<
  Record<
    BidangType,
    { short: string; title: string; desc: string; icon: React.ReactNode }
  >
> = {
  bidang1: {
    short: "Bidang I",
    title: "Pengumpulan ZIS",
    desc: "Input setoran, kalkulator zakat 2,5%, data muzakki, dan cetak tanda terima.",
    icon: <HandCoins className="h-5 w-5" />,
  },
  bidang2: {
    short: "Bidang II",
    title: "Pendistribusian",
    desc: "Data mustahik 4 pilar, survei kelayakan, dan permohonan pencairan bantuan.",
    icon: <HeartHandshake className="h-5 w-5" />,
  },
  bidang3: {
    short: "Bidang III",
    title: "Keuangan & RKAT",
    desc: "Evaluasi pagu vs realisasi RKAT, laporan arus kas, dan cetak LPJ resmi.",
    icon: <LineChart className="h-5 w-5" />,
  },
  bidang4: {
    short: "Bidang IV",
    title: "Administrasi & Aset",
    desc: "Agenda surat masuk, cetak lembar disposisi, SDM amil, dan inventaris kantor.",
    icon: <FolderArchive className="h-5 w-5" />,
  },
};

export const BerandaView: React.FC<BerandaViewProps> = ({
  user,
  onSelectBidang,
  setoranList,
  pencairanList,
  suratList,
  mustahikList,
  muzakkiList,
  rkatList,
  onViewKwitansi,
}) => {
  const pendingPencairan = pencairanList.filter((p) => p.status === "diajukan");
  const pendingSurat = suratList.filter(
    (s) => s.statusDisposisi === "belum_disposisi"
  );

  // Real-time aggregates — preserved exactly from the prior implementation.
  const stats = useMemo(() => {
    const totalZisMasuk = setoranList.reduce((acc, s) => acc + s.nominal, 0);
    const totalPenyaluran = pencairanList
      .filter((p) => p.status === "dikonfirmasi_bidang2" || p.status === "disetujui_ketua")
      .reduce((acc, p) => acc + p.nominal, 0);
    const rkatPaguTotal = rkatList.reduce((acc, r) => acc + r.paguAnggaran, 0);
    const rkatRealisasiTotal = rkatList.reduce((acc, r) => acc + r.realisasi, 0);
    const serapanPagu = rkatPaguTotal > 0 ? (totalPenyaluran / rkatPaguTotal) * 100 : 0;
    const saldoKas = totalZisMasuk - totalPenyaluran;
    const mustahikAktif = mustahikList.filter((m) => m.statusKelayakan === "aktif").length;
    const muzakkiAktif = muzakkiList.filter((m) => m.status === "aktif").length;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    const currentMonthTotal = setoranList
      .filter((s) => s.tanggal.startsWith(currentMonth))
      .reduce((acc, s) => acc + s.nominal, 0);
    const prevMonthTotal = setoranList
      .filter((s) => s.tanggal.startsWith(prevMonth))
      .reduce((acc, s) => acc + s.nominal, 0);
    const monthTrend =
      prevMonthTotal > 0
        ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
        : 0;

    return {
      totalZisMasuk,
      totalPenyaluran,
      rkatPaguTotal,
      rkatRealisasiTotal,
      serapanPagu,
      saldoKas,
      mustahikAktif,
      muzakkiAktif,
      monthTrend,
    };
  }, [setoranList, pencairanList, rkatList, mustahikList, muzakkiList]);

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const quickBidang: BidangType[] = ["bidang1", "bidang2", "bidang3", "bidang4"];

  // First name greeting — locale-aware Indonesian comma split.
  const greetingName = user?.nama?.split(",")[0]?.trim() ?? "";

  return (
    <Stagger className="space-y-10" stagger={0.08} delayChildren={0.05}>
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 1. WELCOME HERO — large editorial intro with ghost numeral       */}
      {/* Zaiflu-style: oversized 122px backdrop number + mesh surface.    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <StaggerItem>
        <section className="relative overflow-hidden bg-baznas-paper border-l-4 border-baznas-gold-display rounded-card">
          {/* Ghost numeral — "01" anchors the section as Module One */}
          <GhostNumber className="-right-2 -top-6 select-none">
            01
          </GhostNumber>

          {/* Decorative mesh-light wash on the right edge */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-mesh-light opacity-60 pointer-events-none"
          />

          <div className="relative grid lg:grid-cols-12 gap-8 p-8 sm:p-10 lg:p-12">
            {/* Copy */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="chip-paper">
                  <Sparkles className="h-3 w-3 text-baznas-gold-display" aria-hidden="true" />
                  Pusat Kendali Operasional
                </span>
                <span className="hidden sm:inline text-[11px] text-baznas-ink/55 font-semibold tabular-nums tracking-tight">
                  {currentMonthLabel}
                </span>
              </div>

              <h1 className="display-2 text-baznas-ink">
                Selamat datang{greetingName ? `, ${greetingName}` : ""}.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-baznas-ink/85 max-w-2xl leading-relaxed">
                Kelola penerimaan zakat, verifikasi mustahik, realisasi anggaran
                RKAT, dan kearsipan surat dalam satu tempat — amanah, transparan,
                dan akuntabel untuk umat.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-baznas-ink/85">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-baznas-green-700 animate-pulse-glow"
                  />
                  Sistem aktif
                </span>
                <span className="hidden sm:block text-baznas-ink/30">·</span>
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-baznas-green-900">
                  BAZNAS · Gorontalo
                </span>
              </div>
            </div>

            {/* Decorative right-side panel */}
            <div className="hidden lg:flex lg:col-span-4 items-end justify-end">
              <div className="relative">
                <Wallet
                  aria-hidden="true"
                  className="h-32 w-32 text-baznas-gold-display opacity-20"
                  strokeWidth={1}
                />
                <div className="absolute -bottom-1 -right-1 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-baznas-ink/70">
                    Akumulasi
                  </p>
                  <p className="display-3 editorial-num text-baznas-ink leading-none">
                    {formatRupiah(stats.totalZisMasuk)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 2. PINTASAN CEPAT — 4 fields with hover lift + arrow travel      */}
      {/* Zaiflu pattern: -3px lift, gold accent top-bar that scales 0->1  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <StaggerItem>
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-ink/55 font-bold mb-1">
                Pintasan Langsung
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-poppins text-baznas-ink">
                Modul Tugas Anda
              </h2>
            </div>
            <span className="hidden sm:inline-block chip-gold">
              4 Bidang
            </span>
          </div>

          <Stagger
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            stagger={0.07}
            delayChildren={0}
            immediate
          >
            {quickBidang.map((b, idx) => {
              const meta = BIDANG_META[b]!;
              return (
                <StaggerItem
                  key={b}
                >
                  <button
                    type="button"
                    onClick={() => onSelectBidang(b)}
                    aria-label={`Buka ${meta.short} — ${meta.title}`}
                    className="group relative text-left bg-white border border-baznas-ink-8 hover:border-baznas-green-800 rounded-card p-7 transition-all duration-350 ease-zaiflu hover:-translate-y-1 hover:shadow-lift active:scale-[0.99] min-h-t-target-xl w-full overflow-hidden"
                  >
                    {/* Gold accent top — scales in on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 top-0 h-[3px] bg-baznas-gold-display scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-350 ease-zaiflu"
                    />

                    {/* Background GhostNumber — small, decorative */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -bottom-3 font-display font-extrabold leading-none tracking-tighter text-baznas-ink/[0.05] text-[64px] select-none"
                    >
                      0{idx + 1}
                    </span>

                    <div className="flex items-start justify-between gap-3 relative">
                      <div className="border border-baznas-ink-20 group-hover:border-baznas-green-800 group-hover:bg-baznas-green-900 group-hover:text-white p-2.5 text-baznas-ink/85 transition-all duration-350 ease-zaiflu shrink-0 group-hover:scale-105">
                        {meta.icon}
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 text-baznas-ink/35 group-hover:text-baznas-green-800 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-350 ease-zaiflu"
                        aria-hidden="true"
                      />
                    </div>

                    <span className="mt-5 block text-[10px] font-extrabold text-baznas-gold-display uppercase tracking-[0.22em]">
                      {meta.short}
                    </span>
                    <h3 className="mt-1.5 text-base font-bold text-baznas-ink font-poppins leading-tight">
                      {meta.title}
                    </h3>
                    <p className="mt-2 text-xs text-baznas-ink/65 leading-snug">
                      {meta.desc}
                    </p>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      </StaggerItem>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 3. STATS — jumbo (mesh-dark) + 3 medium (glass cards)          */}
      {/* The new core of the dashboard. AnimatedNumber count-up.        */}
      {/* Zaiflu signature: 122px ghost numeral behind the jumbo stat.    */}
      {/* Lime accent: ONLY on the progress bar (chart/progress per rule).*/}
      {/* ─────────────────────────────────────────────────────────────── */}
      <StaggerItem>
        <section className="grid lg:grid-cols-12 gap-5 items-stretch">
          {/* JUMBO stat — total ZIS masuk */}
          <div className="lg:col-span-7 relative bg-mesh-dark text-white p-7 lg:p-10 overflow-hidden rounded-panel border border-baznas-petrol-900">
            {/* Grain overlay */}
            <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden="true" />

            {/* Ghost numeral — architectural anchor behind the headline stat */}
            <GhostNumber className="-right-3 -top-10 text-[112px] text-white/[0.07]">
              01
            </GhostNumber>

            {/* Decorative Wallet icon */}
            <Wallet
              aria-hidden="true"
              className="absolute -right-6 -bottom-6 h-56 w-56 text-baznas-gold-display opacity-10"
              strokeWidth={0.8}
            />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-baznas-gold-display"
                />
                <span className="text-[10px] uppercase tracking-[0.22em] text-baznas-gold-display font-extrabold">
                  Total Penghimpunan
                </span>
              </div>

              <p className="display-1 editorial-num text-white leading-[0.95] tracking-tight">
                <AnimatedNumber
                  value={stats.totalZisMasuk}
                  format={(n) => formatRupiah(n)}
                  duration={1.4}
                />
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="text-white/85">
                  Akumulasi per{" "}
                  <span className="font-semibold text-white">
                    {currentMonthLabel}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 font-bold ${
                    stats.monthTrend >= 0
                      ? "bg-baznas-green-800/40 text-white"
                      : "bg-white/15 text-white/90"
                  }`}
                  aria-label={`Tren bulan ini ${stats.monthTrend.toFixed(
                    1
                  )} persen`}
                >
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  {stats.monthTrend >= 0 ? "+" : ""}
                  {stats.monthTrend.toFixed(1)}% MoM
                </span>
              </div>

              {/* Progress bar — lime accent (chart/progress use is permitted) */}
              <div className="mt-6">
                <div className="flex items-baseline justify-between text-[11px] text-white/85 mb-2">
                  <span className="uppercase tracking-wider font-bold">
                    Serapan Pagu RKAT
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {stats.serapanPagu.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="h-1.5 bg-white/15 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={Math.round(stats.serapanPagu)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Serapan pagu RKAT"
                >
                  <div
                    className="h-full bg-baznas-lime-500 transition-all duration-700 ease-zaiflu rounded-full"
                    style={{ width: `${Math.min(stats.serapanPagu, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3 MEDIUM stats stacked — different bg for each (chart/progress)  */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {/* Telah Disalurkan */}
            <Lift className="h-full">
              <div className="relative bg-white border border-baznas-ink-8 p-6 rounded-card overflow-hidden h-full transition-shadow duration-350 ease-zaiflu hover:shadow-lift">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 font-display font-extrabold leading-none tracking-tighter text-baznas-ink/[0.05] text-[56px] select-none"
                >
                  02
                </span>
                <p className="text-[10px] uppercase tracking-[0.22em] text-baznas-ink/55 font-bold mb-1.5 relative">
                  Telah Disalurkan
                </p>
                <p className="display-3 editorial-num text-baznas-ink relative">
                  <AnimatedNumber
                    value={stats.totalPenyaluran}
                    format={(n) => formatRupiah(n)}
                  />
                </p>
                <p className="text-[11px] text-baznas-ink/65 mt-1.5 relative">
                  {stats.serapanPagu.toFixed(1)}% pagu RKAT · 4 pilar
                </p>
                <ArrowDownRight
                  className="h-3.5 w-3.5 text-baznas-green-800 absolute right-5 top-5 opacity-60"
                  aria-hidden="true"
                />
              </div>
            </Lift>

            {/* Penerima Manfaat */}
            <Lift className="h-full">
              <div className="relative bg-white border border-baznas-ink-8 p-6 rounded-card overflow-hidden h-full transition-shadow duration-350 ease-zaiflu hover:shadow-lift">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 font-display font-extrabold leading-none tracking-tighter text-baznas-ink/[0.05] text-[56px] select-none"
                >
                  03
                </span>
                <p className="text-[10px] uppercase tracking-[0.22em] text-baznas-ink/55 font-bold mb-1.5 relative">
                  Penerima Manfaat
                </p>
                <p className="display-3 editorial-num text-baznas-ink relative">
                  <AnimatedNumber value={stats.mustahikAktif} />
                  <span className="text-sm font-normal text-baznas-ink/55 ml-1">
                    jiwa
                  </span>
                </p>
                <p className="text-[11px] text-baznas-ink/65 mt-1.5 relative">
                  Dari {stats.muzakkiAktif} muzakki terdaftar
                </p>
                <HeartHandshake
                  className="h-3.5 w-3.5 text-baznas-green-800 absolute right-5 top-5 opacity-60"
                  aria-hidden="true"
                />
              </div>
            </Lift>

            {/* Saldo Kas */}
            <Lift className="h-full">
              <div className="relative bg-baznas-paper border border-baznas-ink-8 p-6 rounded-card overflow-hidden h-full transition-shadow duration-350 ease-zaiflu hover:shadow-lift">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 font-display font-extrabold leading-none tracking-tighter text-baznas-ink/[0.05] text-[56px] select-none"
                >
                  04
                </span>
                <p className="text-[10px] uppercase tracking-[0.22em] text-baznas-ink/55 font-bold mb-1.5 relative">
                  Saldo Kas
                </p>
                <p
                  className={`display-3 editorial-num relative ${
                    stats.saldoKas >= 0
                      ? "text-baznas-green-900"
                      : "text-baznas-error-700"
                  }`}
                >
                  <AnimatedNumber
                    value={stats.saldoKas}
                    format={(n) => formatRupiah(n)}
                  />
                </p>
                <p className="text-[11px] text-baznas-ink/65 mt-1.5 relative">
                  {stats.saldoKas >= 0
                    ? "Siap disalurkan sesuai RKAT"
                    : "Saldo negatif, perlu perhatian"}
                </p>
              </div>
            </Lift>
          </div>
        </section>
      </StaggerItem>

      {/* Empty state — only when there's literally nothing */}
      {setoranList.length === 0 && (
        <StaggerItem>
          <FadeUp>
            <div className="border border-dashed border-baznas-ink-20 bg-baznas-paper/40 p-8 text-center rounded-card">
              <p className="text-sm font-bold text-baznas-ink">
                Belum ada data setoran tercatat
              </p>
              <p className="text-xs text-baznas-ink/65 mt-1">
                Mulai catat setoran ZIS pertama Anda di Bidang I — Pengumpulan.
              </p>
            </div>
          </FadeUp>
        </StaggerItem>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 4. PENGINGAT + AKTIVITAS — 2-col with glass-card panels         */}
      {/* Left: pending tasks with gold-bordered rows                    */}
      {/* Right: recent setoran with hover-revealed kwitansi button      */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <StaggerItem>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Kiri (8): Pengingat */}
          <div className="lg:col-span-8 bg-white border border-baznas-ink-8 p-6 rounded-card">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-baznas-ink-8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center bg-baznas-paper border border-baznas-gold-display">
                  <Clock
                    className="h-4 w-4 text-baznas-gold-display"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-baznas-ink font-poppins">
                  Pengingat Tugas
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  pendingPencairan.length + pendingSurat.length > 0
                    ? "bg-baznas-error-700 text-white"
                    : "bg-baznas-paper border border-baznas-ink-12 text-baznas-ink/70"
                }`}
              >
                {pendingPencairan.length + pendingSurat.length} item
              </span>
            </div>

            <div className="space-y-3">
              {pendingPencairan.length === 0 && pendingSurat.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold text-baznas-ink/65">
                    Tidak ada tugas yang menunggu tindak lanjut.
                  </p>
                  <p className="text-[11px] text-baznas-ink/45 mt-1">
                    Anda sudah menyelesaikan semua item yang ditugaskan.
                  </p>
                </div>
              )}

              <Stagger className="space-y-3" stagger={0.05} immediate>
                {pendingPencairan.map((p) => (
                  <StaggerItem key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSelectBidang("bidang2")}
                      className="group w-full flex items-center justify-between text-left border-l-4 border-baznas-gold-display bg-baznas-paper hover:bg-baznas-paper/60 px-5 py-4 transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:shadow-rest min-h-t-target rounded-e-card"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold text-baznas-ink uppercase tracking-wider">
                          Persetujuan Pencairan · Bidang II
                        </p>
                        <p className="text-sm font-bold text-baznas-ink mt-1 truncate">
                          {p.namaProgram}
                        </p>
                        <p className="text-[11px] text-baznas-ink/65 mt-0.5">
                          {formatRupiah(p.nominal)} · {p.jumlahMustahik} mustahik
                          · {p.tanggal}
                        </p>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-baznas-ink group-hover:gap-2.5 transition-all duration-350 ease-zaiflu">
                        Tinjau <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </StaggerItem>
                ))}

                {pendingSurat.map((s) => (
                  <StaggerItem key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelectBidang("bidang4")}
                      className="group w-full flex items-center justify-between text-left border-l-4 border-baznas-green-800 bg-baznas-paper/40 hover:bg-baznas-paper px-5 py-4 transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:shadow-rest min-h-t-target rounded-e-card"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold text-baznas-green-900 uppercase tracking-wider">
                          Surat Masuk · Bidang IV
                        </p>
                        <p className="text-sm font-bold text-baznas-ink mt-1 truncate">
                          {s.nomorSurat} — {s.asalSurat}
                        </p>
                        <p className="text-[11px] text-baznas-ink/65 mt-0.5 truncate max-w-md">
                          {s.perihal}
                        </p>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-baznas-green-900 group-hover:gap-2.5 transition-all duration-350 ease-zaiflu">
                        Disposisi <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>

          {/* Kanan (4): Setoran Terkini */}
          <div className="lg:col-span-4 bg-white border border-baznas-ink-8 p-6 rounded-card">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-baznas-ink-8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center bg-baznas-paper border border-baznas-gold-display">
                  <Receipt
                    className="h-4 w-4 text-baznas-green-800"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-baznas-ink font-poppins">
                  Setoran Terkini
                </h3>
              </div>
              <button
                onClick={() => onSelectBidang("bidang1")}
                className="text-[11px] font-bold text-baznas-green-900 hover:text-baznas-green-800 flex items-center gap-1 group"
              >
                Semua
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-350 ease-zaiflu" />
              </button>
            </div>

            <Stagger className="space-y-2.5" stagger={0.05} immediate>
              {setoranList.slice(0, 3).map((s) => (
                <StaggerItem key={s.id}>
                  <div className="border border-baznas-ink-8 p-3 rounded-card transition-all duration-350 ease-zaiflu hover:border-baznas-green-800 hover:-translate-y-0.5 hover:shadow-rest">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-baznas-ink/55">
                        {s.buktiNo}
                      </span>
                      <span className="text-[10px] text-baznas-ink/55">
                        {s.tanggal}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-baznas-ink mt-1.5 truncate">
                      {s.namaMuzakki}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-baznas-ink-8">
                      <span className="text-[11px] text-baznas-ink/65">
                        {s.jenisLabel}
                      </span>
                      <span className="text-xs font-bold text-baznas-green-900 editorial-num">
                        {formatRupiah(s.nominal)}
                      </span>
                    </div>
                    <button
                      onClick={() => onViewKwitansi(s)}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 border border-baznas-ink-20 hover:border-baznas-green-800 hover:bg-baznas-paper text-baznas-ink/70 hover:text-baznas-green-900 py-2 text-[11px] font-bold transition-all duration-350 ease-zaiflu min-h-t-target rounded-md active:scale-[0.98]"
                    >
                      <Printer className="h-3 w-3" />
                      Lihat Kwitansi
                    </button>
                  </div>
                </StaggerItem>
              ))}
              {setoranList.length === 0 && (
                <StaggerItem>
                  <p className="text-center text-xs text-baznas-ink/55 py-6">
                    Belum ada setoran tercatat
                  </p>
                </StaggerItem>
              )}
            </Stagger>
          </div>
        </section>
      </StaggerItem>
    </Stagger>
  );
};

export default BerandaView;
