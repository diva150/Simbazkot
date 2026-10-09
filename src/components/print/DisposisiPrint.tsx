"use client";

import React from "react";
import { Surat } from "@/lib/types";
import { Printer, X } from "lucide-react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { Star8, KhatRule, CornerBracket } from "@/components/brand/IslamicOrnament";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-baznas-ink-8 shadow-lift overflow-hidden">
        {/* Action Header (no-print) */}
        <div className="no-print flex items-center justify-between border-b border-baznas-ink-8 bg-baznas-paper px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 bg-baznas-green-800 animate-pulse" aria-hidden="true" />
            <h3 className="font-bold text-baznas-ink text-sm font-poppins">
              Pratinjau Lembar Disposisi Surat
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              <Printer className="h-4 w-4" />
              Cetak Disposisi (Ctrl+P)
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

        {/* Lembar Disposisi Body */}
        <div className="relative p-7 bg-white print:p-0 print-page text-baznas-ink font-sans text-xs">
          {/* Frame ornament on screen only */}
          <div className="no-print absolute inset-2 pointer-events-none text-baznas-gold-display opacity-50">
            <CornerBracket position="all" size={16} thickness={1.5} offset={0} />
          </div>

          {/* Kop Disposisi */}
          <div className="text-center border-b-2 border-baznas-ink-900 pb-3 mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BAZNASMark variant="icon" size="sm" className="text-baznas-green-900" />
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-baznas-green-900 font-poppins">
              Badan Amil Zakat Nasional
            </h2>
            <h1 className="text-base font-extrabold uppercase tracking-wider mt-1 font-poppins text-baznas-ink">
              Lembar Disposisi Surat
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5 text-baznas-gold-display" aria-hidden="true">
              <Star8 size={10} />
              <span className="h-px w-16 bg-baznas-gold-display" />
              <Star8 size={10} />
            </div>
            <p className="text-[10px] text-baznas-ink/55 mt-1.5 uppercase tracking-wider">
              Sifat: [✓] Sangat Segera / Segera / [ ] Biasa
            </p>
          </div>

          {/* Rincian Surat — formal table, ink borders (prints crisp) */}
          <table className="w-full border-collapse border border-baznas-ink mb-3">
            <tbody>
              <tr>
                <td className="border border-baznas-ink p-2 font-bold w-1/4 bg-baznas-paper text-baznas-ink uppercase tracking-wider text-[10px]">
                  Surat Dari
                </td>
                <td className="border border-baznas-ink p-2 text-baznas-ink">
                  {surat.asalSurat || "Internal BAZNAS"}
                </td>
                <td className="border border-baznas-ink p-2 font-bold w-1/4 bg-baznas-paper text-baznas-ink uppercase tracking-wider text-[10px]">
                  Tanggal Diterima
                </td>
                <td className="border border-baznas-ink p-2 text-baznas-ink editorial-num">
                  {surat.tanggal}
                </td>
              </tr>
              <tr>
                <td className="border border-baznas-ink p-2 font-bold bg-baznas-paper text-baznas-ink uppercase tracking-wider text-[10px]">
                  Nomor Surat
                </td>
                <td className="border border-baznas-ink p-2 font-mono font-semibold text-baznas-ink editorial-num">
                  {surat.nomorSurat}
                </td>
                <td className="border border-baznas-ink p-2 font-bold bg-baznas-paper text-baznas-ink uppercase tracking-wider text-[10px]">
                  Nomor Agenda
                </td>
                <td className="border border-baznas-ink p-2 font-mono text-baznas-ink editorial-num">
                  AGD-2026/09/042
                </td>
              </tr>
              <tr>
                <td className="border border-baznas-ink p-2 font-bold bg-baznas-paper text-baznas-ink uppercase tracking-wider text-[10px]">
                  Perihal
                </td>
                <td colSpan={3} className="border border-baznas-ink p-2 font-semibold text-baznas-ink">
                  {surat.perihal}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Diteruskan Kepada & Instruksi */}
          <div className="grid grid-cols-2 border border-baznas-ink mb-3">
            {/* Kolom Diteruskan Kepada */}
            <div className="p-2.5 border-r border-baznas-ink">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-baznas-green-900 mb-1.5">
                Diteruskan Kepada Sdr.
              </p>
              <div className="space-y-1">
                {[
                  { label: "Wakil Ketua I (Pengumpulan)", match: "Wakil Ketua I" },
                  { label: "Wakil Ketua II (Pendistribusian)", match: "Wakil Ketua II" },
                  { label: "Wakil Ketua III (Keuangan)", match: "Wakil Ketua III" },
                  { label: "Wakil Ketua IV (SDM & Umum)", match: "Wakil Ketua IV" },
                  { label: "Sekretariat Pelaksana / TU", match: null },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-baznas-ink">
                    <input
                      type="checkbox"
                      defaultChecked={
                        !!opt.match && !!surat.disposisiTujuan?.includes(opt.match)
                      }
                      className="h-3.5 w-3.5 accent-baznas-green-800"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kolom Petunjuk / Instruksi */}
            <div className="p-2.5">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-baznas-green-900 mb-1.5">
                Petunjuk / Disposisi
              </p>
              <div className="space-y-1">
                {[
                  "Tindak lanjuti segera",
                  "Untuk diketahui / arsip",
                  "Hadiri / Wakili",
                  "Siapkan telaah / tanggapan",
                  "Bicarakan dengan saya",
                ].map((label) => (
                  <label key={label} className="flex items-center gap-2 text-baznas-ink">
                    <input
                      type="checkbox"
                      defaultChecked={label === "Tindak lanjuti segera"}
                      className="h-3.5 w-3.5 accent-baznas-green-800"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Catatan Pimpinan */}
          <div className="border border-baznas-ink p-3 min-h-[110px] mb-4">
            <p className="font-extrabold uppercase tracking-wider text-[10px] text-baznas-green-900 mb-1">
              Catatan / Arahan Ketua
            </p>
            <p className="italic text-baznas-ink text-xs mt-2 pl-2 leading-relaxed">
              {surat.catatanArahan
                ? `&ldquo;${surat.catatanArahan}&rdquo;`
                : "(Belum ada catatan khusus, lakukan tindak lanjut sesuai SOP bidang terkait.)"}
            </p>
          </div>

          {/* Tanda Tangan Ketua */}
          <div className="text-right mt-6 pr-4">
            <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-12">
              Ketua BAZNAS
            </p>
            <p className="font-extrabold text-baznas-ink underline underline-offset-4 decoration-baznas-gold-display decoration-2">
              Drs. KH. Muchsin Hermansyah, M.Pd.I
            </p>
            <p className="text-[10px] text-baznas-ink/55 mt-0.5">
              Ketua Pengurus BAZNAS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposisiPrint;
