"use client";

import React, { useState } from "react";
import { UserSession, RoleBidang, AdminTab, BerandaContent } from "@/lib/types";
import { initialBerandaContent } from "@/lib/mock-data";
import {
  ShieldAlert,
  KeyRound,
  UserCheck,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Globe,
  Sparkles,
  Save,
  Compass,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
} from "lucide-react";

interface AdminUserManagementViewProps {
  userAccounts: UserSession[];
  berandaContent?: BerandaContent;
  onUpdateBerandaContent?: (newContent: BerandaContent) => void;
  onUpdateUserAccount: (
    role: RoleBidang,
    newUsername: string,
    newPassword?: string
  ) => void;
  onSwitchToBidang: (role: RoleBidang) => void;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

export const AdminUserManagementView: React.FC<AdminUserManagementViewProps> = ({
  userAccounts,
  berandaContent: propContent,
  onUpdateBerandaContent,
  onUpdateUserAccount,
  onSwitchToBidang,
  activeTab: propTab,
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<AdminTab>("manajemen_akun");
  const activeTab = propTab || localTab;
  const setActiveTab = (tab: AdminTab) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  // State Editor Beranda Publik
  const [content, setContent] = useState<BerandaContent>(propContent || initialBerandaContent);

  // State Modal Edit Akun
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<UserSession | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenEdit = (account: UserSession) => {
    setSelectedAccountForEdit(account);
    setNewUsername(account.username);
    setNewPassword(account.password || "password123");
    setConfirmPassword(account.password || "password123");
    setErrorModal(null);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorModal("Username tidak boleh kosong.");
      return;
    }

    // Cek konflik username
    const conflict = userAccounts.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.role !== selectedAccountForEdit?.role
    );
    if (conflict) {
      setErrorModal(`Username '${cleanUsername}' sudah digunakan oleh ${conflict.roleLabel}.`);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorModal("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!selectedAccountForEdit) return;

    onUpdateUserAccount(selectedAccountForEdit.role, cleanUsername, newPassword);
    setSuccessToast(`Akun ${selectedAccountForEdit.roleLabel} berhasil diperbarui!`);
    setSelectedAccountForEdit(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Simpan Konten Beranda
  const handleSaveBeranda = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBerandaContent) {
      onUpdateBerandaContent(content);
    }
    setSuccessToast("Konten beranda publik berhasil diperbarui dan disimpan!");
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-3 text-white shadow-md">
            <Shield className="h-7 w-7 text-baznas-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-poppins">
                Pengelolaan Akun &amp; Pengaturan Beranda Publik
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-800 border border-slate-300">
                Superadministrator
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola 1 akun resmi per bidang, hak akses lintas bidang, serta kustomisasi seluruh isi teks pada landing page Beranda Umum
            </p>
          </div>
        </div>

        {/* Tab Navigator Admin */}
        <div className="flex flex-wrap items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("manajemen_akun")}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-2 ${
              activeTab === "manajemen_akun"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Manajemen Akun Bidang</span>
          </button>

          <button
            onClick={() => setActiveTab("editor_beranda")}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-2 ${
              activeTab === "editor_beranda"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <span>Editor Beranda Publik</span>
          </button>

          <button
            onClick={() => setActiveTab("bidang_access")}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-2 ${
              activeTab === "bidang_access"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Akses Penuh Lintas Bidang</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-baznas-green-900 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* TAB 1: MANAJEMEN AKUN (1 USERNAME PER BIDANG) */}
      {activeTab === "manajemen_akun" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block">Ketentuan Akun Resmi BAZNAS:</span>
              Setiap Bidang hanya dialokasikan <strong>1 username resmi</strong> yang dipegang oleh pimpinan bidang / staf yang didelegasikan. Administrator dapat merubah username dan kata sandi berkala untuk pemeliharaan keamanan sistem.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-800 font-poppins">
                Daftar 6 Akun Utama BAZNAS
              </h3>
              <p className="text-xs text-slate-500">
                Total 6 Akun: 4 Bidang Kerja, 1 Akun Ketua/Pimpinan, dan 1 Akun Administrator Sistem
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Role / Unit Kerja</th>
                    <th className="py-3 px-4">Pejabat Penanggung Jawab</th>
                    <th className="py-3 px-4">Jabatan Resmi</th>
                    <th className="py-3 px-4">Username Login</th>
                    <th className="py-3 px-4">Kata Sandi</th>
                    <th className="py-3 px-4 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userAccounts.map((account) => (
                    <tr key={account.role} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{account.roleLabel}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                          {account.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {account.nama}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {account.jabatan}
                      </td>
                      <td className="py-3.5 px-4">
                        <code className="bg-slate-100 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold text-baznas-green-900 border border-slate-200">
                          {account.username}
                        </code>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-400 font-mono tracking-widest text-[11px]">
                          ••••••••
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(account)}
                          className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white transition-all shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Ubah Kredensial</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR KONTEN BERANDA PUBLIK (ADMIN OVERRIDE) */}
      {activeTab === "editor_beranda" && (
        <form onSubmit={handleSaveBeranda} className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-baznas-green-900 font-poppins">
                  Editor Tampilan &amp; Konten Beranda Publik
                </h3>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Akses Admin
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Ubah informasi teks hero banner, statistik capaian, visi-misi, rekening bank, serta alamat kantor yang tampil di beranda depan
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
            {/* Bagian Hero & Tagline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800 font-poppins flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sparkles className="h-4 w-4 text-baznas-gold-500" />
                <span>1. Hero Banner Utama</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Prinsip 3A
                </label>
                <input
                  type="text"
                  value={content.heroTagline}
                  onChange={(e) => setContent({ ...content, heroTagline: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-baznas-green-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Utama Hero (Hero Title)
                </label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-baznas-green-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Subtitle Hero
                </label>
                <textarea
                  rows={3}
                  value={content.heroSubtitle}
                  onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-baznas-green-700"
                />
              </div>
            </div>

            {/* Bagian Capaian Statistik */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800 font-poppins flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building className="h-4 w-4 text-emerald-600" />
                <span>2. Capaian Statistik Publik</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Penghimpunan
                  </label>
                  <input
                    type="text"
                    value={content.totalPenghimpunan}
                    onChange={(e) => setContent({ ...content, totalPenghimpunan: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mustahik Penerima
                  </label>
                  <input
                    type="text"
                    value={content.totalMustahik}
                    onChange={(e) => setContent({ ...content, totalMustahik: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Penyaluran
                  </label>
                  <input
                    type="text"
                    value={content.tingkatPenyaluran}
                    onChange={(e) => setContent({ ...content, tingkatPenyaluran: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opini Audit Keuangan
                  </label>
                  <input
                    type="text"
                    value={content.opiniAudit}
                    onChange={(e) => setContent({ ...content, opiniAudit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-amber-700 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Visi & Misi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800 font-poppins flex items-center gap-2 border-b border-slate-100 pb-2">
                <Compass className="h-4 w-4 text-blue-600" />
                <span>3. Visi &amp; Misi BAZNAS</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visi Lembaga
                </label>
                <textarea
                  rows={2}
                  value={content.visi}
                  onChange={(e) => setContent({ ...content, visi: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian Rekening Bank & Kontak */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800 font-poppins flex items-center gap-2 border-b border-slate-100 pb-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>4. Rekening Bank &amp; Kontak Kantor</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Nomor Rekening Bank Sulutgo</label>
                  <input
                    type="text"
                    value={content.bankSulutgo}
                    onChange={(e) => setContent({ ...content, bankSulutgo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Nomor Rekening Bank Muamalat</label>
                  <input
                    type="text"
                    value={content.bankMuamalat}
                    onChange={(e) => setContent({ ...content, bankMuamalat: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Nomor Rekening Bank BTN Syariah</label>
                  <input
                    type="text"
                    value={content.bankBtn}
                    onChange={(e) => setContent({ ...content, bankBtn: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">No. Telepon / WA</label>
                    <input
                      type="text"
                      value={content.telepon}
                      onChange={(e) => setContent({ ...content, telepon: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Email Resmi</label>
                    <input
                      type="text"
                      value={content.email}
                      onChange={(e) => setContent({ ...content, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Alamat Kantor</label>
                  <input
                    type="text"
                    value={content.alamat}
                    onChange={(e) => setContent({ ...content, alamat: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none"
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

      {/* TAB 3: AKSES BIDANG (SUPERADMIN OVERRIDE) */}
      {activeTab === "bidang_access" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 font-poppins mb-1">
              Buka Langsung Dashboard Kerja Bidang
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sebagai Administrator, Anda dapat langsung beralih ke tampilan operasional bidang untuk monitoring data atau perbaikan entri.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { role: "bidang1", name: "Bidang I (Pengumpulan)", desc: "Entri muzakki, setoran zakat, infak, DSKL & kas loket" },
                { role: "bidang2", name: "Bidang II (Pendistribusian)", desc: "Data mustahik, program bantuan, dan pengajuan SPK" },
                { role: "bidang3", name: "Bidang III (Keuangan)", desc: "Realisasi RKAT, BKU kas umum, dan laporan PSAK 109" },
                { role: "bidang4", name: "Bidang IV (Administrasi)", desc: "Agenda surat masuk/keluar, format Word & inventaris aset" },
                { role: "ketua", name: "Dashboard Ketua", desc: "Disposisi surat masuk dan otorisasi persetujuan SPK" },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => onSwitchToBidang(item.role as RoleBidang)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-slate-400 hover:bg-white transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-baznas-green-800 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-baznas-green-800 pt-2 border-t border-slate-100">
                    <span>Buka Modul</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH KREDENSIAL AKUN */}
      {selectedAccountForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-poppins text-white">
                  Ubah Akun Login Bidang
                </h3>
                <p className="text-xs text-slate-400">
                  Unit: {selectedAccountForEdit.roleLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedAccountForEdit(null)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs">
              {errorModal && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorModal}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username Resmi (1 per Bidang) *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pr-10 text-slate-800 focus:outline-none focus:border-slate-800"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi kata sandi baru..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForEdit(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 font-bold text-white shadow-md"
                >
                  Simpan Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
