/**
 * brand-tokens.ts — single source of truth untuk design system.
 *
 * Mirror dari `tailwind.config.ts` dan `app/globals.css`.
 * Referensi: PANDUAN IDENTITAS DESAIN BAZNAS 2022
 */

export const brandTokens = {
  // === Official BAZNAS Color Palette (PANDUAN IDENTITAS DESAIN 2022) ===
  // Hijau: "Life, growth, nature"
  // Kuning: "warmth, friendliness, intellect"
  colors: {
    // Hijau utama (#259148) — primary brand
    baznasGreen600: "#259148",
    // Hijau gelap turunan 125% (#1B813A) — primary action hover
    baznasGreen700: "#1B813A",
    // Kuning utama (#FDC727) — accent
    baznasGold500: "#FDC727",
    // Kuning gelap turunan 125% (#FEBF21) — restrained accent
    baznasGoldDisplay: "#FEBF21",
    // Cream untuk dokumen/lembaga surface
    baznasPaper: "#FAF7F1",
    // Near-black untuk teks body
    baznasInk: "#0E1A14",
  },

  // === Typography (mengikuti Panduan) ===
  // BAZNAS wordmark: Arial Black 26pt (mendekati Poppins ExtraBold 800)
  // Subtitle: Garamound 13pt (mendekati Poppins Medium 500)
  // Body: Gotham family (mendekati Inter untuk open-source)
  // Display editorial: Plus Jakarta Sans (mirip Gotham)
  fonts: {
    body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: "Poppins, sans-serif",
    display: "'Plus Jakarta Sans', Inter, sans-serif",
    wordmark: "Poppins, Inter, sans-serif", // Approximation of Arial Black
  },

  // === Spacing scale ===
  spacing: {
    touchTarget: 44,
    touchTargetLg: 48,
    touchTargetXl: 56,
    sectionGap: 88,
  },

  // === Type scale ===
  type: {
    body: 16,
    bodySm: 14,
    helper: 13,
    caption: 12,
    display3: 36,
    display2: 48,
    display1: 64,
    displayHero: 80,
    // BAZNAS wordmark
    wordmarkLg: 26, // pt
    subtitle: 13,   // pt
  },

  // === Border radius ===
  radius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999, // circular mark
  },

  // === Shadow recipes ===
  shadow: {
    rest: "0 1px 0 0 rgba(14, 26, 20, 0.04), 0 4px 12px -2px rgba(14, 26, 20, 0.04)",
    lift: "0 1px 0 0 rgba(14, 26, 20, 0.06), 0 10px 24px -8px rgba(14, 26, 20, 0.08)",
  },

  // === BAZNAS Brand Identity (PANDUAN 2022) ===
  // AKHLAK values — untuk referensi internal saja
  akhlak: [
    "Akuntabel",   // Akuntabel
    "Kompeten",    // Kompeten
    "Harmonis",    // Harmonis
    "Loyal",       // Loyal
    "Adaptif",     // Adaptif
    "Kolaborasi",  // Kolaborasi
  ],

  // Logo usage rules (Panduan halaman 19)
  logoRules: {
    correctBackgrounds: ["Putih", "Kuning", "Hijau", "Dark green (negative)"],
    avoid: [
      "Background ramai/poladot",
      "Background puzzle pieces",
      "Background sama warna logo",
      "Memiringkan logo",
      "Meregangkan logo",
      "Mengubah teks wordmark",
      "Menukar warna logo",
    ],
  },
} as const;

export type BrandTokens = typeof brandTokens;
