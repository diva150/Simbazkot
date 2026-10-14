"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Button — accessible button component per UX-IMPROVEMENT-PLAN-30-60.md §2.
 *
 * BAZNAS Modern Phase 4 refinement:
 *   - No shadow (border-based, calmer)
 *   - Default radius 6px (rounded-md) instead of 8px (rounded-lg) — less AI-tell
 *   - Primary: baznas-ink (near-black) for authority, NOT green
 *     (green is for brand identity accents, not for repeated primary actions)
 *   - Danger: rose-700
 *   - Secondary: white with hairline border
 *
 * Variants:
 *   - primary:   baznas-ink bg, white text (most actions, default authority)
 *   - secondary: white bg, hairline border, dark text (default for most actions)
 *   - danger:    rose-700 bg, white text (destructive actions)
 *   - ghost:     transparent bg, dark text (tertiary actions)
 *   - link:      underlined, green text (rare, navigation-style)
 *
 * Sizes:
 *   - md: 44px tall (default for icon buttons)
 *   - lg: 48px tall (default for primary actions, WCAG 2.5.5 AAA)
 *   - icon: square 44x44 (icon-only)
 *
 * All variants:
 *   - font-medium 14px (text-sm)
 *   - min-h-t-target (44px) for icon-only
 *   - min-h-t-target-lg (48px) for primary
 *   - focus-visible ring 2px BAZNAS green
 *   - disabled state with not-allowed cursor and reduced opacity
 *   - loading state with spinner
 */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
type ButtonSize = "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: solid ink (near-black). Border matches bg so no jarring edge.
  primary:
    "bg-baznas-ink text-white border border-baznas-ink hover:bg-baznas-ink/90 hover:border-baznas-ink/90 active:bg-baznas-ink/80 transition-colors",
  // Secondary: white + hairline border. Calm, used everywhere.
  secondary:
    "bg-white text-baznas-ink border border-baznas-ink-20 hover:bg-baznas-paper hover:border-baznas-ink-40 active:bg-baznas-paper/80 transition-colors",
  // Danger: baznas-error-700, no shadow (Phase 1+2 — destructive state)
  danger:
    "bg-baznas-error-700 text-white border border-baznas-error-700 hover:bg-baznas-error-800 hover:border-baznas-error-800 active:bg-baznas-error-900 transition-colors",
  // Ghost: transparent. Tertiary, low commitment.
  ghost:
    "bg-transparent text-baznas-ink/80 border border-transparent hover:bg-baznas-paper hover:text-baznas-ink active:bg-baznas-paper/80 transition-colors",
  // Link: underlined green
  link:
    "bg-transparent text-baznas-green-900 border border-transparent hover:text-baznas-green-800 hover:underline underline-offset-4 transition-colors p-0 h-auto min-h-0 font-semibold",
};

const sizeClasses: Record<ButtonSize, string> = {
  // Tighter padding, no rounded-xl
  md: "min-h-t-target px-4 text-sm rounded-md gap-2",
  lg: "min-h-t-target-lg px-5 text-sm rounded-md gap-2.5",
  icon: "min-h-t-target min-w-t-target h-t-target w-t-target p-0 rounded-md",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "lg",
  loading = false,
  disabled,
  icon,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = [
    "inline-flex items-center justify-center font-semibold",
    "select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2",
    fullWidth ? "w-full" : "",
    variant === "link" ? "" : sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={baseClasses}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0 inline-flex" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children && (
        <span className={loading ? "opacity-80" : ""}>{children}</span>
      )}
      {iconRight && !loading && (
        <span className="shrink-0 inline-flex" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
};

export default Button;
