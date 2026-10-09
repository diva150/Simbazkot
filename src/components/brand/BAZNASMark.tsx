"use client";

import React from "react";

/**
 * BAZNASMark — official visual mark untuk Sistem Informasi BAZNAS
 *
 * Menggunakankan logo resmi BAZNAS (Badan Amil Zakat Nasional) yang
 * disediakan oleh user — file PNG di `/public/baznas-logo.png`.
 *
 * Logo ini berisi:
 *   - Garuda Pancasila di atas (lambang negara Indonesia)
 *   - "BAZNAS" wordmark (warna hijau BAZNAS)
 *   - "Badan Amil Zakat Nasional" subtitle
 *   - Identitas wilayah ("KOTA GORONTALO")
 *
 * Variants:
 *   - "icon"   — versi bulat ringkas (gold ring + monogram "B") untuk
 *                app icon / favicon / small badge. Tetap menghormati
 *                palette BAZNAS (#259148, #FEBF21).
 *   - "mark"   — full logo PNG, ukuran standar (40-56px). Untuk navbar
 *                & footer.
 *   - "full"   — logo lebih besar (64-96px). Untuk header halaman login,
 *                official document header, dll.
 *
 * Sizes: sm (h-28) | md (h-44) | lg (h-64) | xl (h-96)
 *
 * Properti:
 *   - className: tambahan Tailwind class untuk positioning
 *   - monochrome: jika true, gunakan "icon" saja (monogram) untuk dark
 *                 surface
 *   - invertOnDark: jika true, logo akan di-tint invert pada dark bg
 *                   (berguna untuk footer dark)
 */

type Variant = "icon" | "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

interface BAZNASMarkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  monochrome?: boolean;
  invertOnDark?: boolean;
}

// Size map untuk "mark" dan "full" variants (height dalam pixels)
const sizeMap: Record<Size, number> = {
  sm: 28,
  md: 44,
  lg: 64,
  xl: 96,
};

// Size map untuk "icon" variant (circular badge, width/height)
const iconSizeMap: Record<Size, number> = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 80,
};

export const BAZNASMark: React.FC<BAZNASMarkProps> = ({
  variant = "mark",
  size = "md",
  className = "",
  monochrome = false,
  invertOnDark = false,
}) => {
  // Icon variant — circular badge dengan monogram "B" (hemat ruang,
  // cocok untuk favicon, app icon, dan small chip)
  if (variant === "icon" || monochrome) {
    return <MarkBadge size={iconSizeMap[size]} className={className} />;
  }

  // Mark & Full variants — pakai logo PNG resmi
  const h = sizeMap[size];
  return (
    <img
      src="/baznas-logo.png"
      alt="BAZNAS — Badan Amil Zakat Nasional"
      className={`block ${invertOnDark ? "brightness-0 invert" : ""} ${
        variant === "full" ? "" : "h-auto"
      } ${className}`}
      style={{ height: h, width: "auto" }}
      draggable={false}
    />
  );
};

interface MarkBadgeProps {
  size: number;
  className?: string;
}

/**
 * MarkBadge — circular badge untuk icon variant.
 *
 * Tetap menghormati palette BAZNAS resmi:
 *   - Outer ring: #FEBF21 (gold-display)
 *   - Inner disc: #259148 (green-600, main)
 *   - Monogram:   #FAF7F1 (paper, cream)
 *
 * Inline SVG untuk kontrol penuh dan tidak tergantung network.
 */
const MarkBadge: React.FC<MarkBadgeProps> = ({ size, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="BAZNAS"
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="#FEBF21" strokeWidth="3" />
      <circle cx="50" cy="50" r="43" fill="#259148" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Poppins, Inter, sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-2"
        fill="#FAF7F1"
      >
        B
      </text>
    </svg>
  );
};

export default BAZNASMark;
