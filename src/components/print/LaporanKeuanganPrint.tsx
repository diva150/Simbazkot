"use client";

import React from "react";
import { ItemRKAT } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { Star8, CornerBracket } from "@/components/brand/IslamicOrnament";

interface LaporanKeuanganPrintProps {
  rkatList: ItemRKAT[];
  onClose: () => void;
}

export const LaporanKeuanganPrint: React.FC<LaporanKeuanganPrintProps> = ({
  rkatList,
  onClose,
}) => {
  const totalPagu = rkatList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = rkatList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const persentaseTotal = Math.round((totalRealisasi / (totalPagu || 1)) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-baznas-ink-8 shadow-lift overflow-hidden">
        {/* Action Header (no-print) */}
        <div className="no-print flex items-center justify-between border-b border-baznas-ink-8 bg-baznas-paper px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 bg-baznas-green-800 animate-pulse" aria-hidden="true" />
            <h3 className="font-bold text-baznas-ink text-sm font-poppins">
              Pratinjau Laporan Realisasi RKAT &amp; Keuangan (A4 Landscape)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              <Printer className="h-4 w-4" />
              Cetak Laporan (Ctrl+P)
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center text-baznas-ink/50 hover:text-baznas-ink hover:bg-baznas-ink-8 h-t-target w-t-target transition-colors"
              aria-label="Tutup"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Laporan Body */}
        <div className="relative p-7 bg-white print:p-0 print-page text-baznas-ink font-sans text-xs">
          {/* Frame ornament on screen */}
          <div className="no-print absolute inset-2 pointer-events-none text-baznas-gold-display opacity-50">
            <CornerBracket position="all" size={18} thickness={1.5} offset={0} />
          </div>

          {/* Header Lembaga */}
          <div className="flex items-start justify-between border-b-2 border-baznas-ink-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <BAZNASMark variant="mark" size="lg" className="text-baznas-green-900 shrink-0" />
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-tight text-baznas-green-900 font-poppins leading-tight">
                  Badan Amil Zakat Nasional
                </h2>
                <p className="text-[10px] text-baznas-ink/55">
                  Lembaga Pemerintah Nonstruktural Pengelola Zakat
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-baznas-ink/50 font-bold">
                Dokumen Internal
              </p>
              <p className="text-sm font-extrabold uppercase tracking-wider text-baznas-ink font-poppins">
                Laporan RKAT
              </p>
            </div>
          </div>

          {/* Judul Laporan */}
          <div className="text-center my-3">
            <h1 className="text-base font-extrabold uppercase tracking-wider text-baznas-ink font-poppins">
              Laporan Realisasi Rencana Kerja &amp; Anggaran Tahunan (RKAT)
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5 text-baznas-gold-display" aria-hidden="true">
              <Star8 size={10} />
              <span className="h-px w-20 bg-baznas-gold-display" />
              <Star8 size={10} />
              <span className="h-px w-20 bg-baznas-gold-display" />
              <Star8 size={10} />
            </div>
            <p className="text-xs text-baznas-ink/70 mt-1.5">
              Periode: Januari s.d. September · Tahun Anggaran 2026
            </p>
          </div>

          {/* Ringkasan Angka — formal, no rounded, no shadow */}
          <div className="grid grid-cols-4 gap-0 mb-4 border border-baznas-ink-8">
            <div className="p-3 border-r border-baznas-ink-8 bg-baznas-paper/40">
              <span className="text-[10px] text-baznas-ink/55 font-bold block uppercase tracking-wider">
                Total Pagu RKAT
              </span>
              <span className="text-base font-extrabold text-baznas-ink editorial-num mt-1 block">
                {formatRupiah(totalPagu)}
              </span>
            </div>
            <div className="p-3 border-r border-baznas-ink-8">
              <span className="text-[10px] text-baznas-ink/55 font-bold block uppercase tracking-wider">
                Realisasi Terserap
              </span>
              <span className="text-base font-extrabold text-baznas-green-900 editorial-num mt-1 block">
                {formatRupiah(totalRealisasi)}
              </span>
            </div>
            <div className="p-3 border-r border-baznas-ink-8 bg-baznas-paper/40">
              <span className="text-[10px] text-baznas-ink/55 font-bold block uppercase tracking-wider">
                Sisa Pagu
              </span>
              <span className="text-base font-extrabold text-baznas-ink editorial-num mt-1 block">
                {formatRupiah(totalSisa)}
              </span>
            </div>
            <div className="p-3 bg-baznas-ink text-white">
              <span className="text-[10px] text-baznas-gold-display font-bold block uppercase tracking-wider">
                Capaian Serapan
              </span>
              <span className="text-base font-extrabold editorial-num mt-1 block">
                {persentaseTotal}%
              </span>
            </div>
          </div>

          {/* Tabel Rincian Program — formal table, ink borders */}
          <table className="w-full border-collapse border border-baznas-ink text-xs mb-6">
            <thead>
              <tr className="bg-baznas-ink text-white">
                <th className="border border-baznas-ink px-2 py-2 text-center w-12 font-bold">
                  No
                </th>
                <th className="border border-baznas-ink px-2 py-2 text-center w-20 font-bold">
                  Kode
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-left font-bold">
                  Nama Program Kerja &amp; Bidang
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-right font-bold">
                  Pagu RKAT (Rp)
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-right font-bold">
                  Realisasi (Rp)
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-right font-bold">
                  Sisa (Rp)
                </th>
                <th className="border border-baznas-ink px-2 py-2 text-center w-16 font-bold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {rkatList.map((item, idx) => {
                const sisa = item.paguAnggaran - item.realisasi;
                const pct = Math.round((item.realisasi / item.paguAnggaran) * 100);
                return (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-baznas-paper/30"}>
                    <td className="border border-baznas-ink px-2 py-2 text-center text-baznas-ink">
                      {idx + 1}
                    </td>
                    <td className="border border-baznas-ink px-2 py-2 text-center font-mono text-baznas-ink editorial-num">
                      {item.kodeAkun}
                    </td>
                    <td className="border border-baznas-ink px-3 py-2">
                      <p className="font-bold text-baznas-ink">{item.namaProgram}</p>
                      <span className="text-[10px] text-baznas-ink/55 uppercase tracking-wider">
                        {item.bidang}
                      </span>
                    </td>
                    <td className="border border-baznas-ink px-3 py-2 text-right text-baznas-ink editorial-num font-medium">
                      {formatRupiah(item.paguAnggaran)}
                    </td>
                    <td className="border border-baznas-ink px-3 py-2 text-right font-bold text-baznas-green-900 editorial-num">
                      {formatRupiah(item.realisasi)}
                    </td>
                    <td className="border border-baznas-ink px-3 py-2 text-right text-baznas-ink/70 editorial-num">
                      {formatRupiah(sisa)}
                    </td>
                    <td className="border border-baznas-ink px-2 py-2 text-center font-bold text-baznas-ink editorial-num">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-baznas-ink text-white font-extrabold">
                <td
                  colSpan={3}
                  className="border border-baznas-ink px-3 py-2.5 text-right uppercase tracking-wider"
                >
                  Total Keseluruhan
                </td>
                <td className="border border-baznas-ink px-3 py-2.5 text-right editorial-num">
                  {formatRupiah(totalPagu)}
                </td>
                <td className="border border-baznas-ink px-3 py-2.5 text-right editorial-num text-baznas-gold-display">
                  {formatRupiah(totalRealisasi)}
                </td>
                <td className="border border-baznas-ink px-3 py-2.5 text-right editorial-num">
                  {formatRupiah(totalSisa)}
                </td>
                <td className="border border-baznas-ink px-2 py-2.5 text-center editorial-num text-baznas-gold-display">
                  {persentaseTotal}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan kaki */}
          <p className="text-[10px] text-baznas-ink/55 italic mb-6 leading-relaxed">
            Catatan: Laporan ini disusun berdasarkan data transaksi per{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}, diaudit sesuai PSAK 109, dan dapat diverifikasi melalui sistem
            arsip digital BAZNAS.
          </p>

          {/* Blok Tanda Tangan Resmi */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs mt-8 pt-4 border-t-2 border-baznas-ink-900">
            <div>
              <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-16">
                Disusun Oleh
                <br />
                Staf Akuntansi / Keuangan
              </p>
              <p className="font-extrabold text-baznas-ink border-t border-baznas-ink pt-1.5">
                Rifky Pratama, S.Ak
              </p>
              <span className="text-[10px] text-baznas-ink/55 block mt-0.5 editorial-num">
                NIP. BAZNAS-202308
              </span>
            </div>
            <div>
              <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-16">
                Diverifikasi Oleh
                <br />
                Wakil Ketua III (Keuangan)
              </p>
              <p className="font-extrabold text-baznas-ink border-t border-baznas-ink pt-1.5">
                Hj. Ratna Dewi, S.E., Ak., M.M
              </p>
              <span className="text-[10px] text-baznas-ink/55 block mt-0.5 editorial-num">
                NIP. BAZNAS-202203
              </span>
            </div>
            <div>
              <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-16">
                Mengetahui &amp; Menyetujui
                <br />
                Ketua BAZNAS
              </p>
              <p className="font-extrabold text-baznas-ink border-t border-baznas-ink pt-1.5">
                Drs. KH. Muchsin Hermansyah, M.Pd.I
              </p>
              <span className="text-[10px] text-baznas-ink/55 block mt-0.5">
                Ketua Pengurus BAZNAS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanKeuanganPrint;
