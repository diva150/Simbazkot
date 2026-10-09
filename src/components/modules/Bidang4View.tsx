"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Surat, Pegawai, AsetKantor, Bidang4Tab, TemplateSurat, UserSession } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel-utils";
import { exportLetterToWord, exportLetterToWordLegacy, WordLetterData } from "@/lib/word-utils";
import { initialTemplatesSurat } from "@/lib/mock-data";
import { useToast, ToastContainer } from "@/components/common";
import { canAccessTab } from "@/lib/access";
import {
  FolderArchive,
  Printer,
  Download,
  Clock,
  CheckCircle,
  FileDown,
  Plus,
  Search,
  Filter,
  FileSignature,
} from "lucide-react";

export interface ArsipDokumenItem {
  id: string;
  bidang: "bidang1" | "bidang2" | "bidang3" | "bidang4";
  bidangLabel: string;
  nomorDokumen: string;
  tanggal: string;
  kategori: string;
  pihakTerkait: string;
  perihal: string;
  status: string;
  statusLabel: string;
  fileFormat: string;
  originalSurat?: Surat;
}

interface Bidang4ViewProps {
  suratList: Surat[];
  pegawaiList: Pegawai[];
  asetList: AsetKantor[];
  templatesSurat?: TemplateSurat[];
  onAddTemplateSurat?: (template: TemplateSurat) => void;
  onViewDisposisi: (surat: Surat) => void;
  currentUser: UserSession;
  activeTab?: Bidang4Tab;
  onTabChange?: (tab: Bidang4Tab) => void;
}

