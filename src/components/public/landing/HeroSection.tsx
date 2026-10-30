"use client";

/**
 * HeroSection — the first thing a visitor sees.
 *
 * WHY THE HERO CHANGED SHAPE
 * --------------------------
 * The old hero was an editorial cream page: `bg-baznas-paper`, a display
 * headline, three sharp 1px stat boxes, and the official logo floating loose
 * on the right. It read like a printed annual report. The rest of the rebuilt
 * page is a Zaiflu-dark, frosted, ghost-numeral surface language (see
 * `StatsSection` and `ModuleDashboard.HeroPanel`), so leaving the hero on
 * cream made the top of the page belong to a different product than the rest.
 *
 * It is now `bg-mesh-dark`, matching the logged-in dashboard's deep panels:
 *
 *   · a 2026 `GhostNumber` sits behind the copy as a ceremonial anchor —
 *     the same move `StatsSection` uses on the block directly below it, so the
 *     two dark sections read as one continuous band;
 *   · the logo sits bare on the mesh — no frame, no plate, no shadow. It
 *     renders from `baznas-logo-negative.png`, the official artwork with
 *     only its lettering knocked to the brand's paper cream, because the
 *     light original's dark-green wordmark and near-black subtitle would
 *     have fallen to roughly 2:1 against the dark ground;
 *   · the stat strip is three `StatChip`s (radius token, hairline, hover lift)
 *     rather than the old `gap-px bg-ink-12` hairline grid.
 *
 * CONTENT FIDELITY
 * ----------------
 * Every line of copy and every figure the old hero carried survives: the
 * eyebrow, the headline with its hover-reactive gold rule under "zakat", the
 * `heroSubtitle` paragraph, both CTAs with their original labels and targets,
 * the 1.247 / 16 / 4 strip, and the three trust badges (audit opinion, PSAK
 * 109, ISO 37001). Nothing here is CMS-driven except the subtitle, matching
 * the old implementation — the three hero figures were hard-coded there too
 * and are not editable records.
 *
 * A11Y
 * ----
 * `Section` renders the `<section>`; `hero-heading` is declared on the `<h1>`
 * and handed to `Section`'s `ariaLabelledBy`. The scroll link's target is a
 * real anchor (`#kalkulator`), so the CTA works even if the handler is
 * short-circuited.
 */

import React from "react";
import { ArrowRight, Calculator, Lock, ShieldCheck } from "lucide-react";

import { BerandaContent } from "@/lib/types";
import { initialBerandaContent } from "@/lib/mock-data";
import { GhostNumber, Pressable, Stagger, StaggerItem } from "@/components/motion";
import {
  Section,
  StatChip,
} from "@/components/public/landing/LandingPrimitives";

/* ────────────────────────────────────────────────────────────────────────
 * HERO STATS
 * The published headline figures. Same three numbers the previous hero
 * hard-coded, so the rebuild changes the frame, not the claim.
 * ──────────────────────────────────────────────────────────────────────── */

interface HeroStat {
  label: string;
  value: string;
  /** Gold-figure treatment. Exactly one per view — the Pilar count. */
  accent?: boolean;
}

const HERO_STATS: HeroStat[] = [
  { label: "Muzakki", value: "1.247" },
  { label: "Program", value: "16" },
  { label: "Pilar", value: "4", accent: true },
];

/**
 * Smooth-scroll to an anchor.
 *
 * Kept as a module function rather than inline JSX so both CTA buttons (and
 * the CTA section's twin) share one implementation. `globals.css` already sets
 * `scroll-margin-top` on every `section[id]`, so the sticky navbar never covers
 * the target.
 */
export function scrollToLandingSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ────────────────────────────────────────────────────────────────────────
 * <HeroSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface HeroSectionProps {
  /** Live landing content. Only `heroSubtitle` is surfaced here; the rest of
   *  `BerandaContent` belongs to the stats / tentang / footer sections. */
  berandaContent?: BerandaContent;
  /** Opens the petugas login modal. */
  onOpenLogin: () => void;
  className?: string;
}

