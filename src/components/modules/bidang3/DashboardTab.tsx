"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { Wallet, TrendingUp } from "lucide-react";
import {
  ModuleDashboardShell,
  HeroPanel,
  StatTile,
  ProgressMeter,
} from "@/components/modules/ModuleDashboard";
import { AnimatedNumber } from "@/components/motion";
import { FadeUp } from "@/components/motion";

interface DashboardTabProps {
  rkatList: { paguAnggaran: number; realisasi: number }[];
}

/**
 * Read-only Financial Dashboard for Bidang III.
 * Per spec: no CRUD allowed here.
 *
 * Visual: deep HeroPanel with count-up + emerald ghost + lime progress bar
 * (lime restricted to progress-only per palette rules). 3 StatTiles stacked
 * on the right. ModuleDashboardShell supplies the eyebrow/title/ghost frame.
 */
export const DashboardTab: React.FC<DashboardTabProps> = ({ rkatList }) => {
  const totalPagu = rkatList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = rkatList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const persentaseTotal = Math.round((totalRealisasi / (totalPagu || 1)) * 100);

  return (
    <ModuleDashboardShell
      eyebrow="Bidang III — Keuangan & RKAT"
      title="Ringkasan Anggaran Tahun Berjalan"
      description="Pemantauan pagu vs realisasi RKAT 2026, kondisi buku kas, dan indikator serapan program lintas bidang."
      ghost="03"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* HERO — Total Pagu RKAT */}
        <HeroPanel
          eyebrow="Total Pagu RKAT"
          ghost="01"
          caption={`Tahun Anggaran 2026 · Total ${rkatList.length} program kerja lintas bidang. Saldo kas & bank operasional saat ini.`}
          icon={<Wallet className="h-56 w-56" strokeWidth={0.8} />}
          value={
            <p className="display-1 editorial-num text-white leading-[0.95] tracking-tight">
              <AnimatedNumber
                value={totalPagu}
                format={(n: number) => formatRupiah(n)}
                duration={1.5}
              />
            </p>
          }
        >
          <div className="mt-2">
            <ProgressMeter
              label="Tingkat Serapan (Realisasi / Pagu)"
              value={persentaseTotal}
              valueLabel={`${persentaseTotal}%`}
              ariaLabel="Tingkat serapan RKAT"
            />
          </div>
        </HeroPanel>

        {/* 3 MEDIUM stats */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <StatTile
            label="Realisasi Terserap"
            value={`${persentaseTotal}%`}
            hint={formatRupiah(totalRealisasi)}
            ghost="02"
            tone="positive"
          />
          <StatTile
            label="Sisa Pagu (Belum Diserap)"
            value={<AnimatedNumber value={totalSisa} format={(n: number) => formatRupiah(n)} />}
            hint="Alokasi penyaluran sisa tahun anggaran."
            ghost="03"
          />
          <StatTile
            label="Saldo Kas & Bank"
            value={<AnimatedNumber value={361_950_000} format={(n: number) => formatRupiah(n)} />}
            hint="Giro Sulutgo · Muamalat · BTN"
            ghost="04"
            tone="positive"
          />
        </div>
      </div>
    </ModuleDashboardShell>
  );
};

export default DashboardTab;
