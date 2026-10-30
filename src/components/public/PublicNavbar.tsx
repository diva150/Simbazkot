"use client";

/**
 * PublicNavbar — sticky header for the public landing page.
 *
 * WHAT CHANGED IN THE REBUILD
 * ---------------------------
 * 1. The three-item hard-coded link list is gone. Links come from `NAV_LINKS`
 *    in `landing-data.ts`, the same registry the footer link list is derived
 *    from and the same list that declares the page's anchor ids. The old array
 *    had drifted so far that "Tentang BAZNAS" pointed at `tentang` while the
 *    page had grown a kalkulator, a program section, testimonials and an FAQ,
 *    none of which were reachable from the header at all.
 *
 * 2. There is a real scroll-spy. `activeSection` used to be set only by
 *    clicking a link, so the underline was a record of what you clicked rather
 *    than of where you were. It now tracks the section being read.
 *
 * 3. `<ScrollProgressBar />` sits flush with the top of the viewport, so a
 *    visitor can see how much of a very long page is left.
 *
 * ────────────────────────────────────────────────────────────────────────
 * HOW THE SCROLL-SPY WORKS, AND WHY IT IS BUILT THAT WAY
 * ────────────────────────────────────────────────────────────────────────
 *
 * The obvious implementation — "observe every section, whichever one is
 * intersecting is the active one" — is wrong in three ways that show up
 * immediately on a page this shape:
 *
 *   · Two sections are almost always intersecting at once. The hero is
 *     several viewports tall, so for most of the first screen both the hero
 *     and the next section overlap the viewport. "Whichever fired last" then
 *     flickers between the two.
 *   · A section taller than the viewport never leaves the intersection, so it
 *     stays "active" forever and everything below it is unreachable.
 *   · The last section can never win, because something is always below it.
 *
 * So the observer here is given a *reading band* instead of the viewport:
 *
 *   rootMargin: "-72px 0px -60% 0px"
 *
 * which crops the viewport to a thin horizontal strip starting exactly at the
 * bottom edge of this 72px header and ending in the upper third of the screen.
 * "The section you are reading" is then the LAST observed section, in document
 * order, that overlaps that strip.
 *
 * Every edge case falls out of that one rule:
 *
 *   · A section taller than the viewport stops being active the moment the
 *     NEXT section's top edge crosses the band — not when it scrolls out of
 *     the viewport — so it can never get stuck.
 *   · Scrolling back up is the same test run backwards: the newer section
 *     leaves the band, the older one is still in it, the last-in-document
 *     pick returns to it. No hysteresis needed.
 *   · The last section becomes active as soon as its top crosses the band and
 *     simply stays there for the remainder of the page.
 *   · At rest on the hero, the hero's top is above the band and its bottom is
 *     far below it, so the hero is in the band and reports as active.
 *
 * A section that is shorter than the band is the one case the rule does not
 * resolve on its own — the strip can briefly contain nothing at all. That is
 * handled by simply not changing the answer while the set is empty, which
 * produces the sticky behaviour every documentation navbar has: the underline
 * holds the last section until the next one genuinely arrives.
 *
 * NAV LINKS ARE A SUBSET OF SECTIONS
 * ----------------------------------
 * `NAV_LINKS` does not cover every section (there is no header link to the
 * calculator or the testimonials, and there should not be — five links is
 * already the limit). So the spy's raw answer is mapped to the nearest header
 * link at or before it. Reading the calculator keeps "Beranda" lit; reading
 * testimonials keeps "Struktur" lit. Without that mapping the underline would
 * blink off for every section the header does not link to.
 *
 * WHY THE OBSERVER DOES NOT REPORT UPWARD
 * ----------------------------------------
 * `onNavigateSection` is the page's scroll command — the orchestrator's version
 * calls `scrollIntoView`. Feeding it scroll-spy output would turn every scroll
 * event into a scroll command and fight the reader. The spy therefore owns the
 * highlight locally and the prop stays what it has always been: a click-driven
 * signal, adopted immediately so a click feels instant and then handed to the
 * observer as the smooth scroll lands.
 *
 * THE CLICK LOCK
 * --------------
 * Smooth-scrolling from the footer to the top passes over every section, so an
 * unguarded observer would sweep the underline backwards through the whole
 * page while the reader had clearly asked for one destination. A click
 * therefore holds the spy until scrolling stops: every scroll event pushes a
 * short settle timer out, and the timer both releases the lock and re-syncs.
 * Releasing on a timer rather than on a fixed delay means a slow scroll never
 * has its highlight yanked away mid-movement, and a fast one does not leave a
 * stale highlight behind.
 *
 * `scrollend` would express this directly, but it is not in every browser this
 * app supports, so the settle timer it stands in for is the portable version.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Lock, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { BAZNASMark } from "@/components/brand/BAZNASMark";
import { EASE_SOFT, Pressable } from "@/components/motion";
import { ScrollProgressBar } from "@/components/public/landing/LandingPrimitives";
import { NAV_LINKS, SECTION_IDS, type SectionId } from "@/components/public/landing/landing-data";

interface PublicNavbarProps {
  onOpenLogin: () => void;
  /** Click-driven signal from the orchestrator. Drives the scroll command. */
  activeSection: string;
  /** Scrolls the page to a section id. */
  onNavigateSection: (secId: string) => void;
}

