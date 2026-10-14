"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  User,
  KeyRound,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Trash2,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { initialPredefinedUsers } from "@/lib/mock-data";
import { UserSession } from "@/lib/types";
import {
  LOGIN_AUTH_DELAY_MS,
  LOGIN_FOCUS_DELAY_MS,
  LOGIN_UNMOUNT_DELAY_MS,
} from "@/lib/constants";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if open for entrance animation
  const [shouldRender, setShouldRender] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Load saved logins from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      try {
        const stored = localStorage.getItem("baznas_saved_emails");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSavedEmails(parsed);
        }
      } catch (err) {
        console.error("Gagal membaca akun tersimpan:", err);
      }
      // Set render true for entrance animation, then focus email
      setShouldRender(true);
      const t = setTimeout(() => emailRef.current?.focus(), LOGIN_FOCUS_DELAY_MS);
      return () => clearTimeout(t);
    } else if (!isOpen) {
      // Defer unmount for exit animation
      const t = setTimeout(() => setShouldRender(false), LOGIN_UNMOUNT_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Focus return: when the modal opens, save the previously focused element
  // so we can restore it on close (a11y — WCAG 2.4.3 focus order).
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    return () => {
      // Restore focus only if the previously focused element is still in
      // the DOM and focusable. (Skip if it was the body or null.)
      if (previous && typeof previous.focus === "function" && previous !== document.body) {
        previous.focus();
      }
    };
  }, [isOpen]);

  // Keyboard: Escape close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen && !shouldRender) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    // Simulated auth delay for nicer UX feedback
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const user = userAccounts.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (!user) {
        setErrorMsg("Email tidak terdaftar pada sistem BAZNAS.");
        setIsSubmitting(false);
        // Shake animation trigger via state class
        const card = document.getElementById("login-card");
        if (card) {
          card.classList.remove("animate-shake");
          void card.offsetWidth; // reflow
          card.classList.add("animate-shake");
        }
        return;
      }

      if (user.password && user.password !== password) {
        setErrorMsg("Kata sandi yang Anda masukkan salah.");
        setIsSubmitting(false);
        const card = document.getElementById("login-card");
        if (card) {
          card.classList.remove("animate-shake");
          void card.offsetWidth;
          card.classList.add("animate-shake");
        }
        return;
      }

      // Simpan ke localStorage jika rememberMe
      if (rememberMe && typeof window !== "undefined") {
        try {
          const updated = Array.from(new Set([...savedEmails, user.email]));
          setSavedEmails(updated);
          localStorage.setItem("baznas_saved_emails", JSON.stringify(updated));
        } catch (err) {
          console.error("Gagal menyimpan akun:", err);
        }
      }

      setIsSubmitting(false);
      onLoginSuccess(user);
      onClose();
    }, LOGIN_AUTH_DELAY_MS);
  };

  const handleQuickLogin = (u: UserSession) => {
    onLoginSuccess(u);
    onClose();
  };

  const handleForgetSavedAccount = (e: React.MouseEvent, emailToForget: string) => {
    e.stopPropagation();
    const updated = savedEmails.filter((mail) => mail !== emailToForget);
    setSavedEmails(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("baznas_saved_emails", JSON.stringify(updated));
      } catch (err) {
        console.error("Gagal memperbarui akun tersimpan:", err);
      }
    }
  };

  // Akun tersimpan yang valid dari userAccounts
  const savedUsers = userAccounts.filter((u) => savedEmails.includes(u.email));

  return (
    <>
      {/* Backdrop dengan fade-in */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-baznas-ink/70 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Modal container dengan scale + slide animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div
          id="login-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          className={`relative w-full max-w-md bg-white shadow-lift border border-baznas-ink-8 overflow-hidden my-auto max-h-[94vh] flex flex-col pointer-events-auto transition-all duration-300 ease-out ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-4"
          }`}
        >
          {/* Modal Header — paper, dengan subtle background pattern */}
          <div className="relative bg-baznas-paper px-7 pt-8 pb-6 text-center border-b border-baznas-ink-8 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 inline-flex items-center justify-center text-baznas-ink/70 hover:text-baznas-ink hover:bg-baznas-ink-8 h-t-target w-t-target transition-all duration-200 hover:rotate-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex justify-center text-baznas-gold-display mb-3" aria-hidden="true">
              <Lock className="h-7 w-7" />
            </div>

            <div className="transition-transform duration-300 hover:scale-[1.02] inline-block">
              <BAZNASMark
                variant="mark"
                size="md"
                className="text-baznas-green-900 justify-center"
              />
            </div>

            <div className="mt-5 flex items-center gap-2 justify-center text-baznas-ink/75">
              <span
                className="h-px w-8 bg-baznas-gold-display"
                aria-hidden="true"
              />
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span
                className="h-px w-8 bg-baznas-gold-display"
                aria-hidden="true"
              />
            </div>

            <h3
              id="login-title"
              className="mt-4 text-base font-poppins font-bold text-baznas-ink"
            >
              Portal Petugas Bidang
            </h3>
            <p className="mt-1 text-xs text-baznas-ink/70 leading-relaxed">
              Akses internal khusus amil, ketua, dan administrator BAZNAS.
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-7 space-y-4 overflow-y-auto flex-1">
            {/* Error message — slide-down entrance */}
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 border-l-4 border-baznas-error-700 bg-baznas-error-50 p-3 text-xs text-baznas-error-900 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0 text-baznas-error-700 mt-0.5"
                  aria-hidden="true"
                />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Form Login Manual */}
            <form onSubmit={handleManualLogin} className="space-y-3.5" noValidate={isSubmitting}>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[11px] font-bold text-baznas-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Email Petugas
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/70 group-focus-within:text-baznas-green-800 transition-colors"
                    aria-hidden="true"
                  />
                  <input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@baznas.go.id"
                    autoComplete="email"
                    className="w-full border border-baznas-ink-20 bg-white pl-10 pr-3 py-2.5 text-sm text-baznas-ink placeholder:text-baznas-ink/75 focus:outline-none focus:border-baznas-green-800 focus:bg-white min-h-t-target transition-all duration-200 hover:border-baznas-ink-40 focus-visible:ring-2 focus-visible:ring-baznas-green-800/30 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-bold text-baznas-ink/80 uppercase tracking-wider mb-1.5"
                >
                  Kata Sandi
                </label>
                <div className="relative group">
                  <KeyRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/70 group-focus-within:text-baznas-green-800 transition-colors"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full border border-baznas-ink-20 bg-white pl-10 pr-10 py-2.5 text-sm text-baznas-ink placeholder:text-baznas-ink/75 focus:outline-none focus:border-baznas-green-800 focus:bg-white min-h-t-target transition-all duration-200 hover:border-baznas-ink-40 focus-visible:ring-2 focus-visible:ring-baznas-green-800/30 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/70 hover:text-baznas-ink h-t-target w-t-target transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 disabled:opacity-50"
                    title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox Ingat Akun — animated check */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label
                  onClick={() => !isSubmitting && setRememberMe(!rememberMe)}
                  className={`flex items-center gap-2 select-none min-h-t-target transition-opacity ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer text-baznas-ink/70 hover:text-baznas-ink"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 transition-transform duration-200">
                    {rememberMe ? (
                      <CheckSquare
                        className="h-4 w-4 text-baznas-green-800"
                        aria-hidden="true"
                      />
                    ) : (
                      <Square
                        className="h-4 w-4 text-baznas-ink/70"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span>Ingat akun di perangkat ini</span>
                </label>
                <span className="text-[11px] text-baznas-ink/70">Login dengan email terdaftar</span>
              </div>

              {/* Submit Button — with loading state */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full inline-flex items-center justify-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 text-white py-3 text-sm font-bold transition-all duration-200 min-h-t-target-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2 disabled:opacity-80 disabled:cursor-wait active:scale-[0.99] relative overflow-hidden"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Masuk ke Dashboard</span>
                    <ArrowRight
                      className="h-4 w-4 relative z-10 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                    <span
                      className="absolute inset-y-0 right-0 w-0 bg-baznas-green-800 transition-all duration-300 group-hover:w-full"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {/* Enter hint */}
              <p className="text-center text-[10px] text-baznas-ink/70 pt-1">
                Tekan <kbd className="font-mono text-[10px] font-bold text-baznas-ink/70 bg-baznas-paper/60 border border-baznas-ink-12 px-1.5 py-0.5">Enter</kbd> untuk login
              </p>
            </form>

            {/* Quick Login - HANYA MUNCUL JIKA SUDAH TERSIMPAN SEBELUMNYA */}
            {savedUsers.length > 0 ? (
              <div className="space-y-2 pt-4 border-t border-baznas-ink-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-baznas-ink/70 tracking-wider">
                    Akun Tersimpan
                  </span>
                  <span className="text-[10px] text-baznas-green-800 font-semibold bg-baznas-paper border border-baznas-ink-8 px-2 py-0.5">
                    {savedUsers.length} Akun
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-h-48 overflow-y-auto pr-1">
                  {savedUsers.map((u, idx) => (
                    <div
                      key={u.email}
                      onClick={() => handleQuickLogin(u)}
                      role="button"
                      tabIndex={0}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleQuickLogin(u);
                        }
                      }}
                      className="group relative flex items-center justify-between border border-baznas-ink-8 bg-baznas-paper/40 p-2.5 hover:border-baznas-green-800 hover:bg-baznas-paper transition-all duration-200 text-left cursor-pointer min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 hover:translate-x-0.5 animate-in fade-in slide-in-from-left-2"
                    >
                      <div className="min-w-0 pr-6">
                        <span className="text-[10px] font-bold text-baznas-green-800 uppercase block truncate">
                          {u.email}
                        </span>
                        <p className="text-xs font-semibold text-baznas-ink truncate">
                          {u.nama}
                        </p>
                        <p className="text-[10px] text-baznas-ink/75 truncate mt-0.5">
                          {u.jabatan}
                        </p>
                      </div>
                      <button
                        type="button"
                        title="Hapus dari akun tersimpan"
                        onClick={(e) => handleForgetSavedAccount(e, u.email)}
                        className="absolute top-2 right-2 text-baznas-ink/70 hover:text-baznas-error-700 p-1 transition-all duration-200 hover:scale-110"
                        aria-label={`Hapus akun ${u.email}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-baznas-ink-8 bg-baznas-paper/40 p-2.5 text-center text-[11px] text-baznas-ink/70">
                <span className="block font-medium">Akses cepat belum aktif di perangkat ini.</span>
                <span className="text-[10px] text-baznas-ink/70">
                  Centang &apos;Ingat akun&apos; saat login agar tersimpan untuk sesi berikutnya.
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-baznas-ink/70">
              <ShieldCheck className="h-3.5 w-3.5 text-baznas-green-800" aria-hidden="true" />
              <span>Akses demo internal — gunakan akun pradefinisi atau "Akun Tersimpan"</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
