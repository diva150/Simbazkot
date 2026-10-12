"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Calendar,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Wallet,
} from "lucide-react";
import { UserSession, RoleBidang, bidangLabel, permissionLabel } from "@/lib/types";
import { formatIndonesianLongDate, formatHijriahDate } from "@/lib/utils";
import { BAZNASMark } from "@/components/brand/BAZNASMark";

interface HeaderProps {
  onOpenSearch: () => void;
  pendingPencairan: number;
  pendingSurat: number;
  onOpenPencairanReminder: () => void;
  onOpenSuratReminder: () => void;
  onToggleSidebar: () => void;
  user: UserSession | null;
  onOpenProfile: () => void;
  onLogout: () => void;
}

// Helper: inisial monogram dari nama
function monogram(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  pendingPencairan,
  pendingSurat,
  onOpenPencairanReminder,
  onOpenSuratReminder,
  onToggleSidebar,
  user,
  onOpenProfile,
  onLogout,
}) => {
  const totalPending = pendingPencairan + pendingSurat;

  // State Notifikasi (Bell Dropdown)
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Refresh date at the start of each day so it stays accurate across sessions
  useEffect(() => {
    const msUntilMidnight =
      new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 5, 0).getTime() -
      currentDate.getTime();
    const timer = setTimeout(() => setCurrentDate(new Date()), Math.max(msUntilMidnight, 60_000));
    return () => clearTimeout(timer);
  }, [currentDate]);

  // Tutup panel notifikasi saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!isNotifOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNotifOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isNotifOpen]);

  return (
    <>
      {/* Header full-width: background, border-b, dan sticky menutupi
          seluruh lebar halaman. Konten di dalamnya dibatasi max-w-7xl
          dan di-center agar sejajar dengan area konten (sidebar + main)
          di bawahnya — sehingga header & konten punya "frame" yang sama. */}
      <header className="no-print sticky top-0 z-30 w-full border-b border-baznas-ink-8 bg-white/95 backdrop-blur-md">
        <div className="h-[72px] max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          {/* Kiri: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-md text-baznas-ink/60 hover:bg-baznas-paper lg:hidden h-t-target w-t-target"
              aria-label="Buka Navigasi"
              title="Buka Navigasi"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <BAZNASMark variant="mark" size="sm" className="text-baznas-green-900" />
          </div>

          {/* Tengah: Quick Search Omnibox */}
          <div className="flex flex-1 max-w-md mx-4">
            <button
              onClick={onOpenSearch}
              type="button"
              className="group flex w-full items-center justify-between border border-baznas-ink-12 bg-baznas-paper/40 hover:border-baznas-green-800 hover:bg-white px-3.5 py-2.5 text-sm text-baznas-ink/45 transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
              aria-label="Buka pencarian cepat"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-baznas-ink/45 group-hover:text-baznas-green-800 shrink-0" />
                <span className="truncate text-sm">Cari NIK, NPWZ, muzakki, mustahik, surat&hellip;</span>
              </span>
              <kbd className="hidden sm:inline-flex h-6 items-center gap-0.5 border border-baznas-ink-12 bg-white px-2 font-mono text-[11px] font-semibold text-baznas-ink/55">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Kanan: Tanggal, Notifikasi, User, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Info Tanggal */}
            <div className="hidden xl:flex items-center gap-2 border-l-2 border-baznas-gold-display pl-3 pr-2 py-1.5 text-sm">
              <Calendar className="h-4 w-4 text-baznas-green-800" />
              <div className="leading-tight">
                <span className="font-semibold text-baznas-ink block text-sm">
                  {formatIndonesianLongDate(currentDate)}
                </span>
                <span className="text-[11px] text-baznas-ink/55 font-medium">
                  {formatHijriahDate(currentDate)}
                </span>
              </div>
            </div>

            {/* Notifikasi Pengingat */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Buka Pengingat Tugas"
                aria-haspopup="menu"
                aria-expanded={isNotifOpen}
                className="relative inline-flex items-center justify-center rounded-md text-baznas-ink/65 hover:bg-baznas-paper transition-colors h-t-target w-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                title="Pengingat Tugas"
              >
                <Bell className="h-5 w-5" />
                {totalPending > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 flex h-5 min-w-[20px] items-center justify-center bg-rose-700 px-1.5 text-[10px] font-bold text-white ring-2 ring-white"
                    aria-label={`${totalPending} tugas tertunda`}
                  >
                    {totalPending}
                  </span>
                )}
              </button>

              {/* Panel Dropdown Notifikasi */}
              {isNotifOpen && (
                <div
                  role="menu"
                  aria-label="Pengingat Tugas"
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-baznas-ink-8 shadow-lift z-40 overflow-hidden"
                >
                  {/* Header Panel — tanpa gradient */}
                  <div className="flex items-center justify-between bg-baznas-paper px-4 py-3 border-b border-baznas-ink-8">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-baznas-green-800" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-baznas-ink font-poppins">
                        Pengingat Tugas
                      </h3>
                    </div>
                    {totalPending > 0 && (
                      <span className="inline-flex items-center justify-center bg-rose-700 px-2 py-0.5 text-[10px] font-bold text-white">
                        {totalPending}
                      </span>
                    )}
                  </div>

                  {/* Daftar Item Notifikasi */}
                  <div className="py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsNotifOpen(false);
                        onOpenPencairanReminder();
                      }}
                      disabled={pendingPencairan === 0}
                      aria-label={`Permohonan Pencairan Dana, ${pendingPencairan} item tertunda`}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-baznas-ink transition-colors hover:bg-baznas-paper/60 focus:bg-baznas-paper/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent min-h-t-target border-b border-baznas-ink-8"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-baznas-gold-display text-baznas-green-900">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-baznas-ink leading-tight text-sm">
                          Permohonan Pencairan Dana
                        </p>
                        <p className="text-[11px] text-baznas-ink/55 mt-0.5">
                          Menunggu persetujuan Anda
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold text-white min-w-[24px] ${
                          pendingPencairan > 0 ? "bg-rose-700" : "bg-baznas-ink-20"
                        }`}
                        aria-hidden="true"
                      >
                        {pendingPencairan}
                      </span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsNotifOpen(false);
                        onOpenSuratReminder();
                      }}
                      disabled={pendingSurat === 0}
                      aria-label={`Surat Masuk Belum Disposisi, ${pendingSurat} item tertunda`}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-baznas-ink transition-colors hover:bg-baznas-paper/60 focus:bg-baznas-paper/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent min-h-t-target"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-baznas-gold-display text-baznas-green-900">
                        <Inbox className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-baznas-ink leading-tight text-sm">
                          Surat Masuk Belum Disposisi
                        </p>
                        <p className="text-[11px] text-baznas-ink/55 mt-0.5">
                          Perlu ditindaklanjuti segera
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold text-white min-w-[22px] ${
                          pendingSurat > 0 ? "bg-rose-700" : "bg-baznas-ink-20"
                        }`}
                        aria-hidden="true"
                      >
                        {pendingSurat}
                      </span>
                    </button>
                  </div>

                  {/* Footer Tutup */}
                  <div className="border-t border-baznas-ink-8 bg-baznas-paper/40 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="w-full py-1.5 text-[11px] font-semibold text-baznas-ink/60 hover:text-baznas-green-900 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Tombol Buka Profil Saya */}
            <div className="flex items-center gap-2 pl-2 border-l border-baznas-ink-8">
              <button
                type="button"
                onClick={onOpenProfile}
                title={user ? `Profil: ${user.nama} — ${user.jabatan} (${permissionLabel(user.role)})` : "Buka Profil Saya"}
                aria-label="Buka Profil Saya"
                className="group flex items-center gap-2 p-1.5 hover:bg-baznas-paper transition-colors text-left min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
              >
                {user?.fotoProfil ? (
                  <img
                    src={user.fotoProfil}
                    alt={user.nama}
                    className="h-9 w-9 object-cover border border-baznas-ink-8"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center bg-baznas-green-900 text-white group-hover:bg-baznas-green-800 transition-colors">
                    <span className="text-[11px] font-bold tracking-tight">
                      {user ? monogram(user.nama) : "—"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block max-w-[200px]">
                  <p className="text-sm font-bold text-baznas-ink leading-tight truncate group-hover:text-baznas-green-900">
                    {user?.nama ?? "Pengguna"}
                  </p>
                  {user?.jabatan && (
                    <p className="text-[11px] text-baznas-ink/70 leading-tight truncate mt-0.5">
                      {user.jabatan}
                    </p>
                  )}
                  {user && (
                    <span
                      className={`mt-1 inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                        user.role === "admin"
                          ? "bg-baznas-ink text-white"
                          : "bg-baznas-paper border border-baznas-ink-20 text-baznas-ink"
                      }`}
                    >
                      {permissionLabel(user.role)}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Tombol Logout */}
            <button
              onClick={onLogout}
              title="Keluar ke Beranda Umum"
              aria-label="Keluar dari sistem"
              className="inline-flex items-center gap-1.5 border border-baznas-ink-20 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-700 text-baznas-ink/70 px-3 sm:px-4 py-2 text-sm font-semibold transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
            >
              <span className="hidden sm:inline">Keluar</span>
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
