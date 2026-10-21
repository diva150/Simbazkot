"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  SearchX,
  X,
  User,
  Heart,
  Receipt,
  Mail,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Muzakki, Mustahik, SetoranZIS, Surat, BidangType } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Dialog } from "@/components/common/Dialog";
import { EASE_SOFT, Stagger, StaggerItem } from "@/components/motion";

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

/** Motion tokens lokal — Zaiflu: satu timing universal (350ms) untuk semua transisi. */
const SPRING_ENTRY = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.7,
} as const;

const SWAP_FADE = { duration: 0.22, ease: EASE_SOFT };

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
  const reduceMotion = useReducedMotion();

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

  // Zaiflu surface: panel mesh-light (warm paper + mesh), hairline border,
  // deep shadow. Glassmorphism is reserved for panels floating OVER dark
  // surfaces — this dialog sits on a light `bg-baznas-ink/70` scrim, so a
  // frosted-white skin would kill text contrast. Mesh-light keeps ink/85 AA.
  const panelClassName =
    "rounded-hero border border-baznas-ink-12 bg-mesh-light shadow-deep overflow-hidden";

  // Arah masuk tunggal untuk semua motion primitive lokal.
  const upEnter = reduceMotion
    ? false
    : ({ opacity: 0, y: 12 } as const);

  const rowReveal = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.34, ease: EASE_SOFT, delay: index * 0.035 },
  });

  /** Baris hasil: Zaiflu card hover = -2px lift + shadow, 350ms universal. */
  const resultRowClass = (accent: string) =>
    `flex w-full items-center justify-between rounded-card p-3 text-left text-sm ` +
    `border border-transparent transition-[transform,box-shadow,background-color,border-color] ` +
    `duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-rest min-h-t-target ` +
    `focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 ${accent}`;

  const sectionLabelClass =
    "text-[11px] font-bold uppercase tracking-[0.22em] text-baznas-ink/85";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Pencarian Cepat (Ctrl + K)"
      size="full"
      showCloseButton={false}
      panelClassName={panelClassName}
    >
      <motion.div
        className="flex flex-col"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING_ENTRY}
      >
        {/* Search Input Bar — combobox pattern */}
        <div className="flex items-center border-b border-baznas-ink-8 bg-white/50 px-4 py-3 backdrop-blur-sm">
          <Search className="mr-3 h-5 w-5 text-baznas-green-800" aria-hidden="true" />
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
            className="min-h-t-target flex-1 bg-transparent text-sm text-baznas-ink placeholder:text-baznas-ink/55 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-t-target w-t-target items-center justify-center rounded-md text-baznas-ink/60 transition-colors duration-350 ease-zaiflu hover:bg-white/70 hover:text-baznas-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800"
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
          className="max-h-[60vh] space-y-4 overflow-y-auto p-4"
        >
          <AnimatePresence mode="wait" initial={false}>
            {!query.trim() ? (
              <motion.div
                key="quicksearch-prompt"
                initial={upEnter}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduceMotion ? { duration: 0.15 } : SWAP_FADE}
                className="py-10 text-center"
              >
                <Search
                  className="animate-float mx-auto mb-3 h-9 w-9 text-baznas-ink/40"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-baznas-ink/85">
                  Pencarian Cepat Seluruh Data BAZNAS
                </p>
                <p className="mt-2 text-xs text-baznas-ink/85">
                  Ketik nama muzakki, NIK, mustahik, no surat, atau no bukti kwitansi.
                </p>
                <span className="chip-paper mt-4">
                  <kbd className="font-mono">Ctrl</kbd>
                  <span aria-hidden="true">+</span>
                  <kbd className="font-mono">K</kbd>
                </span>
              </motion.div>
            ) : totalResults === 0 ? (
              <motion.div
                key="quicksearch-empty"
                initial={upEnter}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduceMotion ? { duration: 0.15 } : SWAP_FADE}
                className="py-10 text-center"
              >
                <SearchX
                  className="animate-float mx-auto mb-3 h-9 w-9 text-baznas-ink/40"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-baznas-ink/85">
                  Tidak ada data yang cocok dengan &quot;{query}&quot;
                </p>
                <p className="mt-2 text-xs text-baznas-ink/85">
                  Coba gunakan kata kunci nama atau digit NIK lain.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="quicksearch-results-body"
                initial={upEnter}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduceMotion ? { duration: 0.15 } : SWAP_FADE}
              >
                {/* `key={query}` remounts the cascade on every keystroke so
                    hasil baru selalu reveal, bukan hanya render pertama. */}
                <Stagger
                  key={query}
                  stagger={0.06}
                  delayChildren={0.02}
                  className="space-y-5"
                >
                  {/* Hasil Muzakki (Bidang I) — BAZNAS green sebagai accent */}
                  {filteredMuzakki.length > 0 && (
                    <StaggerItem>
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className={`${sectionLabelClass} flex items-center gap-1.5`}>
                          <User className="h-3.5 w-3.5 text-baznas-green-800" aria-hidden="true" />
                          Muzakki (Bidang I)
                        </span>
                        <span className={`${sectionLabelClass} editorial-num`}>
                          {filteredMuzakki.length} ditemukan
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {filteredMuzakki.map((m, i) => (
                          <motion.li key={m.id} {...rowReveal(i)}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => {
                                onSelectBidang("bidang1");
                                onClose();
                              }}
                              className={resultRowClass("hover:border-baznas-green-200")}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-baznas-ink">
                                  {m.namaLengkap}
                                </p>
                                <p className="text-xs text-baznas-ink/85">
                                  NIK: {m.nik} • {m.namaInstansi}
                                </p>
                              </div>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-baznas-green-800 transition-transform duration-350 ease-zaiflu"
                                aria-hidden="true"
                              />
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </StaggerItem>
                  )}

                  {/* Hasil Setoran / Kwitansi — gold accent, "dokumen resmi" */}
                  {filteredSetoran.length > 0 && (
                    <StaggerItem>
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className={`${sectionLabelClass} flex items-center gap-1.5`}>
                          <Receipt className="h-3.5 w-3.5 text-baznas-gold-700" aria-hidden="true" />
                          Bukti Penerimaan ZIS
                        </span>
                        <span className={`${sectionLabelClass} editorial-num`}>
                          {filteredSetoran.length} ditemukan
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {filteredSetoran.map((s, i) => (
                          <motion.li key={s.id} {...rowReveal(i)}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => {
                                onViewKwitansi(s);
                                onClose();
                              }}
                              className={resultRowClass("hover:border-baznas-gold-display")}
                            >
                              <div className="min-w-0">
                                <span className="mr-2 inline-block rounded-md bg-baznas-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-baznas-ink">
                                  {s.buktiNo}
                                </span>
                                <span className="font-semibold text-baznas-ink">
                                  {s.namaMuzakki}
                                </span>
                                <p className="text-xs text-baznas-ink/85">
                                  {s.jenisLabel} • {formatRupiah(s.nominal)} • {s.tanggal}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-chip border border-baznas-ink-12 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-baznas-ink">
                                Buka Kwitansi
                              </span>
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </StaggerItem>
                  )}

                  {/* Hasil Mustahik (Bidang II) — gold heart, "kepedulian" */}
                  {filteredMustahik.length > 0 && (
                    <StaggerItem>
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className={`${sectionLabelClass} flex items-center gap-1.5`}>
                          <Heart className="h-3.5 w-3.5 text-baznas-gold-display" aria-hidden="true" />
                          Mustahik (Bidang II)
                        </span>
                        <span className={`${sectionLabelClass} editorial-num`}>
                          {filteredMustahik.length} ditemukan
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {filteredMustahik.map((mus, i) => (
                          <motion.li key={mus.id} {...rowReveal(i)}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => {
                                onSelectBidang("bidang2");
                                onClose();
                              }}
                              className={resultRowClass("hover:border-baznas-gold-display")}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-baznas-ink">
                                  {mus.namaLengkap}
                                </p>
                                <p className="text-xs text-baznas-ink/85">
                                  {mus.kategoriBesar === "pendistribusian"
                                    ? "Pend distribusi"
                                    : "Pendayagunaan"}{" "}
                                  • {mus.namaSubProgram} • NIK: {mus.nik}
                                </p>
                              </div>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-baznas-gold-700 transition-transform duration-350 ease-zaiflu"
                                aria-hidden="true"
                              />
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </StaggerItem>
                  )}

                  {/* Hasil Surat (Bidang IV) — green, korespondensi resmi */}
                  {filteredSurat.length > 0 && (
                    <StaggerItem>
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className={`${sectionLabelClass} flex items-center gap-1.5`}>
                          <Mail className="h-3.5 w-3.5 text-baznas-green-800" aria-hidden="true" />
                          Agenda Surat (Bidang IV)
                        </span>
                        <span className={`${sectionLabelClass} editorial-num`}>
                          {filteredSurat.length} ditemukan
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {filteredSurat.map((srt, i) => (
                          <motion.li key={srt.id} {...rowReveal(i)}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => {
                                onSelectBidang("bidang4");
                                onClose();
                              }}
                              className={resultRowClass("hover:border-baznas-green-200")}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-baznas-ink">
                                  {srt.nomorSurat}
                                </p>
                                <p className="max-w-md truncate text-xs text-baznas-ink/85">
                                  {srt.perihal}
                                </p>
                              </div>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-baznas-green-800 transition-transform duration-350 ease-zaiflu"
                                aria-hidden="true"
                              />
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </StaggerItem>
                  )}
                </Stagger>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-end gap-2 border-t border-baznas-ink-8 bg-white/50 px-4 py-2 backdrop-blur-sm">
          <span className="text-[11px] text-baznas-ink/85">
            Tekan{" "}
            <kbd className="rounded border border-baznas-ink-12 bg-white px-1 font-mono">
              Esc
            </kbd>{" "}
            untuk menutup
          </span>
        </div>
      </motion.div>
    </Dialog>
  );
};