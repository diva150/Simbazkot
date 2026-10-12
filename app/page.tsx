"use client";

import React, { useEffect, useState } from "react";
import {
  RoleBidang,
  UserSession,
  Muzakki,
  SetoranZIS,
  Mustahik,
  PermohonanPencairan,
  ItemRKAT,
  Surat,
  Pegawai,
  AsetKantor,
  Bidang1Tab,
  Bidang2Tab,
  Bidang3Tab,
  Bidang4Tab,
  KetuaTab,
  AdminTab,
  BerandaContent,
} from "@/lib/types";
import {
  initialInstansi,
  initialMuzakki,
  initialSetoran,
  initialMustahik,
  initialPencairan,
  initialRKAT,
  initialSurat,
  initialPegawai,
  initialAset,
  initialPredefinedUsers,
  initialBerandaContent,
} from "@/lib/mock-data";

import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicLandingView } from "@/components/public/PublicLandingView";
import { LoginModal } from "@/components/public/LoginModal";
import { ToastContainer, useToast } from "@/components/common";
import { canAccessView, getHomeViewFor } from "@/lib/access";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { QuickSearchModal } from "@/components/QuickSearchModal";

import { Bidang1View } from "@/components/modules/Bidang1View";
import { Bidang2View } from "@/components/modules/Bidang2View";
import { Bidang3View } from "@/components/modules/Bidang3View";
import { Bidang4View } from "@/components/modules/Bidang4View";
import { KetuaView } from "@/components/modules/KetuaView";
import { AdminUserManagementView } from "@/components/modules/AdminUserManagementView";
import { ProfilSayaView } from "@/components/modules/ProfilSayaView";
import { BerandaView } from "@/components/modules/BerandaView";

import { KwitansiZisPrint } from "@/components/print/KwitansiZisPrint";
import { DisposisiPrint } from "@/components/print/DisposisiPrint";
import { LaporanKeuanganPrint } from "@/components/print/LaporanKeuanganPrint";

