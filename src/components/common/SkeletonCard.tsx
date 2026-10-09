"use client";

import React from "react";

/**
 * SkeletonCard — loading placeholder for stat cards.
 * Per UX-IMPROVEMENT-PLAN-30-60.md §3.9.
 *
 * BAZNAS Modern Phase 4 refinement:
 *   - No shadow, hairline border, no rounded-2xl
 *   - Slower pulse (less frantic, calmer loading)
 */

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

const CardSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Memuat data..."
    className="border border-baznas-ink-8 bg-white p-5"
  >
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 bg-baznas-paper animate-pulse" />
      <div className="h-3 w-12 bg-baznas-paper animate-pulse" />
    </div>
    <div className="mt-3 h-7 w-32 bg-baznas-paper animate-pulse" />
    <div className="mt-2 h-3 w-24 bg-baznas-paper/60 animate-pulse" />
  </div>
);

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 4,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={className}>
          <CardSkeleton />
        </div>
      ))}
    </>
  );
};

export const SingleSkeletonCard: React.FC = () => <CardSkeleton />;

export default SkeletonCard;
