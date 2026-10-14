/**
 * Shared types, constants, and validation helpers for the Bidang II tabs.
 *
 * Extracted from the monolithic Bidang2View.tsx as part of the per-tab
 * split (Phase 8 of MEDIUM+LOW cleanup).
 */

import {
  Mustahik,
  DesilType,
  SubProgramPendayagunaan,
  SubProgramPendistribusian,
} from "@/lib/types";

// === Asnaf (8 groups in Islam — Mustahik categories) ===
// Used by the Mustahik tab form and the Excel import whitelist.
export const ASNAF_WHITELIST = [
  "Fakir",
  "Miskin",
  "Amil",
  "Mualaf",
  "Riqab",
  "Gharimin",
  "Fisabilillah",
  "Ibnu Sabil",
] as const;

// === Desil (poverty deciles 1–10) ===
// 1 = poorest, 10 = richest. Desil 1-5 are Mustahik-eligible per BAZNAS rules.
export const DESIL_WHITELIST = [
  "Desil 1",
  "Desil 2",
  "Desil 3",
  "Desil 4",
  "Desil 5",
  "Desil 6",
  "Desil 7",
  "Desil 8",
  "Desil 9",
  "Desil 10",
] as const;

// === Sub-program categories ===
// Pendistribusian = consumtif (education, health, dakwah)
// Pendayagunaan = produktif (modal usaha, vokasi, sanitasi)
export const SUB_PROGRAM_DISTRIBUSI = [
  "Pendidikan",
  "Kesehatan",
  "Dakwah dan Advokasi",
] as const;

export const SUB_PROGRAM_DAYAGUNAAN = [
  "Pendidikan Sebagian",
  "Modal Usaha Z-Mart",
  "Vokasi",
  "Sanitasi Sehat",
] as const;

export const ALL_SUB_PROGRAMS = [
  ...SUB_PROGRAM_DISTRIBUSI,
  ...SUB_PROGRAM_DAYAGUNAAN,
] as const;

// === Type guards for Excel import (and other user-input paths) ===
// Without these, a typo ("Miskkin", "Desil 11") would silently be
// accepted as a valid value because the unchecked `as` cast tells
// TypeScript to trust the runtime value.
export function isValidAsnaf(v: string): v is Mustahik["asnaf"] {
  return (ASNAF_WHITELIST as readonly string[]).includes(v);
}
export function isValidDesil(v: string): v is DesilType {
  return (DESIL_WHITELIST as readonly string[]).includes(v);
}
export function isValidSubProgram(
  v: string
): v is SubProgramPendayagunaan | SubProgramPendistribusian {
  return (ALL_SUB_PROGRAMS as readonly string[]).includes(v);
}

// === Sub-program card metadata ===
// Used by PendistribusianTab and PendayagunaanTab to render the 3 large
// cards at the top of each tab.
export interface SubProgramCardMeta {
  key: string;
  title: string;
  sub: SubProgramPendistribusian | SubProgramPendayagunaan;
  count: number;
  description: string;
  iconKey: "education" | "health" | "dakwah" | "modal" | "vokasi" | "sanitasi";
  accentClass: string; // for the icon + border
}
