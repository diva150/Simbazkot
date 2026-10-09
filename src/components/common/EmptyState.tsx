"use client";

import React from "react";
import { Button } from "./Button";
import { Star8 } from "@/components/brand/IslamicOrnament";

/**
 * EmptyState — placeholder shown when a table/list has 0 results.
 * Per UX-IMPROVEMENT-PLAN-30-60.md §3.9.
 *
 * BAZNAS Modern Phase 4 refinement:
 *   - Replaces lucide icon in pastel circle with Star8 (8-point geometric)
 *   - No shadow, no rounded-2xl. Calm, editorial.
 *
 * Use cases:
 *   - Empty table: "Belum ada data Muzakki"
 *   - Filtered empty: "Tidak ada hasil yang cocok dengan filter"
 *   - Error state: "Gagal memuat data"
 */

type EmptyVariant = "empty" | "no-results" | "error";

interface EmptyStateProps {
  variant?: EmptyVariant;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const variantAccent: Record<EmptyVariant, string> = {
  empty: "text-baznas-green-900",
  "no-results": "text-baznas-gold-display",
  error: "text-rose-700",
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "empty",
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  const accent = variantAccent[variant];
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Star8 dengan border baznas-gold-display, no fill, no shadow */}
      {icon ? (
        <div className={`mb-5 ${accent}`} aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div
          className={`mb-5 inline-flex h-20 w-20 items-center justify-center border border-current ${accent}`}
          aria-hidden="true"
        >
          <Star8 size={48} />
        </div>
      )}
      <h3 className="text-base font-bold text-baznas-ink font-poppins">{title}</h3>
      {description && (
        <p className="text-sm text-baznas-ink/65 mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
