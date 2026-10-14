"use client";

import React, { useState, useEffect } from "react";
import {
  ItemRKAT,
  ProgramLintasBidang,
  BukuKasEntry,
  LaporanPSAK,
  LPJEntry,
  AkunAkuntansi,
  Bidang3Tab,
  UserSession,
} from "@/lib/types";
import { useToast, ToastContainer } from "@/components/common";
import { canAccessTab } from "@/lib/access";
import { LineChart } from "lucide-react";
import { DashboardTab } from "./bidang3/DashboardTab";
import { RkatTab } from "./bidang3/RkatTab";
import { LaporanProgramTab } from "./bidang3/LaporanProgramTab";
import { BukuKasTab } from "./bidang3/BukuKasTab";
import { LaporanPSAKTab } from "./bidang3/LaporanPSAKTab";
import { LPJTab } from "./bidang3/LPJTab";
import { PengaturanTab } from "./bidang3/PengaturanTab";

interface Bidang3ViewProps {
  // Data
  rkatList: ItemRKAT[];
  programList: ProgramLintasBidang[];
  bukuKasList: BukuKasEntry[];
  laporanList: LaporanPSAK[];
  lpjList: LPJEntry[];
  pengaturanList: AkunAkuntansi[];

  // Session & navigation
  currentUser: UserSession;
  onOpenLaporanPrint: () => void;
  activeTab?: Bidang3Tab;
  onTabChange?: (tab: Bidang3Tab) => void;

  // CRUD callbacks — RKAT
  onAddRkat: (r: ItemRKAT) => void;
  onUpdateRkat: (r: ItemRKAT) => void;
  onDeleteRkat: (id: string) => void;

  // CRUD callbacks — Program
  onAddProgram: (p: ProgramLintasBidang) => void;
  onUpdateProgram: (p: ProgramLintasBidang) => void;
  onDeleteProgram: (id: string) => void;

  // CRUD callbacks — Buku Kas
  onAddBukuKas: (e: BukuKasEntry) => void;
  onUpdateBukuKas: (e: BukuKasEntry) => void;
  onDeleteBukuKas: (id: string) => void;

  // CRUD callbacks — Laporan PSAK
  onAddLaporan: (e: LaporanPSAK) => void;
  onUpdateLaporan: (e: LaporanPSAK) => void;
  onDeleteLaporan: (id: string) => void;

  // CRUD callbacks — LPJ
  onAddLpj: (e: LPJEntry) => void;
  onUpdateLpj: (e: LPJEntry) => void;
  onDeleteLpj: (id: string) => void;

  // CRUD callbacks — Pengaturan (Akun)
  onAddAkun: (a: AkunAkuntansi) => void;
  onUpdateAkun: (a: AkunAkuntansi) => void;
  onDeleteAkun: (id: string) => void;
}

/**
 * Bidang III — Keuangan, Perencanaan & Pelaporan.
 * Thin shell: owns the header, tab routing, and access guard; delegates each
 * tab's body to a dedicated component under ./bidang3/.
 */
