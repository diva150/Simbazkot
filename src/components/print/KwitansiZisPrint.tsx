"use client";

import React, { useEffect } from "react";
import { SetoranZIS } from "@/lib/types";
import { formatRupiah, getTerbilangRupiah } from "@/lib/utils";
import { Printer, X, CheckCircle, ShieldCheck, QrCode } from "lucide-react";

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
      if (e.key === "Escape") {
        onClose();
      }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-300 my-auto flex flex-col max-h-[95vh]">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-3 right-3 z-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white p-2 shadow-lg transition-transform hover:scale-105"
          title="Tutup Pratinjau (ESC)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Action Header (Hidden saat Cetak) */}
        <div className="no-print flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-100/90 px-6 py-3.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-poppins">
                Pratinjau Bukti Setor Zakat (BSZ)
              </h3>
              <p className="text-[11px] text-slate-500">
                Format Resmi Standar BAZNAS RI • Tekan <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[10px] font-bold">ESC</kbd> untuk menutup
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-baznas-green-800/25 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kwitansi (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-700 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Tutup Pratinjau</span>
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable Area) */}
        <div className="p-6 sm:p-8 bg-white print:p-0 print-page text-slate-900 font-sans overflow-y-auto flex-1">
          {/* Kop Dokumen BAZNAS Resmi */}
          <div className="border-b-2 border-baznas-green-800 pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-baznas-green-900 to-baznas-green-700 text-white font-black text-2xl font-poppins shadow-md">
                  B
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-baznas-green-900 font-poppins leading-tight">
                    BADAN AMIL ZAKAT NASIONAL (BAZNAS)
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Lembaga Pemerintah Nonstruktural Pengelola Zakat Resmi Berdasarkan UU No. 23/2011
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Jl. Kantor BAZNAS No. 123 • Telp: (0431) 889900 • Email: layanan@baznas.go.id • www.baznas.go.id
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block rounded-lg bg-emerald-100/80 border border-emerald-300 px-3 py-1 text-xs font-black font-mono text-baznas-green-900 shadow-2xs">
                  {setoran.buktiNo}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tgl: <strong>{setoran.tanggal}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Judul Kwitansi */}
          <div className="text-center my-3">
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 underline decoration-baznas-gold-500 decoration-2 underline-offset-4 font-poppins">
              BUKTI SETOR ZAKAT (BSZ) &amp; INFAK / SEDEKAH
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
              Kwitansi Sah Pengurang Penghasilan Bruto Wajib Pajak (UU PPh Pasal 22)
            </p>
          </div>

          {/* Rincian Identitas Muzakki / Penyetor */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 mb-4 text-xs space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-slate-500 font-medium">Telah Diterima Dari</span>
              <span className="sm:col-span-2 font-bold text-slate-900">
                : {setoran.namaMuzakki} {setoran.tipeMuzakki === "opd" ? "(Instansi / OPD)" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-slate-500 font-medium">NPWZ (Nomor Pokok Wajib Zakat)</span>
              <span className="sm:col-span-2 font-mono font-semibold text-baznas-green-900">
                : {setoran.npwz || "NPWZ-7171-TERCATAT"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-slate-500 font-medium">NIK / No. Identitas</span>
              <span className="sm:col-span-2 font-mono text-slate-800">
                : {setoran.nik || "-"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-slate-500 font-medium">Instansi / Unit Kerja</span>
              <span className="sm:col-span-2 text-slate-800">
                : {setoran.instansi}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-slate-500 font-medium">Metode Pembayaran</span>
              <span className="sm:col-span-2 text-slate-800 font-medium capitalize">
                : {setoran.metode === "tunai" ? "Tunai (Loket Kasir Kantor BAZNAS)" : `Transfer Bank (${setoran.bank || "Rekening Resmi BAZNAS"})`}
              </span>
            </div>
          </div>

          {/* Tabel Rincian Setoran */}
          <table className="w-full text-xs border-collapse border border-slate-300 mb-4">
            <thead>
              <tr className="bg-emerald-100/70 text-baznas-green-900 font-bold">
                <th className="border border-slate-300 px-3 py-2 text-center w-10">No</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Uraian / Jenis Penerimaan ZIS</th>
                <th className="border border-slate-300 px-3 py-2 text-right w-40">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-2.5 text-center font-semibold">1</td>
                <td className="border border-slate-300 px-3 py-2.5">
                  <p className="font-bold text-slate-900">{setoran.jenisLabel}</p>
                  {setoran.gajiDasar && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Dasar Perhitungan Nisab/Gaji: {formatRupiah(setoran.gajiDasar)} x {setoran.persen || 2.5}%
                    </p>
                  )}
                  {setoran.keterangan && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      Catatan / Peruntukan: {setoran.keterangan}
                    </p>
                  )}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 text-right font-bold text-slate-900 text-sm">
                  {formatRupiah(setoran.nominal)}
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right uppercase text-slate-700">
                  TOTAL PENERIMAAN:
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right text-baznas-green-900 text-base font-black">
                  {formatRupiah(setoran.nominal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Kotak Terbilang */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-4 text-xs">
            <span className="font-bold text-baznas-green-900">Terbilang: </span>
            <span className="italic font-semibold text-slate-800 capitalize">
              &quot;{getTerbilangRupiah(setoran.nominal)} Rupiah&quot;
            </span>
          </div>

          {/* Doa Muzakki & Amil (Akad Ijab Qobul) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-green-800 block mb-1">
              Doa Amil Penerima Zakat untuk Muzakki
            </span>
            <p className="text-xs text-emerald-900 italic font-serif leading-relaxed">
              &quot;Aajarokallahu fiima a&apos;thoita, wa baaraka fiima abqoita, waja&apos;alahu laka thohuran.&quot;
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              (Semoga Allah memberikan pahala atas apa yang telah engkau berikan, memberkahi harta yang engkau simpan, dan menjadikannya suci bagimu)
            </p>
          </div>

          {/* Kolom Tanda Tangan Resmi & QR Verifikasi */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs pt-2 border-t border-slate-200 items-end">
            <div>
              <p className="text-slate-600 mb-12">Muzakki / Penyetor,</p>
              <p className="font-bold text-slate-900 underline">{setoran.namaMuzakki}</p>
              <span className="text-[10px] text-slate-400 block">Tanda Tangan / Penyetor</span>
            </div>

            {/* QR Verifikasi Keabsahan & Stempel */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <QrCode className="h-12 w-12 text-slate-700" />
                <span className="text-[9px] font-mono text-slate-500 mt-1">VALID: BAZNAS-ZIS</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1">
                <ShieldCheck className="h-3 w-3" />
                Terverifikasi Sistem
              </span>
            </div>

            <div>
              <p className="text-slate-600 mb-12">Petugas Amil Penerima,</p>
              <p className="font-bold text-slate-900 underline">{setoran.petugasAmil}</p>
              <span className="text-[10px] text-slate-500 block">Amil BAZNAS • NIP: 2026.0142</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Kwitansi ini otomatis disimpan pada arsip transaksi digital BAZNAS.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
