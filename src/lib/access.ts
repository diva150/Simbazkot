/**
 * Role-based access control for BAZNAS Sistem Informasi
 *
 * Single source of truth for "which role can see what" across the app.
 * Used by:
 *   - app/page.tsx view switcher
 *   - Sidebar menu filtering
 *   - View sub-tab content rendering
 *   - Tab setter guards (reset to a valid tab if current is invalid)
 *
 * Design notes:
 *   - "admin" is superadmin — can access EVERY view and EVERY tab
 *   - "ketua" (Ketua BAZNAS) is leadership — can access their own view
 *     AND can read-only access laporan (reports) in other bidangs
 *   - "bidang1/2/3/4" are operational roles — limited to their own view
 *
 * The "laporan" tab in each Bidang is also visible to "ketua" so they
 * can review operational reports without accessing operational tools.
 *
 * For the prototype, all role checks are client-side. The real backend
 * must enforce these server-side too.
 */

import type { RoleBidang, UserSession, BidangType, UserField } from "./types";

// User-edit permission model
export const SELF_EDITABLE_FIELDS: UserField[] = ["email", "password", "fotoProfil"];
export const ADMIN_EDITABLE_FIELDS: UserField[] = SELF_EDITABLE_FIELDS.concat([
  "nama",
  "gender",
  "nip",
  "jabatan",
  "bidang",
  "role",
]);

// Map a user to the home view they see after login.
export function getHomeViewFor(user: UserSession): RoleBidang {
  if (user.role === "admin") return "admin";
  if (user.bidang === "ketua") return "ketua";
  if (user.bidang === "sekretariat") return "bidang4";
  if (user.bidang === "bidang1") return "bidang1";
  if (user.bidang === "bidang2") return "bidang2";
  if (user.bidang === "bidang3") return "bidang3";
  if (user.bidang === "bidang4") return "bidang4";
  return "bidang1";
}

// Permission to edit a user: self always; otherwise only admin
export function canEditUser(editor: UserSession, target: UserSession): boolean {
  if (editor.id === target.id) return true;
  return editor.role === "admin";
}

export function isFieldEditable(
  editor: UserSession,
  target: UserSession,
  field: UserField
): boolean {
  if (!canEditUser(editor, target)) return false;
  if (editor.role === "admin") return true;
  return SELF_EDITABLE_FIELDS.includes(field);
}

export function canCreateUser(editor: UserSession): boolean {
  return editor.role === "admin";
}

export function canDeleteUser(editor: UserSession, target: UserSession): boolean {
  return editor.role === "admin" && editor.id !== target.id;
}

// ── View-level access ────────────────────────────────────────────────
export function canAccessView(user: UserSession, view: RoleBidang): boolean {
  if (user.role === "admin") return true;
  return getHomeViewFor(user) === view;
}

// ── Tab-level access map ────────────────────────────────────────────
// Each role has a list of allowed (view, tab) tuples. The admin can access
// any tab on any view. Other roles can only access tabs in their own view,
// plus the "laporan" tab (read-only) in other bidangs if they are leadership.

type TabKey = `${RoleBidang}__${string}`;

function buildAllowSet(): Set<TabKey> {
  const allow = new Set<TabKey>();
  // Admin: all (view, tab) pairs are allowed. We model this as "always true"
  // for admin in `canAccessTab` rather than enumerating.
  return allow;
}

const ALLOW: Set<TabKey> = buildAllowSet();

export function canAccessTab(
  user: UserSession,
  view: RoleBidang,
  tab: string
): boolean {
  // Admin: full access
  if (user.role === "admin") return true;

  // User's own view: full access to all tabs in that view
  if (getHomeViewFor(user) === view) return true;

  // Ketua-bidang: read-only access to "laporan" tab in each Bidang (executive review)
  if (user.bidang === "ketua") {
    if (tab === "laporan" || tab === "laporan_semua") {
      return true;
    }
    return false;
  }

  return false;
}

// ── Default tab for a view (when user lands on a view) ───────────────
export function defaultTabFor(view: RoleBidang): string {
  switch (view) {
    case "bidang1":
    case "bidang2":
    case "bidang3":
    case "bidang4":
    case "admin":
      return "dashboard";
    case "ketua":
      return "disposisi";
    default:
      return "dashboard";
  }
}

// ── Visible tab filter for a view (filters an array of tab keys) ─────
export function filterVisibleTabs<T extends string>(
  user: UserSession,
  view: RoleBidang,
  allTabs: readonly T[]
): T[] {
  if (user.role === "admin") return [...allTabs];
  return allTabs.filter((tab) => canAccessTab(user, view, tab));
}

// ── Sub-tab labels (for Sidebar display) ────────────────────────────
export const BIDANG1_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Ringkasan",
  muzakki: "Data Muzakki (NIK/NPWZ)",
  zakat: "Zakat Profesi & Fitrah",
  infak: "Infak & Sedekah",
  dskl: "DSKL (Qurban & Fidyah)",
  laporan: "Laporan Kas Loket",
  pengaturan: "Pengaturan Nisab", // admin-only
};

export const BIDANG2_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Ringkasan",
  mustahik: "Data Mustahik & Kelayakan",
  pendistribusian: "Pendistribusian",
  pendayagunaan: "Pendayagunaan",
  pencairan: "Permohonan & SPK",
  dokumentasi: "Dokumentasi Bukti",
  laporan: "Laporan Penyaluran",
  pengaturan: "Kriteria Asesmen", // admin-only
};

export const BIDANG3_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Ringkasan",
  rkat: "RKAT Tahunan",
  bukukas: "Buku Kas Umum",
  laporan: "Laporan Keuangan",
  laporan_program: "Laporan Per Program",
  lpj: "LPJ Program",
  pengaturan: "Chart of Accounts", // admin-only
};

export const BIDANG4_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Ringkasan",
  surat_masuk: "Surat Masuk",
  surat_keluar: "Surat Keluar",
  format_surat: "Format / Template Surat",
  arsip_surat: "Arsip Surat",
  sop: "Repositori SOP",
  pegawai: "Data Pegawai / Amil",
  aset: "Inventaris Aset",
  pengaturan: "Pengaturan",
};

export const KETUA_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Pimpinan",
  disposisi: "Disposisi Surat",
  persetujuan_spk: "Persetujuan SPK",
  laporan_semua: "Laporan Terpadu",
};

export const ADMIN_TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard Admin",
  manajemen_akun: "Manajemen Akun",
  editor_beranda: "Editor Beranda Publik",
  bidang_access: "Bidang Access",
};

// ── Sidebar menu type — exported so Sidebar can import it ────────────
// Using `unknown` for the icon type to avoid pulling React types into this
// non-component module. The Sidebar passes real Lucide icon components.
export interface SidebarMenuItem {
  tab: string;
  label: string;
  Icon: (props: { className?: string }) => unknown;
}
