"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  ChevronDown,
  X,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Coins,
  Heart,
  Gift,
  FileSpreadsheet,
  Settings,
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
  BookOpenCheck,
  FileSignature,
  FolderKanban,
  Home,
  HeartHandshake,
  LineChart,
  FolderArchive,
  Layers,
  UserCircle,
} from "lucide-react";

interface SidebarProps {
  user: UserSession;
  activeRoleView: RoleBidang;
  onChangeRoleView: (role: RoleBidang) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  showProfile: boolean;
  showBeranda: boolean;
  onSelectBeranda: () => void;
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

// Helper: monogram inisial
function monogram(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeRoleView,
  onChangeRoleView,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  onOpenProfile,
  showProfile,
  showBeranda,
  onSelectBeranda,
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
  // === AUTO-COLLAPSE BEHAVIOR (desktop) ===
  // Sidebar collapses to icon-only when cursor leaves, expands to full
  // when cursor enters. No button click required (per requirement).
  const [isHovered, setIsHovered] = useState(false);
  const isDesktopCollapsed = !isHovered;
  const isAdmin = user.role === "admin";

  // Admin switcher — custom dropdown (lebih reliable dari native <select>)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!isSwitcherOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSwitcherOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSwitcherOpen]);

  // Tutup sidebar mobile dengan tombol Escape
  useEffect(() => {
    if (!isOpenMobile) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpenMobile, onCloseMobile]);

  // Opsi modul yang bisa dipilih Superadmin
  const VIEW_OPTIONS: { value: RoleBidang; label: string; shortLabel: string }[] = [
    { value: "admin", label: "Superadmin — Manajemen Akun", shortLabel: "Superadmin" },
    { value: "bidang1", label: "Bidang I — Pengumpulan", shortLabel: "Bidang I" },
    { value: "bidang2", label: "Bidang II — Pendistribusian", shortLabel: "Bidang II" },
    { value: "bidang3", label: "Bidang III — Keuangan & RKAT", shortLabel: "Bidang III" },
    { value: "bidang4", label: "Bidang IV — Administrasi & SDM", shortLabel: "Bidang IV" },
    { value: "ketua", label: "Pimpinan — Ketua BAZNAS", shortLabel: "Ketua" },
  ];
  const currentViewLabel =
    VIEW_OPTIONS.find((v) => v.value === activeRoleView)?.label ?? "Pilih Modul";

  // Tab gating
  const TABS_ADMIN_ONLY: Record<string, string[]> = {
    bidang1: ["pengaturan"],
    bidang2: ["pengaturan"],
    bidang3: ["pengaturan"],
    bidang4: [],
    ketua: [],
    admin: [],
  };

  const canShowTab = (view: RoleBidang, tab: string): boolean => {
    if (isAdmin) return true;
    if (user.bidang === "ketua" && (tab === "laporan" || tab === "laporan_semua")) return true;
    if (TABS_ADMIN_ONLY[view]?.includes(tab)) return false;
    return true;
  };

  const handleItemClick = (action: () => void) => {
    action();
    if (isOpenMobile) onCloseMobile();
  };

  // ============================================
  // KELAS HELPER — dibangun dengan conditional className
  // (TIDAK pakai arbitrary CSS selectors yang fragile)
  // ============================================

  // Container utama:
  // - Mobile: panel dropdown fixed di bawah header (top-[72px]), slide dari atas
  //           (translate-y-full → translate-y-0). Lebar penuh, max-h viewport.
  // - Desktop: static di dalam flex flow, lebar responsif terhadap hover
  //            (w-16 collapsed / w-64 expanded). Tidak ada click toggle.
  const asideClass = [
    "no-print flex flex-col bg-white border-baznas-ink-8",
    "transition-[width,transform,visibility] duration-200 ease-in-out",
    // Mobile positioning & state
    isOpenMobile
      ? "fixed top-[72px] left-0 right-0 z-50 max-h-[calc(100vh-72px)] border-b shadow-lg translate-y-0 visible"
      : "fixed top-[72px] left-0 right-0 z-50 max-h-[calc(100vh-72px)] border-b shadow-lg -translate-y-full invisible",
    // Desktop positioning (override mobile fixed + translate)
    "lg:static lg:translate-y-0 lg:visible lg:top-auto lg:left-auto lg:right-auto lg:max-h-none lg:shadow-none lg:border-b-0 lg:border-r",
    // Width
    isDesktopCollapsed ? "lg:w-16" : "lg:w-64",
    "w-full",
  ].join(" ");

  // Nav item: padding horizontal & justify menyesuaikan state collapse
  // (transition-all untuk animasi padding & justify yang halus saat hover)
  const navItemClass = (isActive: boolean) =>
    `group w-full flex items-center gap-3 transition-all duration-200 ${
      isDesktopCollapsed ? "justify-center px-2" : "pl-4 pr-3"
    } py-3 border-l-4 text-sm min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-1 ${
      isActive
        ? "border-baznas-gold-display bg-baznas-paper font-bold text-baznas-ink"
        : "border-transparent text-baznas-ink/70 hover:bg-baznas-paper/50 hover:text-baznas-ink hover:border-baznas-ink-12"
    }`;

  const navItemIconClass = (isActive: boolean) =>
    `h-4 w-4 shrink-0 ${isActive ? "text-baznas-green-900" : "text-baznas-ink/45 group-hover:text-baznas-ink/70"}`;

  // Group label: hidden saat collapsed (tetap di DOM sebagai sr-only untuk screen reader)
  const groupLabel = (text: string) => (
    <p
      className={`text-[10px] font-bold tracking-[0.18em] text-baznas-ink/40 uppercase mb-2 ${
        isDesktopCollapsed ? "lg:sr-only" : "px-4"
      }`}
    >
      {text}
    </p>
  );

  // Label text pada menu item: visually hidden saat collapsed (tetap di DOM untuk a11y)
  const menuLabel = (text: string) => (
    <span className={`flex-1 text-left ${isDesktopCollapsed ? "lg:sr-only" : ""}`}>
      {text}
    </span>
  );

  // Chevron pada menu item: hidden saat collapsed
  const menuChevron = (isActive: boolean) =>
    isDesktopCollapsed ? null : (
      <ChevronRight
        className={`h-3.5 w-3.5 shrink-0 ${
          isActive ? "text-baznas-gold-display" : "text-baznas-ink/30"
        }`}
        aria-hidden="true"
      />
    );

  return (
    <>
      {/* Overlay Mobile — hanya menutup area di bawah header (top-[72px])
          agar hamburger di header tetap bisa diklik untuk menutup sidebar. */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed top-[72px] right-0 bottom-0 left-0 z-40 bg-baznas-ink/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container — desktop auto-collapse via hover, mobile via hamburger */}
      <aside
        className={asideClass}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Navigasi utama"
      >
        {/* Header Sidebar Mobile — selalu visible di mobile (saat panel terbuka) */}
        <div className="flex h-14 items-center justify-between border-b border-baznas-ink-8 px-4 lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-baznas-green-900 text-white font-bold text-sm">
              {monogram(user.nama)}
            </div>
            <span className="font-bold text-baznas-ink font-poppins text-sm">Menu Bidang</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex items-center justify-center rounded-md text-baznas-ink/60 hover:bg-baznas-paper h-t-target w-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
            aria-label="Tutup Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Identity Badge — hidden saat collapsed di desktop */}
        <div className={`p-4 ${isDesktopCollapsed ? "lg:hidden" : ""} shrink-0`}>
          <div className="flex items-center gap-3 p-4 bg-baznas-paper border-l-4 border-baznas-gold-display">
            {user.fotoProfil ? (
              <img
                src={user.fotoProfil}
                alt={user.nama}
                className="shrink-0 h-10 w-10 object-cover border border-baznas-ink-8"
              />
            ) : (
              <div className="shrink-0 h-10 w-10 bg-baznas-green-900 text-white flex items-center justify-center">
                <span className="text-xs font-bold tracking-tight">
                  {monogram(user.nama)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-baznas-green-800 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold text-baznas-green-900 uppercase tracking-wider truncate">
                  {user.role === "admin" ? "Superadmin" : "Pengguna"}
                </span>
              </div>
              <p className="text-xs font-semibold text-baznas-ink leading-tight truncate mt-0.5">
                {user.nama}
              </p>
              <p className="text-[10px] text-baznas-ink/50 truncate mt-0.5">{user.jabatan}</p>
            </div>
          </div>
        </div>

        {/* Switcher Bidang (Khusus Akun Admin) — custom dropdown */}
        {isAdmin && (
          <div
            className={`px-4 pb-4 shrink-0 ${
              isDesktopCollapsed ? "lg:hidden" : ""
            }`}
          >
            <label className="text-[10px] font-bold text-baznas-ink/50 uppercase tracking-wider block mb-2">
              Ganti Modul
            </label>
            <div ref={switcherRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isSwitcherOpen}
                aria-label="Ganti modul tampilan untuk Superadmin"
                className="w-full flex items-center justify-between gap-2 border border-baznas-ink-20 bg-baznas-paper/60 hover:bg-baznas-paper hover:border-baznas-green-800 px-3 py-2.5 text-xs font-semibold text-baznas-ink transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
              >
                <span className="truncate flex-1 text-left">{currentViewLabel}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-baznas-ink/50 transition-transform duration-200 ${
                    isSwitcherOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isSwitcherOpen && (
                <ul
                  role="listbox"
                  aria-label="Daftar modul Superadmin"
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-baznas-ink-8 shadow-lift max-h-80 overflow-y-auto"
                >
                  {VIEW_OPTIONS.map((opt) => {
                    const isActive = activeRoleView === opt.value;
                    return (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            onChangeRoleView(opt.value);
                            setIsSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors min-h-t-target border-l-4 ${
                            isActive
                              ? "bg-baznas-paper text-baznas-green-900 border-baznas-gold-display"
                              : "text-baznas-ink/80 hover:bg-baznas-paper/40 border-transparent"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Navigation Sesuai Bidang */}
        <nav
          className="flex-1 overflow-y-auto py-2.5"
          aria-label="Navigasi modul"
        >
          {/* Beranda Utama — selalu di atas */}
          <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
            <button
              type="button"
              onClick={() => handleItemClick(onSelectBeranda)}
              aria-label={isDesktopCollapsed ? "Beranda Utama" : undefined}
              aria-current={showBeranda ? "page" : undefined}
              title={isDesktopCollapsed ? "Beranda Utama" : undefined}
              className={navItemClass(showBeranda)}
            >
              <Home className={navItemIconClass(showBeranda)} aria-hidden="true" />
              {menuLabel("Beranda Utama")}
              {menuChevron(showBeranda)}
            </button>

            {/* Profil Saya — tersedia untuk semua pengguna */}
            <button
              type="button"
              onClick={() => handleItemClick(onOpenProfile)}
              aria-label={isDesktopCollapsed ? "Profil Saya" : undefined}
              aria-current={showProfile ? "page" : undefined}
              title={isDesktopCollapsed ? "Profil Saya" : undefined}
              className={navItemClass(showProfile)}
            >
              <UserCircle className={navItemIconClass(showProfile)} aria-hidden="true" />
              {menuLabel("Profil Saya")}
              {menuChevron(showProfile)}
            </button>
          </div>

          {!isDesktopCollapsed && <div className="my-2 border-t border-baznas-ink-8" />}

          {/* BIDANG 1 */}
          {activeRoleView === "bidang1" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Modul Pengumpulan")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("dashboard"))}
                className={navItemClass(bidang1Tab === "dashboard")}
                aria-label={isDesktopCollapsed ? "Dashboard Ringkasan" : undefined}
                aria-current={bidang1Tab === "dashboard" ? "page" : undefined}
                title={isDesktopCollapsed ? "Dashboard Ringkasan" : undefined}
              >
                <LayoutDashboard className={navItemIconClass(bidang1Tab === "dashboard")} aria-hidden="true" />
                {menuLabel("Dashboard Ringkasan")}
                {menuChevron(bidang1Tab === "dashboard")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("muzakki"))}
                className={navItemClass(bidang1Tab === "muzakki")}
                aria-label={isDesktopCollapsed ? "Data Muzakki" : undefined}
                aria-current={bidang1Tab === "muzakki" ? "page" : undefined}
                title={isDesktopCollapsed ? "Data Muzakki" : undefined}
              >
                <Users className={navItemIconClass(bidang1Tab === "muzakki")} aria-hidden="true" />
                {menuLabel("Data Muzakki (NIK/NPWZ)")}
                {menuChevron(bidang1Tab === "muzakki")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("zakat"))}
                className={navItemClass(bidang1Tab === "zakat")}
                aria-label={isDesktopCollapsed ? "Zakat Profesi & Fitrah" : undefined}
                aria-current={bidang1Tab === "zakat" ? "page" : undefined}
                title={isDesktopCollapsed ? "Zakat Profesi & Fitrah" : undefined}
              >
                <Coins className={navItemIconClass(bidang1Tab === "zakat")} aria-hidden="true" />
                {menuLabel("Zakat Profesi & Fitrah")}
                {menuChevron(bidang1Tab === "zakat")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("infak"))}
                className={navItemClass(bidang1Tab === "infak")}
                aria-label={isDesktopCollapsed ? "Infak & Sedekah" : undefined}
                aria-current={bidang1Tab === "infak" ? "page" : undefined}
                title={isDesktopCollapsed ? "Infak & Sedekah" : undefined}
              >
                <Heart className={navItemIconClass(bidang1Tab === "infak")} aria-hidden="true" />
                {menuLabel("Infak & Sedekah")}
                {menuChevron(bidang1Tab === "infak")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("dskl"))}
                className={navItemClass(bidang1Tab === "dskl")}
                aria-label={isDesktopCollapsed ? "DSKL" : undefined}
                aria-current={bidang1Tab === "dskl" ? "page" : undefined}
                title={isDesktopCollapsed ? "DSKL" : undefined}
              >
                <Gift className={navItemIconClass(bidang1Tab === "dskl")} aria-hidden="true" />
                {menuLabel("DSKL (Qurban & Fidyah)")}
                {menuChevron(bidang1Tab === "dskl")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang1Tab("laporan"))}
                className={navItemClass(bidang1Tab === "laporan")}
                aria-label={isDesktopCollapsed ? "Laporan Kas Loket" : undefined}
                aria-current={bidang1Tab === "laporan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Laporan Kas Loket" : undefined}
              >
                <FileSpreadsheet className={navItemIconClass(bidang1Tab === "laporan")} aria-hidden="true" />
                {menuLabel("Laporan Kas Loket")}
                {menuChevron(bidang1Tab === "laporan")}
              </button>

              {canShowTab("bidang1", "pengaturan") && (
                <button
                  type="button"
                  onClick={() => handleItemClick(() => onChangeBidang1Tab("pengaturan"))}
                  className={navItemClass(bidang1Tab === "pengaturan")}
                  aria-label={isDesktopCollapsed ? "Pengaturan Nisab" : undefined}
                  aria-current={bidang1Tab === "pengaturan" ? "page" : undefined}
                  title={isDesktopCollapsed ? "Pengaturan Nisab" : undefined}
                >
                  <Settings className={navItemIconClass(bidang1Tab === "pengaturan")} aria-hidden="true" />
                  {menuLabel("Pengaturan Nisab")}
                  {menuChevron(bidang1Tab === "pengaturan")}
                </button>
              )}
            </div>
          )}

          {/* BIDANG 2 */}
          {activeRoleView === "bidang2" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Modul Penyaluran")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("dashboard"))}
                className={navItemClass(bidang2Tab === "dashboard")}
                aria-label={isDesktopCollapsed ? "Dashboard Penyaluran" : undefined}
                aria-current={bidang2Tab === "dashboard" ? "page" : undefined}
                title={isDesktopCollapsed ? "Dashboard Penyaluran" : undefined}
              >
                <LayoutDashboard className={navItemIconClass(bidang2Tab === "dashboard")} aria-hidden="true" />
                {menuLabel("Dashboard Penyaluran")}
                {menuChevron(bidang2Tab === "dashboard")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("mustahik"))}
                className={navItemClass(bidang2Tab === "mustahik")}
                aria-label={isDesktopCollapsed ? "Data Mustahik" : undefined}
                aria-current={bidang2Tab === "mustahik" ? "page" : undefined}
                title={isDesktopCollapsed ? "Data Mustahik" : undefined}
              >
                <Users className={navItemIconClass(bidang2Tab === "mustahik")} aria-hidden="true" />
                {menuLabel("Data Mustahik & Desil")}
                {menuChevron(bidang2Tab === "mustahik")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pendistribusian"))}
                className={navItemClass(bidang2Tab === "pendistribusian")}
                aria-label={isDesktopCollapsed ? "Program Pendistribusian" : undefined}
                aria-current={bidang2Tab === "pendistribusian" ? "page" : undefined}
                title={isDesktopCollapsed ? "Program Pendistribusian" : undefined}
              >
                <GraduationCap className={navItemIconClass(bidang2Tab === "pendistribusian")} aria-hidden="true" />
                {menuLabel("Program Pendistribusian")}
                {menuChevron(bidang2Tab === "pendistribusian")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pendayagunaan"))}
                className={navItemClass(bidang2Tab === "pendayagunaan")}
                aria-label={isDesktopCollapsed ? "Program Pendayagunaan" : undefined}
                aria-current={bidang2Tab === "pendayagunaan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Program Pendayagunaan" : undefined}
              >
                <Briefcase className={navItemIconClass(bidang2Tab === "pendayagunaan")} aria-hidden="true" />
                {menuLabel("Program Pendayagunaan")}
                {menuChevron(bidang2Tab === "pendayagunaan")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("pencairan"))}
                className={navItemClass(bidang2Tab === "pencairan")}
                aria-label={isDesktopCollapsed ? "Persetujuan Pencairan" : undefined}
                aria-current={bidang2Tab === "pencairan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Persetujuan Pencairan" : undefined}
              >
                <Clock className={navItemIconClass(bidang2Tab === "pencairan")} aria-hidden="true" />
                {menuLabel("Persetujuan Pencairan (SPK)")}
                {menuChevron(bidang2Tab === "pencairan")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("dokumentasi"))}
                className={navItemClass(bidang2Tab === "dokumentasi")}
                aria-label={isDesktopCollapsed ? "Dokumentasi BAST" : undefined}
                aria-current={bidang2Tab === "dokumentasi" ? "page" : undefined}
                title={isDesktopCollapsed ? "Dokumentasi BAST" : undefined}
              >
                <BookCheck className={navItemIconClass(bidang2Tab === "dokumentasi")} aria-hidden="true" />
                {menuLabel("Dokumentasi BAST")}
                {menuChevron(bidang2Tab === "dokumentasi")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang2Tab("laporan"))}
                className={navItemClass(bidang2Tab === "laporan")}
                aria-label={isDesktopCollapsed ? "Laporan Penyaluran" : undefined}
                aria-current={bidang2Tab === "laporan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Laporan Penyaluran" : undefined}
              >
                <FileSpreadsheet className={navItemIconClass(bidang2Tab === "laporan")} aria-hidden="true" />
                {menuLabel("Laporan Penyaluran")}
                {menuChevron(bidang2Tab === "laporan")}
              </button>

              {canShowTab("bidang2", "pengaturan") && (
                <button
                  type="button"
                  onClick={() => handleItemClick(() => onChangeBidang2Tab("pengaturan"))}
                  className={navItemClass(bidang2Tab === "pengaturan")}
                  aria-label={isDesktopCollapsed ? "Pengaturan Desil" : undefined}
                  aria-current={bidang2Tab === "pengaturan" ? "page" : undefined}
                  title={isDesktopCollapsed ? "Pengaturan Desil" : undefined}
                >
                  <Settings className={navItemIconClass(bidang2Tab === "pengaturan")} aria-hidden="true" />
                  {menuLabel("Pengaturan Desil")}
                  {menuChevron(bidang2Tab === "pengaturan")}
                </button>
              )}
            </div>
          )}

          {/* BIDANG 3 */}
          {activeRoleView === "bidang3" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Modul Keuangan")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("dashboard"))}
                className={navItemClass(bidang3Tab === "dashboard")}
                aria-label={isDesktopCollapsed ? "Dashboard Keuangan" : undefined}
                aria-current={bidang3Tab === "dashboard" ? "page" : undefined}
                title={isDesktopCollapsed ? "Dashboard Keuangan" : undefined}
              >
                <LayoutDashboard className={navItemIconClass(bidang3Tab === "dashboard")} aria-hidden="true" />
                {menuLabel("Dashboard Keuangan")}
                {menuChevron(bidang3Tab === "dashboard")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("rkat"))}
                className={navItemClass(bidang3Tab === "rkat")}
                aria-label={isDesktopCollapsed ? "Realisasi RKAT" : undefined}
                aria-current={bidang3Tab === "rkat" ? "page" : undefined}
                title={isDesktopCollapsed ? "Realisasi RKAT" : undefined}
              >
                <LineChart className={navItemIconClass(bidang3Tab === "rkat")} aria-hidden="true" />
                {menuLabel("Realisasi RKAT")}
                {menuChevron(bidang3Tab === "rkat")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("laporan_program"))}
                className={navItemClass(bidang3Tab === "laporan_program")}
                aria-label={isDesktopCollapsed ? "Laporan Per Program" : undefined}
                aria-current={bidang3Tab === "laporan_program" ? "page" : undefined}
                title={isDesktopCollapsed ? "Laporan Per Program" : undefined}
              >
                <FolderKanban className={navItemIconClass(bidang3Tab === "laporan_program")} aria-hidden="true" />
                {menuLabel("Laporan Per Program")}
                {menuChevron(bidang3Tab === "laporan_program")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("bukukas"))}
                className={navItemClass(bidang3Tab === "bukukas")}
                aria-label={isDesktopCollapsed ? "Buku Kas Umum" : undefined}
                aria-current={bidang3Tab === "bukukas" ? "page" : undefined}
                title={isDesktopCollapsed ? "Buku Kas Umum" : undefined}
              >
                <BookOpenCheck className={navItemIconClass(bidang3Tab === "bukukas")} aria-hidden="true" />
                {menuLabel("Buku Kas Umum")}
                {menuChevron(bidang3Tab === "bukukas")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("laporan"))}
                className={navItemClass(bidang3Tab === "laporan")}
                aria-label={isDesktopCollapsed ? "Laporan PSAK 109" : undefined}
                aria-current={bidang3Tab === "laporan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Laporan PSAK 109" : undefined}
              >
                <FileSpreadsheet className={navItemIconClass(bidang3Tab === "laporan")} aria-hidden="true" />
                {menuLabel("Laporan PSAK 109")}
                {menuChevron(bidang3Tab === "laporan")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang3Tab("lpj"))}
                className={navItemClass(bidang3Tab === "lpj")}
                aria-label={isDesktopCollapsed ? "Laporan LPJ" : undefined}
                aria-current={bidang3Tab === "lpj" ? "page" : undefined}
                title={isDesktopCollapsed ? "Laporan LPJ" : undefined}
              >
                <FileText className={navItemIconClass(bidang3Tab === "lpj")} aria-hidden="true" />
                {menuLabel("Laporan LPJ")}
                {menuChevron(bidang3Tab === "lpj")}
              </button>

