"use client";

import React, { useEffect } from "react";
import { SetoranZIS } from "@/lib/types";
import { formatRupiah, getTerbilangRupiah } from "@/lib/utils";
import { Printer, X, ShieldCheck, QrCode } from "lucide-react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { Star8, KhatRule, CornerBracket } from "@/components/brand/IslamicOrnament";

interface KwitansiZisPrintProps {
  setoran: SetoranZIS | null;
  onClose: () => void;
}

export const KwitansiZisPrint: React.FC<KwitansiZisPrintProps> = ({
  setoran,
  onClose,
}) => {
  // Listen to Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!setoran) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-baznas-ink/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white border border-baznas-ink-8 shadow-lift overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Floating Close Button — no rounded */}
        <button
          onClick={onClose}
          className="no-print absolute top-3 right-3 z-10 bg-rose-700 hover:bg-rose-800 text-white p-2 transition-colors"
          aria-label="Tutup pratinjau (ESC)"
          title="Tutup Pratinjau (ESC)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Action Header (Hidden saat Cetak) */}
        <div className="no-print flex flex-wrap items-center justify-between border-b border-baznas-ink-8 bg-baznas-paper px-6 py-3.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 bg-baznas-green-800 animate-pulse" aria-hidden="true" />
            <div>
              <h3 className="font-bold text-baznas-ink text-sm font-poppins">
                Pratinjau Bukti Setor Zakat (BSZ)
              </h3>
              <p className="text-[11px] text-baznas-ink/55">
                Format Resmi Standar BAZNAS RI · Tekan{" "}
                <kbd className="font-mono bg-white px-1.5 py-0.5 border border-baznas-ink-12 text-[10px] font-bold text-baznas-ink">
                  ESC
                </kbd>{" "}
                untuk menutup
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kwitansi (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 border border-baznas-ink-20 hover:bg-rose-50 hover:border-rose-700 hover:text-rose-700 px-3.5 py-2 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
            >
              <X className="h-4 w-4" />
              <span>Tutup Pratinjau</span>
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable Area) */}
        <div className="relative p-6 sm:p-8 bg-white print:p-0 print-page text-baznas-ink font-sans overflow-y-auto flex-1">
          {/* Frame ornament — only on screen, hidden on print */}
          <div className="no-print absolute inset-2 pointer-events-none text-baznas-gold-display opacity-50">
            <CornerBracket position="all" size={18} thickness={1.5} offset={0} />
          </div>

          {/* Kop Dokumen BAZNAS Resmi */}
          <div className="relative border-b-2 border-baznas-ink-900 pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <BAZNASMark
                  variant="mark"
                  size="lg"
                  className="text-baznas-green-900 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-baznas-green-900 font-poppins leading-tight">
                    Badan Amil Zakat Nasional
                  </h2>
                  <p className="text-[11px] font-semibold text-baznas-ink/70">
                    Lembaga Pemerintah Nonstruktural Pengelola Zakat — UU No. 23/2011
                  </p>
                  <p className="text-[10px] text-baznas-ink/55 mt-0.5">
                    Jl. Kantor BAZNAS No. 123 · Telp: (0431) 889900 · layanan@baznas.go.id
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="border border-baznas-ink-20 bg-baznas-paper px-3 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-baznas-ink/50 font-bold">
                    No. Bukti
                  </p>
                  <p className="text-sm font-extrabold font-mono text-baznas-green-900 editorial-num leading-none mt-0.5">
                    {setoran.buktiNo}
                  </p>
                </div>
                <p className="text-[10px] text-baznas-ink/55 mt-1.5">
                  Tgl: <strong className="text-baznas-ink">{setoran.tanggal}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Judul Kwitansi */}
          <div className="text-center my-4">
            <div className="flex items-center justify-center gap-3 mb-2 text-baznas-gold-display" aria-hidden="true">
              <Star8 size={12} />
              <span className="h-px w-12 bg-baznas-gold-display" />
              <Star8 size={12} />
            </div>
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-baznas-ink font-poppins">
              Bukti Setor Zakat (BSZ) &amp; Infak/Sedekah
            </h1>
            <p className="text-[10px] text-baznas-ink/55 mt-1.5 uppercase tracking-wider">
              Kwitansi Sah Pengurang Penghasilan Bruto Wajib Pajak · UU PPh Pasal 22
            </p>
          </div>

          {/* Rincian Identitas Muzakki / Penyetor — formal box, no rounded */}
          <div className="border-l-4 border-baznas-gold-display bg-baznas-paper/40 p-3.5 mb-4 text-xs space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-baznas-ink/55 font-medium uppercase tracking-wider text-[10px]">
                Telah Diterima Dari
              </span>
              <span className="sm:col-span-2 font-bold text-baznas-ink">
                {setoran.namaMuzakki}
                {setoran.tipeMuzakki === "opd" ? (
                  <span className="ml-1 text-baznas-green-900 font-semibold">(Instansi / OPD)</span>
                ) : null}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-baznas-ink/55 font-medium uppercase tracking-wider text-[10px]">
                NPWZ
              </span>
              <span className="sm:col-span-2 font-mono font-semibold text-baznas-green-900 editorial-num">
                {setoran.npwz || "NPWZ-7171-TERCATAT"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-baznas-ink/55 font-medium uppercase tracking-wider text-[10px]">
                NIK / No. Identitas
              </span>
              <span className="sm:col-span-2 font-mono text-baznas-ink">
                {setoran.nik || "—"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-baznas-ink/55 font-medium uppercase tracking-wider text-[10px]">
                Instansi / Unit Kerja
              </span>
              <span className="sm:col-span-2 text-baznas-ink">{setoran.instansi}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-baznas-ink/55 font-medium uppercase tracking-wider text-[10px]">
                Metode Pembayaran
              </span>
              <span className="sm:col-span-2 text-baznas-ink font-semibold">
                {setoran.metode === "tunai"
                  ? "Tunai (Loket Kasir Kantor BAZNAS)"
                  : `Transfer Bank (${setoran.bank || "Rekening Resmi BAZNAS"})`}
              </span>
            </div>
          </div>

          {/* Tabel Rincian Setoran — formal table with ink borders */}
          <table className="w-full text-xs border-collapse border border-baznas-ink mb-4">
            <thead>
              <tr className="bg-baznas-ink text-white font-bold">
                <th className="border border-baznas-ink px-3 py-2 text-center w-10 font-bold">
                  No
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-left font-bold">
                  Uraian / Jenis Penerimaan ZIS
                </th>
                <th className="border border-baznas-ink px-3 py-2 text-right w-40 font-bold">
                  Nominal (Rp)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-baznas-ink px-3 py-2.5 text-center font-bold text-baznas-ink">
                  1
                </td>
                <td className="border border-baznas-ink px-3 py-2.5">
                  <p className="font-bold text-baznas-ink">{setoran.jenisLabel}</p>
                  {setoran.gajiDasar && (
                    <p className="text-[11px] text-baznas-ink/70 mt-0.5">
                      Dasar Perhitungan Nisab/Gaji: {formatRupiah(setoran.gajiDasar)} ×{" "}
                      {setoran.persen || 2.5}%
                    </p>
                  )}
                  {setoran.keterangan && (
                    <p className="text-[11px] text-baznas-ink/55 italic mt-0.5">
                      Catatan / Peruntukan: {setoran.keterangan}
                    </p>
                  )}
                </td>
                <td className="border border-baznas-ink px-3 py-2.5 text-right font-bold text-baznas-ink text-sm editorial-num">
                  {formatRupiah(setoran.nominal)}
                </td>
              </tr>
              <tr className="bg-baznas-paper">
                <td
                  colSpan={2}
                  className="border border-baznas-ink px-3 py-2 text-right uppercase text-baznas-ink/80 font-bold tracking-wider"
                >
                  Total Penerimaan
                </td>
                <td className="border border-baznas-ink px-3 py-2 text-right text-baznas-green-900 text-base font-extrabold editorial-num">
                  {formatRupiah(setoran.nominal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Kotak Terbilang — gold accent, formal */}
          <div className="border border-baznas-ink-20 bg-baznas-paper p-3 mb-4 text-xs">
            <span className="font-bold text-baznas-green-900 uppercase tracking-wider text-[10px] block mb-0.5">
              Terbilang
            </span>
            <span className="italic font-semibold text-baznas-ink capitalize">
              &ldquo;{getTerbilangRupiah(setoran.nominal)} Rupiah&rdquo;
            </span>
          </div>

          {/* Doa Muzakki & Amil (Akad Ijab Qobul) — refined */}
          <div className="border border-baznas-ink-8 p-3 mb-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-gold-display block mb-1">
              Doa Amil Penerima Zakat untuk Muzakki
            </span>
            <p className="text-xs text-baznas-green-900 italic font-serif leading-relaxed">
              &ldquo;Aajarokallahu fiima a&apos;thoita, wa baaraka fiima abqoita,
              waja&apos;alahu laka thohuran.&rdquo;
            </p>
            <p className="text-[10px] text-baznas-ink/55 mt-1">
              (Semoga Allah memberi pahala atas apa yang engkau berikan, memberkahi
              harta yang tersisa, dan menjadikannya suci bagimu)
            </p>
          </div>

          {/* Kolom Tanda Tangan Resmi & QR Verifikasi */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs pt-3 border-t border-baznas-ink-20 items-end">
            <div>
              <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-12">
                Muzakki / Penyetor
              </p>
              <p className="font-bold text-baznas-ink border-t border-baznas-ink pt-1.5">
                {setoran.namaMuzakki}
              </p>
              <span className="text-[10px] text-baznas-ink/45 block mt-0.5">
                Tanda tangan di atas materai
              </span>
            </div>

            {/* QR Verifikasi Keabsahan & Stempel */}
            <div className="flex flex-col items-center justify-end">
              <div className="flex flex-col items-center justify-center p-2 border border-baznas-ink-20 bg-white">
                <QrCode className="h-12 w-12 text-baznas-ink" />
                <span className="text-[9px] font-mono text-baznas-ink/55 mt-1 editorial-num">
                  VALID: BAZNAS-ZIS
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] text-baznas-green-900 font-bold mt-1.5">
                <ShieldCheck className="h-3 w-3" />
                Terverifikasi Sistem
              </span>
            </div>

            <div>
              <p className="text-baznas-ink/55 uppercase tracking-wider text-[10px] font-bold mb-12">
                Petugas Amil Penerima
              </p>
              <p className="font-bold text-baznas-ink border-t border-baznas-ink pt-1.5">
                {setoran.petugasAmil}
              </p>
              <span className="text-[10px] text-baznas-ink/55 block mt-0.5">
                Amil BAZNAS · NIP. 2026.0142
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print border-t border-baznas-ink-8 bg-baznas-paper px-6 py-3 flex items-center justify-between">
          <p className="text-[11px] text-baznas-ink/55">
            Kwitansi ini otomatis disimpan pada arsip transaksi digital BAZNAS.
          </p>
          <button
            onClick={onClose}
            className="border border-baznas-ink-20 hover:border-baznas-ink-40 hover:bg-baznas-paper px-4 py-2 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};

export default KwitansiZisPrint;
