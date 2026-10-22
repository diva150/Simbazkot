"use client";

/**
 * KalkulatorSection — "Hitung kewajiban zakat Anda."
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * This is the only *functional* section on the public page: a visitor either
 * uses it or leaves. The old build treated it like a form that happened to sit
 * on the page — a sharp 1px tab switcher, a flat input column, and a result
 * column that announced itself with a 4px gold bar glued to its left edge. That
 * bar is the single loudest AI-slop tell in the file: it fights the radius
 * scale, it breaks the moment the card is stacked on mobile (where it becomes a
 * 4px orange line across the top of an arbitrary box), and it says nothing.
 *
 * Three changes carry the whole rebuild:
 *
 *   1. SEGMENTED CONTROL  the tab switcher is now a `rounded-chip` pill with a
 *      spring-driven `layoutId` indicator that slides between the two options.
 *      Same two options, same `calcTab` state — but the choice now reads as a
 *      control rather than as a table header.
 *   2. ROUNDED PAIR       input and result are both `RoundedCard`s; the result
 *      is `rounded-panel` and is separated by a `GoldRule` instead of the old
 *      `border-l-4`. On mobile the pair stacks cleanly with no gold bar to
 *      reorient.
 *   3. A NUMBER THAT LANDS  the result uses `AnimatedNumber`, so typing a new
 *      figure counts to it instead of snapping. It re-runs on every value
 *      change (the primitive keys its effect on `value`), and under reduced
 *      motion it jumps straight to the target.
 *
 * MATH IS UNCHANGED — DELIBERATELY
 * --------------------------------
 * `zakatProfesi`, `totalHartaMaal`, `nisabMaalBulanan` and `zakatMaal` are
 * ported verbatim from `PublicLandingView`, including the simplifications (the
 * maal tab sums *everything* into one figure, so the "emas" field is treated as
 * rupiah despite its label; `nisabMaalBulanan` is a fixed monthly constant).
 * Those are simplified for demonstration and changing them here would be a
 * financial-semantics decision, not a UI one. They are preserved exactly so the
 * rebuild cannot silently alter what a muzakki is told they owe.
 */

import React, { useState } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  type LucideIcon,
} from "lucide-react";