export const Bidang4View: React.FC<Bidang4ViewProps> = ({
  suratList,
  pegawaiList,
  asetList,
  templatesSurat: propTemplates,
  onAddTemplateSurat,
  onViewDisposisi,
  currentUser,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<Bidang4Tab>("dashboard");
  const activeTab = propTab || localTab;
  const { error: toastError, info: toastInfo, toasts, dismiss } = useToast();
  const setActiveTab = (tab: Bidang4Tab) => {
    if (!canAccessTab(currentUser, "bidang4", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "bidang4", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  const [templates, setTemplates] = useState<TemplateSurat[]>(propTemplates || initialTemplatesSurat);

  // State Modal Tambah Template Surat Baru
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [newTplNama, setNewTplNama] = useState("");
  const [newTplKategori, setNewTplKategori] = useState<TemplateSurat["kategori"]>("Tugas");
  const [newTplNomor, setNewTplNomor] = useState("001/BAZNAS-MDO/IX/2026");
  const [newTplPerihal, setNewTplPerihal] = useState("");
  const [newTplTujuan, setNewTplTujuan] = useState("");
  const [newTplPembuka, setNewTplPembuka] = useState("");
  const [newTplUtama, setNewTplUtama] = useState("");
  const [newTplPenutup, setNewTplPenutup] = useState("");
  const [newTplPenandatangan, setNewTplPenandatangan] = useState("Dr. Hi. Marwan, SH., MH.");
  const [newTplJabatan, setNewTplJabatan] = useState("Wakil Ketua 4 – Bidang Administrasi, SDM & Umum");

  // State Modal Word Letter Generator
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState<TemplateSurat | null>(null);
  const [genNomorSurat, setGenNomorSurat] = useState("");
  const [genSifat, setGenSifat] = useState("Penting & Segera");
  const [genLampiran, setGenLampiran] = useState("1 (Satu) Berkas");
  const [genPerihal, setGenPerihal] = useState("");
  const [genTanggal, setGenTanggal] = useState(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  const [genTujuan, setGenTujuan] = useState("");
  const [genLokasiTujuan, setGenLokasiTujuan] = useState("Tempat");
  const [genPembuka, setGenPembuka] = useState("");
  const [genUtama, setGenUtama] = useState("");
  const [genPenutup, setGenPenutup] = useState("");
  const [genPenandatangan, setGenPenandatangan] = useState("");
  const [genJabatanPenandatangan, setGenJabatanPenandatangan] = useState("");

  // State Filter Arsip Terpadu Lintas Bidang (Bidang 1 - 4)
  const [searchArsipQuery, setSearchArsipQuery] = useState("");
  const [filterArsipBidang, setFilterArsipBidang] = useState<"all" | "bidang1" | "bidang2" | "bidang3" | "bidang4">("all");
  const [filterArsipStatus, setFilterArsipStatus] = useState<string>("all");

  const suratMasukList = suratList.filter((s) => s.jenis === "masuk");
  const suratKeluarList = suratList.filter((s) => s.jenis === "keluar");

  // Koleksi Dokumen Terpadu Lintas Bidang (Bidang 1 s.d. 4)
  const multiBidangArsipList: ArsipDokumenItem[] = useMemo<ArsipDokumenItem[]>(() => {
    // 1. Dokumen dari Bidang IV (Korespondensi Surat Masuk & Keluar)
    const b4Docs: ArsipDokumenItem[] = suratList.map((s) => ({
      id: `arsip-${s.id}`,
      bidang: "bidang4" as const,
      bidangLabel: "Bidang IV (Administrasi)",
      nomorDokumen: s.nomorSurat,
      tanggal: s.tanggal,
      kategori: s.jenis === "masuk" ? "Surat Masuk" : "Surat Keluar",
      pihakTerkait: s.pengirimTujuan || (s.jenis === "masuk" ? "Instansi Pengirim" : "Penerima Surat"),
      perihal: s.perihal,
      status: s.statusDisposisi === "sudah_disposisi" ? "sudah_disposisi" : (s.jenis === "masuk" ? "belum_disposisi" : "tersimpan"),
      statusLabel: s.statusDisposisi === "sudah_disposisi" ? "Sudah Didisposisi" : (s.jenis === "masuk" ? "Menunggu Disposisi" : "Arsip Keluar"),
      fileFormat: "DOCX / PDF",
      originalSurat: s,
    }));

    // Dokumen tambahan Bidang IV
    const b4Extra: ArsipDokumenItem[] = [
      {
        id: "arsip-b4-sk-sdm",
        bidang: "bidang4" as const,
        bidangLabel: "Bidang IV (Administrasi)",
        nomorDokumen: "SK-SDM/005/BAZNAS-MDO/2026",
        tanggal: "2026-08-01",
        kategori: "SK Amil / SDM",
        pihakTerkait: "Seluruh Relawan Amil Zakat",
        perihal: "Surat Keputusan Pimpinan BAZNAS tentang Penetapan Relawan Amil Zakat Lapangan 2026",
        status: "terverifikasi",
        statusLabel: "Terverifikasi Resmi",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b4-ba-aset",
        bidang: "bidang4" as const,
        bidangLabel: "Bidang IV (Administrasi)",
        nomorDokumen: "BA-ASET/012/BAZNAS-MDO/2026",
        tanggal: "2026-08-25",
        kategori: "Berita Acara Aset",
        pihakTerkait: "Bagian Umum & Perlengkapan BAZNAS",
        perihal: "Berita Acara Sensus Fisik dan Inventarisasi Aset Perlengkapan Kantor & Mobil Layanan ZIS",
        status: "tersimpan",
        statusLabel: "Tersimpan di Gudang",
        fileFormat: "PDF",
      },
    ];

    // 2. Dokumen dari Bidang I (Pengumpulan ZIS & DSKL)
    const b1Docs: ArsipDokumenItem[] = [
      {
        id: "arsip-b1-sk-upz",
        bidang: "bidang1" as const,
        bidangLabel: "Bidang I (Pengumpulan)",
        nomorDokumen: "SK-UPZ/014/BAZNAS-MDO/2026",
        tanggal: "2026-09-02",
        kategori: "SK Legalitas UPZ",
        pihakTerkait: "UPZ Masjid Raya Ahmad Yani & Kemenag",
        perihal: "Surat Keputusan Penetapan Unit Pengumpul Zakat (UPZ) Masjid Agung & Standar Pelaporan",
        status: "terverifikasi",
        statusLabel: "SK Aktif Berjalan",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b1-rek-zis",
        bidang: "bidang1" as const,
        bidangLabel: "Bidang I (Pengumpulan)",
        nomorDokumen: "REK-ZIS/042/BAZNAS-MDO/IX/2026",
        tanggal: "2026-09-21",
        kategori: "Rekapitulasi ZIS ASN",
        pihakTerkait: "BPKAD & Pemkot Gorontalo",
        perihal: "Rekapitulasi Bukti Potong Setoran Zakat Profesi Payroll ASN Pemkot Periode September 2026",
        status: "terverifikasi",
        statusLabel: "Terverifikasi Akuntansi",
        fileFormat: "XLSX",
      },
      {
        id: "arsip-b1-ba-rek",
        bidang: "bidang1" as const,
        bidangLabel: "Bidang I (Pengumpulan)",
        nomorDokumen: "BA-REK/008/BSG-BAZNAS/2026",
        tanggal: "2026-09-20",
        kategori: "Rekonsiliasi Bank",
        pihakTerkait: "PT Bank Sulutgo Cabang Utama",
        perihal: "Berita Acara Rekonsiliasi Penerimaan Mutasi Kas Giro Rekening ZIS Triwulan III",
        status: "terverifikasi",
        statusLabel: "Selesai Rekonsiliasi",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b1-se-dskl",
        bidang: "bidang1" as const,
        bidangLabel: "Bidang I (Pengumpulan)",
        nomorDokumen: "SE-DSKL/019/BAZNAS-MDO/2026",
        tanggal: "2026-08-14",
        kategori: "Surat Edaran DSKL",
        pihakTerkait: "OPD, BUMD & Perusahaan Swasta",
        perihal: "Surat Edaran Sosialisasi Program Tabungan Kurban & Fidyah Mandiri Melalui BAZNAS",
        status: "tersimpan",
        statusLabel: "Terdokumentasi",
        fileFormat: "DOCX",
      },
    ];

    // 3. Dokumen dari Bidang II (Pendistribusian & Pendayagunaan)
    const b2Docs: ArsipDokumenItem[] = [
      {
        id: "arsip-b2-spk-katarak",
        bidang: "bidang2" as const,
        bidangLabel: "Bidang II (Pendistribusian)",
        nomorDokumen: "SPK-BAZNAS/09/2026/012",
        tanggal: "2026-09-22",
        kategori: "SPK Pencairan Dana",
        pihakTerkait: "RS Mata Prov. Sulut & Mustahik Lansia",
        perihal: "Surat Perintah Kerja (SPK) Pencairan Bantuan Medis Operasi Katarak Dhuafa Sebatang Kara",
        status: "terverifikasi",
        statusLabel: "Disetujui Ketua",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b2-spk-santri",
        bidang: "bidang2" as const,
        bidangLabel: "Bidang II (Pendistribusian)",
        nomorDokumen: "SPK-BAZNAS/09/2026/011",
        tanggal: "2026-09-18",
        kategori: "SPK Beasiswa",
        pihakTerkait: "Pesantren Darul Istiqamah Bailang",
        perihal: "SPK Penyaluran Bantuan Beasiswa Pendidikan Santri Yatim Piatu Semester Gasal 2026",
        status: "terverifikasi",
        statusLabel: "Disetujui Ketua",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b2-bast-zmart",
        bidang: "bidang2" as const,
        bidangLabel: "Bidang II (Pendistribusian)",
        nomorDokumen: "BAST/EKO/045/BAZNAS-MDO/2026",
        tanggal: "2026-09-15",
        kategori: "Berita Acara (BAST)",
        pihakTerkait: "Bpk. Abdullah Rauf (Mustahik Binaan Z-Mart)",
        perihal: "Berita Acara Serah Terima (BAST) Bantuan Hibah Modal Kerja & Etalase Usaha Mikro Z-Mart",
        status: "terverifikasi",
        statusLabel: "BAST Lengkap Berttd",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b2-sk-mustahik",
        bidang: "bidang2" as const,
        bidangLabel: "Bidang II (Pendistribusian)",
        nomorDokumen: "SK-MUST/KES/032/BAZNAS-MDO/2026",
        tanggal: "2026-09-10",
        kategori: "SK Asnaf Mustahik",
        pihakTerkait: "Kelurahan Sindulang Satu & Tuminting",
        perihal: "Surat Keputusan Penetapan Asnaf Fakir & Miskin Penerima Manfaat Program BAZNAS Sehat",
        status: "terverifikasi",
        statusLabel: "SK Sah Terbit",
        fileFormat: "PDF",
      },
    ];

    // 4. Dokumen dari Bidang III (Keuangan, RKAT & Pelaporan)
    const b3Docs: ArsipDokumenItem[] = [
      {
        id: "arsip-b3-rkat",
        bidang: "bidang3" as const,
        bidangLabel: "Bidang III (Keuangan)",
        nomorDokumen: "RKAT/BAZNAS-MDO/2026/V.2",
        tanggal: "2026-01-10",
        kategori: "Buku RKAT Resmi",
        pihakTerkait: "BAZNAS RI & Kementerian Agama RI",
        perihal: "Buku Rencana Kerja dan Anggaran Tahunan (RKAT) Pengelolaan ZIS-DSKL Tahun Anggaran 2026",
        status: "terverifikasi",
        statusLabel: "Disahkan BAZNAS RI",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b3-lpj-q3",
        bidang: "bidang3" as const,
        bidangLabel: "Bidang III (Keuangan)",
        nomorDokumen: "LPJ/KEU/Q3/BAZNAS-MDO/2026",
        tanggal: "2026-09-22",
        kategori: "Laporan LPJ",
        pihakTerkait: "Auditor Internal & Dewan Pengawas Syariah",
        perihal: "Laporan Pertanggungjawaban Realisasi Penyaluran & Penggunaan Anggaran Kas Kuartal III",
        status: "terverifikasi",
        statusLabel: "Lolos Verifikasi DPS",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b3-audit-wtp",
        bidang: "bidang3" as const,
        bidangLabel: "Bidang III (Keuangan)",
        nomorDokumen: "AUD-PSAK/019/KAP-BAZNAS/2026",
        tanggal: "2026-06-30",
        kategori: "Opini Audit KAP",
        pihakTerkait: "Kantor Akuntan Publik (KAP) Independen",
        perihal: "Laporan Hasil Audit Kepatuhan Syariah & Standar Akuntansi Keuangan PSAK 109 Predikat WTP",
        status: "terverifikasi",
        statusLabel: "Opini WTP Resmi",
        fileFormat: "PDF",
      },
      {
        id: "arsip-b3-bku",
        bidang: "bidang3" as const,
        bidangLabel: "Bidang III (Keuangan)",
        nomorDokumen: "BKU/09/BAZNAS-MDO/2026",
        tanggal: "2026-09-23",
        kategori: "Buku Kas Umum",
        pihakTerkait: "Bendahara Pengeluaran BAZNAS",
        perihal: "Rekap Buku Kas Umum (BKU) Kas Tunai Loket & Rekening Bank Penyaluran Bulan Berjalan",
        status: "tersimpan",
        statusLabel: "Kas Seimbang (Balance)",
        fileFormat: "XLSX",
      },
    ];

    return [...b1Docs, ...b2Docs, ...b3Docs, ...b4Docs, ...b4Extra];
  }, [suratList]);

  // Filter Data Arsip Terpadu Lintas Bidang
  const filteredArsipTerpadu = useMemo(() => {
    return multiBidangArsipList.filter((doc) => {
      const q = searchArsipQuery.toLowerCase();
      const matchSearch =
        !q ||
        doc.nomorDokumen.toLowerCase().includes(q) ||
        doc.perihal.toLowerCase().includes(q) ||
        doc.pihakTerkait.toLowerCase().includes(q) ||
        doc.kategori.toLowerCase().includes(q);

      const matchBidang = filterArsipBidang === "all" || doc.bidang === filterArsipBidang;
      const matchStatus = filterArsipStatus === "all" || doc.status === filterArsipStatus;

      return matchSearch && matchBidang && matchStatus;
    });
  }, [multiBidangArsipList, searchArsipQuery, filterArsipBidang, filterArsipStatus]);

  // Buka Form Generator Word dari Template
  const handleOpenGenerator = (tpl: TemplateSurat) => {
    setSelectedTemplateForGen(tpl);
    setGenNomorSurat(tpl.nomorFormat);
    setGenSifat("Penting & Segera");
    setGenLampiran("1 (Satu) Berkas");
    setGenPerihal(tpl.perihalDefault);
    setGenTanggal(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    setGenTujuan(tpl.tujuanDefault);
    setGenLokasiTujuan("Tempat");
    setGenPembuka(tpl.isiPembuka);
    setGenUtama(tpl.isiUtama);
    setGenPenutup(tpl.isiPenutup);
    setGenPenandatangan(tpl.penandatangan);
    setGenJabatanPenandatangan(tpl.jabatanPenandatangan);
  };

  // Unduh File Word (.docx — Microsoft Office 2021 compliant)
  const handleDownloadWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateForGen) return;

    const data: WordLetterData = {
      nomorSurat: genNomorSurat,
      sifat: genSifat,
      lampiran: genLampiran,
      perihal: genPerihal,
      tanggalSurat: genTanggal,
      tujuanSurat: genTujuan,
      lokasiTujuan: genLokasiTujuan,
      isiPembuka: genPembuka,
      isiUtama: genUtama,
      isiPenutup: genPenutup,
      namaPenandatangan: genPenandatangan,
      jabatanPenandatangan: genJabatanPenandatangan,
      tembusan: ["Ketua BAZNAS", "Wakil Ketua Terkait", "Arsip"],
    };

    const cleanName = selectedTemplateForGen.namaTemplate.replace(/[^a-zA-Z0-9]/g, "_");
    try {
      await exportLetterToWord(`${cleanName}_${Date.now()}`, data);
    } catch (err) {
      console.error("Gagal membuat file .docx, fallback ke .doc:", err);
      exportLetterToWordLegacy(`${cleanName}_${Date.now()}`, data);
    }
    setSelectedTemplateForGen(null);
  };

  // Simpan Template Surat Baru
  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplNama.trim()) return;

    const newTpl: TemplateSurat = {
      id: `tpl-${Date.now()}`,
      kode: `TPL-${newTplKategori.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      namaTemplate: newTplNama.trim(),
      kategori: newTplKategori,
      nomorFormat: newTplNomor,
      perihalDefault: newTplPerihal,
      tujuanDefault: newTplTujuan,
      isiPembuka: newTplPembuka,
      isiUtama: newTplUtama,
      isiPenutup: newTplPenutup,
      penandatangan: newTplPenandatangan,
      jabatanPenandatangan: newTplJabatan,
      tanggalDibuat: new Date().toISOString().split("T")[0],
    };

    if (onAddTemplateSurat) {
      onAddTemplateSurat(newTpl);
    }
    setTemplates([newTpl, ...templates]);
    setIsAddTemplateModalOpen(false);

    // Reset Form
    setNewTplNama("");
    setNewTplPerihal("");
    setNewTplTujuan("");
    setNewTplPembuka("");
    setNewTplUtama("");
    setNewTplPenutup("");
  };

  // Export Arsip Terpadu Lintas Bidang (Bidang 1 - 4) ke Excel
  const handleExportArsip = () => {
    const headers = [
      "Bidang Asal",
      "Kategori Dokumen",
      "Nomor Dokumen",
      "Tanggal Terbit",
      "Pihak Terkait / Instansi",
      "Perihal / Judul Dokumen",
      "Format Berkas",
      "Status Arsip",
    ];
    const rows = filteredArsipTerpadu.map((d) => [
      d.bidangLabel,
      d.kategori,
      d.nomorDokumen,
      d.tanggal,
      d.pihakTerkait,
      d.perihal,
      d.fileFormat,
      d.statusLabel,
    ]);
    exportToExcel("Arsip_Terpadu_BAZNAS_Bidang1-4", headers, rows);
  };

  const handleExportPegawai = () => {
    const headers = ["Nama Lengkap", "Jabatan", "Bidang", "Kontak HP/WA", "Status"];
    const rows = pegawaiList.map((p) => [
      p.nama,
      p.jabatan,
      p.bidang,
      p.kontak,
      p.status.toUpperCase(),
    ]);
    exportToExcel("Data_Pegawai_Amil_BAZNAS", headers, rows);
  };

  const handleExportAset = () => {
    const headers = [
      "Kode Aset",
      "Nama Aset / Barang",
      "Kondisi Fisik",
      "Lokasi Penempatan",
      "Tanggal Perolehan",
      "Nilai Perolehan (Rp)",
    ];
    const rows = asetList.map((a) => [
      a.kodeAset,
      a.namaAset,
      a.kondisi,
      a.lokasi,
      a.tanggalPerolehan,
      a.nilaiAset,
    ]);
    exportToExcel("Data_Inventaris_Aset_BAZNAS", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-ink">
            <FolderArchive className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-baznas-ink font-poppins">
                Bidang IV — Administrasi, SDM &amp; Umum
              </h1>
              <span className="bg-baznas-paper border border-baznas-ink-8 px-2.5 py-0.5 text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                Unit Sekretariat
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-0.5">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Dr. Hi. Marwan, SH., MH.</span> (Waka 4) — Staf Administrasi &amp; SDM: Franki Mopoliu, SE
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD RINGKASAN BIDANG 4 */}
      {canAccessTab(currentUser, "bidang4", "dashboard") && activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Surat Masuk
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {suratMasukList.length} <span className="text-sm font-normal text-baznas-ink/55">Berkas</span>
              </p>
              <p className="text-[11px] text-baznas-green-900 mt-1">
                {suratMasukList.filter((s) => s.statusDisposisi === "sudah_disposisi").length} Telah didisposisi Ketua
              </p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Surat Keluar
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {suratKeluarList.length} <span className="text-sm font-normal text-baznas-ink/55">Berkas</span>
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">Tercatat pada agenda dinas</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Template Surat Aktif
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {templates.length} <span className="text-sm font-normal text-baznas-ink/55">Format Word</span>
              </p>
              <p className="text-[11px] text-baznas-ink mt-1">Siap Ekspor Langsung ke Word</p>
            </div>

            <div className="border border-baznas-ink-8 bg-white p-5">
              <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                Personel Amil &amp; Staf
              </span>
              <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
                {pegawaiList.length} <span className="text-sm font-normal text-baznas-ink/55">Amil</span>
              </p>
              <p className="text-[11px] text-baznas-ink/45 mt-1">Pimpinan &amp; Staf Pelaksana</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB FORMAT & TEMPLATE SURAT (EKSPOR LANGSUNG KE MICROSOFT WORD .DOC) */}
      {canAccessTab(currentUser, "bidang4", "format_surat") && activeTab === "format_surat" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-baznas-ink font-poppins">
                  Format &amp; Template Surat Dinas BAZNAS
                </h3>
                <span className="inline-block bg-baznas-paper/60 text-baznas-ink text-xs px-2.5 py-0.5 font-bold">
                  {templates.length} Format Tersedia
                </span>
              </div>
              <p className="text-xs text-baznas-ink/55 mt-0.5">
                Pilih format surat dinas, sesuaikan isi, dan langsung unduh dalam format Microsoft Word (.doc) lengkap dengan Kop Surat resmi BAZNAS
              </p>
            </div>

            <button
              onClick={() => setIsAddTemplateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Tambah Format Baru
            </button>
          </div>

          {/* Grid Format Surat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl border border-baznas-ink-8 bg-baznas-paper/50 p-8 hover:border-blue-400 hover:bg-white transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-baznas-paper/60 text-baznas-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {tpl.kategori}
                    </span>
                    <span className="font-mono text-[10px] text-baznas-ink/45">{tpl.kode}</span>
                  </div>

                  <h4 className="text-sm font-bold text-baznas-ink font-poppins mt-2">
                    {tpl.namaTemplate}
                  </h4>
                  <p className="text-[11px] text-baznas-ink/65 line-clamp-2 mt-1">
                    {tpl.perihalDefault}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-baznas-ink-8/80 text-[11px] text-baznas-ink/55 space-y-1">
                    <div className="flex justify-between">
                      <span>No. Format:</span>
                      <span className="font-mono font-medium text-baznas-ink/80">{tpl.nomorFormat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penandatangan:</span>
                      <span className="font-semibold text-baznas-ink/80">{tpl.penandatangan}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenGenerator(tpl)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Buat &amp; Unduh Word (.doc)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB ARSIP TERPADU LINTAS BIDANG (BIDANG 1 - 4) */}
      {canAccessTab(currentUser, "bidang4", "arsip_surat") && activeTab === "arsip_surat" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-baznas-ink font-poppins">
                  Arsip Terpadu Lintas Bidang (Bidang I s.d. IV)
                </h3>
                <span className="inline-block bg-baznas-paper/60 text-baznas-ink text-xs px-2.5 py-0.5 font-bold">
                  {filteredArsipTerpadu.length} Dokumen Ditemukan
                </span>
              </div>
              <p className="text-xs text-baznas-ink/55 mt-0.5">
                Repositori terpusat seluruh arsip legalitas SK, SPK bantuan, BAST mustahik, LPJ keuangan, RKAT tahunan, serta agenda surat masuk &amp; keluar
              </p>
            </div>

            <button
              onClick={handleExportArsip}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Arsip Terpadu ke Excel ({filteredArsipTerpadu.length})</span>
            </button>
          </div>

          {/* Quick Filter Bidang Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-baznas-paper/40 border border-baznas-ink-8 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setFilterArsipBidang("all")}
              className={`px-3 py-2.5 rounded-lg font-bold transition-all ${
                filterArsipBidang === "all"
                  ? "bg-baznas-ink text-white"
                  : "text-baznas-ink/65 hover:text-baznas-ink hover:bg-white"
              }`}
            >
              Semua Bidang ({multiBidangArsipList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterArsipBidang("bidang1")}
              className={`px-3 py-2.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                filterArsipBidang === "bidang1"
                  ? "bg-baznas-green-900 text-white"
                  : "text-baznas-green-900 hover:bg-baznas-paper/40"
              }`}
            >
              <span className="h-2 w-2 inline-block bg-emerald-400" />
              <span>Bidang I: Pengumpulan ({multiBidangArsipList.filter((d) => d.bidang === "bidang1").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterArsipBidang("bidang2")}
              className={`px-3 py-2.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                filterArsipBidang === "bidang2"
                  ? "bg-orange-700 text-white"
                  : "text-orange-800 hover:bg-orange-50"
              }`}
            >
              <span className="h-2 w-2 inline-block bg-orange-400" />
              <span>Bidang II: Pendistribusian ({multiBidangArsipList.filter((d) => d.bidang === "bidang2").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterArsipBidang("bidang3")}
              className={`px-3 py-2.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                filterArsipBidang === "bidang3"
                  ? "bg-baznas-gold-display text-baznas-ink"
                  : "text-baznas-ink hover:bg-baznas-paper/40"
              }`}
            >
              <span className="h-2 w-2 inline-block bg-amber-400" />
              <span>Bidang III: Keuangan ({multiBidangArsipList.filter((d) => d.bidang === "bidang3").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterArsipBidang("bidang4")}
              className={`px-3 py-2.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                filterArsipBidang === "bidang4"
                  ? "bg-baznas-ink text-white"
                  : "text-baznas-ink hover:bg-baznas-paper/40"
              }`}
            >
              <span className="h-2 w-2 inline-block bg-blue-400" />
              <span>Bidang IV: Administrasi ({multiBidangArsipList.filter((d) => d.bidang === "bidang4").length})</span>
            </button>
          </div>

          {/* Filter Bar Arsip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-baznas-ink/45" />
              <input
                type="text"
                value={searchArsipQuery}
                onChange={(e) => setSearchArsipQuery(e.target.value)}
                placeholder="Cari Nomor Dokumen, Perihal, Pihak Terkait..."
                className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 focus:bg-white"
              />
            </div>

            <select
              value={filterArsipBidang}
              onChange={(e) => setFilterArsipBidang(e.target.value as "all" | "bidang1" | "bidang2" | "bidang3" | "bidang4")}
              className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none font-semibold"
            >
              <option value="all">Semua Unit Bidang (1 - 4)</option>
              <option value="bidang1">Bidang I — Pengumpulan</option>
              <option value="bidang2">Bidang II — Pendistribusian &amp; Pendayagunaan</option>
              <option value="bidang3">Bidang III — Keuangan &amp; RKAT</option>
              <option value="bidang4">Bidang IV — Administrasi &amp; SDM</option>
            </select>

            <select
              value={filterArsipStatus}
              onChange={(e) => setFilterArsipStatus(e.target.value)}
              className="rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none"
            >
              <option value="all">Semua Status Dokumen</option>
              <option value="terverifikasi">Terverifikasi Resmi</option>
              <option value="sudah_disposisi">Sudah Didisposisi</option>
              <option value="belum_disposisi">Menunggu Disposisi</option>
              <option value="tersimpan">Tersimpan / Terarsip</option>
            </select>
          </div>

          {/* Tabel Arsip Terpadu */}
          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8">
            <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/65">
              <thead className="bg-baznas-paper/40 text-[11px] font-bold text-baznas-ink/55 uppercase tracking-wider border-b border-baznas-ink-8">
                <tr>
                  <th className="py-3 px-4">Unit Bidang</th>
                  <th className="py-3 px-4">Nomor &amp; Tanggal Dokumen</th>
                  <th className="py-3 px-4">Kategori &amp; Format</th>
                  <th className="py-3 px-4">Pihak Terkait / Instansi</th>
                  <th className="py-3 px-4">Perihal / Judul Berkas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {filteredArsipTerpadu.map((doc) => {
                  const bidangBadgeClasses =
                    doc.bidang === "bidang1"
                      ? "bg-baznas-paper/60 text-baznas-green-900 border-emerald-200"
                      : doc.bidang === "bidang2"
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : doc.bidang === "bidang3"
                      ? "bg-baznas-paper/60 text-baznas-ink border-amber-200"
                      : "bg-baznas-paper/60 text-baznas-ink border-blue-200";

                  return (
                    <tr key={doc.id} className="hover:bg-baznas-paper/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${bidangBadgeClasses}`}>
                          {doc.bidang === "bidang1" ? "Bidang I" : doc.bidang === "bidang2" ? "Bidang II" : doc.bidang === "bidang3" ? "Bidang III" : "Bidang IV"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <span className="font-bold text-baznas-ink block">{doc.nomorDokumen}</span>
                        <span className="text-[11px] text-baznas-ink/45">{doc.tanggal}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-baznas-ink block">{doc.kategori}</span>
                        <span className="inline-block mt-0.5 rounded px-1.5 py-0.2 bg-baznas-paper/60 text-baznas-ink/65 font-mono text-[9px] font-bold">
                          {doc.fileFormat}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-baznas-ink max-w-[180px] truncate" title={doc.pihakTerkait}>
                        {doc.pihakTerkait}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={doc.perihal}>
                        {doc.perihal}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.status === "sudah_disposisi" || doc.status === "terverifikasi" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-baznas-green-900 bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 uppercase tracking-wider">
                            <CheckCircle className="h-3 w-3" /> {doc.statusLabel}
                          </span>
                        ) : doc.status === "belum_disposisi" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-baznas-ink bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 uppercase tracking-wider">
                            <Clock className="h-3 w-3" /> {doc.statusLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-baznas-ink/80 bg-baznas-paper/60 border border-baznas-ink-8 px-2 py-0.5 uppercase tracking-wider">
                            {doc.statusLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {doc.originalSurat && doc.originalSurat.jenis === "masuk" ? (
                          <button
                            onClick={() => onViewDisposisi(doc.originalSurat!)}
                            title="Cetak Lembar Disposisi"
                            className="inline-flex items-center gap-1 rounded-lg border border-baznas-ink-8 bg-baznas-paper/40 hover:bg-baznas-paper/60 px-2.5 py-1 text-xs font-semibold text-baznas-ink/80"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Lembar Disposisi</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              toastInfo(
                                "Arsip Dokumen Resmi",
                                `${doc.nomorDokumen} — ${doc.perihal}\nKategori: ${doc.kategori} | Status: ${doc.statusLabel}\n\nDokumen resmi tersimpan aman dalam pangkalan data arsip BAZNAS.`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-baznas-ink-20 bg-baznas-paper/40 hover:bg-baznas-ink hover:text-white text-baznas-ink px-2.5 py-1 text-xs font-semibold min-h-t-target"
                          >
                            <Download className="h-3 w-3" />
                            <span>Buka Berkas</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SURAT MASUK */}
      {canAccessTab(currentUser, "bidang4", "surat_masuk") && activeTab === "surat_masuk" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins">
                Buku Agenda Surat Masuk
              </h3>
              <p className="text-xs text-baznas-ink/55">
                Pencatatan surat masuk untuk diteruskan ke Ketua BAZNAS guna mendapatkan lembar disposisi.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("arsip_surat")}
              className="rounded-xl border border-baznas-ink-8 px-3 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:bg-baznas-paper/40"
            >
              Buka Arsip Lengkap
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8 text-xs">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-baznas-paper/40 text-baznas-ink/55 font-semibold border-b">
                <tr>
                  <th className="p-3">No. Surat</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Asal Pengirim</th>
                  <th className="p-3">Perihal</th>
                  <th className="p-3">Status Disposisi</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {suratMasukList.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono font-bold text-baznas-ink">{s.nomorSurat}</td>
                    <td className="p-3 text-baznas-ink/55">{s.tanggal}</td>
                    <td className="p-3 font-semibold text-baznas-ink">{s.pengirimTujuan}</td>
                    <td className="p-3 text-baznas-ink/80">{s.perihal}</td>
                    <td className="p-3">
                      <span className="inline-block bg-baznas-paper/60 text-baznas-green-900 px-2 py-0.5 text-[10px] font-bold">
                        {s.statusDisposisi.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onViewDisposisi(s)}
                        className="rounded-lg bg-baznas-paper border border-baznas-ink-12 px-2.5 py-1 text-xs font-semibold text-baznas-ink hover:bg-baznas-paper/60"
                      >
                        Lembar Disposisi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SURAT KELUAR */}
      {canAccessTab(currentUser, "bidang4", "surat_keluar") && activeTab === "surat_keluar" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-baznas-ink font-poppins">
                Buku Agenda Surat Keluar
              </h3>
              <p className="text-xs text-baznas-ink/55">
                Register penomoran surat resmi dan pengarsipan naskah keluar BAZNAS.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("format_surat")}
              className="rounded-xl bg-baznas-ink text-white px-3 py-2.5 text-xs font-semibold hover:bg-baznas-ink/90"
            >
              + Buat Surat dari Format
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8 text-xs">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-baznas-paper/40 text-baznas-ink/55 font-semibold border-b">
                <tr>
                  <th className="p-3">No. Surat Keluar</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Tujuan Surat</th>
                  <th className="p-3">Perihal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {suratKeluarList.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono font-bold text-baznas-ink">{s.nomorSurat}</td>
                    <td className="p-3 text-baznas-ink/55">{s.tanggal}</td>
                    <td className="p-3 font-semibold text-baznas-ink">{s.pengirimTujuan}</td>
                    <td className="p-3 text-baznas-ink/80">{s.perihal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SOP */}
      {canAccessTab(currentUser, "bidang4", "sop") && activeTab === "sop" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <h3 className="text-base font-bold text-baznas-ink font-poppins">
            Repositori Standar Operasional Prosedur (SOP) BAZNAS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="border p-8 rounded-xl bg-baznas-paper/40 space-y-1">
              <span className="font-bold text-baznas-ink block text-sm">SOP-01: Penerimaan Zakat Loket</span>
              <p className="text-baznas-ink/55">Standar pelayanan penyetoran tunai dan non-tunai di front office amil.</p>
            </div>
            <div className="border p-8 rounded-xl bg-baznas-paper/40 space-y-1">
              <span className="font-bold text-baznas-ink block text-sm">SOP-02: Verifikasi Faktual Mustahik</span>
              <p className="text-baznas-ink/55">Prosedur asesmen lapangan dan validasi dokumen SKTM penerima bantuan.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. DATA PEGAWAI & AMIL */}
      {canAccessTab(currentUser, "bidang4", "pegawai") && activeTab === "pegawai" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Direktori Pegawai &amp; Amil Zakat
            </h3>
            <button
              onClick={handleExportPegawai}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-3 py-2.5 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8 text-xs">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-baznas-paper/40 text-baznas-ink/55 font-semibold border-b">
                <tr>
                  <th className="p-3">Nama Pegawai</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Bidang Tugas</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {pegawaiList.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-semibold text-baznas-ink">{p.nama}</td>
                    <td className="p-3 text-baznas-ink/80">{p.jabatan}</td>
                    <td className="p-3 text-baznas-ink/65">{p.bidang}</td>
                    <td className="p-3 font-mono text-baznas-ink/55">{p.kontak}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block bg-baznas-paper/60 px-2 py-0.5 text-[10px] font-bold text-baznas-green-900">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. INVENTARIS ASET */}
      {canAccessTab(currentUser, "bidang4", "aset") && activeTab === "aset" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Inventarisasi Aset &amp; Barang Kantor
            </h3>
            <button
              onClick={handleExportAset}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-3 py-2.5 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-baznas-ink-8 text-xs">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-baznas-paper/40 text-baznas-ink/55 font-semibold border-b">
                <tr>
                  <th className="p-3">Kode Aset</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Kondisi</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3 text-right">Nilai Perolehan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baznas-ink-8">
                {asetList.map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 font-mono font-bold text-baznas-ink">{a.kodeAset}</td>
                    <td className="p-3 font-semibold text-baznas-ink">{a.namaAset}</td>
                    <td className="p-3">
                      <span className="inline-block bg-baznas-paper/60 text-baznas-green-900 px-2 py-0.5 text-[10px] font-bold">
                        {a.kondisi}
                      </span>
                    </td>
                    <td className="p-3 text-baznas-ink/65">{a.lokasi}</td>
                    <td className="p-3 text-right font-bold text-baznas-ink">
                      {formatRupiah(a.nilaiAset)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. PENGATURAN */}
      {canAccessTab(currentUser, "bidang4", "pengaturan") && activeTab === "pengaturan" && (
        <div className="border border-baznas-ink-8 bg-white p-8 space-y-8 max-w-xl text-xs">
          <h3 className="text-base font-bold text-baznas-ink font-poppins">
            Pengaturan Tata Naskah Dinas &amp; Persuratan
          </h3>
          <p className="text-baznas-ink/55">
            Konfigurasi kode klasifikasi nomor surat dinas sesuai instruksi BAZNAS RI Pusat.
          </p>
        </div>
      )}

      {/* MODAL GENERATOR SURAT KE MICROSOFT WORD (.DOC) */}
      {selectedTemplateForGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-lift border border-baznas-ink-8 overflow-hidden">
            <div className="border border-baznas-ink-8 bg-baznas-paper">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    Buat Surat Word: {selectedTemplateForGen.namaTemplate}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Sesuaikan rincian sebelum diekspor ke Microsoft Word (.doc)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplateForGen(null)}
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDownloadWord} className="p-6 space-y-8 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nomor Surat *</label>
                  <input
                    type="text"
                    required
                    value={genNomorSurat}
                    onChange={(e) => setGenNomorSurat(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Tanggal Surat *</label>
                  <input
                    type="text"
                    required
                    value={genTanggal}
                    onChange={(e) => setGenTanggal(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Sifat Surat</label>
                  <input
                    type="text"
                    value={genSifat}
                    onChange={(e) => setGenSifat(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Lampiran</label>
                  <input
                    type="text"
                    value={genLampiran}
                    onChange={(e) => setGenLampiran(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Perihal / Hal *</label>
                <input
                  type="text"
                  required
                  value={genPerihal}
                  onChange={(e) => setGenPerihal(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 font-semibold text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Kepada Yth. (Tujuan Surat) *</label>
                  <input
                    type="text"
                    required
                    value={genTujuan}
                    onChange={(e) => setGenTujuan(e.target.value)}
                    placeholder="Contoh: Kepala Dinas Pendidikan Kota"
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Lokasi Tujuan</label>
                  <input
                    type="text"
                    value={genLokasiTujuan}
                    onChange={(e) => setGenLokasiTujuan(e.target.value)}
                    placeholder="Contoh: Tempat / di Gorontalo"
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Paragraf Pembuka</label>
                <textarea
                  rows={2}
                  value={genPembuka}
                  onChange={(e) => setGenPembuka(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Isi Pokok / Inti Surat *</label>
                <textarea
                  rows={3}
                  required
                  value={genUtama}
                  onChange={(e) => setGenUtama(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Paragraf Penutup</label>
                <textarea
                  rows={2}
                  value={genPenutup}
                  onChange={(e) => setGenPenutup(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Nama Penandatangan</label>
                  <input
                    type="text"
                    value={genPenandatangan}
                    onChange={(e) => setGenPenandatangan(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 font-semibold text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Jabatan Penandatangan</label>
                  <input
                    type="text"
                    value={genJabatanPenandatangan}
                    onChange={(e) => setGenJabatanPenandatangan(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForGen(null)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 font-bold text-white shadow-md shadow-blue-700/25 transition-all"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Unduh Dokumen Word (.doc)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH FORMAT SURAT BARU */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lift border border-baznas-ink-8 overflow-hidden">
            <div className="border border-baznas-ink-8 bg-baznas-paper">
              <div>
                <h3 className="text-base font-bold font-poppins text-white">
                  Tambah Format / Template Surat Baru
                </h3>
                <p className="text-xs text-blue-100">
                  Daftarkan format surat dinas baru untuk digunakan staf BAZNAS
                </p>
              </div>
              <button
                onClick={() => setIsAddTemplateModalOpen(false)}
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Nama Template Surat *</label>
                <input
                  type="text"
                  required
                  value={newTplNama}
                  onChange={(e) => setNewTplNama(e.target.value)}
                  placeholder="Contoh: Surat Pengantar Penyaluran Zakat Fitrah"
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Kategori Format</label>
                  <select
                    value={newTplKategori}
                    onChange={(e) => setNewTplKategori(e.target.value as TemplateSurat["kategori"])}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                  >
                    <option value="Tugas">Surat Tugas</option>
                    <option value="Penyaluran">Surat Penyaluran (SPK)</option>
                    <option value="Undangan">Surat Undangan</option>
                    <option value="Rekomendasi">Surat Rekomendasi</option>
                    <option value="Keterangan">Surat Keterangan</option>
                    <option value="BAST">Berita Acara (BAST)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Format Nomor Standar</label>
                  <input
                    type="text"
                    value={newTplNomor}
                    onChange={(e) => setNewTplNomor(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 font-mono text-baznas-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Perihal Standar</label>
                <input
                  type="text"
                  value={newTplPerihal}
                  onChange={(e) => setNewTplPerihal(e.target.value)}
                  placeholder="Perihal surat..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Tujuan Standar</label>
                <input
                  type="text"
                  value={newTplTujuan}
                  onChange={(e) => setNewTplTujuan(e.target.value)}
                  placeholder="Pihak penerima surat..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Isi Pokok / Inti Surat *</label>
                <textarea
                  rows={2}
                  required
                  value={newTplUtama}
                  onChange={(e) => setNewTplUtama(e.target.value)}
                  placeholder="Keterangan inti dari surat..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Penandatangan</label>
                  <input
                    type="text"
                    value={newTplPenandatangan}
                    onChange={(e) => setNewTplPenandatangan(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-baznas-ink/80 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={newTplJabatan}
                    onChange={(e) => setNewTplJabatan(e.target.value)}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-baznas-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setIsAddTemplateModalOpen(false)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 font-bold text-white shadow-md"
                >
                  Simpan Format Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container — render global toast UI */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
