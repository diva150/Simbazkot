"use client";

import React, { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Undo2,
} from "lucide-react";

/**
 * Toast — non-blocking notification per UX-IMPROVEMENT-PLAN-30-60.md §3.2.
 *
 * BAZNAS Modern Phase 4 refinement:
 *   - Background white (not pastel) with left-bar 4px per variant
 *   - More compact, less "stock AI notification"
 *   - Border subtle hairline (border-baznas-ink-8)
 *
 * Use cases:
 *   - success: "Data berhasil disimpan"
 *   - error:   "Gagal menyimpan data, coba lagi"
 *   - info:    "Memfilter data..."
 *   - warning: "Stok hampir habis"
 *
 * Optional `onUndo` callback renders an "Urungkan" button (5s timeout)
 * for non-critical actions (e.g. delete with restore).
 *
 * The Toast does NOT auto-manage state. Use the `useToast` hook
 * or render one with manual state management.
 */

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, default 5000
  onClose: () => void;
  onUndo?: () => void;
}

const variantStyles: Record<
  ToastVariant,
  { bar: string; icon: React.ReactNode; iconColor: string; titleColor: string }
> = {
  success: {
    bar: "bg-baznas-green-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconColor: "text-baznas-green-800",
    titleColor: "text-baznas-ink",
  },
  error: {
    bar: "bg-baznas-error-700",
    icon: <AlertCircle className="h-4 w-4" />,
    iconColor: "text-baznas-error-700",
    titleColor: "text-baznas-ink",
  },
  info: {
    bar: "bg-baznas-gold-display",
    icon: <Info className="h-4 w-4" />,
    iconColor: "text-baznas-gold-display",
    titleColor: "text-baznas-ink",
  },
  warning: {
    bar: "bg-baznas-warning-700",
    icon: <AlertTriangle className="h-4 w-4" />,
    iconColor: "text-baznas-warning-600",
    titleColor: "text-baznas-ink",
  },
};

export const Toast: React.FC<ToastProps> = ({
  variant,
  title,
  description,
  duration = 5000,
  onClose,
  onUndo,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = variantStyles[variant];

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      aria-live={variant === "error" || variant === "warning" ? "assertive" : "polite"}
      className="pointer-events-auto flex w-full max-w-sm items-stretch bg-white border border-baznas-ink-8 shadow-lift overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Left bar — variant color */}
      <div className={`w-1 ${styles.bar} shrink-0`} aria-hidden="true" />

      <div className="flex items-start gap-3 px-3.5 py-3 flex-1 min-w-0">
        <div className={`shrink-0 ${styles.iconColor} mt-0.5`} aria-hidden="true">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${styles.titleColor} leading-snug`}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-baznas-ink/65 mt-1 leading-relaxed">
              {description}
            </p>
          )}
          {onUndo && (
            <button
              type="button"
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-baznas-green-900 hover:text-baznas-green-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-1 rounded px-1 py-0.5"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Urungkan
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="shrink-0 inline-flex h-t-target w-t-target items-center justify-center text-baznas-ink/45 hover:text-baznas-ink hover:bg-baznas-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ── Toast container — renders a stack of toasts at the top-right ──────
interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  onUndo?: () => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notifikasi"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          duration={t.duration}
          onUndo={t.onUndo}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
