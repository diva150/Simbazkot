"use client";

import React from "react";
import type { DesilType } from "@/lib/types";
import { getKlasifikasi } from "@/lib/desil";

interface ClassificationBadgeProps {
  desil?: DesilType;
  /** Show both label and sublabel. Default false (just label). */
  withSublabel?: boolean;
  /** "sm" = 10px text (default), "md" = 11px text for prominent display. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * ClassificationBadge — "Mustahik" or "Muzakki" chip derived from desil.
 *
 * Aturan BAZNAS Kota Gorontalo (lihat src/lib/desil.ts):
 *   - Desil 1–5  → Mustahik (penerima manfaat)
 *   - Desil 6–10 → Muzakki  (pemberi zakat)
 *
 * Dipakai di samping badge desil angka, sehingga pengguna selalu melihat
 * klasifikasi (penerima vs pemberi) tanpa harus menghafal aturan.
 *
 * Contoh:
 *   <ClassificationBadge desil={m.desil} />
 *   → "Muzakki" dengan border green
 *   <ClassificationBadge desil={m.desil} withSublabel />
 *   → "Muzakki" + "Pemberi Zakat" (dua baris)
 */
export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  desil,
  withSublabel = false,
  size = "sm",
  className = "",
}) => {
  const k = getKlasifikasi(desil);
  const sizeClass =
    size === "md"
      ? "px-2.5 py-1 text-[11px]"
      : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-block font-bold uppercase tracking-wider ${sizeClass} ${k.badgeClass} ${className}`}
      aria-label={`Klasifikasi: ${k.label}`}
      title={k.sublabel}
    >
      {k.label}
      {withSublabel && (
        <span className="block text-[9px] font-semibold normal-case tracking-wide opacity-80">
          {k.sublabel}
        </span>
      )}
    </span>
  );
};

export default ClassificationBadge;
