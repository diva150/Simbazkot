"use client";

import React from "react";
import { KRITERIA_DESIL } from "@/lib/desil";

/**
 * PengaturanTab — Desil criteria and ambang batas settings.
 *
 * Renders the BPS-style Desil 1-10 classification (Mustahik vs Muzakki)
 * for reference. Settings are read-only here (the data is fixed by
 * BAZNAS policy); for editable settings, see the form below.
 */
export const PengaturanTab: React.FC = () => {
  const mustahikKriteria = KRITERIA_DESIL.filter((k) => k.klasifikasi === "mustahik");
  const muzakkiKriteria = KRITERIA_DESIL.filter((k) => k.klasifikasi === "muzakki");

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-8 max-w-3xl">
      <div>
        <h3 className="text-base font-bold text-baznas-ink font-poppins">
          Pengaturan Kriteria Asesmen &amp; Ambang Batas Desil
        </h3>
        <p className="text-xs text-baznas-ink/55 mt-2">
          Skala 1–10 (BPS-style) —{" "}
          <strong className="text-baznas-ink">Desil 1–5 diklasifikasikan sebagai Mustahik (penerima manfaat)</strong>, sedangkan{" "}
          <strong className="text-baznas-ink">Desil 6–10 sebagai Muzakki (pemberi zakat)</strong>. Aturan ini berlaku konsisten di seluruh modul BAZNAS.
        </p>
      </div>

      {/* Group: Mustahik (Desil 1–5) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-baznas-paper border border-baznas-ink-20 text-baznas-ink/85">
            Mustahik
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-ink/70">Desil 1–5 · Penerima Manfaat</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {mustahikKriteria.map((k) => (
            <div
              key={k.desil}
              className="border border-l-4 border-l-baznas-ink-20 border-baznas-ink-8 p-3 bg-baznas-paper/40 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold block text-baznas-ink">{k.label}</span>
                <span className="text-[9px] text-baznas-ink/45 font-mono">{k.pendapatan}</span>
              </div>
              <span className="text-baznas-ink/55 block">{k.deskripsi}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Group: Muzakki (Desil 6–10) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-baznas-ink-8 pb-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-baznas-paper border border-baznas-green-700 text-baznas-green-900">
            Muzakki
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-baznas-ink/70">Desil 6–10 · Pemberi Zakat</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {muzakkiKriteria.map((k) => (
            <div
              key={k.desil}
              className="border border-l-4 border-l-baznas-green-700 border-baznas-ink-8 p-3 bg-baznas-paper/40 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold block text-baznas-ink">{k.label}</span>
                <span className="text-[9px] text-baznas-ink/45 font-mono">{k.pendapatan}</span>
              </div>
              <span className="text-baznas-ink/55 block">{k.deskripsi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PengaturanTab;