              {canShowTab("bidang3", "pengaturan") && (
                <button
                  type="button"
                  onClick={() => handleItemClick(() => onChangeBidang3Tab("pengaturan"))}
                  className={navItemClass(bidang3Tab === "pengaturan")}
                  aria-label={isDesktopCollapsed ? "Akun Akuntansi" : undefined}
                  aria-current={bidang3Tab === "pengaturan" ? "page" : undefined}
                  title={isDesktopCollapsed ? "Akun Akuntansi" : undefined}
                >
                  <Settings className={navItemIconClass(bidang3Tab === "pengaturan")} aria-hidden="true" />
                  {menuLabel("Akun Akuntansi")}
                  {menuChevron(bidang3Tab === "pengaturan")}
                </button>
              )}
            </div>
          )}

          {/* BIDANG 4 */}
          {activeRoleView === "bidang4" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Modul Administrasi")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("dashboard"))}
                className={navItemClass(bidang4Tab === "dashboard")}
                aria-label={isDesktopCollapsed ? "Dashboard Administrasi" : undefined}
                aria-current={bidang4Tab === "dashboard" ? "page" : undefined}
                title={isDesktopCollapsed ? "Dashboard Administrasi" : undefined}
              >
                <LayoutDashboard className={navItemIconClass(bidang4Tab === "dashboard")} aria-hidden="true" />
                {menuLabel("Dashboard Administrasi")}
                {menuChevron(bidang4Tab === "dashboard")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("format_surat"))}
                className={navItemClass(bidang4Tab === "format_surat")}
                aria-label={isDesktopCollapsed ? "Format & Template Surat" : undefined}
                aria-current={bidang4Tab === "format_surat" ? "page" : undefined}
                title={isDesktopCollapsed ? "Format & Template Surat" : undefined}
              >
                <FileSignature className={navItemIconClass(bidang4Tab === "format_surat")} aria-hidden="true" />
                {menuLabel("Format & Template Surat")}
                {menuChevron(bidang4Tab === "format_surat")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("arsip_surat"))}
                className={navItemClass(bidang4Tab === "arsip_surat")}
                aria-label={isDesktopCollapsed ? "Arsip Terpadu" : undefined}
                aria-current={bidang4Tab === "arsip_surat" ? "page" : undefined}
                title={isDesktopCollapsed ? "Arsip Terpadu" : undefined}
              >
                <FolderArchive className={navItemIconClass(bidang4Tab === "arsip_surat")} aria-hidden="true" />
                {menuLabel("Arsip Terpadu")}
                {menuChevron(bidang4Tab === "arsip_surat")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("surat_masuk"))}
                className={navItemClass(bidang4Tab === "surat_masuk")}
                aria-label={isDesktopCollapsed ? "Agenda Surat Masuk" : undefined}
                aria-current={bidang4Tab === "surat_masuk" ? "page" : undefined}
                title={isDesktopCollapsed ? "Agenda Surat Masuk" : undefined}
              >
                <Mail className={navItemIconClass(bidang4Tab === "surat_masuk")} aria-hidden="true" />
                {menuLabel("Agenda Surat Masuk")}
                {menuChevron(bidang4Tab === "surat_masuk")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("surat_keluar"))}
                className={navItemClass(bidang4Tab === "surat_keluar")}
                aria-label={isDesktopCollapsed ? "Agenda Surat Keluar" : undefined}
                aria-current={bidang4Tab === "surat_keluar" ? "page" : undefined}
                title={isDesktopCollapsed ? "Agenda Surat Keluar" : undefined}
              >
                <Send className={navItemIconClass(bidang4Tab === "surat_keluar")} aria-hidden="true" />
                {menuLabel("Agenda Surat Keluar")}
                {menuChevron(bidang4Tab === "surat_keluar")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("sop"))}
                className={navItemClass(bidang4Tab === "sop")}
                aria-label={isDesktopCollapsed ? "Repositori SOP" : undefined}
                aria-current={bidang4Tab === "sop" ? "page" : undefined}
                title={isDesktopCollapsed ? "Repositori SOP" : undefined}
              >
                <BookCheck className={navItemIconClass(bidang4Tab === "sop")} aria-hidden="true" />
                {menuLabel("Repositori SOP")}
                {menuChevron(bidang4Tab === "sop")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("pegawai"))}
                className={navItemClass(bidang4Tab === "pegawai")}
                aria-label={isDesktopCollapsed ? "Direktori Pegawai" : undefined}
                aria-current={bidang4Tab === "pegawai" ? "page" : undefined}
                title={isDesktopCollapsed ? "Direktori Pegawai" : undefined}
              >
                <Users className={navItemIconClass(bidang4Tab === "pegawai")} aria-hidden="true" />
                {menuLabel("Direktori Pegawai & Amil")}
                {menuChevron(bidang4Tab === "pegawai")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("aset"))}
                className={navItemClass(bidang4Tab === "aset")}
                aria-label={isDesktopCollapsed ? "Inventaris Aset" : undefined}
                aria-current={bidang4Tab === "aset" ? "page" : undefined}
                title={isDesktopCollapsed ? "Inventaris Aset" : undefined}
              >
                <Box className={navItemIconClass(bidang4Tab === "aset")} aria-hidden="true" />
                {menuLabel("Inventaris Aset Kantor")}
                {menuChevron(bidang4Tab === "aset")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeBidang4Tab("pengaturan"))}
                className={navItemClass(bidang4Tab === "pengaturan")}
                aria-label={isDesktopCollapsed ? "Pengaturan Format Surat" : undefined}
                aria-current={bidang4Tab === "pengaturan" ? "page" : undefined}
                title={isDesktopCollapsed ? "Pengaturan Format Surat" : undefined}
              >
                <Settings className={navItemIconClass(bidang4Tab === "pengaturan")} aria-hidden="true" />
                {menuLabel("Pengaturan Format Surat")}
                {menuChevron(bidang4Tab === "pengaturan")}
              </button>
            </div>
          )}

          {/* KETUA */}
          {activeRoleView === "ketua" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Wewenang Ketua")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeKetuaTab("disposisi"))}
                className={navItemClass(ketuaTab === "disposisi")}
                aria-label={isDesktopCollapsed ? "Disposisi Surat" : undefined}
                aria-current={ketuaTab === "disposisi" ? "page" : undefined}
                title={isDesktopCollapsed ? "Disposisi Surat" : undefined}
              >
                <FileText className={navItemIconClass(ketuaTab === "disposisi")} aria-hidden="true" />
                {menuLabel("Disposisi Surat (Bid. IV)")}
                {menuChevron(ketuaTab === "disposisi")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeKetuaTab("persetujuan_spk"))}
                className={navItemClass(ketuaTab === "persetujuan_spk")}
                aria-label={isDesktopCollapsed ? "Persetujuan SPK" : undefined}
                aria-current={ketuaTab === "persetujuan_spk" ? "page" : undefined}
                title={isDesktopCollapsed ? "Persetujuan SPK" : undefined}
              >
                <HeartHandshake className={navItemIconClass(ketuaTab === "persetujuan_spk")} aria-hidden="true" />
                {menuLabel("Persetujuan SPK (Bid. II)")}
                {menuChevron(ketuaTab === "persetujuan_spk")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeKetuaTab("laporan_semua"))}
                className={navItemClass(ketuaTab === "laporan_semua")}
                aria-label={isDesktopCollapsed ? "Seluruh Laporan" : undefined}
                aria-current={ketuaTab === "laporan_semua" ? "page" : undefined}
                title={isDesktopCollapsed ? "Seluruh Laporan" : undefined}
              >
                <TrendingUp className={navItemIconClass(ketuaTab === "laporan_semua")} aria-hidden="true" />
                {menuLabel("Seluruh Laporan")}
                {menuChevron(ketuaTab === "laporan_semua")}
              </button>
            </div>
          )}

          {/* ADMIN */}
          {activeRoleView === "admin" && (
            <div className={isDesktopCollapsed ? "lg:space-y-0.5 space-y-1" : "space-y-1"}>
              {groupLabel("Menu Administrator")}

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeAdminTab("manajemen_akun"))}
                className={navItemClass(adminTab === "manajemen_akun")}
                aria-label={isDesktopCollapsed ? "Manajemen Akun" : undefined}
                aria-current={adminTab === "manajemen_akun" ? "page" : undefined}
                title={isDesktopCollapsed ? "Manajemen Akun" : undefined}
              >
                <UserCheck className={navItemIconClass(adminTab === "manajemen_akun")} aria-hidden="true" />
                {menuLabel("Manajemen Akun Bidang")}
                {menuChevron(adminTab === "manajemen_akun")}
              </button>

              <button
                type="button"
                onClick={() => handleItemClick(() => onChangeAdminTab("bidang_access"))}
                className={navItemClass(adminTab === "bidang_access")}
                aria-label={isDesktopCollapsed ? "Akses Lintas Bidang" : undefined}
                aria-current={adminTab === "bidang_access" ? "page" : undefined}
                title={isDesktopCollapsed ? "Akses Lintas Bidang" : undefined}
              >
                <Layers className={navItemIconClass(adminTab === "bidang_access")} aria-hidden="true" />
                {menuLabel("Akses Lintas Bidang")}
                {menuChevron(adminTab === "bidang_access")}
              </button>
            </div>
          )}
        </nav>

        {/* Footer Sidebar: Tombol Logout saja.
            (Tombol "Ciutkan" dihapus — desktop sudah auto-collapse via hover,
             sesuai requirement "No button click should be required".) */}
        <div className="border-t border-baznas-ink-8 p-3 shrink-0">
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar dari sistem"
            title={isDesktopCollapsed ? "Kembali ke Beranda Umum" : undefined}
            className="flex w-full items-center gap-2 border border-baznas-ink-12 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-700 py-2.5 text-xs font-bold text-baznas-ink/70 transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
          >
            {isDesktopCollapsed ? (
              <LogOut className="h-4 w-4 mx-auto" aria-hidden="true" />
            ) : (
              <>
                <LogOut className="h-4 w-4 ml-1" aria-hidden="true" />
                <span className="flex-1 text-left">Kembali ke Beranda Umum</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
