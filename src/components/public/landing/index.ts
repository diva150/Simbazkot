/**
 * Barrel for the public landing page kit.
 *
 * WHY A BARREL AT ALL
 * -------------------
 * The landing page is eleven section components plus a shared primitive kit and
 * a static content module. Importing them by deep path works, but it is how a
 * page starts drifting: a section is added and the composer forgets it, or two
 * composers reach for the same section through two different specifiers.
 * One entry point makes the whole kit — and only the kit — visible at a glance.
 *
 * USAGE
 * -----
 *   import {
 *     HeroSection,
 *     StatsSection,
 *     Section,
 *     RoundedCard,
 *     NAV_LINKS,
 *   } from "@/components/public/landing";
 *
 * The composed page itself lives one level up, in
 * `@/components/public/PublicLandingView`, and is deliberately NOT re-exported
 * from here — it imports this barrel, so exporting it back would close a cycle.
 *
 * Named exports only. No default re-export: a barrel with both is ambiguous
 * about which thing it is, and every consumer here wants a named symbol.
 */

/* ── Composed sections, in narrative order ─────────────────────────────── */
export { HeroSection, scrollToLandingSection } from "./HeroSection";
export type { HeroSectionProps } from "./HeroSection";
export { StatsSection } from "./StatsSection";
export type { StatsSectionProps } from "./StatsSection";
export { KalkulatorSection } from "./KalkulatorSection";
export type { KalkulatorSectionProps } from "./KalkulatorSection";
export { CaraBerzakatSection } from "./CaraBerzakatSection";
export type { CaraBerzakatSectionProps } from "./CaraBerzakatSection";
export { TentangSection } from "./TentangSection";
export type { TentangSectionProps } from "./TentangSection";
export { ProgramSection } from "./ProgramSection";
export type { ProgramSectionProps } from "./ProgramSection";
export { StrukturSection } from "./StrukturSection";
export type { StrukturSectionProps } from "./StrukturSection";
export { TestimoniSection } from "./TestimoniSection";
export type { TestimoniSectionProps } from "./TestimoniSection";
export { FaqSection } from "./FaqSection";
export type { FaqSectionProps } from "./FaqSection";
export { CtaSection } from "./CtaSection";
export type { CtaSectionProps } from "./CtaSection";
export { LandingFooter } from "./LandingFooter";
export type { LandingFooterProps } from "./LandingFooter";

/* ── The shared visual contract every section is built from ────────────── */
export {
  Section,
  SectionHeading,
  SectionReveal,
  Eyebrow,
  StatChip,
  RoundedCard,
  GlassPanel,
  GoldRule,
  PillarBadge,
  ScrollProgressBar,
} from "./LandingPrimitives";
export type {
  SectionTone,
  SectionProps,
  SectionHeadingProps,
  SectionRevealProps,
  EyebrowProps,
  StatChipProps,
  RoundedCardProps,
  GlassPanelProps,
  GoldRuleProps,
  PillarBadgeProps,
  ScrollProgressBarProps,
} from "./LandingPrimitives";

/* ── Static content + the anchor registry every anchor consumer reads ───── */
export {
  SECTION_IDS,
  NAV_LINKS,
  PILAR_PROGRAM,
  PILLAR_DETAIL,
  PROGRAM_UNGGULAN,
  PROGRAM_PHOTOS,
  CARA_BERZAKAT_STEPS,
  TESTIMONI_LIST,
  FAQ_LIST,
  ZAKAT_MAAL_FIELDS,
  monogram,
} from "./landing-data";
export type {
  SectionId,
  NavLink,
  Pilar,
  PilarKey,
  PilarDetail,
  ProgramUnggulan,
  CaraBerzakatStep,
  Testimoni,
  FaqItem,
  ZakatMaalKey,
  ZakatMaalField,
} from "./landing-data";