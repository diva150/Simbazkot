"use client";

import React, { useState, useEffect } from "react";
import { Lock, User, KeyRound, X, ArrowRight, ShieldCheck, AlertCircle, Trash2, CheckSquare, Square, Eye, EyeOff } from "lucide-react";
import { initialPredefinedUsers } from "@/lib/mock-data";
import { UserSession } from "@/lib/types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  userAccounts?: UserSession[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  userAccounts = initialPredefinedUsers,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedUsernames, setSavedUsernames] = useState<string[]>([]);

  // Load saved logins from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("baznas_saved_logins");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedUsernames(parsed);
          }
        }
      } catch (err) {
        console.error("Gagal membaca akun tersimpan:", err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const user = userAccounts.find(
      (u) => u.username.toLowerCase() === cleanUser
    );

    if (!user) {
      setErrorMsg("Username tidak terdaftar pada sistem BAZNAS.");
      return;
    }

    if (user.password && user.password !== password) {
      setErrorMsg("Kata sandi yang Anda masukkan salah.");
      return;
    }

    // Simpan ke localStorage jika rememberMe dicentang
    if (rememberMe && typeof window !== "undefined") {
      try {
        const updated = Array.from(new Set([...savedUsernames, user.username]));
        setSavedUsernames(updated);
        localStorage.setItem("baznas_saved_logins", JSON.stringify(updated));
      } catch (err) {
        console.error("Gagal menyimpan akun:", err);
      }
    }

    onLoginSuccess(user);
    onClose();
  };

  const handleQuickLogin = (u: UserSession) => {
    onLoginSuccess(u);
    onClose();
  };

  const handleForgetSavedAccount = (e: React.MouseEvent, userToForget: string) => {
    e.stopPropagation();
    const updated = savedUsernames.filter((name) => name !== userToForget);
    setSavedUsernames(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("baznas_saved_logins", JSON.stringify(updated));
      } catch (err) {
        console.error("Gagal memperbarui akun tersimpan:", err);
      }
    }
  };

  // Akun tersimpan yang valid dari userAccounts
  const savedUsers = userAccounts.filter((u) => savedUsernames.includes(u.username));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-baznas-green-900 via-baznas-green-800 to-baznas-green-900 p-6 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-4 ring-white/10 text-white font-bold text-xl">
            <Lock className="h-6 w-6 text-baznas-gold-500" />
          </div>
          <h3 className="text-lg font-bold font-poppins text-white">Login Sistem Internal</h3>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            Portal Khusus Petugas Bidang, Pimpinan &amp; Administrator BAZNAS
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login Manual */}
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Bidang
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: bidang1 / bidang2 / ketua / admin"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 py-2 text-xs text-slate-800 focus:outline-none focus:border-baznas-green-700 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Akun */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none"
              >
                {rememberMe ? (
                  <CheckSquare className="h-4 w-4 text-baznas-green-800" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>Ingat akun di perangkat ini</span>
              </label>
              <span className="text-[11px] text-slate-400">1 Akun per Bidang</span>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 py-2.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Login - HANYA MUNCUL JIKA SUDAH TERSIMPAN SEBELUMNYA */}
          {savedUsers.length > 0 ? (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Aksi Cepat (Akun Tersimpan)
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {savedUsers.length} Tersimpan
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-h-48 overflow-y-auto pr-1">
                {savedUsers.map((u) => (
                  <div
                    key={u.username}
                    onClick={() => handleQuickLogin(u)}
                    role="button"
                    tabIndex={0}
                    className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left cursor-pointer"
                  >
                    <div className="min-w-0 pr-6">
                      <span className="text-[10px] font-bold text-baznas-green-800 uppercase block">
                        {u.username}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-baznas-green-900 truncate">
                        {u.roleLabel}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{u.nama}</p>
                    </div>
                    <button
                      type="button"
                      title="Hapus dari akun tersimpan"
                      onClick={(e) => handleForgetSavedAccount(e, u.username)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center text-[11px] text-slate-500">
              <span className="block font-medium">Akses cepat belum aktif di perangkat ini.</span>
              <span className="text-[10px] text-slate-400">
                Centang &apos;Ingat akun&apos; saat login agar tersimpan untuk sesi berikutnya.
              </span>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-2 text-center text-[11px] text-slate-400">
            <ShieldCheck className="inline h-3.5 w-3.5 text-emerald-600 mr-1" />
            Keamanan Data Dilindungi Enkripsi Standar BAZNAS RI
          </div>
        </div>
      </div>
    </div>
  );
};
