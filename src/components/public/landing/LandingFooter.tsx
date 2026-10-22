"use client";

/**
 * LandingFooter — deep-green close of the public page.
 *
 * WHY IT IS NOT `Section`
 * ----------------------
 * `Section` renders a `<section>` with the page's vertical rhythm. The footer
 * is a `<footer>` landmark with its own surface and its own gutter, and giving
 * it the standard `py-20 lg:py-28` would leave a hole of dead space under the
 * last column. It therefore composes the primitives directly instead of
 * wrapping itself in `Section`, but still uses the same `max-w-7xl` gutter so
 * its left edge lines up with every section above it.
 *
 * DESIGN CHANGES FROM THE OLD FOOTER
 * ----------------------------------
 *   · `rounded-t-panel` — the Zaiflu radius language now carries into the
 *     footer, so the deep surface reads as a card that the page sits on rather
 *     than a band glued to the bottom of the viewport.
 *   · The link list is generated from `NAV_LINKS` in landing-data instead of
 *     a hand-typed array, so the navbar and the footer can never disagree about
 *     what sections exist or what they are called.
 *   · Links are real `<a href="#id">` elements with a click handler, keeping
 *     middle-click, cmd-click and "copy link address" working — the old
 *     handler called `preventDefault()` unconditionally, which silently broke
 *     all three.
 *   · Every column heading and every line of body copy is `text-white/85` or
 *     `/90`, never `/70`: on `#082414` the 70% step drops below the 4.5:1
 *     contrast floor for 14px text.
 *   · Account numbers sit on frosted `rounded-card` tiles instead of running
 *     together as unseparated label/value pairs, which is what made the old
 *     "Rekening Resmi" column the hardest thing on the page to scan.
 *
 * DATA
 * ----
 * All three bank accounts, the address, the phone number and the email come
 * from the `BerandaContent` prop so an admin can correct them from the app
 * without a deploy. The social handles remain `href="#"` placeholders exactly as
 * they were — inventing real URLs for a government body's accounts would be
 * worse than leaving the placeholder visible to whoever wires this up.
 */

import React from "react";
import clsx from "clsx";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import { BerandaContent } from "@/lib/types";
import { initialBerandaContent } from "@/lib/mock-data";
import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { Stagger, StaggerItem } from "@/components/motion";
import { GoldRule, RoundedCard } from "@/components/public/landing/LandingPrimitives";
import { NAV_LINKS, SECTION_IDS, type NavLink } from "@/components/public/landing/landing-data";

/* ────────────────────────────────────────────────────────────────────────
 * STATIC DATA
 * ──────────────────────────────────────────────────────────────────────── */

const SOCIAL_LINKS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
  { Icon: Youtube, label: "YouTube" },
  { Icon: Send, label: "Telegram" },
];

const APP_VERSION = "Simbazkot v2.0";

/**
 * Build a dialable `tel:` target from the CMS phone string.
 *
 * `berandaContent.telepon` is a *display* value — "(0435) 826789 /
 * 0812-4567-8901" — so passing it straight through (as the previous footer did)
 * puts spaces, parentheses and a slash into the URI, and most clients dial
 * nothing. The first listed number is extracted, its leading trunk `0` is
 * dropped, and it is re-prefixed with the country code, which is the only form
 * that reliably works on mobile. The full string stays the visible label.
 */
function toTelHref(display: string): string {
  const firstNumber = (display.split("/")[0] ?? "").trim();
  const digits = firstNumber.replace(/\D/g, "");
  return `tel:+62${digits.replace(/^0+/, "")}`;
}

