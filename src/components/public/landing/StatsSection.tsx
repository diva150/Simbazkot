"use client";

/**
 * StatsSection — "Capaian Tahun 2026", the trust-by-the-numbers block.
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * This is the second thing a visitor sees and the only place on the page where
 * BAZNAS has to prove itself with figures instead of words. The old build
 * stacked four loose text blocks on a bare mesh: a jumbo figure with no panel
 * around it, three "medium stats" that were really just another set of
 * paragraphs, and a set of hairline progress bars glued to the bottom edge.
 * Nothing had depth, so nothing had hierarchy — the reader's eye had no idea
 * which of the four numbers was the headline.
 *
 * The rebuild applies the same three-layer hierarchy the logged-in dashboards
 * use (see `ModuleDashboard.HeroPanel` → `StatTile` → `ProgressMeter`):
 *
 *   1. HERO PANEL   one recessive deep slab carrying the single figure that
 *                   matters, with the YoY delta as a chip and a GhostNumber
 *                   backdrop so the numeral reads as architecture.
 *   2. STAT CHIPS   three frosted tiles at the same scale, the audit opinion
 *                   in restrained gold so the eye lands on accountability.
 *   3. COMPOSITION  four bars whose fills grow on scroll — the ONLY place on
 *                   the public page where `baznas-lime-500` is used.
 *
 * WHY THE COMPOSITION BARS ARE NOT `ProgressMeter`
 * ----------------------------------------------
 * `ProgressMeter` in `ModuleDashboard` hardcodes a lime fill, which is right
 * for "one measure, one bar". Here the four figures are a *categorical*
 * breakdown (Zakat / Infak / Sedekah / DSKL) whose individual identities
 * matter, so the fill colour is carried per row and lime is only one of four
 * marks. Everything else — the 6px track, the `role="progressbar"` contract,
 * the ease-zaiflu timing — is kept identical to the dashboard.
 *
 * DATA INTEGRITY
 * --------------
 * Every figure here is a *pre-formatted string* coming from
 * `BerandaContent` (an admin-editable record), e.g. "Rp 1,48 Miliar",
 * "642 Jiwa / KK", "WTP". They are rendered verbatim — the section never
 * re-derives, re-rounds or re-currency-formats them. The single exception is
 * `tingkatPenyaluran`, and even that only animates when the stored value
 * parses cleanly as a percentage (see `CountUpPercent`), so a CMS typo falls
 * back to the literal string instead of displaying a wrong number.
 */

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Coins, TrendingUp } from "lucide-react";

import { BerandaContent } from "@/lib/types";
import { AnimatedNumber, EASE_SOFT, GhostNumber, Stagger, StaggerItem } from "@/components/motion";
import {
  Eyebrow,
  GoldRule,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
  StatChip,
} from "@/components/public/landing/LandingPrimitives";

/* ────────────────────────────────────────────────────────────────────────
 * COMPOSITION DATA
 * The published FY26 mix. `pct` is the share of total penghimpunan; the four
 * values sum to 100. Colours are per-category marks, not a random palette:
 * gold for the headline channel, lime for the second, the brand green for the
 * third, and a muted gold for the remainder.
 * ──────────────────────────────────────────────────────────────────────── */

interface KomposisiItem {
  label: string;
  pct: number;
  /** Tailwind background utility for the bar fill. */
  fill: string;
}

const KOMPOSISI: KomposisiItem[] = [
  { label: "Zakat", pct: 62, fill: "bg-baznas-gold-display" },
  { label: "Infak", pct: 23, fill: "bg-baznas-lime-500" },
  { label: "Sedekah", pct: 11, fill: "bg-baznas-green-700" },
  { label: "DSKL", pct: 4, fill: "bg-baznas-gold-700" },
];

/**
 * `StaggerItem` wraps its child in an extra motion div that declares no
 * height, so `[&>*]` is what actually lets a `h-full` card fill a stretched
 * grid row. Without it the three stat chips end on ragged baselines whenever
 * one of them wraps its hint onto a second line.
 */
const CHIP_ITEM = "h-full [&>*]:h-full";

/* ────────────────────────────────────────────────────────────────────────
 * <CountUpPercent> — opt-in count-up for CMS percentage strings
 *
 * WHY NOT JUST `<AnimatedNumber value={75.5}>`
 * --------------------------------------------
 * `BerandaContent` stores figures as display strings, so `tingkatPenyaluran`
 * arrives as `"75,5%"`, not as a number. Parsing it blindly and reformatting
 * the result would violate the "never reformat the stored data" rule the rest
 * of the page follows. So the parse is strict — digits, optional decimal
 * comma, percent sign, nothing else — and anything that fails is rendered
 * exactly as the admin typed it.
 * ──────────────────────────────────────────────────────────────────────── */

const PERCENT_PATTERN = /^(\d+(?:[.,]\d+)?)\s*%$/;

