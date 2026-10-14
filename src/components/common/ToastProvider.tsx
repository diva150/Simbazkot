"use client";

import React, { createContext, useContext } from "react";
import { useToast as useToastLocal, type ToastItem } from "./useToast";
import { ToastContainer } from "./Toast";

/**
 * ToastProvider + context-based useToast.
 *
 * Replaces the previous pattern where each module mounted its own
 * useToast() hook + its own <ToastContainer />. With 6 modules doing
 * this, the DOM ended up with 6 separate toast stacks (one per module
 * view), and a toast triggered from module A would only show if module A
 * was still mounted.
 *
 * Now there's a single root provider; useToast() returns the same
 * methods from anywhere in the tree. One ToastContainer at the root.
 */

interface ToastContextValue extends ReturnType<typeof useToastLocal> {}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToastLocal();
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts as ToastItem[]} onDismiss={toast.dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
