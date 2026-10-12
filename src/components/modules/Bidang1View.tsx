"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Muzakki, SetoranZIS, Instansi, Bidang1Tab, DesilType, UserSession } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { DESIL_OPTIONS, desilBadgeClass, getUserType } from "@/lib/desil";
import type { UserType } from "@/lib/types";
import { exportToExcel, downloadTemplateMuzakki } from "@/lib/excel-utils";
import { ImportExcelModal, useToast, Button, ToastContainer, ClassificationBadge } from "@/components/common";
import { canAccessTab } from "@/lib/access";
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
  Plus,
  UserPlus,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";

interface Bidang1ViewProps {
  muzakkiList: Muzakki[];
  setoranList: SetoranZIS[];
  instansiList: Instansi[];
  currentUser: UserSession;
  onAddSetoran: (setoran: SetoranZIS) => void;
  onViewKwitansi: (setoran: SetoranZIS) => void;
  onImportMuzakki: (newMuzakki: Muzakki[]) => void;
  onAddMuzakki?: (newMuzakki: Muzakki) => void;
  activeTab?: Bidang1Tab;
  onTabChange?: (tab: Bidang1Tab) => void;
}

// ════════════════════════════════════════════════════════════════════
// KONSTANTA — diekstrak dari inline code untuk konsistensi & maintainability
// ════════════════════════════════════════════════════════════════════

// Master data: jenis setoran per tab (refactor dari 3 form copy-paste)
const JENIS_BY_TAB: Record<
  "zakat" | "infak" | "dskl",
  { id: SetoranZIS["jenis"]; label: string }[]
> = {
  zakat: [
    { id: "zakat_profesi", label: "Zakat Profesi (2,5%)" },
    { id: "zakat_fitrah", label: "Zakat Fitrah" },
    { id: "zakat_maal", label: "Zakat Maal / Harta" },
  ],
  infak: [
    { id: "infaq_terikat", label: "Infak Terikat Program" },
    { id: "infaq_umum", label: "Infak Umum" },
    { id: "sedekah", label: "Sedekah Harian" },
  ],
  dskl: [
    { id: "dskl_qurban", label: "DSKL — Tabungan Qurban" },
    { id: "dskl_fidyah", label: "DSKL — Fidyah & Kafarat" },
  ],
};

// Class untuk badge Desil (paper + gold accent, NO pastel chaos)
// Di-import dari @/lib/desil (single source of truth)

// Class untuk badge tipe muzakki (sharp, NO purple/blue pastel)
const tipeMuzakkiBadgeClass = (tipe: string | undefined): string => {
  return "bg-white border border-baznas-ink-12 text-baznas-ink uppercase tracking-wider";
};

// Class untuk status badge (NO emerald-100)
const statusBadgeClass = "bg-baznas-paper border border-baznas-ink-12 text-baznas-ink";

// ════════════════════════════════════════════════════════════════════

