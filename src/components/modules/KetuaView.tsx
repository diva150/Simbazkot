"use client";

import React, { useState, useEffect } from "react";
import {
  Surat,
  SetoranZIS,
  Muzakki,
  Mustahik,
  PermohonanPencairan,
  ItemRKAT,
  Pegawai,
  AsetKantor,
  KetuaTab,
  UserSession,
} from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
// NOTE: exportToExcel is dynamically imported inside its handler so the
// heavy xlsx library is only fetched when the user actually exports.
import { ConfirmDialog, useToast, ToastContainer, Dialog } from "@/components/common";
import { canAccessTab } from "@/lib/access";
import {
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Coins,
  HeartHandshake,
  TrendingUp,
  FolderArchive,
  Filter,
  Check,
  XCircle,
} from "lucide-react";

interface KetuaViewProps {
  suratList: Surat[];
  setoranList: SetoranZIS[];
  muzakkiList: Muzakki[];
  mustahikList: Mustahik[];
  pencairanList: PermohonanPencairan[];
  rkatList: ItemRKAT[];
  pegawaiList: Pegawai[];
  asetList: AsetKantor[];
  onUpdateSuratDisposisi: (
    suratId: string,
    disposisiData: {
      tujuanDisposisi: string;
      instruksi: string;
      sifat: string;
      catatan: string;
    }
  ) => void;
  onViewDisposisi: (surat: Surat) => void;
  onApproveSPK?: (id: string) => void;
  onRejectSPK?: (id: string, reason: string) => void;
  currentUser: UserSession;
  activeTab?: KetuaTab;
  onTabChange?: (tab: KetuaTab) => void;
}

