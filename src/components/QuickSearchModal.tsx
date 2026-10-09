"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  User,
  Heart,
  Receipt,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Muzakki, Mustahik, SetoranZIS, Surat, BidangType } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  muzakkiList: Muzakki[];
  mustahikList: Mustahik[];
  setoranList: SetoranZIS[];
  suratList: Surat[];
  onSelectBidang: (bidang: BidangType) => void;
  onViewKwitansi: (setoran: SetoranZIS) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  muzakkiList,
  mustahikList,
  setoranList,
  suratList,
  onSelectBidang,
  onViewKwitansi,
}) => {
  const [query, setQuery] = useState("");

  // Shortcut keyboard Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredMuzakki = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return muzakkiList.filter(
      (m) =>
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        m.namaInstansi.toLowerCase().includes(q)
    );
  }, [query, muzakkiList]);

  const filteredMustahik = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mustahikList.filter(
      (m) =>
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        m.kategoriBesar.toLowerCase().includes(q) ||
        m.namaSubProgram.toLowerCase().includes(q)
    );
  }, [query, mustahikList]);

  const filteredSetoran = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return setoranList.filter(
      (s) =>
        s.buktiNo.toLowerCase().includes(q) ||
        s.namaMuzakki.toLowerCase().includes(q)
    );
  }, [query, setoranList]);

  const filteredSurat = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return suratList.filter(
      (s) =>
        s.nomorSurat.toLowerCase().includes(q) ||
        s.perihal.toLowerCase().includes(q)
    );
  }, [query, suratList]);

  if (!isOpen) return null;

  const totalResults =
    filteredMuzakki.length +
    filteredMustahik.length +
    filteredSetoran.length +
    filteredSurat.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-baznas-green-700 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama muzakki, mustahik, nomor bukti setoran, atau nomor surat..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">
                Pencarian Cepat Seluruh Data BAZNAS
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ketik nama muzakki, NIK, mustahik, no surat, atau no bukti kwitansi.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">
                Tidak ada data yang cocok dengan &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coba gunakan kata kunci nama atau digit NIK lain.
              </p>
            </div>
          ) : (
            <>
              {/* Hasil Muzakki */}
              {filteredMuzakki.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-baznas-green-600" />
                      Muzakki (Bidang I)
                    </span>
                    <span>{filteredMuzakki.length} ditemukan</span>
                  </div>
                  <div className="space-y-1">
                    {filteredMuzakki.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectBidang("bidang1");
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm hover:bg-emerald-50/60 transition-colors border border-transparent hover:border-emerald-200"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {m.namaLengkap}
                          </p>
                          <p className="text-xs text-slate-500">
                            NIK: {m.nik} • {m.namaInstansi}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hasil Setoran / Kwitansi */}
              {filteredSetoran.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-amber-600" />
                      Bukti Penerimaan ZIS
                    </span>
                    <span>{filteredSetoran.length} ditemukan</span>
                  </div>
                  <div className="space-y-1">
                    {filteredSetoran.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onViewKwitansi(s);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm hover:bg-amber-50/60 transition-colors border border-transparent hover:border-amber-200"
                      >
                        <div>
                          <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 mr-2">
                            {s.buktiNo}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {s.namaMuzakki}
                          </span>
                          <p className="text-xs text-slate-500">
                            {s.jenisLabel} • {formatRupiah(s.nominal)} • {s.tanggal}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-amber-700 bg-white border border-amber-200 px-2 py-1 rounded-lg shadow-2xs">
                          Buka Kwitansi
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hasil Mustahik */}
              {filteredMustahik.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-600" />
                      Mustahik (Bidang II)
                    </span>
                    <span>{filteredMustahik.length} ditemukan</span>
                  </div>
                  <div className="space-y-1">
                    {filteredMustahik.map((mus) => (
                      <button
                        key={mus.id}
                        onClick={() => {
                          onSelectBidang("bidang2");
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm hover:bg-rose-50/60 transition-colors border border-transparent hover:border-rose-200"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {mus.namaLengkap}
                          </p>
                          <p className="text-xs text-slate-500">
                            {mus.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {mus.namaSubProgram} • NIK: {mus.nik}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-rose-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hasil Surat */}
              {filteredSurat.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      Agenda Surat (Bidang IV)
                    </span>
                    <span>{filteredSurat.length} ditemukan</span>
                  </div>
                  <div className="space-y-1">
                    {filteredSurat.map((srt) => (
                      <button
                        key={srt.id}
                        onClick={() => {
                          onSelectBidang("bidang4");
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm hover:bg-blue-50/60 transition-colors border border-transparent hover:border-blue-200"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {srt.nomorSurat}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-md">
                            {srt.perihal}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-right">
          <span className="text-[11px] text-slate-400">
            Tekan <kbd className="font-mono bg-white border border-slate-200 px-1 rounded">Esc</kbd> untuk menutup
          </span>
        </div>
      </div>
    </div>
  );
};
