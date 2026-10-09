"use client";

import React, { useState } from "react";
import { strukturOrganisasiResmiData } from "@/lib/mock-data";
import {
  Building2,
  Target,
  Compass,
  Award,
} from "lucide-react";
import { Star8, CornerBracket } from "@/components/brand/IslamicOrnament";

// Helper: monogram inisial
function monogram(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export const ProfilOrganisasiView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"bagan" | "tentang">("bagan");

  return (
    <div className="space-y-8">
      {/* Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-baznas-ink-8 pb-5">
        <div className="flex items-center gap-3">
          <div className="border border-baznas-gold-display p-2.5 text-baznas-green-900">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-baznas-ink font-poppins">
              Profil Lembaga &amp; Struktur Organisasi
            </h1>
            <p className="text-xs text-baznas-ink/55 mt-0.5">
              Visi-misi lembaga, struktur kepemimpinan hierarkis, dan pembagian tugas amil
            </p>
          </div>
        </div>

        {/* Sub-tab pills — refined */}
        <div className="flex items-center border border-baznas-ink-12 bg-baznas-paper/40 p-1 text-xs font-semibold">
          {[
            { id: "bagan", label: "Bagan Struktur" },
            { id: "tentang", label: "Visi, Misi &amp; Legalitas" },
          ].map((tab) => {
            const active = (activeSubTab === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as "bagan" | "tentang")}
                className={`px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-baznas-ink text-white"
                    : "text-baznas-ink/65 hover:text-baznas-ink"
                }`}
                aria-pressed={active}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: BAGAN STRUKTUR ORGANISASI */}
      {activeSubTab === "bagan" && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-bold mb-2">
              Periode Masa Bakti 2022 – 2027
            </p>
            <h2 className="display-3 text-baznas-ink">
              Bagan Struktur Kepemimpinan.
            </h2>
            <p className="text-sm text-baznas-ink/60 mt-2">
              Berdasarkan Keputusan BAZNAS RI &amp; Regulasi Pengelolaan ZIS
            </p>
          </div>

          {/* TREE STRUCTURE ORGANISASI */}
          <div className="flex flex-col items-center space-y-6">
            {/* LEVEL 1: KETUA BAZNAS — dark surface with gold frame */}
            <div className="relative w-full max-w-md bg-baznas-ink text-white p-7 text-center">
              <div className="absolute inset-2 pointer-events-none text-baznas-gold-display">
                <CornerBracket position="all" size={20} thickness={1.5} offset={0} />
              </div>
              <div className="relative mx-auto mb-4 h-24 w-24 flex items-center justify-center bg-baznas-paper border-2 border-baznas-gold-display">
                <span className="display-1 text-baznas-green-900">
                  {monogram(strukturOrganisasiResmiData.ketua.nama)}
                </span>
              </div>
              <h3 className="text-lg font-poppins font-bold text-white">
                {strukturOrganisasiResmiData.ketua.nama}
              </h3>
              <span className="inline-block mt-1.5 bg-baznas-gold-display px-3 py-0.5 text-[10px] font-extrabold text-baznas-ink uppercase tracking-wider">
                {strukturOrganisasiResmiData.ketua.jabatan}
              </span>
              <p className="text-[11px] text-white/55 mt-2">
                Penanggung Jawab Kebijakan &amp; Tata Kelola Utama
              </p>
            </div>

            {/* Garis Turun Vertikal */}
            <div className="h-8 w-px bg-baznas-ink-20" aria-hidden="true" />

            {/* LEVEL 2: 4 WAKIL KETUA & STAF */}
            <div className="w-full">
              <div
                className="hidden lg:block h-px w-3/4 mx-auto bg-baznas-ink-20 mb-5"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {strukturOrganisasiResmiData.wakilKetuaList.map((waka) => (
                  <div
                    key={waka.id}
                    className="bg-white border-t-4 border-baznas-gold-display p-5 hover:border-baznas-green-800 transition-colors flex flex-col"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 h-14 w-14 flex items-center justify-center bg-baznas-paper border border-baznas-ink-12">
                        <span className="text-base font-bold text-baznas-green-900">
                          {monogram(waka.nama)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="text-sm font-bold text-baznas-ink leading-tight">
                          {waka.nama}
                        </h4>
                        <span className="inline-block mt-1 text-[10px] font-bold text-baznas-green-900 bg-baznas-paper px-2 py-0.5 uppercase tracking-wide">
                          {waka.jabatan}
                        </span>
                        <p className="text-[11px] text-baznas-ink/55 mt-1.5 leading-snug">
                          {waka.bidang}
                        </p>
                      </div>
                    </div>

                    {waka.stafList && waka.stafList.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-baznas-ink-8 space-y-2 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink/45 block">
                          Pelaksana / Staf
                        </span>
                        {waka.stafList.map((staf, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2.5 text-xs"
                          >
                            <div className="shrink-0 h-8 w-8 flex items-center justify-center bg-baznas-paper border border-baznas-ink-12">
                              <span className="text-[10px] font-bold text-baznas-green-900">
                                {monogram(staf.nama)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-baznas-ink text-xs truncate">
                                {staf.nama}
                              </p>
                              <p className="text-[10px] text-baznas-ink/55 truncate">
                                {staf.bidangTugas}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
          <div className="bg-white border border-baznas-ink-8 p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-baznas-ink mb-2">
                <Compass className="h-4 w-4 text-baznas-gold-display" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider">
                  Visi Lembaga
                </h3>
              </div>
              <p className="text-base sm:text-lg font-display font-medium text-baznas-green-900 leading-snug italic">
                &ldquo;Menjadi Lembaga Pengelola Zakat Terpercaya, Terdepan, dan
                Terkredibel di Indonesia dalam Mewujudkan Kesejahteraan Umat dan
                Menanggulangi Kemiskinan.&rdquo;
              </p>
            </div>

            <div className="border-t border-baznas-ink-8 pt-5">
              <div className="flex items-center gap-2 text-baznas-ink mb-3">
                <Target className="h-4 w-4 text-baznas-gold-display" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider">
                  Misi Utama
                </h3>
              </div>
              <ol className="space-y-2.5">
                {[
                  "Membangun BAZNAS yang kuat, terpercaya, dan modern sebagai lembaga pemerintah nonstruktural.",
                  "Memaksimalkan pengumpulan ZIS-DSKL dari instansi pemerintah (OPD), BUMD, dan masyarakat luas secara transparan.",
                  "Menyalurkan zakat secara tepat sasaran melalui 4 pilar (Cerdas, Sehat, Peduli, Makmur) dengan prinsip 3A (Aman Syar'i, Aman Regulasi, Aman NKRI).",
                  "Mendukung digitalisasi sistem pelaporan dan kearsipan demi pertanggungjawaban akuntansi yang akurat.",
                ].map((misi, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-baznas-ink/80 leading-relaxed"
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 text-[11px] font-bold text-baznas-gold-display border border-baznas-gold-display mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{misi}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-white border border-baznas-ink-8 p-6 space-y-4">
            <div className="flex items-center gap-2 text-baznas-ink">
              <Award className="h-4 w-4 text-baznas-gold-display" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">
                Dasar Hukum &amp; Legalitas
              </h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Undang-Undang No. 23 Tahun 2011",
                  desc: "Tentang Pengelolaan Zakat di Seluruh Wilayah Republik Indonesia.",
                },
                {
                  title: "Peraturan Pemerintah No. 14 Tahun 2014",
                  desc: "Pelaksanaan UU No. 23 Tahun 2011 tentang Kewenangan & Tata Kelola BAZNAS.",
                },
                {
                  title: "Instruksi Presiden (Inpres) No. 3 Tahun 2014",
                  desc: "Optimalisasi Pengumpulan Zakat di Kementerian, Lembaga Negara, dan Pemerintah Daerah.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-baznas-paper/40 border-l-4 border-baznas-gold-display p-3"
                >
                  <span className="font-bold text-baznas-ink block text-sm">
                    {item.title}
                  </span>
                  <p className="text-xs text-baznas-ink/65 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilOrganisasiView;