export const Bidang3View: React.FC<Bidang3ViewProps> = ({
  rkatList,
  programList,
  bukuKasList,
  laporanList,
  lpjList,
  pengaturanList,
  currentUser,
  onOpenLaporanPrint,
  activeTab: propTab,
  onTabChange,
  onAddRkat,
  onUpdateRkat,
  onDeleteRkat,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  onAddBukuKas,
  onUpdateBukuKas,
  onDeleteBukuKas,
  onAddLaporan,
  onUpdateLaporan,
  onDeleteLaporan,
  onAddLpj,
  onUpdateLpj,
  onDeleteLpj,
  onAddAkun,
  onUpdateAkun,
  onDeleteAkun,
}) => {
  const [localTab, setLocalTab] = useState<Bidang3Tab>("dashboard");
  const activeTab = propTab || localTab;
  const { error: toastError, toasts, dismiss } = useToast();

  const setActiveTab = (tab: Bidang3Tab) => {
    if (!canAccessTab(currentUser, "bidang3", tab)) {
      toastError("Akses Ditolak", `Anda tidak memiliki akses ke tab "${tab}".`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  useEffect(() => {
    if (activeTab && !canAccessTab(currentUser, "bidang3", activeTab)) {
      toastError("Akses Ditolak", `Tab "${activeTab}" tidak tersedia untuk peran Anda.`);
      if (onTabChange) onTabChange("dashboard");
      else setLocalTab("dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role]);

  return (
    <div className="space-y-6">
      {/* Header Modul — gold accent, no rounded pastel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-5">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-ink">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-baznas-ink font-poppins">
                Bidang III — Keuangan, Perencanaan &amp; Pelaporan
              </h1>
              <span className="bg-baznas-paper border border-baznas-ink-8 px-2.5 py-0.5 text-[10px] font-bold text-baznas-ink uppercase tracking-wider">
                Unit Keuangan
              </span>
            </div>
            <p className="text-xs text-baznas-ink/55 mt-1">
              Pejabat: <span className="font-semibold text-baznas-ink/80">Hi. Mansyur Ronosumitro, S.Sos</span> (Waka 3) — Staf Keuangan: Fommy Umar &amp; Wafiq Aziza Nursafitri, SE
            </p>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD LIKUIDITAS KAS — read-only per spec */}
      {canAccessTab(currentUser, "bidang3", "dashboard") && activeTab === "dashboard" && (
        <DashboardTab rkatList={rkatList} />
      )}

      {/* 2. RKAT — CRUD */}
      {canAccessTab(currentUser, "bidang3", "rkat") && activeTab === "rkat" && (
        <RkatTab
          rkatList={rkatList}
          onAdd={onAddRkat}
          onUpdate={onUpdateRkat}
          onDelete={onDeleteRkat}
        />
      )}

      {/* 3. LAPORAN PER PROGRAM — CRUD */}
      {canAccessTab(currentUser, "bidang3", "laporan_program") && activeTab === "laporan_program" && (
        <LaporanProgramTab
          programList={programList}
          onAdd={onAddProgram}
          onUpdate={onUpdateProgram}
          onDelete={onDeleteProgram}
        />
      )}

      {/* 4. BUKU KAS UMUM — CRUD */}
      {canAccessTab(currentUser, "bidang3", "bukukas") && activeTab === "bukukas" && (
        <BukuKasTab
          bukuKasList={bukuKasList}
          onAdd={onAddBukuKas}
          onUpdate={onUpdateBukuKas}
          onDelete={onDeleteBukuKas}
        />
      )}

      {/* 5. LAPORAN PSAK 109 — CRUD */}
      {canAccessTab(currentUser, "bidang3", "laporan") && activeTab === "laporan" && (
        <LaporanPSAKTab
          laporanList={laporanList}
          currentUserName={currentUser.nama}
          onAdd={onAddLaporan}
          onUpdate={onUpdateLaporan}
          onDelete={onDeleteLaporan}
          onOpenLaporanPrint={onOpenLaporanPrint}
        />
      )}

      {/* 6. LPJ — CRUD */}
      {canAccessTab(currentUser, "bidang3", "lpj") && activeTab === "lpj" && (
        <LPJTab
          lpjList={lpjList}
          onAdd={onAddLpj}
          onUpdate={onUpdateLpj}
          onDelete={onDeleteLpj}
        />
      )}

      {/* 7. PENGATURAN AKUN — CRUD */}
      {canAccessTab(currentUser, "bidang3", "pengaturan") && activeTab === "pengaturan" && (
        <PengaturanTab
          akunList={pengaturanList}
          onAdd={onAddAkun}
          onUpdate={onUpdateAkun}
          onDelete={onDeleteAkun}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default Bidang3View;