/* ────────────────────────────────────────────────────────────────────────
 * FOOTER LINK LIST
 *
 * WHY IT IS DERIVED RATHER THAN HAND-TYPED
 * ----------------------------------------
 * The old footer hard-coded four anchors ("Beranda", "Tentang BAZNAS",
 * "Struktur", "Kalkulator") with nothing enforcing that those ids still
 * existed. Iterating `SECTION_IDS` means a section can never go missing from
 * the footer without also being registered, and every entry keeps a real
 * `href` so the link is copyable and openable in a new tab.
 *
 * Labels come from `NAV_LINKS` where the navbar already has one, so the two
 * lists can never disagree about what a section is called. The override map
 * below covers the ids the navbar does not link to (so the old footer's
 * "Kalkulator" entry survives) plus "tentang", which the footer has always
 * spelled out in full.
 * ──────────────────────────────────────────────────────────────────────── */

const NAV_LABEL_BY_ID = new Map(NAV_LINKS.map((link) => [link.id as string, link.label]));

const FOOTER_LABEL_OVERRIDES: Record<string, string> = {
  tentang: "Tentang BAZNAS",
  kalkulator: "Kalkulator Zakat",
  "cara-berzakat": "Cara Berzakat",
  testimoni: "Testimoni Muzakki",
};

const FOOTER_LINKS: NavLink[] = SECTION_IDS.map((id) => ({
  id,
  label: FOOTER_LABEL_OVERRIDES[id] ?? NAV_LABEL_BY_ID.get(id) ?? id,
}));

/* ────────────────────────────────────────────────────────────────────────
 * <FooterColumn> — one labelled column
 *
 * A `<nav>` is used for the link column because the links navigate the page's
 * own sections; the other three are plain groupings. `aria-label` is only set
 * on the `<nav>`: on a role-less `<div>` it is not exposed by assistive tech
 * at all, and the `<h2>` already labels that column for everyone else.
 * ──────────────────────────────────────────────────────────────────────── */

interface FooterColumnProps {
  heading: string;
  as?: "nav" | "div";
  className?: string;
  children: React.ReactNode;
}

