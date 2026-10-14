"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Mustahik,
  PermohonanPencairan,
  Bidang2Tab,
  DesilType,
  KategoriPilarBidang2,
  SubProgramPendistribusian,
  SubProgramPendayagunaan,
  UserSession,
} from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { DESIL_OPTIONS, KRITERIA_DESIL, desilBadgeClass, getKlasifikasi, getUserType } from "@/lib/desil";
import type { UserType } from "@/lib/types";
import { exportToExcel, downloadTemplateMustahik } from "@/lib/excel-utils";
import { ImportExcelModal, ConfirmDialog, useToast, ToastContainer, ClassificationBadge } from "@/components/common";
import { canAccessTab } from "@/lib/access";
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
  Droplet,
  UserPlus,
  Check,
  Edit,
  Trash2,
  Share2,
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
  currentUser: UserSession;
  activeTab?: Bidang2Tab;
  onTabChange?: (tab: Bidang2Tab) => void;
}

export const Bidang2View: React.FC<Bidang2ViewProps> = ({
  mustahikList,
  pencairanList,
  currentUser,
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
  const { success: toastSuccess, error: toastError, info: toastInfo, toasts, dismiss } = useToast();
  const setActiveTab = (tab: Bidang2Tab) => {
    if (!canAccessTab(currentUser, "bidang2", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  // Defensive: reset tab if current user can't access it (e.g. role changed mid-session).
  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "bidang2", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  // Confirmation state for delete mustahik (UX Plan §3.2)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  // Import Mustahik from Excel (.xlsx)
  const handleImportParsedMustahik = (rows: string[][]) => {
    const imported: Mustahik[] = rows.map((r, idx) => ({
      id: `mus-imp-${Date.now()}-${idx}`,
      namaLengkap: r[0] || "Mustahik Baru",
      nik: r[1] || `757100000000000${idx}`,
      kk: `757100000000000${idx}`,
      asnaf: (r[2] as Mustahik["asnaf"]) || "Miskin",
      desil: (r[3] as DesilType) || "Desil 1",
      kategoriBesar: (r[4] === "pendayagunaan" ? "pendayagunaan" : "pendistribusian"),
      namaSubProgram: (r[5] as SubProgramPendayagunaan | SubProgramPendistribusian) || "Pendidikan",
      alamat: r[6] || "Kota Gorontalo",
      kondisi: r[7] || "Prasejahtera",
      statusKelayakan: "aktif",
      totalBantuanDiterima: 0,
      terakhirDibantu: getLocalDateString(),
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
      nik: mustahikNik.trim() || `7571${Date.now().toString().slice(-12)}`,
      kk: mustahikKk.trim() || `7571${Date.now().toString().slice(-12)}`,
      asnaf: mustahikAsnaf,
      desil: mustahikDesil,
      kategoriBesar: targetProgramKategori,
      namaSubProgram: targetSubProgram,
      alamat: mustahikAlamat.trim() || "Kota Gorontalo",
      kondisi: mustahikKondisi.trim() || "Keluarga Prasejahtera",
      statusKelayakan: "aktif",
      totalBantuanDiterima: mustahikBantuan,
      terakhirDibantu: getLocalDateString(),
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
      tanggal: getLocalDateString(),
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

  const handleOpenEdit = (m: Mustahik) => {
    setEditingMustahik({ ...m });
  };

  const handleDeleteMustahikItem = (id: string, name: string) => {
    // Open confirmation dialog (UX Plan §3.2)
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    if (onDeleteMustahik) {
      onDeleteMustahik(id);
    } else {
      const idx = mustahikList.findIndex((m) => m.id === id);
      if (idx !== -1) mustahikList.splice(idx, 1);
    }
    toastSuccess(
      "Data berhasil dihapus",
      `Data penerima "${name}" telah dihapus dari sistem.`
    );
    setDeleteTarget(null);
  };

  const handleShareMustahik = (m: Mustahik) => {
    const text = `*INFORMASI MUSTAHIK BAZNAS*\nNama: ${m.namaLengkap}\nNIK: ${m.nik}\nKategori: ${m.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} (${m.namaSubProgram})\nAsnaf: ${m.asnaf} | Desil: ${m.desil}\nTotal Bantuan: ${formatRupiah(m.totalBantuanDiterima)}\nAlamat: ${m.alamat}\nKondisi: ${m.kondisi}\nStatus: ${m.statusKelayakan.toUpperCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toastSuccess("Berhasil Disalin", `Informasi mustahik "${m.namaLengkap}" disalin ke papan klip.`);
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
    toastSuccess("Tersimpan", `Perubahan data mustahik "${editingMustahik.namaLengkap}" telah disimpan.`);
    setEditingMustahik(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Container untuk notifikasi (menggantikan shareToast local) */}

      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-ink">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-baznas-ink font-poppins">
                Bidang II — Pendistribusian &amp; Pendayagunaan
              </h1>
              <span className="bg-baznas-paper border border-baznas-ink-8 px-2.5 py-0.5 text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                Unit Penyaluran
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-0.5">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Riton Ma&apos;ruf</span> (Waka 2) — Staf: Saleha Zakaria (Pendistribusian) &amp; Norma Ningsih Bungi, S.Pd (Pendayagunaan)
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD RINGKASAN BIDANG 2 */}
      {canAccessTab(currentUser, "bidang2", "dashboard") && activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Mustahik Terdata
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {mustahikList.length} <span className="text-sm font-normal text-baznas-ink/55">Jiwa / KK</span>
              </p>
              <p className="text-[11px] text-baznas-green-900 mt-1">Terverifikasi Asnaf &amp; SKTM</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Desil 1 (Kemiskinan Ekstrem)
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {mustahikList.filter((m) => m.desil === "Desil 1").length} <span className="text-sm font-normal text-baznas-ink/55">Penerima</span>
              </p>
              <p className="text-[11px] text-baznas-ink/55 mt-1">Prioritas Penyaluran Utama</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Program Pendistribusian
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian").length} <span className="text-sm font-normal text-baznas-ink/55">Mustahik</span>
              </p>
              <p className="text-[11px] text-baznas-ink mt-1">Pendidikan, Kesehatan, Dakwah/Advokasi</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Program Pendayagunaan
              </span>
              <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-2">
                {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan").length} <span className="text-sm font-normal text-baznas-ink/55">Mustahik</span>
              </p>
              <p className="text-[11px] text-baznas-green-900 mt-1">Ekonomi, Pendidikan Sebagian, Sanitasi</p>
            </div>
          </div>

          {/* Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab("pendistribusian")}
              className="cursor-pointer border border-baznas-ink-8 bg-baznas-paper/40 p-8 hover:bg-baznas-paper/40 transition-colors"
            >
              <GraduationCap className="h-6 w-6 text-baznas-ink mb-2" />
              <h3 className="text-sm font-bold text-baznas-ink font-poppins">Program Pendistribusian</h3>
              <p className="text-xs text-baznas-ink/55 mt-1">Penyaluran konsumtif darurat: Pendidikan, Kesehatan, Dakwah dan Advokasi.</p>
            </div>

            <div
              onClick={() => setActiveTab("pendayagunaan")}
              className="cursor-pointer border border-baznas-ink-8 bg-baznas-paper/40 p-8 hover:bg-baznas-paper/40 transition-colors"
            >
              <Briefcase className="h-6 w-6 text-baznas-green-900 mb-2" />
              <h3 className="text-sm font-bold text-baznas-ink font-poppins">Program Pendayagunaan</h3>
              <p className="text-xs text-baznas-ink/55 mt-1">Transformasi produktif: Modal Usaha Z-Mart, Vokasi, dan Sanitasi Sehat.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DATA MUSTAHIK MASTER (FILTER NIK, DESIL 1-4, IMPORT & EXPORT) */}
      {canAccessTab(currentUser, "bidang2", "mustahik") && activeTab === "mustahik" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins">
                Data Penerima Manfaat (Mustahik) &amp; Tingkat Desil
              </h3>
              <p className="text-xs text-baznas-ink/55">
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
                className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-3.5 py-2.5 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Mustahik
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
              >
                <Upload className="h-3.5 w-3.5 text-baznas-ink" />
                Import Excel
              </button>

              <button
                onClick={() => handleExportMustahik()}
                className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
              >
                <Download className="h-3.5 w-3.5 text-baznas-ink" />
                Export Excel ({filteredMustahik.length})
              </button>
            </div>
          </div>

          {/* Filter Bar: NIK, Desil, Kategori Pilar, Sub-Program */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-baznas-ink/45" />
              <input
                type="text"
                value={searchMustahik}
                onChange={(e) => setSearchMustahik(e.target.value)}
                placeholder="Cari NIK / KK / Nama..."
                className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 focus:bg-white"
              />
            </div>

            {/* Filter Desil */}
            <select
              value={filterDesil}
              onChange={(e) => setFilterDesil(e.target.value)}
              className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none font-semibold"
            >
              <option value="all">Semua Desil (1–10)</option>
              {DESIL_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            {/* Filter Kategori Pilar */}
            <select
              value={filterKategoriBesar}
              onChange={(e) => setFilterKategoriBesar(e.target.value)}
              className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none"
            >
              <option value="all">Semua Program Utama</option>
              <option value="pendistribusian">Program Pendistribusian</option>
              <option value="pendayagunaan">Program Pendayagunaan</option>
            </select>

            {/* Filter Sub-Program */}
            <select
              value={filterSubProgram}
              onChange={(e) => setFilterSubProgram(e.target.value)}
              className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none"
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
          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/65">
              <thead className="bg-baznas-paper text-[11px] font-bold text-baznas-ink/55 uppercase tracking-wider border-b border-baznas-ink-8">
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
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredMustahik.map((m) => (
                  <tr key={m.id} className="hover:bg-baznas-paper/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-baznas-ink block">{m.namaLengkap}</span>
                      <span className="text-[11px] font-mono text-baznas-ink/45">NIK: {m.nik}</span>
                      {m.kk && <span className="text-[10px] font-mono text-baznas-ink/45 block">KK: {m.kk}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-baznas-paper/40 px-2 py-0.5 text-[11px] font-semibold text-baznas-ink/80">
                        {m.asnaf}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desilBadgeClass(m.desil)}`}
                        >
                          {m.desil}
                        </span>
                        <ClassificationBadge desil={m.desil} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.kategoriBesar === "pendistribusian"
                            ? "bg-white border border-baznas-ink-12 text-baznas-ink"
                            : "bg-white border border-baznas-ink-12 text-baznas-ink"
                        }`}
                      >
                        {m.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-baznas-ink">
                      {m.namaSubProgram}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-baznas-ink">
                      {formatRupiah(m.totalBantuanDiterima)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={m.alamat}>
                      <span className="block text-baznas-ink truncate">{m.alamat}</span>
                      <span className="text-[10px] text-baznas-ink/45 truncate">{m.kondisi}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block bg-baznas-paper border border-baznas-ink-12 text-baznas-ink text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        {m.statusKelayakan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-ink text-baznas-ink/65 transition-colors"
                          title="Edit Data Mustahik"
                          aria-label={`Edit data mustahik ${m.namaLengkap}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper hover:text-rose-700 text-baznas-ink/65 transition-colors"
                          title="Hapus Mustahik"
                          aria-label={`Hapus mustahik ${m.namaLengkap}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareMustahik(m)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-green-900 text-baznas-ink/65 transition-colors"
                          title="Bagikan Data"
                          aria-label={`Bagikan data mustahik ${m.namaLengkap}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMustahik.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-baznas-ink/45">
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
      {canAccessTab(currentUser, "bidang2", "pendistribusian") && activeTab === "pendistribusian" && (
        <div className="space-y-6">
          <div className="border border-baznas-ink-8 bg-white p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-blue-900 font-poppins">
                Program Pendistribusian BAZNAS
              </h2>
              <p className="text-xs text-baznas-ink mt-0.5">
                Klik kartu program di bawah untuk melihat tabel data penerima manfaat, menambah penerima, serta import/export Excel.
              </p>
            </div>
            <span className="inline-block bg-white border border-baznas-ink-12 text-baznas-ink text-xs font-bold uppercase tracking-wider px-3 py-1">
              Total {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian").length} Penerima
            </span>
          </div>

          {/* 3 Kartu Interaktif Sub-Program Pendistribusian */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Pendidikan */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Pendidikan" ? "all" : "Pendidikan")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendistribusianSub === "Pendidikan"
                  ? "border-baznas-gold-display bg-baznas-paper"
                  : "border-blue-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">1. Pendidikan</h3>
              <p className="text-xs text-baznas-ink font-semibold">Beasiswa Santri &amp; Dhuafa</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Penyaluran beasiswa SPP, perlengkapan seragam dan buku santri pesantren, serta bantuan pendidikan tingkat dasar hingga menengah.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-blue-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Pendidikan").length} Mustahik
                </span>
              </div>
            </div>

            {/* 2. Kesehatan */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Kesehatan" ? "all" : "Kesehatan")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendistribusianSub === "Kesehatan"
                  ? "border-rose-600 bg-baznas-paper/80 shadow-md"
                  : "border-rose-200 bg-white hover:border-rose-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink bg-baznas-paper border border-rose-200 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">2. Kesehatan</h3>
              <p className="text-xs text-rose-700 font-semibold">Bantuan Medis Darurat</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Bantuan pembiayaan obat dhuafa non-BPJS, tebus resep, kursi roda difabel, santunan pasien sakit kritis, &amp; ambulans gratis.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-rose-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Kesehatan").length} Mustahik
                </span>
              </div>
            </div>

            {/* 3. Dakwah dan Advokasi */}
            <div
              onClick={() => setActivePendistribusianSub(activePendistribusianSub === "Dakwah dan Advokasi" ? "all" : "Dakwah dan Advokasi")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendistribusianSub === "Dakwah dan Advokasi"
                  ? "border-baznas-gold-display bg-baznas-paper"
                  : "border-emerald-200 bg-white hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-green-900 bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">3. Dakwah &amp; Advokasi</h3>
              <p className="text-xs text-baznas-green-900 font-semibold">Bisyarah Da&apos;i &amp; Mualaf</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Honorarium da&apos;i perbatasan terpencil, pembinaan rohani mualaf, santunan fisabilillah, dan bantuan advokasi hak fakir miskin.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-emerald-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian" && m.namaSubProgram === "Dakwah dan Advokasi").length} Mustahik
                </span>
              </div>
            </div>
          </div>

          {/* TABEL DATA DEDIKASI PROGRAM PENDISTRIBUSIAN */}
          <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-baznas-ink font-poppins">
                    Tabel Data Penerima: {activePendistribusianSub === "all" ? "Semua Program Pendistribusian" : `Program ${activePendistribusianSub}`}
                  </h3>
                  <span className="inline-block bg-baznas-paper border border-baznas-ink-20 text-baznas-ink text-xs px-2.5 py-0.5 font-bold">
                    {filteredPendistribusianList.length} Penerima
                  </span>
                </div>
                <p className="text-xs text-baznas-ink/55 mt-0.5">
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
                  className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Penerima {activePendistribusianSub !== "all" ? activePendistribusianSub : ""}
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
                >
                  <Upload className="h-3.5 w-3.5 text-baznas-ink" />
                  Import
                </button>

                <button
                  onClick={() =>
                    handleExportMustahik(
                      filteredPendistribusianList,
                      `Data_Pendistribusian_${activePendistribusianSub}`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
                >
                  <Download className="h-3.5 w-3.5 text-baznas-ink" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter Search & Desil untuk Tabel Sub-Program */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-baznas-ink/45" />
                <input
                  type="text"
                  value={searchSubProg}
                  onChange={(e) => setSearchSubProg(e.target.value)}
                  placeholder="Cari NIK / Nama Penerima..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={filterSubProgDesil}
                onChange={(e) => setFilterSubProgDesil(e.target.value)}
                className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none font-semibold"
              >
                <option value="all">Semua Tingkat Desil (1–10)</option>
                {DESIL_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              {activePendistribusianSub !== "all" && (
                <button
                  onClick={() => setActivePendistribusianSub("all")}
                  className="rounded-xl border border-baznas-ink-8 bg-white px-4 py-4 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Tampilkan Semua Sub-Program
                </button>
              )}
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto rounded-xl border border-baznas-ink-8">
              <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/65">
                <thead className="bg-baznas-paper/40 text-[11px] font-bold text-baznas-ink/55 uppercase tracking-wider border-b border-baznas-ink-8">
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
                <tbody className="divide-y divide-baznas-ink-8">
                  {filteredPendistribusianList.map((m) => (
                    <tr key={m.id} className="hover:bg-baznas-paper/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-baznas-ink block">{m.namaLengkap}</span>
                        <span className="text-[11px] font-mono text-baznas-ink/45">NIK: {m.nik}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-baznas-ink">
                        {m.namaSubProgram}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desilBadgeClass(m.desil)}`}
                          >
                            {m.desil}
                          </span>
                          <ClassificationBadge desil={m.desil} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-baznas-ink/80">{m.asnaf}</td>
                      <td className="py-3.5 px-4 font-bold text-baznas-ink">
                        {formatRupiah(m.totalBantuanDiterima)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="block text-baznas-ink truncate">{m.alamat}</span>
                        <span className="text-[11px] text-baznas-ink/45 block">{m.kondisi}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block bg-baznas-paper border border-baznas-ink-12 text-baznas-ink text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          {m.statusKelayakan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-ink text-baznas-ink/65 transition-colors"
                            title="Edit Data Mustahik"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper hover:text-rose-700 text-baznas-ink/65 transition-colors"
                            title="Hapus Mustahik"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareMustahik(m)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-green-900 text-baznas-ink/65 transition-colors"
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
                      <td colSpan={8} className="py-8 text-center text-baznas-ink/45">
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
      {canAccessTab(currentUser, "bidang2", "pendayagunaan") && activeTab === "pendayagunaan" && (
        <div className="space-y-6">
          <div className="border border-baznas-gold-display bg-baznas-paper/40 p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-baznas-green-900 font-poppins">
                Program Pendayagunaan BAZNAS
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Klik kartu program di bawah untuk membuka data pembinaan ekonomi produktif, menambah penerima, serta import/export Excel.
              </p>
            </div>
            <span className="inline-block bg-white border border-baznas-ink-12 text-baznas-ink text-xs font-bold uppercase tracking-wider px-3 py-1">
              Total {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan").length} Penerima
            </span>
          </div>

          {/* 3 Kartu Interaktif Sub-Program Pendayagunaan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Ekonomi */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Ekonomi" ? "all" : "Ekonomi")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendayagunaanSub === "Ekonomi"
                  ? "border-baznas-gold-display bg-baznas-paper"
                  : "border-amber-200 bg-white hover:border-amber-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">1. Ekonomi</h3>
              <p className="text-xs text-amber-700 font-semibold">Z-Mart &amp; Modal Usaha Mandiri</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Pemberian modal usaha bergulir tanpa bunga, pengadaan warung ritel Z-Mart, bantuan peralatan bengkel Z-Auto, dan pendampingan bisnis mikro.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-amber-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Ekonomi").length} Mustahik
                </span>
              </div>
            </div>

            {/* 2. Pendidikan Sebagian (Vokasi) */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Pendidikan Sebagian" ? "all" : "Pendidikan Sebagian")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendayagunaanSub === "Pendidikan Sebagian"
                  ? "border-baznas-gold-display bg-baznas-paper"
                  : "border-blue-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">2. Pendidikan Sebagian</h3>
              <p className="text-xs text-baznas-ink font-semibold">Pelatihan Vokasi &amp; Keterampilan</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Penyelenggaraan kursus menjahit, pelatihan mekanik, sertifikasi keahlian teknis (BLK), dan pembinaan enterpreneurship pemuda usia produktif.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-blue-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Pendidikan Sebagian").length} Mustahik
                </span>
              </div>
            </div>

            {/* 3. Kesehatan (Sanitasi) */}
            <div
              onClick={() => setActivePendayagunaanSub(activePendayagunaanSub === "Kesehatan" ? "all" : "Kesehatan")}
              className={`cursor-pointer rounded-2xl border p-8 transition-all ${
                activePendayagunaanSub === "Kesehatan"
                  ? "border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 shadow-md"
                  : "border-teal-200 bg-white hover:border-teal-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                  <Droplet className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 inline-block">
                  Klik Buka Tabel
                </span>
              </div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins mt-4">3. Kesehatan</h3>
              <p className="text-xs text-teal-700 font-semibold">Sanitasi &amp; Klinik Sehat</p>
              <p className="text-xs text-baznas-ink/65 leading-relaxed mt-1">
                Pembangunan fasilitas sanitasi jamban sehat keluarga miskin, penyediaan instalasi sumur bor air bersih komunitas, dan edukasi hidup sehat.
              </p>
              <div className="mt-4 pt-3 border-t border-baznas-ink-8 flex items-center justify-between text-xs">
                <span className="text-baznas-ink/55">Penerima Aktif:</span>
                <span className="font-bold text-teal-900">
                  {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan" && m.namaSubProgram === "Kesehatan").length} Mustahik
                </span>
              </div>
            </div>
          </div>

          {/* TABEL DATA DEDIKASI PROGRAM PENDAYAGUNAAN */}
          <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-baznas-ink font-poppins">
                    Tabel Data Penerima: {activePendayagunaanSub === "all" ? "Semua Program Pendayagunaan" : `Program ${activePendayagunaanSub}`}
                  </h3>
                  <span className="inline-block bg-baznas-paper border border-baznas-ink-12 text-baznas-ink text-xs px-2.5 py-0.5 font-bold">
                    {filteredPendayagunaanList.length} Penerima
                  </span>
                </div>
                <p className="text-xs text-baznas-ink/55 mt-0.5">
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
                  className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-3.5 py-2.5 text-xs font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Penerima {activePendayagunaanSub !== "all" ? activePendayagunaanSub : ""}
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
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
                  className="flex items-center gap-1.5 rounded-xl border border-baznas-ink-8 bg-white px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
                >
                  <Download className="h-3.5 w-3.5 text-baznas-green-700" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter Sub-Program */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-baznas-ink/45" />
                <input
                  type="text"
                  value={searchSubProg}
                  onChange={(e) => setSearchSubProg(e.target.value)}
                  placeholder="Cari NIK / Nama Penerima..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-700"
                />
              </div>

              <select
                value={filterSubProgDesil}
                onChange={(e) => setFilterSubProgDesil(e.target.value)}
                className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none font-semibold"
              >
                <option value="all">Semua Tingkat Desil (1–10)</option>
                {DESIL_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              {activePendayagunaanSub !== "all" && (
                <button
                  onClick={() => setActivePendayagunaanSub("all")}
                  className="rounded-xl border border-baznas-ink-8 bg-white px-4 py-4 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Tampilkan Semua Sub-Program
                </button>
              )}
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto rounded-xl border border-baznas-ink-8">
              <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/65">
                <thead className="bg-baznas-paper/40 text-[11px] font-bold text-baznas-ink/55 uppercase tracking-wider border-b border-baznas-ink-8">
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
                <tbody className="divide-y divide-baznas-ink-8">
                  {filteredPendayagunaanList.map((m) => (
                    <tr key={m.id} className="hover:bg-baznas-paper/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-baznas-ink block">{m.namaLengkap}</span>
                        <span className="text-[11px] font-mono text-baznas-ink/45">NIK: {m.nik}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">
                        {m.namaSubProgram}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desilBadgeClass(m.desil)}`}
                          >
                            {m.desil}
                          </span>
                          <ClassificationBadge desil={m.desil} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-baznas-ink/80">{m.asnaf}</td>
                      <td className="py-3.5 px-4 font-bold text-baznas-ink">
                        {formatRupiah(m.totalBantuanDiterima)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="block text-baznas-ink truncate">{m.alamat}</span>
                        <span className="text-[11px] text-baznas-ink/45 block">{m.kondisi}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block bg-baznas-paper border border-baznas-ink-12 text-baznas-ink text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          {m.statusKelayakan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-ink text-baznas-ink/65 transition-colors"
                            title="Edit Data Mustahik"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMustahikItem(m.id, m.namaLengkap)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper hover:text-rose-700 text-baznas-ink/65 transition-colors"
                            title="Hapus Mustahik"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareMustahik(m)}
                            className="p-1.5 rounded-lg border border-baznas-ink-8 bg-white hover:bg-baznas-paper/40 hover:text-baznas-green-900 text-baznas-ink/65 transition-colors"
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
                      <td colSpan={8} className="py-8 text-center text-baznas-ink/45">
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
      {canAccessTab(currentUser, "bidang2", "pencairan") && activeTab === "pencairan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins">
                Alur Persetujuan Pencairan Dana Bantuan (SPK)
              </h3>
              <p className="text-xs text-baznas-ink/55">
                Alur resmi 2 tahap: Pengajuan Bidang II ➔ Disetujui Ketua BAZNAS ➔ Dikonfirmasi Kembali oleh Bidang II ➔ Diteruskan ke Kas Bidang III
              </p>
            </div>
            <button
              onClick={() => setShowModalNew(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Pengajuan Baru (SPK)
            </button>
          </div>

          {/* Diagram Alur SPK */}
          <div className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/30/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-baznas-ink/45 block mb-2">
              Siklus Alur Otorisasi SPK:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-baznas-ink-8">
                <span className="font-bold text-amber-700 block">1. Diajukan</span>
                <span className="text-[10px] text-baznas-ink/55">Oleh Amil Bidang II</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="font-bold text-baznas-ink block">2. Disetujui Ketua</span>
                <span className="text-[10px] text-baznas-ink/55">Ketua Mohamad Husain Rauf</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-800 block">3. Dikonfirmasi Bidang II</span>
                <span className="text-[10px] text-baznas-ink/55">Verifikasi Berkas Akhir</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-baznas-ink-8">
                <span className="font-bold text-baznas-ink block">4. Cair ke Bidang III</span>
                <span className="text-[10px] text-baznas-ink/55">Transfer Kas Bendahara</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-2">
            {pencairanList.map((p) => {
              const isPendingKetua = p.status === "diajukan";
              const isApprovedKetua = p.status === "disetujui_ketua";
              const isConfirmedBidang2 = p.status === "dikonfirmasi_bidang2";
              const isRejected = p.status === "ditolak";

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-8 transition-all ${
                    isPendingKetua
                      ? "border border-baznas-ink-20 bg-baznas-paper/30"
                      : isApprovedKetua
                      ? "border border-baznas-ink-20 bg-baznas-paper/30"
                      : isConfirmedBidang2
                      ? "border border-baznas-ink-20 bg-baznas-paper/30"
                      : "border-rose-200 bg-baznas-paper/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-baznas-ink/80">
                          {p.nomorSPK}
                        </span>

                        {isPendingKetua && (
                          <span className="inline-block bg-baznas-paper border border-baznas-ink-20 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Menunggu Persetujuan Ketua BAZNAS
                          </span>
                        )}

                        {isApprovedKetua && (
                          <span className="inline-block bg-baznas-paper border border-baznas-ink-20 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Disetujui Ketua — Siap Dikonfirmasi Bidang II
                          </span>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="inline-block bg-baznas-paper border border-baznas-ink-12 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Dikonfirmasi Bidang II (Siap Diberikan)
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-block bg-baznas-paper border border-baznas-gold-display text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-rose-300 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ditolak
                          </span>
                        )}

                        <span className="inline-block bg-baznas-paper/40 px-2 py-0.5 text-[10px] font-bold text-baznas-ink/80 uppercase">
                          {p.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {p.namaSubProgram}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-baznas-ink font-poppins">
                        {p.namaProgram}
                      </h4>
                      <p className="text-xs text-baznas-ink/65">{p.keterangan}</p>

                      <p className="text-[11px] text-baznas-ink/55">
                        Target: <strong>{p.jumlahMustahik} Mustahik</strong> • Tanggal: {p.tanggal}
                        {p.approver && ` • Disetujui oleh: ${p.approver}`}
                        {p.catatanPenolakan && (
                          <span className="text-baznas-ink font-semibold block mt-0.5">
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
                          <span className="text-[11px] text-baznas-ink/80 bg-baznas-paper border border-baznas-ink-20 px-2.5 py-1 italic">
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
                            className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-3.5 py-2.5 text-xs font-bold text-white transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Konfirmasi Pencairan Dana (Bidang II)
                          </button>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="text-[11px] font-bold text-baznas-green-900 bg-baznas-paper border border-baznas-ink-12 px-2.5 py-1">
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
      {canAccessTab(currentUser, "bidang2", "dokumentasi") && activeTab === "dokumentasi" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <h3 className="text-base font-bold text-baznas-ink font-poppins">
            Berita Acara Serah Terima (BAST) &amp; Dokumentasi Lapangan
          </h3>
          <p className="text-xs text-baznas-ink/55">
            Arsip tanda terima dan dokumentasi foto penyerahan hak mustahik
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-baznas-ink-8 p-8 bg-baznas-paper/40 space-y-2">
              <span className="text-xs font-bold text-baznas-ink font-mono">BAST-2026/09/018</span>
              <p className="font-semibold text-baznas-ink text-xs">Penyerahan Bantuan Beasiswa Santri Yatim 15 Orang</p>
              <p className="text-[11px] text-baznas-ink/55">Kategori: Program Pendistribusian (Pendidikan) • Tgl: 18 Sep 2026</p>
              <span className="inline-block text-[10px] bg-baznas-paper border border-baznas-ink-12 text-baznas-ink font-bold px-2 py-0.5 rounded">
                Dokumen Lengkap &amp; Terverifikasi
              </span>
            </div>
            <div className="rounded-xl border border-baznas-ink-8 p-8 bg-baznas-paper/40 space-y-2">
              <span className="text-xs font-bold text-baznas-ink font-mono">BAST-2026/08/042</span>
              <p className="font-semibold text-baznas-ink text-xs">Penyerahan Bantuan Modal Usaha Z-Mart 5 Mustahik</p>
              <p className="text-[11px] text-baznas-ink/55">Kategori: Program Pendayagunaan (Ekonomi) • Tgl: 15 Agu 2026</p>
              <span className="inline-block text-[10px] bg-baznas-paper border border-baznas-ink-12 text-baznas-ink font-bold px-2 py-0.5 rounded">
                Dokumen Lengkap &amp; Terverifikasi
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. LAPORAN PENYALURAN */}
      {canAccessTab(currentUser, "bidang2", "laporan") && activeTab === "laporan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins">
                Laporan Rekapitulasi Penyaluran Mustahik
              </h3>
              <p className="text-xs text-baznas-ink/55">
                Daftar lengkap mustahik terdaftar dan total alokasi dana bantuan tersalurkan.
              </p>
            </div>
            <button
              onClick={() => handleExportMustahik()}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              Export Laporan ke Excel
            </button>
          </div>
        </div>
      )}

      {/* 8. PENGATURAN BIDANG 2 */}
      {canAccessTab(currentUser, "bidang2", "pengaturan") && activeTab === "pengaturan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-8 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Pengaturan Kriteria Asesmen &amp; Ambang Batas Desil
            </h3>
            <p className="text-xs text-baznas-ink/55 mt-2">
              Skala 1–10 (BPS-style) — <strong className="text-baznas-ink">Desil 1–5 diklasifikasikan sebagai Mustahik (penerima manfaat)</strong>, sedangkan <strong className="text-baznas-ink">Desil 6–10 sebagai Muzakki (pemberi zakat)</strong>. Aturan ini berlaku konsisten di seluruh modul BAZNAS.
            </p>
          </div>

          {/* Group: Mustahik (Desil 1–5) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/85">
                Mustahik
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-ink/70">Desil 1–5 · Penerima Manfaat</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {KRITERIA_DESIL.filter((k) => k.klasifikasi === "mustahik").map((k) => (
                <div
                  key={k.desil}
                  className="border border-l-4 border-l-baznas-ink-20 border-baznas-ink-8 p-3 bg-baznas-paper/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold block text-baznas-ink">{k.label}</span>
                    <span className="text-[9px] text-baznas-ink/45 font-mono">{k.pendapatan}</span>
                  </div>
                  <span className="text-baznas-ink/55 block">{k.deskripsi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group: Muzakki (Desil 6–10) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-baznas-paper border border-baznas-green-700 text-baznas-green-900">
                Muzakki
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-ink/70">Desil 6–10 · Pemberi Zakat</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {KRITERIA_DESIL.filter((k) => k.klasifikasi === "muzakki").map((k) => (
                <div
                  key={k.desil}
                  className="border border-l-4 border-l-baznas-green-700 border-baznas-ink-8 p-3 bg-baznas-paper/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold block text-baznas-ink">{k.label}</span>
                    <span className="text-[9px] text-baznas-ink/45 font-mono">{k.pendapatan}</span>
                  </div>
                  <span className="text-baznas-ink/55 block">{k.deskripsi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN SPK BARU */}
      {showModalNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lift border border-baznas-ink-8 overflow-hidden">
            <div className="border border-baznas-ink-8 bg-baznas-paper">
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
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePencairan} className="p-6 space-y-8 text-xs">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Nama Program Kerja Penyaluran *</label>
                <input
                  type="text"
                  required
                  value={namaProgram}
                  onChange={(e) => setNamaProgram(e.target.value)}
                  placeholder="Contoh: Bantuan Beasiswa Santri Berprestasi Periode 2"
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Pilar Program Utama</label>
                  <select
                    value={kategoriBesar}
                    onChange={(e) => handleKategoriBesarChange(e.target.value as KategoriPilarBidang2)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                  >
                    <option value="pendistribusian">1. Pendistribusian (Konsumtif)</option>
                    <option value="pendayagunaan">2. Pendayagunaan (Produktif)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Sub-Program</label>
                  <select
                    value={subProgram}
                    onChange={(e) => setSubProgram(e.target.value as SubProgramPendistribusian | SubProgramPendayagunaan)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
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
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nominal Anggaran SPK (Rp) *</label>
                  <input
                    type="number"
                    step="500000"
                    required
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-bold text-baznas-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Target Mustahik (Jiwa / KK)</label>
                  <input
                    type="number"
                    min="1"
                    value={jumlahMustahik}
                    onChange={(e) => setJumlahMustahik(Number(e.target.value))}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Keterangan / Rincian Penyaluran</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan latar belakang penerima manfaat, lokasi, atau syarat SKTM..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setShowModalNew(false)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lift border border-baznas-ink-8 overflow-hidden">
            <div className="border border-baznas-ink-8 bg-baznas-paper">
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
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMustahikForm} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Nama Lengkap Mustahik *</label>
                <input
                  type="text"
                  required
                  value={mustahikNama}
                  onChange={(e) => setMustahikNama(e.target.value)}
                  placeholder="Contoh: Sitti Aminah / Keluarga Hasan"
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={mustahikNik}
                    onChange={(e) => setMustahikNik(e.target.value)}
                    placeholder="7571010101850001"
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-mono text-baznas-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">No. KK (Opsional)</label>
                  <input
                    type="text"
                    value={mustahikKk}
                    onChange={(e) => setMustahikKk(e.target.value)}
                    placeholder="7571010101850002"
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-mono text-baznas-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Asnaf Zakat</label>
                  <select
                    value={mustahikAsnaf}
                    onChange={(e) => setMustahikAsnaf(e.target.value as Mustahik["asnaf"])}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
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
                  <label className="block font-bold text-baznas-ink/80 mb-1">Tingkat Desil</label>
                  <select
                    value={mustahikDesil}
                    onChange={(e) => setMustahikDesil(e.target.value as DesilType)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none font-semibold"
                  >
                    {DESIL_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nominal Bantuan (Rp)</label>
                  <input
                    type="number"
                    step="100000"
                    value={mustahikBantuan}
                    onChange={(e) => setMustahikBantuan(Number(e.target.value))}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-bold text-baznas-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    value={mustahikAlamat}
                    onChange={(e) => setMustahikAlamat(e.target.value)}
                    placeholder="Kelurahan / Kecamatan"
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Kondisi / Alasan Bantuan</label>
                <input
                  type="text"
                  value={mustahikKondisi}
                  onChange={(e) => setMustahikKondisi(e.target.value)}
                  placeholder="Contoh: Buruh harian lepas dengan 3 anak sekolah"
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setIsAddMustahikModalOpen(false)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan Penerima Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL MUSTAHIK */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Mustahik dari Excel"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-lift border border-baznas-ink-8 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="border border-baznas-ink-8 bg-baznas-paper">
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
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditMustahik} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Nama Lengkap Mustahik *</label>
                <input
                  type="text"
                  required
                  value={editingMustahik.namaLengkap}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, namaLengkap: e.target.value })}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    value={editingMustahik.nik}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, nik: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    value={editingMustahik.kk || ""}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, kk: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Asnaf</label>
                  <select
                    value={editingMustahik.asnaf}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, asnaf: e.target.value as Mustahik["asnaf"] })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
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
                  <label className="block font-bold text-baznas-ink/80 mb-1">Tingkat Desil</label>
                  <select
                    value={editingMustahik.desil}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, desil: e.target.value as DesilType })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none font-semibold"
                  >
                    {DESIL_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Status Kelayakan</label>
                  <select
                    value={editingMustahik.statusKelayakan}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, statusKelayakan: e.target.value as Mustahik["statusKelayakan"] })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none capitalize font-semibold"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus / Mandiri</option>
                    <option value="ditinjau">Ditinjau Ulang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Kategori Pilar</label>
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
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                  >
                    <option value="pendistribusian">Pendistribusian</option>
                    <option value="pendayagunaan">Pendayagunaan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Sub-Program</label>
                  <select
                    value={editingMustahik.namaSubProgram}
                    onChange={(e) => setEditingMustahik({ ...editingMustahik, namaSubProgram: e.target.value as SubProgramPendistribusian | SubProgramPendayagunaan })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none font-semibold"
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
                <label className="block font-bold text-baznas-ink/80 mb-1">Total Bantuan Diterima (Rp)</label>
                <input
                  type="number"
                  value={editingMustahik.totalBantuanDiterima}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, totalBantuanDiterima: Number(e.target.value) })}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs font-mono font-bold text-baznas-ink focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={editingMustahik.alamat}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, alamat: e.target.value })}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Kondisi / Keterangan Masalah</label>
                <textarea
                  rows={2}
                  value={editingMustahik.kondisi}
                  onChange={(e) => setEditingMustahik({ ...editingMustahik, kondisi: e.target.value })}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setEditingMustahik(null)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 hover:bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MUSTAHIK (UX Plan §3.2) */}
      <ConfirmDialog
        open={!!deleteTarget}
        severity="danger"
        title="Hapus Data Mustahik"
        message={
          deleteTarget
            ? `Anda akan MENGHAPUS data penerima "${deleteTarget.name}" dari sistem. Tindakan ini tidak dapat dibatalkan. Jika ingin menyimpan jejak audit, pertimbangkan untuk mengubah status kelayakan menjadi "lulus" sebagai ganti menghapus.`
            : ""
        }
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        affirmationLabel="Saya memahami bahwa data ini akan dihapus permanen dan tidak dapat dipulihkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Container — render global toast UI */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
