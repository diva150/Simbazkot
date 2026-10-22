"use client";

/**
 * CaraBerzakatSection — "Tiga Langkah Menunaikan Zakat."
 *
 * WHY THIS SECTION EXISTS
 * -----------------------
 * The previous landing page asked a visitor to trust BAZNAS with their money
 * and then never told them how to hand it over. The only answer to "how do I
 * actually pay?" was buried in FAQ #2 and, behind that, three account numbers
 * in the footer — a place nobody scrolls to before deciding. That gap is the
 * single largest conversion leak on the page, and this section closes it by
 * promoting the answer to a first-class section: compute → transfer → receipt.
 *
 * WHAT MAKES IT ACTIONABLE RATHER THAN DECORATIVE
 * ----------------------------------------------
 * The third data point in `CARA_BERZAKAT_STEPS` is the conversion payload, so
 * that card carries the three official account numbers inline — monospace,
 * tabular figures, one row per bank — lifted live from the admin-editable
 * `BerandaContent` record rather than hard-coded. An admin who corrects a
 * number in the CMS corrects it here and in the footer at the same time.
 *
 * The step numeral is rendered with `GhostNumber`, not `PillarBadge`. The badge
 * would have printed "Pilar 01", which is a category error — these are steps in
 * one journey, not one of the four program pillars.
 *
 * A closing strip repeats the institution's physical address and opens the
 * petugas portal for anyone who would rather hand over money in person.
 */

import clsx from "clsx";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import type { BerandaContent } from "@/lib/types";
import { GhostNumber, Stagger, StaggerItem } from "@/components/motion";
import {
  Eyebrow,
  GoldRule,
  RoundedCard,
  Section,
  SectionHeading,
  SectionReveal,
} from "@/components/public/landing/LandingPrimitives";
import {
  CARA_BERZAKAT_STEPS,
  type CaraBerzakatStep,
} from "@/components/public/landing/landing-data";

/** The step that hands the visitor their account numbers. */
const TRANSFER_STEP_ID = "transfer-resmi";

/**
 * `StaggerItem` adds an un-sized motion div around each child, so a `h-full`
 * card inside it needs `[&>*]:h-full` to actually reach the bottom of a
 * stretched three-column row.
 */
const FULL_HEIGHT_ITEM = "h-full [&>*]:h-full";

/**
 * The official accounts, read from `BerandaContent` so the CMS stays the single
 * source of truth shared with the footer.
 */
function rekeningResmi(content: BerandaContent) {
  return [
    { bank: "Bank Sulutgo", nomor: content.bankSulutgo },
    { bank: "Bank Muamalat", nomor: content.bankMuamalat },
    { bank: "Bank BTN Syariah", nomor: content.bankBtn },
  ];
}

/* ────────────────────────────────────────────────────────────────────────
 * <RekeningBlock> — the scannable account list
 *
 * `font-mono` + `tabular-nums` because an account number is the one string on
 * this page a reader is going to transcribe by hand — the digits must not shift
 * while they read across it.
 * ──────────────────────────────────────────────────────────────────────── */