export default function Home() {
  // Toast notifications (UX-IMPROVEMENT-PLAN §3.2)
  const { toasts, dismiss: dismissToast, success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Authentication & Navigation State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserSession[]>(initialPredefinedUsers);
  const [berandaContent, setBerandaContent] = useState<BerandaContent>(initialBerandaContent);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  // Active Role View (bidang1, bidang2, bidang3, bidang4, ketua, admin)
  // Restricted by the logged-in user's role — see `canAccessView` in lib/access.ts.
  const [activeRoleView, setActiveRoleView] = useState<RoleBidang>("bidang1");
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showBeranda, setShowBeranda] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // Sub-tabs State for each module
  const [bidang1Tab, setBidang1Tab] = useState<Bidang1Tab>("dashboard");
  const [bidang2Tab, setBidang2Tab] = useState<Bidang2Tab>("dashboard");
  const [bidang3Tab, setBidang3Tab] = useState<Bidang3Tab>("dashboard");
  const [bidang4Tab, setBidang4Tab] = useState<Bidang4Tab>("dashboard");
  const [ketuaTab, setKetuaTab] = useState<KetuaTab>("disposisi");
  const [adminTab, setAdminTab] = useState<AdminTab>("manajemen_akun");

  // App Central Data Store
  const [muzakkiList, setMuzakkiList] = useState<Muzakki[]>(initialMuzakki);
  const [setoranList, setSetoranList] = useState<SetoranZIS[]>(initialSetoran);
  const [mustahikList, setMustahikList] = useState<Mustahik[]>(initialMustahik);
  const [pencairanList, setPencairanList] = useState<PermohonanPencairan[]>(initialPencairan);
  const [rkatList, setRkatList] = useState<ItemRKAT[]>(initialRKAT);
  const [suratList, setSuratList] = useState<Surat[]>(initialSurat);
  const [pegawaiList] = useState<Pegawai[]>(initialPegawai);
  const [asetList] = useState<AsetKantor[]>(initialAset);

  // Print States
  const [selectedKwitansi, setSelectedKwitansi] = useState<SetoranZIS | null>(null);
  const [selectedDisposisi, setSelectedDisposisi] = useState<Surat | null>(null);
  const [isLaporanPrintOpen, setIsLaporanPrintOpen] = useState(false);

  // Auto-trigger window.print() when a print modal opens (with small render delay).
  // Cleanup clears the timer to prevent printing a modal that was closed quickly,
  // or duplicate prints if the state were ever to be re-set in the same cycle.
  useEffect(() => {
    if (selectedKwitansi) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedKwitansi]);

  useEffect(() => {
    if (selectedDisposisi) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedDisposisi]);

  useEffect(() => {
    if (isLaporanPrintOpen) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [isLaporanPrintOpen]);

  // Handlers
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setActiveRoleView(getHomeViewFor(user));
    setShowBeranda(true);
    setShowProfile(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfile(false);
  };

  const handleOpenProfile = () => {
    setShowProfile(true);
    setShowBeranda(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleNavigateSection = (secId: string) => {
    setActiveSection(secId);
    if (secId === "beranda") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(secId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCreateUser = (newUser: Omit<UserSession, "id" | "createdAt">) => {
    const id = `u-${String(userAccounts.length + 1).padStart(3, "0")}`;
    setUserAccounts((prev) => [
      ...prev,
      { ...newUser, id, createdAt: new Date().toISOString() },
    ]);
  };

  const handleUpdateUser = (userId: string, updates: Partial<UserSession>) => {
    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, ...updates, updatedAt: new Date().toISOString() }
          : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? { ...prev, ...updates, updatedAt: new Date().toISOString() }
          : null
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserAccounts((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      // Guard: we never call delete on self (UI prevents it), but if we did,
      // log out to avoid a logged-in user with no account.
      setCurrentUser(null);
    }
  };

  const handleSelfUpdate = (
    updates: Partial<Pick<UserSession, "email" | "password" | "fotoProfil">>
  ) => {
    if (!currentUser) return;
    handleUpdateUser(currentUser.id, updates);
  };

  const handleUpdateSuratDisposisi = (
    suratId: string,
    disposisiData: {
      tujuanDisposisi: string;
      instruksi: string;
      sifat: string;
      catatan: string;
    }
  ) => {
    setSuratList((prev) =>
      prev.map((s) =>
        s.id === suratId
          ? {
              ...s,
              statusDisposisi: "sudah_disposisi",
              tujuanDisposisi: disposisiData.tujuanDisposisi,
              instruksiDisposisi: disposisiData.instruksi,
              sifatDisposisi: disposisiData.sifat,
              catatanDisposisi: disposisiData.catatan,
              disposisiTujuan: disposisiData.tujuanDisposisi,
              catatanArahan: disposisiData.catatan,
            }
          : s
      )
    );
  };

  const handleAddSetoran = (newSetoran: SetoranZIS) => {
    setSetoranList([newSetoran, ...setoranList]);
    setMuzakkiList((prev) =>
      prev.map((m) =>
        m.id === newSetoran.muzakkiId
          ? { ...m, totalSetoran: m.totalSetoran + newSetoran.nominal }
          : m
      )
    );
    toastSuccess(
      "Setoran berhasil dicatat",
      `Bukti ${newSetoran.buktiNo} untuk ${newSetoran.namaMuzakki}`
    );
  };

  const handleImportMuzakki = (newMuzakki: Muzakki[]) => {
    setMuzakkiList([...newMuzakki, ...muzakkiList]);
    toastSuccess(
      "Import berhasil",
      `${newMuzakki.length} data Muzakki ditambahkan`
    );
  };

  const handleImportMustahik = (newMustahik: Mustahik[]) => {
    setMustahikList([...newMustahik, ...mustahikList]);
  };

  const handleApprovePencairan = (id: string) => {
    setPencairanList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "disetujui_ketua",
              approver: currentUser?.nama || "Mohamad Husain Rauf (Ketua BAZNAS)",
              tanggalDisetujuiKetua: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  };

  const handleConfirmPencairanBidang2 = (id: string) => {
    setPencairanList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "dikonfirmasi_bidang2",
              tanggalKonfirmasiBidang2: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  };

  const handleUpdateMustahik = (updated: Mustahik) => {
    setMustahikList((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const handleDeleteMustahik = (id: string) => {
    setMustahikList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMustahik = (newM: Mustahik) => {
    setMustahikList((prev) => [newM, ...prev]);
  };

  const handleRejectPencairan = (id: string, reason: string) => {
    setPencairanList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "ditolak",
              catatanPenolakan: reason,
            }
          : p
      )
    );
  };

  const handleAddPencairan = (newP: PermohonanPencairan) => {
    setPencairanList([newP, ...pencairanList]);
  };

  const pendingPencairan = pencairanList.filter(
    (p) => p.status === "diajukan"
  ).length;
  const pendingSurat = suratList.filter(
    (s) => s.statusDisposisi === "belum_disposisi"
  ).length;

  // Notification reminder handlers — route to the view the current user has
  // access to. For pencairan reminder, prefer bidang2 (where workflow lives),
  // then ketua, then admin. Same for surat reminder: bidang4, then ketua,
  // then admin. Non-admin users without access just see a toast.
  const handleOpenPencairanReminder = () => {
    if (!currentUser) return;
    setShowBeranda(false);
    if (canAccessView(currentUser, "bidang2")) {
      setActiveRoleView("bidang2");
      setBidang2Tab("pencairan");
    } else if (canAccessView(currentUser, "ketua")) {
      setActiveRoleView("ketua");
      setKetuaTab("persetujuan_spk");
    } else if (canAccessView(currentUser, "admin")) {
      setActiveRoleView("admin");
    } else {
      toastInfo(
        "Pencairan Dana",
        "Detail pencairan tersedia di modul Bidang II. Hubungi administrator untuk akses."
      );
    }
  };

  const handleOpenSuratReminder = () => {
    if (!currentUser) return;
    setShowBeranda(false);
    if (canAccessView(currentUser, "bidang4")) {
      setActiveRoleView("bidang4");
      setBidang4Tab("surat_masuk");
    } else if (canAccessView(currentUser, "ketua")) {
      setActiveRoleView("ketua");
      setKetuaTab("disposisi");
    } else if (canAccessView(currentUser, "admin")) {
      setActiveRoleView("admin");
    } else {
      toastInfo(
        "Surat Masuk",
        "Detail surat masuk tersedia di modul Bidang IV. Hubungi administrator untuk akses."
      );
    }
  };

  // ==========================================
  // 1. TAMPILAN JIKA BELUM LOGIN (BERANDA UMUM PUBLIK)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-baznas-paper flex flex-col font-sans">
        <PublicNavbar
          onOpenLogin={() => setIsLoginModalOpen(true)}
          activeSection={activeSection}
          onNavigateSection={handleNavigateSection}
        />

        {/* PublicLandingView handles its own max-width & section padding
            (see <section> wrappers). The <main> only constrains vertical
            flow so the footer sticks to the bottom of the viewport. */}
        <main className="flex-1 w-full">
          <PublicLandingView
            onOpenLogin={() => setIsLoginModalOpen(true)}
            berandaContent={berandaContent}
          />
        </main>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          userAccounts={userAccounts}
        />
      </div>
    );
  }

  // ==========================================
  // 2. TAMPILAN SETELAH LOGIN (DASHBOARD INTERNAL)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Top Header Internal */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        pendingPencairan={pendingPencairan}
        pendingSurat={pendingSurat}
        onOpenPencairanReminder={handleOpenPencairanReminder}
        onOpenSuratReminder={handleOpenSuratReminder}
        onToggleSidebar={() => setIsSidebarMobileOpen((v) => !v)}
        user={currentUser}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />

      {/* Main Layout Internal */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar Navigasi Spesifik Bidang & Modul Utama */}
        <Sidebar
          user={currentUser}
          activeRoleView={activeRoleView}
          onChangeRoleView={(r) => {
            setShowProfile(false);
            setShowBeranda(false);
            setActiveRoleView(r);
          }}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
          onLogout={handleLogout}
          onOpenProfile={handleOpenProfile}
          showProfile={showProfile}
          showBeranda={showBeranda && !showProfile}
          onSelectBeranda={() => {
            setShowProfile(false);
            setShowBeranda(true);
          }}
          bidang1Tab={bidang1Tab}
          onChangeBidang1Tab={setBidang1Tab}
          bidang2Tab={bidang2Tab}
          onChangeBidang2Tab={setBidang2Tab}
          bidang3Tab={bidang3Tab}
          onChangeBidang3Tab={setBidang3Tab}
          bidang4Tab={bidang4Tab}
          onChangeBidang4Tab={setBidang4Tab}
          ketuaTab={ketuaTab}
          onChangeKetuaTab={setKetuaTab}
          adminTab={adminTab}
          onChangeAdminTab={setAdminTab}
        />

        {/* Area Kerja Sesuai Role & View yang Dipilih */}
        <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-full">
          {showBeranda && currentUser && (
            <BerandaView
              user={currentUser}
              onSelectBidang={(b) => {
                if (
                  b === "bidang1" ||
                  b === "bidang2" ||
                  b === "bidang3" ||
                  b === "bidang4" ||
                  b === "ketua" ||
                  b === "admin"
                ) {
                  // Role gate: only admin (or the user themselves) can switch to a view.
                  if (canAccessView(currentUser, b)) {
                    setActiveRoleView(b);
                    setShowProfile(false);
                  } else {
                    toastError(
                      "Akses Ditolak",
                      `Akun Anda tidak memiliki akses ke modul ${b}.`
                    );
                  }
                }
                setShowBeranda(false);
              }}
              setoranList={setoranList}
              pencairanList={pencairanList}
              suratList={suratList}
              mustahikList={mustahikList}
              muzakkiList={muzakkiList}
              rkatList={rkatList}
              onViewKwitansi={(s) => setSelectedKwitansi(s)}
            />
          )}

          {!showBeranda && currentUser && (
            <>
              {activeRoleView === "bidang1" && canAccessView(currentUser, "bidang1") && (
                <Bidang1View
                  muzakkiList={muzakkiList}
                  setoranList={setoranList}
                  instansiList={initialInstansi}
                  currentUser={currentUser}
                  onAddSetoran={handleAddSetoran}
                  onViewKwitansi={(s) => setSelectedKwitansi(s)}
                  onImportMuzakki={handleImportMuzakki}
                  activeTab={bidang1Tab}
                  onTabChange={setBidang1Tab}
                />
              )}

              {activeRoleView === "bidang2" && canAccessView(currentUser, "bidang2") && (
                <Bidang2View
                  mustahikList={mustahikList}
                  pencairanList={pencairanList}
                  currentUser={currentUser}
                  onApprovePencairan={handleApprovePencairan}
                  onRejectPencairan={handleRejectPencairan}
                  onConfirmPencairan={handleConfirmPencairanBidang2}
                  onAddPencairan={handleAddPencairan}
                  onImportMustahik={handleImportMustahik}
                  onAddMustahik={handleAddMustahik}
                  onUpdateMustahik={handleUpdateMustahik}
                  onDeleteMustahik={handleDeleteMustahik}
                  activeTab={bidang2Tab}
                  onTabChange={setBidang2Tab}
                />
              )}

              {activeRoleView === "bidang3" && canAccessView(currentUser, "bidang3") && (
                <Bidang3View
                  rkatList={rkatList}
                  currentUser={currentUser}
                  onOpenLaporanPrint={() => setIsLaporanPrintOpen(true)}
                  activeTab={bidang3Tab}
                  onTabChange={setBidang3Tab}
                />
              )}

              {activeRoleView === "bidang4" && canAccessView(currentUser, "bidang4") && (
                <Bidang4View
                  suratList={suratList}
                  pegawaiList={pegawaiList}
                  asetList={asetList}
                  currentUser={currentUser}
                  onViewDisposisi={(s) => setSelectedDisposisi(s)}
                  activeTab={bidang4Tab}
                  onTabChange={setBidang4Tab}
                />
              )}

              {activeRoleView === "ketua" && canAccessView(currentUser, "ketua") && (
                <KetuaView
                  suratList={suratList}
                  setoranList={setoranList}
                  muzakkiList={muzakkiList}
                  mustahikList={mustahikList}
                  pencairanList={pencairanList}
                  rkatList={rkatList}
                  pegawaiList={pegawaiList}
                  asetList={asetList}
                  currentUser={currentUser}
                  onUpdateSuratDisposisi={handleUpdateSuratDisposisi}
                  onViewDisposisi={(s) => setSelectedDisposisi(s)}
                  onApproveSPK={handleApprovePencairan}
                  onRejectSPK={handleRejectPencairan}
                  activeTab={ketuaTab}
                  onTabChange={setKetuaTab}
                />
              )}

              {activeRoleView === "admin" && canAccessView(currentUser, "admin") && !showProfile && (
                <AdminUserManagementView
                  userAccounts={userAccounts}
                  berandaContent={berandaContent}
                  currentUser={currentUser}
                  onUpdateBerandaContent={setBerandaContent}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  activeTab={adminTab}
                  onTabChange={setAdminTab}
                />
              )}

              {/* Profil Saya — untuk semua pengguna yang sudah login */}
              {showProfile && currentUser && (
                <ProfilSayaView
                  currentUser={currentUser}
                  onSelfUpdate={handleSelfUpdate}
                />
              )}

              {/* Fallback: jika currentUser tidak punya akses ke activeRoleView
                  (misalnya bidang1 user mencoba setActiveRoleView("ketua") lewat devtools),
                  tampilkan pesan akses ditolak, bukan view orang lain. */}
              {!(
                (activeRoleView === "bidang1" && canAccessView(currentUser, "bidang1")) ||
                (activeRoleView === "bidang2" && canAccessView(currentUser, "bidang2")) ||
                (activeRoleView === "bidang3" && canAccessView(currentUser, "bidang3")) ||
                (activeRoleView === "bidang4" && canAccessView(currentUser, "bidang4")) ||
                (activeRoleView === "ketua" && canAccessView(currentUser, "ketua")) ||
                (activeRoleView === "admin" && canAccessView(currentUser, "admin"))
              ) && !showProfile && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center max-w-md mx-auto mt-12">
                  <h2 className="text-lg font-bold text-rose-900 font-poppins">Akses Ditolak</h2>
                  <p className="text-sm text-rose-800 mt-2">
                    Anda login sebagai <strong>{currentUser.nama}</strong> dan tidak
                    memiliki akses ke modul ini. Silakan kembali ke Beranda atau hubungi
                    administrator.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBeranda(true)}
                    className="inline-flex items-center gap-2 mt-5 rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 px-5 py-2.5 text-sm font-semibold text-white min-h-t-target"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Quick Search Omnibox */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        muzakkiList={muzakkiList}
        mustahikList={mustahikList}
        setoranList={setoranList}
        suratList={suratList}
        onSelectBidang={(b) => {
          if (
            b === "bidang1" ||
            b === "bidang2" ||
            b === "bidang3" ||
            b === "bidang4" ||
            b === "ketua" ||
            b === "admin"
          ) {
            if (canAccessView(currentUser!, b)) {
              setActiveRoleView(b);
            } else {
              toastError(
                "Akses Ditolak",
                `Akun Anda tidak memiliki akses ke modul ${b}.`
              );
            }
          }
        }}
        onViewKwitansi={(s) => setSelectedKwitansi(s)}
      />

      {/* Modal Cetak Kwitansi Resmi Setoran ZIS */}
      <KwitansiZisPrint
        setoran={selectedKwitansi}
        onClose={() => setSelectedKwitansi(null)}
      />

      {/* Modal Cetak Lembar Disposisi Surat Dinas */}
      <DisposisiPrint
        surat={selectedDisposisi}
        onClose={() => setSelectedDisposisi(null)}
      />

      {/* Modal Cetak Laporan Keuangan RKAT A4 Landscape */}
      {isLaporanPrintOpen && (
        <LaporanKeuanganPrint
          rkatList={rkatList}
          onClose={() => setIsLaporanPrintOpen(false)}
        />
      )}

      {/* Toast notifications (UX-IMPROVEMENT-PLAN-30-60.md §3.2) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
