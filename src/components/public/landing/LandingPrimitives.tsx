"use client";

/**
 * LandingPrimitives — the shared visual kit for the public BAZNAS landing page.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The landing page is being rebuilt as ~12 independent section components
 * (hero, kalkulator, cara-berzakat, tentang, program, struktur, testimoni,
 * faq, cta, footer…). Written independently, each one drifts: a different
 * radius here, a different section padding there, one section with sharp
 * corners because its author forgot the radius token. That is exactly how the
 * previous monolith ended up visually incoherent — it was never one design, it
 * was ten designs inside one file.
 *
 * These primitives are the contract that makes twelve files read as ONE page:
 *
 *   <Section>        owns vertical rhythm + horizontal gutter, per-section
 *                    surface tone, and the `relative` stacking context.
 *   <Eyebrow>        the signature kicker (gold rule + tracked uppercase label).
 *   <SectionHeading> eyebrow + display h2 + lede, and it emits the `<h2 id>`
 *                    so `aria-labelledby` wiring is automatic.
 *   <StatChip>       the rounded stat tile that replaces sharp box-grids.
 *   <RoundedCard>    THE card. One primitive, radius token, optional lift.
 *   <GlassPanel>     frosted surface over the dark mesh.
 *   <GoldRule>       1px gold divider (replaces the old 4px gold bars).
 *   <PillarBadge>    "Pilar 01 / Cerdas" marker.
 *   <ScrollProgressBar> reading-progress indicator, rAF-throttled.
 *   <SectionReveal>  FadeUp wrapper with landing-tuned defaults.
 *
 * RULES ENFORCED HERE (so section files don't have to remember them)
 * ----------------------------------------------------------------
 *   • Every surface is a radius token (`rounded-card` and up). Never sharp.
 *   • Every transition is `transition-all duration-350 ease-zaiflu`.
 *   • Hover lift is never more than `translate-y-0.5` — Zaiflu's 3px.
 *   • Touch targets are at least 44px via the `min-h-t-target*` tokens.
 *   • `prefers-reduced-motion` is handled by the motion primitives
 *     themselves; nothing here adds a raw CSS animation.
 *
 * A11Y CONTRACT
 * -------------
 *   <Section id="program" ariaLabelledBy="program-heading">
 *     <SectionHeading headingId="program-heading" … />   ← h2 gets that id
 *   </Section>
 *
 * `Section` renders a semantic `<section>`; pass `ariaLabelledBy` with the
 * same string you give `SectionHeading`'s `headingId` and the heading is
 * correctly announced without either file hard-coding an id.
 *
 * Every primitive accepts `className` and merges it LAST, so a caller can
 * always override spacing without forking the component.
 */

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { FadeUp, GlassCard } from "@/components/motion";

/* ────────────────────────────────────────────────────────────────────────
 * <Section> — the single section wrapper
 *
 * Owns `py-20 lg:py-28` + `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for every
 * section on the page. A section file that re-declares its own padding will
 * visibly break the rhythm against its neighbours — don't.
 * ──────────────────────────────────────────────────────────────────────── */

export type SectionTone = "paper" | "white" | "mesh-dark";

export interface SectionProps {
  /** Anchor id. Must be one of `SECTION_IDS` from landing-data. */
  id?: string;
  tone?: SectionTone;
  /** Id of the heading that labels this section (see the a11y contract). */
  ariaLabelledBy?: string;
  className?: string;
  children: React.ReactNode;
  /** Override the rhythm when a section must sit tight against a neighbour. */
  padding?: string;
}

