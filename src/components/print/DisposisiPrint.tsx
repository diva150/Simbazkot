"use client";

import React from "react";
import { Surat } from "@/lib/types";
import { Printer, X } from "lucide-react";

interface DisposisiPrintProps {
  surat: Surat | null;
  onClose: () => void;
}

export const DisposisiPrint: React.FC<DisposisiPrintProps> = ({
  surat,
  onClose,
}) => {
  if (!surat) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Action Header */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Pratinjau Lembar Disposisi Surat
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-baznas-green-800/20 hover:bg-baznas-green-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Disposisi (Ctrl+P)
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

        {/* Lembar Disposisi Body */}
        <div className="p-8 bg-white print:p-0 print-page text-slate-900 font-sans text-xs">
          {/* Kop Disposisi */}
          <div className="text-center border-b-2 border-black pb-3 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide font-poppins">
              BADAN AMIL ZAKAT NASIONAL (BAZNAS)
            </h2>
            <h1 className="text-base font-bold uppercase tracking-wider underline mt-1 font-poppins">
              LEMBAR DISPOSISI SURAT
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sifat: [✓] Sangat Segera / Segera / [ ] Biasa
            </p>
          </div>

          {/* Rincian Surat */}
          <table className="w-full border-collapse border border-black mb-3">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-semibold w-1/4 bg-slate-50">Surat Dari</td>
                <td className="border border-black p-2">{surat.asalSurat || "Internal BAZNAS"}</td>
                <td className="border border-black p-2 font-semibold w-1/4 bg-slate-50">Tanggal Diterima</td>
                <td className="border border-black p-2">{surat.tanggal}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-50">Nomor Surat</td>
                <td className="border border-black p-2 font-mono font-medium">{surat.nomorSurat}</td>
                <td className="border border-black p-2 font-semibold bg-slate-50">Nomor Agenda</td>
                <td className="border border-black p-2 font-mono">AGD-2026/09/042</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-50">Perihal</td>
                <td colSpan={3} className="border border-black p-2 font-medium">
                  {surat.perihal}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Diteruskan Kepada & Instruksi */}
          <div className="grid grid-cols-2 border border-black mb-3">
            {/* Kolom Diteruskan Kepada */}
            <div className="p-2 border-r border-black">
              <p className="font-bold underline mb-1.5">DITERUSKAN KEPADA SDR :</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={surat.disposisiTujuan?.includes("Wakil Ketua I")} className="rounded" />
                  <span>Wakil Ketua I (Pengumpulan)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={surat.disposisiTujuan?.includes("Wakil Ketua II")} className="rounded" />
                  <span>Wakil Ketua II (Pendistribusian)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={surat.disposisiTujuan?.includes("Wakil Ketua III")} className="rounded" />
                  <span>Wakil Ketua III (Keuangan)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={surat.disposisiTujuan?.includes("Wakil Ketua IV")} className="rounded" />
                  <span>Wakil Ketua IV (SDM & Umum)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Sekretariat Pelaksana / TU</span>
                </label>
              </div>
            </div>

            {/* Kolom Petunjuk / Instruksi */}
            <div className="p-2">
              <p className="font-bold underline mb-1.5">PETUNJUK / DISPOSISI :</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Tindak lanjuti segera</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Untuk diketahui / arsip</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Hadiri / Wakili</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Siapkan telaah / tanggapan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Bicarakan dengan saya</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kolom Catatan Pimpinan */}
          <div className="border border-black p-3 min-h-[100px] mb-4">
            <p className="font-bold underline mb-1">CATATAN / ARAHAN KETUA :</p>
            <p className="italic text-slate-800 text-xs mt-2 pl-2">
              {surat.catatanArahan ? `"${surat.catatanArahan}"` : "(Belum ada catatan khusus, lakukan tindak lanjut sesuai SOP bidang terkait)"}
            </p>
          </div>

          {/* Tanda Tangan Ketua */}
          <div className="text-right mt-6 pr-4">
            <p className="text-slate-600 mb-12">Ketua BAZNAS,</p>
            <p className="font-bold underline">Drs. KH. Muchsin Hermansyah, M.Pd.I</p>
          </div>
        </div>
      </div>
    </div>
  );
};
