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
import { Dialog } from "@/components/common/Dialog";

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

  // Shortcut keyboard Ctrl + K (toggles open state from anywhere in app).
  // Escape & focus management are handled by the underlying Dialog wrapper.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Pencarian Cepat (Ctrl + K)"
      size="full"
      showCloseButton={false}
      panelClassName="rounded-md border border-baznas-ink-8 bg-white shadow-lift overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
        {/* Search Input Bar — combobox pattern */}
        <div className="flex items-center border-b border-baznas-ink-8 px-4 py-3 bg-baznas-paper/40">
          <Search className="h-5 w-5 text-baznas-green-800 mr-3" aria-hidden="true" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded={totalResults > 0}
            aria-controls="quicksearch-results"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama muzakki, mustahik, nomor bukti setoran, atau nomor surat..."
            className="flex-1 bg-transparent text-sm text-baznas-ink placeholder:text-baznas-ink/45 focus:outline-none min-h-t-target"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center text-baznas-ink/50 hover:text-baznas-ink hover:bg-baznas-paper h-t-target w-t-target transition-colors"
            aria-label="Tutup pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container — listbox pattern */}
        <div
          id="quicksearch-results"
          role="listbox"
          aria-label="Hasil pencarian"
          className="max-h-[60vh] overflow-y-auto p-4 space-y-4"
        >
          {!query.trim() ? (
            <div className="py-8 text-center text-baznas-ink/50">
              <Search className="mx-auto h-8 w-8 text-baznas-ink/35 mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-baznas-ink/85">
                Pencarian Cepat Seluruh Data BAZNAS
              </p>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Ketik nama muzakki, NIK, mustahik, no surat, atau no bukti kwitansi.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-baznas-ink/50">
              <p className="text-sm font-medium text-baznas-ink/85">
                Tidak ada data yang cocok dengan &quot;{query}&quot;
              </p>
              <p className="text-xs text-baznas-ink/55 mt-1">
                Coba gunakan kata kunci nama atau digit NIK lain.
              </p>
            </div>
          ) : (
            <>
              {/* Hasil Muzakki (Bidang I) — section menggunakan BAZNAS green sebagai accent */}
              {filteredMuzakki.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-baznas-ink/55 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-baznas-green-800" aria-hidden="true" />
                      Muzakki (Bidang I)
                    </span>
                    <span>{filteredMuzakki.length} ditemukan</span>
                  </div>
                  <ul className="space-y-1">
                    {filteredMuzakki.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            onSelectBidang("bidang1");
                            onClose();
                          }}
                          className="flex w-full items-center justify-between rounded-md p-3 text-left text-sm hover:bg-baznas-paper/60 transition-colors border border-transparent hover:border-baznas-green-200 min-h-t-target"
                        >
                          <div>
                            <p className="font-semibold text-baznas-ink">
                              {m.namaLengkap}
                            </p>
                            <p className="text-xs text-baznas-ink/65">
                              NIK: {m.nik} • {m.namaInstansi}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-baznas-green-800" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hasil Setoran / Kwitansi — gold accent untuk kategori "dokumen resmi" */}
              {filteredSetoran.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-baznas-ink/55 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-baznas-gold-700" aria-hidden="true" />
                      Bukti Penerimaan ZIS
                    </span>
                    <span>{filteredSetoran.length} ditemukan</span>
                  </div>
                  <ul className="space-y-1">
                    {filteredSetoran.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            onViewKwitansi(s);
                            onClose();
                          }}
                          className="flex w-full items-center justify-between rounded-md p-3 text-left text-sm hover:bg-baznas-paper/60 transition-colors border border-transparent hover:border-baznas-gold-display min-h-t-target"
                        >
                          <div>
                            <span className="inline-block bg-baznas-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-baznas-ink mr-2">
                              {s.buktiNo}
                            </span>
                            <span className="font-semibold text-baznas-ink">
                              {s.namaMuzakki}
                            </span>
                            <p className="text-xs text-baznas-ink/65">
                              {s.jenisLabel} • {formatRupiah(s.nominal)} • {s.tanggal}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-baznas-ink bg-white border border-baznas-ink-12 px-2 py-1 rounded-md">
                            Buka Kwitansi
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hasil Mustahik (Bidang II) — gold heart untuk kategori "kepedulian" */}
              {filteredMustahik.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-baznas-ink/55 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-baznas-gold-display" aria-hidden="true" />
                      Mustahik (Bidang II)
                    </span>
                    <span>{filteredMustahik.length} ditemukan</span>
                  </div>
                  <ul className="space-y-1">
                    {filteredMustahik.map((mus) => (
                      <li key={mus.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            onSelectBidang("bidang2");
                            onClose();
                          }}
                          className="flex w-full items-center justify-between rounded-md p-3 text-left text-sm hover:bg-baznas-paper/60 transition-colors border border-transparent hover:border-baznas-gold-display min-h-t-target"
                        >
                          <div>
                            <p className="font-semibold text-baznas-ink">
                              {mus.namaLengkap}
                            </p>
                            <p className="text-xs text-baznas-ink/65">
                              {mus.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {mus.namaSubProgram} • NIK: {mus.nik}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-baznas-gold-700" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hasil Surat (Bidang IV) — green accent (korespondensi resmi BAZNAS) */}
              {filteredSurat.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-xs font-semibold text-baznas-ink/55 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-baznas-green-800" aria-hidden="true" />
                      Agenda Surat (Bidang IV)
                    </span>
                    <span>{filteredSurat.length} ditemukan</span>
                  </div>
                  <ul className="space-y-1">
                    {filteredSurat.map((srt) => (
                      <li key={srt.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            onSelectBidang("bidang4");
                            onClose();
                          }}
                          className="flex w-full items-center justify-between rounded-md p-3 text-left text-sm hover:bg-baznas-paper/60 transition-colors border border-transparent hover:border-baznas-green-200 min-h-t-target"
                        >
                          <div>
                            <p className="font-semibold text-baznas-ink">
                              {srt.nomorSurat}
                            </p>
                            <p className="text-xs text-baznas-ink/65 truncate max-w-md">
                              {srt.perihal}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-baznas-green-800" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-baznas-ink-8 bg-baznas-paper/40 px-4 py-2 text-right">
          <span className="text-[11px] text-baznas-ink/55">
            Tekan <kbd className="font-mono bg-white border border-baznas-ink-12 px-1 rounded">Esc</kbd> untuk menutup
          </span>
        </div>
    </Dialog>
  );
};
