"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";

interface DashboardTabProps {
  rkatList: { paguAnggaran: number; realisasi: number }[];
}

/**
 * Read-only Financial Dashboard for Bidang III.
 * Per spec: no CRUD allowed here.
 */
export const DashboardTab: React.FC<DashboardTabProps> = ({ rkatList }) => {
  const totalPagu = rkatList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = rkatList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const persentaseTotal = Math.round((totalRealisasi / (totalPagu || 1)) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* JUMBO stat — Total Pagu RKAT (dark) */}
        <div className="lg:col-span-7 relative bg-baznas-ink text-white p-8 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-baznas-gold-display" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold">
              Total Pagu RKAT
            </span>
          </div>
          <p className="display-1 editorial-num text-white leading-none">
            {formatRupiah(totalPagu)}
          </p>
          <p className="mt-4 text-sm text-white/55">
            Tahun Anggaran 2026 · Total {rkatList.length} program kerja lintas bidang
          </p>
        </div>

        {/* 3 MEDIUM stats */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="bg-white border border-baznas-ink-8 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
              Realisasi Terserap
            </p>
            <p className="display-3 editorial-num text-baznas-green-900">
              {persentaseTotal}%
            </p>
            <p className="text-[11px] text-baznas-ink/55 mt-1.5">
              {formatRupiah(totalRealisasi)}
            </p>
          </div>

          <div className="bg-white border border-baznas-ink-8 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
              Sisa Pagu
            </p>
            <p className="display-3 editorial-num text-baznas-ink">
              {formatRupiah(totalSisa)}
            </p>
            <p className="text-[11px] text-baznas-ink/55 mt-1.5">
              Alokasi penyaluran sisa tahun
            </p>
          </div>

          <div className="bg-white border border-baznas-ink-8 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-baznas-ink/45 font-bold mb-1.5">
              Saldo Kas &amp; Bank
            </p>
            <p className="display-3 editorial-num text-baznas-ink">
              Rp 361,95 jt
            </p>
            <p className="text-[11px] text-baznas-ink/55 mt-1.5">
              Giro Sulutgo · Muamalat · BTN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
