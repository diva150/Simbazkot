"use client";

/**
 * ModuleDashboardShell — shared visual frame for a bidang's dashboard tab.
 *
 * WHY
 * ---
 * Before the overhaul each bidang dashboard rolled its own stat tiles: sharp
 * 1px cards, flat `bg-ink` jumbo panels, no motion. Zaiflu's signature move —
 * a large deep-green panel with an oversized ghost numeral, mesh depth, and a
 * count-up value — was repeated ad-hoc in BerandaView and nowhere else.
 *
 * This component makes that one pattern reusable so all six operational
 * dashboards (Bidang I–IV, Ketua, Admin) read as one system.
 *
 * USAGE
 * -----
 *   <ModuleDashboardShell
 *     eyebrow="Bidang II — Pendistribusian"
 *     title="Ringkasan Penyaluran"
 *     description="..."
 *   >
 *     <ModuleStatGrid>…</ModuleStatGrid>
 *   </ModuleDashboardShell>
 */

import React from "react";
import { FadeUp, Stagger, StaggerItem, GhostNumber } from "@/components/motion";

/* ────────────────────────────────────────────────────────────────────────
 * ModuleDashboardShell — hero header + staggered content
 * ──────────────────────────────────────────────────────────────────────── */

interface ModuleDashboardShellProps {
  /** Small uppercase label above the title, e.g. "Bidang II — PendDistribusian". */
  eyebrow: string;
  /** Main heading. */
  title: string;
  /** One supporting sentence under the title. */
  description?: string;
  /** Decorative numeral rendered as a ghost behind the header. */
  ghost?: string;
  children: React.ReactNode;
  className?: string;
}

export function ModuleDashboardShell({
  eyebrow,
  title,
  description,
  ghost,
  children,
  className = "",
}: ModuleDashboardShellProps) {
  return (
    <Stagger className={`space-y-8 ${className}`} stagger={0.08} delayChildren={0.04}>
      {/* ── Header band: ghost numeral + gold rule + title ── */}
      <StaggerItem>
        <header className="relative overflow-hidden bg-baznas-paper border-l-4 border-baznas-gold-display rounded-card">
          {ghost && (
            <GhostNumber className="-right-3 -top-8 text-[96px]">
              {ghost}
            </GhostNumber>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-mesh-light opacity-70 pointer-events-none"
          />
          <div className="relative px-7 py-7 sm:px-9 sm:py-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-baznas-gold-display font-extrabold mb-2.5">
              {eyebrow}
            </p>
            <h1 className="display-3 text-baznas-ink">{title}</h1>
            {description && (
              <p className="mt-3 text-sm sm:text-base text-baznas-ink/85 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </header>
      </StaggerItem>

      {/* ── Staggered body ── */}
      <StaggerItem>{children}</StaggerItem>
    </Stagger>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * StatTile — the medium stat card used across all dashboards
 * ──────────────────────────────────────────────────────────────────────── */

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** Unit / qualifier shown next to the number ("jiwa", "KK", "%"). */
  unit?: string;
  /** Supporting line under the value. */
  hint?: React.ReactNode;
  /** Decorative numeral in the corner. */
  ghost?: string;
  /** `lime` is reserved for progress-bearing tiles per the palette rules. */
  tone?: "default" | "accent" | "positive" | "negative";
  className?: string;
}

export function StatTile({
  label,
  value,
  unit,
  hint,
  ghost,
  tone = "default",
  className = "",
}: StatTileProps) {
  const surface =
    tone === "accent" ? "bg-baznas-paper" : "bg-white";

  const valueColor =
    tone === "positive"
      ? "text-baznas-green-900"
      : tone === "negative"
      ? "text-baznas-error-700"
      : "text-baznas-ink";

  return (
    <FadeUp
      className={`relative overflow-hidden border border-baznas-ink-8 ${surface} p-6 rounded-card transition-all duration-350 ease-zaiflu hover:-translate-y-0.5 hover:shadow-lift h-full ${className}`}
    >
      {ghost && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -top-3 font-display font-extrabold leading-none tracking-tighter text-baznas-ink/[0.05] text-[56px] select-none"
        >
          {ghost}
        </span>
      )}

      <p className="relative text-[10px] uppercase tracking-[0.22em] text-baznas-ink/55 font-bold">
        {label}
      </p>

      <p className={`relative display-3 editorial-num mt-1.5 ${valueColor}`}>
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-baznas-ink/55">{unit}</span>
        )}
      </p>

      {hint && (
        <p className="relative mt-1.5 text-[11px] text-baznas-ink/65">{hint}</p>
      )}
    </FadeUp>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * HeroPanel — the deep panel that anchors a dashboard
 * ──────────────────────────────────────────────────────────────────────── */

interface HeroPanelProps {
  eyebrow: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  ghost?: string;
  /** Decorative lucide icon rendered large in the corner. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function HeroPanel({
  eyebrow,
  value,
  caption,
  ghost,
  icon,
  children,
  className = "",
}: HeroPanelProps) {
  return (
    <div
      className={`relative overflow-hidden bg-mesh-dark text-white p-7 lg:p-10 rounded-panel border border-baznas-petrol-900 ${className}`}
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden="true" />

      {/* Ghost numeral */}
      {ghost && (
        <GhostNumber className="-right-3 -top-10 text-[112px] text-white/[0.07]">
          {ghost}
        </GhostNumber>
      )}

      {/* Decorative icon */}
      {icon && (
        <div
          aria-hidden="true"
          className="absolute -right-6 -bottom-6 text-baznas-gold-display opacity-10"
        >
          {icon}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden="true" className="h-px w-10 bg-baznas-gold-display" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-baznas-gold-display font-extrabold">
            {eyebrow}
          </span>
        </div>

        <p className="display-1 editorial-num text-white leading-[0.95] tracking-tight">
          {value}
        </p>

        {caption && (
          <p className="mt-4 text-sm text-white/85 max-w-md leading-relaxed">
            {caption}
          </p>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * ProgressMeter — horizontal progress bar
 *
 * The ONLY sanctioned use of the lime accent: a progress/chart element.
 * ──────────────────────────────────────────────────────────────────────── */

interface ProgressMeterProps {
  label: string;
  /** 0–100. Values outside are clamped. */
  value: number;
  /** Optional secondary figure shown right-aligned. */
  valueLabel?: string;
  /** Accessible name; defaults to label. */
  ariaLabel?: string;
  className?: string;
}

export function ProgressMeter({
  label,
  value,
  valueLabel,
  ariaLabel,
  className = "",
}: ProgressMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between text-[11px] mb-2">
        <span className="text-white/85 uppercase tracking-wider font-bold">
          {label}
        </span>
        <span className="text-white font-bold tabular-nums">
          {valueLabel ?? `${clamped.toFixed(1)}%`}
        </span>
      </div>
      <div
        className="h-1.5 bg-white/15 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? label}
      >
        <div
          className="h-full bg-baznas-lime-500 transition-all duration-700 ease-zaiflu rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}