/**
 * Height of the nav row (see `h-[76px]` below).
 *
 * The scroll-spy's reading band has to start exactly where the header stops
 * covering the content, otherwise the section you are looking at is not the
 * one that lights up. Keeping it as a named constant next to the observer
 * means a future `h-16` change is a one-line edit, not a silent a11y bug.
 */
const NAV_ROW_HEIGHT_PX = 76;

/**
 * Where the reading band ends, as a fraction of the viewport.
 *
 * 60% from the bottom leaves the band across the upper third — low enough that
 * a short section still catches it on the way past, high enough that two
 * short sections never both sit inside it.
 */
const READING_BAND_BOTTOM = "-60%";

/** Quiet period after the last scroll event that counts as "stopped". */
const SCROLL_SETTLE_MS = 140;

/**
 * The previous orchestrator called the top of the page `"beranda"`; the anchor
 * registry calls it `"hero"`. Both names mean the same place, so the header
 * accepts either rather than depending on which side a given caller happens to
 * be using. See the ⚠ note above `NAV_LINKS` in landing-data.ts.
 */
function normalizeSectionId(id: string): string {
  return id === "beranda" ? "hero" : id;
}

/**
 * Map the section currently being read to the header link that should light
 * up: the last `NAV_LINKS` entry at or before it in document order.
 *
 * Both lists are declared in `SECTION_IDS` order, so index comparison is the
 * whole algorithm — no separate rank bookkeeping that could fall out of sync
 * with the registry.
 */
