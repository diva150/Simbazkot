"use client";

/**
 * FaqSection — objection handling, the last stop before the CTA.
 *
 * WHY THIS SECTION LOOKS THE WAY IT DOES
 * --------------------------------------
 * The FAQ is where a wavering reader goes to look for the reason not to give.
 * The old build answered those questions competently but presented them as a
 * stack of sharp-cornered hairline boxes — a visual register that reads as
 * "legal fine print" and actively works against the trust the rest of the page
 * is trying to earn. So the content is preserved word for word and the
 * *container* is rebuilt: rounded cards, a paired numeral + chevron control,
 * and a single warm accent that only appears on the item currently open.
 *
 * THE ACCENT IS A STATE, NOT A DECORATION
 * ---------------------------------------
 * `baznas-gold-display` appears on exactly two things here — the border of the
 * open card and the numeral chip inside it — so gold reads as "this one is
 * open" rather than as a brand smear. Everything else stays ink, paper, or the
 * deep panel used for the escape hatch at the bottom.
 *
 * THE PANEL IS NEVER UNMOUNTED
 * ---------------------------
 * The old implementation's trick is preserved verbatim and is load-bearing:
 *
 *   • The panel always exists in the DOM, so the header button's
 *     `aria-controls` always resolves to a real element. Toggling it in and out
 *     of the tree would make `aria-controls` dangle whenever it is closed.
 *   • It is hidden with `visibility: hidden`, not with `display: none`, so the
 *     closed answer leaves the accessibility tree and cannot receive focus,
 *     while `height` stays animatable. (`display: none` would kill the height
 *     animation, which is the entire reason the panel is kept mounted.)
 *   • The `visibility` transition carries a delay that only applies on CLOSE,
 *     so the flag flips *after* the height has finished collapsing. Flip it
 *     simultaneously and a screen-reader user can still focus a link inside a
 *     panel that is visibly shut.
 *
 * That timing is easy to "tidy up" into a bug, so it is ported as written and
 * commented rather than rewritten.
 */

import React, { useState } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Mail, MapPin, Phone } from "lucide-react";

