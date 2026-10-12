"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  UserSession,
  UserBidang,
  UserPermission,
  UserGender,
  AdminTab,
  BerandaContent,
  USER_BIDANG_LABELS,
  USER_PERMISSION_LABELS,
  USER_GENDER_LABELS,
} from "@/lib/types";
import { canAccessTab } from "@/lib/access";
import {
  useToast,
  ToastContainer,
  ConfirmDialog,
} from "@/components/common";
import { initialBerandaContent } from "@/lib/mock-data";
import {
  ShieldAlert,
  UserCheck,
  Edit3,
  AlertCircle,
  Globe,
  Sparkles,
  Save,
  Compass,
  CreditCard,
  Building,
  Plus,
  Search,
  X,
  Camera,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
  User as UserIcon,
  Upload,
  Hash,
  Briefcase,
  Building2,
  ShieldCheck,
  ArrowRight,
  Layers,
  CheckSquare,
  Square,
} from "lucide-react";

interface AdminUserManagementViewProps {
  userAccounts: UserSession[];
  currentUser: UserSession;
  berandaContent?: BerandaContent;
  onUpdateBerandaContent?: (newContent: BerandaContent) => void;
  onCreateUser: (newUser: Omit<UserSession, "id" | "createdAt">) => void;
  onUpdateUser: (userId: string, updates: Partial<UserSession>) => void;
  onDeleteUser: (userId: string) => void;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

// Fields a user form can edit
type EditableField =
  | "nama"
  | "email"
  | "gender"
  | "nip"
  | "jabatan"
  | "bidang"
  | "role"
  | "password"
  | "fotoProfil";

const emptyForm: FormState = {
  nama: "",
  email: "",
  gender: "L",
  nip: "",
  jabatan: "",
  bidang: "bidang1",
  role: "user",
  password: "",
  confirmPassword: "",
  fotoProfil: undefined,
};

interface FormState {
  nama: string;
  email: string;
  gender: UserGender;
  nip: string;
  jabatan: string;
  bidang: UserBidang;
  role: UserPermission;
  password: string;
  confirmPassword: string;
  fotoProfil?: string;
}

export const AdminUserManagementView: React.FC<AdminUserManagementViewProps> = ({
  userAccounts,
  currentUser,
  berandaContent: propContent,
  onUpdateBerandaContent,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<AdminTab>("manajemen_akun");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: AdminTab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  // ── State for the user-management tab ───────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBidang, setFilterBidang] = useState<UserBidang | "all">("all");
  const [filterRole, setFilterRole] = useState<UserPermission | "all">("all");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userPendingDelete, setUserPendingDelete] = useState<UserSession | null>(null);
  const [userPendingResetPwd, setUserPendingResetPwd] = useState<UserSession | null>(null);

  // ── State for the beranda-editor tab ────────────────────────────
  const [content, setContent] = useState<BerandaContent>(propContent || initialBerandaContent);

  // Toast
  const { success: toastSuccess, error: toastError, toasts, dismiss } = useToast();

  // ── Derived list ────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return userAccounts.filter((u) => {
      if (filterBidang !== "all" && u.bidang !== filterBidang) return false;
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (!q) return true;
      return (
        u.nama.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.nip.toLowerCase().includes(q) ||
        u.jabatan.toLowerCase().includes(q)
      );
    });
  }, [userAccounts, searchQuery, filterBidang, filterRole]);

  // ── Form handlers ───────────────────────────────────────────────
  const openCreateModal = () => {
    setForm({ ...emptyForm, bidang: "bidang1", role: "user", gender: "L" });
    setFormError(null);
    setEditingUserId(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (user: UserSession) => {
    setForm({
      nama: user.nama,
      email: user.email,
      gender: user.gender,
      nip: user.nip,
      jabatan: user.jabatan,
      bidang: user.bidang,
      role: user.role,
      password: "",
      confirmPassword: "",
      fotoProfil: user.fotoProfil,
    });
    setFormError(null);
    setEditingUserId(user.id);
    setIsCreateOpen(true);
  };

  const closeForm = () => {
    setIsCreateOpen(false);
    setEditingUserId(null);
    setFormError(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setFormError("Ukuran foto maksimal 500KB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((prev) => ({ ...prev, fotoProfil: dataUrl }));
    };
    reader.onerror = () => setFormError("Gagal membaca file.");
    reader.readAsDataURL(file);
  };

  const validateForm = (isCreate: boolean): string | null => {
    if (!form.nama.trim()) return "Nama lengkap tidak boleh kosong.";
    if (!form.email.trim()) return "Email tidak boleh kosong.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Format email tidak valid.";
    }
    if (!form.nip.trim()) return "NIP tidak boleh kosong.";
    if (!/^\d{18}$/.test(form.nip.trim())) {
      return "NIP harus berupa 18 digit angka.";
    }
    if (!form.jabatan.trim()) return "Jabatan tidak boleh kosong.";

    // Email uniqueness
    const cleanEmail = form.email.trim().toLowerCase();
    const conflict = userAccounts.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.id !== editingUserId
    );
    if (conflict) return `Email ${cleanEmail} sudah digunakan oleh ${conflict.nama}.`;

    if (isCreate) {
      if (!form.password) return "Kata sandi wajib diisi untuk akun baru.";
    }
    if (form.password || form.confirmPassword) {
      if (form.password.length < 8) return "Kata sandi minimal 8 karakter.";
      if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password)) {
        return "Kata sandi harus mengandung huruf dan angka.";
      }
      if (form.password !== form.confirmPassword) {
        return "Konfirmasi kata sandi tidak cocok.";
      }
    }
    return null;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm(!editingUserId);
    if (err) {
      setFormError(err);
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    if (editingUserId) {
      // Update
      const updates: Partial<UserSession> = {
        nama: form.nama.trim(),
        email: cleanEmail,
        gender: form.gender,
        nip: form.nip.trim(),
        jabatan: form.jabatan.trim(),
        bidang: form.bidang,
        role: form.role,
        fotoProfil: form.fotoProfil,
      };
      if (form.password) updates.password = form.password;
      onUpdateUser(editingUserId, updates);
      toastSuccess("Akun Diperbarui", `Data ${form.nama.trim()} berhasil disimpan.`);
    } else {
      // Create
      onCreateUser({
        nama: form.nama.trim(),
        email: cleanEmail,
        password: form.password,
        gender: form.gender,
        nip: form.nip.trim(),
        jabatan: form.jabatan.trim(),
        bidang: form.bidang,
        role: form.role,
        fotoProfil: form.fotoProfil,
      });
      toastSuccess("Akun Dibuat", `Akun ${form.nama.trim()} berhasil ditambahkan.`);
    }
    closeForm();
  };

  const handleDeleteConfirmed = () => {
    if (!userPendingDelete) return;
    onDeleteUser(userPendingDelete.id);
    toastSuccess("Akun Dihapus", `Akun ${userPendingDelete.nama} telah dihapus.`);
    setUserPendingDelete(null);
  };

  const handleResetPasswordConfirmed = () => {
    if (!userPendingResetPwd) return;
    const newPwd = "password123"; // demo only
    onUpdateUser(userPendingResetPwd.id, { password: newPwd });
    toastSuccess(
      "Kata Sandi Direset",
      `Kata sandi ${userPendingResetPwd.nama} direset ke default (${newPwd}).`
    );
    setUserPendingResetPwd(null);
  };

  // ── Beranda content save ────────────────────────────────────────
  const handleSaveBeranda = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBerandaContent) {
      onUpdateBerandaContent(content);
    }
    toastSuccess("Konten Beranda Tersimpan", "Konten beranda publik berhasil diperbarui.");
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-baznas-ink-8 bg-baznas-paper/30 p-3 text-white shadow-md">
            <ShieldCheck className="h-7 w-7 text-baznas-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-baznas-ink font-poppins">
                Pengelolaan Akun &amp; Pengaturan Beranda Publik
              </h1>
              <span className="inline-block bg-baznas-paper/60 px-3 py-0.5 text-xs font-bold text-baznas-ink border border-baznas-ink-20">
                Superadministrator
              </span>
            </div>
            <p className="text-xs text-baznas-ink/65 mt-0.5">
              Kelola akun pengguna BAZNAS lintas 6 bidang, hak akses, serta kustomisasi beranda publik
            </p>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex flex-wrap items-center rounded-xl bg-baznas-paper/60 p-1 border border-baznas-ink-8 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("manajemen_akun")}
            className={`rounded-lg px-3.5 py-2.5 transition-all flex items-center gap-2 ${
              activeTab === "manajemen_akun"
                ? "bg-white text-baznas-ink font-bold"
                : "text-baznas-ink/65 hover:text-baznas-ink"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Manajemen Akun</span>
          </button>

          <button
            onClick={() => setActiveTab("editor_beranda")}
            className={`rounded-lg px-3.5 py-2.5 transition-all flex items-center gap-2 ${
              activeTab === "editor_beranda"
                ? "bg-white text-baznas-ink font-bold"
                : "text-baznas-ink/65 hover:text-baznas-ink"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-baznas-green-900" />
            <span>Editor Beranda Publik</span>
          </button>

          <button
            onClick={() => setActiveTab("bidang_access")}
            className={`rounded-lg px-3.5 py-2.5 transition-all flex items-center gap-2 ${
              activeTab === "bidang_access"
                ? "bg-white text-baznas-ink font-bold"
                : "text-baznas-ink/65 hover:text-baznas-ink"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Akses Penuh Lintas Bidang</span>
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ═══ TAB 1: MANAJEMEN AKUN ═══ */}
      {canAccessTab(currentUser, "admin", "manajemen_akun") &&
        activeTab === "manajemen_akun" && (
          <div className="space-y-6">
            <div className="border border-baznas-ink-8 bg-baznas-paper/40 p-5 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-baznas-ink shrink-0 mt-0.5" />
              <div className="text-xs text-baznas-ink/85 leading-relaxed">
                <span className="font-bold block">Kebijakan Akun BAZNAS:</span>
                Setiap bidang dapat memiliki banyak akun (pimpinan & staf). Hanya Super Admin
                yang dapat membuat, mengubah, atau menghapus akun. Pengguna biasa hanya dapat
                mengubah email, kata sandi, dan foto profil mereka sendiri melalui menu
                <em> &quot;Profil Saya&quot;</em>.
              </div>
            </div>

            {/* Toolbar */}
            <div className="border border-baznas-ink-8 bg-white p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/40"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, email, NIP, atau jabatan..."
                  className="w-full border border-baznas-ink-20 bg-baznas-paper/40 pl-9 pr-3 py-2 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 focus:bg-white min-h-t-target"
                />
              </div>
              <select
                value={filterBidang}
                onChange={(e) => setFilterBidang(e.target.value as UserBidang | "all")}
                className="border border-baznas-ink-20 bg-white px-3 py-2 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="all">Semua Bidang</option>
                {(Object.keys(USER_BIDANG_LABELS) as UserBidang[]).map((b) => (
                  <option key={b} value={b}>
                    {USER_BIDANG_LABELS[b]}
                  </option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserPermission | "all")}
                className="border border-baznas-ink-20 bg-white px-3 py-2 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="all">Semua Hak Akses</option>
                <option value="admin">Super Admin</option>
                <option value="user">Pengguna</option>
              </select>
              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2 text-xs font-bold text-white transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Akun Baru</span>
              </button>
            </div>

            {/* User table */}
            <div className="border border-baznas-ink-8 bg-white overflow-hidden">
              <div className="p-4 border-b border-baznas-ink-8 bg-baznas-paper/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-baznas-ink font-poppins">
                    Daftar Akun Pengguna
                  </h3>
                  <p className="text-[11px] text-baznas-ink/65">
                    {filteredUsers.length} dari {userAccounts.length} akun
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-baznas-ink/85">
                  <thead className="bg-baznas-paper/60 text-[10px] font-bold text-baznas-ink/65 uppercase tracking-wider border-b border-baznas-ink-8">
                    <tr>
                      <th className="py-3 px-4">Foto</th>
                      <th className="py-3 px-4">Nama / Email</th>
                      <th className="py-3 px-4">NIP</th>
                      <th className="py-3 px-4">Jabatan</th>
                      <th className="py-3 px-4">Bidang</th>
                      <th className="py-3 px-4">Hak Akses</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-baznas-ink-8">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-baznas-paper/30 transition-colors">
                        <td className="py-3 px-4">
                          {u.fotoProfil ? (
                            <img
                              src={u.fotoProfil}
                              alt={u.nama}
                              className="h-9 w-9 object-cover border border-baznas-ink-8"
                            />
                          ) : (
                            <div className="h-9 w-9 bg-baznas-green-900 text-white flex items-center justify-center">
                              <span className="text-[10px] font-bold">
                                {u.nama
                                  .split(/\s+/)
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((w) => w[0]?.toUpperCase() || "")
                                  .join("")}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-baznas-ink leading-tight">{u.nama}</p>
                          <p className="text-[10px] text-baznas-ink/60 mt-0.5 font-mono">
                            {u.email}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">{u.nip}</td>
                        <td className="py-3 px-4">{u.jabatan}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-baznas-paper border border-baznas-ink-20 px-2 py-0.5 text-[10px] font-bold text-baznas-green-900">
                            {USER_BIDANG_LABELS[u.bidang]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 bg-baznas-ink text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-block bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              Pengguna
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="inline-flex items-center gap-1 border border-baznas-ink-20 hover:border-baznas-green-800 hover:bg-baznas-paper px-2.5 py-1.5 text-[11px] font-semibold text-baznas-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                              title="Ubah akun"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Ubah</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserPendingResetPwd(u)}
                              className="inline-flex items-center gap-1 border border-baznas-ink-20 hover:border-baznas-gold-display hover:bg-baznas-paper px-2.5 py-1.5 text-[11px] font-semibold text-baznas-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-gold-display"
                              title="Reset kata sandi ke default"
                            >
                              <KeyRound className="h-3 w-3" />
                            </button>
                            {u.id !== currentUser.id && (
                              <button
                                type="button"
                                onClick={() => setUserPendingDelete(u)}
                                className="inline-flex items-center gap-1 border border-baznas-ink-20 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1.5 text-[11px] font-semibold text-baznas-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
                                title="Hapus akun"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-baznas-ink/60">
                          <p className="text-sm font-semibold">Tidak ada akun ditemukan</p>
                          <p className="text-[11px] mt-1">
                            Coba ubah filter atau kata kunci pencarian.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* ═══ TAB 2: EDITOR BERANDA PUBLIK ═══ */}
      {canAccessTab(currentUser, "admin", "editor_beranda") &&
        activeTab === "editor_beranda" && (
          <form onSubmit={handleSaveBeranda} className="space-y-6">
            <div className="rounded-2xl border border-baznas-gold-display bg-baznas-paper p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-baznas-green-900 font-poppins">
                    Editor Tampilan &amp; Konten Beranda Publik
                  </h3>
                  <span className="inline-block bg-baznas-paper/60 text-baznas-green-900 text-[10px] font-bold px-2 py-0.5">
                    Akses Admin
                  </span>
                </div>
                <p className="text-xs text-baznas-green-900 mt-0.5">
                  Ubah informasi teks hero banner, statistik capaian, visi-misi, rekening bank,
                  serta alamat kantor yang tampil di beranda depan
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/25 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Beranda</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
                <h4 className="text-sm font-bold text-baznas-ink font-poppins flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
                  <Sparkles className="h-4 w-4 text-baznas-gold-500" />
                  <span>1. Hero Banner Utama</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                    Tagline / Prinsip 3A
                  </label>
                  <input
                    type="text"
                    value={content.heroTagline}
                    onChange={(e) => setContent({ ...content, heroTagline: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none focus:bg-white focus:border-baznas-green-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                    Judul Utama Hero
                  </label>
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs font-bold text-baznas-ink focus:outline-none focus:bg-white focus:border-baznas-green-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                    Deskripsi / Subtitle Hero
                  </label>
                  <textarea
                    rows={3}
                    value={content.heroSubtitle}
                    onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none focus:bg-white focus:border-baznas-green-700"
                  />
                </div>
              </div>

              <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
                <h4 className="text-sm font-bold text-baznas-ink font-poppins flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
                  <Building className="h-4 w-4 text-baznas-green-900" />
                  <span>2. Capaian Statistik Publik</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                      Total Penghimpunan
                    </label>
                    <input
                      type="text"
                      value={content.totalPenghimpunan}
                      onChange={(e) => setContent({ ...content, totalPenghimpunan: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs font-bold text-baznas-ink focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                      Mustahik Penerima
                    </label>
                    <input
                      type="text"
                      value={content.totalMustahik}
                      onChange={(e) => setContent({ ...content, totalMustahik: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs font-bold text-baznas-ink focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                      Tingkat Penyaluran
                    </label>
                    <input
                      type="text"
                      value={content.tingkatPenyaluran}
                      onChange={(e) => setContent({ ...content, tingkatPenyaluran: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs font-bold text-baznas-ink focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                      Opini Audit Keuangan
                    </label>
                    <input
                      type="text"
                      value={content.opiniAudit}
                      onChange={(e) => setContent({ ...content, opiniAudit: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs font-bold text-baznas-ink focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
                <h4 className="text-sm font-bold text-baznas-ink font-poppins flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
                  <Compass className="h-4 w-4 text-baznas-ink" />
                  <span>3. Visi &amp; Misi BAZNAS</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                    Visi Lembaga
                  </label>
                  <textarea
                    rows={2}
                    value={content.visi}
                    onChange={(e) => setContent({ ...content, visi: e.target.value })}
                    className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-4 py-4 text-xs text-baznas-ink focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-baznas-ink/80 mb-1">
                    Misi Lembaga (Tiap Butir)
                  </label>
                  <div className="space-y-2">
                    {content.misiList.map((misi, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={misi}
                        onChange={(e) => {
                          const newM = [...content.misiList];
                          newM[idx] = e.target.value;
                          setContent({ ...content, misiList: newM });
                        }}
                        className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:bg-white"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
                <h4 className="text-sm font-bold text-baznas-ink font-poppins flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
                  <CreditCard className="h-4 w-4 text-baznas-green-900" />
                  <span>4. Rekening Bank &amp; Kontak Kantor</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-baznas-ink/65 mb-1">Nomor Rekening Bank Sulutgo</label>
                    <input
                      type="text"
                      value={content.bankSulutgo}
                      onChange={(e) => setContent({ ...content, bankSulutgo: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 font-mono text-baznas-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-baznas-ink/65 mb-1">Nomor Rekening Bank Muamalat</label>
                    <input
                      type="text"
                      value={content.bankMuamalat}
                      onChange={(e) => setContent({ ...content, bankMuamalat: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 font-mono text-baznas-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-baznas-ink/65 mb-1">Nomor Rekening Bank BTN Syariah</label>
                    <input
                      type="text"
                      value={content.bankBtn}
                      onChange={(e) => setContent({ ...content, bankBtn: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 font-mono text-baznas-ink focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-baznas-ink/65 mb-1">No. Telepon / WA</label>
                      <input
                        type="text"
                        value={content.telepon}
                        onChange={(e) => setContent({ ...content, telepon: e.target.value })}
                        className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 text-baznas-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-baznas-ink/65 mb-1">Email Resmi</label>
                      <input
                        type="text"
                        value={content.email}
                        onChange={(e) => setContent({ ...content, email: e.target.value })}
                        className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 text-baznas-ink focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-baznas-ink/65 mb-1">Alamat Kantor</label>
                    <input
                      type="text"
                      value={content.alamat}
                      onChange={(e) => setContent({ ...content, alamat: e.target.value })}
                      className="w-full rounded-xl border border-baznas-ink-8 bg-baznas-paper/40 px-3 py-2.5 text-baznas-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-baznas-green-800/25 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Beranda</span>
              </button>
            </div>
          </form>
        )}

      {/* ═══ TAB 3: AKSES PENUH LINTAS BIDANG ═══ */}
      {canAccessTab(currentUser, "admin", "bidang_access") &&
        activeTab === "bidang_access" && (
          <div className="space-y-6">
            <div className="border border-baznas-ink-8 bg-white p-5">
              <h3 className="text-sm font-bold text-baznas-ink font-poppins mb-1">
                Buka Langsung Dashboard Kerja Bidang
              </h3>
              <p className="text-xs text-baznas-ink/65 mb-4">
                Sebagai Administrator, Anda dapat langsung beralih ke tampilan operasional
                bidang untuk monitoring data atau perbaikan entri.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { role: "bidang1", name: "Bidang I (Pengumpulan)", desc: "Entri muzakki, setoran zakat, infak, DSKL & kas loket" },
                  { role: "bidang2", name: "Bidang II (Pendistribusian)", desc: "Data mustahik, program bantuan, dan pengajuan SPK" },
                  { role: "bidang3", name: "Bidang III (Keuangan)", desc: "Realisasi RKAT, BKU kas umum, dan laporan PSAK 109" },
                  { role: "bidang4", name: "Bidang IV (Administrasi)", desc: "Agenda surat masuk/keluar, format Word & inventaris aset" },
                  { role: "ketua", name: "Dashboard Ketua", desc: "Disposisi surat masuk dan otorisasi persetujuan SPK" },
                ].map((item) => (
                  <a
                    key={item.role}
                    href={`#${item.role}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Just informational — admin stays on admin view, can switch via the
                      // dropdown at top of sidebar. We don't navigate away from this view.
                      toastSuccess(
                        "Gunakan Dropdown",
                        `Ganti modul ke "${item.name}" melalui dropdown "Ganti Modul" di sidebar.`
                      );
                    }}
                    className="cursor-pointer rounded-xl border border-baznas-ink-8 bg-baznas-paper/30 p-5 hover:border-baznas-green-800 hover:bg-white transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-baznas-ink group-hover:text-baznas-green-800 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-baznas-ink/65 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-baznas-green-800 pt-2 border-t border-baznas-ink-8">
                      <span>Buka Modul</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ═══ MODAL: BUAT / UBAH AKUN ═══ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-baznas-ink-8 shadow-lift overflow-hidden my-auto max-h-[94vh] flex flex-col">
            <div className="border border-baznas-ink-8 bg-baznas-ink px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="border border-baznas-gold-display p-2 text-baznas-gold-display">
                  {editingUserId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold font-poppins text-white">
                    {editingUserId ? "Ubah Akun Pengguna" : "Buat Akun Baru"}
                  </h3>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Isi semua field identitas dan kredensial login
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 h-t-target w-t-target transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="flex items-start gap-2 border-l-4 border-rose-700 bg-rose-50 p-3 text-xs text-rose-900">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-700 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ── Foto Profil ──────────────────────────────────────── */}
              <div className="flex items-start gap-5 border-b border-baznas-ink-8 pb-5">
                <div className="shrink-0">
                  <div className="h-20 w-20 border border-baznas-ink-8 overflow-hidden bg-baznas-paper/40 flex items-center justify-center">
                    {form.fotoProfil ? (
                      <img
                        src={form.fotoProfil}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-7 w-7 text-baznas-ink/30" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Foto Profil
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 border border-baznas-ink-20 hover:border-baznas-green-800 hover:bg-baznas-paper px-3 py-2 text-[11px] font-semibold text-baznas-ink transition-colors min-h-t-target"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Unggah</span>
                    </button>
                    {form.fotoProfil && (
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, fotoProfil: undefined }))}
                        className="flex items-center gap-1.5 border border-baznas-ink-20 hover:border-rose-700 hover:bg-rose-50 hover:text-rose-700 px-3 py-2 text-[11px] font-semibold text-baznas-ink/70 transition-colors min-h-t-target"
                      >
                        <X className="h-3 w-3" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-baznas-ink/55 mt-1.5">
                    JPG/PNG/WebP, maksimal 500KB.
                  </p>
                </div>
              </div>

              {/* ── Identitas ───────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <div className="flex gap-3 pt-1.5">
                    {(["L", "P"] as UserGender[]).map((g) => (
                      <label
                        key={g}
                        className={`flex-1 inline-flex items-center justify-center gap-2 border px-3 py-2.5 cursor-pointer transition-colors min-h-t-target ${
                          form.gender === g
                            ? "border-baznas-green-800 bg-baznas-paper text-baznas-ink"
                            : "border-baznas-ink-20 text-baznas-ink/70 hover:border-baznas-ink-40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={() => setForm({ ...form, gender: g })}
                          className="sr-only"
                        />
                        {form.gender === g ? (
                          <CheckSquare className="h-3.5 w-3.5 text-baznas-green-800" />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-baznas-ink/40" />
                        )}
                        <span className="text-xs font-semibold">{USER_GENDER_LABELS[g]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    NIP (18 digit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nip}
                    onChange={(e) =>
                      setForm({ ...form, nip: e.target.value.replace(/\D/g, "").slice(0, 18) })
                    }
                    inputMode="numeric"
                    placeholder="198507142010032004"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Jabatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="cth: Wakil Ketua I — Pengumpulan"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Bidang / Divisi *
                  </label>
                  <select
                    required
                    value={form.bidang}
                    onChange={(e) => setForm({ ...form, bidang: e.target.value as UserBidang })}
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  >
                    {(Object.keys(USER_BIDANG_LABELS) as UserBidang[]).map((b) => (
                      <option key={b} value={b}>
                        {USER_BIDANG_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Hak Akses *
                  </label>
                  <select
                    required
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as UserPermission })
                    }
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  >
                    <option value="user">Pengguna (Staf Biasa)</option>
                    <option value="admin">Super Admin (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              {/* ── Kredensial ──────────────────────────────────────── */}
              <div className="border-t border-baznas-ink-8 pt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                    Email Login *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama@baznas.go.id"
                    autoComplete="off"
                    className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                      Kata Sandi {editingUserId ? "(kosongkan jika tidak diubah)" : "*"}
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        autoComplete="new-password"
                        placeholder="Min 8 karakter, huruf + angka"
                        className="w-full border border-baznas-ink-20 bg-white pl-3 pr-10 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink h-9 w-9"
                        aria-label={showFormPassword ? "Sembunyikan" : "Lihat"}
                      >
                        {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5">
                      Ulangi Kata Sandi
                    </label>
                    <input
                      type={showFormPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                      placeholder="Ketik ulang kata sandi"
                      className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-sm text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-baznas-ink-8">
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-baznas-ink-20 hover:bg-baznas-paper px-4 py-2.5 text-sm font-semibold text-baznas-ink/70 transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-sm font-bold text-white transition-colors min-h-t-target focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingUserId ? "Simpan Perubahan" : "Buat Akun"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM: HAPUS AKUN ═══ */}
      <ConfirmDialog
        open={!!userPendingDelete}
        severity="danger"
        title="Hapus Akun Pengguna?"
        message={
          userPendingDelete
            ? `Akun "${userPendingDelete.nama}" (${userPendingDelete.email}) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Hapus Akun"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setUserPendingDelete(null)}
      />

      {/* ═══ CONFIRM: RESET PASSWORD ═══ */}
      <ConfirmDialog
        open={!!userPendingResetPwd}
        severity="warning"
        title="Reset Kata Sandi?"
        message={
          userPendingResetPwd
            ? `Kata sandi untuk "${userPendingResetPwd.nama}" akan direset ke default "password123". Mohon informasikan kata sandi baru secara langsung kepada yang bersangkutan.`
            : ""
        }
        confirmLabel="Reset Kata Sandi"
        cancelLabel="Batal"
        onConfirm={handleResetPasswordConfirmed}
        onCancel={() => setUserPendingResetPwd(null)}
      />
    </div>
  );
};
