"use client";

import React, { useState } from "react";
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
} from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel-utils";
import {
  FileText,
  Send,
  Printer,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Building,
  Users,
  Coins,
  HeartHandshake,
  TrendingUp,
  FolderArchive,
  AlertCircle,
  ChevronRight,
  Filter,
  Check,
  XCircle,
  Layers,
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
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<KetuaTab>("disposisi");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: KetuaTab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  // State Disposisi Modal
  const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<Surat | null>(null);
  const [tujuanDisposisi, setTujuanDisposisi] = useState("Wakil Ketua 1 – Bidang Pengumpulan");
  const [sifatDisposisi, setSifatDisposisi] = useState("Penting & Segera");
  const [instruksiDisposisi, setInstruksiDisposisi] = useState("Tindak lanjuti sesuai ketentuan");
  const [catatanDisposisi, setCatatanDisposisi] = useState("");

  // Modal Tolak SPK
  const [rejectSpkId, setRejectSpkId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  // Submit Penolakan SPK
  const handleConfirmRejectSPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectSpkId) return;

    if (onRejectSPK) {
      onRejectSPK(rejectSpkId, rejectReason || "Berkas administrasi / SKTM belum memenuhi syarat");
    } else {
      const target = pencairanList.find((p) => p.id === rejectSpkId);
      if (target) {
        target.status = "ditolak";
        target.catatanPenolakan = rejectReason || "Ditolak Ketua";
      }
    }

    setRejectSpkId(null);
    setRejectReason("");
  };

  const handleExportLaporanTerpadu = () => {
    const headers = ["Bidang", "Komponen / Indikator", "Volume / Jumlah", "Total Nominal (Rp)", "Keterangan"];
    const rows = [
      ["Bidang I (Pengumpulan)", "Penerimaan ZIS & DSKL", `${setoranList.length} Transaksi`, totalPenerimaanZIS, "Kas Masuk Loket & Bank"],
      ["Bidang I (Pengumpulan)", "Muzakki Terdaftar", `${muzakkiList.length} Jiwa`, 0, "Basis NIK & NPWZ Resmi"],
      ["Bidang II (Pendistribusian)", "Dana Penyaluran Disetujui", `${pencairanList.filter(p => p.status === "disetujui_ketua" || p.status === "dikonfirmasi_bidang2").length} Program SPK`, totalPenyaluranDisetujui, "Mustahik Desil 1 s/d Desil 4"],
      ["Bidang II (Pendistribusian)", "Mustahik Terdata", `${mustahikList.length} KK/Jiwa`, 0, "Asnaf Fakir Miskin dll"],
      ["Bidang III (Keuangan)", "Total Pagu RKAT Berjalan", `${rkatList.length} Pos Anggaran`, totalPaguRKAT, "Rencana Kerja Tahunan"],
      ["Bidang III (Keuangan)", "Realisasi Serapan Anggaran", `${Math.round((totalRealisasiRKAT / totalPaguRKAT) * 100)}% Terserap`, totalRealisasiRKAT, "Sesuai PSAK 109"],
      ["Bidang IV (Administrasi)", "Surat Masuk & Keluar", `${suratList.length} Berkas`, 0, `${suratSudahDisposisi} Sudah Didisposisi Ketua`],
      ["Bidang IV (Administrasi)", "SDM & Amil Aktif", `${pegawaiList.length} Personel`, 0, "Pimpinan & Staf Pelaksana"],
      ["Bidang IV (Administrasi)", "Inventaris Aset BAZNAS", `${asetList.length} Unit Barang`, totalNilaiAset, "Kondisi Fisik Terverifikasi"],
    ];
    exportToExcel("Laporan_Terpadu_Ketua_BAZNAS", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Ketua */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-baznas-green-800 to-baznas-green-950 p-3 text-white shadow-md">
            <ShieldCheck className="h-7 w-7 text-baznas-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-poppins">
                Dashboard Pimpinan — Ketua BAZNAS
              </h1>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-baznas-green-900 border border-emerald-200">
                Pimpinan Tertinggi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pejabat: <span className="font-semibold text-slate-700">Mohamad Husain Rauf</span> (Ketua BAZNAS) — Otoritas Disposisi Surat Masuk, Persetujuan SPK Bantuan, &amp; Pengawasan Laporan
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TAB DISPOSISI SURAT MASUK (BIDANG IV) */}
      {/* ============================================================ */}
      {activeTab === "disposisi" && (
        <div className="space-y-6">
          {/* Ringkasan Disposisi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Surat Masuk
                </span>
                <p className="text-2xl font-bold text-slate-900 font-poppins mt-1">
                  {suratMasukList.length} <span className="text-sm font-normal text-slate-500">Berkas</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Diinput oleh Bidang IV (Administrasi)</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Menunggu Disposisi Ketua
                </span>
                <p className="text-2xl font-bold text-amber-900 font-poppins mt-1">
                  {suratBelumDisposisi} <span className="text-sm font-normal text-amber-700">Berkas</span>
                </p>
                <p className="text-[11px] text-amber-700 mt-1">Memerlukan instruksi pimpinan</p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 text-amber-800">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Selesai Didisposisi
                </span>
                <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-1">
                  {suratSudahDisposisi} <span className="text-sm font-normal text-emerald-700">Berkas</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">Diteruskan ke Waka terkait</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Tabel Surat Masuk */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-poppins">
                  Agenda Surat Masuk untuk Disposisi
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar surat resmi yang masuk ke BAZNAS untuk diberi lembar arahan dan disposisi Ketua
                </p>
              </div>

              {/* Filter Status Disposisi */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filterStatusSurat}
                  onChange={(e) => setFilterStatusSurat(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">Semua Status Surat</option>
                  <option value="belum_disposisi">Menunggu Disposisi</option>
                  <option value="sudah_disposisi">Sudah Didisposisi</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100">
                  {suratMasukFiltered.map((surat) => (
                    <tr key={surat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{surat.nomorSurat}</span>
                        <span className="text-[11px] text-slate-400">{surat.tanggal}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{surat.pengirimTujuan}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={surat.perihal}>
                        {surat.perihal}
                      </td>
                      <td className="py-3.5 px-4">
                        {surat.statusDisposisi === "sudah_disposisi" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-baznas-green-900">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Sudah Didisposisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Menunggu Disposisi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {surat.tujuanDisposisi ? (
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[11px] inline-block">
                            {surat.tujuanDisposisi}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ditentukan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {surat.instruksiDisposisi ? (
                          <div>
                            <span className="font-medium text-slate-800">{surat.instruksiDisposisi}</span>
                            {surat.catatanDisposisi && (
                              <p className="text-[10px] text-slate-500 truncate">{surat.catatanDisposisi}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDisposisiModal(surat)}
                          className="rounded-lg bg-baznas-green-800 hover:bg-baznas-green-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all shadow-xs"
                        >
                          {surat.statusDisposisi === "sudah_disposisi" ? "Ubah Disposisi" : "Beri Disposisi"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewDisposisi(surat)}
                          title="Cetak Lembar Disposisi Resmi A5"
                          className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-1.5 text-slate-600 transition-colors inline-flex items-center"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {suratMasukFiltered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
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
      {activeTab === "persetujuan_spk" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-baznas-green-900 font-poppins">
                Otorisasi Permohonan Pencairan Bantuan (SPK) Bidang II
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Ketua BAZNAS menyetujui atau menolak permohonan SPK yang diajukan oleh Wakil Ketua 2 / Staf Bidang II sebelum dikonfirmasi dan dicairkan oleh Bendahara Bidang III.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 text-xs font-bold">
              {pendingSpkCount} SPK Menunggu Persetujuan
            </span>
          </div>

          <div className="space-y-3">
            {pencairanList.map((p) => {
              const isPending = p.status === "diajukan";
              const isApprovedKetua = p.status === "disetujui_ketua";
              const isConfirmedBidang2 = p.status === "dikonfirmasi_bidang2";
              const isRejected = p.status === "ditolak";

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isPending
                      ? "border-amber-300 bg-amber-50/40 shadow-xs"
                      : isApprovedKetua
                      ? "border-blue-200 bg-blue-50/30"
                      : isConfirmedBidang2
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {p.nomorSPK}
                        </span>

                        {isPending && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Menunggu Otorisasi Ketua
                          </span>
                        )}

                        {isApprovedKetua && (
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold border border-blue-300 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Disetujui Ketua — Menunggu Konfirmasi Bidang II
                          </span>
                        )}

                        {isConfirmedBidang2 && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Telah Dikonfirmasi Lengkap (Siap Cair)
                          </span>
                        )}

                        {isRejected && (
                          <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold border border-rose-300 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ditolak Ketua
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                          {p.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {p.namaSubProgram}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 font-poppins">
                        {p.namaProgram}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{p.keterangan}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>Target: <strong className="text-slate-700">{p.jumlahMustahik} Mustahik</strong></span>
                        <span>Diajukan: <strong className="text-slate-700">{p.tanggal}</strong></span>
                        <span>Pemohon: <strong className="text-slate-700">{p.pemohon}</strong></span>
                        {p.approver && <span>Approver: <strong className="text-emerald-800">{p.approver}</strong></span>}
                      </div>

                      {p.catatanPenolakan && (
                        <div className="rounded-lg bg-rose-100/70 border border-rose-200 p-2 text-xs text-rose-800 font-semibold mt-1">
                          Alasan Penolakan: {p.catatanPenolakan}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:items-end justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block lg:text-right uppercase font-semibold">
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
                            className="flex items-center gap-1 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Tolak SPK
                          </button>

                          <button
                            onClick={() => {
                              if (onApproveSPK) {
                                onApproveSPK(p.id);
                              } else {
                                p.status = "disetujui_ketua";
                                p.approver = "Mohamad Husain Rauf (Ketua BAZNAS)";
                                setActiveTab("persetujuan_spk");
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20 transition-all"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Setujui SPK (Ketua)
                          </button>
                        </div>
                      )}

                      {isApprovedKetua && (
                        <span className="text-xs text-blue-700 bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-xl font-semibold">
                          Telah Disetujui • Menunggu Verifikasi Bidang II
                        </span>
                      )}

                      {isConfirmedBidang2 && (
                        <span className="text-xs text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-xl font-semibold">
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
      {activeTab === "laporan_semua" && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-md">
            <div>
              <h2 className="text-base font-bold font-poppins">
                Monitoring Laporan Konsolidasi 4 Bidang BAZNAS
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Pengawasan komprehensif penghimpunan, penyaluran, realisasi anggaran dan tata kelola kantor
              </p>
            </div>
            <button
              onClick={handleExportLaporanTerpadu}
              className="rounded-xl bg-baznas-gold-500 hover:bg-baznas-gold-600 px-4 py-2 text-xs font-bold text-slate-900 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Rekap Laporan (Excel)</span>
            </button>
          </div>

          {/* 4 Cards Ringkasan Bidang */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bidang 1 */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-green-800 uppercase tracking-wider">
                  Bidang I — Pengumpulan
                </span>
                <Coins className="h-5 w-5 text-baznas-green-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-poppins">
                  {formatRupiah(totalPenerimaanZIS)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Total ZIS &amp; DSKL Terhimpun</p>
              </div>
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Muzakki Terdaftar:</span>
                  <span className="font-bold text-slate-800">{muzakkiList.length} Jiwa</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaksi Masuk:</span>
                  <span className="font-bold text-slate-800">{setoranList.length} Lembar</span>
                </div>
              </div>
            </div>

            {/* Bidang 2 */}
            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Bidang II — Pendistribusian
                </span>
                <HeartHandshake className="h-5 w-5 text-rose-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-poppins">
                  {formatRupiah(totalPenyaluranDisetujui)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Dana Penyaluran SPK Disetujui</p>
              </div>
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Mustahik Desil 1–4:</span>
                  <span className="font-bold text-slate-800">{mustahikList.length} Mustahik</span>
                </div>
                <div className="flex justify-between">
                  <span>SPK Disetujui:</span>
                  <span className="font-bold text-slate-800">
                    {pencairanList.filter((p) => p.status === "disetujui_ketua" || p.status === "dikonfirmasi_bidang2").length} Berkas
                  </span>
                </div>
              </div>
            </div>

            {/* Bidang 3 */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Bidang III — Keuangan &amp; RKAT
                </span>
                <TrendingUp className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-poppins">
                  {Math.round((totalRealisasiRKAT / (totalPaguRKAT || 1)) * 100)}%
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Serapan Anggaran Berjalan</p>
              </div>
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Pagu Anggaran:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(totalPaguRKAT)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Realisasi Kas:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(totalRealisasiRKAT)}</span>
                </div>
              </div>
            </div>

            {/* Bidang 4 */}
            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Bidang IV — Administrasi &amp; SDM
                </span>
                <FolderArchive className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-poppins">
                  {pegawaiList.length} <span className="text-sm font-normal text-slate-500">Amil</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Personel &amp; Staf Operasional</p>
              </div>
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Surat Didisposisi:</span>
                  <span className="font-bold text-slate-800">{suratSudahDisposisi} Selesai</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Nilai Aset:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(totalNilaiAset)}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-baznas-green-900 to-baznas-green-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-poppins text-white">
                  Lembar Disposisi Ketua BAZNAS
                </h3>
                <p className="text-xs text-emerald-100/80">
                  Nomor Surat: {selectedSuratForDisposisi.nomorSurat}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuratForDisposisi(null)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDisposisi} className="p-6 space-y-4 text-xs">
              {/* Info Surat */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Asal Surat:</span>
                  <span className="font-semibold text-slate-800">{selectedSuratForDisposisi.pengirimTujuan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Perihal:</span>
                  <span className="font-semibold text-slate-800 text-right">{selectedSuratForDisposisi.perihal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Surat:</span>
                  <span className="font-semibold text-slate-800">{selectedSuratForDisposisi.tanggal}</span>
                </div>
              </div>

              {/* Target Disposisi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Diteruskan Kepada (Wakil Ketua):
                </label>
                <select
                  value={tujuanDisposisi}
                  onChange={(e) => setTujuanDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 font-medium"
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
                <label className="block font-bold text-slate-700 mb-1">Sifat Disposisi:</label>
                <select
                  value={sifatDisposisi}
                  onChange={(e) => setSifatDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
                >
                  <option value="Sangat Segera">Sangat Segera</option>
                  <option value="Penting & Segera">Penting &amp; Segera</option>
                  <option value="Biasa">Biasa</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>

              {/* Instruksi Disposisi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Petunjuk / Instruksi Ketua:</label>
                <select
                  value={instruksiDisposisi}
                  onChange={(e) => setInstruksiDisposisi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 mb-2"
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
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Ketua:</label>
                <textarea
                  rows={3}
                  value={catatanDisposisi}
                  onChange={(e) => setCatatanDisposisi(e.target.value)}
                  placeholder="Instruksi spesifik atau batas waktu penyelesaian..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSuratForDisposisi(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  Simpan &amp; Tetapkan Disposisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK SPK */}
      {rejectSpkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-poppins text-white">
                Alasan Penolakan SPK
              </h3>
              <button
                onClick={() => setRejectSpkId(null)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmRejectSPK} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Tuliskan catatan arahan atau dokumen yang masih perlu dilengkapi oleh tim Bidang II:
              </p>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Berkas pendukung SKTM / verifikasi faktual lapangan belum lengkap..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-600"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectSpkId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md"
                >
                  Tolak Pengajuan SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
