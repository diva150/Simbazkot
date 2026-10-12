"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Calendar,
  X,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Wallet,
} from "lucide-react";
import { UserSession, RoleBidang } from "@/lib/types";
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
  userAccounts?: UserSession[];
  onUpdateUserAccount?: (
    role: RoleBidang,
    newUsername: string,
    newPassword?: string
  ) => void;
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
  userAccounts,
  onUpdateUserAccount,
  onLogout,
}) => {
  const totalPending = pendingPencairan + pendingSurat;

  // State Modal Ubah Kredensial (Username & Kata Sandi)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleOpenEdit = () => {
    if (!user) return;
    setEditUsername(user.username);
    setEditPassword(user.password || "");
    setEditConfirmPassword(user.password || "");
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg("Username tidak boleh kosong.");
      return;
    }

    if (/\s/.test(cleanUsername)) {
      setErrorMsg("Username tidak boleh mengandung spasi.");
      return;
    }

    // Kebijakan 1 username per bidang
    if (userAccounts) {
      const conflict = userAccounts.find(
        (u) => u.username.toLowerCase() === cleanUsername && u.role !== user?.role
      );
      if (conflict) {
        setErrorMsg(
          `Username '${cleanUsername}' sudah digunakan oleh ${conflict.roleLabel}. Kebijakan sistem: 1 username per bidang.`
        );
        return;
      }
    }

    if (editPassword && editPassword !== editConfirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak sesuai.");
      return;
    }

    if (user && onUpdateUserAccount) {
      onUpdateUserAccount(user.role, cleanUsername, editPassword);
      setSuccessMsg("Kata sandi dan username berhasil diperbarui!");
      setTimeout(() => {
        setSuccessMsg(null);
        setIsEditModalOpen(false);
      }, 1500);
    }
  };

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

            {/* User Info & Tombol Ubah Kata Sandi / Akun */}
            <div className="flex items-center gap-2 pl-2 border-l border-baznas-ink-8">
              <button
                type="button"
                onClick={handleOpenEdit}
                title="Klik untuk Ubah Username atau Kata Sandi Bidang"
                aria-label="Ubah Username atau Kata Sandi"
                className="group flex items-center gap-2 p-1.5 hover:bg-baznas-paper transition-colors text-left min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
              >
                <div className="flex h-9 w-9 items-center justify-center bg-baznas-green-900 text-white group-hover:bg-baznas-green-800 transition-colors">
                  <span className="text-[11px] font-bold tracking-tight">
                    {user ? monogram(user.nama) : "AM"}
                  </span>
                </div>
                <div className="hidden md:block max-w-[160px]">
                  <p className="text-sm font-bold text-baznas-ink leading-tight truncate group-hover:text-baznas-green-900">
                    {user?.nama || "Amil Pelaksana"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-block text-[10px] font-mono font-bold text-baznas-green-900 bg-baznas-paper px-1.5 py-0.2 truncate">
                      {user?.username.toLowerCase()}
                    </span>
                    <KeyRound className="h-3 w-3 text-baznas-ink/40 group-hover:text-baznas-green-800" />
                  </div>
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

      {/* MODAL UBAH KATA SANDI / USERNAME AKUN BIDANG */}
      {isEditModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-baznas-ink-8 shadow-lift overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header Modal — paper, bukan gradient */}
            <div className="relative bg-baznas-paper px-6 py-5 border-b border-baznas-ink-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="border border-baznas-gold-display p-2 text-baznas-green-900">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-baznas-ink font-poppins">
                    Ubah Akun &amp; Sandi
                  </h3>
                  <p className="text-[11px] text-baznas-ink/55 mt-0.5">{user.roleLabel}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-baznas-ink/50 hover:text-baznas-ink hover:bg-baznas-ink-8 h-t-target w-t-target transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm">
              {errorMsg && (
                <div className="flex items-start gap-2 border-l-4 border-rose-700 bg-rose-50 p-3 text-xs text-rose-900">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-700 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 border-l-4 border-baznas-green-800 bg-baznas-paper p-3 text-xs text-baznas-green-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-baznas-green-800 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Info Pengguna Saat Ini */}
              <div className="bg-baznas-paper/60 border-l-2 border-baznas-gold-display p-3">
                <span className="text-[10px] uppercase font-bold text-baznas-ink/50 block mb-1 tracking-wider">
                  Pejabat Bertanggung Jawab
                </span>
                <p className="text-sm font-bold text-baznas-ink">{user.nama}</p>
                <p className="text-[11px] text-baznas-ink/55">{user.jabatan}</p>
              </div>

              {/* Input Username */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                  Username Login Bidang *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="bidang1 / ketua / admin"
                  className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm font-mono font-semibold text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                />
                <p className="text-[11px] text-baznas-ink/45 mt-1">
                  *Satu akun per bidang. Username digunakan untuk masuk ke portal.
                </p>
              </div>

              {/* Input Sandi Baru */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full border border-baznas-ink-20 bg-white pl-3 pr-10 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink h-9 w-9 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Sandi Baru */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                  Ulangi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full border border-baznas-ink-20 bg-white pl-3 pr-10 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink h-9 w-9 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border border-baznas-ink-20 hover:bg-baznas-paper px-4 py-2.5 text-sm font-semibold text-baznas-ink/70 transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-sm font-bold text-white transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
