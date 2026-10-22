"use client";

/**
 * TentangSection — "Mengenal Lembaga". Institutional credibility.
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * This is where a visitor decides whether BAZNAS is a real government body or
 * a landing page template. The old build proved it with flat text: a heading, a
 * paragraph, and a 4px gold bar on the left of a tinted box — the exact same
 * accent bar that appeared on the testimonial cards, the FAQ answers, the
 * leader card and the CTA. One trick, six times, which is why the page read
 * as repetitive even though nothing was duplicated.
 *
 * The rebuild gives each block a different, earned treatment:
 *
 *   1. THE LEDE      a wide editorial column, no box at all.
 *   2. VISI          the single most quotable sentence BAZNAS owns, so it gets
 *                     the page's biggest type and the only large gold rule. The
 *                     logo moves OUT of its bordered frame (brand rules forbid
 *                     a framed logo on the landing page) and stays frameless as
 *                     a quiet anchor.
 *   3. MISI          a numbered list where the numeral is a rounded,
 *                     gold-outlined chip instead of a sharp 28px square.
 *   4. EMPAT PILAR   four interactive rounded cards whose icon tiles walk down
 *                     the brand's own depth ramp.
 *
 * DATA
 * ----
 * Visi and misi come from `BerandaContent` — an admin-editable record, so this
 * section must never hard-code them. The pillar grid reads `PILLAR_DETAIL`
 * (not `PILAR_PROGRAM`) because that is the derived long-form variant: same
 * `Pilar` fields plus `statLine`, whose figures are interpolated from
 * `PROGRAM_UNGGULAN` at module load so the two sections cannot disagree.
 *
 * A NOTE ON THE STICKY COLUMN
 * ---------------------------
 * The old left column is not sticky here even though the layout invites it.
 * `Section` renders `<section class="relative overflow-hidden">`, and an
 * `overflow: hidden` ancestor becomes the scroll container for any
 * `position: sticky` descendant — so a sticky column would silently never
 * stick. It stays in normal flow rather than shipping a broken affordance.
 */

import clsx from "clsx";
import { Compass, Target } from "lucide-react";

import { BerandaContent } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/motion";
import {
  Eyebrow,
  GoldRule,
  PillarBadge,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import { PILLAR_DETAIL, type PilarKey } from "@/components/public/landing/landing-data";

/* ────────────────────────────────────────────────────────────────────────
 * PER-PILAR ICON TILE TREATMENTS
 *
 * WHY A TABLE AND NOT FOUR RANDOM COLOURS
 * --------------------------------------
 * The old grid shipped a `color` field on every pilar that was always
 * `text-baznas-ink` and was never read by anything — dead data pretending to be
 * a design system. An honest replacement has to come from the approved palette
 * AND mean something.
 *
 * These four are a walk down the brand's own depth ramp, not an arbitrary set
 * of hues: Cerdas takes the main brand green (the "life" pillar the money story
 * leads with), Sehat the cool petrol panel, Peduli the deepest brand green,
 * and Makmur the single warm gold note so the pillar most associated with
 * prosperity is the one that catches the light. Lime is deliberately absent —
 * per project rules it is chart-fill only. No tints, no pastels, nothing
 * invented.
 * ──────────────────────────────────────────────────────────────────────── */

interface PilarTileSkin {
  /** Tailwind background utility for the icon tile. */
  tile: string;
  /** Tailwind text utility for the icon inside it. */
  icon: string;
  /** Hairline under the tile, in the tile's own hue. */
  rule: string;
}

const PILAR_TILE: Record<PilarKey, PilarTileSkin> = {
  cerdas: {
    tile: "bg-baznas-green-600",
    icon: "text-white",
    rule: "bg-baznas-green-600/35",
  },
  sehat: {
    tile: "bg-baznas-petrol-900",
    icon: "text-baznas-gold-display",
    rule: "bg-baznas-petrol-900/45",
  },
  peduli: {
    tile: "bg-baznas-green-950",
    icon: "text-baznas-gold-display",
    rule: "bg-baznas-green-950/45",
  },
  makmur: {
    tile: "bg-baznas-gold-display",
    icon: "text-baznas-ink",
    rule: "bg-baznas-gold-500/50",
  },
};

/**
 * `StaggerItem` wraps its child in an extra motion div that declares no
 * height, so `[&>*]` is what lets a `h-full` card fill a stretched grid row —
 * without it the four pilar cards end on ragged baselines whenever one
 * description wraps onto a third line.
 */
const GRID_ITEM = "h-full [&>*]:h-full";

/* ────────────────────────────────────────────────────────────────────────
 * <TentangSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface TentangSectionProps {
  /** Live landing content — visi and misi are admin-editable. */
  berandaContent: BerandaContent;
  className?: string;
}

