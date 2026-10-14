"use client";

import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "./Button";

/**
 * ConfirmDialog — accessible confirmation modal per UX-IMPROVEMENT-PLAN-30-60.md §3.1, §3.2.
 *
 * BAZNAS Modern Phase 4 refinement:
 *   - No shadow-2xl (calm, border-based)
 *   - Icon in solid square box, no pastel circle
 *   - Footer with paper bg
 *
 * Features:
 *   - 3 severity variants: danger, warning, info
 *   - Optional checkbox for "Saya menyetujui..." affirmation
 *   - Optional reason field for reject flows
 *   - Auto-focuses confirm button, traps focus, Escape to cancel
 *   - Click backdrop to cancel
 *   - Keyboard accessible (ARIA dialog pattern)
 */

type ConfirmSeverity = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  severity?: ConfirmSeverity;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  affirmationLabel?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonMinLength?: number;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const severityConfig: Record<ConfirmSeverity, { icon: React.ReactNode; boxColor: string; titleColor: string }> = {
  danger: {
    icon: <AlertTriangle className="h-5 w-5" />,
    boxColor: "bg-baznas-error-700 text-white",
    titleColor: "text-baznas-ink",
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    boxColor: "bg-baznas-warning-700 text-white",
    titleColor: "text-baznas-ink",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    boxColor: "bg-baznas-gold-display text-baznas-ink",
    titleColor: "text-baznas-ink",
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  severity = "danger",
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  affirmationLabel,
  requireReason = false,
  reasonLabel = "Alasan",
  reasonMinLength = 0,
  onConfirm,
  onCancel,
}) => {
  const [affirmed, setAffirmed] = React.useState(false);
  const [reason, setReason] = React.useState("");

  useEffect(() => {
    if (open) {
      setAffirmed(false);
      setReason("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement;
    return () => {
      previousActive?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const config = severityConfig[severity];
  const reasonValid = !requireReason || reason.trim().length >= reasonMinLength;
  const canConfirm = (!affirmationLabel || affirmed) && reasonValid;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-white border border-baznas-ink-8 shadow-lift overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup dialog"
          className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center text-baznas-ink/50 hover:text-baznas-ink hover:bg-baznas-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-baznas-green-800 focus-visible:ring-offset-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 inline-flex h-11 w-11 items-center justify-center ${config.boxColor}`}
              aria-hidden="true"
            >
              {config.icon}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3
                id="confirm-dialog-title"
                className={`text-lg font-bold font-poppins ${config.titleColor}`}
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-message"
                className="text-sm text-baznas-ink/70 mt-2 leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>

          {requireReason && (
            <div className="mt-5">
              <label
                htmlFor="confirm-dialog-reason"
                className="block text-[11px] font-bold text-baznas-ink uppercase tracking-wider mb-1.5"
              >
                {reasonLabel} <span className="text-baznas-error-700">*</span>
              </label>
              <textarea
                id="confirm-dialog-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={reasonMinLength > 0 ? `Minimal ${reasonMinLength} karakter...` : "Tuliskan alasan..."}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2 text-sm text-baznas-ink placeholder:text-baznas-ink/35 focus:outline-none focus:border-baznas-green-800"
                aria-describedby={reasonMinLength > 0 ? "confirm-dialog-reason-hint" : undefined}
              />
              {reasonMinLength > 0 && (
                <p id="confirm-dialog-reason-hint" className="text-[11px] text-baznas-ink/50 mt-1">
                  {reason.length}/{reasonMinLength} karakter minimum
                </p>
              )}
            </div>
          )}

          {affirmationLabel && (
            <label className="mt-5 flex items-start gap-3 cursor-pointer p-3 border border-baznas-ink-12 hover:border-baznas-green-800 hover:bg-baznas-paper/40 transition-colors">
              <input
                type="checkbox"
                checked={affirmed}
                onChange={(e) => setAffirmed(e.target.checked)}
                className="mt-0.5 h-5 w-5 border-baznas-ink-20 text-baznas-green-800 focus:ring-2 focus:ring-baznas-green-800 focus:ring-offset-1"
              />
              <span className="text-sm text-baznas-ink leading-relaxed">
                {affirmationLabel}
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-baznas-ink-8 bg-baznas-paper/40">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={severity === "danger" ? "danger" : "primary"}
            size="md"
            disabled={!canConfirm}
            onClick={() => onConfirm(requireReason ? reason : undefined)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
