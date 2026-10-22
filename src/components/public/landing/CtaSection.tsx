"use client";

/**
 * CtaSection — the pre-footer conversion band.
 *
 * WHY IT IS A CARD AND NOT A BAND
 * -------------------------------
 * The old CTA was a bare mesh strip: centred text and two buttons floating on
 * the gradient with no edge of its own. It read as a divider rather than an
 * invitation, and because the hero and the CTA both used `bg-mesh-dark` with
 * nothing between them, the two dark regions on the page blurred into one.
 *
 * Three changes fix that:
 *
 *   1. `bg-mesh-deepest` (one step deeper than the hero's `bg-mesh-dark`) so
 *      the band separates from the hero even though both are dark.
 *   2. A `GlassPanel` frame with `!rounded-panel` — the "important" modifier is
 *      required, not decorative: `GlassPanel` hard-sets `rounded-hero` and both
 *      are same-property radius utilities, so which one wins is decided by
 *      stylesheet order rather than by the order of classes in the attribute.
 *   3. A `GhostNumber` carrying the CTA's own copy fragment, so the frame has
 *      the same architectural depth as the hero and the stats panel above it.
 *
 * COPY IS UNCHANGED
 * -----------------
 * The eyebrow, the headline and the supporting line are the old strings, in
 * the old order. Only the `Sparkles` icon is gone — it was a decorative
 * dingbat, and `Eyebrow` already carries a gold rule that does that job in the
 * design system instead of importing an icon.
 *
 * Both CTAs repeat the hero's actions deliberately: a visitor who scrolls
 * straight to the footer has not seen the calculator, so the band must still
 * offer it.
 */

import React from "react";
import { ArrowRight, Calculator, Lock } from "lucide-react";

import { GhostNumber, Pressable, Stagger, StaggerItem } from "@/components/motion";
import {
  Eyebrow,
  GlassPanel,
  Section,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import { scrollToLandingSection } from "@/components/public/landing/HeroSection";

export interface CtaSectionProps {
  /** Opens the petugas login modal. */
  onOpenLogin: () => void;
  className?: string;
}

export function CtaSection({ onOpenLogin, className }: CtaSectionProps) {
  return (
    <Section
      ariaLabelledBy="cta-heading"
      // WHY `bg-mesh-deepest` AND NOT AN OVERRIDE MODIFIER.
      // `Section tone="mesh-dark"` already applies `bg-mesh-dark`, and both
      // mesh surfaces are hand-written classes in globals.css (not Tailwind
      // utilities, so `!important` on them would be silently dropped). They
      // have equal specificity, and `.bg-mesh-deepest` is declared *after*
      // `.bg-mesh-dark` in globals.css:302 vs :295 — so source order makes the
      // deeper mesh win. Swapping the tone instead would break the light-surface
      // text colours the primitives derive from it.
      className={`bg-mesh-deepest text-white ${className ?? ""}`}
      padding="py-14 lg:py-20"
    >
      <GlassPanel
        variant="dark"
        // `relative` is required: `GlassCard` sets no positioning, so without
        // it the GhostNumber below would anchor to the `Section` wrapper and
        // land in the wrong corner entirely. `overflow-hidden` clips that
        // numeral to the rounded panel instead of letting it bleed into the
        // section above — `GlassCard` does not set either property.
        className="relative overflow-hidden !rounded-panel px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
      >
        {/* Decorative depth — re-asserted in white because `GhostNumber`'s own
            colour token is a dead class upstream. */}
        <GhostNumber className="-right-4 -top-8 select-none text-[112px] text-white/[0.07] sm:text-[148px]">
          zakat
        </GhostNumber>

        {/* Below the fold: `Stagger` waits for the section to enter view rather
            than playing its cascade while it is still off-screen. */}
        <Stagger immediate={false} stagger={0.08} delayChildren={0.05} className="relative mx-auto max-w-2xl text-center">
          <StaggerItem>
            <Eyebrow tone="light" align="center" className="mb-5">
              Siap Menunaikan Zakat?
            </Eyebrow>
          </StaggerItem>

          <StaggerItem>
            <h2 id="cta-heading" className="display-3 text-balance text-white">
              Tunaikan zakat Anda bersama BAZNAS Kota Gorontalo.
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 text-base leading-relaxed text-white/90">
              Mulai hitung dan bayar zakat Anda hari ini. Setiap rupiah yang Anda
              titipkan adalah harapan bagi mereka yang membutuhkan.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Pressable>
                <button
                  type="button"
                  onClick={() => scrollToLandingSection("kalkulator")}
                  className="group inline-flex min-h-t-target-lg w-full items-center justify-center gap-2.5 rounded-card bg-baznas-gold-display px-7 text-sm font-bold text-baznas-ink transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-baznas-gold-500 hover:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-petrol-950 sm:w-auto"
                >
                  <Calculator
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-350 ease-zaiflu group-hover:rotate-12"
                  />
                  <span>Hitung Zakat Anda</span>
                </button>
              </Pressable>

              <Pressable>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="group inline-flex min-h-t-target-lg w-full items-center justify-center gap-2.5 rounded-card border border-white/30 px-7 text-sm font-bold text-white transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-petrol-950 sm:w-auto"
                >
                  <Lock aria-hidden="true" className="h-4 w-4 text-baznas-gold-display" />
                  <span>Portal Petugas</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-350 ease-zaiflu group-hover:translate-x-1"
                  />
                </button>
              </Pressable>
            </div>
          </StaggerItem>
        </Stagger>

        {/* Below-the-fold single-element reveal for the legal reassurance line —
            kept out of the stagger so it does not compete with the CTAs. */}
        <SectionReveal className="relative mx-auto mt-8 max-w-2xl">
          <p className="text-center text-xs leading-relaxed text-white/85">
            Rekening resmi BAZNAS Kota Gorontalo — Bank Sulutgo, Bank Muamalat,
            dan Bank BTN Syariah. Kuitansi resmi diterbitkan otomatis untuk
            setiap setoran yang tercatat.
          </p>
        </SectionReveal>
      </GlassPanel>
    </Section>
  );
}

export default CtaSection;