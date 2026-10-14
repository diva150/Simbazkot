import type { Config } from "tailwindcss";

/**
 * Tailwind config for Simbazkot — BAZNAS Modern design system
 *
 * Token layers (lexicographic):
 *   1. baznas-green.*      — primary brand green (light → deep)
 *   2. baznas-gold.*       — accent gold
 *   3. baznas-gold-display — restrained gold for lines/accents (added Phase 1)
 *   4. baznas-paper        — warm cream for dokumen/lembaga surfaces (added Phase 1)
 *   5. baznas-ink          — near-black green-tinted text (added Phase 1)
 *
 * Type scale follows UX-IMPROVEMENT-PLAN-30-60.md §2.1.
 *   - body:    16px / 1.5  (Inter)
 *   - heading: Poppins (semibold/bold) for h1-h6
 *   - display: Plus Jakarta Sans (added Phase 1) for hero & editorial moments
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        baznas: {
          green: {
            50: "#E8F5E9",
            100: "#C8E6C9",
            200: "#A5D6A7",
            300: "#7CBD91",
            400: "#50A76C",
            // === BAZNAS Official Palette (PANDUAN IDENTITAS DESAIN 2022) ===
            500: "#4CAF50",   // mid (untuk icon/secondary)
            600: "#259148",   // ✦ Main brand color — "Life, growth, nature"
            700: "#1B813A",   // ✦ Turunan 125% (darker) — primary action hover
            800: "#166831",   // deeper (untuk active state)
            900: "#0E4D1F",   // deep
            950: "#082414",   // deepest
          },
          gold: {
            50: "#FFFBEB",
            100: "#FFF4D4",   // ✦ Turunan 20%
            200: "#FFE9A9",   // ✦ Turunan 40%
            300: "#FEDE8E",   // ✦ Turunan 60%
            400: "#FED353",   // ✦ Turunan 80%
            // === BAZNAS Official Palette (PANDUAN IDENTITAS DESAIN 2022) ===
            500: "#FDC727",   // ✦ Main brand color — "warmth, friendliness, intellect"
            600: "#FEBF21",   // ✦ Turunan 125% (darker) — accent lines
            700: "#D9A21C",   // deeper
            800: "#B58A18",   // deep
            900: "#8C6A12",   // deepest
          },
          // Restrained accent (official BAZNAS 125% gold) — untuk garis/ornament
          "gold-display": "#FEBF21",
          // Warm cream untuk surface bernuansa dokumen/lembaga
          paper: "#FAF7F1",
          // Hampir-hitam dengan sedikit tint hijau — untuk teks body
          // Ganti slate-900 (biru-keabuan) dengan ini agar cohesive
          ink: "#0E1A14",
          // === Error & Warning palette (Phase 1) ===
          // Mirror rose-* (for destructive: error/clear/quit/delete) and
          // amber-* (for caution: warning/stale/pending) so we can keep the
          // visual semantics without depending on tailwind's default palette.
          error: {
            50: "#FFF1F2",
            100: "#FFE4E6",
            200: "#FECDD3",
            300: "#FDA4AF",
            400: "#FB7185",
            500: "#F43F5E",
            600: "#E11D48",
            700: "#BE123C",   // ✦ destructive bar/button (mirrors baznasError700)
            800: "#9F1239",   // ✦ destructive hover
            900: "#881337",   // ✦ destructive active
          },
          warning: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#F59E0B",
            600: "#D97706",   // ✦ warning icon/accent (mirrors baznasWarning600)
            700: "#B45309",   // ✦ warning bar/button
            800: "#92400E",
            900: "#78350F",
          },
        },
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        // Refined: 1px hairline + 4px soft glow — lebih tenang dari xs
        rest: "0 1px 0 0 rgba(14, 26, 20, 0.04), 0 4px 12px -2px rgba(14, 26, 20, 0.04)",
        // Lifted variant untuk hover
        lift: "0 1px 0 0 rgba(14, 26, 20, 0.06), 0 10px 24px -8px rgba(14, 26, 20, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        // Accessible touch target sizes (WCAG 2.5.5 AAA: 44x44)
        "t-target": "44px",
        "t-target-lg": "48px",
        "t-target-xl": "56px",
      },
      fontSize: {
        // Base body text standards (see UX-IMPROVEMENT-PLAN-30-60.md §2.1)
        "body": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "helper": ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        // Override default Tailwind tokens to align with new scale
        "xs": ["12px", { lineHeight: "1.4" }],
        "sm": ["14px", { lineHeight: "1.5" }],
        "base": ["16px", { lineHeight: "1.5" }],
        "lg": ["18px", { lineHeight: "1.4" }],
        "xl": ["20px", { lineHeight: "1.3" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["28px", { lineHeight: "1.2" }],
        // Editorial display sizes — untuk hero & section title besar
        "display-3": ["36px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-2": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-1": ["64px", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-hero": ["80px", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        // Editorial display — untuk hero heading, stats jumbo, ceremonial
        // "display" adalah Plus Jakarta Sans (loaded di globals.css @import)
        display: ["var(--font-display)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderColor: {
        // Subtle hairline default — agar kartu & divider tidak noisy
        // Override `border` utility (Tailwind 3 supports DEFAULT in extend)
        DEFAULT: "rgba(14, 26, 20, 0.08)",
      },
      backgroundImage: {
        // Halus, repeating gradient linen untuk nuansa dokumen
        // Opacity rendah supaya tidak mendominasi konten
        "paper-texture":
          "repeating-linear-gradient(0deg, rgba(184, 137, 62, 0.02) 0px, rgba(184, 137, 62, 0.02) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(184, 137, 62, 0.015) 0px, rgba(184, 137, 62, 0.015) 1px, transparent 1px, transparent 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
