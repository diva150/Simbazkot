"use client";

import React, { useState, useMemo } from "react";
import {
  Mustahik,
  PermohonanPencairan,
  Bidang2Tab,
  DesilType,
  KategoriPilarBidang2,
  SubProgramPendistribusian,
  SubProgramPendayagunaan,
} from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { exportToExcel, downloadTemplateMustahik } from "@/lib/excel-utils";
import { ImportExcelModal } from "@/components/common/ImportExcelModal";
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  HeartPulse,
  BookOpen,
  Briefcase,
  Plus,
  Download,
  Upload,
  Layers,
  FileCheck,
  Settings,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Droplet,
  UserPlus,
  Check,
  Building,
  Sparkles,
  Edit,
  Trash2,
  Share2,
  Copy,
} from "lucide-react";

interface Bidang2ViewProps {
  mustahikList: Mustahik[];
  pencairanList: PermohonanPencairan[];
  onApprovePencairan: (id: string) => void;
  onRejectPencairan: (id: string, reason: string) => void;
  onConfirmPencairan?: (id: string) => void;
  onAddPencairan: (pencairan: PermohonanPencairan) => void;
  onImportMustahik: (newMustahik: Mustahik[]) => void;
  onAddMustahik?: (newMustahik: Mustahik) => void;
  onUpdateMustahik?: (updatedMustahik: Mustahik) => void;
  onDeleteMustahik?: (id: string) => void;
  activeTab?: Bidang2Tab;
  onTabChange?: (tab: Bidang2Tab) => void;
}