export function Section({
  id,
  tone = "paper",
  ariaLabelledBy,
  className,
  children,
  padding,
}: SectionProps) {
  const surface = clsx(
    "relative overflow-hidden",
    tone === "paper" && "bg-baznas-paper text-baznas-ink",
    tone === "white" && "bg-white text-baznas-ink",
    tone === "mesh-dark" && "bg-mesh-dark bg-noise text-white",
  );

  return (
    <section id={id} aria-labelledby={ariaLabelledBy} className={clsx(surface, className)}>
      <div
        className={clsx(
          "relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          padding ?? "py-20 lg:py-28",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <Eyebrow> — the section kicker
 *
 * A 40px gold rule + a 10px uppercase tracked label. The rule is the only
 * place gold appears as a shape; the label carries the meaning, so it takes
 * the readable ink/white colour per contrast rules rather than gold.
 * ──────────────────────────────────────────────────────────────────────── */

export interface EyebrowProps {
  children: React.ReactNode;
  /** `ink` on light surfaces, `light` on the dark mesh. */
  tone?: "ink" | "light";
  /** `center` for section headings, `left` for column headers. */
  align?: "left" | "center";
  className?: string;
}

export function Eyebrow({ children, tone = "ink", align = "left", className }: EyebrowProps) {
  return (
    <p
      className={clsx(
        "flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em]",
        align === "center" && "justify-center",
        tone === "light" ? "text-baznas-gold-display" : "text-baznas-ink/85",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-10 shrink-0 bg-baznas-gold-display" />
      <span>{children}</span>
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <SectionHeading> — eyebrow + display h2 + optional lede
 *
 * The h2 is rendered HERE (not by the section) and takes `headingId`, so the
 * `aria-labelledby` contract in the file header holds automatically.
 *
 * ⚠ `.display-*` classes deliberately do not set `color` (globals.css). This
 * component always pairs one with an explicit `text-*`, so a caller cannot
 * accidentally ship an invisible heading on the dark mesh.
 * ──────────────────────────────────────────────────────────────────────── */

export interface SectionHeadingProps {
  /** Kicker line. Pass `false`/omit for a heading with no eyebrow. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Supporting paragraph under the title. */
  lede?: React.ReactNode;
  align?: "center" | "left";
  tone?: "ink" | "light";
  /** Id for the `<h2>` — feed this to the parent Section's `ariaLabelledBy`. */
  headingId?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  tone = "ink",
  headingId,
  className,
}: SectionHeadingProps) {
  const isLight = tone === "light";

  return (
    <div
      className={clsx(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow tone={tone} align={align === "center" ? "center" : "left"} className="mb-3">
          {eyebrow}
        </Eyebrow>
      )}

      <h2
        id={headingId}
        className={clsx(
          "display-2",
          isLight ? "text-white" : "text-baznas-ink",
        )}
      >
        {title}
      </h2>

      {lede && (
        <p
          className={clsx(
            "mt-4 text-sm sm:text-base leading-relaxed",
            isLight ? "text-white/85" : "text-baznas-ink/85",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <StatChip> — the rounded stat tile
 *
 * Replaces the sharp `gap-px bg-ink-12` box-grid the old hero and stats
 * blocks used. Radius token + hairline border + a display numeral.
 * ──────────────────────────────────────────────────────────────────────── */

export interface StatChipProps {
  label: string;
  /** The figure. Render it yourself if it needs a count-up (AnimatedNumber). */
  value: React.ReactNode;
  /** Small unit/qualifier set beside the figure ("jiwa", "KK", "%"). */
  unit?: string;
  /** One supporting line under the value. */
  hint?: React.ReactNode;
  /** Render the value in restrained gold. Use sparingly — one per view. */
  accent?: boolean;
  /** `light` = frosted tile for the dark mesh; `ink` = solid white tile. */
  tone?: "ink" | "light";
  className?: string;
}

export function StatChip({
  label,
  value,
  unit,
  hint,
  accent = false,
  tone = "ink",
  className,
}: StatChipProps) {
  const isLight = tone === "light";

  return (
    <div
      className={clsx(
        "rounded-card border p-5 transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:shadow-lift",
        isLight
          ? "border-white/15 bg-white/[0.07] backdrop-blur-lg"
          : "border-baznas-ink-8 bg-white",
        className,
      )}
    >
      <p
        className={clsx(
          "text-[10px] font-bold uppercase tracking-[0.22em]",
          isLight ? "text-white/85" : "text-baznas-ink/70",
        )}
      >
        {label}
      </p>

      <p
        className={clsx(
          "display-3 editorial-num mt-1.5 leading-none",
          accent
            ? // Gold only works as a foreground on a dark ground: on paper it
              // is ~1.6:1 and the single most important number in the tile
              // disappears. The deep gold keeps the accent without the
              // failure.
              isLight
                ? "text-baznas-gold-display"
                : "text-baznas-gold-900"
            : isLight
              ? "text-white"
              : "text-baznas-ink",
        )}
      >
        {value}
        {unit && (
          <span
            className={clsx(
              "ml-1 text-sm font-normal tracking-normal",
              isLight ? "text-white/85" : "text-baznas-ink/70",
            )}
          >
            {unit}
          </span>
        )}
      </p>

      {hint && (
        <p
          className={clsx(
            "mt-1.5 text-[11px] leading-snug",
            isLight ? "text-white/85" : "text-baznas-ink/70",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <RoundedCard> — THE card
 *
 * If a section needs a card, it uses this. There is deliberately no second
 * card primitive: the previous build drifted into a dozen bespoke boxes.
 * ──────────────────────────────────────────────────────────────────────── */

export interface RoundedCardProps {
  /** `article` for self-contained content, `div` when the parent is the item. */
  as?: "div" | "article";
  /** `paper` for cards on cream sections, `white` on white, `ink` for emphasis. */
  tone?: "paper" | "white" | "ink";
  /** Adds the Zaiflu hover lift + `shadow-lift`. */
  interactive?: boolean;
  /** Border colour on hover (default green-800, the brand action hover). */
  hoverBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function RoundedCard({
  as: Tag = "div",
  tone = "white",
  interactive = false,
  hoverBorder = false,
  className,
  children,
}: RoundedCardProps) {
  // Emitted as ONE transition class when either flag is set. Tailwind emits
  // `transition-all` and `transition-colors` in that fixed order, so writing
  // both would silently leave the colour animating while the lift snapped.
  const animate = interactive || hoverBorder;

  return (
    <Tag
      className={clsx(
        "relative rounded-card border p-6",
        tone === "paper" && "border-baznas-ink-8 bg-baznas-paper",
        tone === "white" && "border-baznas-ink-8 bg-white",
        tone === "ink" && "border-baznas-ink bg-baznas-ink text-white",
        animate && "transition-all duration-350 ease-zaiflu",
        interactive && "hover:-translate-y-0.5 hover:shadow-lift",
        hoverBorder && "hover:border-baznas-green-800",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <GlassPanel> — frosted surface over the dark mesh
 *
 * Thin wrapper over the shared `GlassCard` motion primitive so landing panels
 * stay identical to the logged-in dashboards' glass treatment.
 * ──────────────────────────────────────────────────────────────────────── */

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  /** `light` = frosted white over the dark mesh; `dark` = deep tint. */
  variant?: "light" | "dark";
  interactive?: boolean;
}

export function GlassPanel({ children, className, variant = "light", interactive }: GlassPanelProps) {
  // WHY the skin classes are repeated here.
  // `GlassCard`'s own skin uses `border-ink/15` / `bg-petrol-900/25`, but
  // `ink` and `petrol` are nested under the `baznas` colour key in
  // tailwind.config.ts — there is no top-level `ink`/`petrol`, so neither
  // class is ever emitted. The `dark` variant therefore renders with NO
  // tint at all and `light` silently falls back to `borderColor.DEFAULT`
  // (an 8% black hairline that disappears against the mesh). Since a broken
  // frost is the whole point of this primitive, the wrapper re-asserts the
  // real tokens. Fixing it upstream in `GlassCard` would also change every
  // logged-in dashboard, so it is corrected at this boundary instead.
  const skin =
    variant === "light"
      ? "border-white/25"
      : "border-white/15 bg-baznas-petrol-900/40";

  // No radius override by default. `GlassCard` sets `rounded-hero`, and CSS
  // source order decides ties between two border-radius utilities — not the
  // order of classes in the attribute — so a caller-supplied `rounded-panel`
  // would be silently dropped. Pass `!rounded-panel` via className if a
  // section truly needs a tighter radius.
  return (
    <GlassCard
      variant={variant}
      interactive={interactive}
      className={clsx("p-6", skin, className)}
    >
      {children}
    </GlassCard>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <GoldRule> — the 1px gold divider
 *
 * Replaces the `border-l-4 border-baznas-gold-display` accent bars used
 * throughout the old build. A 4px bar fights the radius tokens; a hairline
 * rule is the restrained official gold, per the brand guidelines.
 * ──────────────────────────────────────────────────────────────────────── */

export interface GoldRuleProps {
  className?: string;
  /** `horizontal` is the default eyebrow-style rule; `vertical` for list dividers. */
  orientation?: "horizontal" | "vertical";
}

export function GoldRule({ className, orientation = "horizontal" }: GoldRuleProps) {
  if (orientation === "vertical") {
    return (
      <span
        aria-hidden="true"
        className={clsx("w-px shrink-0 self-stretch bg-baznas-gold-display", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={clsx("h-px w-10 shrink-0 bg-baznas-gold-display", className)}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <PillarBadge> — "Pilar 01 / Cerdas"
 *
 * Pairs with `PILLAR_DETAIL` in landing-data: pass the 1-based index and the
 * pilar's short label. Keeps the numeral and the label on one baseline track
 * so a run of four cards lines up.
 * ──────────────────────────────────────────────────────────────────────── */

export interface PillarBadgeProps {
  /** 1-based position. Accepts a number or a pre-padded string ("01"). */
  index: number | string;
  label: string;
  tone?: "ink" | "light";
  className?: string;
}

export function PillarBadge({ index, label, tone = "ink", className }: PillarBadgeProps) {
  const isLight = tone === "light";
  const numeral =
    typeof index === "number" ? String(index).padStart(2, "0") : index;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]",
        isLight ? "text-white/85" : "text-baznas-ink/85",
        className,
      )}
    >
      {/* Same gold-on-dark rule as `StatChip`'s accent: the display gold is
          unreadable on paper, so the light-surface variant drops to the deep
          gold and the divider to a neutral ink hairline. */}
      <span
        className={clsx(
          isLight ? "text-baznas-gold-display" : "text-baznas-gold-900",
        )}
      >
        Pilar {numeral}
      </span>
      <span
        aria-hidden="true"
        className={clsx(
          "h-3 w-px",
          isLight ? "bg-baznas-gold-display/50" : "bg-baznas-ink/20",
        )}
      />
      <span>{label}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <ScrollProgressBar> — reading progress
 *
 * A 2px restrained-gold bar pinned to the top of the viewport.
 *
 * WHY requestAnimationFrame AND NOT A CSS TRANSITION
 * The width is driven by scroll position, which already changes every frame.
 * Adding a 350ms `transition` on top of that makes the bar lag visibly behind
 * the content. So: rAF-throttled scroll listener (passive, so it never blocks
 * scrolling), width written directly, no transition.
 *
 * Reduced motion does NOT hide it — this is a position indicator, not a
 * decorative animation, and the bar simply tracks scroll 1:1 with no easing.
 * ──────────────────────────────────────────────────────────────────────── */

export interface ScrollProgressBarProps {
  className?: string;
}

export function ScrollProgressBar({ className }: ScrollProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // Guard divide-by-zero on pages shorter than the viewport.
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      const bar = barRef.current;
      if (bar) bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={clsx("pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]", className)}
    >
      <div ref={barRef} className="h-full bg-baznas-gold-display" style={{ width: "0%" }} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <SectionReveal> — section-level scroll reveal
 *
 * A thin `FadeUp` wrapper so section files never have to remember the landing
 * defaults (20px travel, 0.5s, EASE_SOFT, fires once at 20% in view). Reduced
 * motion is handled inside `FadeUp` — it renders a plain div and skips the
 * transform entirely.
 * ──────────────────────────────────────────────────────────────────────── */

export interface SectionRevealProps {
  children: React.ReactNode;
  /** Seconds to wait before revealing. Use for manual sequencing. */
  delay?: number;
  /** Travel distance in px. Zaiflu uses ~20. */
  distance?: number;
  /** Animate on mount instead of waiting for the section to enter the viewport. */
  immediate?: boolean;
  className?: string;
}

export function SectionReveal({
  children,
  delay = 0,
  distance = 20,
  immediate = false,
  className,
}: SectionRevealProps) {
  return (
    <FadeUp delay={delay} distance={distance} immediate={immediate} className={className}>
      {children}
    </FadeUp>
  );
}