export function TentangSection({ berandaContent, className }: TentangSectionProps) {
  return (
    <Section
      id="tentang"
      tone="white"
      ariaLabelledBy="tentang-heading"
      className={className}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ── Kiri: copy block ── */}
        <div className="lg:col-span-5">
          <SectionHeading
            align="left"
            headingId="tentang-heading"
            eyebrow="Mengenal Lembaga"
            title="Tentang BAZNAS."
            lede="Badan Amil Zakat Nasional (BAZNAS) adalah badan resmi yang dibentuk oleh pemerintah yang memiliki tugas dan fungsi menghimpun dan menyalurkan zakat, infak, dan sedekah (ZIS) secara amanah dan akuntabel."
          />

          <SectionReveal delay={0.08}>
            <p className="mt-6 text-sm leading-relaxed text-baznas-ink/85">
              {berandaContent.heroSubtitle}
            </p>
          </SectionReveal>
        </div>

        {/* ── Kanan: visi + misi ── */}
        <div className="space-y-12 lg:col-span-7">
          {/* Visi Lembaga — the page's most quotable line, so it gets the
              biggest type on a light surface and the only oversized gold rule. */}
          <div>
            <div className="mb-5 flex items-center gap-2 text-baznas-ink">
              <Compass className="h-4 w-4 text-baznas-gold-900" aria-hidden="true" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                Visi Lembaga
              </h3>
            </div>

            <SectionReveal>
              <RoundedCard
                tone="paper"
                className="!rounded-panel p-6 sm:p-8"
              >
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
                  {/* Logo BAZNAS — frameless by brand rule. The old build boxed
                      it in a bordered tile; the frame is what made it read as a
                      generic placeholder, not as the official mark. */}
                  <img
                    src="/baznas-logo.png"
                    alt="Logo Resmi BAZNAS — Badan Amil Zakat Nasional"
                    className="mx-auto h-20 w-auto shrink-0 sm:mx-0 sm:h-24"
                    draggable={false}
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <GoldRule className="!mb-4 !w-14" />
                    <blockquote className="font-display text-lg font-medium italic leading-snug text-baznas-green-900 sm:text-2xl">
                      &ldquo;{berandaContent.visi}&rdquo;
                    </blockquote>
                  </div>
                </div>
              </RoundedCard>
            </SectionReveal>
          </div>

          {/* Misi Utama — numbered, staggered, each row a rounded card. */}
          <div>
            <div className="mb-5 flex items-center gap-2 text-baznas-ink">
              <Target className="h-4 w-4 text-baznas-gold-900" aria-hidden="true" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                Misi Utama
              </h3>
            </div>

            {/* `<ol>` keeps the ordinal semantics for screen readers. The cascade
                is driven by per-item `SectionReveal` delays rather than `Stagger`
                because `Stagger` renders a `<div>`, which cannot legally hold
                `<li>` children. `list-none` suppresses the native marker — the
                gold chip already carries the number. */}
            <ol className="list-none space-y-3">
              {berandaContent.misiList.map((misi, idx) => (
                <li key={idx}>
                  <SectionReveal delay={idx * 0.06}>
                    <RoundedCard
                      tone="paper"
                      hoverBorder
                      className="flex items-start gap-4 !p-4 sm:!p-5"
                    >
                      {/* `gold-900` not `gold-display` — #FEBF21 on cream is
                          ~1.6:1. The gold outline stays restrained gold. */}
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-baznas-gold-500 text-[11px] font-extrabold tracking-wide text-baznas-gold-900">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-baznas-ink/90">
                        {misi}
                      </p>
                    </RoundedCard>
                  </SectionReveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ── Empat Pilar — program utama ── */}
      <div className="mt-16 border-t border-baznas-ink-8 pt-12 lg:mt-20 lg:pt-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Eyebrow align="center" className="mb-2">
            Program Unggulan
          </Eyebrow>
          <h3 className="text-2xl font-poppins font-bold text-baznas-ink sm:text-3xl">
            Empat Pilar Penyaluran.
          </h3>
          <p className="mt-2 text-sm text-baznas-ink/85">
            Setiap dana yang Anda titipkan akan dialokasikan ke salah satu dari empat
            pilar program di bawah ini, sesuai kebutuhan mustahik.
          </p>
        </div>

        {/* `immediate={false}` — `Stagger` defaults to animating on MOUNT, which
            would play the cascade while the section is still off-screen and
            leave it static by the time the reader arrives. */}
        <Stagger
          immediate={false}
          stagger={0.08}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PILLAR_DETAIL.map((pilar, idx) => {
            const Icon = pilar.icon;
            const skin = PILAR_TILE[pilar.key];

            return (
              <StaggerItem key={pilar.key} className={GRID_ITEM}>
                <RoundedCard
                  as="article"
                  tone="paper"
                  interactive
                  // `group` so the icon tile can react to the card's hover, not
                  // its own — the tile is not itself interactive.
                  className="group flex h-full flex-col"
                >
                  <PillarBadge index={idx + 1} label={pilar.label} tone="ink" />

                  {/* `rounded-lg` icon tile — the old one was a sharp
                      square `h-12 w-12 bg-baznas-ink` sitting inside an already
                      rounded card, which fought the radius scale. */}
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "mt-4 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-350 ease-zaiflu group-hover:scale-105",
                      skin.tile,
                    )}
                  >
                    <Icon className={clsx("h-5 w-5", skin.icon)} />
                  </span>

                  <h4 className="font-poppins text-base font-bold text-baznas-ink">
                    {pilar.title}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-baznas-ink/85">
                    {pilar.desc}
                  </p>

                  {/* The published figure, interpolated from PROGRAM_UNGGULAN
                      so the pilar grid and the program cards can never drift. */}
                  <p className="mt-auto pt-4 text-[11px] font-semibold leading-snug text-baznas-green-900">
                    {pilar.statLine}
                  </p>

                  <span
                    aria-hidden="true"
                    className={clsx("mt-3 block h-px w-8 rounded-full", skin.rule)}
                  />
                </RoundedCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}

export default TentangSection;