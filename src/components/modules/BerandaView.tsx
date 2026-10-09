"use client";

import React from "react";
import { BidangType, SetoranZIS, PermohonanPencairan, Surat } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import {
  HandCoins,
  HeartHandshake,
  LineChart,
  FolderArchive,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface BerandaViewProps {
  onSelectBidang: (bidang: BidangType) => void;
  setoranList: SetoranZIS[];
  pencairanList: PermohonanPencairan[];
  suratList: Surat[];
  onViewKwitansi: (setoran: SetoranZIS) => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  onSelectBidang,
  setoranList,
  pencairanList,
  suratList,
  onViewKwitansi,
}) => {
  const pendingPencairan = pencairanList.filter((p) => p.status === "diajukan");
  const pendingSurat = suratList.filter(
    (s) => s.statusDisposisi === "belum_disposisi"
  );

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-baznas-green-900 via-baznas-green-800 to-emerald-800 p-6 sm:p-8 text-white shadow-lg shadow-baznas-green-900/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs mb-3 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-baznas-gold-500" />
            <span>Pusat Kendali Operasional Terpadu BAZNAS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-poppins text-white">
            Selamat Datang di Sistem Informasi BAZNAS
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Kelola penerimaan zakat muzakki, verifikasi mustahik, realisasi anggaran RKAT, dan kearsipan surat dalam satu tempat yang amanah, transparan, dan akuntabel.
          </p>
        </div>

        {/* Hiasan Dekoratif */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 h-40 w-40 rounded-full bg-baznas-gold-500/10 blur-xl pointer-events-none" />
      </div>

      {/* 4 Pintasan Cepat Bidang Kerja */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-poppins">
            Pintasan Langsung Bidang Kerja
          </h2>
          <span className="text-xs text-slate-400">Pilih modul tugas Anda</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bidang I */}
          <div
            onClick={() => onSelectBidang("bidang1")}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-baznas-green-600 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-baznas-green-700 group-hover:bg-baznas-green-800 group-hover:text-white transition-colors">
                <HandCoins className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-baznas-green-600 transition-colors" />
            </div>
            <span className="text-[11px] font-bold text-baznas-green-700 uppercase tracking-wide">
              Bidang I
            </span>
            <h3 className="text-base font-bold text-slate-900 font-poppins mt-0.5">
              Pengumpulan ZIS
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Input setoran ZIS, kalkulator zakat 2,5%, data muzakki, dan cetak tanda terima.
            </p>
          </div>

          {/* Bidang II */}
          <div
            onClick={() => onSelectBidang("bidang2")}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-baznas-green-600 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">
              Bidang II
            </span>
            <h3 className="text-base font-bold text-slate-900 font-poppins mt-0.5">
              Pendistribusian
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Data mustahik 4 pilar, survei kelayakan, serta permohonan pencairan bantuan.
            </p>
          </div>

          {/* Bidang III */}
          <div
            onClick={() => onSelectBidang("bidang3")}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-baznas-green-600 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <LineChart className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
              Bidang III
            </span>
            <h3 className="text-base font-bold text-slate-900 font-poppins mt-0.5">
              Keuangan & RKAT
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Evaluasi pagu vs realisasi RKAT, laporan arus kas, dan cetak LPJ resmi.
            </p>
          </div>

          {/* Bidang IV */}
          <div
            onClick={() => onSelectBidang("bidang4")}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-baznas-green-600 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FolderArchive className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
              Bidang IV
            </span>
            <h3 className="text-base font-bold text-slate-900 font-poppins mt-0.5">
              Administrasi & Aset
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Agenda surat masuk, cetak lembar disposisi pimpinan, SDM amil, dan inventaris kantor.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Angka Real-Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total ZIS Masuk
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +12.4%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
            Rp 1.482.350.000
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi per September 2026</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Telah Disalurkan
            </span>
            <span className="rounded-full bg-emerald-50 text-baznas-green-800 px-2 py-0.5 text-[10px] font-bold">
              75.5% Pagu
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
            Rp 1.120.400.000
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Untuk 4 pilar program utama</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Penerima Manfaat
            </span>
            <span className="text-xs font-semibold text-blue-600">Aktif</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-poppins mt-2">
            642 <span className="text-sm font-normal text-slate-500">Jiwa / KK</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Terverifikasi kelayakan SKTM</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Kas Tersedia
            </span>
            <span className="text-xs font-semibold text-emerald-700">Bank & Kas</span>
          </div>
          <p className="text-2xl font-bold text-baznas-green-800 font-poppins mt-2">
            Rp 361.950.000
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Siap disalurkan sesuai RKAT</p>
        </div>
      </div>

      {/* Widget Pengingat Tugas & Aktivitas Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2): Pengingat Tugas Tindak Lanjut */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 font-poppins">
                Pengingat Tugas Menunggu Tindak Lanjut
              </h3>
            </div>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
              {pendingPencairan.length + pendingSurat.length} Tugas
            </span>
          </div>

          <div className="space-y-3">
            {pendingPencairan.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectBidang("bidang2")}
                className="cursor-pointer flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 hover:bg-amber-100/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-500 p-2 text-white mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                      Persetujuan Pencairan Dana (Bidang II)
                    </span>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">
                      {p.namaProgram}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Diajukan: {formatRupiah(p.nominal)} untuk {p.jumlahMustahik} Mustahik • Tgl: {p.tanggal}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-800 bg-white border border-amber-300 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-amber-50">
                  Tinjau
                </button>
              </div>
            ))}

            {pendingSurat.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectBidang("bidang4")}
                className="cursor-pointer flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 hover:bg-blue-100/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-600 p-2 text-white mt-0.5">
                    <FolderArchive className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                      Surat Masuk Belum Disposisi (Bidang IV)
                    </span>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">
                      {s.nomorSurat} — Dari: {s.asalSurat}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      {s.perihal}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-blue-700 bg-white border border-blue-300 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-blue-50">
                  Disposisi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan (1): Transaksi Setoran Terkini */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 font-poppins">
              Setoran ZIS Terkini
            </h3>
            <button
              onClick={() => onSelectBidang("bidang1")}
              className="text-xs font-semibold text-baznas-green-700 hover:underline flex items-center gap-1"
            >
              Semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {setoranList.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {s.buktiNo}
                  </span>
                  <span className="text-[10px] text-slate-400">{s.tanggal}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {s.namaMuzakki}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                  <span className="text-[11px] text-slate-500">{s.jenisLabel}</span>
                  <span className="text-xs font-bold text-baznas-green-800">
                    {formatRupiah(s.nominal)}
                  </span>
                </div>
                <button
                  onClick={() => onViewKwitansi(s)}
                  className="mt-2 w-full text-center text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/80 py-1 rounded-lg transition-colors"
                >
                  Lihat Kwitansi Resmi
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
