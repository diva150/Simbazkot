"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calculator,
  Lock,
  Users,
  Compass,
  Target,
  MapPin,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { BerandaContent } from "@/lib/types";
import { initialBerandaContent, strukturOrganisasiResmiData } from "@/lib/mock-data";

interface PublicLandingViewProps {
  onOpenLogin: () => void;
  activeSection: string;
  berandaContent?: BerandaContent;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onOpenLogin,
  berandaContent = initialBerandaContent,
}) => {
  // Public Calculator State
  const [gajiPublik, setGajiPublik] = useState<number>(7500000);
  const zakatPublik = Math.round(gajiPublik * 0.025);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-baznas-green-900 via-baznas-green-800 to-emerald-800 p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-baznas-green-900/20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs mb-4 border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-baznas-gold-500" />
            <span>{berandaContent.heroTagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-poppins leading-tight">
            {berandaContent.heroTitle}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            {berandaContent.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById("kalkulator");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 rounded-xl bg-baznas-gold-500 hover:bg-baznas-gold-600 px-6 py-3 text-xs font-bold text-slate-900 shadow-lg shadow-baznas-gold-500/25 transition-all"
            >
              <Calculator className="h-4 w-4" />
              <span>Hitung Zakat Sekarang</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-bold text-white transition-all backdrop-blur-xs"
            >
              <Lock className="h-4 w-4 text-emerald-300" />
              <span>Masuk Portal Petugas</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Capaian Publik Dinamis */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8 text-center sm:text-left">
          <div>
            <p className="text-xs text-emerald-200 font-medium">Total Penghimpunan</p>
            <p className="text-xl sm:text-2xl font-extrabold font-poppins mt-1">
              {berandaContent.totalPenghimpunan}
            </p>
            <span className="text-[10px] text-emerald-300/80">Tahun Berjalan 2026</span>
          </div>
          <div>
            <p className="text-xs text-emerald-200 font-medium">Mustahik Penerima</p>
            <p className="text-xl sm:text-2xl font-extrabold font-poppins mt-1">
              {berandaContent.totalMustahik}
            </p>
            <span className="text-[10px] text-emerald-300/80">Penerima Bantuan</span>
          </div>
          <div>
            <p className="text-xs text-emerald-200 font-medium">Tingkat Penyaluran</p>
            <p className="text-xl sm:text-2xl font-extrabold font-poppins mt-1">
              {berandaContent.tingkatPenyaluran}
            </p>
            <span className="text-[10px] text-emerald-300/80">Efektivitas Serapan</span>
          </div>
          <div>
            <p className="text-xs text-emerald-200 font-medium">Opini Audit Keuangan</p>
            <p className="text-xl sm:text-2xl font-extrabold font-poppins mt-1 text-baznas-gold-500">
              {berandaContent.opiniAudit}
            </p>
            <span className="text-[10px] text-emerald-300/80">Wajar Tanpa Pengecualian</span>
          </div>
        </div>

        {/* Hiasan Dekoratif */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </section>

      {/* 2. SEKSI KALKULATOR ZAKAT MANDIRI PUBLIK */}
      <section id="kalkulator" className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-10 shadow-xs">
        <div className="max-w-xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-baznas-green-800">
            <Calculator className="h-3.5 w-3.5" />
            <span>Kalkulator Zakat Profesi Otomatis</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-poppins mt-2">
            Hitung Kewajiban Zakat Penghasilan Anda
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Zakat profesi wajib dikeluarkan sebesar 2,5% jika penghasilan telah mencapai batas nisab bulanan.
          </p>
        </div>

        <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penghasilan / Gaji Bersih per Bulan (Rp)
            </label>
            <input
              type="number"
              step="500000"
              value={gajiPublik}
              onChange={(e) => setGajiPublik(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:border-baznas-green-700 shadow-2xs"
            />
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-semibold block">
                Zakat yang Wajib Dikeluarkan (2,5%):
              </span>
              <p className="text-2xl font-black text-baznas-green-900 font-poppins mt-0.5">
                {formatRupiah(zakatPublik)}
              </p>
            </div>
            <button
              onClick={onOpenLogin}
              className="rounded-xl bg-baznas-green-800 hover:bg-baznas-green-700 text-white px-4 py-2 text-xs font-bold shadow-md transition-colors"
            >
              Bayar Melalui Petugas
            </button>
          </div>
        </div>
      </section>

      {/* 3. SEKSI TENTANG BAZNAS (VISI & MISI DINAMIS) */}
      <section id="tentang" className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-baznas-green-800 uppercase tracking-wider">
            Mengenal Lembaga
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-poppins mt-1">
            Tentang BAZNAS
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Badan Amil Zakat Nasional (BAZNAS) adalah badan resmi yang dibentuk oleh pemerintah yang memiliki tugas dan fungsi menghimpun dan menyalurkan zakat, infak, dan sedekah (ZIS) secara amanah dan akuntabel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 space-y-3">
            <div className="flex items-center gap-2 text-baznas-green-800">
              <Compass className="h-5 w-5 text-baznas-green-700" />
              <h3 className="text-base font-bold text-baznas-green-900 font-poppins">Visi Lembaga</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              &quot;{berandaContent.visi}&quot;
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <Target className="h-5 w-5 text-baznas-green-700" />
              <h3 className="text-base font-bold text-slate-900 font-poppins">Misi Utama</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
              {berandaContent.misiList.map((misi, idx) => (
                <li key={idx}>{misi}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. SEKSI STRUKTUR ORGANISASI RESMI */}
      <section id="struktur" className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-baznas-green-800 uppercase tracking-wider">
            Tata Kelola Lembaga
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-poppins mt-1">
            Bagan Struktur Organisasi BAZNAS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pimpinan dan Pembagian 4 Bidang Kerja
          </p>
        </div>

        {/* Tree Bagan Struktur Resmi */}
        <div className="flex flex-col items-center space-y-6">
          {/* Ketua BAZNAS */}
          <div className="w-80 rounded-2xl border-2 border-baznas-green-800 bg-gradient-to-b from-baznas-green-900 to-baznas-green-800 p-6 text-center text-white shadow-xl shadow-baznas-green-900/25">
            <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-baznas-gold-400 bg-white shadow-lg ring-4 ring-white/20">
              <img
                src={strukturOrganisasiResmiData.ketua.fotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                alt={strukturOrganisasiResmiData.ketua.nama}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-base font-bold font-poppins text-white">
              {strukturOrganisasiResmiData.ketua.nama}
            </h3>
            <span className="inline-block mt-1.5 rounded-full bg-baznas-gold-500 px-3 py-0.5 text-[10px] font-extrabold text-slate-900">
              {strukturOrganisasiResmiData.ketua.jabatan}
            </span>
            <p className="text-[11px] text-emerald-200 mt-1">Penanggung Jawab Utama Kebijakan</p>
          </div>

          {/* Garis Vertikal */}
          <div className="h-6 w-0.5 bg-slate-300" />

          {/* 4 Wakil Ketua & Staf Masing-Masing */}
          <div className="w-full">
            <div className="hidden lg:block h-0.5 w-3/4 mx-auto bg-slate-300 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {strukturOrganisasiResmiData.wakilKetuaList.map((waka) => (
                <div
                  key={waka.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center hover:border-baznas-green-600 transition-colors flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="relative mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-3 border-emerald-600 bg-white shadow-md ring-2 ring-emerald-100">
                      <img
                        src={waka.fotoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"}
                        alt={waka.nama}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-poppins">{waka.nama}</h4>
                    <span className="inline-block mt-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-baznas-green-800">
                      {waka.jabatan}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{waka.bidang}</p>
                  </div>

                  {/* Staf Pelaksana */}
                  <div className="mt-4 pt-3 border-t border-slate-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Staf / Pelaksana:
                    </span>
                    <div className="space-y-2">
                      {waka.stafList.map((staf, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 border border-slate-200 text-xs shadow-2xs hover:border-emerald-300 transition-colors"
                        >
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-200 bg-slate-100">
                            <img
                              src={staf.fotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                              alt={staf.nama}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-[11px] truncate">{staf.nama}</p>
                            <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md truncate mt-0.5">
                              {staf.bidangTugas}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Rapihkan layout staf pelaksana di bidang IV */}
                      {waka.stafList.length === 1 && (
                        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-2.5 text-center text-[10px]">
                          <span className="font-bold text-blue-900 block">Unit Sekretariat &amp; Umum</span>
                          <span className="text-[9px] text-blue-700">Pelayanan Administrasi &amp; Surat Terpadu</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER RESMI DENGAN REKENING & KONTAK DINAMIS */}
      <footer className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-baznas-green-700 text-white font-bold text-lg font-poppins">
                B
              </div>
              <span className="text-lg font-bold font-poppins">BAZNAS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Badan Amil Zakat Nasional — Lembaga resmi pemerintah pengelola zakat, infak, sedekah dan DSKL.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-gold-500 mb-3">
              Rekening Penerimaan Resmi
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>• Bank Sulutgo: <span className="font-mono text-white">{berandaContent.bankSulutgo}</span></p>
              <p>• Bank Muamalat: <span className="font-mono text-white">{berandaContent.bankMuamalat}</span></p>
              <p>• Bank BTN Syariah: <span className="font-mono text-white">{berandaContent.bankBtn}</span></p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-gold-500 mb-3">
              Kontak &amp; Alamat
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> {berandaContent.alamat}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-emerald-400" /> {berandaContent.telepon}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-emerald-400" /> {berandaContent.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Badan Amil Zakat Nasional. Seluruh Hak Cipta Dilindungi.</p>
          <button onClick={onOpenLogin} className="mt-2 sm:mt-0 text-emerald-400 hover:underline">
            Akses Portal Khusus Petugas Bidang
          </button>
        </div>
      </footer>
    </div>
  );
};
