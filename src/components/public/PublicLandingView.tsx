"use client";

/**
 * PublicLandingView — the composed public landing page.
 *
 * WHY THIS FILE IS NOW ~90 LINES INSTEAD OF 1,345
 * ------------------------------------------------
 * The previous version inlined all eleven sections, every photo URL, every
 * FAQ answer and the whole zakat calculator into one file. It was not big for
 * the sake of big: it was big because there was no boundary between *what the
 * page says* and *where the page puts it*. That is what let a pilar be
 * described with one figure in "Tentang" and a different one in "Program",
 * and what let the `stats-heading` id be referenced without ever existing.
 *
 * The rebuild splits it along that boundary:
 *
 *   landing-data.ts       all copy, all published figures, the anchor registry
 *   LandingPrimitives.tsx the visual contract (surface, radius, motion, a11y)
 *   *Section.tsx          layout only — eleven independent files
 *   PublicLandingView     this file: the ORDER, and nothing else
 *
 * So this file's real job is the narrative order, and the reason for it is
 * worth keeping in writing — it is the one thing a reader who has never seen
 * the page will feel without being told:
 *
 *   1  Hero          hook        — what this is, and what to do next
 *   2  Stats         credibility — the numbers, before anything is asked
 *   3  Kalkulator    utility     — do the maths; the page earns its keep here
 *   4  CaraBerzakat  how-to-pay  — the calculator produced a figure, now pay it
 *   5  Tentang       institutional— who we are, vision, mission, four pillars
 *   6  Program       the work    — what the money actually bought
 *   7  Struktur      governance  — who is accountable for it
 *   8  Testimoni     proof       — people outside the institution, on record
 *   9  FAQ           objections  — the questions the above raises
 *  10  CTA           convert     — one last ask before the footer
 *  11  Footer        the record  — accounts, address, the legal small print
 *
 * Utility (3) deliberately precedes institutional (5). A visitor who came to
 * pay zakat should be able to finish before being asked to read a visi, and
 * the later half of the page is what they read on the way to trusting the
 * first half.
 *
 * SURFACES
 * --------
 * The section order is also the surface order, and the two are not allowed to
 * drift: mesh-dark (hero + stats, one continuous band) → white → paper → white
 * → paper → white → paper → white → mesh-deepest (CTA) → green-950 (footer).
 * `Section`'s `tone` prop owns this; a section that has to break the rhythm
 * should break it deliberately and say why in its own header, as `CtaSection`
 * does.
 *
 * CONTRACT WITH app/page.tsx
 * --------------------------
 * `onOpenLogin` opens the petugas modal; `berandaContent` is the admin-editable
 * record. Both are unchanged from the previous build, so this stays a drop-in
 * for the orchestrator. Note that `berandaContent` is passed down even where a
 * section already defaults it — one source of truth per page load beats relying
 * on two defaults agreeing.
 */

import { BerandaContent } from "@/lib/types";
import { initialBerandaContent } from "@/lib/mock-data";
import {
  CaraBerzakatSection,
  CtaSection,
  FaqSection,
  HeroSection,
  KalkulatorSection,
  LandingFooter,
  ProgramSection,
  StatsSection,
  StrukturSection,
  TentangSection,
  TestimoniSection,
} from "@/components/public/landing";

export interface PublicLandingViewProps {
  onOpenLogin: () => void;
  /** Live landing content. Falls back to the shipped record. */
  berandaContent?: BerandaContent;
}

export function PublicLandingView({
  onOpenLogin,
  berandaContent = initialBerandaContent,
}: PublicLandingViewProps) {
  return (
    <div className="w-full">
      {/*
        Skip-to-content link (WCAG 2.4.1). Exactly one on the public page — the
        logged-in view has its own, and the two branches are mutually exclusive.
        It targets `#hero`, the first real landmark on the page; the previous
        build pointed here too, so the behaviour is unchanged.

        NOTE for whoever wires this into `app/page.tsx`: the orchestrator renders
        `<PublicNavbar>` before `<main>`, so this link is not literally the first
        focusable element — a keyboard user still tabs through the five nav
        links before reaching it. Making it genuinely first means lifting it one
        level up, next to the navbar. Left here so this file stays a self-
        contained drop-in.
      */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-card focus:bg-baznas-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Lewati ke konten utama
      </a>

      {/* 1 — Hook */}
      <HeroSection berandaContent={berandaContent} onOpenLogin={onOpenLogin} />

      {/* 2 — Credibility. `bg-mesh-dark` continues the hero's band. */}
      <StatsSection berandaContent={berandaContent} />

      {/* 3 — Utility */}
      <KalkulatorSection onOpenLogin={onOpenLogin} />

      {/* 4 — How to pay */}
      <CaraBerzakatSection berandaContent={berandaContent} onOpenLogin={onOpenLogin} />

      {/* 5 — Institutional */}
      <TentangSection berandaContent={berandaContent} />

      {/* 6 — The work */}
      <ProgramSection />

      {/* 7 — Governance */}
      <StrukturSection />

      {/* 8 — Proof */}
      <TestimoniSection />

      {/* 9 — Objections */}
      <FaqSection berandaContent={berandaContent} />

      {/* 10 — Convert */}
      <CtaSection onOpenLogin={onOpenLogin} />

      {/* 11 — The record */}
      <LandingFooter berandaContent={berandaContent} />
    </div>
  );
}

export default PublicLandingView;