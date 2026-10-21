"use client";

/**
 * Motion primitives — Zaiflu-inspired motion vocabulary for BAZNAS Modern.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Zaiflu's animation language (verified from its compiled Webflow CSS) is:
 *   • `transition: all .35s`  → one uniform timing across the whole surface
 *   • `translate(0, -3px)`    → subtle 3px lift on hover (never more)
 *   • `backdrop-filter: blur(24px)` → frosted glass layers
 *   • `transform: rotate(360deg)` → slow continuous spinners
 *
 * We reproduce that feel with `motion` (the modern framer-motion package),
 * but gate EVERY animation behind `prefers-reduced-motion` so the app stays
 * accessible. Framer Motion's `useReducedMotion()` reads the OS-level
 * preference, which is the correct signal here.
 *
 * IMPORT GUIDANCE
 * ---------------
 *   import { FadeUp, Stagger, StaggerItem, GlassCard } from "@/components/motion";
 *
 * All of these are client components. They render plain DOM nodes with a
 * motion transform, so they compose inside server components without issue
 * as long as the consumer is already a client component (all views are).
 */

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";

/* ────────────────────────────────────────────────────────────────────────
 * SHARED VARIANTS
 * Timing derived from Zaiflu's uniform `all .35s` transitions, softened
 * slightly for spring-based interpolation.
 * ──────────────────────────────────────────────────────────────────────── */

export const EASE_SOFT: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** Single element entering upward — Zaiflu's dominant entrance direction. */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_SOFT, delay },
  }),
};

/** Container that staggers its children on reveal. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Child of a stagger container. */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_SOFT },
  },
};

/** Scale-in for badges / pills / chips (Zaiflu preloader + badge pop). */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_SOFT, delay },
  }),
};

/* ────────────────────────────────────────────────────────────────────────
 * <FadeUp> — single element that reveals on scroll into view
 * ──────────────────────────────────────────────────────────────────────── */

interface FadeUpProps {
  children: React.ReactNode;
  /** Seconds to wait before animating. Use for manual sequencing. */
  delay?: number;
  className?: string;
  /** Distance in px to travel. Zaiflu uses ~20px. */
  distance?: number;
  /** Skip the viewport observer and animate immediately on mount. */
  immediate?: boolean;
}

export function FadeUp({
  children,
  delay = 0,
  className,
  distance = 20,
  immediate = false,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const show = immediate || inView;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={
        show
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: distance }
      }
      transition={{ duration: 0.5, ease: EASE_SOFT, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <Stagger> + <StaggerItem> — grid/list cascade reveal
 * ──────────────────────────────────────────────────────────────────────── */

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child. Zaiflu-feel is 0.06–0.09. */
  stagger?: number;
  /** Seconds before the cascade starts. */
  delayChildren?: number;
  /** Skip the viewport observer and animate immediately on mount. */
  immediate?: boolean;
}

export function Stagger({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0.05,
  immediate = true,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const show = immediate || inView;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({
  children,
  className,
}: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <motion.div variants={staggerItemVariants}>{children}</motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <Lift> — Zaiflu's signature -3px hover lift, as a wrapper
 * Use when you want the lift on a whole region rather than a single button.
 * ──────────────────────────────────────────────────────────────────────── */

export function Lift({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: EASE_SOFT }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <AnimatedNumber> — count-up statistic
 *
 * Zaiflu foregrounds oversized numerals (122px) as visual anchors. This
 * gives the same emphasis with a count-up so the number *lands* rather than
 * simply appearing. Respects reduced-motion by jumping straight to the value.
 * ──────────────────────────────────────────────────────────────────────── */

interface AnimatedNumberProps {
  /** Final value. Decimals are preserved. */
  value: number;
  /** Render as currency when provided. */
  format?: (n: number) => string;
  /** Seconds. Default 1.2s — long enough to read, short enough to feel instant. */
  duration?: number;
  className?: string;
  /** Skip the viewport trigger (used when the parent already revealed). */
  immediate?: boolean;
}

export function AnimatedNumber({
  value,
  format,
  duration = 1.2,
  className,
  immediate = false,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const shouldRun = immediate || inView;

  useEffect(() => {
    if (!shouldRun) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo — fast start, long settle. Matches Zaiflu's confident feel.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldRun, value, duration, reduceMotion]);

  const text = format ? format(display) : Math.round(display).toLocaleString("id-ID");

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <GlassCard> — Zaiflu frosted-glass surface
 *
 * Zaiflu's glass recipe, verbatim from its CSS:
 *   background: rgba(255,255,255,0.239)   ← #ffffff3d
 *   backdrop-filter: blur(24px)
 *   border: 1px solid rgba(19,19,19,0.149) ← #13131326
 *
 * We keep the same optical recipe but re-point the tint at BAZNAS paper so
 * it stays warm rather than cold-grey.
 * ──────────────────────────────────────────────────────────────────────── */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** `light` = frosted white over dark backdrop (Zaiflu hero frames). */
  variant?: "light" | "dark";
  /** Adds the -3px lift + deep shadow on hover. */
  interactive?: boolean;
}

export function GlassCard({
  children,
  className = "",
  variant = "light",
  interactive = false,
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();

  const skin =
    variant === "light"
      ? "bg-white/25 backdrop-blur-lg border-ink/15"
      : "bg-petrol-900/25 backdrop-blur-lg border-white/15";

  const interactiveClass = interactive
    ? "shadow-crisp transition-shadow duration-350 ease-zaiflu hover:shadow-deep"
    : "";

  if (reduceMotion) {
    return (
      <div className={`rounded-hero border ${skin} ${interactiveClass} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`rounded-hero border ${skin} ${interactiveClass} ${className}`}
      whileHover={interactive ? { y: -3 } : undefined}
      transition={{ duration: 0.35, ease: EASE_SOFT }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <GhostNumber> — oversized ghost numeral backdrop
 *
 * Zaiflu's `.preview-featuer-main-single-number` is 122px at 24% opacity in
 * grey, sitting behind a small caption. It's the single most recognisable
 * move in that template. Here it sits behind dashboard stat values so the
 * numbers read as architectural rather than tabular.
 * ──────────────────────────────────────────────────────────────────────── */

export function GhostNumber({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none font-display font-extrabold leading-none tracking-tighter text-ink/[0.07] ${className}`}
    >
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * <PageTransition> — fades the app content between views
 *
 * The SPA switches views by conditional render, so without this the swap is
 * a hard cut. A short cross-fade is the cheapest meaningful upgrade.
 * ──────────────────────────────────────────────────────────────────────── */

export function PageTransition({
  children,
  className,
  viewKey,
}: {
  children: React.ReactNode;
  className?: string;
  /** Change this to re-trigger the fade (e.g. the active tab). */
  viewKey?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      key={viewKey}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_SOFT }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Motion-aware button press
 * Wrap a button's inner content so it depresses on tap. Zaiflu uses
 * `scale(0.98)`-class feedback on its CTAs.
 * ──────────────────────────────────────────────────────────────────────── */

export function Pressable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={`inline-flex items-center ${className ?? ""}`}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.span>
  );
}