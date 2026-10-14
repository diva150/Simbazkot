"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { DIALOG_FOCUS_DELAY_MS } from "@/lib/constants";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Text used for `aria-labelledby`. If `labelledBy` is provided, that id is used instead. */
  title: string;
  /** Optional id of an element that titles the dialog. Defaults to an internal useId-generated id. */
  labelledBy?: string;
  children: React.ReactNode;
  size?: DialogSize;
  /** Optional className applied to the dialog panel (e.g. for custom width on print previews). */
  panelClassName?: string;
  /** Show a top-right close button. Defaults to true. Set false when the consumer renders its own header with a close action. */
  showCloseButton?: boolean;
}

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-4xl",
};

/**
 * Accessible modal dialog wrapper.
 *
 * Adds the dialog ARIA pattern (role="dialog" + aria-modal="true" + aria-labelledby),
 * an Escape-to-close handler, a focus trap (Tab/Shift+Tab cycle inside the dialog),
 * and focus return to the previously focused element on close.
 *
 * Usage:
 *   <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Edit Muzakki" size="lg">
 *     <div className="...">...content...</div>
 *   </Dialog>
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  labelledBy,
  children,
  size = "lg",
  panelClassName,
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = labelledBy ?? `dialog-title-${React.useId()}`;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Save current focus to restore on close
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Move focus to the first focusable element inside the dialog
    const focusFirst = () => {
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Fallback: focus the dialog panel itself
        root.focus();
      }
    };

    // Defer focus to next tick so the dialog has time to render its children
    const focusTimer = window.setTimeout(focusFirst, DIALOG_FOCUS_DELAY_MS);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !focusable.includes(active!))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to whatever was focused before the dialog opened
      const prev = previousActiveElement.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-baznas-ink/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        // Click on the backdrop closes the dialog (matches the pre-existing UX across the app)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          panelClassName
            ? `relative w-full ${panelClassName}`
            : `relative w-full ${SIZE_CLASS[size]} bg-white border border-baznas-ink-8 shadow-lift`
        }
      >
        {/* Screen-reader-only title element; consumers can hide it visually if they already
            render a visible title that points to the same id via `labelledBy`. */}
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`Tutup ${title}`}
            title="Tutup"
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center text-baznas-ink/50 hover:text-baznas-ink hover:bg-baznas-ink-8 h-t-target w-t-target transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Dialog;
