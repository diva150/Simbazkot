"use client";

import React, { useState, useMemo } from "react";
import { Muzakki, SetoranZIS, Instansi, Bidang1Tab, DesilType } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { exportToExcel, downloadTemplateMuzakki } from "@/lib/excel-utils";
import { ImportExcelModal } from "@/components/common/ImportExcelModal";
import {
  HandCoins,
  Calculator,
  Printer,
  Search,
  Download,
  Upload,
  Coins,
  Heart,
  Gift,
  FileText,
  Settings,
  Plus,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  UserPlus,
  Filter,
  UserCheck,
  Building,
  CreditCard,
  Edit,
} from "lucide-react";

interface Bidang1ViewProps {
  muzakkiList: Muzakki[];
  setoranList: SetoranZIS[];
  instansiList: Instansi[];
  onAddSetoran: (setoran: SetoranZIS) => void;
  onViewKwitansi: (setoran: SetoranZIS) => void;
  onImportMuzakki: (newMuzakki: Muzakki[]) => void;
  onAddMuzakki?: (newMuzakki: Muzakki) => void;
  activeTab?: Bidang1Tab;
  onTabChange?: (tab: Bidang1Tab) => void;
}

export const Bidang1View: React.FC<Bidang1ViewProps> = ({
  muzakkiList,
  setoranList,
  instansiList,
  onAddSetoran,
  onViewKwitansi,
  onImportMuzakki,
  onAddMuzakki,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<Bidang1Tab>("dashboard");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: Bidang1Tab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddMuzakkiModalOpen, setIsAddMuzakkiModalOpen] = useState(false);

  // Form State Penerimaan
  const [muzakkiInputMode, setMuzakkiInputMode] = useState<"database" | "manual">("database");
  const [selectedMuzakkiId, setSelectedMuzakkiId] = useState(muzakkiList[0]?.id || "");
  const [searchMuzakkiFormQuery, setSearchMuzakkiFormQuery] = useState("");
  const [filterDesilForm, setFilterDesilForm] = useState<string>("all");

  // Form State Penerimaan Manual
  const [manualNama, setManualNama] = useState("");
  const [manualNik, setManualNik] = useState("");
  const [manualNpwz, setManualNpwz] = useState("");
  const [manualHp, setManualHp] = useState("");
  const [manualInstansi, setManualInstansi] = useState("Masyarakat Umum");
  const [manualAlamat, setManualAlamat] = useState("");
  const [manualDesil, setManualDesil] = useState<DesilType>("Non-Desil");
  const [simpanKeDatabase, setSimpanKeDatabase] = useState(true);

  // Kategori & Nilai Setoran
  const [kategoriUtama, setKategoriUtama] = useState<SetoranZIS["kategoriUtama"]>("zakat");
  const [jenisZis, setJenisZis] = useState<SetoranZIS["jenis"]>("zakat_profesi");
  const [gajiInput, setGajiInput] = useState<number>(10000000);
  const [nominalManual, setNominalManual] = useState<number>(250000);
  const [metode, setMetode] = useState<"tunai" | "transfer">("tunai");
  const [bank, setBank] = useState<string>("Bank Sulutgo");
  const [keterangan, setKeterangan] = useState<string>("Zakat Penghasilan Bulan September");

  // Filter Data Muzakki Tab
  const [searchMuzakkiQuery, setSearchMuzakkiQuery] = useState("");
  const [selectedInstansiFilter, setSelectedInstansiFilter] = useState("all");
  const [filterMuzakkiDesil, setFilterMuzakkiDesil] = useState<string>("all");
  const [filterMuzakkiNpwz, setFilterMuzakkiNpwz] = useState<string>("all");
  const [filterMuzakkiTipe, setFilterMuzakkiTipe] = useState<"all" | "individu" | "opd">("all");

  // Filter Laporan Penerimaan Tab
  const [searchLaporanQuery, setSearchLaporanQuery] = useState("");
  const [filterLaporanDesil, setFilterLaporanDesil] = useState<string>("all");
  const [filterLaporanJenis, setFilterLaporanJenis] = useState<string>("all");
  const [filterLaporanMetode, setFilterLaporanMetode] = useState<string>("all");

  // State Modal Tambah Muzakki Baru
  const [newMuzakkiTipe, setNewMuzakkiTipe] = useState<"individu" | "opd">("individu");
  const [newMuzakkiNama, setNewMuzakkiNama] = useState("");
  const [newMuzakkiNik, setNewMuzakkiNik] = useState("");
  const [newMuzakkiNpwz, setNewMuzakkiNpwz] = useState(`NPWZ-7171-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newMuzakkiHp, setNewMuzakkiHp] = useState("");
  const [newMuzakkiAlamat, setNewMuzakkiAlamat] = useState("");
  const [newMuzakkiInstansiId, setNewMuzakkiInstansiId] = useState(instansiList[0]?.id || "inst-1");
  const [newMuzakkiDesil, setNewMuzakkiDesil] = useState<DesilType>("Non-Desil");

  // Hitung Zakat Otomatis
  const calculatedZakat = Math.round(gajiInput * 0.025);
  const finalNominal =
    kategoriUtama === "zakat" && jenisZis === "zakat_profesi"
      ? calculatedZakat
      : nominalManual;

  const currentMuzakki = muzakkiList.find((m) => m.id === selectedMuzakkiId) || muzakkiList[0];

  // Filter List Muzakki untuk Form Pilihan
  const formFilteredMuzakkiList = useMemo(() => {
    return muzakkiList.filter((m) => {
      const q = searchMuzakkiFormQuery.toLowerCase();
      const matchSearch =
        !q ||
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        (m.npwz && m.npwz.toLowerCase().includes(q));
      const matchDesil =
        filterDesilForm === "all" || (m.desil && m.desil === filterDesilForm);
      return matchSearch && matchDesil;
    });
  }, [muzakkiList, searchMuzakkiFormQuery, filterDesilForm]);

  // Filtering Muzakki by NIK / NPWZ / Nama / Desil / Instansi / Tipe
  const filteredMuzakki = useMemo(() => {
    return muzakkiList.filter((m) => {
      const q = searchMuzakkiQuery.toLowerCase();
      const matchSearch =
        !q ||
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        (m.npwz && m.npwz.toLowerCase().includes(q)) ||
        m.alamat.toLowerCase().includes(q);
      const matchInstansi =
        selectedInstansiFilter === "all" || m.instansiId === selectedInstansiFilter;
      const matchDesil =
        filterMuzakkiDesil === "all" || (m.desil && m.desil === filterMuzakkiDesil);
      const matchNpwz =
        filterMuzakkiNpwz === "all" ||
        (filterMuzakkiNpwz === "ber_npwz" && m.npwz && m.npwz !== "-" && m.npwz.trim() !== "") ||
        (filterMuzakkiNpwz === "tanpa_npwz" && (!m.npwz || m.npwz === "-" || m.npwz.trim() === ""));
      const matchTipe =
        filterMuzakkiTipe === "all" ||
        (m.tipeMuzakki || "individu") === filterMuzakkiTipe;
      return matchSearch && matchInstansi && matchDesil && matchNpwz && matchTipe;
    });
  }, [muzakkiList, searchMuzakkiQuery, selectedInstansiFilter, filterMuzakkiDesil, filterMuzakkiNpwz, filterMuzakkiTipe]);

  // Filtering Laporan Setoran
  const filteredSetoran = useMemo(() => {
    return setoranList.filter((s) => {
      const q = searchLaporanQuery.toLowerCase();
      const matchQuery =
        !q ||
        s.buktiNo.toLowerCase().includes(q) ||
        s.namaMuzakki.toLowerCase().includes(q) ||
        (s.npwz && s.npwz.toLowerCase().includes(q)) ||
        s.nik.includes(q);
      const matchDesil =
        filterLaporanDesil === "all" || (s.desil && s.desil === filterLaporanDesil);
      const matchJenis =
        filterLaporanJenis === "all" || s.jenis === filterLaporanJenis;
      const matchMetode =
        filterLaporanMetode === "all" || s.metode === filterLaporanMetode;
      return matchQuery && matchDesil && matchJenis && matchMetode;
    });
  }, [setoranList, searchLaporanQuery, filterLaporanDesil, filterLaporanJenis, filterLaporanMetode]);

  // Submit Muzakki Baru
  const handleCreateNewMuzakki = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuzakkiNama.trim()) {
      alert("Nama lengkap muzakki wajib diisi.");
      return;
    }

    const selectedIns = instansiList.find((i) => i.id === newMuzakkiInstansiId);
    const newM: Muzakki = {
      id: `muz-${Date.now()}`,
      namaLengkap: newMuzakkiNama,
      nik: newMuzakkiNik || `717100000000000${Math.floor(10 + Math.random() * 90)}`,
      npwz: newMuzakkiNpwz || `NPWZ-7171-${Math.floor(1000 + Math.random() * 9000)}`,
      noHp: newMuzakkiHp || "081200000000",
      alamat: newMuzakkiAlamat || "Kota Manado",
      instansiId: newMuzakkiInstansiId,
      namaInstansi: selectedIns ? selectedIns.nama : "Instansi Umum",
      status: "aktif",
      totalSetoran: 0,
      desil: newMuzakkiDesil,
      tipeMuzakki: newMuzakkiTipe,
    };

    if (onAddMuzakki) {
      onAddMuzakki(newM);
    } else {
      muzakkiList.unshift(newM);
    }

    setIsAddMuzakkiModalOpen(false);
    setSelectedMuzakkiId(newM.id);
    setNewMuzakkiNama("");
    setNewMuzakkiNik("");
    setNewMuzakkiHp("");
    setNewMuzakkiAlamat("");
  };

  // Export Muzakki to Excel
  const handleExportMuzakki = () => {
    const headers = [
      "No",
      "Nomor Pokok Wajib Zakat (NPWZ)",
      "NIK / No Identitas",
      "Nama Lengkap Muzakki / OPD",
      "Tipe Muzakki",
      "Tingkat Desil",
      "Instansi / Unit Kerja",
      "Nomor WhatsApp / HP",
      "Alamat Domisili / Kantor",
      "Total Zakat Disetor (Rp)",
      "Status",
    ];
    const rows = filteredMuzakki.map((m, idx) => [
      idx + 1,
      m.npwz || "-",
      m.nik,
      m.namaLengkap,
      m.tipeMuzakki === "opd" ? "OPD / INSTANSI" : "INDIVIDU",
      m.desil || "Non-Desil",
      m.namaInstansi,
      m.noHp,
      m.alamat,
      m.totalSetoran,
      m.status.toUpperCase(),
    ]);
    exportToExcel("Data_Muzakki_BAZNAS_Resmi", headers, rows);
  };

  // Export Setoran to Excel
  const handleExportSetoran = () => {
    const headers = [
      "No Bukti",
      "Tanggal",
      "Nama Muzakki",
      "NIK",
      "NPWZ",
      "Tingkat Desil",
      "Instansi",
      "Jenis Penerimaan",
      "Metode",
      "Bank",
      "Nominal (Rp)",
      "Keterangan",
      "Petugas Amil",
    ];
    const rows = filteredSetoran.map((s) => [
      s.buktiNo,
      s.tanggal,
      s.namaMuzakki,
      s.nik,
      s.npwz || "-",
      s.desil || "Non-Desil",
      s.instansi,
      s.jenisLabel,
      s.metode,
      s.bank || "-",
      s.nominal,
      s.keterangan || "-",
      s.petugasAmil,
    ]);
    exportToExcel("Laporan_Penerimaan_ZIS_BAZNAS", headers, rows);
  };

  // Import Muzakki from CSV
  const handleImportParsedMuzakki = (rows: string[][]) => {
    const imported: Muzakki[] = rows.map((r, idx) => ({
      id: `muz-imp-${Date.now()}-${idx}`,
      namaLengkap: r[0] || "Muzakki Baru",
      nik: r[1] || `717100000000000${idx}`,
      npwz: r[2] || `NPWZ-7171-${Date.now()}-${idx}`,
      noHp: r[3] || "081200000000",
      alamat: r[4] || "Kota Manado",
      instansiId: "inst-1",
      namaInstansi: r[5] || "Instansi Umum",
      desil: (r[6] as DesilType) || "Non-Desil",
      status: "aktif",
      totalSetoran: 0,
    }));
    onImportMuzakki(imported);
  };

  const handleSimpanSetoran = (e: React.FormEvent) => {
    e.preventDefault();

    let targetMuzakkiId = "";
    let targetNama = "";
    let targetNik = "";
    let targetNpwz = "";
    let targetInstansi = "";
    let targetDesil: DesilType = "Non-Desil";

    if (muzakkiInputMode === "database") {
      if (!currentMuzakki) {
        alert("Pilih muzakki dari daftar database terlebih dahulu.");
        return;
      }
      targetMuzakkiId = currentMuzakki.id;
      targetNama = currentMuzakki.namaLengkap;
      targetNik = currentMuzakki.nik;
      targetNpwz = currentMuzakki.npwz || "";
      targetInstansi = currentMuzakki.namaInstansi;
      targetDesil = currentMuzakki.desil || "Non-Desil";
    } else {
      // Manual typing mode
      if (!manualNama.trim()) {
        alert("Nama muzakki wajib diisi pada mode ketik manual.");
        return;
      }
      targetMuzakkiId = `muz-manual-${Date.now()}`;
      targetNama = manualNama.trim();
      targetNik = manualNik.trim() || `7171${Date.now().toString().slice(-12)}`;
      targetNpwz = manualNpwz.trim() || `NPWZ-INS-${Math.floor(1000 + Math.random() * 9000)}`;
      targetInstansi = manualInstansi.trim() || "Masyarakat Umum";
      targetDesil = manualDesil;

      // Jika opsi simpan ke database muzakki dicentang
      if (simpanKeDatabase) {
        const newMuz: Muzakki = {
          id: targetMuzakkiId,
          namaLengkap: targetNama,
          nik: targetNik,
          npwz: targetNpwz,
          noHp: manualHp || "-",
          alamat: manualAlamat || "Kota Manado",
          instansiId: "inst-1",
          namaInstansi: targetInstansi,
          status: "aktif",
          totalSetoran: finalNominal,
          desil: targetDesil,
        };
        if (onAddMuzakki) {
          onAddMuzakki(newMuz);
        } else {
          muzakkiList.unshift(newMuz);
        }
      }
    }

    const labelMap: Record<string, string> = {
      zakat_profesi: "Zakat Profesi (2,5%)",
      zakat_fitrah: "Zakat Fitrah",
      zakat_maal: "Zakat Maal / Harta",
      infaq_terikat: "Infak Terikat Program",
      infaq_umum: "Infak Umum / Sedekah",
      sedekah: "Sedekah Subuh / Harian",
      dskl_qurban: "DSKL — Tabungan Qurban",
      dskl_fidyah: "DSKL — Fidyah & Kafarat",
    };

    const newSetoran: SetoranZIS = {
      id: `set-${Date.now()}`,
      buktiNo: `BZ-202609-00${Math.floor(100 + Math.random() * 900)}`,
      muzakkiId: targetMuzakkiId,
      namaMuzakki: targetNama,
      nik: targetNik,
      npwz: targetNpwz,
      desil: targetDesil,
      instansi: targetInstansi,
      kategoriUtama: kategoriUtama,
      jenis: jenisZis,
      jenisLabel: labelMap[jenisZis] || "ZIS Penerimaan",
      metode: metode,
      bank: metode === "transfer" ? bank : undefined,
      nominal: finalNominal,
      persen: jenisZis === "zakat_profesi" ? 2.5 : undefined,
      gajiDasar: jenisZis === "zakat_profesi" ? gajiInput : undefined,
      tanggal: new Date().toISOString().split("T")[0],
      keterangan: keterangan,
      petugasAmil: "Amil Bidang I",
    };

    onAddSetoran(newSetoran);
    onViewKwitansi(newSetoran);
  };

  const totalZIS = setoranList.reduce((acc, curr) => acc + curr.nominal, 0);

  return (
    <div className="space-y-6">
      {/* Header Modul Bidang I */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-baznas-green-800">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-poppins">
                Bidang I — Pengumpulan ZIS &amp; DSKL
              </h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Unit Pengumpulan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pejabat: <span className="font-semibold text-slate-700">Husain Dima</span> (Waka 1) — Staf: Minarti Alhabsyi (Pengumpulan) &amp; Azmi K. Jassin (Pelaporan &amp; Perencanaan)
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD RINGKASAN BIDANG 1 */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total ZIS Terhimpun
              </span>
              <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-2">
                {formatRupiah(totalZIS)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{setoranList.length} transaksi setoran kas</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Muzakki Terdaftar
              </span>
              <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
                {muzakkiList.length} <span className="text-sm font-normal text-slate-500">Muzakki</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Lengkap NIK, NPWZ &amp; Desil</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Instansi / OPD Aktif
              </span>
              <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
                {instansiList.length} <span className="text-sm font-normal text-slate-500">Unit UPZ</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Payroll Zakat ASN Terhubung</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nisab Emas 2026
              </span>
              <p className="text-2xl font-bold text-amber-700 font-poppins mt-2">
                Rp 82.500.000
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Setara 85 gr Emas / Tahun</p>
            </div>
          </div>

          {/* Quick Actions Bidang 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setActiveTab("zakat");
                setJenisZis("zakat_profesi");
              }}
              className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 hover:bg-emerald-100/60 transition-colors"
            >
              <Coins className="h-6 w-6 text-baznas-green-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 font-poppins">Catat Zakat Profesi (2,5%)</h3>
              <p className="text-xs text-slate-500 mt-1">Pilih atau ketik muzakki langsung, hitung zakat otomatis &amp; cetak bukti.</p>
            </div>

            <div
              onClick={() => {
                setActiveTab("infak");
                setJenisZis("infaq_terikat");
              }}
              className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/50 p-5 hover:bg-amber-100/60 transition-colors"
            >
              <Heart className="h-6 w-6 text-amber-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 font-poppins">Catat Infak / Sedekah</h3>
              <p className="text-xs text-slate-500 mt-1">Penerimaan infak terikat program atau sedekah umum harian.</p>
            </div>

            <div
              onClick={() => {
                setActiveTab("dskl");
                setJenisZis("dskl_qurban");
              }}
              className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50/50 p-5 hover:bg-blue-100/60 transition-colors"
            >
              <Gift className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 font-poppins">Catat DSKL &amp; Qurban</h3>
              <p className="text-xs text-slate-500 mt-1">Dana sosial keagamaan lainnya, fidyah, kafarat &amp; tabungan qurban.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DATA MUZAKKI (FILTER NIK/NPWZ, DESIL, TAMBAH MUZAKKI, IMPORT & EXPORT EXCEL) */}
      {activeTab === "muzakki" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Data Muzakki Terdaftar (Individu, OPD &amp; Instansi)
              </h3>
              <p className="text-xs text-slate-500">
                Filter multi-kriteria: Nama, NIK (16 digit), NPWZ resmi, Tingkat Desil, dan Unit Instansi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddMuzakkiModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Tambah Muzakki Baru
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5 text-baznas-green-700" />
                Import Excel / CSV
              </button>

              <button
                onClick={handleExportMuzakki}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-baznas-green-700" />
                Export Excel ({filteredMuzakki.length})
              </button>
            </div>
          </div>

          {/* Filter Bar Lengkap: NIK/NPWZ/Nama, Tipe, Desil, Status NPWZ, Instansi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchMuzakkiQuery}
                onChange={(e) => setSearchMuzakkiQuery(e.target.value)}
                placeholder="Cari NIK, NPWZ, atau Nama..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:bg-white"
              />
            </div>

            {/* Filter Tipe Muzakki (Individu vs OPD) */}
            <select
              value={filterMuzakkiTipe}
              onChange={(e) => setFilterMuzakkiTipe(e.target.value as "all" | "individu" | "opd")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
            >
              <option value="all">Semua Tipe (Individu &amp; OPD)</option>
              <option value="individu">Muzakki Individu (Perorangan)</option>
              <option value="opd">Muzakki OPD (Instansi / Dinas)</option>
            </select>

            {/* Filter Desil */}
            <select
              value={filterMuzakkiDesil}
              onChange={(e) => setFilterMuzakkiDesil(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
            >
              <option value="all">Semua Tingkat Desil</option>
              <option value="Desil 1">Desil 1 (Ekstrem)</option>
              <option value="Desil 2">Desil 2 (Miskin)</option>
              <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
              <option value="Desil 4">Desil 4 (Rentan)</option>
              <option value="Non-Desil">Non-Desil / Mampu</option>
            </select>

            {/* Filter Status NPWZ */}
            <select
              value={filterMuzakkiNpwz}
              onChange={(e) => setFilterMuzakkiNpwz(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Status NPWZ</option>
              <option value="ber_npwz">Memiliki NPWZ Resmi</option>
              <option value="tanpa_npwz">Belum Ada NPWZ</option>
            </select>

            {/* Filter Instansi */}
            <select
              value={selectedInstansiFilter}
              onChange={(e) => setSelectedInstansiFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Instansi / OPD</option>
              {instansiList.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tabel Data Muzakki */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Muzakki</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">NIK &amp; NPWZ</th>
                  <th className="px-4 py-3">Tingkat Desil</th>
                  <th className="px-4 py-3">Instansi / Unit</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3 text-right">Total Setoran</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMuzakki.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{m.namaLengkap}</p>
                      <p className="text-[11px] text-slate-400">{m.alamat}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.tipeMuzakki === "opd"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {m.tipeMuzakki === "opd" ? "OPD / Instansi" : "Individu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <p className="text-slate-800 font-medium">NIK: {m.nik}</p>
                      <span className="text-[10px] text-baznas-green-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        {m.npwz || "Belum ada NPWZ"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          m.desil === "Desil 1"
                            ? "bg-rose-100 text-rose-800"
                            : m.desil === "Desil 2"
                            ? "bg-amber-100 text-amber-800"
                            : m.desil === "Desil 3" || m.desil === "Desil 4"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {m.desil || "Non-Desil"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{m.namaInstansi}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{m.noHp}</td>
                    <td className="px-4 py-3 text-right font-bold text-baznas-green-900">
                      {formatRupiah(m.totalSetoran)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMuzakki.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ditemukan data muzakki yang sesuai filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INPUT PENERIMAAN (ZAKAT / INFAK / DSKL) DENGAN PILIH DATABASE ATAU KETIK MANUAL */}
      {(activeTab === "zakat" || activeTab === "infak" || activeTab === "dskl") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input Utama (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <form onSubmit={handleSimpanSetoran} className="space-y-6">
              {/* Opsi Pilih Muzakki: Database vs Ketik Manual */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins">
                    1. Data Muzakki / Penyetor
                  </h3>

                  {/* Toggle Mode Input */}
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setMuzakkiInputMode("database")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        muzakkiInputMode === "database"
                          ? "bg-white text-baznas-green-800 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Pilih Database
                    </button>
                    <button
                      type="button"
                      onClick={() => setMuzakkiInputMode("manual")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        muzakkiInputMode === "manual"
                          ? "bg-white text-baznas-green-800 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Ketik Langsung Manual
                    </button>
                  </div>
                </div>

                {/* MODE A: PILIH DARI DATABASE DENGAN LIVE SEARCH & FILTER DESIL/NPWZ */}
                {muzakkiInputMode === "database" ? (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchMuzakkiFormQuery}
                          onChange={(e) => setSearchMuzakkiFormQuery(e.target.value)}
                          placeholder="Filter Nama / NPWZ / NIK..."
                          className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
                        />
                      </div>
                      <select
                        value={filterDesilForm}
                        onChange={(e) => setFilterDesilForm(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="all">Semua Desil</option>
                        <option value="Desil 1">Desil 1</option>
                        <option value="Desil 2">Desil 2</option>
                        <option value="Desil 3">Desil 3</option>
                        <option value="Desil 4">Desil 4</option>
                        <option value="Non-Desil">Non-Desil</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Pilih Muzakki Hasil Filter ({formFilteredMuzakkiList.length} ditemukan):
                      </label>
                      <select
                        value={selectedMuzakkiId}
                        onChange={(e) => setSelectedMuzakkiId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-baznas-green-700 focus:outline-none font-medium"
                      >
                        {formFilteredMuzakkiList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaLengkap} — NPWZ: {m.npwz || "-"} | NIK: {m.nik} ({m.desil || "Non-Desil"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentMuzakki && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Instansi:</span>
                          <span className="font-semibold text-slate-800">{currentMuzakki.namaInstansi}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                          <span className="font-semibold text-slate-800">{currentMuzakki.noHp}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">NPWZ Resmi:</span>
                          <span className="font-semibold text-baznas-green-800 font-mono">{currentMuzakki.npwz}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tingkat Desil:</span>
                          <span className="font-semibold text-slate-800">{currentMuzakki.desil || "Non-Desil"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODE B: KETIK MANUAL SECARA LANGSUNG */
                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
                    <p className="text-[11px] text-amber-800 font-medium">
                      Mode Ketik Manual: Untuk muzakki insidental, walk-in loket, atau penyetor yang belum terdaftar.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Lengkap Muzakki / Penyetor *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualNama}
                          onChange={(e) => setManualNama(e.target.value)}
                          placeholder="Contoh: H. Ahmad Subardjo"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-baznas-green-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          NPWZ (Opsional / Biarkan jika belum ada)
                        </label>
                        <input
                          type="text"
                          value={manualNpwz}
                          onChange={(e) => setManualNpwz(e.target.value)}
                          placeholder="Contoh: NPWZ-7171-8899"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-baznas-green-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          NIK (16 Digit, Opsional)
                        </label>
                        <input
                          type="text"
                          value={manualNik}
                          onChange={(e) => setManualNik(e.target.value)}
                          placeholder="Contoh: 7171090101900001"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-baznas-green-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tingkat Desil (Kategori Ekonomi)
                        </label>
                        <select
                          value={manualDesil}
                          onChange={(e) => setManualDesil(e.target.value as DesilType)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        >
                          <option value="Non-Desil">Non-Desil (Masyarakat Mampu)</option>
                          <option value="Desil 4">Desil 4 (Rentan)</option>
                          <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                          <option value="Desil 2">Desil 2 (Miskin)</option>
                          <option value="Desil 1">Desil 1 (Ekstrem)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="text"
                          value={manualHp}
                          onChange={(e) => setManualHp(e.target.value)}
                          placeholder="Contoh: 0812-4455-6677"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Instansi / Alamat Penyetor
                        </label>
                        <input
                          type="text"
                          value={manualInstansi}
                          onChange={(e) => setManualInstansi(e.target.value)}
                          placeholder="Contoh: Dinas Kesehatan / Manado Barat"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="checkSimpanDb"
                        checked={simpanKeDatabase}
                        onChange={(e) => setSimpanKeDatabase(e.target.checked)}
                        className="rounded text-baznas-green-800 focus:ring-baznas-green-800 h-4 w-4"
                      />
                      <label htmlFor="checkSimpanDb" className="text-xs text-slate-700 cursor-pointer">
                        Simpan otomatis muzakki ini ke database master Muzakki BAZNAS
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Rincian Pilihan Jenis Sesuai Tab */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-poppins mb-3">
                  2. Jenis Penerimaan {activeTab.toUpperCase()}
                </h3>

                {activeTab === "zakat" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "zakat_profesi", label: "Zakat Profesi (2,5%)" },
                        { id: "zakat_fitrah", label: "Zakat Fitrah" },
                        { id: "zakat_maal", label: "Zakat Maal / Harta" },
                      ].map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setJenisZis(j.id as any)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                            jenisZis === j.id
                              ? "border-baznas-green-700 bg-emerald-50 text-baznas-green-800 ring-2 ring-baznas-green-700/20 font-bold"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {j.label}
                        </button>
                      ))}
                    </div>

                    {jenisZis === "zakat_profesi" ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                          <Calculator className="h-4 w-4 text-amber-600" />
                          <span>Kalkulator Zakat Profesi Otomatis (2,5%)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Gaji Bulanan (Rp)
                            </label>
                            <input
                              type="number"
                              value={gajiInput}
                              onChange={(e) => setGajiInput(Number(e.target.value))}
                              step="500000"
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Zakat yang Wajib Dibayarkan (2,5%)
                            </label>
                            <div className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-baznas-green-800">
                              {formatRupiah(calculatedZakat)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nominal Zakat (Rp)
                        </label>
                        <input
                          type="number"
                          value={nominalManual}
                          onChange={(e) => setNominalManual(Number(e.target.value))}
                          step="50000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "infak" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "infaq_terikat", label: "Infak Terikat Program" },
                        { id: "infaq_umum", label: "Infak Umum" },
                        { id: "sedekah", label: "Sedekah Harian" },
                      ].map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setJenisZis(j.id as any)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                            jenisZis === j.id
                              ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 font-bold"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {j.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nominal Infak / Sedekah (Rp)
                      </label>
                      <input
                        type="number"
                        value={nominalManual}
                        onChange={(e) => setNominalManual(Number(e.target.value))}
                        step="50000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "dskl" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "dskl_qurban", label: "DSKL — Tabungan Qurban" },
                        { id: "dskl_fidyah", label: "DSKL — Fidyah & Kafarat" },
                      ].map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setJenisZis(j.id as any)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                            jenisZis === j.id
                              ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 font-bold"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {j.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nominal DSKL (Rp)
                      </label>
                      <input
                        type="number"
                        value={nominalManual}
                        onChange={(e) => setNominalManual(Number(e.target.value))}
                        step="100000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Metode Bayar & Keterangan */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Penerimaan</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMetode("tunai")}
                        className={`flex-1 rounded-xl border p-2 text-xs font-semibold ${
                          metode === "tunai" ? "border-baznas-green-800 bg-emerald-50 text-baznas-green-800 font-bold" : "border-slate-200"
                        }`}
                      >
                        Tunai di Loket
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetode("transfer")}
                        className={`flex-1 rounded-xl border p-2 text-xs font-semibold ${
                          metode === "transfer" ? "border-baznas-green-800 bg-emerald-50 text-baznas-green-800 font-bold" : "border-slate-200"
                        }`}
                      >
                        Transfer Bank
                      </button>
                    </div>
                  </div>

                  {metode === "transfer" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Penerima BAZNAS</label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-medium"
                      >
                        <option value="Bank Sulutgo">Bank Sulutgo — 001.02.11.000123.0</option>
                        <option value="Bank Muamalat">Bank Muamalat — 801.000.456.7</option>
                        <option value="Bank BTN Syariah">Bank BTN Syariah — 702.100.999.1</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Niat Muzakki</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Pembayaran Zakat Profesi ASN Bulan Berjalan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20"
                >
                  <Printer className="h-4 w-4" />
                  Simpan &amp; Buka Kwitansi Resmi
                </button>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Pratinjau Kwitansi Siap Terbit */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-baznas-green-800">
                Nilai Siap Diterbitkan
              </span>
              <p className="text-2xl font-black text-baznas-green-900 font-poppins mt-2">
                {formatRupiah(finalNominal)}
              </p>

              <div className="mt-4 pt-3 border-t border-emerald-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Muzakki:</span>
                  <span className="font-semibold text-slate-800">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.namaLengkap
                      : manualNama || "(Ketik Nama)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NPWZ:</span>
                  <span className="font-mono text-emerald-800 font-semibold">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.npwz || "Belum ada"
                      : manualNpwz || "Insidental"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Desil:</span>
                  <span className="font-semibold text-slate-700">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.desil || "Non-Desil"
                      : manualDesil}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode:</span>
                  <span className="font-semibold capitalize text-slate-800">{metode}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-2">
              <h4 className="font-bold text-slate-800 font-poppins">Layanan Cepat Loket</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Setiap pembayaran yang tersimpan akan langsung terdata pada buku kas penerimaan harian dan bukti kwitansi resmi siap dicetak dengan kop BAZNAS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. LAPORAN PENERIMAAN (FILTER DESIL, NPWZ, EXPORT EXCEL & CETAK) */}
      {activeTab === "laporan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins">
                Buku Kas Penerimaan ZIS &amp; DSKL
              </h3>
              <p className="text-xs text-slate-500">
                Daftar mutasi penerimaan kas loket dan rekening bank BAZNAS
              </p>
            </div>

            <button
              onClick={handleExportSetoran}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Download className="h-4 w-4" />
              Export Laporan ke Excel ({filteredSetoran.length})
            </button>
          </div>

          {/* Filter Bar Laporan */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchLaporanQuery}
                onChange={(e) => setSearchLaporanQuery(e.target.value)}
                placeholder="Cari No. Bukti, Nama, NPWZ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
              />
            </div>

            <select
              value={filterLaporanDesil}
              onChange={(e) => setFilterLaporanDesil(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
            >
              <option value="all">Semua Desil</option>
              <option value="Desil 1">Desil 1</option>
              <option value="Desil 2">Desil 2</option>
              <option value="Desil 3">Desil 3</option>
              <option value="Desil 4">Desil 4</option>
              <option value="Non-Desil">Non-Desil</option>
            </select>

            <select
              value={filterLaporanJenis}
              onChange={(e) => setFilterLaporanJenis(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Jenis ZIS</option>
              <option value="zakat_profesi">Zakat Profesi</option>
              <option value="zakat_fitrah">Zakat Fitrah</option>
              <option value="zakat_maal">Zakat Maal</option>
              <option value="infaq_terikat">Infak Terikat</option>
              <option value="infaq_umum">Infak Umum</option>
              <option value="sedekah">Sedekah</option>
              <option value="dskl_qurban">DSKL Qurban</option>
              <option value="dskl_fidyah">DSKL Fidyah</option>
            </select>

            <select
              value={filterLaporanMetode}
              onChange={(e) => setFilterLaporanMetode(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai di Loket</option>
              <option value="transfer">Transfer Bank</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Kwitansi</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Nama &amp; NPWZ</th>
                  <th className="px-4 py-3">Tingkat Desil</th>
                  <th className="px-4 py-3">Jenis &amp; Keterangan</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSetoran.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-baznas-green-800">{s.buktiNo}</td>
                    <td className="px-4 py-3 text-slate-500">{s.tanggal}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{s.namaMuzakki}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.npwz || s.nik}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                        {s.desil || "Non-Desil"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{s.jenisLabel}</span>
                      <span className="text-[10px] text-slate-400">{s.keterangan}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">
                      {s.metode} {s.bank ? `(${s.bank})` : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatRupiah(s.nominal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewKwitansi(s)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Cetak
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSetoran.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PENGATURAN BIDANG 1 */}
      {activeTab === "pengaturan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 font-poppins">
            Pengaturan Standar Nisab &amp; Rekening Pengumpulan
          </h3>

          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <span className="font-bold text-slate-800 block text-sm">Standar Zakat Fitrah 1448 H</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Beras Standar per Jiwa</label>
                  <input type="text" defaultValue="2,5 Kg / 3,5 Liter" disabled className="w-full bg-slate-50 border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Konversi Uang (Rp)</label>
                  <input type="text" defaultValue="Rp 45.000 / Jiwa" className="w-full bg-white border p-2 rounded-lg font-bold" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <span className="font-bold text-slate-800 block text-sm">Nisab Zakat Profesi &amp; Maal</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Setara Emas Murni</label>
                  <input type="text" defaultValue="85 Gram Emas" disabled className="w-full bg-slate-50 border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Nisab per Bulan (Rp)</label>
                  <input type="text" defaultValue="Rp 6.875.000 / Bulan" className="w-full bg-white border p-2 rounded-lg font-bold" />
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Pengaturan parameter Nisab Bidang I berhasil disimpan!")}
              className="rounded-xl bg-baznas-green-800 text-white px-5 py-2 font-bold hover:bg-baznas-green-700"
            >
              Simpan Perubahan Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MUZAKKI BARU */}
      {isAddMuzakkiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-baznas-green-900 to-baznas-green-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    Tambah Muzakki Baru
                  </h3>
                  <p className="text-xs text-emerald-100/80">
                    Input data master muzakki perorangan maupun perwakilan instansi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMuzakkiModalOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewMuzakki} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Tipe Muzakki
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMuzakkiTipe("individu")}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      newMuzakkiTipe === "individu"
                        ? "bg-baznas-green-800 text-white border-baznas-green-800 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Individu (Perorangan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMuzakkiTipe("opd")}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      newMuzakkiTipe === "opd"
                        ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    OPD (Instansi / Dinas)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {newMuzakkiTipe === "opd" ? "Nama Resmi Instansi / OPD *" : "Nama Lengkap Muzakki *"}
                </label>
                <input
                  type="text"
                  required
                  value={newMuzakkiNama}
                  onChange={(e) => setNewMuzakkiNama(e.target.value)}
                  placeholder={newMuzakkiTipe === "opd" ? "Contoh: Dinas Kesehatan Prov. Sulut" : "Contoh: dr. Hi. Fatimah Al-Idrus, Sp.A"}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={newMuzakkiNik}
                    onChange={(e) => setNewMuzakkiNik(e.target.value)}
                    placeholder="7171010101850001"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-baznas-green-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NPWZ Resmi</label>
                  <input
                    type="text"
                    value={newMuzakkiNpwz}
                    onChange={(e) => setNewMuzakkiNpwz(e.target.value)}
                    placeholder="NPWZ-7171-XXXX"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-baznas-green-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Desil</label>
                  <select
                    value={newMuzakkiDesil}
                    onChange={(e) => setNewMuzakkiDesil(e.target.value as DesilType)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="Non-Desil">Non-Desil (Mampu / Reguler)</option>
                    <option value="Desil 4">Desil 4 (Rentan)</option>
                    <option value="Desil 3">Desil 3 (Hampir Miskin)</option>
                    <option value="Desil 2">Desil 2 (Miskin)</option>
                    <option value="Desil 1">Desil 1 (Ekstrem)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Instansi / OPD</label>
                  <select
                    value={newMuzakkiInstansiId}
                    onChange={(e) => setNewMuzakkiInstansiId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {instansiList.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={newMuzakkiHp}
                    onChange={(e) => setNewMuzakkiHp(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    value={newMuzakkiAlamat}
                    onChange={(e) => setNewMuzakkiAlamat(e.target.value)}
                    placeholder="Kecamatan / Kelurahan"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMuzakkiModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan Muzakki
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL / CSV MUZAKKI */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Muzakki dari Excel / CSV"
        onDownloadTemplate={downloadTemplateMuzakki}
        onImportData={handleImportParsedMuzakki}
        sampleHeaders={["Nama Lengkap", "NIK", "NPWZ", "No WhatsApp", "Alamat", "Instansi", "Tingkat Desil"]}
      />
    </div>
  );
};
