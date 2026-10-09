"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Calendar,
  User,
  Menu,
  LogOut,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react";
import { UserSession, RoleBidang } from "@/lib/types";

interface HeaderProps {
  onOpenSearch: () => void;
  pendingCount: number;
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

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  pendingCount,
  onToggleSidebar,
  user,
  userAccounts,
  onUpdateUserAccount,
  onLogout,
}) => {
  // State Modal Ubah Kredensial (Username & Kata Sandi)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

    // Kebijakan 1 username per bidang: cek jika username dipakai bidang lain
    if (userAccounts) {
      const conflict = userAccounts.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername && u.role !== user?.role
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
      <header className="no-print sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
        {/* Kiri: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            title="Buka Navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-baznas-green-900 to-baznas-green-700 shadow-md shadow-baznas-green-900/20 text-white font-bold font-poppins text-lg">
              B
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight text-slate-900 font-poppins">
                BAZNAS
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {user?.roleLabel || "Sistem Informasi & Pengelolaan Data"}
              </p>
            </div>
          </div>
        </div>

        {/* Tengah: Quick Search Omnibox */}
        <div className="flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            type="button"
            className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-400 transition-all hover:border-baznas-green-600 hover:bg-white hover:text-slate-600 shadow-xs"
          >
            <span className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-400 group-hover:text-baznas-green-600" />
              <span className="truncate text-xs">Cari NIK, NPWZ, muzakki, mustahik, surat...</span>
            </span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-slate-400 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Kanan: Tanggal, Pengaturan Akun, Notifikasi & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Info Tanggal */}
          <div className="hidden xl:flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-1.5 border border-emerald-100 text-xs text-baznas-green-800">
            <Calendar className="h-3.5 w-3.5 text-baznas-green-600" />
            <div className="leading-tight">
              <span className="font-semibold block">Rabu, 23 Sep 2026</span>
              <span className="text-[10px] text-emerald-600">11 Rabiul Awwal 1448 H</span>
            </div>
          </div>

          {/* Notifikasi Pengingat */}
          <div className="relative">
            <button
              onClick={onOpenSearch}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Pengingat Tugas"
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* User Info & Tombol Ubah Kata Sandi / Akun */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={handleOpenEdit}
              title="Klik untuk Ubah Username atau Kata Sandi Bidang"
              className="group flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-baznas-green-800 group-hover:border-baznas-green-600 transition-colors">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block max-w-[140px]">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate group-hover:text-baznas-green-800">
                  {user?.nama || "Amil Pelaksana"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-block text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded truncate">
                    {user?.username.toLowerCase()}
                  </span>
                  <KeyRound className="h-3 w-3 text-slate-400 group-hover:text-baznas-green-700" />
                </div>
              </div>
            </button>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={onLogout}
            title="Keluar ke Beranda Umum"
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* MODAL UBAH KATA SANDI / USERNAME AKUN BIDANG */}
      {isEditModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-baznas-green-900 to-baznas-green-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    Ubah Akun &amp; Kata Sandi
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    {user.roleLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              {/* Notifikasi Error & Sukses */}
              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Info Pengguna Saat Ini */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Pejabat Bertanggung Jawab
                </span>
                <p className="text-xs font-bold text-slate-800">{user.nama}</p>
                <p className="text-[11px] text-slate-500">{user.jabatan}</p>
              </div>

              {/* Input Username */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username Login Bidang *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. bidang1, ketua, admin"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:ring-1 focus:ring-baznas-green-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  *Satu akun per bidang. Username digunakan untuk masuk ke portal.
                </p>
              </div>

              {/* Input Kata Sandi Baru */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:ring-1 focus:ring-baznas-green-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:ring-1 focus:ring-baznas-green-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20 transition-all"
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