function RekeningBlock({ content }: { content: BerandaContent }) {
  return (
    <div className="mt-6 rounded-card border border-baznas-ink-8 bg-baznas-paper p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-baznas-ink/70">
          Rekening Resmi
        </p>
        <span
          aria-hidden="true"
          className="h-px w-8 shrink-0 bg-baznas-gold-display"
        />
      </div>

      <dl className="space-y-3">
        {rekeningResmi(content).map((row) => (
          <div
            key={row.bank}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <dt className="text-[11px] text-baznas-ink/85">{row.bank}</dt>
            <dd className="font-mono text-sm font-bold tabular-nums text-baznas-ink">
              {row.nomor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <StepCard>
 * ──────────────────────────────────────────────────────────────────────── */

interface StepCardProps {
  step: CaraBerzakatStep;
  berandaContent: BerandaContent;
}

function StepCard({ step, berandaContent }: StepCardProps) {
  const Icon = step.icon;
  const showsRekening = step.id === TRANSFER_STEP_ID;

  return (
    <RoundedCard
      as="article"
      tone="white"
      className="relative flex h-full flex-col !rounded-panel overflow-hidden p-7 sm:p-8"
    >
      {/* Oversized step numeral, Zaiflu-style. `GhostNumber`'s own colour token
          is a dead class upstream, so the tint is re-asserted here. */}
      <GhostNumber className="-right-2 -top-6 select-none text-[88px] text-baznas-ink/[0.05]">
        {step.step}
      </GhostNumber>

      <div className="relative flex items-center justify-between gap-4">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-baznas-ink"
        >
          <Icon className="h-5 w-5 text-baznas-gold-display" />
        </span>

        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-baznas-ink/70">
          Langkah {step.step}
        </span>
      </div>

      <h3 className="relative mt-6 text-lg font-poppins font-bold text-baznas-ink">
        {step.title}
      </h3>

      <p className="relative mt-3 text-sm leading-relaxed text-baznas-ink/85">
        {step.desc}
      </p>

      {/* The kuitansi step gets a live mail link — the address in the CMS record
          is the one the copy already tells the reader to use. */}
      {!showsRekening && step.id === "terima-kuitansi" && (
        <a
          href={`mailto:${berandaContent.email}`}
          className={clsx(
            "relative mt-5 inline-flex min-h-t-target items-center gap-2 self-start rounded-card border border-baznas-ink-8 bg-baznas-paper px-4 py-2",
            "text-xs font-bold text-baznas-green-900",
            "transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:border-baznas-green-800 hover:shadow-lift",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2",
          )}
        >
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          {berandaContent.email}
        </a>
      )}

      {showsRekening && <RekeningBlock content={berandaContent} />}

      {step.detail && (
        <p className="relative mt-6 border-t border-baznas-ink-8 pt-4 text-[11px] leading-relaxed text-baznas-ink/70">
          {step.detail}
        </p>
      )}
    </RoundedCard>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <CaraBerzakatSection>
 * ──────────────────────────────────────────────────────────────────────── */

export interface CaraBerzakatSectionProps {
  /** Live landing content — supplies the three official account numbers. */
  berandaContent: BerandaContent;
  /** Opens the petugas login modal from the closing strip. */
  onOpenLogin: () => void;
  className?: string;
}

export function CaraBerzakatSection({
  berandaContent,
  onOpenLogin,
  className,
}: CaraBerzakatSectionProps) {
  return (
    <Section
      id="cara-berzakat"
      tone="paper"
      ariaLabelledBy="cara-berzakat-heading"
      className={className}
    >
      {/* ── Header ── */}
      <SectionReveal className="mb-12 lg:mb-14">
        <SectionHeading
          headingId="cara-berzakat-heading"
          eyebrow="Cara Berzakat"
          title="Tiga Langkah Menunaikan Zakat."
          lede="Dari menghitung sampai kuitansi resmi — hanya beberapa menit, dan seluruhnya dapat dilakukan tanpa sistem yang rumit."
        />
      </SectionReveal>

      {/* ── The three steps ── */}
      <Stagger
        immediate={false}
        stagger={0.1}
        className="grid gap-6 lg:grid-cols-3 lg:gap-7"
      >
        {CARA_BERZAKAT_STEPS.map((step) => (
          <StaggerItem key={step.id} className={FULL_HEIGHT_ITEM}>
            <StepCard step={step} berandaContent={berandaContent} />
          </StaggerItem>
        ))}
      </Stagger>

      {/* ── Closing strip: the in-person route ── */}
      <SectionReveal className="mt-10 lg:mt-12">
        <RoundedCard
          tone="ink"
          className="relative overflow-hidden !rounded-panel !border-white/10 p-7 sm:p-9"
        >
          {/* Panel-local mesh, mirroring `ModuleDashboard.HeroPanel` — the depth
              belongs to the panel, not to the section behind it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-70"
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <Eyebrow tone="light" className="mb-3">
                Pelayanan Bertemu Langsung
              </Eyebrow>

              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                Ingin menyerahkan zakat langsung?
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Datang ke loket Kantor BAZNAS Kota Gorontalo dengan membawa KTP
                atau NIK. Petugas kami membantu pencatatan dan menerbitkan
                kuitansi pada hari yang sama.
              </p>

              <dl className="mt-5 space-y-2 text-sm text-white/85">
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Alamat</dt>
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-baznas-gold-display"
                    aria-hidden="true"
                  />
                  <dd className="flex-1">{berandaContent.alamat}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Telepon</dt>
                  <Phone
                    className="h-4 w-4 shrink-0 text-baznas-gold-display"
                    aria-hidden="true"
                  />
                  <dd className="flex-1">
                    <a
                      href={`tel:${berandaContent.telepon.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex min-h-t-target items-center rounded-md transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
                    >
                      {berandaContent.telepon}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Surel</dt>
                  <Mail
                    className="h-4 w-4 shrink-0 text-baznas-gold-display"
                    aria-hidden="true"
                  />
                  <dd className="flex-1">
                    <a
                      href={`mailto:${berandaContent.email}`}
                      className="inline-flex min-h-t-target items-center rounded-md transition-colors duration-350 ease-zaiflu hover:text-baznas-gold-display"
                    >
                      {berandaContent.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
              <button
                type="button"
                onClick={onOpenLogin}
                className={clsx(
                  "inline-flex min-h-t-target-xl items-center gap-2 rounded-card bg-baznas-gold-display px-7 py-3 text-sm font-bold text-baznas-ink",
                  "transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:shadow-glow",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-baznas-petrol-900",
                )}
              >
                <span>Bayar via Petugas</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <GoldRule className="hidden lg:block" />
            </div>
          </div>
        </RoundedCard>
      </SectionReveal>
    </Section>
  );
}

export default CaraBerzakatSection;