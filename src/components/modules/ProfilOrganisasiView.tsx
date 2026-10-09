"use client";

import React, { useState } from "react";
import { strukturOrganisasiResmiData } from "@/lib/mock-data";
import {
  Building2,
  Users,
  Target,
  Compass,
  Award,
  ChevronDown,
  UserCheck,
} from "lucide-react";

export const ProfilOrganisasiView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"bagan" | "tentang">("bagan");

  return (
    <div className="space-y-6">
      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-100 p-2 text-baznas-green-800">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-poppins">
              Profil Lembaga &amp; Struktur Organisasi BAZNAS
            </h1>
            <p className="text-xs text-slate-500">
              Visi-misi lembaga, struktur kepemimpinan hierarkis, dan pembagian tugas amil
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab("bagan")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeSubTab === "bagan"
                ? "bg-white text-baznas-green-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bagan Struktur Organisasi
          </button>
          <button
            onClick={() => setActiveSubTab("tentang")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeSubTab === "tentang"
                ? "bg-white text-baznas-green-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Visi, Misi &amp; Legalitas
          </button>
        </div>
      </div>

      {/* SUBTAB 1: BAGAN STRUKTUR ORGANISASI */}
      {activeSubTab === "bagan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Periode Masa Bakti 2022 - 2027
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-poppins mt-2">
              Bagan Struktur Kepemimpinan Resmi BAZNAS
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan Keputusan BAZNAS RI &amp; Regulasi Pengelolaan ZIS
            </p>
          </div>

          {/* TREE STRUCTURE ORGANISASI */}
          <div className="flex flex-col items-center space-y-6">
            {/* LEVEL 1: KETUA BAZNAS */}
            <div className="relative flex flex-col items-center">
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
                <span className="inline-block mt-1.5 rounded-full bg-baznas-gold-500 px-3 py-0.5 text-xs font-bold text-slate-900">
                  {strukturOrganisasiResmiData.ketua.jabatan}
                </span>
                <p className="text-[11px] text-emerald-200 mt-1">
                  Penanggung Jawab Kebijakan &amp; Tata Kelola Utama
                </p>
              </div>

              {/* Garis Turun Vertikal */}
              <div className="h-8 w-0.5 bg-slate-300" />
            </div>

            {/* LEVEL 2: 4 WAKIL KETUA & STAF PELAKSANA */}
            <div className="w-full">
              {/* Garis Horizontal Penghubung */}
              <div className="hidden lg:block h-0.5 w-3/4 mx-auto bg-slate-300 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {strukturOrganisasiResmiData.wakilKetuaList.map((waka) => (
                  <div
                    key={waka.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center flex flex-col justify-between hover:border-baznas-green-600 transition-colors shadow-xs"
                  >
                    <div>
                      <div className="relative mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-3 border-emerald-600 bg-white shadow-md ring-2 ring-emerald-100">
                        <img
                          src={waka.fotoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"}
                          alt={waka.nama}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-poppins">
                        {waka.nama}
                      </h4>
                      <span className="inline-block mt-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-baznas-green-800">
                        {waka.jabatan}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{waka.bidang}</p>
                    </div>

                    {/* Staf Pelaksana di Bawah Waka */}
                    <div className="mt-4 pt-3 border-t border-slate-200 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Pelaksana / Staf:
                      </span>
                      <div className="space-y-2">
                        {waka.stafList &&
                          waka.stafList.map((staf, sIdx) => (
                            <div
                              key={sIdx}
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
                        {waka.stafList && waka.stafList.length === 1 && (
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
        </div>
      )}

      {/* SUBTAB 2: TENTANG LEMBAGA */}
      {activeSubTab === "tentang" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-baznas-green-800">
              <Compass className="h-5 w-5 text-baznas-green-600" />
              <h3 className="text-base font-bold font-poppins">Visi BAZNAS</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              &quot;Menjadi Lembaga Pengelola Zakat Terpercaya, Terdepan, dan Terkredibel di Indonesia dalam Mewujudkan Kesejahteraan Umat dan Menanggulangi Kemiskinan.&quot;
            </p>

            <div className="flex items-center gap-2 text-baznas-green-800 pt-3">
              <Target className="h-5 w-5 text-baznas-green-600" />
              <h3 className="text-base font-bold font-poppins">Misi Utama</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
              <li>Membangun BAZNAS yang kuat, terpercaya, dan modern sebagai lembaga pemerintah nonstruktural.</li>
              <li>Memaksimalkan pengumpulan ZIS-DSKL dari instansi pemerintah (OPD), BUMD, dan masyarakat luas secara transparan.</li>
              <li>Menyalurkan zakat secara tepat sasaran melalui 4 pilar (Cerdas, Sehat, Peduli, Makmur) dengan mengedepankan prinsip 3A (Aman Syar&apos;i, Aman Regulasi, Aman NKRI).</li>
              <li>Mendukung digitalisasi sistem pelaporan dan kearsipan demi pertanggungjawaban akuntansi yang akurat.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-baznas-green-800">
              <Award className="h-5 w-5 text-baznas-green-600" />
              <h3 className="text-base font-bold font-poppins">Dasar Hukum & Legalitas</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block">Undang-Undang No. 23 Tahun 2011</span>
                <p className="text-slate-500 mt-0.5">Tentang Pengelolaan Zakat di Seluruh Wilayah Republik Indonesia.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block">Peraturan Pemerintah No. 14 Tahun 2014</span>
                <p className="text-slate-500 mt-0.5">Pelaksanaan UU No. 23 Tahun 2011 tentang Kewenangan & Tata Kelola BAZNAS.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block">Instruksi Presiden (Inpres) No. 3 Tahun 2014</span>
                <p className="text-slate-500 mt-0.5">Optimalisasi Pengumpulan Zakat di Kementerian, Lembaga Negara, dan Pemerintah Daerah.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