function resolveNavTarget(currentId: string): string {
  const currentIndex = SECTION_IDS.indexOf(currentId as SectionId);
  if (currentIndex < 0) return NAV_LINKS[0].id;

  let target: string = NAV_LINKS[0].id;
  for (const link of NAV_LINKS) {
    if (SECTION_IDS.indexOf(link.id) <= currentIndex) target = link.id;
  }
  return target;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenLogin,
  activeSection,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  /**
   * The section currently being read, as the spy sees it.
   *
   * Seeded from the prop so the very first paint is never blank, and adopted
   * from it again whenever the orchestrator reports a click — see the effect
   * below. From then on the IntersectionObserver owns it.
   */
  const [activeId, setActiveId] = useState<string>(() =>
    normalizeSectionId(activeSection),
  );

  /**
   * Ids currently overlapping the reading band.
   *
   * A ref, not state: the observer can fire several times between two paints
   * while scrolling, and this value is never rendered directly — it is read by
   * `syncActive` to decide what to put in `activeId`. Re-rendering the header
   * for an intermediate value that is immediately overwritten would be pure
   * waste.
   */
  const visibleRef = useRef<Set<string>>(new Set());

  /** Set while a click-driven smooth scroll is in flight. See the header. */
  const lockRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * Decide the active header link from the current band contents.
   *
   * "Last in document order" is the whole trick: it is what lets a tall
   * section hand over to its successor exactly at the successor's top edge.
   * An empty band means the reader is between sections — hold the previous
   * answer rather than clearing the underline.
   */
  const syncActive = useCallback(() => {
    if (lockRef.current) return;

    let current: string | null = null;
    for (const id of SECTION_IDS) {
      if (visibleRef.current.has(id)) current = id;
    }
    if (!current) return;

    const next = resolveNavTarget(current);
    setActiveId((prev) => (prev === next ? prev : next));
  }, []);

  // The settle timer outlives the render that created it, so it reaches
  // `syncActive` through a ref rather than closing over it directly. The
  // observer calls `syncActive` itself — it is stable, so no re-subscribe.
  const syncActiveRef = useRef<(() => void) | undefined>(syncActive);
  useEffect(() => {
    syncActiveRef.current = syncActive;
  }, [syncActive]);

  /** Release the click lock once scrolling stops, then re-sync immediately. */
  const releaseWhenSettled = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      lockRef.current = false;
      // Re-run the decision even if no observer callback arrived after the
      // lock was released — the crossings we ignored happened while it was on.
      syncActiveRef.current?.();
    }, SCROLL_SETTLE_MS);
  }, []);

  /** Hold the spy still until scrolling stops. */
  const holdForClick = useCallback(() => {
    lockRef.current = true;
    releaseWhenSettled();
  }, [releaseWhenSettled]);

  // ── Scroll-spy ─────────────────────────────────────────────────────────
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    // Every id is registered, but a registered id with no element would make
    // `observe` throw. Skipping silently keeps the spy working on a partially
    // rendered page instead of taking the whole header down with it.
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleRef.current.add(entry.target.id);
          else visibleRef.current.delete(entry.target.id);
        }
        syncActive();
      },
      {
        // The reading band: starts under the header, ends in the upper third.
        rootMargin: `-${NAV_ROW_HEIGHT_PX}px 0px ${READING_BAND_BOTTOM} 0px`,
        // Any overlap counts. A threshold would make a tall section "visible"
        // on a fraction of its area, which is not what "being read" means.
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // `syncActive` is `useCallback(…, [])` — it reads refs only, so it is
    // stable for the life of the component and the observer is set up once.
  }, [syncActive]);

  // ── Adopt the orchestrator's active-section signal ─────────────────────
  useEffect(() => {
    setActiveId(normalizeSectionId(activeSection));
  }, [activeSection]);

  // ── Hairline + click-lock settle timer ─────────────────────────────────
  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      // The hairline only cares about crossing 4px, so it stays cheap.
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          setScrolled(window.scrollY > 4);
        });
      }
      // The lock is not tied to frames — it is a settle timer.
      if (lockRef.current) releaseWhenSettled();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [releaseWhenSettled]);

  const handleNav = (id: string) => {
    // Light the target immediately — the smooth scroll can take most of a
    // second, and a nav that waits for the observer feels broken on click.
    setActiveId(normalizeSectionId(id));
    holdForClick();
    onNavigateSection(normalizeSectionId(id));
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-baznas-ink-8 bg-baznas-paper/90 backdrop-blur-xl transition-shadow duration-350 ease-zaiflu ${
        scrolled ? "shadow-rest" : ""
      }`}
    >
      {/*
        Reading-progress bar. First child so it paints above the nav row: the
        primitive is `fixed … z-50 pointer-events-none`, this header is `z-40`,
        and inside a stacking context the child paints above the siblings that
        follow it. `pointer-events-none` means it cannot swallow a click meant
        for the logo sitting under it.

        Subtlety worth knowing before editing either file: this header carries
        `backdrop-blur-md`, and `backdrop-filter` creates a containing block for
        `position: fixed` descendants. The bar's `top-0 inset-x-0` therefore
        resolves against the HEADER, not the viewport — which lands in exactly
        the same place, because the header is `sticky top-0` and so its top edge
        is the top of the viewport at every scroll position. If the header ever
        stops being `top-0`, this stops being flush with the viewport.
      */}
      <ScrollProgressBar />

      {/* Hairline animasi di bawah header — slide-down + fade saat scroll. */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="public-navbar-hairline"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, y: -1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_SOFT }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-baznas-ink-8"
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo — Pressable memberi feedback tap; hover scale. */}
        <Pressable>
          <button
            onClick={() => handleNav("hero")}
            className="flex items-center rounded-md transition-transform duration-350 ease-zaiflu hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            aria-label="BAZNAS — Beranda"
          >
            <span className="flex items-center gap-3">
              <BAZNASMark variant="mark" size="md" className="text-baznas-green-800" />
              <span className="hidden border-l border-baznas-ink-20 pl-3 text-left sm:block">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-baznas-ink">BAZNAS</span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-baznas-ink/65">Kota Gorontalo</span>
              </span>
            </span>
          </button>
        </Pressable>

        {/* Desktop Navigation Links — underline morph pakai motion layoutId. */}
        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                // `true`, not `"page"` — these are anchors into the page the
                // reader is already on, not links to another document.
                aria-current={isActive ? true : undefined}
                className={`relative rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-350 ease-zaiflu focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 ${
                  isActive
                    ? "text-baznas-green-900"
                    : "text-baznas-ink/85 hover:text-baznas-ink"
                }`}
              >
                {item.label}
                {/* Underline morph: layoutId satu id dipakai di semua item,
                    sehingga perpindahan item meluncur alih-alih fade-in/out. */}
                {isActive &&
                  (reduceMotion ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-baznas-gold-display"
                    />
                  ) : (
                    <motion.span
                      layoutId="public-navbar-underline"
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-baznas-gold-display"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ))}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Login Petugas + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Pressable>
            <button
              onClick={onOpenLogin}
              className="inline-flex min-h-t-target items-center gap-2 rounded-card border border-baznas-green-800 bg-baznas-green-800 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-[background-color,box-shadow,transform] duration-350 ease-zaiflu hover:-translate-y-0.5 hover:bg-baznas-green-900 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
              aria-label="Login Petugas Bidang"
            >
              <Lock className="h-3.5 w-3.5 text-baznas-gold-display" aria-hidden="true" />
              <span className="hidden sm:inline">Login Petugas</span>
              <span className="sm:hidden">Login</span>
            </button>
          </Pressable>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-t-target w-t-target items-center justify-center rounded-md text-baznas-ink/85 transition-colors duration-350 ease-zaiflu hover:bg-baznas-paper md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown — AnimatePresence slide-down + fade. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="public-navbar-mobile"
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE_SOFT }}
            className="border-t border-baznas-ink-8 bg-white px-4 py-2 md:hidden"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  aria-current={isActive ? true : undefined}
                  className={`block w-full rounded-md px-3 py-3 text-left text-sm font-semibold transition-colors duration-350 ease-zaiflu ${
                    isActive
                      ? "border-l-2 border-baznas-gold-display bg-baznas-paper/60 pl-3 text-baznas-green-900"
                      : "text-baznas-ink/85 hover:bg-baznas-paper"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;
