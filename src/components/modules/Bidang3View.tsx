"use client";

import React, { useState, useMemo } from "react";
import { ItemRKAT, Bidang3Tab } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel-utils";
import {
  LineChart,
  Printer,
  TrendingUp,
  Download,
  BookOpenCheck,
  FileSpreadsheet,
  Settings,
  Layers,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
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
  onOpenLaporanPrint: () => void;
  activeTab?: Bidang3Tab;
  onTabChange?: (tab: Bidang3Tab) => void;
}

export const Bidang3View: React.FC<Bidang3ViewProps> = ({
  rkatList,
  onOpenLaporanPrint,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<Bidang3Tab>("dashboard");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: Bidang3Tab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

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
    // Bidang I: Pengumpulan
    {
      id: "prog-1",
      kodeProgram: "PRG-B1-01",
      bidang: "Bidang I",
      namaBidang: "Pengumpulan ZIS",
      namaProgram: "Optimalisasi UPZ & Payroll Zakat Profesi ASN",
      paguAnggaran: 120000000,
      realisasi: 98500000,
      targetVolume: "14 OPD & 650 Muzakki ASN",
      status: "Berjalan Baik",
    },
    {
      id: "prog-2",
      kodeProgram: "PRG-B1-02",
      bidang: "Bidang I",
      namaBidang: "Pengumpulan ZIS",
      namaProgram: "Pengumpulan Zakat Maal & Zakat Fitrah Ramadhan",
      paguAnggaran: 250000000,
      realisasi: 215000000,
      targetVolume: "4.500 Muzakki Masyarakat",
      status: "Berjalan Baik",
    },
    {
      id: "prog-3",
      kodeProgram: "PRG-B1-03",
      bidang: "Bidang I",
      namaBidang: "Pengumpulan ZIS",
      namaProgram: "Kampanye Infak Terikat & Sedekah Harian Digital",
      paguAnggaran: 45000000,
      realisasi: 32000000,
      targetVolume: "10 Gerai Loket & QRIS",
      status: "Berjalan Baik",
    },
    {
      id: "prog-4",
      kodeProgram: "PRG-B1-04",
      bidang: "Bidang I",
      namaBidang: "Pengumpulan ZIS",
      namaProgram: "Penerimaan DSKL, Fidyah, Kafarat & Qurban",
      paguAnggaran: 85000000,
      realisasi: 54000000,
      targetVolume: "120 Hewan Qurban & Fidyah",
      status: "Perlu Percepatan",
    },

    // Bidang II: Pendistribusian & Pendayagunaan
    {
      id: "prog-5",
      kodeProgram: "PRG-B2-01",
      bidang: "Bidang II",
      namaBidang: "Pendistribusian (Pendidikan)",
      namaProgram: "BAZNAS Cerdas — Beasiswa Santri & Dhuafa",
      paguAnggaran: 180000000,
      realisasi: 145000000,
      targetVolume: "150 Santri & Siswa Miskin",
      status: "Berjalan Baik",
    },
    {
      id: "prog-6",
      kodeProgram: "PRG-B2-02",
      bidang: "Bidang II",
      namaBidang: "Pendistribusian (Kesehatan)",
      namaProgram: "BAZNAS Sehat — Bantuan Obat & Ambulans Dhuafa",
      paguAnggaran: 95000000,
      realisasi: 78500000,
      targetVolume: "210 Pasien SKTM Non-BPJS",
      status: "Berjalan Baik",
    },
    {
      id: "prog-7",
      kodeProgram: "PRG-B2-03",
      bidang: "Bidang II",
      namaBidang: "Pendistribusian (Dakwah)",
      namaProgram: "BAZNAS Peduli Dakwah — Bisyarah Da'i Perbatasan",
      paguAnggaran: 60000000,
      realisasi: 45000000,
      targetVolume: "25 Da'i & 40 Mualaf Binaan",
      status: "Berjalan Baik",
    },
    {
      id: "prog-8",
      kodeProgram: "PRG-B2-04",
      bidang: "Bidang II",
      namaBidang: "Pendayagunaan (Ekonomi)",
      namaProgram: "BAZNAS Mandiri — Modal Usaha Mikro Z-Mart",
      paguAnggaran: 150000000,
      realisasi: 110000000,
      targetVolume: "30 Mustahik Pelaku Usaha",
      status: "Berjalan Baik",
    },
    {
      id: "prog-9",
      kodeProgram: "PRG-B2-05",
      bidang: "Bidang II",
      namaBidang: "Pendayagunaan (Vokasi)",
      namaProgram: "Pelatihan Keterampilan Teknis & Vokasi BLK",
      paguAnggaran: 70000000,
      realisasi: 38000000,
      targetVolume: "50 Pemuda Usia Produktif",
      status: "Perlu Percepatan",
    },
    {
      id: "prog-10",
      kodeProgram: "PRG-B2-06",
      bidang: "Bidang II",
      namaBidang: "Pendayagunaan (Sanitasi)",
      namaProgram: "Instalasi Air Bersih & Jamban Sehat Keluarga Desil 1",
      paguAnggaran: 65000000,
      realisasi: 50000000,
      targetVolume: "15 Titik Sanitasi Wilayah Rentan",
      status: "Berjalan Baik",
    },

    // Bidang III: Keuangan, Perencanaan & Pelaporan
    {
      id: "prog-11",
      kodeProgram: "PRG-B3-01",
      bidang: "Bidang III",
      namaBidang: "Keuangan & RKAT",
      namaProgram: "Penyusunan Rencana Kerja & Anggaran Tahunan (RKAT)",
      paguAnggaran: 35000000,
      realisasi: 30000000,
      targetVolume: "1 Dokumen RKAT Terpadu",
      status: "Selesai",
    },
    {
      id: "prog-12",
      kodeProgram: "PRG-B3-02",
      bidang: "Bidang III",
      namaBidang: "Keuangan & RKAT",
      namaProgram: "Pengauditan Syariah & KAP Independen (Opini WTP)",
      paguAnggaran: 45000000,
      realisasi: 35000000,
      targetVolume: "1 Laporan Audit Keuangan",
      status: "Berjalan Baik",
    },
    {
      id: "prog-13",
      kodeProgram: "PRG-B3-03",
      bidang: "Bidang III",
      namaBidang: "Keuangan & RKAT",
      namaProgram: "Modernisasi Sistem Informasi Manajemen Akuntansi Zakat",
      paguAnggaran: 30000000,
      realisasi: 28000000,
      targetVolume: "1 Server Cloud & Lisensi PSAK",
      status: "Berjalan Baik",
    },

    // Bidang IV: Administrasi, SDM & Umum
    {
      id: "prog-14",
      kodeProgram: "PRG-B4-01",
      bidang: "Bidang IV",
      namaBidang: "Administrasi & Umum",
      namaProgram: "Digitalisasi Tata Persuratan & Pengarsipan Resmi",
      paguAnggaran: 25000000,
      realisasi: 22000000,
      targetVolume: "1.200 Surat Masuk & Keluar",
      status: "Berjalan Baik",
    },
    {
      id: "prog-15",
      kodeProgram: "PRG-B4-02",
      bidang: "Bidang IV",
      namaBidang: "Administrasi & SDM",
      namaProgram: "Sertifikasi Kompetensi Amil Zakat & Pembinaan Staf",
      paguAnggaran: 40000000,
      realisasi: 28000000,
      targetVolume: "18 Personel Amil BAZNAS",
      status: "Berjalan Baik",
    },
    {
      id: "prog-16",
      kodeProgram: "PRG-B4-03",
      bidang: "Bidang IV",
      namaBidang: "Administrasi & Aset",
      namaProgram: "Pemeliharaan Inventaris Kantor & Operasional Gedung",
      paguAnggaran: 50000000,
      realisasi: 42000000,
      targetVolume: "35 Unit Aset Utama Terpelihara",
      status: "Berjalan Baik",
    },
  ], []);

  // Filter Program Lintas Bidang
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

  // Export Laporan RKAT
  const handleExportRKAT = () => {
    const headers = [
      "Kode Akun",
      "Nama Program",
      "Bidang Penanggung Jawab",
      "Pagu Anggaran (Rp)",
      "Realisasi Terserap (Rp)",
      "Sisa Pagu (Rp)",
      "Persentase (%)",
    ];
    const rows = filteredRKAT.map((item) => [
      item.kodeAkun,
      item.namaProgram,
      item.bidang,
      item.paguAnggaran,
      item.realisasi,
      item.paguAnggaran - item.realisasi,
      `${Math.round((item.realisasi / item.paguAnggaran) * 100)}%`,
    ]);
    exportToExcel("Laporan_Realisasi_RKAT_BAZNAS", headers, rows);
  };

  // Export Laporan Program Lintas Bidang
  const handleExportProgramLintasBidang = () => {
    const headers = [
      "Kode Program",
      "Bidang Kerja",
      "Kategori / Unit",
      "Nama Program Kerja",
      "Pagu Anggaran (Rp)",
      "Realisasi Kas (Rp)",
      "Sisa Anggaran (Rp)",
      "Capaian Serapan (%)",
      "Target / Volume Capaian",
      "Status",
    ];
    const rows = filteredProgramLintasBidang.map((p) => [
      p.kodeProgram,
      p.bidang,
      p.namaBidang,
      p.namaProgram,
      p.paguAnggaran,
      p.realisasi,
      p.paguAnggaran - p.realisasi,
      `${Math.round((p.realisasi / p.paguAnggaran) * 100)}%`,
      p.targetVolume,
      p.status,
    ]);
    exportToExcel("Laporan_Per_Program_Lintas_Bidang_BAZNAS", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
            <LineChart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-poppins">
                Bidang III — Keuangan, Perencanaan &amp; Pelaporan
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Unit Keuangan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pejabat: <span className="font-semibold text-slate-700">Hi. Mansyur Ronosumitro, S.Sos</span> (Waka 3) — Staf Keuangan: Fommy Umar &amp; Wafiq Aziza Nursafitri, SE
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD LIKUIDITAS KAS */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pagu RKAT
              </span>
              <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
                {formatRupiah(totalPagu)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Tahun Anggaran 2026</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Realisasi Terserap
              </span>
              <p className="text-2xl font-bold text-baznas-green-800 font-poppins mt-2">
                {formatRupiah(totalRealisasi)}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">Serapan Capaian: {persentaseTotal}%</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Sisa Pagu Tersedia
              </span>
              <p className="text-2xl font-bold text-amber-900 font-poppins mt-2">
                {formatRupiah(totalSisa)}
              </p>
              <p className="text-[11px] text-amber-700 mt-1">Alokasi Penyaluran Sisa Tahun</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Saldo Kas &amp; Bank
              </span>
              <p className="text-2xl font-bold text-blue-700 font-poppins mt-2">
                Rp 361.950.000
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Giro Sulutgo, Muamalat, BTN</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. REALISASI ANGGARAN VS RKAT (EXPORT EXCEL & CETAK A4) */}
      {activeTab === "rkat" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Matriks Realisasi Program Kerja RKAT 2026
              </h3>
              <p className="text-xs text-slate-500">
                Laporan penyerapan dana program per bidang tugas BAZNAS
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportRKAT}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-amber-600" />
                Export Excel
              </button>

              <button
                onClick={onOpenLaporanPrint}
                className="flex items-center gap-2 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-4 py-2 text-xs font-semibold text-white shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Laporan A4 Landscape
              </button>
            </div>
          </div>

          {/* Filter Bidang */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-slate-400">Filter Bidang:</span>
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-semibold"
            >
              <option value="all">Semua Bidang (I–IV)</option>
              <option value="Bidang I">Bidang I (Pengumpulan)</option>
              <option value="Bidang II">Bidang II (Pendistribusian)</option>
              <option value="Bidang III">Bidang III (Keuangan)</option>
              <option value="Bidang IV">Bidang IV (Administrasi)</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode &amp; Bidang</th>
                  <th className="px-4 py-3">Nama Program Kerja</th>
                  <th className="px-4 py-3 text-right">Pagu RKAT</th>
                  <th className="px-4 py-3 text-right">Realisasi</th>
                  <th className="px-4 py-3 text-right">Sisa Anggaran</th>
                  <th className="px-4 py-3 text-center w-36">Serapan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRKAT.map((item) => {
                  const sisa = item.paguAnggaran - item.realisasi;
                  const pct = Math.round((item.realisasi / item.paguAnggaran) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {item.kodeAkun}
                        <span className="block text-[10px] text-slate-400 font-normal">{item.bidang}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.namaProgram}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatRupiah(item.paguAnggaran)}</td>
                      <td className="px-4 py-3 text-right font-bold text-baznas-green-800">{formatRupiah(item.realisasi)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{formatRupiah(sisa)}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB KHUSUS: LAPORAN / TABEL PER PROGRAM TIAP BIDANG */}
      {activeTab === "laporan_program" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  Laporan Realisasi &amp; Kinerja per Program Tiap Bidang
                </h3>
                <span className="rounded-full bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 font-bold">
                  {filteredProgramLintasBidang.length} Program
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring menyeluruh per program kerja dari Bidang 1, 2, 3, dan 4 beserta pagu, realisasi dan target penerima
              </p>
            </div>

            <button
              onClick={handleExportProgramLintasBidang}
              className="flex items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Download className="h-4 w-4" />
              Export Laporan Program (Excel)
            </button>
          </div>

          {/* Filter Bar Laporan Program */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchProgramQuery}
                onChange={(e) => setSearchProgramQuery(e.target.value)}
                placeholder="Cari Kode atau Nama Program..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
              />
            </div>

            <select
              value={filterBidangProgram}
              onChange={(e) => setFilterBidangProgram(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
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
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Status Evaluasi</option>
              <option value="Berjalan Baik">Berjalan Baik</option>
              <option value="Perlu Percepatan">Perlu Percepatan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Tabel Program Lengkap */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {filteredProgramLintasBidang.map((prog) => {
                  const sisa = prog.paguAnggaran - prog.realisasi;
                  const pct = Math.round((prog.realisasi / prog.paguAnggaran) * 100);

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">{prog.kodeProgram}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                            prog.bidang === "Bidang I"
                              ? "bg-emerald-100 text-emerald-800"
                              : prog.bidang === "Bidang II"
                              ? "bg-rose-100 text-rose-800"
                              : prog.bidang === "Bidang III"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {prog.bidang}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{prog.namaProgram}</span>
                        <span className="text-[11px] text-slate-400">{prog.namaBidang}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{prog.targetVolume}</td>
                      <td className="py-3.5 px-4 text-right text-slate-700">
                        {formatRupiah(prog.paguAnggaran)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-baznas-green-900">
                        {formatRupiah(prog.realisasi)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {formatRupiah(sisa)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-800">{pct}%</span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80 ? "bg-emerald-600" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            prog.status === "Berjalan Baik"
                              ? "bg-emerald-100 text-emerald-800"
                              : prog.status === "Selesai"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
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
      {activeTab === "bukukas" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Buku Kas Umum (BKU) Penerimaan &amp; Pengeluaran
          </h3>
          <p className="text-xs text-slate-500">
            Pencatatan mutasi kas harian loket dan rekening bank BAZNAS
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Uraian Transaksi</th>
                  <th className="p-3 text-right text-emerald-700">Penerimaan (Debet)</th>
                  <th className="p-3 text-right text-rose-700">Penyaluran (Kredit)</th>
                  <th className="p-3 text-right">Saldo Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3">23/09/2026</td>
                  <td className="p-3">Penerimaan Zakat Profesi ASN Dikda (BZ-202609-00142)</td>
                  <td className="p-3 text-right font-bold text-emerald-700">+ Rp 250.000</td>
                  <td className="p-3 text-right text-slate-400">-</td>
                  <td className="p-3 text-right font-bold">Rp 361.950.000</td>
                </tr>
                <tr>
                  <td className="p-3">22/09/2026</td>
                  <td className="p-3">Penyaluran Beasiswa Santri Yatim 15 Orang (SPK-011)</td>
                  <td className="p-3 text-right text-slate-400">-</td>
                  <td className="p-3 text-right font-bold text-rose-700">- Rp 18.000.000</td>
                  <td className="p-3 text-right font-bold">Rp 361.700.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. LAPORAN KEUANGAN PSAK 109 */}
      {activeTab === "laporan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Laporan Keuangan Standar Akuntansi Zakat (PSAK 109)
              </h3>
              <p className="text-xs text-slate-500">
                Laporan Posisi Keuangan, Perubahan Dana, dan Arus Kas
              </p>
            </div>
            <button
              onClick={onOpenLaporanPrint}
              className="flex items-center gap-2 rounded-xl bg-baznas-green-800 text-white px-4 py-2 text-xs font-bold"
            >
              <Printer className="h-4 w-4" />
              Cetak Dokumen Resmi
            </button>
          </div>
        </div>
      )}

      {/* 6. LPJ & PENGATURAN */}
      {activeTab === "lpj" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Laporan Pertanggungjawaban (LPJ) Program Penyaluran
          </h3>
          <p className="text-xs text-slate-500">
            Seluruh LPJ terdokumentasi dan siap diaudit oleh Kantor Akuntan Publik (KAP) independen.
          </p>
        </div>
      )}

      {activeTab === "pengaturan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-xl text-xs">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Pengaturan Akun &amp; Kode Rekening Akuntansi
          </h3>
          <p className="text-slate-500">
            Konfigurasi Bagan Akun Standar (Chart of Accounts) BAZNAS RI.
          </p>
        </div>
      )}
    </div>
  );
};