import { formatRupiah } from "@/lib/utils";
import { AnimatedNumber, Stagger, StaggerItem } from "@/components/motion";
import {
  GoldRule,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import {
  ZAKAT_MAAL_FIELDS,
  type ZakatMaalKey,
} from "@/components/public/landing/landing-data";

/* ────────────────────────────────────────────────────────────────────────
 * TABS
 * Icon + label pairs, declared once so the segmented control and the panel's
 * `aria-labelledby` can never disagree about which tab is which.
 * ──────────────────────────────────────────────────────────────────────── */

type CalcTab = "profesi" | "maal";

const CALC_TABS: { key: CalcTab; label: string; icon: LucideIcon }[] = [
  { key: "profesi", label: "Zakat Profesi", icon: Briefcase },
  { key: "maal", label: "Zakat Maal", icon: Calculator },
];

/**
 * `layoutId` is page-global in Framer Motion — two components sharing an id
 * will animate into each other. The navbar already owns
 * `public-navbar-underline`, so this one is scoped by component name.
 */
const TAB_INDICATOR_ID = "kalkulator-tab-indicator";

/**
 * `StaggerItem` wraps its child in an extra motion div that declares no height,
 * so `[&>*]:h-full` is what actually lets a `h-full` card fill a stretched grid
 * row — otherwise the result panel's CTA would float mid-card whenever the input
 * column is taller.
 */
const FULL_HEIGHT_ITEM = "h-full [&>*]:h-full";

/* ────────────────────────────────────────────────────────────────────────
 * <SegmentedControl> — the pill tab switcher
 * ──────────────────────────────────────────────────────────────────────── */

interface SegmentedControlProps {
  value: CalcTab;
  onChange: (tab: CalcTab) => void;
}

function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Pilih jenis zakat"
      className="mx-auto flex w-full max-w-md items-center gap-1 rounded-chip border border-baznas-ink-8 bg-baznas-paper p-1.5"
    >
      {CALC_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`calc-tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls="kalkulator-panel"
            onClick={() => onChange(tab.key)}
            className={clsx(
              "relative isolate inline-flex min-h-t-target flex-1 items-center justify-center gap-2 rounded-chip px-4 py-3 text-sm font-bold",
              "transition-colors duration-350 ease-zaiflu",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2",
              isActive
                ? "text-white"
                : "text-baznas-ink/85 hover:bg-white hover:text-baznas-ink",
            )}
          >
            {/* The sliding pill. `isolate` on the button traps it in a local
                stacking context and `relative z-10` on the label keeps the
                glyphs above it without needing a negative z-index that would
                escape behind the section background. */}
            {isActive &&
              (reduceMotion ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-chip bg-baznas-ink"
                />
              ) : (
                <motion.span
                  aria-hidden="true"
                  layoutId={TAB_INDICATOR_ID}
                  className="absolute inset-0 rounded-chip bg-baznas-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ))}

            <span className="relative z-10 inline-flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Shared input chrome
 *
 * `border-baznas-ink-20` is the resting hairline; the focus colour comes from
 * the global `:focus-visible` rule in globals.css, which paints both an outline
 * and a soft green box-shadow on inputs. No `outline-none` here on purpose —
 * killing it would drop the project's one accessibility affordance.
 * ──────────────────────────────────────────────────────────────────────── */

const INPUT_BASE =
  "w-full rounded-card border border-baznas-ink-20 bg-white pl-12 pr-4 text-baznas-ink editorial-num " +
  "transition-colors duration-350 ease-zaiflu focus:border-baznas-green-700";

const RP_PREFIX =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm font-bold text-baznas-ink/85";

/* ────────────────────────────────────────────────────────────────────────
 * <KalkulatorSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface KalkulatorSectionProps {
  /** Opens the petugas login modal — the "Bayar via Petugas" hand-off. */
  onOpenLogin: () => void;
  className?: string;
}

export function KalkulatorSection({ onOpenLogin, className }: KalkulatorSectionProps) {
  // ── State: ported verbatim from PublicLandingView, deliberately NOT lifted.
  const [calcTab, setCalcTab] = useState<CalcTab>("profesi");
  const [gajiPublik, setGajiPublik] = useState<number>(7_500_000);
  const [hartaMaal, setHartaMaal] = useState<Record<ZakatMaalKey, number>>({
    tabungan: 0,
    emas: 0,
    aset: 0,
    piutang: 0,
  });

  // ── Derivations: identical formulas to the previous build.
  const zakatProfesi = Math.round(gajiPublik * 0.025);
  const totalHartaMaal = Object.values(hartaMaal).reduce((a, b) => a + (b || 0), 0);
  // Approx nisab maal (522 kg beras × ~Rp 15.000/kg ≈ Rp 7,83 jt per tahun / 12 bulan)
  const nisabMaalBulanan = 7_830_000;
  const zakatMaal =
    totalHartaMaal >= nisabMaalBulanan
      ? Math.round((totalHartaMaal * 2.5) / 100)
      : 0;

  const handleMaalChange = (key: ZakatMaalKey, value: number) => {
    setHartaMaal((prev) => ({ ...prev, [key]: value }));
  };

  const isProfesi = calcTab === "profesi";
  const belowNisab = totalHartaMaal < nisabMaalBulanan;

  return (
    <Section
      id="kalkulator"
      tone="white"
      ariaLabelledBy="calc-heading"
      className={className}
    >
      {/* ── Header ── */}
      <SectionReveal className="mb-10 lg:mb-12">
        <SectionHeading
          headingId="calc-heading"
          eyebrow="Kalkulator Mandiri"
          title="Hitung kewajiban zakat Anda."
          lede="Pilih jenis zakat Anda — Profesi (2,5% dari gaji) atau Maal (2,5% dari harta simpanan). Hasil perhitungan bersifat indikatif."
        />
      </SectionReveal>

      {/* ── Tab switcher ── */}
      <SectionReveal className="mb-8 lg:mb-9">
        <SegmentedControl value={calcTab} onChange={setCalcTab} />
      </SectionReveal>

      {/* ── Input + result ── */}
      <div
        id="kalkulator-panel"
        role="tabpanel"
        aria-labelledby={`calc-tab-${calcTab}`}
      >
        <Stagger
          immediate={false}
          stagger={0.09}
          className="grid gap-6 lg:grid-cols-12 lg:gap-7"
        >
          {/* ── Input card ── */}
          <StaggerItem className={clsx(FULL_HEIGHT_ITEM, "lg:col-span-7")}>
            <RoundedCard
              tone="paper"
              className="flex h-full flex-col !rounded-panel p-6 sm:p-8"
            >
              {isProfesi ? (
                <>
                  <label
                    htmlFor="kalkulator-gaji"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-ink/70"
                  >
                    Penghasilan bersih per bulan
                  </label>

                  <div className="relative">
                    <span className={RP_PREFIX} aria-hidden="true">
                      Rp
                    </span>
                    <input
                      id="kalkulator-gaji"
                      type="number"
                      step={500000}
                      value={gajiPublik}
                      onChange={(e) => setGajiPublik(Number(e.target.value))}
                      className={clsx(
                        INPUT_BASE,
                        "min-h-t-target-lg py-3 text-2xl font-extrabold",
                      )}
                    />
                  </div>

                  {/* Suggestion chips — the three income bands most likely to
                      land on or near the nisab line. */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-baznas-ink/70">
                      Saran:
                    </span>
                    {[5_000_000, 7_500_000, 10_000_000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={gajiPublik === v}
                        onClick={() => setGajiPublik(v)}
                        className={clsx(
                          "inline-flex min-h-t-target items-center rounded-chip border px-4 py-2 text-xs font-bold editorial-num",
                          "transition-all duration-350 ease-zaiflu hover:-translate-y-0.5",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2",
                          gajiPublik === v
                            ? "border-baznas-green-800 bg-baznas-green-700 text-white"
                            : "border-baznas-ink-12 bg-white text-baznas-ink/85 hover:border-baznas-green-800 hover:text-baznas-green-900",
                        )}
                      >
                        {formatRupiah(v)}
                      </button>
                    ))}
                  </div>

                  <p className="mt-6 text-[11px] leading-relaxed text-baznas-ink/85">
                    Nisab bulanan: ±{" "}
                    <strong className="font-bold text-baznas-ink">Rp 7,83 jt</strong>{" "}
                    (setara 522 kg beras). Penghasilan di atas nisab &amp; sudah haul
                    (1 tahun) → wajib zakat 2,5%.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4 block text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-ink/70">
                    Harta yang dimiliki (per bulan)
                  </p>

                  <div className="space-y-4">
                    {ZAKAT_MAAL_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={`maal-${field.key}`}
                          className="mb-1.5 block text-xs text-baznas-ink/85"
                        >
                          {field.label}
                        </label>
                        <div className="relative">
                          <span className={clsx(RP_PREFIX, "text-xs")} aria-hidden="true">
                            Rp
                          </span>
                          <input
                            id={`maal-${field.key}`}
                            type="number"
                            value={hartaMaal[field.key] || ""}
                            onChange={(e) =>
                              handleMaalChange(field.key, Number(e.target.value))
                            }
                            placeholder={field.placeholder}
                            className={clsx(
                              INPUT_BASE,
                              "min-h-t-target py-2.5 text-sm font-bold",
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-[11px] leading-relaxed text-baznas-ink/85">
                    Nisab maal: ±{" "}
                    <strong className="font-bold text-baznas-ink">85 gram emas</strong> (±
                    Rp 131,7 jt). Harta di atas nisab &amp; haul 1 tahun → wajib zakat
                    2,5%.
                  </p>
                </>
              )}
            </RoundedCard>
          </StaggerItem>

          {/* ── Result card ──
              `rounded-panel` + a `GoldRule` replaces the old
              `border-l-4 border-baznas-gold-display`. The panel stays a LIGHT
              surface on purpose: `baznas-error-700` on the dark mesh measures
              ~2.7:1 and fails AA outright, so the "belum mencapai nisab" state
              could only have been rendered legally on paper or white. */}
          <StaggerItem className={clsx(FULL_HEIGHT_ITEM, "lg:col-span-5")}>
            <RoundedCard
              tone="paper"
              className="flex h-full flex-col !rounded-panel overflow-hidden bg-baznas-paper p-6 shadow-lift sm:p-8"
            >
              {/* Warm light mesh inside the panel so it reads as a lit surface
                  rather than a flat cream rectangle. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-mesh-light opacity-70"
              />

              <div className="relative flex h-full flex-col">
                <GoldRule className="mb-5" />

                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-baznas-ink/70">
                  {isProfesi ? "Zakat 2,5% per bulan" : "Zakat 2,5% per tahun"}
                </p>

                <p className="display-2 editorial-num mt-2 text-baznas-green-900">
                  <AnimatedNumber
                    value={isProfesi ? zakatProfesi : zakatMaal}
                    format={(n) => formatRupiah(n)}
                    duration={0.6}
                  />
                </p>

                <div className="mt-4 text-xs leading-relaxed text-baznas-ink/85">
                  {isProfesi ? (
                    <p>
                      Disetahunkan:{" "}
                      <strong className="font-bold text-baznas-ink">
                        {formatRupiah(zakatProfesi * 12)}
                      </strong>
                    </p>
                  ) : (
                    <>
                      <p>
                        Total harta:{" "}
                        <strong className="font-bold text-baznas-ink">
                          {formatRupiah(totalHartaMaal)}
                        </strong>
                      </p>
                      {belowNisab && (
                        <p className="mt-2 inline-flex items-start gap-1.5 font-semibold text-baznas-error-700">
                          Belum mencapai nisab, zakat tidak wajib.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenLogin}
                  className={clsx(
                    "mt-auto inline-flex min-h-t-target-lg w-full items-center justify-center gap-2 rounded-card",
                    "bg-baznas-green-900 px-5 py-3 text-sm font-bold text-white",
                    "transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-baznas-green-800 hover:shadow-glow",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2",
                  )}
                >
                  <span>Bayar via Petugas</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </RoundedCard>
          </StaggerItem>
        </Stagger>
      </div>
    </Section>
  );
}

export default KalkulatorSection;