export const Bidang2View: React.FC<Bidang2ViewProps> = ({
  mustahikList,
  pencairanList,
  onApprovePencairan,
  onRejectPencairan,
  onConfirmPencairan,
  onAddPencairan,
  onImportMustahik,
  onAddMustahik,
  onUpdateMustahik,
  onDeleteMustahik,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<Bidang2Tab>("dashboard");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: Bidang2Tab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddMustahikModalOpen, setIsAddMustahikModalOpen] = useState(false);

  // Active Sub-Program Filters
  const [activePendistribusianSub, setActivePendistribusianSub] = useState<SubProgramPendistribusian | "all">("all");
  const [activePendayagunaanSub, setActivePendayagunaanSub] = useState<SubProgramPendayagunaan | "all">("all");

  // Search & Filter States
  const [searchMustahik, setSearchMustahik] = useState<string>("");
  const [filterDesil, setFilterDesil] = useState<string>("all");
  const [filterKategoriBesar, setFilterKategoriBesar] = useState<string>("all");
  const [filterSubProgram, setFilterSubProgram] = useState<string>("all");

  // Sub-program Dedicated Filter States
  const [searchSubProg, setSearchSubProg] = useState("");
  const [filterSubProgDesil, setFilterSubProgDesil] = useState("all");

  // Modal Pengajuan Pencairan Baru
  const [showModalNew, setShowModalNew] = useState(false);
  const [namaProgram, setNamaProgram] = useState("");
  const [kategoriBesar, setKategoriBesar] = useState<KategoriPilarBidang2>("pendistribusian");
  const [subProgram, setSubProgram] = useState<SubProgramPendistribusian | SubProgramPendayagunaan>("Pendidikan");
  const [nominal, setNominal] = useState(5000000);
  const [jumlahMustahik, setJumlahMustahik] = useState(5);
  const [keterangan, setKeterangan] = useState("");

  // Modal Form Tambah Mustahik / Penerima Baru
  const [targetProgramKategori, setTargetProgramKategori] = useState<KategoriPilarBidang2>("pendistribusian");
  const [targetSubProgram, setTargetSubProgram] = useState<SubProgramPendistribusian | SubProgramPendayagunaan>("Pendidikan");
  const [mustahikNama, setMustahikNama] = useState("");
  const [mustahikNik, setMustahikNik] = useState("");
  const [mustahikKk, setMustahikKk] = useState("");
  const [mustahikAsnaf, setMustahikAsnaf] = useState<Mustahik["asnaf"]>("Miskin");
  const [mustahikDesil, setMustahikDesil] = useState<DesilType>("Desil 1");
  const [mustahikAlamat, setMustahikAlamat] = useState("");
  const [mustahikKondisi, setMustahikKondisi] = useState("");
  const [mustahikBantuan, setMustahikBantuan] = useState(1500000);

  // Update subProgram default saat kategoriBesar berganti di modal
  const handleKategoriBesarChange = (newKat: KategoriPilarBidang2) => {
    setKategoriBesar(newKat);
    if (newKat === "pendistribusian") {
      setSubProgram("Pendidikan");
    } else {
      setSubProgram("Ekonomi");
    }
  };

  // Filtering Mustahik Utama
  const filteredMustahik = useMemo(() => {
    return mustahikList.filter((m) => {
      const q = searchMustahik.toLowerCase();
      const matchSearch =
        !q ||
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        (m.kk && m.kk.includes(q)) ||
        m.alamat.toLowerCase().includes(q);
      const matchDesil = filterDesil === "all" || m.desil === filterDesil;
      const matchKategori = filterKategoriBesar === "all" || m.kategoriBesar === filterKategoriBesar;
      const matchSub = filterSubProgram === "all" || m.namaSubProgram === filterSubProgram;
      return matchSearch && matchDesil && matchKategori && matchSub;
    });
  }, [mustahikList, searchMustahik, filterDesil, filterKategoriBesar, filterSubProgram]);

  // Filtering Mustahik Khusus Program Pendistribusian
  const filteredPendistribusianList = useMemo(() => {
    return mustahikList.filter((m) => {
      if (m.kategoriBesar !== "pendistribusian") return false;
      const matchSub = activePendistribusianSub === "all" || m.namaSubProgram === activePendistribusianSub;
      const q = searchSubProg.toLowerCase();
      const matchQuery = !q || m.namaLengkap.toLowerCase().includes(q) || m.nik.includes(q) || m.alamat.toLowerCase().includes(q);
      const matchDesil = filterSubProgDesil === "all" || m.desil === filterSubProgDesil;
      return matchSub && matchQuery && matchDesil;
    });
  }, [mustahikList, activePendistribusianSub, searchSubProg, filterSubProgDesil]);

  // Filtering Mustahik Khusus Program Pendayagunaan
  const filteredPendayagunaanList = useMemo(() => {
    return mustahikList.filter((m) => {
      if (m.kategoriBesar !== "pendayagunaan") return false;
      const matchSub = activePendayagunaanSub === "all" || m.namaSubProgram === activePendayagunaanSub;
      const q = searchSubProg.toLowerCase();
      const matchQuery = !q || m.namaLengkap.toLowerCase().includes(q) || m.nik.includes(q) || m.alamat.toLowerCase().includes(q);
      const matchDesil = filterSubProgDesil === "all" || m.desil === filterSubProgDesil;
      return matchSub && matchQuery && matchDesil;
    });
  }, [mustahikList, activePendayagunaanSub, searchSubProg, filterSubProgDesil]);

  // Export Mustahik to Excel
  const handleExportMustahik = (listToExport = filteredMustahik, filename = "Data_Mustahik_BAZNAS") => {
    const headers = [
      "Nama Lengkap",
      "NIK",
      "No. KK",
      "Asnaf",
      "Tingkat Desil",
      "Kategori Pilar",
      "Sub-Program",
      "Status Kelayakan",
      "Total Bantuan (Rp)",
      "Alamat",
      "Kondisi",
    ];
    const rows = listToExport.map((m) => [
      m.namaLengkap,
      m.nik,
      m.kk || "-",
      m.asnaf,
      m.desil,
      m.kategoriBesar === "pendistribusian" ? "PENDISTRIBUSIAN" : "PENDAYAGUNAAN",
      m.namaSubProgram,
      m.statusKelayakan.toUpperCase(),
      m.totalBantuanDiterima,
      m.alamat,
      m.kondisi,
    ]);
    exportToExcel(filename, headers, rows);
  };

  // Import Mustahik from CSV
  const handleImportParsedMustahik = (rows: string[][]) => {
    const imported: Mustahik[] = rows.map((r, idx) => ({
      id: `mus-imp-${Date.now()}-${idx}`,
      namaLengkap: r[0] || "Mustahik Baru",
      nik: r[1] || `717100000000000${idx}`,
      kk: `717100000000000${idx}`,
      asnaf: (r[2] as any) || "Miskin",
      desil: (r[3] as any) || "Desil 1",
      kategoriBesar: (r[4] === "pendayagunaan" ? "pendayagunaan" : "pendistribusian"),
      namaSubProgram: (r[5] as any) || "Pendidikan",
      alamat: r[6] || "Kota Manado",
      kondisi: r[7] || "Prasejahtera",
      statusKelayakan: "aktif",
      totalBantuanDiterima: 0,
      terakhirDibantu: new Date().toISOString().split("T")[0],
    }));
    onImportMustahik(imported);
  };

  // Tambah Penerima Program Baru
  const handleSaveMustahikForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mustahikNama.trim()) return;

    const newM: Mustahik = {
      id: `mus-${Date.now()}`,
      namaLengkap: mustahikNama.trim(),
      nik: mustahikNik.trim() || `7171${Date.now().toString().slice(-12)}`,
      kk: mustahikKk.trim() || `7171${Date.now().toString().slice(-12)}`,
      asnaf: mustahikAsnaf,
      desil: mustahikDesil,
      kategoriBesar: targetProgramKategori,
      namaSubProgram: targetSubProgram,
      alamat: mustahikAlamat.trim() || "Kota Manado",
      kondisi: mustahikKondisi.trim() || "Keluarga Prasejahtera",
      statusKelayakan: "aktif",
      totalBantuanDiterima: mustahikBantuan,
      terakhirDibantu: new Date().toISOString().split("T")[0],
    };

    if (onAddMustahik) {
      onAddMustahik(newM);
    } else {
      mustahikList.unshift(newM);
    }

    setIsAddMustahikModalOpen(false);
    setMustahikNama("");
    setMustahikNik("");
    setMustahikKk("");
    setMustahikAlamat("");
    setMustahikKondisi("");
  };

  // Open Add Mustahik Modal for Specific Subprogram
  const handleOpenAddForProgram = (
    kat: KategoriPilarBidang2,
    sub: SubProgramPendistribusian | SubProgramPendayagunaan
  ) => {
    setTargetProgramKategori(kat);
    setTargetSubProgram(sub);
    setIsAddMustahikModalOpen(true);
  };

  // Buat SPK Pencairan Baru
  const handleCreatePencairan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProgram) return;

    const newP: PermohonanPencairan = {
      id: `penc-${Date.now()}`,
      nomorSPK: `SPK-BAZNAS/09/2026/0${Math.floor(20 + Math.random() * 80)}`,
      namaProgram,
      kategoriBesar,
      namaSubProgram: subProgram,
      nominal,
      jumlahMustahik,
      pemohon: "Amil Bidang II",
      status: "diajukan",
      tanggal: new Date().toISOString().split("T")[0],
      keterangan,
    };

    onAddPencairan(newP);
    setShowModalNew(false);
    setNamaProgram("");
    setKeterangan("");
    setActiveTab("pencairan");
  };

  // State Edit Mustahik & Toast Notifikasi
  const [editingMustahik, setEditingMustahik] = useState<Mustahik | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleOpenEdit = (m: Mustahik) => {
    setEditingMustahik({ ...m });
  };

  const handleDeleteMustahikItem = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data penerima "${name}"?`)) {
      if (onDeleteMustahik) {
        onDeleteMustahik(id);
      } else {
        const idx = mustahikList.findIndex((m) => m.id === id);
        if (idx !== -1) mustahikList.splice(idx, 1);
      }
      setShareToast(`Data penerima "${name}" berhasil dihapus.`);
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  const handleShareMustahik = (m: Mustahik) => {
    const text = `*INFORMASI MUSTAHIK BAZNAS*\nNama: ${m.namaLengkap}\nNIK: ${m.nik}\nKategori: ${m.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} (${m.namaSubProgram})\nAsnaf: ${m.asnaf} | Desil: ${m.desil}\nTotal Bantuan: ${formatRupiah(m.totalBantuanDiterima)}\nAlamat: ${m.alamat}\nKondisi: ${m.kondisi}\nStatus: ${m.statusKelayakan.toUpperCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareToast(`Informasi mustahik "${m.namaLengkap}" berhasil disalin ke papan klip!`);
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  const handleSaveEditMustahik = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMustahik) return;
    if (onUpdateMustahik) {
      onUpdateMustahik(editingMustahik);
    } else {
      const idx = mustahikList.findIndex((m) => m.id === editingMustahik.id);
      if (idx !== -1) mustahikList[idx] = editingMustahik;
    }
    setShareToast(`Perubahan data mustahik "${editingMustahik.namaLengkap}" tersimpan.`);
    setEditingMustahik(null);
    setTimeout(() => setShareToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Aksi */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-poppins">
                Bidang II — Pendistribusian &amp; Pendayagunaan
              </h1>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                Unit Penyaluran
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pejabat: <span className="font-semibold text-slate-700">Riton Ma&apos;ruf</span> (Waka 2) — Staf: Saleha Zakaria (Pendistribusian) &amp; Norma Ningsih Bungi, S.Pd (Pendayagunaan)
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD RINGKASAN BIDANG 2 */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mustahik Terdata
              </span>
              <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
                {mustahikList.length} <span className="text-sm font-normal text-slate-500">Jiwa / KK</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Terverifikasi Asnaf &amp; SKTM</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Desil 1 (Kemiskinan Ekstrem)
              </span>
              <p className="text-2xl font-bold text-rose-600 font-poppins mt-2">
                {mustahikList.filter((m) => m.desil === "Desil 1").length} <span className="text-sm font-normal text-slate-500">Penerima</span>
              </p>
              <p className="text-[11px] text-rose-500 mt-1">Prioritas Penyaluran Utama</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Program Pendistribusian
              </span>
              <p className="text-2xl font-bold text-blue-700 font-poppins mt-2">
                {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian").length} <span className="text-sm font-normal text-slate-500">Mustahik</span>
              </p>
              <p className="text-[11px] text-blue-600 mt-1">Pendidikan, Kesehatan, Dakwah/Advokasi</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Program Pendayagunaan
              </span>
              <p className="text-2xl font-bold text-emerald-700 font-poppins mt-2">
                {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan").length} <span className="text-sm font-normal text-slate-500">Mustahik</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Ekonomi, Pendidikan Sebagian, Sanitasi</p>
            </div>
          </div>

          {/* Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab("pendistribusian")}
              className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50/50 p-5 hover:bg-blue-100/60 transition-colors"
            >
              <GraduationCap className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 font-poppins">Program Pendistribusian</h3>
              <p className="text-xs text-slate-500 mt-1">Penyaluran konsumtif darurat: Pendidikan, Kesehatan, Dakwah dan Advokasi.</p>
            </div>

            <div
              onClick={() => setActiveTab("pendayagunaan")}
              className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 hover:bg-emerald-100/60 transition-colors"
            >
              <Briefcase className="h-6 w-6 text-emerald-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 font-poppins">Program Pendayagunaan</h3>
              <p className="text-xs text-slate-500 mt-1">Transformasi produktif: Modal Usaha Z-Mart, Vokasi, dan Sanitasi Sehat.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DATA MUSTAHIK MASTER (FILTER NIK, DESIL 1-4, IMPORT & EXPORT) */}
      {activeTab === "mustahik" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Data Penerima Manfaat (Mustahik) &amp; Tingkat Desil
              </h3>
              <p className="text-xs text-slate-500">
                Pencarian NIK/KK, Kategori Program Pendistribusian/Pendayagunaan, dan Desil Kemiskinan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setTargetProgramKategori("pendistribusian");
                  setTargetSubProgram("Pendidikan");
                  setIsAddMustahikModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Mustahik
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5 text-rose-600" />
                Import Excel / CSV
              </button>

              <button
                onClick={() => handleExportMustahik()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-rose-600" />
                Export Excel ({filteredMustahik.length})
              </button>
            </div>
          </div>

          {/* Filter Bar: NIK, Desil, Kategori Pilar, Sub-Program */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchMustahik}
                onChange={(e) => setSearchMustahik(e.target.value)}
                placeholder="Cari NIK / KK / Nama..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            {/* Filter Desil */}
            <select
              value={filterDesil}
              onChange={(e) => setFilterDesil(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
            >
              <option value="all">Semua Desil</option>
              <option value="Desil 1">Desil 1 (Ekstrem)</option>
              <option value="Desil 2">Desil 2 (Miskin)</option>
              <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
              <option value="Desil 4">Desil 4 (Rentan)</option>
            </select>

            {/* Filter Kategori Pilar */}
            <select
              value={filterKategoriBesar}
              onChange={(e) => setFilterKategoriBesar(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Program Utama</option>
              <option value="pendistribusian">Program Pendistribusian</option>
              <option value="pendayagunaan">Program Pendayagunaan</option>
            </select>

            {/* Filter Sub-Program */}
            <select
              value={filterSubProgram}
              onChange={(e) => setFilterSubProgram(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Sub-Program</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Dakwah dan Advokasi">Dakwah &amp; Advokasi</option>
              <option value="Ekonomi">Ekonomi (Produktif)</option>
              <option value="Pendidikan Sebagian">Pendidikan Sebagian (Vokasi)</option>
            </select>
          </div>

          {/* Tabel Mustahik */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama &amp; NIK / KK</th>
                  <th className="py-3 px-4">Asnaf</th>
                  <th className="py-3 px-4">Tingkat Desil</th>
                  <th className="py-3 px-4">Kategori Program</th>
                  <th className="py-3 px-4">Sub-Program</th>
                  <th className="py-3 px-4">Total Bantuan</th>
                  <th className="py-3 px-4">Alamat &amp; Kondisi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMustahik.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{m.namaLengkap}</span>
                      <span className="text-[11px] font-mono text-slate-400">NIK: {m.nik}</span>
                      {m.kk && <span className="text-[10px] font-mono text-slate-400 block">KK: {m.kk}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {m.asnaf}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          m.desil === "Desil 1"
                            ? "bg-rose-100 text-rose-800"
                            : m.desil === "Desil 2"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {m.desil}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.kategoriBesar === "pendistribusian"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {m.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {m.namaSubProgram}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatRupiah(m.totalBantuanDiterima)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={m.alamat}>
                      <span className="block text-slate-800 truncate">{m.alamat}</span>
                      <span className="text-[10px] text-slate-400 truncate">{m.kondisi}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {m.statusKelayakan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 shadow-2xs transition-colors"
                          title="Edit Data Mustahik"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 shadow-2xs transition-colors"
                          title="Hapus Mustahik"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleShareMustahik(m)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 shadow-2xs transition-colors"
                          title="Bagikan Data"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMustahik.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data mustahik yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROGRAM PENDISTRIBUSIAN DENGAN KLIK SUB-PROGRAM & TABEL DATA */}
      {activeTab === "pendistribusian" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-blue-900 font-poppins">
                Program Pendistribusian BAZNAS
              </h2>
              <p className="text-xs text-blue-700 mt-0.5">
                Klik kartu program di bawah untuk melihat tabel data penerima manfaat, menambah penerima, serta import/export Excel.
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
              Total {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian").length} Penerima
            </span>
          </div>

          {/* 3 Kartu Interaktif Sub-Program Pendistribusian */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Pendidikan */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Pendidikan" ? "all" : "Pendidikan")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendistribusianSub === "Pendidikan"
                  ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-md"
                  : "border-blue-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">1. Pendidikan</h3>
              <p className="text-xs text-blue-700 font-semibold">Beasiswa Santri &amp; Dhuafa</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Penyaluran beasiswa SPP, perlengkapan seragam dan buku santri pesantren, serta bantuan pendidikan tingkat dasar hingga menengah.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-blue-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Pendidikan").length} Mustahik
                </span>
              </div>
            </div>

            {/* 2. Kesehatan */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Kesehatan" ? "all" : "Kesehatan")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendistribusianSub === "Kesehatan"
                  ? "border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20 shadow-md"
                  : "border-rose-200 bg-white hover:border-rose-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">2. Kesehatan</h3>
              <p className="text-xs text-rose-700 font-semibold">Bantuan Medis Darurat</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Bantuan pembiayaan obat dhuafa non-BPJS, tebus resep, kursi roda difabel, santunan pasien sakit kritis, &amp; ambulans gratis.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-rose-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Kesehatan").length} Mustahik
                </span>
              </div>
            </div>

            {/* 3. Dakwah dan Advokasi */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Dakwah dan Advokasi" ? "all" : "Dakwah dan Advokasi")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendistribusianSub === "Dakwah dan Advokasi"
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-emerald-200 bg-white hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">3. Dakwah &amp; Advokasi</h3>
              <p className="text-xs text-emerald-700 font-semibold">Bisyarah Da&apos;i &amp; Mualaf</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Honorarium da&apos;i perbatasan terpencil, pembinaan rohani mualaf, santunan fisabilillah, dan bantuan advokasi hak fakir miskin.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-emerald-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Dakwah dan Advokasi").length} Mustahik
                </span>
              </div>
            </div>
          </div>

          {/* TABEL DATA DEDIKASI PROGRAM PENDISTRIBUSIAN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-poppins">
                    Tabel Data Penerima: {activePendistribusianSub === "all" ? "Semua Program Pendistribusian" : `Program ${activePendistribusianSub}`}
                  </h3>
                  <span className="rounded-full bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 font-bold">
                    {filteredPendistribusianList.length} Penerima
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar mustahik yang terdaftar pada program konsumtif pendistribusian BAZNAS
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handleOpenAddForProgram(
                      "pendistribusian",
                      activePendistribusianSub === "all" ? "Pendidikan" : activePendistribusianSub
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Penerima {activePendistribusianSub !== "all" ? activePendistribusianSub : ""}
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                  Import
                </button>

                <button
                  onClick={() =>
                    handleExportMustahik(
                      filteredPendistribusianList,
                      `Data_Pendistribusian_${activePendistribusianSub}`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter Search & Desil untuk Tabel Sub-Program */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchSubProg}
                  onChange={(e) => setSearchSubProg(e.target.value)}
                  placeholder="Cari NIK / Nama Penerima..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={filterSubProgDesil}
                onChange={(e) => setFilterSubProgDesil(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
              >
                <option value="all">Semua Tingkat Desil</option>
                <option value="Desil 1">Desil 1 (Ekstrem)</option>
                <option value="Desil 2">Desil 2 (Miskin)</option>
                <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                <option value="Desil 4">Desil 4 (Rentan)</option>
              </select>

              {activePendistribusianSub !== "all" && (
                <button
                  onClick={() => setActivePendistribusianSub("all")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tampilkan Semua Sub-Program
                </button>
              )}
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama &amp; NIK Penerima</th>
                    <th className="py-3 px-4">Sub-Program</th>
                    <th className="py-3 px-4">Tingkat Desil</th>
                    <th className="py-3 px-4">Asnaf</th>
                    <th className="py-3 px-4">Total Bantuan</th>
                    <th className="py-3 px-4">Alamat &amp; Keterangan Bantuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPendistribusianList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{m.namaLengkap}</span>
                        <span className="text-[11px] font-mono text-slate-400">NIK: {m.nik}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {m.namaSubProgram}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            m.desil === "Desil 1"
                              ? "bg-rose-100 text-rose-800"
                              : m.desil === "Desil 2"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {m.desil}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{m.asnaf}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatRupiah(m.totalBantuanDiterima)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="block text-slate-800 truncate">{m.alamat}</span>
                        <span className="text-[11px] text-slate-400 block">{m.kondisi}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {m.statusKelayakan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 shadow-2xs transition-colors"
                            title="Edit Data Mustahik"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 shadow-2xs transition-colors"
                            title="Hapus Mustahik"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareMustahik(m)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 shadow-2xs transition-colors"
                            title="Bagikan Data"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPendistribusianList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Belum ada data penerima manfaat pada sub-program ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROGRAM PENDAYAGUNAAN DENGAN KLIK SUB-PROGRAM & TABEL DATA */}
      {activeTab === "pendayagunaan" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-baznas-green-900 font-poppins">
                Program Pendayagunaan BAZNAS
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Klik kartu program di bawah untuk membuka data pembinaan ekonomi produktif, menambah penerima, serta import/export Excel.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              Total {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan").length} Penerima
            </span>
          </div>

          {/* 3 Kartu Interaktif Sub-Program Pendayagunaan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Ekonomi */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Ekonomi" ? "all" : "Ekonomi")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendayagunaanSub === "Ekonomi"
                  ? "border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-md"
                  : "border-amber-200 bg-white hover:border-amber-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">1. Ekonomi</h3>
              <p className="text-xs text-amber-700 font-semibold">Z-Mart &amp; Modal Usaha Mandiri</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Pemberian modal usaha bergulir tanpa bunga, pengadaan warung ritel Z-Mart, bantuan peralatan bengkel Z-Auto, dan pendampingan bisnis mikro.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-amber-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Ekonomi").length} Mustahik
                </span>
              </div>
            </div>

            {/* 2. Pendidikan Sebagian (Vokasi) */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Pendidikan Sebagian" ? "all" : "Pendidikan Sebagian")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendayagunaanSub === "Pendidikan Sebagian"
                  ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-md"
                  : "border-blue-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">2. Pendidikan Sebagian</h3>
              <p className="text-xs text-blue-700 font-semibold">Pelatihan Vokasi &amp; Keterampilan</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Penyelenggaraan kursus menjahit, pelatihan mekanik, sertifikasi keahlian teknis (BLK), dan pembinaan enterpreneurship pemuda usia produktif.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-blue-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Pendidikan Sebagian").length} Mustahik
                </span>
              </div>
            </div>

            {/* 3. Kesehatan (Sanitasi) */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Kesehatan" ? "all" : "Kesehatan")}
              className={`cursor-pointer rounded-2xl border p-6 transition-all shadow-xs ${
                activePendayagunaanSub === "Kesehatan"
                  ? "border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 shadow-md"
                  : "border-teal-200 bg-white hover:border-teal-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                  <Droplet className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-poppins mt-3">3. Kesehatan</h3>
              <p className="text-xs text-teal-700 font-semibold">Sanitasi &amp; Klinik Sehat</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Pembangunan fasilitas sanitasi jamban sehat keluarga miskin, penyediaan instalasi sumur bor air bersih komunitas, dan edukasi hidup sehat.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Penerima Aktif:</span>
                <span className="font-bold text-teal-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Kesehatan").length} Mustahik
                </span>
              </div>
            </div>
          </div>

          {/* TABEL DATA DEDIKASI PROGRAM PENDAYAGUNAAN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-poppins">
                    Tabel Data Penerima: {activePendayagunaanSub === "all" ? "Semua Program Pendayagunaan" : `Program ${activePendayagunaanSub}`}
                  </h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 font-bold">
                    {filteredPendayagunaanList.length} Penerima
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar mustahik yang menerima stimulus modal usaha dan pendampingan kemandirian ekonomi
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handleOpenAddForProgram(
                      "pendayagunaan",
                      activePendayagunaanSub === "all" ? "Ekonomi" : activePendayagunaanSub
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Penerima {activePendayagunaanSub !== "all" ? activePendayagunaanSub : ""}
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5 text-baznas-green-700" />
                  Import
                </button>

                <button
                  onClick={() =>
                    handleExportMustahik(
                      filteredPendayagunaanList,
                      `Data_Pendayagunaan_${activePendayagunaanSub}`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-baznas-green-700" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter Sub-Program */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchSubProg}
                  onChange={(e) => setSearchSubProg(e.target.value)}
                  placeholder="Cari NIK / Nama Penerima..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
                />
              </div>

              <select
                value={filterSubProgDesil}
                onChange={(e) => setFilterSubProgDesil(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
              >
                <option value="all">Semua Tingkat Desil</option>
                <option value="Desil 1">Desil 1 (Ekstrem)</option>
                <option value="Desil 2">Desil 2 (Miskin)</option>
                <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                <option value="Desil 4">Desil 4 (Rentan)</option>
              </select>

              {activePendayagunaanSub !== "all" && (
                <button
                  onClick={() => setActivePendayagunaanSub("all")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tampilkan Semua Sub-Program
                </button>
              )}
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama &amp; NIK Penerima</th>
                    <th className="py-3 px-4">Sub-Program</th>
                    <th className="py-3 px-4">Tingkat Desil</th>
                    <th className="py-3 px-4">Asnaf</th>
                    <th className="py-3 px-4">Total Bantuan</th>
                    <th className="py-3 px-4">Alamat &amp; Rincian Usaha/Pelatihan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPendayagunaanList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{m.namaLengkap}</span>
                        <span className="text-[11px] font-mono text-slate-400">NIK: {m.nik}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">
                        {m.namaSubProgram}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            m.desil === "Desil 1"
                              ? "bg-rose-100 text-rose-800"
                              : m.desil === "Desil 2"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {m.desil}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{m.asnaf}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatRupiah(m.totalBantuanDiterima)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="block text-slate-800 truncate">{m.alamat}</span>
                        <span className="text-[11px] text-slate-400 block">{m.kondisi}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {m.statusKelayakan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 shadow-2xs transition-colors"
                            title="Edit Data Mustahik"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 shadow-2xs transition-colors"
                            title="Hapus Mustahik"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareMustahik(m)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 shadow-2xs transition-colors"
                            title="Bagikan Data"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPendayagunaanList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Belum ada data penerima manfaat pada sub-program ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PERSETUJUAN PENCAIRAN DANA (SPK) DENGAN ALUR 2 TAHAP: KETUA DULU LALU KONFIRMASI BIDANG 2 */}
      {activeTab === "pencairan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Alur Persetujuan Pencairan Dana Bantuan (SPK)
              </h3>
              <p className="text-xs text-slate-500">
                Alur resmi 2 tahap: Pengajuan Bidang II ➔ Disetujui Ketua BAZNAS ➔ Dikonfirmasi Kembali oleh Bidang II ➔ Diteruskan ke Kas Bidang III
              </p>
            </div>
            <button
              onClick={() => setShowModalNew(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Pengajuan Baru (SPK)
            </button>
          </div>

          {/* Diagram Alur SPK */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Siklus Alur Otorisasi SPK:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-amber-700 block">1. Diajukan</span>
                <span className="text-[10px] text-slate-500">Oleh Amil Bidang II</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-bold text-blue-700 block">2. Disetujui Ketua</span>
                <span className="text-[10px] text-slate-500">Ketua Mohamad Husain Rauf</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                <span className="font-bold text-emerald-800 block">3. Dikonfirmasi Bidang II</span>
                <span className="text-[10px] text-slate-500">Verifikasi Berkas Akhir</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-800 block">4. Cair ke Bidang III</span>
                <span className="text-[10px] text-slate-500">Transfer Kas Bendahara</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {pencairanList.map((p) => {
              const isPendingKetua = p.status === "diajukan";
              const isApprovedKetua = p.status === "disetujui_ketua";
              const isConfirmedBidang2 = p.status === "dikonfirmasi_bidang2";
              const isRejected = p.status === "ditolak";

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isPendingKetua
                      ? "border-amber-300 bg-amber-50/30"
                      : isApprovedKetua
                      ? "border-blue-300 bg-blue-50/30"
                      : isConfirmedBidang2
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {p.nomorSPK}
                        </span>

                        {isPendingKetua && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Menunggu Persetujuan Ketua BAZNAS
                          </span>
                        )}

                        {isApprovedKetua && (
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold border border-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Disetujui Ketua — Siap Dikonfirmasi Bidang II
                          </span>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Dikonfirmasi Bidang II (Siap Diberikan)
                          </span>
                        )}

                        {isRejected && (
                          <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold border border-rose-300 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ditolak
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                          {p.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {p.namaSubProgram}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 font-poppins">
                        {p.namaProgram}
                      </h4>
                      <p className="text-xs text-slate-600">{p.keterangan}</p>

                      <p className="text-[11px] text-slate-500">
                        Target: <strong>{p.jumlahMustahik} Mustahik</strong> • Tanggal: {p.tanggal}
                        {p.approver && ` • Disetujui oleh: ${p.approver}`}
                        {p.catatanPenolakan && (
                          <span className="text-rose-600 font-semibold block mt-0.5">
                            Alasan Penolakan: {p.catatanPenolakan}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3">
                      <span className="text-base font-bold text-baznas-green-900 font-poppins">
                        {formatRupiah(p.nominal)}
                      </span>

                      {/* Aksi Sesuai Status Alur */}
                      <div className="flex items-center gap-2">
                        {isPendingKetua && (
                          <span className="text-[11px] text-amber-700 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-lg italic">
                            Sedang direview Ketua...
                          </span>
                        )}

                        {/* TAHAP 2: KONFIRMASI DARI BIDANG 2 SETELAH DISETUJUI KETUA */}
                        {isApprovedKetua && (
                          <button
                            onClick={() => {
                              if (onConfirmPencairan) {
                                onConfirmPencairan(p.id);
                              } else {
                                p.status = "dikonfirmasi_bidang2";
                                setActiveTab("pencairan");
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Konfirmasi Pencairan Dana (Bidang II)
                          </button>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                            Terkonfirmasi Lengkap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. DOKUMENTASI PENYALURAN (BAST) */}
      {activeTab === "dokumentasi" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Berita Acara Serah Terima (BAST) &amp; Dokumentasi Lapangan
          </h3>
          <p className="text-xs text-slate-500">
            Arsip tanda terima dan dokumentasi foto penyerahan hak mustahik
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-800 font-mono">BAST-2026/09/018</span>
              <p className="font-semibold text-slate-900 text-xs">Penyerahan Bantuan Beasiswa Santri Yatim 15 Orang</p>
              <p className="text-[11px] text-slate-500">Kategori: Program Pendistribusian (Pendidikan) • Tgl: 18 Sep 2026</p>
              <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Dokumen Lengkap &amp; Terverifikasi
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-800 font-mono">BAST-2026/08/042</span>
              <p className="font-semibold text-slate-900 text-xs">Penyerahan Bantuan Modal Usaha Z-Mart 5 Mustahik</p>
              <p className="text-[11px] text-slate-500">Kategori: Program Pendayagunaan (Ekonomi) • Tgl: 15 Agu 2026</p>
              <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Dokumen Lengkap &amp; Terverifikasi
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. LAPORAN PENYALURAN */}
      {activeTab === "laporan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Laporan Rekapitulasi Penyaluran Mustahik
              </h3>
              <p className="text-xs text-slate-500">
                Daftar lengkap mustahik terdaftar dan total alokasi dana bantuan tersalurkan.
              </p>
            </div>
            <button
              onClick={() => handleExportMustahik()}
              className="flex items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Download className="h-4 w-4" />
              Export Laporan ke Excel
            </button>
          </div>
        </div>
      )}

      {/* 8. PENGATURAN BIDANG 2 */}
      {activeTab === "pengaturan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Pengaturan Kriteria Asesmen &amp; Ambang Batas Desil
          </h3>
          <div className="space-y-3 text-xs">
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="font-bold block">Desil 1: Pendapatan &lt; Rp 500.000 / kapita / bulan (Ekstrem)</span>
              <span className="text-slate-500">Mendapatkan prioritas bantuan reguler dan bantuan darurat.</span>
            </div>
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="font-bold block">Desil 2: Pendapatan Rp 500.000 – Rp 800.000 / kapita (Miskin)</span>
              <span className="text-slate-500">Mendapatkan program bantuan pendidikan dan kesehatan.</span>
            </div>
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="font-bold block">Desil 3 &amp; 4: Pendapatan Rp 800.000 – Rp 1.500.000 / kapita</span>
              <span className="text-slate-500">Dialokasikan ke Program Pendayagunaan Ekonomi produktif dan vokasi.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN SPK BARU */}
      {showModalNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-700 to-rose-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-poppins text-white">
                  Formulir Pengajuan SPK Pencairan Baru
                </h3>
                <p className="text-xs text-rose-100">
                  Surat Perintah Kerja (SPK) Penyaluran Dana ZIS BAZNAS
                </p>
              </div>
              <button
                onClick={() => setShowModalNew(false)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePencairan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Program Kerja Penyaluran *</label>
                <input
                  type="text"
                  required
                  value={namaProgram}
                  onChange={(e) => setNamaProgram(e.target.value)}
                  placeholder="Contoh: Bantuan Beasiswa Santri Berprestasi Periode 2"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilar Program Utama</label>
                  <select
                    value={kategoriBesar}
                    onChange={(e) => handleKategoriBesarChange(e.target.value as KategoriPilarBidang2)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="pendistribusian">1. Pendistribusian (Konsumtif)</option>
                    <option value="pendayagunaan">2. Pendayagunaan (Produktif)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub-Program</label>
                  <select
                    value={subProgram}
                    onChange={(e) => setSubProgram(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {kategoriBesar === "pendistribusian" ? (
                      <>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Dakwah dan Advokasi">Dakwah &amp; Advokasi</option>
                      </>
                    ) : (
                      <>
                        <option value="Ekonomi">Ekonomi (Produktif)</option>
                        <option value="Pendidikan Sebagian">Pendidikan Sebagian (Vokasi)</option>
                        <option value="Kesehatan">Kesehatan (Sanitasi)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Anggaran SPK (Rp) *</label>
                  <input
                    type="number"
                    step="500000"
                    required
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Mustahik (Jiwa / KK)</label>
                  <input
                    type="number"
                    min="1"
                    value={jumlahMustahik}
                    onChange={(e) => setJumlahMustahik(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Rincian Penyaluran</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan latar belakang penerima manfaat, lokasi, atau syarat SKTM..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalNew(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  Kirim Pengajuan ke Ketua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PENERIMA PROGRAM / MUSTAHIK */}
      {isAddMustahikModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    Tambah Penerima Manfaat ({targetSubProgram})
                  </h3>
                  <p className="text-xs text-emerald-100/80">
                    Input mustahik ke program {targetProgramKategori.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMustahikModalOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMustahikForm} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Mustahik *</label>
                <input
                  type="text"
                  required
                  value={mustahikNama}
                  onChange={(e) => setMustahikNama(e.target.value)}
                  placeholder="Contoh: Sitti Aminah / Keluarga Hasan"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={mustahikNik}
                    onChange={(e) => setMustahikNik(e.target.value)}
                    placeholder="7171010101850001"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. KK (Opsional)</label>
                  <input
                    type="text"
                    value={mustahikKk}
                    onChange={(e) => setMustahikKk(e.target.value)}
                    placeholder="7171010101850002"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asnaf Zakat</label>
                  <select
                    value={mustahikAsnaf}
                    onChange={(e) => setMustahikAsnaf(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Mualaf">Mualaf</option>
                    <option value="Gharimin">Gharimin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Desil</label>
                  <select
                    value={mustahikDesil}
                    onChange={(e) => setMustahikDesil(e.target.value as DesilType)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="Desil 1">Desil 1 (Ekstrem)</option>
                    <option value="Desil 2">Desil 2 (Miskin)</option>
                    <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                    <option value="Desil 4">Desil 4 (Rentan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Bantuan (Rp)</label>
                  <input
                    type="number"
                    step="100000"
                    value={mustahikBantuan}
                    onChange={(e) => setMustahikBantuan(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    value={mustahikAlamat}
                    onChange={(e) => setMustahikAlamat(e.target.value)}
                    placeholder="Kelurahan / Kecamatan"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kondisi / Alasan Bantuan</label>
                <input
                  type="text"
                  value={mustahikKondisi}
                  onChange={(e) => setMustahikKondisi(e.target.value)}
                  placeholder="Contoh: Buruh harian lepas dengan 3 anak sekolah"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMustahikModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan Penerima Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL / CSV MUSTAHIK */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Mustahik dari Excel / CSV"
        onDownloadTemplate={downloadTemplateMustahik}
        onImportData={handleImportParsedMustahik}
        sampleHeaders={[
          "Nama Lengkap",
          "NIK",
          "Asnaf",
          "Tingkat Desil",
          "Kategori (pendistribusian/pendayagunaan)",
          "Sub-Program",
          "Alamat",
          "Kondisi",
        ]}
      />

      {/* MODAL EDIT DATA MUSTAHIK */}
      {editingMustahik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <Edit className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    Edit Data Penerima Manfaat / Mustahik
                  </h3>
                  <p className="text-xs text-blue-100/80">
                    Perbarui informasi kelayakan, asnaf, dan bantuan mustahik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMustahik(null)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditMustahik} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Mustahik *</label>
                <input
                  type="text"
                  required
                  value={editingMustahik.namaLengkap}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, namaLengkap: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    value={editingMustahik.nik}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, nik: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    value={editingMustahik.kk || ""}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, kk: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asnaf</label>
                  <select
                    value={editingMustahik.asnaf}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, asnaf: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Amil">Amil</option>
                    <option value="Mualaf">Mualaf</option>
                    <option value="Riqab">Riqab</option>
                    <option value="Gharimin">Gharimin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Desil</label>
                  <select
                    value={editingMustahik.desil}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, desil: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="Desil 1">Desil 1 (Ekstrem)</option>
                    <option value="Desil 2">Desil 2 (Miskin)</option>
                    <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                    <option value="Desil 4">Desil 4 (Rentan)</option>
                    <option value="Non-Desil">Non-Desil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kelayakan</label>
                  <select
                    value={editingMustahik.statusKelayakan}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, statusKelayakan: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none capitalize font-semibold"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus / Mandiri</option>
                    <option value="ditinjau">Ditinjau Ulang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Pilar</label>
                  <select
                    value={editingMustahik.kategoriBesar}
                    onChange={(e) => {
                      const kat = e.target.value as KategoriPilarBidang2;
                      setEditingMustahik({
                        ...editingMustahik,
                        kategoriBesar: kat,
                        namaSubProgram: kat === "pendistribusian" ? "Pendidikan" : "Ekonomi",
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="pendistribusian">Pendistribusian</option>
                    <option value="pendayagunaan">Pendayagunaan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub-Program</label>
                  <select
                    value={editingMustahik.namaSubProgram}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, namaSubProgram: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                  >
                    {editingMustahik.kategoriBesar === "pendistribusian" ? (
                      <>
                        <option value="Pendidikan">Pendidikan (BAZNAS Cerdas)</option>
                        <option value="Kesehatan">Kesehatan (BAZNAS Sehat)</option>
                        <option value="Dakwah dan Advokasi">Dakwah dan Advokasi</option>
                      </>
                    ) : (
                      <>
                        <option value="Ekonomi">Ekonomi (Modal Usaha Z-Mart)</option>
                        <option value="Pendidikan Sebagian">Pendidikan Sebagian (Pelatihan Vokasi)</option>
                        <option value="Kesehatan">Kesehatan (Klinik Dhuafa)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Bantuan Diterima (Rp)</label>
                <input
                  type="number"
                  value={editingMustahik.totalBantuanDiterima}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, totalBantuanDiterima: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={editingMustahik.alamat}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, alamat: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kondisi / Keterangan Masalah</label>
                <textarea
                  rows={2}
                  value={editingMustahik.kondisi}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, kondisi: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMustahik(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 hover:bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
