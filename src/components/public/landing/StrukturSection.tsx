"use client";

/**
 * StrukturSection — "Struktur Organisasi", the governance-transparency block.
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * The previous build drew the org chart the way a slide deck would: a
 * `border-l-4` gold bar down the left of every card, square white avatars,
 * and a sharp black slab for the jabatan. It read as a Word document
 * with a highlight on it — sharp corners in a page whose entire design system
 * is built on 20–40px radii, which is exactly the visual seam the overhaul
 * exists to close.
 *
 * The rebuild keeps the hierarchy the reader actually needs (one Ketua above
 * four Wakil above their staf) and drops the decoration that fought it:
 *
 *   1. KETUA    one `rounded-panel` card, `max-w-md`, centred — a 96px
 *               CIRCULAR monogram, `display-3` name, and a soft green chip
 *               for the jabatan. Radius, not a 4px gold bar, does the
 *               "this is the top of the chart" signalling now.
 *   2. CONNECTOR a single 40px hairline instead of a drawn chart scaffold.
 *   3. WAKIL   four `rounded-card` cards, circular 64px monograms, and the
 *               staf roster in a divided sub-block so the card reads as two
 *               tiers instead of one long list.
 *
 * PHOTOS
 * ------
 * `strukturOrganisasiResmiData` does carry a `fotoUrl` per person, but real
 * portraits of real BAZNAS officers were explicitly declined by the user, so
 * this section renders the monogram treatment throughout. `fotoUrl` stays
 * untouched in the mock data for whatever surface does end up using it.
 *
 * DATA
 * ----
 * Everything is read from `strukturOrganisasiResmiData` in `@/lib/mock-data` —
 * the same source the old inline section used, so no name, jabatan, bidang,
 * or staf assignment can drift. `monogram()` comes from `landing-data` so the
 * initials are derived by the one shared helper rather than re-implemented.
 */

import clsx from "clsx";