function FooterColumn({ heading, as: Tag = "div", className, children }: FooterColumnProps) {
  return (
    <Tag {...(Tag === "nav" ? { "aria-label": heading } : {})} className={className}>
      <GoldRule className="mb-4" />
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-baznas-gold-display">
        {heading}
      </h2>
      {children}
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <LandingFooter>
 * ──────────────────────────────────────────────────────────────────────── */

export interface LandingFooterProps {
  /** Live landing content — accounts, address, phone, email. */
  berandaContent?: BerandaContent;
  className?: string;
}

export function LandingFooter({
  berandaContent = initialBerandaContent,
  className,
}: LandingFooterProps) {
  /**
   * Intercept a plain left-click so the jump is smooth AND focus follows.
   *
   * The old footer called `preventDefault()` unconditionally, which silently
   * killed cmd-click, ctrl-click and middle-click. Here the handler bails out
   * on any modifier so those keep working; only the plain click is taken over.
   * Focus is then moved to the target (which needs `tabindex="-1"` because a
   * `<section>` is not focusable) so a keyboard or screen-reader user does not
   * stay anchored at the bottom of the page with the viewport somewhere else.
   *
   * `scroll-margin-top` is already set globally on `section[id]`, so
   * `scrollIntoView` clears the sticky navbar without any offset arithmetic.
   */
  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    // Same-document anchors: take over so the sticky navbar offset applies.
    // Anything else (modifier-click, middle-click) is left to the browser.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    // Move focus so keyboard and screen-reader users land where they clicked.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  const accounts = [
    { bank: "Bank Sulutgo", number: berandaContent.bankSulutgo },
    { bank: "Bank Muamalat", number: berandaContent.bankMuamalat },
    { bank: "Bank BTN Syariah", number: berandaContent.bankBtn },
  ];

  return (
    <footer
      className={clsx(
        "relative overflow-hidden rounded-t-panel bg-baznas-green-950 text-white",
        className,
      )}
    >
      {/* Mesh wash — the deep green needs the same depth cue the hero has, or
          it reads as a flat block once the CTA panel's edge stops it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-45" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <Stagger immediate={false} stagger={0.07} className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* ── Brand + social ── */}
          <StaggerItem className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3">
              {/* Negative artwork: this footer is green-950, and the default
                  file's dark-green wordmark and near-black subtitle would
                  drop to ~2:1 against it. */}
              <BAZNASMark
                variant="mark"
                size="md"
                src="/baznas-logo-negative.png"
                className="text-white"
              />
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/85">
              Badan Amil Zakat Nasional — lembaga resmi pemerintah pengelola
              zakat, infak, sedekah, dan DSKL di Indonesia.
            </p>

            <nav aria-label="Media sosial" className="mt-6">
              <ul className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ Icon, label }) => (
                  <li key={label}>
                    <a
                      href="#"
                      aria-label={label}
                      className="inline-flex h-t-target w-t-target items-center justify-center rounded-card border border-white/20 text-white/90 transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:border-baznas-gold-display hover:text-baznas-gold-display hover:shadow-glow"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </StaggerItem>

          {/* ── Tautan Cepat ── */}
          <StaggerItem className="lg:col-span-2">
            <FooterColumn heading="Tautan Cepat" as="nav">
              <ul className="space-y-1">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(event) => handleAnchorClick(event, link.id)}
                      className="inline-flex min-h-t-target items-center rounded-md text-sm text-white/85 transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </StaggerItem>

          {/* ── Rekening Resmi ── */}
          <StaggerItem className="lg:col-span-3">
            <FooterColumn heading="Rekening Resmi">
              <ul className="space-y-3">
                {accounts.map((account) => (
                  <li key={account.bank}>
                    {/* WHY THE OVERRIDES. `RoundedCard tone="ink"` supplies the
                        correct radius and spacing already; only the *skin* is
                        wrong for this surface — a solid ink tile on the ink
                        footer would be invisible. `bg-baznas-ink` and
                        `bg-white/[0.06]` are same-property utilities, so the
                        later-in-stylesheet one wins regardless of attribute
                        order; the `!` pins it rather than relying on that. */}
                    <RoundedCard
                      tone="ink"
                      className="!border-white/[0.12] !bg-white/[0.06] p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-baznas-gold-display">
                        {account.bank}
                      </p>
                      <p className="mt-1 font-mono text-sm tracking-wide text-white">
                        {account.number}
                      </p>
                    </RoundedCard>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </StaggerItem>

          {/* ── Kontak & Alamat ── */}
          <StaggerItem className="lg:col-span-3">
            <FooterColumn heading="Kontak & Alamat">
              <ul className="space-y-4 text-sm text-white/85">
                <li className="flex items-start gap-2.5">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-baznas-gold-display"
                  />
                  <span className="leading-relaxed">{berandaContent.alamat}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-baznas-gold-display"
                  />
                  <a
                    href={toTelHref(berandaContent.telepon)}
                    className="inline-flex min-h-t-target items-center rounded-md transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
                  >
                    {berandaContent.telepon}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-baznas-gold-display"
                  />
                  <a
                    href={`mailto:${berandaContent.email}`}
                    className="inline-flex min-h-t-target items-center rounded-md break-all transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
                  >
                    {berandaContent.email}
                  </a>
                </li>
              </ul>
            </FooterColumn>
          </StaggerItem>
        </Stagger>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.12] py-8 text-xs text-white/85 sm:flex-row lg:mt-14">
          <p>© 2026 Badan Amil Zakat Nasional. Seluruh hak cipta dilindungi.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a
              href="#"
              className="inline-flex min-h-t-target items-center rounded-md transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
            >
              Privasi
            </a>
            <a
              href="#"
              className="inline-flex min-h-t-target items-center rounded-md transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
            >
              Syarat &amp; Ketentuan
            </a>
            <span aria-hidden="true" className="text-white/85">
              ·
            </span>
            <span className="font-mono">{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;