export function HeroSection({
  berandaContent = initialBerandaContent,
  onOpenLogin,
  className,
}: HeroSectionProps) {
  return (
    <Section
      id="hero"
      tone="mesh-dark"
      ariaLabelledBy="hero-heading"
      // The hero sits directly under the sticky navbar, so it does not need the
      // page's full `py-20 lg:py-28` rhythm — it would push the fold down.
      padding="pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16"
      className={className}
    >
      {/* Ceremonial year. `GhostNumber`'s own colour token is a dead class
          upstream (`text-ink/[0.07]`), so the light treatment is re-asserted. */}
      <GhostNumber className="-right-5 -top-6 select-none text-[124px] text-white/[0.07] sm:text-[164px] lg:text-[196px]">
        2026
      </GhostNumber>

      <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* ───────────────────────────── Copy column ───────────────────────────── */}
        <div className="lg:col-span-7">
          {/* Above the fold, so the cascade fires on mount rather than waiting
              for an intersection the reader is already looking at. */}
          <Stagger immediate stagger={0.08} delayChildren={0.04} className="space-y-7">
            <StaggerItem>
              <p className="chip-glass text-white/85">
                Badan Amil Zakat Nasional
                <span aria-hidden="true" className="h-3 w-px bg-baznas-gold-display/70" />
                Kota Gorontalo
              </p>
            </StaggerItem>

            <StaggerItem>
              <h1 id="hero-heading" className="display-hero text-balance text-white">
                Amanah dalam setiap titipan{" "}
                {/* Gold accent on "zakat": a rule that sits under the word and
                    stretches on hover. Kept verbatim from the old hero — it is
                    the one flourish on the page worth carrying across intact. */}
                <span className="group relative inline-block">
                  zakat
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-[3px] origin-left scale-x-100 bg-baznas-gold-display transition-transform duration-500 ease-zaiflu group-hover:scale-x-110"
                  />
                </span>{" "}
                Anda.
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                {berandaContent.heroSubtitle}
              </p>
            </StaggerItem>

            {/* ── CTAs ── */}
            <StaggerItem>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Pressable>
                  <button
                    type="button"
                    onClick={() => scrollToLandingSection("kalkulator")}
                    className="group inline-flex min-h-t-target-lg w-full items-center justify-center gap-2.5 rounded-card bg-baznas-green-700 px-7 text-sm font-bold text-white transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-baznas-green-800 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-petrol-950 sm:w-auto"
                  >
                    <Calculator
                      aria-hidden="true"
                      className="h-4 w-4 text-baznas-gold-display transition-transform duration-350 ease-zaiflu group-hover:rotate-12"
                    />
                    <span>Hitung Zakat Anda</span>
                  </button>
                </Pressable>

                <Pressable>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="group inline-flex min-h-t-target-lg w-full items-center justify-center gap-2.5 rounded-card border border-white/25 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-md transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-petrol-950 sm:w-auto"
                  >
                    <Lock
                      aria-hidden="true"
                      className="h-4 w-4 text-baznas-gold-display"
                    />
                    <span>Portal Petugas</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-350 ease-zaiflu group-hover:translate-x-1"
                    />
                  </button>
                </Pressable>
              </div>
            </StaggerItem>

            {/* ── Stat strip ── */}
            <StaggerItem>
              <div className="grid gap-4 sm:grid-cols-3">
                {HERO_STATS.map((stat) => (
                  <StatChip
                    key={stat.label}
                    tone="light"
                    label={stat.label}
                    value={stat.value}
                    accent={stat.accent}
                  />
                ))}
              </div>
            </StaggerItem>

            {/* ── Trust line ── */}
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/85">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-baznas-gold-display" />
                  Opini audit WTP
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-md border border-white/20 px-2 py-1 font-mono text-[10px] font-bold text-baznas-gold-display">
                    PSAK 109
                  </span>
                  Standar Akuntansi Zakat
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-md border border-white/20 px-2 py-1 font-mono text-[10px] font-bold text-baznas-gold-display">
                    ISO 37001
                  </span>
                  Anti-Penyuapan
                </span>
              </div>
            </StaggerItem>
          </Stagger>
        </div>

        {/* ──────────────────────────── Logo column ──────────────────────────── */}
        <div className="relative flex flex-col items-center lg:col-span-5">
          {/* WHY THE NEGATIVE ASSET, AND WHY NOTHING AROUND IT.
              The mark sits in a restrained editorial frame on the mesh. The
              frame is structural rather than a floating card: it anchors the
              institutional signature without competing with the headline.

              `/baznas-logo-negative.png` is the official artwork with only
              its LETTERING knocked to the brand's paper cream. The Garuda
              is untouched — gold wings, white body, and the black
              "BHINNEKA TUNGGAL IKA" ribbon, all of which read correctly on
              a petrol-900 ground. The three text bands could not: on the
              light original they are dark green (#215635) and near-black
              (#221F1F), which against the hero's #082018 mesh would have
              fallen to roughly 2:1 and 1:1. The Panduan's own "dark green
              (negative version)" background is the sanctioned case for
              exactly this treatment, so the asset is derived, not invented.

              The file is also cropped to its alpha bounding box, so unlike
              `/baznas-logo.png` it carries no dead transparent margin and
              can be sized directly. */}
          <div className="relative w-full max-w-[25rem] border-y border-white/20 px-7 py-10 sm:px-10 sm:py-14">
            <span aria-hidden="true" className="absolute left-0 top-0 h-12 w-px bg-baznas-gold-display" />
            <span aria-hidden="true" className="absolute bottom-0 right-0 h-12 w-px bg-baznas-gold-display" />
            <img
              src="/baznas-logo-negative.png"
              alt="Logo Resmi BAZNAS Kota Gorontalo — Badan Amil Zakat Nasional"
              className="h-auto w-full object-contain"
              loading="eager"
              decoding="async"
              draggable={false}
            />
            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
              <span>Sejak 2001</span>
              <span className="text-baznas-gold-display">Amanah · Terukur</span>
            </div>
          </div>

          {/* `heroTagline` is a CMS-editable record that the previous landing
              never rendered anywhere. It reads naturally as the office's
              operating principle beneath the mark, so it is surfaced here
              rather than left dead in the data model. */}
          <p className="mt-7 max-w-sm text-center text-xs leading-relaxed text-white/85">
            {berandaContent.heroTagline}
          </p>
        </div>
      </div>
    </Section>
  );
}

export default HeroSection;
