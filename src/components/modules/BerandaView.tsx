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
  Printer,
  Inbox,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Star8 } from "@/components/brand/IslamicOrnament";

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

  // Real-time aggregates
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

  // Tentukan bidang yang ditampilkan sebagai pintasan (semua user lihat 4 utama)
  const quickBidang: BidangType[] = ["bidang1", "bidang2", "bidang3", "bidang4"];

  return (
    <div className="space-y-10">
      {/* ──────────────────────────────────────── */}
      {/* 1. WELCOME BANNER — editorial, no gradient */}
      {/* ──────────────────────────────────────── */}
      <section className="relative bg-baznas-paper border-l-4 border-baznas-gold-display p-8 sm:p-10 overflow-hidden">
        {/* Decorative ornament — very subtle */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute right-8 top-1/2 -translate-y-1/2 text-baznas-gold-display opacity-25"
        >
          <Star8 size={140} />
        </div>

        <div className="relative max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-4">
            Pusat Kendali Operasional
          </p>
          <h1 className="display-2 text-baznas-ink">
            Selamat datang{user?.nama ? `, ${user.nama.split(",")[0]}` : ""}.
          </h1>
          <p className="mt-4 text-base text-baznas-ink/70 leading-relaxed max-w-xl">
            Kelola penerimaan zakat, verifikasi mustahik, realisasi anggaran RKAT,
            dan kearsipan surat dalam satu tempat — amanah, transparan, dan
            akuntabel untuk umat.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      {/* 2. PINTASAN CEPAT — 4 cards with icon variety */}
      {/* ──────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1">
              Pintasan Langsung
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-baznas-ink">
              Modul Tugas Anda
            </h2>
          </div>
          <span className="text-[11px] text-baznas-ink/45 hidden sm:block">
            {currentMonthLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickBidang.map((b) => {
            const meta = BIDANG_META[b]!;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onSelectBidang(b)}
                aria-label={`Buka ${meta.short} — ${meta.title}`}
                className="group relative text-left bg-white border border-baznas-ink-8 hover:border-baznas-green-800 p-8 transition-colors min-h-t-target-lg"
              >
                {/* gold accent top — when hovered */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 top-0 h-[3px] bg-baznas-gold-display scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="border border-baznas-ink-20 group-hover:border-baznas-green-800 group-hover:bg-baznas-green-900 group-hover:text-white p-2.5 text-baznas-ink/80 transition-colors shrink-0">
                    {meta.icon}
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-baznas-ink/30 group-hover:text-baznas-green-800 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <span className="mt-4 block text-[10px] font-bold text-baznas-gold-display uppercase tracking-wider">
                  {meta.short}
                </span>
                <h3 className="mt-1 text-base font-bold text-baznas-ink font-poppins leading-tight">
                  {meta.title}
                </h3>
                <p className="mt-1.5 text-xs text-baznas-ink/55 leading-snug">
                  {meta.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      {/* 3. STATS — 1 jumbo + 3 medium (editorial)  */}
      {/* ──────────────────────────────────────── */}
      <section>
        <div className="grid lg:grid-cols-12 gap-5 items-stretch">
          {/* JUMBO stat — total ZIS masuk */}
          <div className="lg:col-span-7 relative bg-baznas-ink text-white p-7 overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -right-8 -bottom-8 text-baznas-gold-display opacity-10"
            >
              <Wallet className="h-48 w-48" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-baznas-gold-display" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold">
                  Total Penghimpunan
                </span>
              </div>
              <p className="display-1 editorial-num text-white leading-none">
                {formatRupiah(stats.totalZisMasuk)}
              </p>
              <div className="mt-4 flex items-center gap-5 text-xs">
                <span className="text-white/55">Akumulasi per {currentMonthLabel}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 font-bold ${
                    stats.monthTrend >= 0
                      ? "bg-baznas-green-800/30 text-baznas-paper"
                      : "bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/70"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {stats.monthTrend >= 0 ? "+" : ""}
                  {stats.monthTrend.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 3 MEDIUM stats stacked vertically */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="bg-white border border-baznas-ink-8 p-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                Telah Disalurkan
              </p>
              <p className="display-3 editorial-num text-baznas-ink">
                {formatRupiah(stats.totalPenyaluran)}
              </p>
              <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                {stats.serapanPagu.toFixed(1)}% pagu RKAT · 4 pilar
              </p>
            </div>

            <div className="bg-white border border-baznas-ink-8 p-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                Penerima Manfaat
              </p>
              <p className="display-3 editorial-num text-baznas-ink">
                {stats.mustahikAktif}
                <span className="text-sm font-normal text-baznas-ink/45"> jiwa</span>
              </p>
              <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                Dari {stats.muzakkiAktif} muzakki terdaftar
              </p>
            </div>

            <div className="bg-white border border-baznas-ink-8 p-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                Saldo Kas
              </p>
              <p
                className={`display-3 editorial-num ${
                  stats.saldoKas >= 0 ? "text-baznas-green-900" : "text-baznas-ink/70"
                }`}
              >
                {formatRupiah(stats.saldoKas)}
              </p>
              <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                {stats.saldoKas >= 0
                  ? "Siap disalurkan sesuai RKAT"
                  : "Saldo negatif, perlu perhatian"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {setoranList.length === 0 && (
        <div className="border border-dashed border-baznas-ink-20 bg-baznas-paper/40 p-8 text-center">
          <p className="text-sm font-bold text-baznas-ink">
            Belum ada data setoran tercatat
          </p>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Mulai catat setoran ZIS pertama Anda di Bidang I — Pengumpulan.
          </p>
        </div>
      )}

      {/* ──────────────────────────────────────── */}
      {/* 4. PENGINGAT + AKTIVITAS — 2 kolom         */}
      {/* ──────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kiri (8): Pengingat */}
        <div className="lg:col-span-8 bg-white border border-baznas-ink-8 p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-baznas-ink-8">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-baznas-gold-display" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-baznas-ink font-poppins">
                Pengingat Tugas
              </h3>
            </div>
            <span className="bg-baznas-paper border border-baznas-ink-12 text-baznas-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {pendingPencairan.length + pendingSurat.length} item
            </span>
          </div>

          <div className="space-y-3">
            {pendingPencairan.length === 0 && pendingSurat.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm font-semibold text-baznas-ink/55">
                  Tidak ada tugas yang menunggu tindak lanjut.
                </p>
                <p className="text-[11px] text-baznas-ink/40 mt-1">
                  Anda sudah menyelesaikan semua item yang ditugaskan.
                </p>
              </div>
            )}

            {pendingPencairan.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectBidang("bidang2")}
                className="group w-full flex items-center justify-between text-left border-l-4 border-baznas-gold-display bg-baznas-paper hover:bg-baznas-paper/60 px-5 py-4 transition-colors min-h-t-target"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                    Persetujuan Pencairan · Bidang II
                  </p>
                  <p className="text-sm font-bold text-baznas-ink mt-1 truncate">
                    {p.namaProgram}
                  </p>
                  <p className="text-[11px] text-baznas-ink/60 mt-0.5">
                    {formatRupiah(p.nominal)} · {p.jumlahMustahik} mustahik · {p.tanggal}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-baznas-ink group-hover:gap-2 transition-all">
                  Tinjau <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}

            {pendingSurat.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectBidang("bidang4")}
                className="group w-full flex items-center justify-between text-left border-l-4 border-baznas-green-800 bg-baznas-paper/40 hover:bg-baznas-paper px-5 py-4 transition-colors min-h-t-target"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-baznas-green-900 uppercase tracking-wider">
                    Surat Masuk · Bidang IV
                  </p>
                  <p className="text-sm font-bold text-baznas-ink mt-1 truncate">
                    {s.nomorSurat} — {s.asalSurat}
                  </p>
                  <p className="text-[11px] text-baznas-ink/60 mt-0.5 truncate max-w-md">
                    {s.perihal}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-baznas-green-900 group-hover:gap-2 transition-all">
                  Disposisi <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kanan (4): Setoran Terkini */}
        <div className="lg:col-span-4 bg-white border border-baznas-ink-8 p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-baznas-ink-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-baznas-ink font-poppins">
              Setoran Terkini
            </h3>
            <button
              onClick={() => onSelectBidang("bidang1")}
              className="text-[11px] font-bold text-baznas-green-900 hover:underline flex items-center gap-1"
            >
              Semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {setoranList.slice(0, 3).map((s) => (
              <div key={s.id} className="border border-baznas-ink-8 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-baznas-ink/45">
                    {s.buktiNo}
                  </span>
                  <span className="text-[10px] text-baznas-ink/45">{s.tanggal}</span>
                </div>
                <p className="text-sm font-bold text-baznas-ink mt-1.5 truncate">
                  {s.namaMuzakki}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-baznas-ink-8">
                  <span className="text-[11px] text-baznas-ink/55">{s.jenisLabel}</span>
                  <span className="text-xs font-bold text-baznas-green-900 editorial-num">
                    {formatRupiah(s.nominal)}
                  </span>
                </div>
                <button
                  onClick={() => onViewKwitansi(s)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 border border-baznas-ink-20 hover:border-baznas-green-800 hover:bg-baznas-paper text-baznas-ink/70 hover:text-baznas-green-900 py-2 text-[11px] font-bold transition-colors min-h-t-target"
                >
                  <Printer className="h-3 w-3" />
                  Lihat Kwitansi
                </button>
              </div>
            ))}
            {setoranList.length === 0 && (
              <p className="text-center text-xs text-baznas-ink/45 py-6">
                Belum ada setoran tercatat
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BerandaView;
