"use client";

import React from "react";
import {
  RoleBidang,
  UserSession,
  Bidang1Tab,
  Bidang2Tab,
  Bidang3Tab,
  Bidang4Tab,
  KetuaTab,
  AdminTab,
} from "@/lib/types";
import {
  HandCoins,
  HeartHandshake,
  LineChart,
  FolderArchive,
  ChevronRight,
  X,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Coins,
  Heart,
  Gift,
  FileSpreadsheet,
  Settings,
  Layers,
  Clock,
  BookCheck,
  Mail,
  Send,
  Box,
  LogOut,
  GraduationCap,
  Briefcase,
  TrendingUp,
  FileText,
  UserCheck,
  Shield,
  BookOpenCheck,
  Globe,
  FileSignature,
  FolderKanban,
} from "lucide-react";

interface SidebarProps {
  user: UserSession;
  activeRoleView: RoleBidang;
  onChangeRoleView: (role: RoleBidang) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  // Sub-tabs
  bidang1Tab: Bidang1Tab;
  onChangeBidang1Tab: (tab: Bidang1Tab) => void;
  bidang2Tab: Bidang2Tab;
  onChangeBidang2Tab: (tab: Bidang2Tab) => void;
  bidang3Tab: Bidang3Tab;
  onChangeBidang3Tab: (tab: Bidang3Tab) => void;
  bidang4Tab: Bidang4Tab;
  onChangeBidang4Tab: (tab: Bidang4Tab) => void;
  ketuaTab: KetuaTab;
  onChangeKetuaTab: (tab: KetuaTab) => void;
  adminTab: AdminTab;
  onChangeAdminTab: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeRoleView,
  onChangeRoleView,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  bidang1Tab,
  onChangeBidang1Tab,
  bidang2Tab,
  onChangeBidang2Tab,
  bidang3Tab,
  onChangeBidang3Tab,
  bidang4Tab,
  onChangeBidang4Tab,
  ketuaTab,
  onChangeKetuaTab,
  adminTab,
  onChangeAdminTab,
}) => {
  const isAdmin = user.role === "admin";

  const handleItemClick = (action: () => void) => {
    action();
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar Mobile */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-baznas-green-800 text-white font-bold text-sm">
              B
            </div>
            <span className="font-bold text-slate-900 font-poppins">Menu Bidang</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Identity Badge Bidang Aktif */}
        <div className="p-4">
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 shadow-xs">
            <div className="flex items-center gap-2 text-baznas-green-900 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-baznas-green-700" />
              <span>{user.roleLabel}</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-800/90 leading-tight">
              {user.nama}
            </p>
            <p className="text-[10px] text-emerald-700/70 mt-0.5">{user.jabatan}</p>
          </div>
        </div>

        {/* Switcher Bidang (Khusus Akun Admin) */}
        {isAdmin && (
          <div className="px-4 pb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ganti Tampilan Modul (Admin):
            </label>
            <select
              value={activeRoleView}
              onChange={(e) => onChangeRoleView(e.target.value as RoleBidang)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="admin">Superadmin — Manajemen Akun</option>
              <option value="bidang1">Bidang I — Pengumpulan</option>
              <option value="bidang2">Bidang II — Pendistribusian &amp; Pendayagunaan</option>
              <option value="bidang3">Bidang III — Keuangan &amp; RKAT</option>
              <option value="bidang4">Bidang IV — Administrasi &amp; SDM</option>
              <option value="ketua">Pimpinan — Ketua BAZNAS</option>
            </select>
          </div>
        )}

        {/* Dynamic Navigation Sesuai Bidang yang Sedang Aktif */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {/* ============================================================ */}
          {/* MENU BIDANG 1 */}
          {/* ============================================================ */}
          {activeRoleView === "bidang1" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Modul Utama Bidang 1
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("dashboard"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "dashboard"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                  <span>Dashboard Ringkasan</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("muzakki"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "muzakki"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>Data Muzakki (NIK/NPWZ)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("zakat"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "zakat"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <span>Zakat Profesi &amp; Fitrah</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("infak"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "infak"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 text-emerald-600" />
                  <span>Infak &amp; Sedekah</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("dskl"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "dskl"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="h-4 w-4 text-emerald-600" />
                  <span>DSKL (Qurban &amp; Fidyah)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("laporan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "laporan"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Laporan Kas Loket</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang1Tab("pengaturan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang1Tab === "pengaturan"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-emerald-600" />
                  <span>Pengaturan Nisab</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MENU BIDANG 2 */}
          {/* ============================================================ */}
          {activeRoleView === "bidang2" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Modul Utama Bidang 2
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("dashboard"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "dashboard"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-rose-600" />
                  <span>Dashboard Penyaluran</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("mustahik"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "mustahik"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-rose-600" />
                  <span>Data Mustahik &amp; Desil</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pendistribusian"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "pendistribusian"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Program Pendistribusian</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pendayagunaan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "pendayagunaan"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Program Pendayagunaan</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pencairan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "pencairan"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-rose-600" />
                  <span>Persetujuan Pencairan (SPK)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("dokumentasi"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "dokumentasi"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookCheck className="h-4 w-4 text-rose-600" />
                  <span>Dokumentasi BAST</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("laporan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "laporan"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-rose-600" />
                  <span>Laporan Penyaluran</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pengaturan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang2Tab === "pengaturan"
                    ? "bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-rose-600" />
                  <span>Pengaturan Desil</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MENU BIDANG 3 */}
          {/* ============================================================ */}
          {activeRoleView === "bidang3" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Modul Utama Bidang 3
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("dashboard"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "dashboard"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-amber-600" />
                  <span>Dashboard Keuangan</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("rkat"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "rkat"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LineChart className="h-4 w-4 text-amber-600" />
                  <span>Realisasi RKAT</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("laporan_program"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "laporan_program"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="h-4 w-4 text-amber-600" />
                  <span>Laporan Per Program</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("bukukas"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "bukukas"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpenCheck className="h-4 w-4 text-amber-600" />
                  <span>Buku Kas Umum</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("laporan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "laporan"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                  <span>Laporan PSAK 109</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("lpj"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "lpj"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span>Laporan LPJ</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang3Tab("pengaturan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang3Tab === "pengaturan"
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-amber-600" />
                  <span>Pengaturan Akun Akuntansi</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MENU BIDANG 4 */}
          {/* ============================================================ */}
          {activeRoleView === "bidang4" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Modul Utama Bidang 4
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("dashboard"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "dashboard"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  <span>Dashboard Administrasi</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("format_surat"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "format_surat"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSignature className="h-4 w-4 text-blue-600" />
                  <span>Format &amp; Template Surat</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("arsip_surat"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "arsip_surat"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderArchive className="h-4 w-4 text-blue-600" />
                  <span>Arsip Terpadu (Bidang 1 – 4)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("surat_masuk"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "surat_masuk"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Agenda Surat Masuk</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("surat_keluar"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "surat_keluar"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span>Agenda Surat Keluar</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("sop"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "sop"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookCheck className="h-4 w-4 text-blue-600" />
                  <span>Repositori SOP BAZNAS</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("pegawai"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "pegawai"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Direktori Pegawai &amp; Amil</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("aset"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "aset"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="h-4 w-4 text-blue-600" />
                  <span>Inventaris Aset Kantor</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeBidang4Tab("pengaturan"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  bidang4Tab === "pengaturan"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span>Pengaturan Format Surat</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MENU KETUA */}
          {/* ============================================================ */}
          {activeRoleView === "ketua" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Wewenang Ketua BAZNAS
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeKetuaTab("disposisi"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  ketuaTab === "disposisi"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-baznas-green-800" />
                  <span>Disposisi Surat Masuk (Bid. IV)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeKetuaTab("persetujuan_spk"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  ketuaTab === "persetujuan_spk"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="h-4 w-4 text-baznas-green-800" />
                  <span>Persetujuan SPK (Bid. II)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeKetuaTab("laporan_semua"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  ketuaTab === "laporan_semua"
                    ? "bg-emerald-50 text-baznas-green-900 border border-emerald-200 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-baznas-green-800" />
                  <span>Seluruh Laporan Terpadu</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MENU ADMIN */}
          {/* ============================================================ */}
          {activeRoleView === "admin" && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Menu Administrator
              </p>

              <button
                onClick={() => handleItemClick(() => onChangeAdminTab("manajemen_akun"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === "manajemen_akun"
                    ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-4 w-4 text-slate-800" />
                  <span>Manajemen Akun Bidang (1 User)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

              <button
                onClick={() => handleItemClick(() => onChangeAdminTab("bidang_access"))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === "bidang_access"
                    ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-slate-800" />
                  <span>Akses Penuh Lintas Bidang</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Sidebar: Tombol Keluar */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 py-2.5 text-xs font-bold text-slate-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Kembali ke Beranda Umum</span>
          </button>
        </div>
      </aside>
    </>
  );
};
