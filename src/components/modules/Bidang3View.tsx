"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ItemRKAT, Bidang3Tab, UserSession } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
// NOTE: exportToExcel is dynamically imported inside each handler so the
// heavy xlsx library is only fetched when the user actually exports.
import { useToast, ToastContainer } from "@/components/common";
import { canAccessTab } from "@/lib/access";
import {
  LineChart,
  Printer,
  Download,
  Search,
  Filter,
} from "lucide-react";

interface ProgramLintasBidang {
  id: string;
  kodeProgram: string;
  bidang: "Bidang I" | "Bidang II" | "Bidang III" | "Bidang IV";
  namaBidang: string;
  namaProgram: string;
  paguAnggaran: number;
  realisasi: number;
  targetVolume: string;
  status: "Berjalan Baik" | "Perlu Percepatan" | "Selesai";
}

interface Bidang3ViewProps {
  rkatList: ItemRKAT[];
  currentUser: UserSession;
  onOpenLaporanPrint: () => void;
  activeTab?: Bidang3Tab;
  onTabChange?: (tab: Bidang3Tab) => void;
}

const STATUS_BADGE: Record<string, string> = {
  "Berjalan Baik": "bg-baznas-paper text-baznas-green-900 border border-baznas-ink-8",
  "Selesai": "bg-baznas-paper text-baznas-ink border border-baznas-ink-8",
  "Perlu Percepatan": "bg-baznas-paper border border-baznas-gold-display text-baznas-ink",
};

const BIDANG_BADGE: Record<string, string> = {
  "Bidang I": "bg-baznas-paper text-baznas-green-900 border border-baznas-ink-8",
  "Bidang II": "bg-baznas-paper text-baznas-green-900 border border-baznas-ink-8",
  "Bidang III": "bg-baznas-paper text-baznas-ink border border-baznas-ink-8",
  "Bidang IV": "bg-baznas-paper text-baznas-ink border border-baznas-ink-8",
};