export const Bidang1View: React.FC<Bidang1ViewProps> = ({
  muzakkiList,
  setoranList,
  instansiList,
  currentUser,
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
    if (!canAccessTab(currentUser, "bidang1", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddMuzakkiModalOpen, setIsAddMuzakkiModalOpen] = useState(false);

  const { success: toastSuccess, error: toastError, info: toastInfo, toasts, dismiss } = useToast();

  // Form State
  const [muzakkiInputMode, setMuzakkiInputMode] = useState<"database" | "manual">("database");
  const [selectedMuzakkiId, setSelectedMuzakkiId] = useState(muzakkiList[0]?.id || "");
  const [searchMuzakkiFormQuery, setSearchMuzakkiFormQuery] = useState("");
  const [filterDesilForm, setFilterDesilForm] = useState<string>("all");

  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "bidang1", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  // Form State Manual
  const [manualNama, setManualNama] = useState("");
  const [manualNik, setManualNik] = useState("");
  const [manualNpwz, setManualNpwz] = useState("");
  const [manualHp, setManualHp] = useState("");
  const [manualInstansi, setManualInstansi] = useState("Masyarakat Umum");
  const [manualAlamat, setManualAlamat] = useState("");
  const [manualDesil, setManualDesil] = useState<DesilType>("Desil 7");
  const [simpanKeDatabase, setSimpanKeDatabase] = useState(true);

  // Kategori & Nilai
  const [kategoriUtama, setKategoriUtama] = useState<SetoranZIS["kategoriUtama"]>("zakat");
  const [jenisZis, setJenisZis] = useState<SetoranZIS["jenis"]>("zakat_profesi");
  const [gajiInput, setGajiInput] = useState<number>(10000000);
  const [nominalManual, setNominalManual] = useState<number>(250000);
  const [metode, setMetode] = useState<"tunai" | "transfer">("tunai");
  const [bank, setBank] = useState<string>("Bank Sulutgo");
  const [keterangan, setKeterangan] = useState<string>("Zakat Penghasilan Bulan Berjalan");

  // Wizard stepper
  const computedStep: 1 | 2 | 3 | 4 = (() => {
    if (!selectedMuzakkiId && muzakkiInputMode === "database") return 1;
    if (activeTab === "zakat" && jenisZis === "zakat_profesi" && gajiInput === 0 && nominalManual === 0) return 2;
    if (activeTab !== "zakat" && nominalManual === 0) return 2;
    if (metode === "transfer" && !bank) return 3;
    return 4;
  })();

  // Filter
  const [searchMuzakkiQuery, setSearchMuzakkiQuery] = useState("");
  const [selectedInstansiFilter, setSelectedInstansiFilter] = useState("all");
  const [filterMuzakkiDesil, setFilterMuzakkiDesil] = useState<string>("all");
  const [filterMuzakkiNpwz, setFilterMuzakkiNpwz] = useState<string>("all");
  const [filterMuzakkiTipe, setFilterMuzakkiTipe] = useState<"all" | "individu" | "opd">("all");

  const [searchLaporanQuery, setSearchLaporanQuery] = useState("");
  const [filterLaporanDesil, setFilterLaporanDesil] = useState<string>("all");
  const [filterLaporanJenis, setFilterLaporanJenis] = useState<string>("all");
  const [filterLaporanMetode, setFilterLaporanMetode] = useState<string>("all");

  // State Modal Tambah
  const [newMuzakkiTipe, setNewMuzakkiTipe] = useState<"individu" | "opd">("individu");
  const [newMuzakkiNama, setNewMuzakkiNama] = useState("");
  const [newMuzakkiNik, setNewMuzakkiNik] = useState("");
  const [newMuzakkiNpwz, setNewMuzakkiNpwz] = useState(`NPWZ-7171-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newMuzakkiHp, setNewMuzakkiHp] = useState("");
  const [newMuzakkiAlamat, setNewMuzakkiAlamat] = useState("");
  const [newMuzakkiInstansiId, setNewMuzakkiInstansiId] = useState(instansiList[0]?.id || "inst-1");
  const [newMuzakkiDesil, setNewMuzakkiDesil] = useState<DesilType>("Desil 7");
  const [filterMuzakkiKlasifikasi, setFilterMuzakkiKlasifikasi] = useState<"all" | UserType>("all");

  const calculatedZakat = Math.round(gajiInput * 0.025);
  const finalNominal =
    kategoriUtama === "zakat" && jenisZis === "zakat_profesi"
      ? calculatedZakat
      : nominalManual;

  const currentMuzakki = muzakkiList.find((m) => m.id === selectedMuzakkiId) || muzakkiList[0];

  // Filter
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
      const matchKlasifikasi =
        filterMuzakkiKlasifikasi === "all" ||
        getUserType(m.desil) === filterMuzakkiKlasifikasi;
      return matchSearch && matchInstansi && matchDesil && matchNpwz && matchTipe && matchKlasifikasi;
    });
  }, [muzakkiList, searchMuzakkiQuery, selectedInstansiFilter, filterMuzakkiDesil, filterMuzakkiNpwz, filterMuzakkiTipe, filterMuzakkiKlasifikasi]);

  const activeFilterCount = [
    searchMuzakkiQuery,
    filterMuzakkiDesil !== "all" ? filterMuzakkiDesil : "",
    filterMuzakkiNpwz !== "all" ? filterMuzakkiNpwz : "",
    filterMuzakkiTipe !== "all" ? filterMuzakkiTipe : "",
    selectedInstansiFilter !== "all" ? selectedInstansiFilter : "",
    filterMuzakkiKlasifikasi !== "all" ? filterMuzakkiKlasifikasi : "",
  ].filter(Boolean).length;

  const handleResetMuzakkiFilters = () => {
    setSearchMuzakkiQuery("");
    setFilterMuzakkiDesil("all");
    setFilterMuzakkiNpwz("all");
    setFilterMuzakkiTipe("all");
    setSelectedInstansiFilter("all");
    setFilterMuzakkiKlasifikasi("all");
    toastInfo("Filter direset", "Semua filter data Muzakki telah dikembalikan ke default.");
  };

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

  const handleCreateNewMuzakki = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuzakkiNama.trim()) {
      toastError("Nama wajib diisi", "Nama lengkap muzakki belum diisi. Silakan lengkapi terlebih dahulu.");
      return;
    }

    const selectedIns = instansiList.find((i) => i.id === newMuzakkiInstansiId);
    const newM: Muzakki = {
      id: `muz-${Date.now()}`,
      namaLengkap: newMuzakkiNama,
      nik: newMuzakkiNik || `717100000000000${Math.floor(10 + Math.random() * 90)}`,
      npwz: newMuzakkiNpwz || `NPWZ-7171-${Math.floor(1000 + Math.random() * 9000)}`,
      noHp: newMuzakkiHp || "081200000000",
      alamat: newMuzakkiAlamat || "Kota Gorontalo",
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

  const handleExportMuzakki = () => {
    const headers = [
      "No", "Nomor Pokok Wajib Zakat (NPWZ)", "NIK / No Identitas",
      "Nama Lengkap Muzakki / OPD", "Tipe Muzakki", "Tingkat Desil",
      "Instansi / Unit Kerja", "Nomor WhatsApp / HP",
      "Alamat Domisili / Kantor", "Total Zakat Disetor (Rp)", "Status",
    ];
    const rows = filteredMuzakki.map((m, idx) => [
      idx + 1, m.npwz || "-", m.nik, m.namaLengkap,
      m.tipeMuzakki === "opd" ? "OPD / INSTANSI" : "INDIVIDU",
      m.desil || "Desil 7", m.namaInstansi, m.noHp, m.alamat, m.totalSetoran,
      m.status.toUpperCase(),
    ]);
    exportToExcel("Data_Muzakki_BAZNAS_Resmi", headers, rows);
  };

  const handleExportSetoran = () => {
    const headers = [
      "No Bukti", "Tanggal", "Nama Muzakki", "NIK", "NPWZ", "Tingkat Desil",
      "Instansi", "Jenis Penerimaan", "Metode", "Bank",
      "Nominal (Rp)", "Keterangan", "Petugas Amil",
    ];
    const rows = filteredSetoran.map((s) => [
      s.buktiNo, s.tanggal, s.namaMuzakki, s.nik, s.npwz || "-",
      s.desil || "Desil 7", s.instansi, s.jenisLabel, s.metode,
      s.bank || "-", s.nominal, s.keterangan || "-", s.petugasAmil,
    ]);
    exportToExcel("Laporan_Penerimaan_ZIS_BAZNAS", headers, rows);
  };

  const handleImportParsedMuzakki = (rows: string[][]) => {
    const imported: Muzakki[] = rows.map((r, idx) => ({
      id: `muz-imp-${Date.now()}-${idx}`,
      namaLengkap: r[0] || "Muzakki Baru",
      nik: r[1] || `717100000000000${idx}`,
      npwz: r[2] || `NPWZ-7171-${Date.now()}-${idx}`,
      noHp: r[3] || "081200000000",
      alamat: r[4] || "Kota Gorontalo",
      instansiId: "inst-1",
      namaInstansi: r[5] || "Instansi Umum",
      desil: (r[6] as DesilType) || "Desil 7",
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
    let targetDesil: DesilType = "Desil 7";

    if (muzakkiInputMode === "database") {
      if (!currentMuzakki) {
        toastError("Pilih Muzakki", "Silakan pilih Muzakki dari daftar database terlebih dahulu, atau gunakan mode Ketik Manual.");
        return;
      }
      targetMuzakkiId = currentMuzakki.id;
      targetNama = currentMuzakki.namaLengkap;
      targetNik = currentMuzakki.nik;
      targetNpwz = currentMuzakki.npwz || "";
      targetInstansi = currentMuzakki.namaInstansi;
      targetDesil = currentMuzakki.desil || "Desil 7";
    } else {
      if (!manualNama.trim()) {
        toastError("Nama wajib diisi", "Mode Ketik Manual: nama lengkap Muzakki belum diisi.");
        return;
      }
      targetMuzakkiId = `muz-manual-${Date.now()}`;
      targetNama = manualNama.trim();
      targetNik = manualNik.trim() || `7171${Date.now().toString().slice(-12)}`;
      targetNpwz = manualNpwz.trim() || `NPWZ-INS-${Math.floor(1000 + Math.random() * 9000)}`;
      targetInstansi = manualInstansi.trim() || "Masyarakat Umum";
      targetDesil = manualDesil;

      if (simpanKeDatabase) {
        const newMuz: Muzakki = {
          id: targetMuzakkiId,
          namaLengkap: targetNama,
          nik: targetNik,
          npwz: targetNpwz,
          noHp: manualHp || "-",
          alamat: manualAlamat || "Kota Gorontalo",
          instansiId: "inst-1",
          namaInstansi: targetInstansi,
          status: "aktif",
          totalSetoran: finalNominal,
          desil: targetDesil,
        };
        if (onAddMuzakki) onAddMuzakki(newMuz);
        else muzakkiList.unshift(newMuz);
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

  // Current active tab key untuk JENIS_BY_TAB lookup
  const currentTabKey: "zakat" | "infak" | "dskl" | null =
    activeTab === "zakat" || activeTab === "infak" || activeTab === "dskl"
      ? activeTab
      : null;

  return (
    <div className="space-y-6">
      {/* Header Modul — editorial style, no gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-ink">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-baznas-ink font-poppins">
                Bidang I — Pengumpulan ZIS &amp; DSKL
              </h1>
              <span className="bg-baznas-paper border border-baznas-ink-8 px-2.5 py-0.5 text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                Unit Pengumpulan
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-1">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Husain Dima</span> (Waka 1) — Staf: Minarti Alhabsyi (Pengumpulan) &amp; Azmi K. Jassin (Pelaporan &amp; Perencanaan)
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD RINGKASAN */}
      {canAccessTab(currentUser, "bidang1", "dashboard") && activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-[11px] font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Total ZIS Terhimpun
              </span>
              <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-2">
                {formatRupiah(totalZIS)}
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">{setoranList.length} transaksi setoran kas</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-[11px] font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Muzakki Terdaftar
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {muzakkiList.length}
                <span className="text-sm font-normal text-baznas-ink/55 ml-1">Muzakki</span>
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">Lengkap NIK, NPWZ &amp; Desil</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-[11px] font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Instansi / OPD Aktif
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {instansiList.length}
                <span className="text-sm font-normal text-baznas-ink/55 ml-1">Unit UPZ</span>
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">Payroll Zakat ASN Terhubung</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-[11px] font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Nisab Emas 2026
              </span>
              <p className="text-2xl font-bold text-baznas-gold-display font-poppins mt-2">
                Rp 82.500.000
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">Setara 85 gr Emas / Tahun</p>
            </div>
          </div>

          {/* Quick Actions — consistent border-l-4 gold pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tab: "zakat" as const, icon: Coins, title: "Catat Zakat Profesi (2,5%)",
                desc: "Pilih atau ketik muzakki langsung, hitung zakat otomatis & cetak bukti.",
                accentColor: "text-baznas-green-900",
              },
              {
                tab: "infak" as const, icon: Heart, title: "Catat Infak / Sedekah",
                desc: "Penerimaan infak terikat program atau sedekah umum harian.",
                accentColor: "text-amber-700",
              },
              {
                tab: "dskl" as const, icon: Gift, title: "Catat DSKL &amp; Qurban",
                desc: "Dana sosial keagamaan lainnya, fidyah, kafarat & tabungan qurban.",
                accentColor: "text-baznas-ink",
              },
            ].map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(qa.tab);
                    const firstJenis = JENIS_BY_TAB[qa.tab][0].id;
                    setJenisZis(firstJenis);
                  }}
                  className="group text-left bg-white border border-baznas-ink-8 border-l-4 border-l-baznas-gold-display p-5 hover:border-l-baznas-green-800 transition-colors min-h-t-target-lg"
                >
                  <Icon className={`h-5 w-5 ${qa.accentColor} mb-3`} aria-hidden="true" />
                  <h3 className="text-sm font-bold text-baznas-ink font-poppins">{qa.title}</h3>
                  <p className="text-xs text-baznas-ink/55 mt-1.5 leading-relaxed">{qa.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DATA MUZAKKI */}
      {canAccessTab(currentUser, "bidang1", "muzakki") && activeTab === "muzakki" && (
        <div className="border border-baznas-ink-8 bg-white p-7 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-baznas-ink font-poppins">
                Data Muzakki Terdaftar
              </h3>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Filter multi-kriteria: Nama, NIK (16 digit), NPWZ resmi, Tingkat Desil, Klasifikasi, dan Unit Instansi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddMuzakkiModalOpen(true)}
                className="inline-flex items-center gap-1.5 border border-baznas-ink bg-baznas-green-900 hover:bg-baznas-green-800 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
              >
                <Plus className="h-4 w-4" />
                Tambah Muzakki
              </button>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 border border-baznas-ink-20 bg-white hover:bg-baznas-paper/40 px-4 py-2.5 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
              >
                <Upload className="h-3.5 w-3.5 text-baznas-green-800" />
                Import Excel
              </button>

              <button
                type="button"
                onClick={handleExportMuzakki}
                className="inline-flex items-center gap-1.5 border border-baznas-ink-20 bg-white hover:bg-baznas-paper/40 px-4 py-2.5 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
              >
                <Download className="h-3.5 w-3.5 text-baznas-green-800" />
                Export ({filteredMuzakki.length})
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
              <input
                type="text"
                value={searchMuzakkiQuery}
                onChange={(e) => setSearchMuzakkiQuery(e.target.value)}
                placeholder="Cari NIK, NPWZ, atau Nama..."
                className="w-full border border-baznas-ink-20 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 focus:bg-white min-h-t-target"
              />
            </div>

            <select
              value={filterMuzakkiKlasifikasi}
              onChange={(e) => setFilterMuzakkiKlasifikasi(e.target.value as "all" | UserType)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
            >
              <option value="all">Semua Klasifikasi</option>
              <option value="muzakki">Muzakki (Desil 6–10)</option>
              <option value="mustahik">Mustahik (Desil 1–5)</option>
            </select>

            <select
              value={filterMuzakkiTipe}
              onChange={(e) => setFilterMuzakkiTipe(e.target.value as "all" | "individu" | "opd")}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
            >
              <option value="all">Semua Tipe (Individu &amp; OPD)</option>
              <option value="individu">Muzakki Individu</option>
              <option value="opd">Muzakki OPD (Instansi / Dinas)</option>
            </select>

            <select
              value={filterMuzakkiDesil}
              onChange={(e) => setFilterMuzakkiDesil(e.target.value)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
            >
              <option value="all">Semua Tingkat Desil</option>
              {DESIL_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            <select
              value={filterMuzakkiNpwz}
              onChange={(e) => setFilterMuzakkiNpwz(e.target.value)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="all">Semua Status NPWZ</option>
              <option value="ber_npwz">Memiliki NPWZ Resmi</option>
              <option value="tanpa_npwz">Belum Ada NPWZ</option>
            </select>

            <select
              value={selectedInstansiFilter}
              onChange={(e) => setSelectedInstansiFilter(e.target.value)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="all">Semua Instansi / OPD</option>
              {instansiList.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.nama}</option>
              ))}
            </select>
          </div>

          {/* Reset filter bar */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-bold text-baznas-green-900 bg-baznas-paper border border-baznas-gold-display px-2 py-0.5 uppercase tracking-wider">
                {activeFilterCount} filter aktif
              </span>
              <button
                type="button"
                onClick={handleResetMuzakkiFilters}
                className="inline-flex items-center gap-1.5 border border-baznas-ink-20 bg-white hover:bg-baznas-paper/40 px-3 py-1.5 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filter
              </button>
            </div>
          )}

          {/* Tabel Data Muzakki */}
          <div className="overflow-x-auto border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-xs text-left">
              <thead className="bg-baznas-paper text-baznas-ink/70 text-[11px] font-bold uppercase tracking-wider border-b border-baznas-ink-8">
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
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredMuzakki.map((m) => (
                  <tr key={m.id} className="hover:bg-baznas-paper/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-baznas-ink">{m.namaLengkap}</p>
                      <p className="text-[11px] text-baznas-ink/45 mt-0.5">{m.alamat}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tipeMuzakkiBadgeClass(m.tipeMuzakki)}`}
                      >
                        {m.tipeMuzakki === "opd" ? "OPD / Instansi" : "Individu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <p className="text-baznas-ink font-medium">NIK: {m.nik}</p>
                      <span className="inline-block text-[10px] text-baznas-green-900 bg-baznas-paper border border-baznas-ink-12 px-1.5 py-0.5 mt-1 font-bold">
                        {m.npwz || "Belum ada NPWZ"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desilBadgeClass(m.desil)}`}
                        >
                          {m.desil || "Desil 7"}
                        </span>
                        <ClassificationBadge desil={m.desil} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-baznas-ink/80">{m.namaInstansi}</td>
                    <td className="px-4 py-3 font-mono text-baznas-ink/65">{m.noHp}</td>
                    <td className="px-4 py-3 text-right font-bold text-baznas-green-900 editorial-num">
                      {formatRupiah(m.totalSetoran)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass}`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMuzakki.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-baznas-ink/55 text-xs">
                      Tidak ditemukan data muzakki yang sesuai filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INPUT PENERIMAAN */}
      {currentTabKey && canAccessTab(currentUser, "bidang1", currentTabKey) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-baznas-ink-8 bg-white p-6">
            <form onSubmit={handleSimpanSetoran} className="space-y-6">
              {/* Wizard stepper — using BAZNAS palette only */}
              <ol
                aria-label="Langkah-langkah pencatatan setoran"
                className="flex items-center justify-between gap-1 bg-baznas-paper border border-baznas-ink-8 p-3"
              >
                {[
                  { num: 1, label: "Muzakki" },
                  { num: 2, label: activeTab === "zakat" ? "Zakat" : activeTab === "infak" ? "Infak" : "DSKL" },
                  { num: 3, label: "Metode" },
                  { num: 4, label: "Simpan" },
                ].map((s) => {
                  const isActive = computedStep === s.num;
                  const isDone = computedStep > s.num;
                  return (
                    <li key={s.num} className="flex-1 flex items-center gap-2 min-w-0">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-baznas-green-900 text-white"
                            : isDone
                            ? "bg-baznas-green-700 text-white"
                            : "bg-baznas-paper border border-baznas-ink-12 text-baznas-ink/55"
                        }`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {isDone ? "✓" : s.num}
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider truncate ${
                          isActive
                            ? "text-baznas-green-900"
                            : isDone
                            ? "text-baznas-green-700"
                            : "text-baznas-ink/55"
                        }`}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {/* Muzakki input section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-baznas-ink/55 font-poppins">
                    1. Data Muzakki / Penyetor
                  </h3>

                  {/* Toggle Database/Manual — sharp toggle */}
                  <div className="flex border border-baznas-ink-20 bg-baznas-paper/40 text-xs">
                    {(["database", "manual"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setMuzakkiInputMode(mode)}
                        className={`px-3 py-1.5 font-bold transition-colors ${
                          muzakkiInputMode === mode
                            ? "bg-baznas-green-900 text-white"
                            : "text-baznas-ink/65 hover:text-baznas-ink"
                        }`}
                      >
                        {mode === "database" ? "Pilih Database" : "Ketik Manual"}
                      </button>
                    ))}
                  </div>
                </div>

                {muzakkiInputMode === "database" ? (
                  <div className="space-y-4 border border-baznas-ink-8 bg-baznas-paper/30 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-baznas-ink/45" />
                        <input
                          type="text"
                          value={searchMuzakkiFormQuery}
                          onChange={(e) => setSearchMuzakkiFormQuery(e.target.value)}
                          placeholder="Filter Nama / NPWZ / NIK..."
                          className="w-full border border-baznas-ink-20 bg-white pl-8 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>
                      <select
                        value={filterDesilForm}
                        onChange={(e) => setFilterDesilForm(e.target.value)}
                        className="border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                      >
                        <option value="all">Semua Desil</option>
                        {DESIL_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-baznas-ink/65 mb-1.5">
                        Pilih Muzakki ({formFilteredMuzakkiList.length} ditemukan):
                      </label>
                      <select
                        value={selectedMuzakkiId}
                        onChange={(e) => setSelectedMuzakkiId(e.target.value)}
                        className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-medium min-h-t-target"
                      >
                        {formFilteredMuzakkiList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaLengkap} — NPWZ: {m.npwz || "-"} | NIK: {m.nik} ({m.desil || "Desil 7"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentMuzakki && (
                      <div className="border border-baznas-gold-display bg-baznas-paper/40 p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-baznas-ink/45 block text-[10px] uppercase tracking-wider">Instansi</span>
                          <span className="font-bold text-baznas-ink">{currentMuzakki.namaInstansi}</span>
                        </div>
                        <div>
                          <span className="text-baznas-ink/45 block text-[10px] uppercase tracking-wider">No. WhatsApp</span>
                          <span className="font-bold text-baznas-ink">{currentMuzakki.noHp}</span>
                        </div>
                        <div>
                          <span className="text-baznas-ink/45 block text-[10px] uppercase tracking-wider">NPWZ Resmi</span>
                          <span className="font-bold text-baznas-green-900 font-mono">{currentMuzakki.npwz}</span>
                        </div>
                        <div>
                          <span className="text-baznas-ink/45 block text-[10px] uppercase tracking-wider">Tingkat Desil</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-baznas-ink">{currentMuzakki.desil || "Desil 7"}</span>
                            <ClassificationBadge desil={currentMuzakki.desil} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 border border-baznas-gold-display bg-baznas-paper/30 p-4">
                    <p className="text-[11px] text-baznas-ink/70 font-medium border-l-2 border-baznas-gold-display pl-3">
                      Mode Ketik Manual — untuk muzakki insidental, walk-in loket, atau penyetor yang belum terdaftar.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          Nama Lengkap Muzakki / Penyetor *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualNama}
                          onChange={(e) => setManualNama(e.target.value)}
                          placeholder="Contoh: H. Ahmad Subardjo"
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-semibold text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          NPWZ (Opsional)
                        </label>
                        <input
                          type="text"
                          value={manualNpwz}
                          onChange={(e) => setManualNpwz(e.target.value)}
                          placeholder="Contoh: NPWZ-7171-8899"
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          NIK (16 Digit, Opsional)
                        </label>
                        <input
                          type="text"
                          value={manualNik}
                          onChange={(e) => setManualNik(e.target.value)}
                          placeholder="Contoh: 7171090101900001"
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          Tingkat Desil
                        </label>
                        <select
                          value={manualDesil}
                          onChange={(e) => setManualDesil(e.target.value as DesilType)}
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        >
                          {DESIL_OPTIONS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="text"
                          value={manualHp}
                          onChange={(e) => setManualHp(e.target.value)}
                          placeholder="Contoh: 0812-4455-6677"
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          Instansi / Alamat Penyetor
                        </label>
                        <input
                          type="text"
                          value={manualInstansi}
                          onChange={(e) => setManualInstansi(e.target.value)}
                          placeholder="Contoh: Dinas Kesehatan / Gorontalo"
                          className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="checkSimpanDb"
                        checked={simpanKeDatabase}
                        onChange={(e) => setSimpanKeDatabase(e.target.checked)}
                        className="h-4 w-4 text-baznas-green-800 focus:ring-baznas-green-800 border-baznas-ink-20"
                      />
                      <span className="text-xs text-baznas-ink/80">
                        Simpan otomatis muzakki ini ke database master Muzakki BAZNAS
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Jenis setoran — config-driven, single source of truth */}
              {currentTabKey && (
                <div className="pt-4 border-t border-baznas-ink-8">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-baznas-ink/55 font-poppins mb-4">
                    2. Jenis Penerimaan {currentTabKey.toUpperCase()}
                  </h3>

                  <div className="space-y-4">
                    <div className={`grid gap-2 ${currentTabKey === "dskl" ? "grid-cols-2" : "grid-cols-3"}`}>
                      {JENIS_BY_TAB[currentTabKey].map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setJenisZis(j.id)}
                          className={`border p-3 text-center text-xs font-bold uppercase tracking-wider transition-colors min-h-t-target ${
                            jenisZis === j.id
                              ? "border-baznas-gold-display bg-baznas-paper text-baznas-green-900"
                              : "border-baznas-ink-20 bg-white text-baznas-ink/65 hover:border-baznas-ink-40"
                          }`}
                        >
                          {j.label}
                        </button>
                      ))}
                    </div>

                    {currentTabKey === "zakat" && jenisZis === "zakat_profesi" ? (
                      <div className="border border-baznas-gold-display bg-baznas-paper/30 p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-baznas-ink uppercase tracking-wider">
                          <Calculator className="h-4 w-4 text-baznas-gold-display" />
                          <span>Kalkulator Zakat Profesi Otomatis (2,5%)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-baznas-ink/70 mb-1.5">
                              Gaji Bulanan (Rp)
                            </label>
                            <input
                              type="number"
                              value={gajiInput}
                              onChange={(e) => setGajiInput(Number(e.target.value))}
                              step="500000"
                              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-bold text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-baznas-ink/70 mb-1.5">
                              Zakat Wajib (2,5%)
                            </label>
                            <div className="border border-baznas-gold-display bg-white px-3 py-2.5 text-sm font-extrabold text-baznas-green-900 editorial-num">
                              {formatRupiah(calculatedZakat)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                          Nominal {currentTabKey === "zakat" ? "Zakat" : currentTabKey === "infak" ? "Infak / Sedekah" : "DSKL"} (Rp)
                        </label>
                        <input
                          type="number"
                          value={nominalManual}
                          onChange={(e) => setNominalManual(Number(e.target.value))}
                          step={currentTabKey === "dskl" ? "100000" : "50000"}
                          className="w-full border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs font-bold text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metode & Keterangan */}
              <div className="pt-4 border-t border-baznas-ink-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Metode Penerimaan</label>
                    <div className="flex gap-2">
                      {(["tunai", "transfer"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMetode(m)}
                          className={`flex-1 border p-2.5 text-xs font-bold uppercase tracking-wider transition-colors min-h-t-target ${
                            metode === m
                              ? "border-baznas-gold-display bg-baznas-paper text-baznas-green-900"
                              : "border-baznas-ink-20 bg-white text-baznas-ink/65 hover:border-baznas-ink-40"
                          }`}
                        >
                          {m === "tunai" ? "Tunai di Loket" : "Transfer Bank"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {metode === "transfer" && (
                    <div>
                      <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Bank Penerima BAZNAS</label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-medium min-h-t-target"
                      >
                        <option value="Bank Sulutgo">Bank Sulutgo — 001.02.11.000123.0</option>
                        <option value="Bank Muamalat">Bank Muamalat — 801.000.456.7</option>
                        <option value="Bank BTN Syariah">Bank BTN Syariah — 702.100.999.1</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Keterangan / Niat Muzakki</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Pembayaran Zakat Profesi ASN Bulan Berjalan"
                    className="w-full border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-baznas-ink-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-baznas-ink/55 leading-relaxed flex-1">
                  Periksa kembali data setoran. Setelah disimpan, bukti kwitansi
                  resmi akan otomatis terbuka untuk dicetak.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 min-h-t-target-lg border border-baznas-ink bg-baznas-ink hover:bg-baznas-ink/90 px-6 py-3 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
                >
                  <Printer className="h-4 w-4" />
                  Simpan &amp; Cetak Kwitansi
                </button>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Pratinjau Kwitansi — no gradient, BAZNAS palette */}
          <div className="space-y-4">
            <div className="border border-baznas-gold-display bg-baznas-paper/30 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-gold-display">
                Nilai Siap Diterbitkan
              </span>
              <p className="text-2xl font-extrabold text-baznas-green-900 font-poppins mt-2 editorial-num">
                {formatRupiah(finalNominal)}
              </p>

              <div className="mt-4 pt-3 border-t border-baznas-ink-8 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-baznas-ink/55">Muzakki:</span>
                  <span className="font-bold text-baznas-ink text-right">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.namaLengkap
                      : manualNama || "(Ketik Nama)"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-baznas-ink/55">NPWZ:</span>
                  <span className="font-mono text-baznas-green-900 font-bold text-right">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.npwz || "Belum ada"
                      : manualNpwz || "Insidental"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-baznas-ink/55">Desil:</span>
                  <span className="font-bold text-baznas-ink/80 text-right flex items-center gap-1.5 justify-end">
                    {muzakkiInputMode === "database"
                      ? currentMuzakki?.desil || "Desil 7"
                      : manualDesil}
                    <ClassificationBadge
                      desil={
                        muzakkiInputMode === "database"
                          ? currentMuzakki?.desil
                          : manualDesil
                      }
                    />
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-baznas-ink/55">Metode:</span>
                  <span className="font-bold text-baznas-ink text-right uppercase tracking-wider">
                    {metode}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5 text-xs space-y-2">
              <h4 className="font-bold text-baznas-ink font-poppins text-sm">Layanan Cepat Loket</h4>
              <p className="text-baznas-ink/60 leading-relaxed text-[11px]">
                Setiap pembayaran yang tersimpan akan langsung terdata pada buku kas penerimaan harian dan bukti kwitansi resmi siap dicetak dengan kop BAZNAS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. LAPORAN PENERIMAAN */}
      {canAccessTab(currentUser, "bidang1", "laporan") && activeTab === "laporan" && (
        <div className="border border-baznas-ink-8 bg-white p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-baznas-ink font-poppins">
                Buku Kas Penerimaan ZIS &amp; DSKL
              </h3>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Daftar mutasi penerimaan kas loket dan rekening bank BAZNAS
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportSetoran}
              className="inline-flex items-center gap-1.5 border border-baznas-ink bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              <Download className="h-4 w-4" />
              Export Laporan ({filteredSetoran.length})
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
              <input
                type="text"
                value={searchLaporanQuery}
                onChange={(e) => setSearchLaporanQuery(e.target.value)}
                placeholder="Cari No. Bukti, Nama, NPWZ..."
                className="w-full border border-baznas-ink-20 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>

            <select
              value={filterLaporanDesil}
              onChange={(e) => setFilterLaporanDesil(e.target.value)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
            >
              <option value="all">Semua Desil</option>
              {DESIL_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            <select
              value={filterLaporanJenis}
              onChange={(e) => setFilterLaporanJenis(e.target.value)}
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
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
              className="border border-baznas-ink-20 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai di Loket</option>
              <option value="transfer">Transfer Bank</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-xs text-left">
              <thead className="bg-baznas-paper text-baznas-ink/70 text-[11px] font-bold uppercase tracking-wider border-b border-baznas-ink-8">
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
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredSetoran.map((s) => (
                  <tr key={s.id} className="hover:bg-baznas-paper/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-baznas-green-900">{s.buktiNo}</td>
                    <td className="px-4 py-3 text-baznas-ink/55">{s.tanggal}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-baznas-ink">{s.namaMuzakki}</p>
                      <p className="text-[10px] text-baznas-ink/45 font-mono">{s.npwz || s.nik}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desilBadgeClass(s.desil)}`}
                        >
                          {s.desil || "Desil 7"}
                        </span>
                        <ClassificationBadge desil={s.desil} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-baznas-ink block">{s.jenisLabel}</span>
                      <span className="text-[10px] text-baznas-ink/55">{s.keterangan}</span>
                    </td>
                    <td className="px-4 py-3 uppercase tracking-wider text-baznas-ink/65 text-[11px]">
                      {s.metode} {s.bank ? `· ${s.bank}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-baznas-ink editorial-num">
                      {formatRupiah(s.nominal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onViewKwitansi(s)}
                        className="inline-flex items-center gap-1 border border-baznas-gold-display bg-baznas-paper text-baznas-green-900 hover:bg-baznas-ink hover:text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors min-h-t-target"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Cetak
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSetoran.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-baznas-ink/55 text-xs">
                      Tidak ada transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PENGATURAN */}
      {canAccessTab(currentUser, "bidang1", "pengaturan") && activeTab === "pengaturan" && (
        <div className="border border-baznas-ink-8 bg-white p-7 space-y-6 max-w-2xl">
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Pengaturan Standar Nisab &amp; Rekening Pengumpulan
          </h3>

          <div className="space-y-4 text-xs">
            <div className="border border-baznas-ink-8 p-5 space-y-4">
              <span className="font-bold text-baznas-ink block text-sm">Standar Zakat Fitrah 1448 H</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-baznas-ink/55 mb-1.5">Beras Standar per Jiwa</label>
                  <input type="text" defaultValue="2,5 Kg / 3,5 Liter" disabled className="w-full bg-baznas-paper/40 border border-baznas-ink-20 p-2.5 text-baznas-ink" />
                </div>
                <div>
                  <label className="block text-baznas-ink/55 mb-1.5">Konversi Uang (Rp)</label>
                  <input type="text" defaultValue="Rp 45.000 / Jiwa" className="w-full bg-white border border-baznas-ink-20 p-2.5 text-baznas-ink font-bold" />
                </div>
              </div>
            </div>

            <div className="border border-baznas-ink-8 p-5 space-y-4">
              <span className="font-bold text-baznas-ink block text-sm">Nisab Zakat Profesi &amp; Maal</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-baznas-ink/55 mb-1.5">Setara Emas Murni</label>
                  <input type="text" defaultValue="85 Gram Emas" disabled className="w-full bg-baznas-paper/40 border border-baznas-ink-20 p-2.5 text-baznas-ink" />
                </div>
                <div>
                  <label className="block text-baznas-ink/55 mb-1.5">Nisab per Bulan (Rp)</label>
                  <input type="text" defaultValue="Rp 6.875.000 / Bulan" className="w-full bg-white border border-baznas-ink-20 p-2.5 text-baznas-ink font-bold" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toastSuccess("Pengaturan Nisab Tersimpan", "Parameter Nisab untuk Bidang I telah diperbarui.")}
              className="border border-baznas-ink bg-baznas-ink hover:bg-baznas-ink/90 text-white px-5 py-2.5 font-bold transition-colors min-h-t-target"
            >
              Simpan Perubahan Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MUZAKKI — BAZNAS palette, no gradient */}
      {isAddMuzakkiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-baznas-ink-8 shadow-lift max-h-[92vh] flex flex-col">
            {/* Header — paper, NO gradient */}
            <div className="border-b border-baznas-ink-8 bg-baznas-paper px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="border border-baznas-gold-display p-2 text-baznas-green-900">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-baznas-ink">
                    Tambah Muzakki Baru
                  </h3>
                  <p className="text-[11px] text-baznas-ink/60 mt-0.5">
                    Input data master muzakki perorangan maupun perwakilan instansi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMuzakkiModalOpen(false)}
                className="inline-flex items-center justify-center text-baznas-ink/55 hover:text-baznas-ink hover:bg-baznas-ink-8 h-9 w-9 transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMuzakki} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink/80 mb-2 uppercase tracking-wider">
                  Tipe Muzakki
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["individu", "opd"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewMuzakkiTipe(t)}
                      className={`py-2.5 px-3 font-bold uppercase tracking-wider border text-xs transition-colors min-h-t-target ${
                        newMuzakkiTipe === t
                          ? "border-baznas-green-900 bg-baznas-green-900 text-white"
                          : "border-baznas-ink-20 bg-baznas-paper/40 text-baznas-ink/65 hover:border-baznas-ink-40"
                      }`}
                    >
                      {t === "individu" ? "Individu (Perorangan)" : "OPD (Instansi)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                  {newMuzakkiTipe === "opd" ? "Nama Resmi Instansi / OPD *" : "Nama Lengkap Muzakki *"}
                </label>
                <input
                  type="text"
                  required
                  value={newMuzakkiNama}
                  onChange={(e) => setNewMuzakkiNama(e.target.value)}
                  placeholder={newMuzakkiTipe === "opd" ? "Contoh: Dinas Kesehatan Prov. Sulut" : "Contoh: H. Fatimah Al-Idrus, S.T."}
                  className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={newMuzakkiNik}
                    onChange={(e) => setNewMuzakkiNik(e.target.value)}
                    placeholder="7171010101850001"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">NPWZ Resmi</label>
                  <input
                    type="text"
                    value={newMuzakkiNpwz}
                    onChange={(e) => setNewMuzakkiNpwz(e.target.value)}
                    placeholder="NPWZ-7171-XXXX"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Tingkat Desil</label>
                  <select
                    value={newMuzakkiDesil}
                    onChange={(e) => setNewMuzakkiDesil(e.target.value as DesilType)}
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold"
                  >
                    {DESIL_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Unit Instansi / OPD</label>
                  <select
                    value={newMuzakkiInstansiId}
                    onChange={(e) => setNewMuzakkiInstansiId(e.target.value)}
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  >
                    {instansiList.map((ins) => (
                      <option key={ins.id} value={ins.id}>{ins.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={newMuzakkiHp}
                    onChange={(e) => setNewMuzakkiHp(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Alamat Domisili</label>
                  <input
                    type="text"
                    value={newMuzakkiAlamat}
                    onChange={(e) => setNewMuzakkiAlamat(e.target.value)}
                    placeholder="Kecamatan / Kelurahan"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setIsAddMuzakkiModalOpen(false)}
                  className="border border-baznas-ink-20 hover:bg-baznas-paper/40 px-4 py-2.5 text-xs font-bold text-baznas-ink/70 transition-colors min-h-t-target"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="border border-baznas-ink bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
                >
                  Simpan Muzakki
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Muzakki dari Excel"
        onDownloadTemplate={downloadTemplateMuzakki}
        onImportData={handleImportParsedMuzakki}
        sampleHeaders={["Nama Lengkap", "NIK", "NPWZ", "No WhatsApp", "Alamat", "Instansi", "Tingkat Desil"]}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default Bidang1View;
