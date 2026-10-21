"use client";

import React from "react";
import { Mustahik } from "@/lib/types";
import { GraduationCap, Briefcase } from "lucide-react";
import {
  ModuleDashboardShell,
  HeroPanel,
  StatTile,
  ProgressMeter,
} from "@/components/modules/ModuleDashboard";
import { AnimatedNumber } from "@/components/motion";
import { formatRupiah } from "@/lib/utils";
import { Lift } from "@/components/motion";

/**
 * DashboardTab — landing summary for Bidang II.
 *
 * 4 stat tiles + 2 quick-cards that jump to the program tabs.
 *
 * Visual: BAZNAS Tier-1 colors, Zaiflu motion language (lift on hover,
 * ghost numerals, mesh depth on the hero panel, count-up stats). Lime
 * accent is reserved for the progress bar only (chart/progress per rules).
 *
 * Pure presentational — no state. Receives `mustahikList` from parent.
 */

interface DashboardTabProps {
  mustahikList: Mustahik[];
  onNavigate: (tab: "pendistribusian" | "pendayagunaan") => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  mustahikList,
  onNavigate,
}) => {
  const totalTerdata = mustahikList.length;
  const totalDesil1 = mustahikList.filter((m) => m.desil === "Desil 1").length;
  const totalDistribusi = mustahikList.filter(
    (m) => m.kategoriBesar === "pendistribusian"
  ).length;
  const totalPendayagunaan = mustahikList.filter(
    (m) => m.kategoriBesar === "pendayagunaan"
  ).length;

  // For the hero panel — sum of distribution-mode payouts (no data? show 0).
  const totalDistribusiNominal = 0;
  const persenDistribusiVsPenerima =
    totalTerdata > 0
      ? Math.round((totalDistribusi / totalTerdata) * 100)
      : 0;

  return (
    <ModuleDashboardShell
      eyebrow="Bidang II — Pendistribusian & Pendayagunaan"
      title="Ringkasan Penerima Manfaat"
      description="Pemetaan mustahik 4 pilar (pendidikan, kesehatan, dakwah/advokasi, ekonomi) yang menjadi dasar penyaluran ZIS tahun anggaran berjalan."
      ghost="02"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* HERO — deep panel with count-up total + mesh depth */}
        <HeroPanel
          eyebrow="Mustahik Terdata & Terverifikasi"
          ghost="01"
          caption={`${totalTerdata} jiwa / KK telah terdata dengan verifikasi Asnaf & SKTM, tersebar di 4 pilar program penyaluran.`}
          icon={<GraduationCap className="h-56 w-56" strokeWidth={0.8} />}
          value={
            <p className="display-1 editorial-num text-white leading-[0.95] tracking-tight">
              <AnimatedNumber value={totalTerdata} />
              <span className="text-base font-normal text-white/65 ml-2">
                jiwa / KK
              </span>
            </p>
          }
        >
          <div className="mt-2">
            <ProgressMeter
              label="Cakupan Program Pendistribusian"
              value={persenDistribusiVsPenerima}
              valueLabel={`${persenDistribusiVsPenerima}%`}
              ariaLabel="Cakupan program pendistribusian terhadap total mustahik"
            />
          </div>
        </HeroPanel>

        {/* 3 MEDIUM stats */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <StatTile
            label="Desil 1 — Kemiskinan Ekstrem"
            value={<AnimatedNumber value={totalDesil1} />}
            unit="Penerima"
            hint="Prioritas utama dalam penyaluran konsumtif."
            ghost="02"
            tone="positive"
          />
          <StatTile
            label="Pendistribusian (Konsumtif)"
            value={<AnimatedNumber value={totalDistribusi} />}
            unit="Mustahik"
            hint="Pendidikan, kesehatan, dakwah & advokasi."
            ghost="03"
          />
          <StatTile
            label="Pendayagunaan (Produktif)"
            value={<AnimatedNumber value={totalPendayagunaan} />}
            unit="Mustahik"
            hint="Ekonomi, vokasi sebagian, sanitasi sehat."
            ghost="04"
          />
        </div>
      </div>

      {/* Quick Cards — interactive lifts that jump to the relevant tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Lift>
          <button
            type="button"
            onClick={() => onNavigate("pendistribusian")}
            className="group relative text-left w-full bg-baznas-paper/40 border border-baznas-ink-8 hover:border-baznas-green-800 p-8 rounded-card transition-all duration-350 ease-zaiflu hover:-translate-y-1 hover:shadow-lift active:scale-[0.99] min-h-t-target-xl overflow-hidden"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-[3px] bg-baznas-gold-display scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-350 ease-zaiflu"
            />
            <GraduationCap
              className="h-7 w-7 text-baznas-ink mb-3 transition-transform duration-350 ease-zaiflu group-hover:scale-110"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Program Pendistribusian
            </h3>
            <p className="mt-2 text-xs text-baznas-ink/70 leading-snug">
              Penyaluran konsumtif darurat: Pendidikan, Kesehatan, Dakwah dan
              Advokasi.
            </p>
          </button>
        </Lift>

        <Lift>
          <button
            type="button"
            onClick={() => onNavigate("pendayagunaan")}
            className="group relative text-left w-full bg-baznas-paper/40 border border-baznas-ink-8 hover:border-baznas-green-800 p-8 rounded-card transition-all duration-350 ease-zaiflu hover:-translate-y-1 hover:shadow-lift active:scale-[0.99] min-h-t-target-xl overflow-hidden"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-[3px] bg-baznas-gold-display scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-350 ease-zaiflu"
            />
            <Briefcase
              className="h-7 w-7 text-baznas-green-900 mb-3 transition-transform duration-350 ease-zaiflu group-hover:scale-110"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Program Pendayagunaan
            </h3>
            <p className="mt-2 text-xs text-baznas-ink/70 leading-snug">
              Transformasi produktif: Modal Usaha Z-Mart, Vokasi, dan Sanitasi
              Sehat.
            </p>
          </button>
        </Lift>
      </div>
    </ModuleDashboardShell>
  );
};

export default DashboardTab;
