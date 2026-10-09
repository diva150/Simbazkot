"use client";

import React from "react";

/**
 * IslamicOrnament — restrained geometric SVG ornaments for the BAZNAS
 * Modern visual language. These are NOT a pattern library; they are
 * inline-SVG React components that live where they're used.
 *
 * Three ornaments:
 *
 *   1. <Star8 />        — 8-point Rub el Hizb, for accenting hero or
 *                         ceremonial moments. Available in 3 sizes.
 *
 *   2. <KhatRule />     — horizontal rule with center ornament, used
 *                         as a section divider. 3 variants (thin, thick,
 *                         with-star).
 *
 *   3. <CornerBracket /> — corner bracket for framing special content
 *                          like a Tanda Terima sertifikat look.
 *
 * All use `currentColor` for the line color so a parent `text-baznas-*
 * class can recolor them.
 */

interface Star8Props {
  size?: number;
  className?: string;
  filled?: boolean;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

const STAR_POINTS = "50,5 65,35 95,50 65,65 50,95 35,65 5,50 35,35";

export const Star8: React.FC<Star8Props> = ({
  size = 32,
  className = "",
  filled = false,
  ...aria
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    role="img"
    {...aria}
  >
    <polygon
      points={STAR_POINTS}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      strokeLinejoin="round"
    />
    {filled && <circle cx="50" cy="50" r="6" fill="var(--baznas-paper)" />}
  </svg>
);

interface KhatRuleProps {
  variant?: "thin" | "thick" | "with-star";
  className?: string;
  label?: string; // optional center label, e.g. "VISI & MISI"
}

export const KhatRule: React.FC<KhatRuleProps> = ({
  variant = "thin",
  className = "",
  label,
}) => {
  const isThick = variant === "thick";
  const hasStar = variant === "with-star";
  const stroke = isThick ? 2 : 1;

  return (
    <div className={`flex items-center gap-3 w-full text-baznas-gold-display ${className}`}>
      <span
        className="flex-1 bg-current opacity-50"
        style={{ height: `${stroke}px` }}
        aria-hidden="true"
      />
      {hasStar && <Star8 size={20} aria-hidden="true" />}
      {label && (
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-baznas-ink/80 font-poppins">
          {label}
        </span>
      )}
      {hasStar && <Star8 size={20} aria-hidden="true" />}
      <span
        className="flex-1 bg-current opacity-50"
        style={{ height: `${stroke}px` }}
        aria-hidden="true"
      />
    </div>
  );
};

interface CornerBracketProps {
  position: "tl" | "tr" | "bl" | "br" | "all";
  size?: number;
  thickness?: number;
  offset?: number;
  className?: string;
}

/**
 * CornerBracket — thin geometric L-bracket for framing content.
 *
 * Position "all" draws brackets in all 4 corners as a single SVG.
 * Single-corner positions draw only one corner (top-left, etc.).
 */
export const CornerBracket: React.FC<CornerBracketProps> = ({
  position,
  size = 32,
  thickness = 1.5,
  offset = 4,
  className = "",
}) => {
  if (position === "all") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${100 + offset * 2} ${100 + offset * 2}`}
        width="100%"
        height="100%"
        className={`pointer-events-none absolute inset-0 text-baznas-gold-display ${className}`}
        aria-hidden="true"
      >
        {/* Top-left */}
        <polyline
          points={`${offset + size},${offset} ${offset},${offset} ${offset},${offset + size}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="square"
        />
        {/* Top-right */}
        <polyline
          points={`${100 + offset - size},${offset} ${100 + offset},${offset} ${100 + offset},${offset + size}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="square"
        />
        {/* Bottom-left */}
        <polyline
          points={`${offset},${100 + offset - size} ${offset},${100 + offset} ${offset + size},${100 + offset}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="square"
        />
        {/* Bottom-right */}
        <polyline
          points={`${100 + offset - size},${100 + offset} ${100 + offset},${100 + offset} ${100 + offset},${100 + offset - size}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="square"
        />
      </svg>
    );
  }

  // Single-corner variants
  const coords: Record<typeof position, { x: number; y: number; rotate: number }> = {
    tl: { x: 0,   y: 0,   rotate: 0 },
    tr: { x: 100, y: 0,   rotate: 90 },
    bl: { x: 0,   y: 100, rotate: 270 },
    br: { x: 100, y: 100, rotate: 180 },
  };
  const c = coords[position];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`text-baznas-gold-display ${className}`}
      style={{
        transform: `translate(${c.x === 0 ? 0 : -size}px, ${c.y === 0 ? 0 : -size}px) rotate(${c.rotate}deg)`,
        transformOrigin: "center",
      }}
      aria-hidden="true"
    >
      <polyline
        points={`${size * 0.7},0 ${0},0 ${0},${size * 0.7}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="square"
      />
    </svg>
  );
};

export default Star8;
