"use client";

import { useState, useCallback, useRef } from "react";
import type { ToastVariant } from "./Toast";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  onUndo?: () => void;
}

/**
 * useToast — hook for managing a stack of toast notifications.
 *
 * Usage:
 *   const { toasts, push, dismiss } = useToast();
 *   push({ variant: "success", title: "Data disimpan" });
 *   return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const push = useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }) => {
      counterRef.current += 1;
      const id = toast.id ?? `toast-${Date.now()}-${counterRef.current}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  // Convenience methods
  const success = useCallback(
    (title: string, description?: string) => push({ variant: "success", title, description }),
    [push]
  );
  const error = useCallback(
    (title: string, description?: string) => push({ variant: "error", title, description }),
    [push]
  );
  const info = useCallback(
    (title: string, description?: string) => push({ variant: "info", title, description }),
    [push]
  );
  const warning = useCallback(
    (title: string, description?: string) => push({ variant: "warning", title, description }),
    [push]
  );

  return { toasts, push, dismiss, clear, success, error, info, warning };
}
