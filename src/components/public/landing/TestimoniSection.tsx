"use client";

/**
 * TestimoniSection — social proof from a muzakki and a mustahik.
 *
 * WHY A 2-COLUMN GRID AT `max-w-4xl` AND NOT A SINGLE COLUMN
 * -------------------------------------------------------
 * `TESTIMONI_LIST` holds exactly two entries — one muzakki, one mustahik —
 * and the two are the whole argument of the section: the same institution is
 * trusted from both sides of the transaction. Putting them side by side at
 * `md:grid-cols-2` makes that pairing literal and lets a reader compare two
 * ~40-word quotes in one horizontal glance instead of scrolling past two
 * stacked 40-word quotes. `max-w-4xl` keeps the pair reading as one composed
 * unit inside the `max-w-7xl` container, so the section does not read as two
 * orphaned quotes adrift in a very wide cream field.
 *
 * A single column at `max-w-3xl` was the other option and was rejected: it
 * would leave the quotes the same width as the section heading directly above
 * them, which flattens the hierarchy between "what we say" and "what they
 * say" — the exact thing this section exists to establish.
 *
 * TONE
 * ----
 * The section keeps `tone="paper"`. Its neighbours are the program grid
 * (`mesh-dark`, rebuilt) and the FAQ accordion (`white`), so `paper` is the
 * only value that keeps a light neighbour on both sides without two adjacent
 * sections sharing a surface.
 *
 * DATA
 * ----
 * Copy and initials come from `TESTIMONI_LIST` in `landing-data`, verbatim.
 * No third testimonial was added: a fabricated quote attributed to a named
 * member of the public is the one piece of content this page genuinely must
 * not invent, and the two real entries already carry the section.
 */

import { Quote } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion";
import {
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import { TESTIMONI_LIST } from "@/components/public/landing/landing-data";

/**
 * Same reasoning as the struktur grid, one level deeper. `StaggerItem` puts an
 * unheighted motion div between the grid cell and our content, and the
 * `<figure>` that `figcaption` legally requires puts one more div between
 * that and the card — so the chain needs BOTH `[&>*]` and `[&>*>*]` to carry
 * `h-full` down to the card. Without it the two cards' footers stop lining up
 * the moment one quote wraps to more lines than the other. The `flex-1` on
 * the blockquote then absorbs the leftover space, which pushes the attribution
 * to the bottom of whichever card is taller.
 */
const CARD_ITEM = "h-full [&>*]:h-full [&>*>*]:h-full";

/* ────────────────────────────────────────────────────────────────────────
 * <TestimoniSection>
 *
 * The `id` is load-bearing: `SECTION_IDS` in landing-data.ts lists
 * "testimoni", and that list is what the footer builds its anchor links from
 * and what the navbar's IntersectionObserver watches. Without a matching
 * `id` in the DOM the footer's "Testimoni Muzakki" link scrolls nowhere and
 * the spy skips this section entirely. Any id in `SECTION_IDS` must exist on
 * exactly one element.
 * ──────────────────────────────────────────────────────────────────────── */

export interface TestimoniSectionProps {
  className?: string;
}

export function TestimoniSection({ className }: TestimoniSectionProps) {
  return (
    <Section
      id="testimoni"
      tone="paper"
      ariaLabelledBy="testimoni-heading"
      className={className}
    >
      <SectionReveal>
        <SectionHeading
          align="center"
          tone="ink"
          headingId="testimoni-heading"
          eyebrow="Suara Muzakki & Mustahik"
          title="Kepercayaan yang Terbangun."
          className="mb-12 lg:mb-14"
        />
      </SectionReveal>

      <Stagger
        immediate={false}
        stagger={0.12}
        className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 lg:gap-6"
      >
        {TESTIMONI_LIST.map((t) => (
          <StaggerItem key={t.nama} className={CARD_ITEM}>
            {/* `figure` is the only element `figcaption` may sit inside, and
                `RoundedCard` has no `figure` variant — so the card nests
                inside the figure rather than the other way round. */}
            <figure className="h-full">
              <RoundedCard
                tone="white"
                interactive
                hoverBorder
                className="!rounded-panel flex h-full flex-col p-7 sm:p-8"
              >
                <Quote
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="h-8 w-8 shrink-0 text-baznas-gold-800"
                />

                <blockquote className="mt-5 flex-1 text-sm italic leading-relaxed text-baznas-ink/90 sm:text-base">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-baznas-ink-8 pt-5">
                  {/* Circular avatar is the documented `rounded-full`
                      exception; the initials themselves are decorative because
                      the real name sits directly beside them. */}
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-full bg-baznas-ink text-xs font-bold tracking-tight text-white"
                  >
                    {t.initials}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-baznas-ink">{t.nama}</p>
                    <p className="mt-0.5 text-[11px] text-baznas-ink/85">{t.role}</p>
                  </div>
                </figcaption>
              </RoundedCard>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export default TestimoniSection;