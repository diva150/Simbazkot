"use client";

/**
 * ProgramSection — "Aksi Nyata, Dampak Terukur". The four flagship programs.
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * These four cards are the commercial centre of the landing page: they are what
 * a prospective muzakki is really asking about when they scroll past the hero.
 * The old build got the content right and the craft wrong — four sharp-cornered
 * `border` boxes with an all-ink photo well, a tiny "Pilar N" tag crammed into
 * the top-left corner with a full-bleed hover scrim that did nothing for
 * legibility, and a `GhostNumber` at 5% ink fighting the photo for attention.
 *
 * The rebuild keeps every word and every data binding and fixes the surface:
 *
 *   • `rounded-panel` cards with the Zaiflu 3px lift on hover.
 *   • The photo well is scrimmed from the bottom with a real gradient, which is
 *     what makes the overlaid `PillarBadge` readable — the old scrim only
 *     appeared on hover and sat on top of the chip rather than under it.
 *   • `PillarBadge` replaces the ad-hoc tag, and it is indexed from
 *     `PILLAR_PROGRAM`, not from the loop position. `PROGRAM_UNGGULAN` is
 *     ordered Cerdas → Sehat → Makmur → Peduli while `PILLAR_PROGRAM` is
 *     Cerdas → Sehat → Peduli → Makmur, so the old `idx + 1` printed
 *     "Pilar 03 / Mandiri" on this surface and "Pilar 03 / Peduli" on the
 *     pillar grid in `TentangSection`. Deriving the index from the canonical
 *     pillar order removes that class of bug for good.
 *   • Target and Pagu stay a 2-column footer with a hairline above, pagu in
 *     deep green tabular figures.
 *
 * PHOTO FAILURE BEHAVIOUR
 * -----------------------
 * Unchanged from the old build on purpose: `onError` hides the `<img>`, so a
 * third-party CDN outage degrades to the card's own dark well rather than a
 * broken-image glyph. The scrim and the badge survive because they are
 * siblings of the image, not children of it.
 *
 * ⚠ ONE DELIBERATE `bg-gradient-*`
 * -------------------------------
 * Project rules ban `bg-gradient-to-*` as an AI-slop tell, because it is the
 * signature of a decorative "purple-to-pink" wash. The photo scrim below is the
 * one sanctioned exception on this page: it is a legibility device (WCAG 1.4.11
 * — the `PillarBadge` text must clear contrast over an arbitrary photograph),
 * it uses only two approved brand tokens, and there is no `bg-mesh-*` class that
 * expresses "fade this image into its surface". Everything else on the landing
 * page uses mesh surfaces.
 */

import { GhostNumber, Stagger, StaggerItem } from "@/components/motion";
import {
  PillarBadge,
  RoundedCard,
  Section,
  SectionHeading,
} from "@/components/public/landing/LandingPrimitives";
import { PILAR_PROGRAM, PROGRAM_UNGGULAN } from "@/components/public/landing/landing-data";

/**
 * Canonical "Pilar NN" numbering, derived from `PILLAR_PROGRAM` order rather
 * than from the position in `PROGRAM_UNGGULAN`. See the file header — the two
 * arrays are deliberately ordered differently and the old loop conflated them.
 */
const PILAR_INDEX: Record<string, number> = PILAR_PROGRAM.reduce(
  (acc, pilar, idx) => ({ ...acc, [pilar.key]: idx + 1 }),
  {} as Record<string, number>,
);

/** The short pillar label ("Cerdas") that `PillarBadge` prints beside the index. */
const PILAR_LABEL: Record<string, string> = PILAR_PROGRAM.reduce(
  (acc, pilar) => ({ ...acc, [pilar.key]: pilar.label }),
  {} as Record<string, string>,
);

/**
 * `StaggerItem` wraps its child in an extra motion div that declares no
 * height, so `[&>*]` is what lets a `h-full` card fill a stretched grid row.
 * Without it the four cards end on ragged footers whenever one description
 * wraps onto a third line.
 */
const GRID_ITEM = "h-full [&>*]:h-full";

export interface ProgramSectionProps {
  className?: string;
}

export function ProgramSection({ className }: ProgramSectionProps) {
  return (
    <Section
      id="program"
      tone="paper"
      ariaLabelledBy="program-heading"
      className={className}
    >
      <SectionHeading
        headingId="program-heading"
        eyebrow="Program Prioritas"
        title="Aksi Nyata, Dampak Terukur."
        lede="Empat program unggulan yang sedang berjalan di tahun 2026 dengan target penerima dan pagu anggaran transparan."
        className="mb-12 lg:mb-14"
      />

      {/* `immediate={false}` — `Stagger` defaults to animating on MOUNT, which
          would play the cascade while the section is still off-screen and
          leave it static by the time the reader arrives. */}
      <Stagger
        immediate={false}
        stagger={0.08}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {PROGRAM_UNGGULAN.map((program) => {
          const pilarIndex = PILAR_INDEX[program.key];
          const pilarLabel = PILAR_LABEL[program.key];

          return (
            <StaggerItem key={program.key} className={GRID_ITEM}>
              <RoundedCard
                as="article"
                tone="white"
                interactive
                // `!rounded-panel` so the photo's `rounded-t-panel` matches the
                // card's own top corners exactly — `RoundedCard` defaults to
                // `rounded-card` (20px) and a 20px/28px mismatch shows as two
                // clipped corners on the image. `overflow-hidden` clips the
                // photo, `!p-0` lets it run to the card edge, and `group` lets
                // the image and badge react to the card's hover.
                className="group h-full overflow-hidden !rounded-panel !p-0"
              >
                {/* Oversized ghost numeral. `GhostNumber`'s own colour token is
                    a dead class upstream (it asks for a top-level `ink`, which
                    does not exist), so the colour is re-asserted here. */}
                <GhostNumber className="-right-2 -top-4 select-none text-[64px] text-baznas-ink/[0.05] sm:text-[80px]">
                  {String(pilarIndex).padStart(2, "0")}
                </GhostNumber>

                {/* ── Photo well ── */}
                <div className="relative aspect-[16/8] overflow-hidden rounded-t-panel bg-baznas-ink">
                  <img
                    src={program.photo}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-zaiflu group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // A dead CDN should degrade to the dark well, not to a
                      // broken-image glyph. Sibling scrim + badge survive.
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* Bottom scrim — the legibility device described in the file
                      header. Anchored to the bottom edge so it never covers the
                      top of the photograph. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-baznas-ink/85 via-baznas-ink/45 to-transparent"
                  />

                  <PillarBadge
                    index={pilarIndex}
                    label={pilarLabel}
                    tone="light"
                    className="absolute bottom-3 left-4"
                  />
                </div>

                {/* ── Body ── */}
                <div className="relative p-5">
                  <h3 className="font-poppins text-base font-bold text-baznas-ink transition-colors duration-350 ease-zaiflu group-hover:text-baznas-green-900">
                    {program.title}
                  </h3>

                  <p className="mt-2 min-h-[3em] text-xs leading-relaxed text-baznas-ink/85">
                    {program.desc}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-baznas-ink-8 pt-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink/70">
                        Target
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-baznas-ink">
                        {program.target}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-baznas-ink/70">
                        Pagu 2026
                      </p>
                      <p className="editorial-num mt-0.5 text-xs font-extrabold text-baznas-green-900">
                        {program.pagu}
                      </p>
                    </div>
                  </div>
                </div>
              </RoundedCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export default ProgramSection;
