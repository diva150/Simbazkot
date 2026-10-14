"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  Camera,
  Lock,
  Mail,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  X,
  ShieldCheck,
  Info,
  Briefcase,
  Hash,
  Building2,
  Users,
  IdCard,
} from "lucide-react";
import {
  UserSession,
  USER_BIDANG_LABELS,
  USER_GENDER_LABELS,
  USER_PERMISSION_LABELS,
  bidangLabel,
  permissionLabel,
} from "@/lib/types";
import { MAX_PHOTO_BYTES, MAX_PHOTO_BYTES_HUMAN } from "@/lib/constants";
import { useToast } from "@/components/common";
import { BAZNASMark } from "@/components/brand/BAZNASMark";

interface ProfilSayaViewProps {
  currentUser: UserSession;
  onSelfUpdate: (
    updates: Partial<Pick<UserSession, "email" | "password" | "fotoProfil">>
  ) => void;
}

export const ProfilSayaView: React.FC<ProfilSayaViewProps> = ({
  currentUser,
  onSelfUpdate,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const isAdmin = currentUser.role === "admin";

  // Form state
  const [formEmail, setFormEmail] = useState(currentUser.email);
  const [formFoto, setFormFoto] = useState<string | undefined>(currentUser.fotoProfil);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when currentUser changes (e.g. after save)
  useEffect(() => {
    setFormEmail(currentUser.email);
    setFormFoto(currentUser.fotoProfil);
  }, [currentUser.email, currentUser.fotoProfil]);

  // ── Photo upload ────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMsg(`Ukuran foto maksimal ${MAX_PHOTO_BYTES_HUMAN}. Pilih gambar yang lebih kecil.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFormFoto(dataUrl);
    };
    reader.onerror = () => setErrorMsg("Gagal membaca file. Coba lagi.");
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormFoto(undefined);
  };

  // ── Validation ──────────────────────────────────────────────────
  const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const isValidPassword = (s: string) => s.length >= 8 && /[a-zA-Z]/.test(s) && /\d/.test(s);

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = formEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Email tidak boleh kosong.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Format email tidak valid.");
      return;
    }

    const wantsPasswordChange = newPassword.length > 0 || currentPassword.length > 0;
    if (wantsPasswordChange) {
      if (!currentPassword) {
        setErrorMsg("Masukkan kata sandi saat ini untuk mengubah kata sandi.");
        return;
      }
      if (currentPassword !== currentUser.password) {
        setErrorMsg("Kata sandi saat ini salah.");
        return;
      }
      if (!isValidPassword(newPassword)) {
        setErrorMsg("Kata sandi baru minimal 8 karakter dan harus mengandung huruf dan angka.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
        return;
      }
    }

    // Detect no-op
    const noChange =
      cleanEmail === currentUser.email &&
      formFoto === currentUser.fotoProfil &&
      !wantsPasswordChange;
    if (noChange) {
      setErrorMsg("Tidak ada perubahan untuk disimpan.");
      return;
    }

    const updates: Partial<Pick<UserSession, "email" | "password" | "fotoProfil">> = {};
    if (cleanEmail !== currentUser.email) updates.email = cleanEmail;
    if (formFoto !== currentUser.fotoProfil) updates.fotoProfil = formFoto;
    if (wantsPasswordChange) updates.password = newPassword;

    onSelfUpdate(updates);
    toastSuccess("Profil Tersimpan", "Perubahan pada profil Anda berhasil disimpan.");
    setSuccessMsg("Profil berhasil diperbarui.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <BAZNASMark variant="icon" size="md" className="text-baznas-green-900" />
          <div>
            <h1 className="text-xl font-bold text-baznas-ink font-poppins">
              Profil Saya
            </h1>
            <p className="text-xs text-baznas-ink/65 mt-0.5">
              Perbarui email, kata sandi, dan foto profil Anda. Data identitas lainnya hanya dapat diubah oleh Super Admin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 bg-baznas-ink text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-baznas-paper border border-baznas-ink-20 text-baznas-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
              <UserIcon className="h-3 w-3" />
              Pengguna
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── KOLOM KIRI: IDENTITAS (read-only) + FOTO ─────────────── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Foto Profil */}
          <div className="border border-baznas-ink-8 bg-white p-6">
            <h3 className="text-sm font-bold text-baznas-ink font-poppins mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-baznas-green-900" />
              <span>Foto Profil</span>
            </h3>

            <div className="flex flex-col items-center gap-4">
              {/* Photo preview */}
              <div className="relative h-32 w-32 border-2 border-baznas-ink-12 overflow-hidden bg-baznas-paper/40">
                {formFoto ? (
                  <img
                    src={formFoto}
                    alt={currentUser.nama}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-baznas-green-900 text-white">
                    <span className="text-3xl font-bold tracking-tight">
                      {currentUser.nama
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() || "")
                        .join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-col gap-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 border border-baznas-ink-20 hover:border-baznas-green-800 hover:bg-baznas-paper px-3 py-2 text-xs font-semibold text-baznas-ink transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{formFoto ? "Ganti Foto" : "Unggah Foto"}</span>
                </button>
                {formFoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center justify-center gap-2 border border-baznas-ink-20 hover:border-baznas-error-700 hover:bg-baznas-error-50 hover:text-baznas-error-700 px-3 py-2 text-xs font-semibold text-baznas-ink/70 transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-error-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-baznas-ink/55 text-center leading-relaxed">
                Format: JPG, PNG, WebP. Maks 500KB. Disarankan foto formal dengan latar polos.
              </p>
            </div>
          </div>

          {/* Data Identitas (read-only) */}
          <div className="border border-baznas-ink-8 bg-white p-6">
            <h3 className="text-sm font-bold text-baznas-ink font-poppins mb-4 flex items-center gap-2">
              <IdCard className="h-4 w-4 text-baznas-green-900" />
              <span>Data Identitas</span>
            </h3>
            <div className="space-y-3 text-xs">
              <ReadOnlyField icon={<UserIcon className="h-3.5 w-3.5" />} label="Nama Lengkap" value={currentUser.nama} />
              <ReadOnlyField
                icon={<Users className="h-3.5 w-3.5" />}
                label="Gender"
                value={USER_GENDER_LABELS[currentUser.gender]}
              />
              <ReadOnlyField
                icon={<Hash className="h-3.5 w-3.5" />}
                label="NIP"
                value={currentUser.nip || "—"}
                mono
              />
              <ReadOnlyField
                icon={<Briefcase className="h-3.5 w-3.5" />}
                label="Jabatan"
                value={currentUser.jabatan}
              />
              <ReadOnlyField
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Bidang / Divisi"
                value={bidangLabel(currentUser.bidang)}
              />
              <ReadOnlyField
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Hak Akses"
                value={permissionLabel(currentUser.role)}
              />
            </div>

            <div className="mt-5 border-l-4 border-baznas-gold-display bg-baznas-paper/40 p-3 text-[11px] text-baznas-ink/80 leading-relaxed">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-baznas-gold-display mt-0.5 shrink-0" />
                <span>
                  <strong>Data identitas di atas tidak dapat diubah sendiri.</strong> Jika terdapat
                  kesalahan pada nama, NIP, jabatan, atau bidang, hubungi Super Admin untuk
                  melakukan perubahan.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── KOLOM KANAN: FIELD EDITABLE (email, password) ────────── */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 border-l-4 border-baznas-error-700 bg-baznas-error-50 p-3 text-xs text-baznas-error-900"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-baznas-error-700 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div
              role="status"
              className="flex items-start gap-2 border-l-4 border-baznas-green-800 bg-baznas-paper p-3 text-xs text-baznas-green-900"
            >
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-baznas-green-800 mt-0.5"
                aria-hidden="true"
              />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Email */}
          <div className="border border-baznas-ink-8 bg-white p-6">
            <h3 className="text-sm font-bold text-baznas-ink font-poppins mb-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-baznas-green-900" />
              <span>Email Login</span>
            </h3>
            <p className="text-[11px] text-baznas-ink/60 mb-4">
              Email ini digunakan untuk masuk ke Portal Petugas BAZNAS.
            </p>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 focus:bg-white min-h-t-target"
            />
            <p className="text-[10px] text-baznas-ink/55 mt-1.5">
              Setelah mengubah email, gunakan email baru untuk login berikutnya.
            </p>
          </div>

          {/* Password */}
          <div className="border border-baznas-ink-8 bg-white p-6">
            <h3 className="text-sm font-bold text-baznas-ink font-poppins mb-1 flex items-center gap-2">
              <Lock className="h-4 w-4 text-baznas-green-900" />
              <span>Ubah Kata Sandi</span>
            </h3>
            <p className="text-[11px] text-baznas-ink/60 mb-4">
              Kosongkan bagian ini jika tidak ingin mengubah kata sandi.
            </p>

            <div className="space-y-3">
              {/* Current password */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink/80 uppercase tracking-wider mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full border border-baznas-ink-20 bg-white pl-3 pr-10 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink h-9 w-9 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                    aria-label={
                      showCurrentPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink/80 uppercase tracking-wider mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter, huruf + angka"
                    className="w-full border border-baznas-ink-20 bg-white pl-3 pr-10 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink h-9 w-9 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                    aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-[11px] font-bold text-baznas-ink/80 uppercase tracking-wider mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full border border-baznas-ink-20 bg-white pl-3 pr-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                />
              </div>
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 border border-baznas-ink-8 bg-baznas-paper/40 p-4">
            <p className="text-[11px] text-baznas-ink/65 mr-auto">
              Perubahan akan langsung berlaku pada sesi Anda saat ini.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-sm font-bold text-white transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Helper: read-only data row used in the identity card
const ReadOnlyField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}> = ({ icon, label, value, mono = false }) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 text-baznas-ink/45 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase font-bold text-baznas-ink/45 tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={`text-xs text-baznas-ink leading-snug break-words ${
          mono ? "font-mono" : "font-semibold"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default ProfilSayaView;
