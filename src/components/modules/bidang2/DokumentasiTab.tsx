"use client";

import React from "react";

/**
 * DokumentasiTab — read-only archive of BAST (Berita Acara Serah Terima)
 * and field documentation for Bidang II.
 *
 * Pure presentational. In a future version, this would be backed by
 * a real archive list (currently shows a representative sample).
 */
export const DokumentasiTab: React.FC = () => {
  const sampleDocs = [
    {
      code: "BAST-2026/09/018",
      title: "Penyerahan Bantuan Beasiswa Santri Yatim 15 Orang",
      category: "Program Pendistribusian (Pendidikan)",
      date: "18 Sep 2026",
    },
    {
      code: "BAST-2026/08/042",
      title: "Penyerahan Bantuan Modal Usaha Z-Mart 5 Mustahik",
      category: "Program Pendayagunaan (Ekonomi)",
      date: "15 Agu 2026",
    },
  ];

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-baznas-ink font-poppins">
          Berita Acara Serah Terima (BAST) &amp; Dokumentasi Lapangan
        </h3>
        <p className="text-xs text-baznas-ink/55">
          Arsip tanda terima dan dokumentasi foto penyerahan hak mustahik
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sampleDocs.map((doc) => (
          <div
            key={doc.code}
            className="rounded-xl border border-baznas-ink-8 p-8 bg-baznas-paper/40 space-y-2"
          >
            <span className="text-xs font-bold text-baznas-ink font-mono">{doc.code}</span>
            <p className="font-semibold text-baznas-ink text-xs">{doc.title}</p>
            <p className="text-[11px] text-baznas-ink/55">
              Kategori: {doc.category} • Tgl: {doc.date}
            </p>
            <span className="inline-block text-[10px] bg-baznas-paper border border-baznas-ink-12 text-baznas-ink font-bold px-2 py-0.5 rounded">
              Dokumen Lengkap &amp; Terverifikasi
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DokumentasiTab;
