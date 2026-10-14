/**
 * Application-wide constants. Magic numbers in source code are bad because:
 * 1. They have no semantic meaning at the call site
 * 2. They can't be unit-tested or referenced from tests
 * 3. They hide business rules (e.g. nisab = 85g emas is a fatwa, not a knob)
 *
 * Anything that's a domain constant (zakat rates, photo limits, etc.)
 * belongs here. Anything that's a one-off timing value (focus delay, animation)
 * can stay inline with a comment explaining what it is.
 */

// === Zakat (Syariah constants) ===
// See: BAZNAS Keputusan No. 87 tahun 2024, Fatwa DSN-MUI No. 3/2000
export const ZAKAT_NISAB_EMAS_GRAM = 85;       // Nisab zakat = 85 gram emas
export const ZAKAT_NISAB_BERAS_KG = 522;       // Approx nisab in kg of rice (for maal)
export const ZAKAT_RATE_PROFESI = 0.025;       // 2,5% dari gaji bulanan
export const ZAKAT_RATE_MAAL = 0.025;          // 2,5% dari harta simpanan
// Approximate rupiah value of 522 kg beras × Rp 15.000/kg ÷ 12 bulan.
// Used by the public landing kalkulator as the maal nisab threshold.
export const ZAKAT_NISAB_MAAL_BULANAN_RUPIAH = 7_830_000;

// === File upload limits ===
export const MAX_PHOTO_BYTES = 500 * 1024;     // 500KB
export const MAX_PHOTO_BYTES_HUMAN = "500KB";

// === UI timing (milliseconds) ===
// Defer focus to the next tick so the dialog has time to render its
// children before focus moves.
export const DIALOG_FOCUS_DELAY_MS = 0;
// Wait this long after the modal opens before focusing the email input —
// gives the entrance animation time to finish.
export const LOGIN_FOCUS_DELAY_MS = 350;
// Wait this long after the modal closes before unmounting — gives the
// exit animation time to play.
export const LOGIN_UNMOUNT_DELAY_MS = 250;
// Simulated auth delay — gives the spinner time to be visible without
// feeling slow. UX-IMPROVEMENT-PLAN §3.2.
export const LOGIN_AUTH_DELAY_MS = 600;
// Refresh the date display at the start of each new day. Min 60s to avoid
// pathological cases (very early in the morning when msUntilMidnight is
// small or negative).
export const HEADER_DATE_REFRESH_MIN_MS = 60_000;
// Delay between opening a print modal and triggering window.print().
// Lets the print preview mount before the OS print dialog opens.
export const PRINT_AUTO_OPEN_DELAY_MS = 500;