export const KetuaView: React.FC<KetuaViewProps> = ({
  suratList,
  setoranList,
  muzakkiList,
  mustahikList,
  pencairanList,
  rkatList,
  pegawaiList,
  asetList,
  onUpdateSuratDisposisi,
  onViewDisposisi,
  onApproveSPK,
  onRejectSPK,
  currentUser,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<KetuaTab>("disposisi");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: KetuaTab) => {
    if (!canAccessTab(currentUser, "ketua", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("disposisi");
      else setLocalTab("disposisi");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "ketua", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("disposisi");
      else setLocalTab("disposisi");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  // State Disposisi Modal
  const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<Surat | null>(null);
  const [tujuanDisposisi, setTujuanDisposisi] = useState("Wakil Ketua 1 – Bidang Pengumpulan");
  const [sifatDisposisi, setSifatDisposisi] = useState("Penting & Segera");
  const [instruksiDisposisi, setInstruksiDisposisi] = useState("Tindak lanjuti sesuai ketentuan");
  const [catatanDisposisi, setCatatanDisposisi] = useState("");

  // Modal Tolak SPK
  const [rejectSpkId, setRejectSpkId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Confirmation state for Approve (UX-IMPROVEMENT-PLAN-30-60.md §3.1)
  const [approveSpkId, setApproveSpkId] = useState<string | null>(null);

  // Toast notifications
  const { success: toastSuccess, error: toastError, toasts, dismiss } = useToast();

  // Filter Surat Masuk
  const [filterStatusSurat, setFilterStatusSurat] = useState<"all" | "belum_disposisi" | "sudah_disposisi">("all");

  const suratMasukList = suratList.filter((s) => s.jenis === "masuk");
  const suratMasukFiltered = suratMasukList.filter((s) => {
    if (filterStatusSurat === "all") return true;
    return s.statusDisposisi === filterStatusSurat;
  });

  const suratBelumDisposisi = suratMasukList.filter((s) => s.statusDisposisi === "belum_disposisi").length;
  const suratSudahDisposisi = suratMasukList.filter((s) => s.statusDisposisi === "sudah_disposisi").length;

  // SPK Menunggu Persetujuan Ketua
  const pendingSpkCount = pencairanList.filter((p) => p.status === "diajukan").length;

  // Rekapitulasi Metrik Bidang 1-4 untuk Laporan Terpadu
  const totalPenerimaanZIS = setoranList.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPenyaluranDisetujui = pencairanList
    .filter((p) => p.status === "disetujui_ketua" || p.status === "dikonfirmasi_bidang2")
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPaguRKAT = rkatList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasiRKAT = rkatList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalNilaiAset = asetList.reduce((acc, curr) => acc + curr.nilaiAset, 0);

  // Submit Disposisi
  const handleOpenDisposisiModal = (surat: Surat) => {
    setSelectedSuratForDisposisi(surat);
    setTujuanDisposisi(surat.tujuanDisposisi || "Wakil Ketua 1 – Bidang Pengumpulan");
    setSifatDisposisi("Penting & Segera");
    setInstruksiDisposisi("Tindak lanjuti sesuai ketentuan");
    setCatatanDisposisi(surat.catatanDisposisi || "");
  };

  const handleSaveDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuratForDisposisi) return;

    onUpdateSuratDisposisi(selectedSuratForDisposisi.id, {
      tujuanDisposisi,
      instruksi: instruksiDisposisi,
      sifat: sifatDisposisi,
      catatan: catatanDisposisi,
    });

    setSelectedSuratForDisposisi(null);
  };

  // Submit Penolakan SPK — called from ConfirmDialog with the reason text
  const handleConfirmRejectSPK = (reason?: string) => {
    if (!rejectSpkId) return;
    const finalReason = reason?.trim() || "Berkas administrasi / SKTM belum memenuhi syarat";
    const target = pencairanList.find((p) => p.id === rejectSpkId);

    if (onRejectSPK) {
      onRejectSPK(rejectSpkId, finalReason);
    } else if (target) {
      target.status = "ditolak";
      target.catatanPenolakan = finalReason;
    }

    toastSuccess(
      "SPK berhasil ditolak",
      `Pengajuan ${target?.nomorSPK ?? rejectSpkId} dikembalikan ke Bidang II untuk revisi.`
    );

    setRejectSpkId(null);
    setRejectReason("");
  };

  // Approve SPK — called from ConfirmDialog (UX-IMPROVEMENT-PLAN-30-60.md §3.1)
  const handleConfirmApproveSPK = () => {
    if (!approveSpkId) return;
    const target = pencairanList.find((p) => p.id === approveSpkId);

    if (onApproveSPK) {
      onApproveSPK(approveSpkId);
    } else if (target) {
      target.status = "disetujui_ketua";
      target.approver = "Mohamad Husain Rauf (Ketua BAZNAS)";
    }

    toastSuccess(
      "SPK berhasil disetujui",
      `Pencairan ${target?.nomorSPK ?? approveSpkId} akan diteruskan ke Bidang III (Keuangan).`
    );

    setApproveSpkId(null);
  };

  const handleExportLaporanTerpadu = async () => {
    const headers = ["Bidang", "Komponen / Indikator", "Volume / Jumlah", "Total Nominal (Rp)", "Keterangan"];
    const rows = [
      ["Bidang I (Pengumpulan)", "Penerimaan ZIS & DSKL", `${setoranList.length} Transaksi`, totalPenerimaanZIS, "Kas Masuk Loket & Bank"],
      ["Bidang I (Pengumpulan)", "Muzakki Terdaftar", `${muzakkiList.length} Jiwa`, 0, "Basis NIK & NPWZ Resmi"],
      ["Bidang II (Pendistribusian)", "Dana Penyaluran Disetujui", `${pencairanList.filter(p => p.status === "disetujui_ketua" || p.status === "dikonfirmasi_bidang2").length} Program SPK`, totalPenyaluranDisetujui, "Mustahik Desil 1 s/d 5"],
      ["Bidang II (Pendistribusian)", "Mustahik Terdata", `${mustahikList.length} KK/Jiwa`, 0, "Asnaf Fakir Miskin dll"],
      ["Bidang III (Keuangan)", "Total Pagu RKAT Berjalan", `${rkatList.length} Pos Anggaran`, totalPaguRKAT, "Rencana Kerja Tahunan"],
      ["Bidang III (Keuangan)", "Realisasi Serapan Anggaran", `${Math.round((totalRealisasiRKAT / totalPaguRKAT) * 100)}% Terserap`, totalRealisasiRKAT, "Sesuai PSAK 109"],
      ["Bidang IV (Administrasi)", "Surat Masuk & Keluar", `${suratList.length} Berkas`, 0, `${suratSudahDisposisi} Sudah Didisposisi Ketua`],
      ["Bidang IV (Administrasi)", "SDM & Amil Aktif", `${pegawaiList.length} Personel`, 0, "Pimpinan & Staf Pelaksana"],
      ["Bidang IV (Administrasi)", "Inventaris Aset BAZNAS", `${asetList.length} Unit Barang`, totalNilaiAset, "Kondisi Fisik Terverifikasi"],
    ];
    const { exportToExcel } = await import("@/lib/excel-utils");
    exportToExcel("Laporan_Terpadu_Ketua_BAZNAS", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Ketua */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-baznas-gold-display bg-baznas-green-800 p-3 text-white">
            <ShieldCheck className="h-7 w-7 text-baznas-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-baznas-ink font-poppins">
                Dashboard Pimpinan — Ketua BAZNAS
              </h1>
              <span className="inline-block bg-baznas-paper/60 px-3 py-0.5 text-xs font-bold text-baznas-green-900 border border-baznas-green-200">
                Pimpinan Tertinggi
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-0.5">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Mohamad Husain Rauf</span> (Ketua BAZNAS) — Otoritas Disposisi Surat Masuk, Persetujuan SPK Bantuan, &amp; Pengawasan Laporan
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TAB DISPOSISI SURAT MASUK (BIDANG IV) */}
      {/* ============================================================ */}
      {canAccessTab(currentUser, "ketua", "disposisi") && activeTab === "disposisi" && (
        <div className="space-y-6">
          {/* Ringkasan Disposisi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-baznas-ink-8 bg-white p-8 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
                  Total Surat Masuk
                </span>
                <p className="text-2xl font-bold text-baznas-ink font-poppins mt-1">
                  {suratMasukList.length} <span className="text-sm font-normal text-baznas-ink/55">Berkas</span>
                </p>
                <p className="text-[11px] text-baznas-ink/55 mt-1">Diinput oleh Bidang IV (Administrasi)</p>
              </div>
              <div className="border border-baznas-gold-display bg-baznas-paper p-3 text-baznas-green-900">
                <FileText className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-md border border-baznas-gold-display bg-baznas-paper p-7 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-baznas-ink uppercase tracking-wider">
                  Menunggu Disposisi Ketua
                </span>
                <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-1">
                  {suratBelumDisposisi} <span className="text-sm font-normal text-baznas-ink">Berkas</span>
                </p>
                <p className="text-[11px] text-baznas-ink mt-1">Memerlukan instruksi pimpinan</p>
              </div>
              <div className="rounded-xl bg-baznas-paper/60 p-3 text-baznas-ink">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-md border border-baznas-gold-display bg-baznas-paper p-7 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-baznas-green-900 uppercase tracking-wider">
                  Selesai Didisposisi
                </span>
                <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-1">
                  {suratSudahDisposisi} <span className="text-sm font-normal text-baznas-green-900">Berkas</span>
                </p>
                <p className="text-[11px] text-baznas-green-900 mt-1">Diteruskan ke Waka terkait</p>
              </div>
              <div className="rounded-xl bg-baznas-paper/60 p-3 text-baznas-green-900">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Tabel Surat Masuk */}
          <div className="border border-baznas-ink-8 bg-white overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-8 border-b border-baznas-ink-8 bg-baznas-paper/40">
              <div>
                <h3 className="text-sm font-bold text-baznas-ink font-poppins">
                  Agenda Surat Masuk untuk Disposisi
                </h3>
                <p className="text-xs text-baznas-ink/55">
                  Daftar surat resmi yang masuk ke BAZNAS untuk diberi lembar arahan dan disposisi Ketua
                </p>
              </div>

              {/* Filter Status Disposisi */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-baznas-ink/45" />
                <select
                  value={filterStatusSurat}
                  onChange={(e) => setFilterStatusSurat(e.target.value as "all" | "belum_disposisi" | "sudah_disposisi")}
                  className="rounded-xl border border-baznas-ink-8 bg-white px-3 py-2.5 text-xs text-baznas-ink/80 font-medium focus:outline-none"
                >
                  <option value="all">Semua Status Surat</option>
                  <option value="belum_disposisi">Menunggu Disposisi</option>
                  <option value="sudah_disposisi">Sudah Didisposisi</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-baznas-ink/65">
                <thead className="bg-baznas-paper/60/70 text-[11px] font-bold text-baznas-ink/55 uppercase tracking-wider border-b border-baznas-ink-8">
                  <tr>
                    <th className="py-3 px-4">No. Surat &amp; Tgl</th>
                    <th className="py-3 px-4">Pengirim / Asal</th>
                    <th className="py-3 px-4">Perihal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tujuan Disposisi (Waka)</th>
                    <th className="py-3 px-4">Instruksi &amp; Catatan</th>
                    <th className="py-3 px-4 text-right">Aksi Ketua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-baznas-ink-8">
                  {suratMasukFiltered.map((surat) => (
                    <tr key={surat.id} className="hover:bg-baznas-paper/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-baznas-ink block">{surat.nomorSurat}</span>
                        <span className="text-[11px] text-baznas-ink/45">{surat.tanggal}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-baznas-ink/80">{surat.pengirimTujuan}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={surat.perihal}>
                        {surat.perihal}
                      </td>
                      <td className="py-3.5 px-4">
                        {surat.statusDisposisi === "sudah_disposisi" ? (
                          <span className="inline-flex items-center gap-1 inline-block bg-baznas-paper border border-baznas-ink-12 px-2 py-0.5 text-[10px] font-bold text-baznas-green-900">
                            <CheckCircle2 className="h-3 w-3 text-baznas-green-900" />
                            Sudah Didisposisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 inline-block bg-baznas-paper border border-baznas-gold-display px-2 py-0.5 text-[10px] font-bold text-baznas-ink">
                            <Clock className="h-3 w-3 text-baznas-ink" />
                            Menunggu Disposisi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {surat.tujuanDisposisi ? (
                          <span className="font-semibold text-baznas-ink/80 bg-baznas-paper/60 px-2 py-1 rounded-lg text-[11px] inline-block">
                            {surat.tujuanDisposisi}
                          </span>
                        ) : (
                          <span className="text-baznas-ink/45 italic text-[11px]">Belum ditentukan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {surat.instruksiDisposisi ? (
                          <div>
                            <span className="font-medium text-baznas-ink">{surat.instruksiDisposisi}</span>
                            {surat.catatanDisposisi && (
                              <p className="text-[10px] text-baznas-ink/55 truncate">{surat.catatanDisposisi}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-baznas-ink/45 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDisposisiModal(surat)}
                          className="rounded-lg bg-baznas-green-800 hover:bg-baznas-green-700 px-3 py-2.5 text-[11px] font-bold text-white transition-all"
                        >
                          {surat.statusDisposisi === "sudah_disposisi" ? "Ubah Disposisi" : "Beri Disposisi"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewDisposisi(surat)}
                          title="Cetak Lembar Disposisi Resmi A5"
                          className="rounded-lg border border-baznas-ink-8 bg-baznas-paper/40 hover:bg-baznas-paper/60 p-1.5 text-baznas-ink/65 transition-colors inline-flex items-center"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {suratMasukFiltered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-baznas-ink/45">
                        Tidak ada surat masuk dengan filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TAB PERSETUJUAN SPK & PENCAIRAN DANA (BIDANG II) */}
      {/* ============================================================ */}
      {canAccessTab(currentUser, "ketua", "persetujuan_spk") && activeTab === "persetujuan_spk" && (
        <div className="space-y-6">
          <div className="rounded-md border border-baznas-gold-display bg-baznas-paper p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-baznas-green-900 font-poppins">
                Otorisasi Permohonan Pencairan Bantuan (SPK) Bidang II
              </h2>
              <p className="text-xs text-baznas-green-900 mt-0.5">
                Ketua BAZNAS menyetujui atau menolak permohonan SPK yang diajukan oleh Wakil Ketua 2 / Staf Bidang II sebelum dikonfirmasi dan dicairkan oleh Bendahara Bidang III.
              </p>
            </div>
            <span className="inline-block bg-baznas-paper/60 text-baznas-green-900 border border-baznas-green-300 px-3 py-1 text-xs font-bold">
              {pendingSpkCount} SPK Menunggu Persetujuan
            </span>
          </div>

          <div className="space-y-4">
            {pencairanList.map((p) => {
              const isPending = p.status === "diajukan";
              const isApprovedKetua = p.status === "disetujui_ketua";
              const isConfirmedBidang2 = p.status === "dikonfirmasi_bidang2";
              const isRejected = p.status === "ditolak";

              return (
                <div
                  key={p.id}
                  className={`rounded-md border p-8 transition-all ${
                    isPending
                      ? "border-baznas-gold-display bg-baznas-paper"
                      : isApprovedKetua
                      ? "border-baznas-ink-12 bg-baznas-paper/30"
                      : isConfirmedBidang2
                      ? "border-baznas-green-200 bg-baznas-paper/30"
                      : "border-baznas-error-200 bg-baznas-paper/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-baznas-ink/80 bg-white border border-baznas-ink-8 px-2 py-0.5 rounded-md">
                          {p.nomorSPK}
                        </span>

                        {isPending && (
                          <span className="inline-block bg-baznas-paper/60 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-baznas-warning-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Menunggu Otorisasi Ketua
                          </span>
                        )}

                        {isApprovedKetua && (
                          <span className="inline-block bg-baznas-paper/60 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-baznas-ink-20 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Disetujui Ketua — Menunggu Konfirmasi Bidang II
                          </span>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="inline-block bg-baznas-paper/60 text-baznas-green-900 px-2.5 py-0.5 text-[10px] font-bold border border-baznas-green-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Telah Dikonfirmasi Lengkap (Siap Cair)
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-block bg-baznas-paper/60 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold border border-baznas-error-300 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ditolak Ketua
                          </span>
                        )}

                        <span className="inline-block bg-baznas-paper/60 px-2 py-0.5 text-[10px] font-bold text-baznas-ink/80 uppercase">
                          {p.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {p.namaSubProgram}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-baznas-ink font-poppins">
                        {p.namaProgram}
                      </h4>
                      <p className="text-xs text-baznas-ink/65 leading-relaxed max-w-2xl">{p.keterangan}</p>

                      <div className="flex flex-wrap items-center gap-5 text-xs text-baznas-ink/55 pt-1">
                        <span>Target: <strong className="text-baznas-ink/80">{p.jumlahMustahik} Mustahik</strong></span>
                        <span>Diajukan: <strong className="text-baznas-ink/80">{p.tanggal}</strong></span>
                        <span>Pemohon: <strong className="text-baznas-ink/80">{p.pemohon}</strong></span>
                        {p.approver && <span>Approver: <strong className="text-baznas-green-900">{p.approver}</strong></span>}
                      </div>

                      {p.catatanPenolakan && (
                        <div className="rounded-lg bg-baznas-paper/60/70 border border-baznas-error-200 p-2 text-xs text-baznas-ink font-semibold mt-1">
                          Alasan Penolakan: {p.catatanPenolakan}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:items-end justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-baznas-ink/45 block lg:text-right uppercase font-semibold">
                          Nilai SPK Bantuan
                        </span>
                        <span className="text-xl font-bold text-baznas-green-900 font-poppins">
                          {formatRupiah(p.nominal)}
                        </span>
                      </div>

                      {/* Tombol Otorisasi Ketua */}
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRejectSpkId(p.id)}
                            className="flex items-center gap-1 rounded-xl border border-baznas-error-300 bg-white hover:bg-baznas-paper/40 px-3 py-2.5 text-xs font-bold text-baznas-ink transition-colors min-h-t-target"
                          >
                            <XCircle className="h-4 w-4" />
                            Tolak SPK
                          </button>

                          <button
                            onClick={() => setApproveSpkId(p.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20 transition-all min-h-t-target"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Setujui SPK (Ketua)
                          </button>
                        </div>
                      )}

                      {isApprovedKetua && (
                        <span className="text-xs text-baznas-ink bg-baznas-paper/60/70 border border-baznas-ink-12 px-3 py-1 rounded-xl font-semibold">
                          Telah Disetujui • Menunggu Verifikasi Bidang II
                        </span>
                      )}

                      {isConfirmedBidang2 && (
                        <span className="text-xs text-baznas-green-900 bg-baznas-paper/60/80 border border-baznas-green-200 px-3 py-1 rounded-xl font-semibold">
                          Otorisasi Selesai • Diteruskan ke Kas Bidang III
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB SELURUH LAPORAN TERPADU BAZNAS */}
      {/* ============================================================ */}
      {canAccessTab(currentUser, "ketua", "laporan_semua") && activeTab === "laporan_semua" && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-baznas-ink-8 bg-baznas-paper">
            <div>
              <h2 className="text-base font-bold font-poppins">
                Monitoring Laporan Konsolidasi 4 Bidang BAZNAS
              </h2>
              <p className="text-xs text-baznas-ink/55 mt-0.5">
                Pengawasan komprehensif penghimpunan, penyaluran, realisasi anggaran dan tata kelola kantor
              </p>
            </div>
            <button
              onClick={handleExportLaporanTerpadu}
              className="rounded-xl bg-baznas-gold-500 hover:bg-baznas-gold-600 px-4 py-2.5 text-xs font-bold text-baznas-ink flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Rekap Laporan (Excel)</span>
            </button>
          </div>

          {/* 4 Cards Ringkasan Bidang */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bidang 1 */}
            <div className="rounded-md border border-baznas-green-200 bg-white p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-green-800 uppercase tracking-wider">
                  Bidang I — Pengumpulan
                </span>
                <Coins className="h-5 w-5 text-baznas-green-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-baznas-ink font-poppins">
                  {formatRupiah(totalPenerimaanZIS)}
                </p>
                <p className="text-xs text-baznas-ink/55 mt-0.5">Total ZIS &amp; DSKL Terhimpun</p>
              </div>
              <div className="border-t border-baznas-ink-8 pt-2 text-[11px] text-baznas-ink/65 space-y-1">
                <div className="flex justify-between">
                  <span>Muzakki Terdaftar:</span>
                  <span className="font-bold text-baznas-ink">{muzakkiList.length} Jiwa</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaksi Masuk:</span>
                  <span className="font-bold text-baznas-ink">{setoranList.length} Lembar</span>
                </div>
              </div>
            </div>

            {/* Bidang 2 */}
            <div className="rounded-md border border-baznas-error-200 bg-white p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-ink uppercase tracking-wider">
                  Bidang II — Pendistribusian
                </span>
                <HeartHandshake className="h-5 w-5 text-baznas-ink" />
              </div>
              <div>
                <p className="text-xl font-bold text-baznas-ink font-poppins">
                  {formatRupiah(totalPenyaluranDisetujui)}
                </p>
                <p className="text-xs text-baznas-ink/55 mt-0.5">Dana Penyaluran SPK Disetujui</p>
              </div>
              <div className="border-t border-baznas-ink-8 pt-2 text-[11px] text-baznas-ink/65 space-y-1">
                <div className="flex justify-between">
                  <span>Mustahik (Desil 1–5):</span>
                  <span className="font-bold text-baznas-ink">{mustahikList.length} Mustahik</span>
                </div>
                <div className="flex justify-between">
                  <span>SPK Disetujui:</span>
                  <span className="font-bold text-baznas-ink">
                    {pencairanList.filter((p) => p.status === "disetujui_ketua" || p.status === "dikonfirmasi_bidang2").length} Berkas
                  </span>
                </div>
              </div>
            </div>

            {/* Bidang 3 */}
            <div className="rounded-md border border-baznas-warning-200 bg-white p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-ink uppercase tracking-wider">
                  Bidang III — Keuangan &amp; RKAT
                </span>
                <TrendingUp className="h-5 w-5 text-baznas-ink" />
              </div>
              <div>
                <p className="text-xl font-bold text-baznas-ink font-poppins">
                  {Math.round((totalRealisasiRKAT / (totalPaguRKAT || 1)) * 100)}%
                </p>
                <p className="text-xs text-baznas-ink/55 mt-0.5">Serapan Anggaran Berjalan</p>
              </div>
              <div className="border-t border-baznas-ink-8 pt-2 text-[11px] text-baznas-ink/65 space-y-1">
                <div className="flex justify-between">
                  <span>Pagu Anggaran:</span>
                  <span className="font-bold text-baznas-ink">{formatRupiah(totalPaguRKAT)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Realisasi Kas:</span>
                  <span className="font-bold text-baznas-ink">{formatRupiah(totalRealisasiRKAT)}</span>
                </div>
              </div>
            </div>

            {/* Bidang 4 */}
            <div className="rounded-md border border-baznas-ink-12 bg-white p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-ink uppercase tracking-wider">
                  Bidang IV — Administrasi &amp; SDM
                </span>
                <FolderArchive className="h-5 w-5 text-baznas-ink" />
              </div>
              <div>
                <p className="text-xl font-bold text-baznas-ink font-poppins">
                  {pegawaiList.length} <span className="text-sm font-normal text-baznas-ink/55">Amil</span>
                </p>
                <p className="text-xs text-baznas-ink/55 mt-0.5">Personel &amp; Staf Operasional</p>
              </div>
              <div className="border-t border-baznas-ink-8 pt-2 text-[11px] text-baznas-ink/65 space-y-1">
                <div className="flex justify-between">
                  <span>Surat Didisposisi:</span>
                  <span className="font-bold text-baznas-ink">{suratSudahDisposisi} Selesai</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Nilai Aset:</span>
                  <span className="font-bold text-baznas-ink">{formatRupiah(totalNilaiAset)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL BERI / UBAH DISPOSISI */}
      {/* ============================================================ */}
      {selectedSuratForDisposisi && (
        <Dialog
          open={!!selectedSuratForDisposisi}
          onClose={() => setSelectedSuratForDisposisi(null)}
          title="Lembar Disposisi Ketua BAZNAS"
          size="lg"
          showCloseButton={false}
          panelClassName="max-w-lg bg-white border border-baznas-ink-8 shadow-lift"
        >
            <div className="border border-baznas-ink-8 bg-baznas-green-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-poppins text-white">
                  Lembar Disposisi Ketua BAZNAS
                </h3>
                <p className="text-xs text-baznas-paper/70">
                  Nomor Surat: {selectedSuratForDisposisi.nomorSurat}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuratForDisposisi(null)}
                className="inline-block bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDisposisi} className="p-6 space-y-8 text-xs">
              {/* Info Surat */}
              <div className="rounded-xl bg-baznas-paper/40 p-3 border border-baznas-ink-8 space-y-1">
                <div className="flex justify-between">
                  <span className="text-baznas-ink/45">Asal Surat:</span>
                  <span className="font-semibold text-baznas-ink">{selectedSuratForDisposisi.pengirimTujuan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-baznas-ink/45">Perihal:</span>
                  <span className="font-semibold text-baznas-ink text-right">{selectedSuratForDisposisi.perihal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-baznas-ink/45">Tanggal Surat:</span>
                  <span className="font-semibold text-baznas-ink">{selectedSuratForDisposisi.tanggal}</span>
                </div>
              </div>

              {/* Target Disposisi */}
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">
                  Diteruskan Kepada (Wakil Ketua):
                </label>
                <select
                  value={tujuanDisposisi}
                  onChange={(e) => setTujuanDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-700 font-medium"
                >
                  <option value="Wakil Ketua 1 – Bidang Pengumpulan">
                    Wakil Ketua 1 – Husain Dima (Bidang Pengumpulan)
                  </option>
                  <option value="Wakil Ketua 2 – Bidang Pendistribusian & Pendayagunaan">
                    Wakil Ketua 2 – Riton Ma&apos;ruf (Bidang Pendistribusian &amp; Pendayagunaan)
                  </option>
                  <option value="Wakil Ketua 3 – Bidang Keuangan & Pelaporan">
                    Wakil Ketua 3 – Hi. Mansyur Ronosumitro, S.Sos (Keuangan &amp; Pelaporan)
                  </option>
                  <option value="Wakil Ketua 4 – Bidang Administrasi, SDM & Umum">
                    Wakil Ketua 4 – Dr. Hi. Marwan, SH., MH. (Administrasi &amp; SDM)
                  </option>
                </select>
              </div>

              {/* Sifat Disposisi */}
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Sifat Disposisi:</label>
                <select
                  value={sifatDisposisi}
                  onChange={(e) => setSifatDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-700"
                >
                  <option value="Sangat Segera">Sangat Segera</option>
                  <option value="Penting & Segera">Penting &amp; Segera</option>
                  <option value="Biasa">Biasa</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>

              {/* Instruksi Disposisi */}
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Petunjuk / Instruksi Ketua:</label>
                <select
                  value={instruksiDisposisi}
                  onChange={(e) => setInstruksiDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-700 mb-2"
                >
                  <option value="Tindak lanjuti sesuai ketentuan">Tindak lanjuti sesuai ketentuan</option>
                  <option value="Pelajari dan buat telaah staf">Pelajari dan buat telaah staf</option>
                  <option value="Koordinasikan dengan pihak terkait">Koordinasikan dengan pihak terkait</option>
                  <option value="Siapkan draft jawaban surat">Siapkan draft jawaban surat</option>
                  <option value="Untuk diketahui dan arsipkan">Untuk diketahui dan arsipkan</option>
                </select>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">Catatan Tambahan Ketua:</label>
                <textarea
                  rows={3}
                  value={catatanDisposisi}
                  onChange={(e) => setCatatanDisposisi(e.target.value)}
                  placeholder="Instruksi spesifik atau batas waktu penyelesaian..."
                  className="w-full rounded-xl border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setSelectedSuratForDisposisi(null)}
                  className="rounded-xl border border-baznas-ink-8 px-4 py-2.5 text-xs font-semibold text-baznas-ink/65 hover:bg-baznas-paper/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan &amp; Tetapkan Disposisi
                </button>
              </div>
            </form>
        </Dialog>
      )}

      {/* MODAL KONFIRMASI TOLAK SPK (UX Plan §3.1) */}
      {(() => {
        const target = rejectSpkId ? pencairanList.find((p) => p.id === rejectSpkId) : null;
        return (
          <ConfirmDialog
            open={!!rejectSpkId}
            severity="danger"
            title="Tolak SPK Pencairan Dana"
            message={
              target
                ? `Anda akan MENOLAK pencairan ${target.nomorSPK} untuk program "${target.namaProgram}" senilai ${formatRupiah(target.nominal)} yang ditujukan kepada ${target.jumlahMustahik} mustahik. Mohon tuliskan alasan yang jelas agar Bidang II dapat merevisi pengajuan.`
                : ""
            }
            confirmLabel="Tolak SPK"
            cancelLabel="Batal"
            requireReason
            reasonLabel="Alasan penolakan"
            reasonMinLength={20}
            onConfirm={handleConfirmRejectSPK}
            onCancel={() => {
              setRejectSpkId(null);
              setRejectReason("");
            }}
          />
        );
      })()}

      {/* MODAL KONFIRMASI SETUJUI SPK (UX Plan §3.1) */}
      {(() => {
        const target = approveSpkId ? pencairanList.find((p) => p.id === approveSpkId) : null;
        return (
          <ConfirmDialog
            open={!!approveSpkId}
            severity="warning"
            title="Setujui Pencairan Dana"
            message={
              target
                ? `Anda akan MENYETUJUI pencairan ${target.nomorSPK} untuk program "${target.namaProgram}" senilai ${formatRupiah(target.nominal)} yang ditujukan kepada ${target.jumlahMustahik} mustahik. Dana akan diteruskan ke Bendahara Pengeluaran Bidang III (Keuangan) untuk proses pencairan.`
                : ""
            }
            confirmLabel="Setujui & Teruskan SPK"
            cancelLabel="Batal"
            affirmationLabel="Saya telah memverifikasi dokumen pendukung dan menyetujui pencairan dana ini sesuai kewenanganku sebagai Ketua BAZNAS."
            onConfirm={handleConfirmApproveSPK}
            onCancel={() => setApproveSpkId(null)}
          />
        );
      })()}

      {/* Toast Container — render global toast UI */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
