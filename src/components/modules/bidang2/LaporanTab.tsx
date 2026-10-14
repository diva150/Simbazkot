"use client";

import React from "react";
import { Download } from "lucide-react";

/**
 * LaporanTab — rekapitulasi penyaluran mustahik + Excel export.
 *
 * The actual export uses the parent's `handleExportMustahik` callback
 * (which dynamically imports xlsx to keep it out of the initial bundle).
 */
interface LaporanTabProps {
  onExport: () => void;
}

export const LaporanTab: React.FC<LaporanTabProps> = ({ onExport }) => {
  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-baznas-ink font-poppins">
            Laporan Rekapitulasi Penyaluran Mustahik
          </h3>
          <p className="text-xs text-baznas-ink/55">
            Daftar lengkap mustahik terdaftar dan total alokasi dana bantuan tersalurkan.
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Export Laporan ke Excel
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