function CountUpPercent({ value, className }: { value: string; className?: string }) {
  const match = PERCENT_PATTERN.exec(value.trim());
  const numeric = match ? Number(match[1].replace(",", ".")) : NaN;

  if (!match || !Number.isFinite(numeric)) {
    return <span className={className}>{value}</span>;
  }

  return (
    <AnimatedNumber
      value={numeric}
      className={className}
      format={(n) => `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <KomposisiBar> — one animated share row
 *
 * The fill grows from 0 to its share when the row scrolls into view, offset by
 * `index * 0.12s` so the four bars draw left-to-right like a bar chart being
 * written rather than four bars snapping on together. Under reduced motion the
 * fill renders at its final width immediately — no count-up, no delay.
 * ──────────────────────────────────────────────────────────────────────── */

function KomposisiBar({ item, index }: { item: KomposisiItem; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold text-white/85">{item.label}</span>
        <span className="editorial-num text-sm font-extrabold text-white">{item.pct}%</span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-valuenow={item.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label}: ${item.pct} persen`}
      >
        <motion.div
          className={clsx("h-full rounded-full", item.fill)}
          initial={{ width: reduceMotion ? `${item.pct}%` : "0%" }}
          whileInView={{ width: `${item.pct}%` }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.9,
            ease: EASE_SOFT,
            delay: reduceMotion ? 0 : index * 0.12,
          }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <StatsSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface StatsSectionProps {
  /** Live landing content — every figure in this section is read from here. */
  berandaContent: BerandaContent;
  className?: string;
}

export function StatsSection({ berandaContent, className }: StatsSectionProps) {
  return (
    <Section tone="mesh-dark" ariaLabelledBy="stats-heading" className={className}>
      {/* ── Header: gold rule + label + heading ── */}
      <SectionHeading
        align="left"
        tone="light"
        headingId="stats-heading"
        eyebrow="Capaian Tahun 2026"
        title="Lembaga dalam Angka."
        className="mb-12 lg:mb-14"
      />

      {/* ── Hero panel + 3 stat chips ── */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <SectionReveal className="h-full lg:col-span-7">
          <RoundedCard
            tone="ink"
            className={clsx(
              "flex h-full flex-col overflow-hidden",
              // WHY the `!` prefixes. `RoundedCard` hard-sets `rounded-card`
              // and `border-baznas-ink`; both are same-property utilities, so
              // which one wins is decided by stylesheet order rather than by
              // the order of classes in this attribute. The important modifier
              // removes the ambiguity entirely.
              "!rounded-panel !border-white/10",
              "shadow-deep p-7 sm:p-9 lg:p-10",
            )}
          >
            {/* Panel-local mesh — the dashboard HeroPanel puts its mesh inside
                the panel, not behind it. Without this the card would be a flat
                ink rectangle with none of the Zaiflu depth. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-70"
            />

            {/* Oversized year numeral. `GhostNumber`'s own colour token is a
                dead class upstream, so the colour is re-asserted here. */}
            <GhostNumber className="-right-4 -top-10 select-none text-[132px] text-white/[0.07] sm:text-[168px]">
              2026
            </GhostNumber>

            <Coins
              aria-hidden="true"
              strokeWidth={1}
              className="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 text-baznas-gold-display opacity-10 sm:h-48 sm:w-48"
            />

            <div className="relative">
              <Eyebrow tone="light" className="mb-4">
                Total Penghimpunan
              </Eyebrow>

              <p className="display-1 editorial-num text-white">{berandaContent.totalPenghimpunan}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-chip border border-baznas-green-600/45 bg-baznas-green-700/25 px-4 py-2 text-[11px] font-bold tracking-wide text-white">
                  <TrendingUp className="h-3.5 w-3.5 text-baznas-green-300" aria-hidden="true" />
                  +18,2% YoY
                </span>
                <span className="text-xs text-white/85">
                  vs Rp 1,25 M di periode sama 2025
                </span>
              </div>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/85">
                Akumulasi setoran zakat, infak, sedekah, dan DSKL per Oktober 2026
                dari muzakki individu, ASN, dan OPD di seluruh Provinsi Gorontalo.
              </p>
            </div>
          </RoundedCard>
        </SectionReveal>

        {/* `immediate={false}` — `Stagger` defaults to animating on MOUNT,
            which would play this reveal while the section is still off-screen
            and leave it static by the time the reader arrives. */}
        <Stagger
          immediate={false}
          stagger={0.09}
          className="grid gap-6 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1"
        >
          <StaggerItem className={CHIP_ITEM}>
            <StatChip
              tone="light"
              label="Penerima Manfaat"
              value={berandaContent.totalMustahik}
              hint="Mustahik Desil 1–5 · aktif & tersurvey"
              className="h-full"
            />
          </StaggerItem>

          <StaggerItem className={CHIP_ITEM}>
            <StatChip
              tone="light"
              label="Penyaluran"
              value={<CountUpPercent value={berandaContent.tingkatPenyaluran} />}
              hint="Dari pagu RKAT 2026"
              className="h-full"
            />
          </StaggerItem>

          <StaggerItem className={CHIP_ITEM}>
            <StatChip
              tone="light"
              accent
              label="Opini Audit"
              value={berandaContent.opiniAudit}
              hint="Wajar Tanpa Pengecualian"
              className="h-full"
            />
          </StaggerItem>
        </Stagger>
      </div>

      {/* ── Komposisi penghimpunan per jenis ── */}
      <div className="mt-14 border-t border-white/10 pt-10 lg:mt-16 lg:pt-12">
        <SectionReveal className="mb-7">
          <GoldRule className="mb-4" />
          <h3 className="text-sm font-bold text-white sm:text-base">
            Komposisi Penghimpunan per Jenis
          </h3>
        </SectionReveal>

        <Stagger immediate={false} stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KOMPOSISI.map((item, idx) => (
            <StaggerItem key={item.label}>
              <KomposisiBar item={item} index={idx} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

export default StatsSection;