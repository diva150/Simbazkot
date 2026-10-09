"use client";

import React, { useState } from "react";
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

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { QuickSearchModal } from "@/components/QuickSearchModal";

import { Bidang1View } from "@/components/modules/Bidang1View";
import { Bidang2View } from "@/components/modules/Bidang2View";
import { Bidang3View } from "@/components/modules/Bidang3View";
import { Bidang4View } from "@/components/modules/Bidang4View";
import { KetuaView } from "@/components/modules/KetuaView";
import { AdminUserManagementView } from "@/components/modules/AdminUserManagementView";

import { KwitansiZisPrint } from "@/components/print/KwitansiZisPrint";
import { DisposisiPrint } from "@/components/print/DisposisiPrint";
import { LaporanKeuanganPrint } from "@/components/print/LaporanKeuanganPrint";

export default function Home() {
  // Authentication & Navigation State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserSession[]>(initialPredefinedUsers);
  const [berandaContent, setBerandaContent] = useState<BerandaContent>(initialBerandaContent);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  // Active Role View (bidang1, bidang2, bidang3, bidang4, ketua, admin)
  const [activeRoleView, setActiveRoleView] = useState<RoleBidang>("bidang1");
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Handlers
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setActiveRoleView(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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

  const handleUpdateUserAccount = (
    role: RoleBidang,
    newUsername: string,
    newPassword?: string
  ) => {
    setUserAccounts((prev) =>
      prev.map((u) =>
        u.role === role
          ? {
              ...u,
              username: newUsername,
              password: newPassword || u.password,
            }
          : u
      )
    );

    if (currentUser?.role === role) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              username: newUsername,
              password: newPassword || prev.password,
            }
          : null
      );
    }
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
  };

  const handleImportMuzakki = (newMuzakki: Muzakki[]) => {
    setMuzakkiList([...newMuzakki, ...muzakkiList]);
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

  const pendingCount =
    pencairanList.filter((p) => p.status === "diajukan").length +
    suratList.filter((s) => s.statusDisposisi === "belum_disposisi").length;

  // ==========================================
  // 1. TAMPILAN JIKA BELUM LOGIN (BERANDA UMUM PUBLIK)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <PublicNavbar
          onOpenLogin={() => setIsLoginModalOpen(true)}
          activeSection={activeSection}
          onNavigateSection={handleNavigateSection}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <PublicLandingView
            onOpenLogin={() => setIsLoginModalOpen(true)}
            activeSection={activeSection}
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Internal */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        pendingCount={pendingCount}
        onToggleSidebar={() => setIsSidebarMobileOpen(true)}
        user={currentUser}
        userAccounts={userAccounts}
        onUpdateUserAccount={handleUpdateUserAccount}
        onLogout={handleLogout}
      />

      {/* Main Layout Internal */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar Navigasi Spesifik Bidang & Modul Utama */}
        <Sidebar
          user={currentUser}
          activeRoleView={activeRoleView}
          onChangeRoleView={(r) => setActiveRoleView(r)}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
          onLogout={handleLogout}
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
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activeRoleView === "bidang1" && (
            <Bidang1View
              muzakkiList={muzakkiList}
              setoranList={setoranList}
              instansiList={initialInstansi}
              onAddSetoran={handleAddSetoran}
              onViewKwitansi={(s) => setSelectedKwitansi(s)}
              onImportMuzakki={handleImportMuzakki}
              activeTab={bidang1Tab}
              onTabChange={setBidang1Tab}
            />
          )}

          {activeRoleView === "bidang2" && (
            <Bidang2View
              mustahikList={mustahikList}
              pencairanList={pencairanList}
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

          {activeRoleView === "bidang3" && (
            <Bidang3View
              rkatList={rkatList}
              onOpenLaporanPrint={() => setIsLaporanPrintOpen(true)}
              activeTab={bidang3Tab}
              onTabChange={setBidang3Tab}
            />
          )}

          {activeRoleView === "bidang4" && (
            <Bidang4View
              suratList={suratList}
              pegawaiList={pegawaiList}
              asetList={asetList}
              onViewDisposisi={(s) => setSelectedDisposisi(s)}
              activeTab={bidang4Tab}
              onTabChange={setBidang4Tab}
            />
          )}

          {activeRoleView === "ketua" && (
            <KetuaView
              suratList={suratList}
              setoranList={setoranList}
              muzakkiList={muzakkiList}
              mustahikList={mustahikList}
              pencairanList={pencairanList}
              rkatList={rkatList}
              pegawaiList={pegawaiList}
              asetList={asetList}
              onUpdateSuratDisposisi={handleUpdateSuratDisposisi}
              onViewDisposisi={(s) => setSelectedDisposisi(s)}
              onApproveSPK={handleApprovePencairan}
              onRejectSPK={handleRejectPencairan}
              activeTab={ketuaTab}
              onTabChange={setKetuaTab}
            />
          )}

          {activeRoleView === "admin" && (
            <AdminUserManagementView
              userAccounts={userAccounts}
              berandaContent={berandaContent}
              onUpdateBerandaContent={setBerandaContent}
              onUpdateUserAccount={handleUpdateUserAccount}
              onSwitchToBidang={(r) => setActiveRoleView(r)}
              activeTab={adminTab}
              onTabChange={setAdminTab}
            />
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
            setActiveRoleView(b);
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
    </div>
  );
}