import { BerandaContent } from "@/lib/types";
import { EASE_SOFT, Stagger, StaggerItem } from "@/components/motion";
import {
  Eyebrow,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import { FAQ_LIST, type FaqItem } from "@/components/public/landing/landing-data";

/* ────────────────────────────────────────────────────────────────────────
 * telHref — turn a display-formatted phone string into a dialable one
 *
 * `BerandaContent.telepon` is written for the eye: "(0435) 826789 /
 * 0812-4567-8901". Handing that straight to `href="tel:"` produces a link no
 * handset can act on. So the *first* number is dialled and the stored value is
 * still what the visitor reads — the link and the label never disagree about
 * which office is being called.
 * ──────────────────────────────────────────────────────────────────────── */

function telHref(telepon: string): string {
  const digits = telepon.split("/")[0].replace(/\D/g, "");
  return `tel:${digits || telepon.replace(/\s/g, "")}`;
}

/* ────────────────────────────────────────────────────────────────────────
 * <FaqAccordionItem> — one question, one always-mounted answer panel
 * ──────────────────────────────────────────────────────────────────────── */

interface FaqAccordionItemProps {
  faq: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqAccordionItem({ faq, index, isOpen, onToggle }: FaqAccordionItemProps) {
  const questionId = `faq-question-${index}`;
  const panelId = `faq-answer-${index}`;

  return (
    <RoundedCard
      tone="paper"
      /* Only the closed card advertises the green hover border — on the open
         one it would fight the gold "you are here" tint. */
      hoverBorder={!isOpen}
      className={clsx(
        // `RoundedCard` hard-sets `p-6`; a header button has to sit flush to
        // the card edge, so the padding is overridden with the important
        // modifier (CSS source order, not class order, decides same-property
        // utilities — see the note in StatsSection).
        "!p-0 overflow-hidden transition-all duration-350 ease-zaiflu",
        isOpen && "!border-baznas-gold-display shadow-rest",
      )}
    >
      {/* The question is an <h3> so screen-reader users can jump between
          questions by heading instead of tabbing through five buttons. */}
      <h3 className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={clsx(
            "flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6",
            "min-h-t-target-lg transition-colors duration-350 ease-zaiflu",
            isOpen ? "bg-white/70" : "hover:bg-white/70",
          )}
        >
          <span
            id={questionId}
            className="flex items-start gap-3 text-sm font-bold leading-snug text-baznas-ink sm:text-base"
          >
            <span
              aria-hidden="true"
              className={clsx(
                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                "text-[11px] font-bold editorial-num transition-colors duration-350 ease-zaiflu",
                isOpen
                  ? "bg-baznas-gold-display text-baznas-ink"
                  : "border border-baznas-ink-20 bg-white text-baznas-ink/85",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {faq.q}
          </span>

          {/* One chevron that rotates, rather than a Plus/Minus swap: the
              rotation survives `prefers-reduced-motion` (the global media
              query collapses the transition to 0.01ms but the end state is
              still legible) and it removes a two-icon crossfade from the
              header. */}
          <span
            aria-hidden="true"
            className={clsx(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              "transition-colors duration-350 ease-zaiflu",
              isOpen
                ? "border-baznas-ink bg-baznas-ink text-baznas-gold-display"
                : "border-baznas-ink-20 text-baznas-ink/70",
            )}
          >
            <ChevronDown
              className={clsx(
                "h-4 w-4 transition-transform duration-350 ease-zaiflu",
                isOpen && "rotate-180",
              )}
            />
          </span>
        </button>
      </h3>

      {/* Panel TETAP di-mount saat tertutup agar `aria-controls` di button
          selalu menunjuk elemen yang benar-benar ada (a11y). `visibility`
          (bukan unmount / display:none) dipakai supaya konten tertutup hilang
          dari accessibility tree & tak bisa di-focus, sementara height tetap
          bisa dianimasikan. Delay `visibility` hanya saat MENUTUP (0.25s),
          supaya flag berubah setelah height selesai menutup — kalau berubah
          bersamaan, pembaca layar masih bisa menabrak tautan di panel yang
          secara visual sudah tertutup. */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={questionId}
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
        }}
        transition={{
          height: { duration: 0.35, ease: EASE_SOFT },
          opacity: {
            duration: 0.25,
            ease: EASE_SOFT,
            delay: isOpen ? 0 : 0.25,
          },
          visibility: { duration: 0 },
        }}
        className="overflow-hidden"
      >
        <div className="border-t border-baznas-ink-8 px-5 pb-5 pt-5 text-sm leading-relaxed text-baznas-ink/85 sm:px-6 sm:pb-6">
          {faq.a}
        </div>
      </motion.div>
    </RoundedCard>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <FaqSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface FaqSectionProps {
  /** Live landing content — supplies the contact routes in the escape hatch. */
  berandaContent: BerandaContent;
  className?: string;
}

export function FaqSection({ berandaContent, className }: FaqSectionProps) {
  // First item open on arrival: the most common objection (what is zakat
  // profesi / how much) is answered before the reader has to click anything.
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    // `white` surface (as in the previous build) so the cream cards read as
    // raised objects and this section never matches its neighbours.
    <Section id="faq" tone="white" ariaLabelledBy="faq-heading" className={className}>
      <SectionHeading
        align="center"
        headingId="faq-heading"
        eyebrow="Pertanyaan Umum"
        title="Sebelum Anda Bertanya."
        lede="Jawaban untuk pertanyaan yang paling sering diajukan mengenai zakat, infak, dan sedekah."
        className="max-w-4xl"
      />

      <Stagger immediate={false} stagger={0.07} className="mt-10 space-y-3 lg:mt-14">
        {FAQ_LIST.map((faq, idx) => (
          <StaggerItem key={faq.q}>
            <FaqAccordionItem
              faq={faq}
              index={idx}
              isOpen={openFaq === idx}
              onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
            />
          </StaggerItem>
        ))}
      </Stagger>

      {/* ── Escape hatch ──
          The accordion answers the five objections the page anticipated. This
          is what happens when it did not anticipate yours — the deep ink panel
          is the one place in this section where the hierarchy inverts, so the
          eye lands on it exactly when the copy says it should. */}
      <SectionReveal className="mt-10 lg:mt-14">
        <RoundedCard
          tone="ink"
          className="relative !rounded-panel !border-white/10 overflow-hidden p-7 shadow-deep sm:p-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-70"
          />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <Eyebrow tone="light" className="mb-3">
                Belum terjawab?
              </Eyebrow>

              <h3 className="display-3 text-white">
                Tanyakan langsung kepada tim layanan kami.
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85">
                Daftar di atas mencakup pertanyaan yang paling sering diajukan.
                Untuk hal lain — termasuk pengecekan status setoran dan
                pengajuan kuitansi — hubungi langsung Kantor BAZNAS Kota
                Gorontalo.
              </p>

              <p className="mt-5 flex items-start gap-2.5 text-xs leading-relaxed text-white/85">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-baznas-gold-display"
                  aria-hidden="true"
                />
                <span>{berandaContent.alamat}</span>
              </p>
            </div>

            <div className="grid gap-3 lg:col-span-5">
              <ContactLink
                href={`mailto:${berandaContent.email}`}
                icon={<Mail className="h-4 w-4" aria-hidden="true" />}
                label="Email"
                value={berandaContent.email}
              />
              <ContactLink
                href={telHref(berandaContent.telepon)}
                icon={<Phone className="h-4 w-4" aria-hidden="true" />}
                label="Telepon"
                value={berandaContent.telepon}
              />
            </div>
          </div>
        </RoundedCard>
      </SectionReveal>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <ContactLink> — one route out of the FAQ
 *
 * A frosted tile on the ink panel. The focus ring is gold with an ink offset
 * because globals.css's default green ring has almost no contrast against
 * this surface.
 * ──────────────────────────────────────────────────────────────────────── */

interface ContactLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ContactLink({ href, icon, label, value }: ContactLinkProps) {
  return (
    <a
      href={href}
      className={clsx(
        "group flex min-h-t-target-lg items-center gap-4 rounded-card border border-white/20",
        "bg-white/[0.07] px-5 py-4 backdrop-blur-md",
        "transition-all duration-350 ease-zaiflu",
        "hover:-translate-y-0.5 hover:border-baznas-gold-display/60 hover:bg-white/[0.14]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-gold-display",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-ink",
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-baznas-gold-display text-baznas-ink"
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">
          {label}
        </span>
        <span className="block text-sm font-bold leading-snug text-white">{value}</span>
      </span>

      <ArrowUpRight
        aria-hidden="true"
        className="ml-auto h-4 w-4 shrink-0 text-baznas-gold-display transition-transform duration-350 ease-zaiflu group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}

export default FaqSection;