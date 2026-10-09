"use client";

import React from "react";
import { ItemRKAT } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Printer, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Action Header */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Pratinjau Laporan Realisasi RKAT & Keuangan BAZNAS (A4 Landscape)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-baznas-green-800/20 hover:bg-baznas-green-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Laporan (Ctrl+P)
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 transition-colors"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Laporan Body */}
        <div className="p-8 bg-white print:p-0 print-page text-slate-900 font-sans text-xs">
          {/* Header Lembaga */}
          <div className="text-center border-b-2 border-baznas-green-800 pb-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-baznas-green-900 font-poppins">
              BADAN AMIL ZAKAT NASIONAL (BAZNAS)
            </h2>
            <h1 className="text-base font-bold uppercase tracking-wide mt-0.5 font-poppins text-slate-900">
              LAPORAN REALISASI RENCANA KERJA DAN ANGGARAN TAHUNAN (RKAT)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Periode: Januari s.d. September Tahun Anggaran 2026
            </p>
          </div>

          {/* Ringkasan Angka */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Pagu RKAT</span>
              <span className="text-sm font-bold text-slate-900">{formatRupiah(totalPagu)}</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-2.5 bg-emerald-50 border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Realisasi Terserap</span>
              <span className="text-sm font-bold text-baznas-green-800">{formatRupiah(totalRealisasi)}</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-2.5 bg-amber-50 border-amber-200">
              <span className="text-[10px] text-amber-800 font-semibold block uppercase">Sisa Pagu</span>
              <span className="text-sm font-bold text-amber-900">{formatRupiah(totalSisa)}</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-2.5 bg-blue-50 border-blue-200">
              <span className="text-[10px] text-blue-800 font-semibold block uppercase">Capaian Serapan</span>
              <span className="text-sm font-bold text-blue-900">{persentaseTotal}%</span>
            </div>
          </div>

          {/* Tabel Rincian Program */}
          <table className="w-full border-collapse border border-slate-300 text-xs mb-6">
            <thead>
              <tr className="bg-emerald-800 text-white font-semibold">
                <th className="border border-slate-300 px-2 py-2 text-center w-12">No</th>
                <th className="border border-slate-300 px-2 py-2 text-center w-20">Kode</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Nama Program Kerja & Bidang</th>
                <th className="border border-slate-300 px-3 py-2 text-right">Pagu RKAT (Rp)</th>
                <th className="border border-slate-300 px-3 py-2 text-right">Realisasi (Rp)</th>
                <th className="border border-slate-300 px-3 py-2 text-right">Sisa (Rp)</th>
                <th className="border border-slate-300 px-2 py-2 text-center w-16">%</th>
              </tr>
            </thead>
            <tbody>
              {rkatList.map((item, idx) => {
                const sisa = item.paguAnggaran - item.realisasi;
                const pct = Math.round((item.realisasi / item.paguAnggaran) * 100);
                return (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-300 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono">{item.kodeAkun}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      <p className="font-semibold text-slate-800">{item.namaProgram}</p>
                      <span className="text-[10px] text-slate-500">{item.bidang}</span>
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                      {formatRupiah(item.paguAnggaran)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold text-baznas-green-800">
                      {formatRupiah(item.realisasi)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-slate-600">
                      {formatRupiah(sisa)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="border border-slate-300 px-3 py-2.5 text-right">
                  TOTAL KESELURUHAN:
                </td>
                <td className="border border-slate-300 px-3 py-2.5 text-right">
                  {formatRupiah(totalPagu)}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 text-right text-baznas-green-800">
                  {formatRupiah(totalRealisasi)}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 text-right">
                  {formatRupiah(totalSisa)}
                </td>
                <td className="border border-slate-300 px-2 py-2.5 text-center text-baznas-green-800">
                  {persentaseTotal}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Blok Tanda Tangan Resmi */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs mt-8 pt-4 border-t border-slate-200">
            <div>
              <p className="text-slate-500 mb-16">Disusun Oleh,<br />Staf Akuntansi / Keuangan</p>
              <p className="font-bold underline">Rifky Pratama, S.Ak</p>
              <span className="text-[10px] text-slate-400 block">NIP. BAZNAS-202308</span>
            </div>
            <div>
              <p className="text-slate-500 mb-16">Diverifikasi Oleh,<br />Wakil Ketua III (Keuangan)</p>
              <p className="font-bold underline">Hj. Ratna Dewi, S.E., Ak., M.M</p>
              <span className="text-[10px] text-slate-400 block">NIP. BAZNAS-202203</span>
            </div>
            <div>
              <p className="text-slate-500 mb-16">Mengetahui & Menyetujui,<br />Ketua BAZNAS</p>
              <p className="font-bold underline">Drs. KH. Muchsin Hermansyah, M.Pd.I</p>
              <span className="text-[10px] text-slate-400 block">Ketua Pengurus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