import { Stagger, StaggerItem } from "@/components/motion";
import { strukturOrganisasiResmiData } from "@/lib/mock-data";
import {
  Eyebrow,
  GoldRule,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import { monogram } from "@/components/public/landing/landing-data";

/**
 * `StaggerItem` wraps its child in an extra motion div that declares no
 * height, so `[&>*]` is what lets a `h-full` card fill a stretched grid row.
 * Without it the four wakil cards end on ragged baselines whenever one of
 * them carries a third staf line and its neighbour carries one.
 */
const CARD_ITEM = "h-full [&>*]:h-full";

/* ────────────────────────────────────────────────────────────────────────
 * <MonogramAvatar> — the portrait stand-in
 *
 * WHY CIRCULAR
 * `rounded-full` is banned across this design system, with one documented
 * exception: avatars. A circle is the one shape that reads as "a person"
 * without a photograph; a square with the same radius tokens reads as a
 * missing image. The initials themselves are `aria-hidden` — "HR" announced
 * aloud is noise — and the person's real name always sits beside it.
 * ──────────────────────────────────────────────────────────────────────── */

type AvatarSize = "lg" | "md" | "sm";

const AVATAR: Record<AvatarSize, { box: string; text: string; ring: string }> = {
  // `display-2` rather than `display-1` on the 96px circle: a circle has far
  // less usable width than its bounding box, and a two-letter monogram set at
  // the 64px clamp of `display-1` collides with the rim.
  lg: { box: "h-24 w-24", text: "display-2", ring: "border-baznas-gold-display/70" },
  md: { box: "h-16 w-16", text: "text-xl", ring: "border-baznas-ink-12" },
  sm: { box: "h-9 w-9", text: "text-[10px]", ring: "border-baznas-ink-12" },
};

function MonogramAvatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: AvatarSize;
  className?: string;
}) {
  const spec = AVATAR[size];

  return (
    <span
      aria-hidden="true"
      className={clsx(
        "flex shrink-0 select-none items-center justify-center rounded-full border bg-white font-bold leading-none text-baznas-green-900",
        spec.box,
        spec.text,
        spec.ring,
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <StrukturSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface StrukturSectionProps {
  className?: string;
}

export function StrukturSection({ className }: StrukturSectionProps) {
  const { ketua, wakilKetuaList } = strukturOrganisasiResmiData;

  return (
    <Section
      id="struktur"
      tone="white"
      ariaLabelledBy="struktur-heading"
      className={className}
    >
      <SectionReveal>
        <SectionHeading
          align="center"
          tone="ink"
          headingId="struktur-heading"
          eyebrow="Tata Kelola Lembaga"
          title="Struktur Organisasi."
          lede="Pimpinan dan pembagian empat bidang kerja operasional."
          className="mb-12 lg:mb-14"
        />
      </SectionReveal>

      {/* ── Ketua — the apex. `max-w-md` centred so it reads as a parent, not
             as a fifth peer in the grid below. ── */}
      <SectionReveal delay={0.05} className="mx-auto w-full max-w-md">
        <RoundedCard
          as="article"
          tone="paper"
          className="!rounded-panel relative overflow-hidden p-8 text-center shadow-rest"
        >
          {/* Panel-local mesh, mirroring `ModuleDashboard.HeroPanel` — the
              depth belongs inside the card, not behind the section. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-mesh-light opacity-80"
          />

          <div className="relative">
            <MonogramAvatar initials={monogram(ketua.nama)} size="lg" className="mx-auto" />

            <Eyebrow align="center" className="mb-3">
              Ketua Lembaga
            </Eyebrow>

            <h3 className="display-3 text-baznas-ink">{ketua.nama}</h3>

            <span className="mt-3 inline-flex items-center rounded-chip border border-baznas-green-600/25 bg-baznas-green-600/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-baznas-green-900">
              {ketua.jabatan}
            </span>

            <p className="mx-auto mt-4 max-w-xs text-[11px] leading-relaxed text-baznas-ink/85">
              Penanggung Jawab Utama Kebijakan Lembaga
            </p>
          </div>
        </RoundedCard>
      </SectionReveal>

      {/* ── Connector: one 40px hairline. `!self-start` is required because
             `GoldRule`'s vertical variant ships `self-stretch`, and two
             same-property utilities are separated by stylesheet order, not by
             the order they appear in this attribute. ── */}
      <div className="flex justify-center" aria-hidden="true">
        <GoldRule orientation="vertical" className="!self-start h-10 opacity-50" />
      </div>

      {/* ── Wakil Ketua ── */}
      <Stagger
        immediate={false}
        stagger={0.09}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {wakilKetuaList.map((waka) => (
          <StaggerItem key={waka.id} className={CARD_ITEM}>
            <RoundedCard
              as="article"
              tone="paper"
              hoverBorder
              className="flex h-full flex-col text-center"
            >
              <MonogramAvatar initials={monogram(waka.nama)} size="md" className="mx-auto mb-3" />

              <Eyebrow align="center" className="mb-1">
                Wakil Ketua
              </Eyebrow>

              <h4 className="text-sm font-bold leading-tight text-baznas-ink">{waka.nama}</h4>

              <span className="mt-2 inline-flex items-center rounded-chip border border-baznas-green-600/25 bg-baznas-green-600/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-baznas-green-900">
                {waka.jabatan}
              </span>

              {/* The `bidang` field is the one datum the old inline grid owned
                  in the data but never rendered. Surfacing it is what makes
                  "empat bidang kerja operasional" in the lede verifiable. */}
              <p className="mt-3 text-[11px] leading-snug text-baznas-ink/85">{waka.bidang}</p>

              {waka.stafList.length > 0 && (
                <div className="mt-auto border-t border-baznas-ink-8 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-baznas-ink/70">
                    Pelaksana / Staf
                  </p>

                  <ul className="mt-3 space-y-3">
                    {waka.stafList.map((staf, sIdx) => (
                      <li key={`${waka.id}-staf-${sIdx}`} className="flex items-center gap-3 text-left">
                        <MonogramAvatar initials={monogram(staf.nama)} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-baznas-ink">
                            {staf.nama}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-baznas-ink/85">
                            {staf.bidangTugas}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </RoundedCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export default StrukturSection;