export const Bidang3View: React.FC<Bidang3ViewProps> = ({
  rkatList,
  currentUser,
  onOpenLaporanPrint,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<Bidang3Tab>("dashboard");
  const activeTab = propTab || localTab;
  const { error: toastError, toasts, dismiss } = useToast();
  const setActiveTab = (tab: Bidang3Tab) => {
    if (!canAccessTab(currentUser, "bidang3", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "bidang3", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  const [filterBidang, setFilterBidang] = useState<string>("all");
  const [searchProgramQuery, setSearchProgramQuery] = useState("");
  const [filterBidangProgram, setFilterBidangProgram] = useState<string>("all");
  const [filterStatusProgram, setFilterStatusProgram] = useState<string>("all");

  const totalPagu = rkatList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = rkatList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const persentaseTotal = Math.round((totalRealisasi / (totalPagu || 1)) * 100);

  const filteredRKAT = rkatList.filter(
    (item) => filterBidang === "all" || item.bidang === filterBidang
  );

  // Master Data Laporan Program Lintas Bidang
  const allProgramsList: ProgramLintasBidang[] = useMemo(() => [
    // (data identik dengan implementasi sebelumnya — disingkat untuk kejelasan)
    { id: "prog-1", kodeProgram: "PRG-B1-01", bidang: "Bidang I", namaBidang: "Pengumpulan ZIS", namaProgram: "Optimalisasi UPZ & Payroll Zakat Profesi ASN", paguAnggaran: 120000000, realisasi: 98500000, targetVolume: "14 OPD & 650 Muzakki ASN", status: "Berjalan Baik" },
    { id: "prog-2", kodeProgram: "PRG-B1-02", bidang: "Bidang I", namaBidang: "Pengumpulan ZIS", namaProgram: "Pengumpulan Zakat Maal & Zakat Fitrah Ramadhan", paguAnggaran: 250000000, realisasi: 215000000, targetVolume: "4.500 Muzakki Masyarakat", status: "Berjalan Baik" },
    { id: "prog-3", kodeProgram: "PRG-B1-03", bidang: "Bidang I", namaBidang: "Pengumpulan ZIS", namaProgram: "Kampanye Infak Terikat & Sedekah Harian Digital", paguAnggaran: 45000000, realisasi: 32000000, targetVolume: "10 Gerai Loket & QRIS", status: "Berjalan Baik" },
    { id: "prog-4", kodeProgram: "PRG-B1-04", bidang: "Bidang I", namaBidang: "Pengumpulan ZIS", namaProgram: "Penerimaan DSKL, Fidyah, Kafarat & Qurban", paguAnggaran: 85000000, realisasi: 54000000, targetVolume: "120 Hewan Qurban & Fidyah", status: "Perlu Percepatan" },
    { id: "prog-5", kodeProgram: "PRG-B2-01", bidang: "Bidang II", namaBidang: "Pendistribusian (Pendidikan)", namaProgram: "BAZNAS Cerdas — Beasiswa Santri & Dhuafa", paguAnggaran: 180000000, realisasi: 145000000, targetVolume: "150 Santri & Siswa Miskin", status: "Berjalan Baik" },
    { id: "prog-6", kodeProgram: "PRG-B2-02", bidang: "Bidang II", namaBidang: "Pendistribusian (Kesehatan)", namaProgram: "BAZNAS Sehat — Bantuan Obat & Ambulans Dhuafa", paguAnggaran: 95000000, realisasi: 78500000, targetVolume: "210 Pasien SKTM Non-BPJS", status: "Berjalan Baik" },
    { id: "prog-7", kodeProgram: "PRG-B2-03", bidang: "Bidang II", namaBidang: "Pendistribusian (Dakwah)", namaProgram: "BAZNAS Peduli Dakwah — Bisyarah Da'i Perbatasan", paguAnggaran: 60000000, realisasi: 45000000, targetVolume: "25 Da'i & 40 Mualaf Binaan", status: "Berjalan Baik" },
    { id: "prog-8", kodeProgram: "PRG-B2-04", bidang: "Bidang II", namaBidang: "Pendayagunaan (Ekonomi)", namaProgram: "BAZNAS Mandiri — Modal Usaha Mikro Z-Mart", paguAnggaran: 150000000, realisasi: 110000000, targetVolume: "30 Mustahik Pelaku Usaha", status: "Berjalan Baik" },
    { id: "prog-9", kodeProgram: "PRG-B2-05", bidang: "Bidang II", namaBidang: "Pendayagunaan (Vokasi)", namaProgram: "Pelatihan Keterampilan Teknis & Vokasi BLK", paguAnggaran: 70000000, realisasi: 38000000, targetVolume: "50 Pemuda Usia Produktif", status: "Perlu Percepatan" },
    { id: "prog-10", kodeProgram: "PRG-B2-06", bidang: "Bidang II", namaBidang: "Pendayagunaan (Sanitasi)", namaProgram: "Instalasi Air Bersih & Jamban Sehat Keluarga Desil 1", paguAnggaran: 65000000, realisasi: 50000000, targetVolume: "15 Titik Sanitasi Wilayah Rentan", status: "Berjalan Baik" },
    { id: "prog-11", kodeProgram: "PRG-B3-01", bidang: "Bidang III", namaBidang: "Keuangan & RKAT", namaProgram: "Penyusunan Rencana Kerja & Anggaran Tahunan (RKAT)", paguAnggaran: 35000000, realisasi: 30000000, targetVolume: "1 Dokumen RKAT Terpadu", status: "Selesai" },
    { id: "prog-12", kodeProgram: "PRG-B3-02", bidang: "Bidang III", namaBidang: "Keuangan & RKAT", namaProgram: "Pengauditan Syariah & KAP Independen (Opini WTP)", paguAnggaran: 45000000, realisasi: 35000000, targetVolume: "1 Laporan Audit Keuangan", status: "Berjalan Baik" },
    { id: "prog-13", kodeProgram: "PRG-B3-03", bidang: "Bidang III", namaBidang: "Keuangan & RKAT", namaProgram: "Modernisasi Sistem Informasi Manajemen Akuntansi Zakat", paguAnggaran: 30000000, realisasi: 28000000, targetVolume: "1 Server Cloud & Lisensi PSAK", status: "Berjalan Baik" },
    { id: "prog-14", kodeProgram: "PRG-B4-01", bidang: "Bidang IV", namaBidang: "Administrasi & Umum", namaProgram: "Digitalisasi Tata Persuratan & Pengarsipan Resmi", paguAnggaran: 25000000, realisasi: 22000000, targetVolume: "1.200 Surat Masuk & Keluar", status: "Berjalan Baik" },
    { id: "prog-15", kodeProgram: "PRG-B4-02", bidang: "Bidang IV", namaBidang: "Administrasi & SDM", namaProgram: "Sertifikasi Kompetensi Amil Zakat & Pembinaan Staf", paguAnggaran: 40000000, realisasi: 28000000, targetVolume: "18 Personel Amil BAZNAS", status: "Berjalan Baik" },
    { id: "prog-16", kodeProgram: "PRG-B4-03", bidang: "Bidang IV", namaBidang: "Administrasi & Aset", namaProgram: "Pemeliharaan Inventaris Kantor & Operasional Gedung", paguAnggaran: 50000000, realisasi: 42000000, targetVolume: "35 Unit Aset Utama Terpelihara", status: "Berjalan Baik" },
  ], []);

  const filteredProgramLintasBidang = useMemo(() => {
    return allProgramsList.filter((p) => {
      const q = searchProgramQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.namaProgram.toLowerCase().includes(q) ||
        p.kodeProgram.toLowerCase().includes(q) ||
        p.namaBidang.toLowerCase().includes(q);
      const matchBidang =
        filterBidangProgram === "all" || p.bidang === filterBidangProgram;
      const matchStatus =
        filterStatusProgram === "all" || p.status === filterStatusProgram;
      return matchSearch && matchBidang && matchStatus;
    });
  }, [allProgramsList, searchProgramQuery, filterBidangProgram, filterStatusProgram]);

  const handleExportRKAT = async () => {
    const headers = [
      "Kode Akun", "Nama Program", "Bidang Penanggung Jawab",
      "Pagu Anggaran (Rp)", "Realisasi Terserap (Rp)", "Sisa Pagu (Rp)", "Persentase (%)",
    ];
    const rows = filteredRKAT.map((item) => [
      item.kodeAkun, item.namaProgram, item.bidang,
      item.paguAnggaran, item.realisasi,
      item.paguAnggaran - item.realisasi,
      `${Math.round((item.realisasi / item.paguAnggaran) * 100)}%`,
    ]);
    const { exportToExcel } = await import("@/lib/excel-utils");
    exportToExcel("Laporan_Realisasi_RKAT_BAZNAS", headers, rows);
  };

  const handleExportProgramLintasBidang = async () => {
    const headers = [
      "Kode Program", "Bidang Kerja", "Kategori / Unit", "Nama Program Kerja",
      "Pagu Anggaran (Rp)", "Realisasi Kas (Rp)", "Sisa Anggaran (Rp)",
      "Capaian Serapan (%)", "Target / Volume Capaian", "Status",
    ];
    const rows = filteredProgramLintasBidang.map((p) => [
      p.kodeProgram, p.bidang, p.namaBidang, p.namaProgram,
      p.paguAnggaran, p.realisasi,
      p.paguAnggaran - p.realisasi,
      `${Math.round((p.realisasi / p.paguAnggaran) * 100)}%`,
      p.targetVolume, p.status,
    ]);
    const { exportToExcel } = await import("@/lib/excel-utils");
    exportToExcel("Laporan_Per_Program_Lintas_Bidang_BAZNAS", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Modul — gold accent, no rounded pastel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-5">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-ink">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-baznas-ink font-poppins">
                Bidang III — Keuangan, Perencanaan &amp; Pelaporan
              </h1>
              <span className="bg-baznas-paper border border-baznas-ink-8 px-2.5 py-0.5 text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                Unit Keuangan
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-1">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Hi. Mansyur Ronosumitro, S.Sos</span> (Waka 3) — Staf Keuangan: Fommy Umar &amp; Wafiq Aziza Nursafitri, SE
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD LIKUIDITAS KAS — 1 jumbo + 3 medium */}
      {canAccessTab(currentUser, "bidang3", "dashboard") && activeTab === "dashboard" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* JUMBO stat — Total Pagu RKAT (dark) */}
            <div className="lg:col-span-7 relative bg-baznas-ink text-white p-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-baznas-gold-display" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold">
                  Total Pagu RKAT
                </span>
              </div>
              <p className="display-1 editorial-num text-white leading-none">
                {formatRupiah(totalPagu)}
              </p>
              <p className="mt-4 text-sm text-white/55">
                Tahun Anggaran 2026 · Total {rkatList.length} program kerja lintas bidang
              </p>
            </div>

            {/* 3 MEDIUM stats */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="bg-white border border-baznas-ink-8 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                  Realisasi Terserap
                </p>
                <p className="display-3 editorial-num text-baznas-green-900">
                  {persentaseTotal}%
                </p>
                <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                  {formatRupiah(totalRealisasi)}
                </p>
              </div>

              <div className="bg-white border border-baznas-ink-8 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                  Sisa Pagu
                </p>
                <p className="display-3 editorial-num text-baznas-ink">
                  {formatRupiah(totalSisa)}
                </p>
                <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                  Alokasi penyaluran sisa tahun
                </p>
              </div>

              <div className="bg-white border border-baznas-ink-8 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
                  Saldo Kas &amp; Bank
                </p>
                <p className="display-3 editorial-num text-baznas-ink">
                  Rp 361,95 jt
                </p>
                <p className="text-[11px] text-baznas-ink/55 mt-1.5">
                  Giro Sulutgo · Muamalat · BTN
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REALISASI ANGGARAN VS RKAT */}
      {canAccessTab(currentUser, "bidang3", "rkat") && activeTab === "rkat" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-baznas-ink font-poppins">
                Matriks Realisasi Program Kerja RKAT 2026
              </h3>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Laporan penyerapan dana program per bidang tugas BAZNAS
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportRKAT}
                className="inline-flex items-center gap-1.5 border border-baznas-ink-20 bg-white hover:bg-baznas-paper hover:border-baznas-ink-40 px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 transition-colors min-h-t-target"
              >
                <Download className="h-3.5 w-3.5 text-baznas-gold-display" />
                Export Excel
              </button>

              <button
                onClick={onOpenLaporanPrint}
                className="inline-flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 text-white px-4 py-2.5 text-xs font-bold transition-colors min-h-t-target"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Laporan A4 Landscape
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-baznas-ink/55">Filter Bidang:</span>
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold"
            >
              <option value="all">Semua Bidang (I–IV)</option>
              <option value="Bidang I">Bidang I (Pengumpulan)</option>
              <option value="Bidang II">Bidang II (Pendistribusian)</option>
              <option value="Bidang III">Bidang III (Keuangan)</option>
              <option value="Bidang IV">Bidang IV (Administrasi)</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-xs text-left">
              <thead className="bg-baznas-paper text-[11px] font-bold text-baznas-ink/70 uppercase tracking-wider border-b border-baznas-ink-8">
                <tr>
                  <th className="px-4 py-3">Kode &amp; Bidang</th>
                  <th className="px-4 py-3">Nama Program Kerja</th>
                  <th className="px-4 py-4 text-right">Pagu RKAT</th>
                  <th className="px-4 py-4 text-right">Realisasi</th>
                  <th className="px-4 py-4 text-right">Sisa Anggaran</th>
                  <th className="px-4 py-4 text-center w-36">Serapan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredRKAT.map((item) => {
                  const sisa = item.paguAnggaran - item.realisasi;
                  const pct = Math.round((item.realisasi / item.paguAnggaran) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-baznas-paper/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-baznas-ink">
                        {item.kodeAkun}
                        <span className="block text-[10px] text-baznas-ink/45 font-normal">{item.bidang}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-baznas-ink">{item.namaProgram}</td>
                      <td className="px-4 py-4 text-right text-baznas-ink/80">{formatRupiah(item.paguAnggaran)}</td>
                      <td className="px-4 py-4 text-right font-bold text-baznas-green-900">{formatRupiah(item.realisasi)}</td>
                      <td className="px-4 py-4 text-right text-baznas-ink/55">{formatRupiah(sisa)}</td>
                      <td className="px-4 py-4 text-center font-bold text-baznas-ink">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB LAPORAN / TABEL PER PROGRAM TIAP BIDANG */}
      {canAccessTab(currentUser, "bidang3", "laporan_program") && activeTab === "laporan_program" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-baznas-ink font-poppins">
                  Laporan Realisasi &amp; Kinerja per Program Tiap Bidang
                </h3>
                <span className="bg-baznas-paper border border-baznas-ink-8 text-baznas-ink text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider">
                  {filteredProgramLintasBidang.length} Program
                </span>
              </div>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Monitoring menyeluruh per program kerja dari Bidang 1, 2, 3, dan 4 beserta pagu, realisasi dan target penerima
              </p>
            </div>

            <button
              onClick={handleExportProgramLintasBidang}
              className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              <Download className="h-4 w-4" />
              Export Laporan Program (Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
              <input
                type="text"
                value={searchProgramQuery}
                onChange={(e) => setSearchProgramQuery(e.target.value)}
                placeholder="Cari Kode atau Nama Program..."
                className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink placeholder:text-baznas-ink/35 focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>

            <select
              value={filterBidangProgram}
              onChange={(e) => setFilterBidangProgram(e.target.value)}
              className="border border-baznas-ink-20 bg-white px-4 py-4 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
            >
              <option value="all">Semua Bidang (I s/d IV)</option>
              <option value="Bidang I">Bidang I — Pengumpulan</option>
              <option value="Bidang II">Bidang II — Pendistribusian &amp; Pendayagunaan</option>
              <option value="Bidang III">Bidang III — Keuangan</option>
              <option value="Bidang IV">Bidang IV — Administrasi &amp; SDM</option>
            </select>

            <select
              value={filterStatusProgram}
              onChange={(e) => setFilterStatusProgram(e.target.value)}
              className="border border-baznas-ink-20 bg-white px-4 py-4 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="all">Semua Status Evaluasi</option>
              <option value="Berjalan Baik">Berjalan Baik</option>
              <option value="Perlu Percepatan">Perlu Percepatan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/80">
              <thead className="bg-baznas-paper text-[11px] font-bold text-baznas-ink/70 uppercase tracking-wider border-b border-baznas-ink-8">
                <tr>
                  <th className="py-3 px-4">Kode &amp; Bidang</th>
                  <th className="py-3 px-4">Nama Program Kerja</th>
                  <th className="py-3 px-4">Target / Volume</th>
                  <th className="py-3 px-4 text-right">Pagu (Rp)</th>
                  <th className="py-3 px-4 text-right">Realisasi (Rp)</th>
                  <th className="py-3 px-4 text-right">Sisa (Rp)</th>
                  <th className="py-3 px-4 text-center">Serapan (%)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredProgramLintasBidang.map((prog) => {
                  const sisa = prog.paguAnggaran - prog.realisasi;
                  const pct = Math.round((prog.realisasi / prog.paguAnggaran) * 100);
                  return (
                    <tr key={prog.id} className="hover:bg-baznas-paper/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-baznas-ink block">{prog.kodeProgram}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 inline-block mt-0.5 ${BIDANG_BADGE[prog.bidang]}`}>
                          {prog.bidang}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-baznas-ink block">{prog.namaProgram}</span>
                        <span className="text-[11px] text-baznas-ink/45">{prog.namaBidang}</span>
                      </td>
                      <td className="py-3.5 px-4 text-baznas-ink/80 font-medium">{prog.targetVolume}</td>
                      <td className="py-3.5 px-4 text-right text-baznas-ink/80">{formatRupiah(prog.paguAnggaran)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-baznas-green-900">{formatRupiah(prog.realisasi)}</td>
                      <td className="py-3.5 px-4 text-right text-baznas-ink/55">{formatRupiah(sisa)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-baznas-ink editorial-num">{pct}%</span>
                          <div className="w-16 bg-baznas-paper h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                pct >= 80 ? "bg-baznas-green-800" : pct >= 50 ? "bg-baznas-gold-display" : "bg-baznas-ink/40"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[prog.status]}`}>
                          {prog.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BUKU KAS UMUM & JURNAL */}
      {canAccessTab(currentUser, "bidang3", "bukukas") && activeTab === "bukukas" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Buku Kas Umum (BKU) Penerimaan &amp; Pengeluaran
          </h3>
          <p className="text-xs text-baznas-ink/55">
            Pencatatan mutasi kas harian loket dan rekening bank BAZNAS
          </p>
          <div className="overflow-x-auto border border-baznas-ink-8 text-xs">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-baznas-paper text-baznas-ink/70 font-bold text-[11px] uppercase tracking-wider border-b border-baznas-ink-8">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Uraian Transaksi</th>
                  <th className="p-3 text-right text-baznas-green-900">Penerimaan (Debet)</th>
                  <th className="p-3 text-right text-rose-700">Penyaluran (Kredit)</th>
                  <th className="p-3 text-right">Saldo Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                <tr className="hover:bg-baznas-paper/30">
                  <td className="p-3 text-baznas-ink/80">23/09/2026</td>
                  <td className="p-3 text-baznas-ink">Penerimaan Zakat Profesi ASN Dikda (BZ-202609-00142)</td>
                  <td className="p-3 text-right font-bold text-baznas-green-900">+ Rp 250.000</td>
                  <td className="p-3 text-right text-baznas-ink/35">-</td>
                  <td className="p-3 text-right font-bold text-baznas-ink editorial-num">Rp 361.950.000</td>
                </tr>
                <tr className="hover:bg-baznas-paper/30">
                  <td className="p-3 text-baznas-ink/80">22/09/2026</td>
                  <td className="p-3 text-baznas-ink">Penyaluran Beasiswa Santri Yatim 15 Orang (SPK-011)</td>
                  <td className="p-3 text-right text-baznas-ink/35">-</td>
                  <td className="p-3 text-right font-bold text-rose-700">- Rp 18.000.000</td>
                  <td className="p-3 text-right font-bold text-baznas-ink editorial-num">Rp 361.700.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. LAPORAN KEUANGAN PSAK 109 */}
      {canAccessTab(currentUser, "bidang3", "laporan") && activeTab === "laporan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-baznas-ink font-poppins">
                Laporan Keuangan Standar Akuntansi Zakat (PSAK 109)
              </h3>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Laporan Posisi Keuangan, Perubahan Dana, dan Arus Kas
              </p>
            </div>
            <button
              onClick={onOpenLaporanPrint}
              className="inline-flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 text-white px-4 py-2.5 text-xs font-bold transition-colors min-h-t-target"
            >
              <Printer className="h-4 w-4" />
              Cetak Dokumen Resmi
            </button>
          </div>
        </div>
      )}

      {/* 6. LPJ & PENGATURAN */}
      {canAccessTab(currentUser, "bidang3", "lpj") && activeTab === "lpj" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Laporan Pertanggungjawaban (LPJ) Program Penyaluran
          </h3>
          <p className="text-xs text-baznas-ink/55">
            Seluruh LPJ terdokumentasi dan siap diaudit oleh Kantor Akuntan Publik (KAP) independen.
          </p>
        </div>
      )}

      {canAccessTab(currentUser, "bidang3", "pengaturan") && activeTab === "pengaturan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-8 max-w-xl text-sm">
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Pengaturan Akun &amp; Kode Rekening Akuntansi
          </h3>
          <p className="text-baznas-ink/65">
            Konfigurasi Bagan Akun Standar (Chart of Accounts) BAZNAS RI.
          </p>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
