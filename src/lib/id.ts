/**
 * Random ID generators. Centralized so the format is consistent across
 * the app and easy to change (e.g. swap Math.random for crypto.randomUUID).
 */

/**
 * Generate a domain-specific entity ID with timestamp suffix for stable
 * ordering. Format: `${prefix}-${epochMs}-${randomShort}`
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a SPK (Surat Perintah Kerja) number for pencairan applications.
 * Format: SPK-BAZNAS/MM/YYYY/NNN where NNN is a 3-digit random number.
 */
export function generateSpkNumber(
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): string {
  const seq = String(Math.floor(20 + Math.random() * 80)).padStart(3, "0");
  return `SPK-BAZNAS/${String(month).padStart(2, "0")}/${year}/${seq}`;
}

/**
 * Generate a bukti nomor (receipt number) for ZIS setoran.
 * Format: BZ-YYYYMM-NNN where NNN is a 3-digit random number.
 */
export function generateBuktiNo(
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): string {
  const seq = String(Math.floor(100 + Math.random() * 900));
  return `BZ-${year}${String(month).padStart(2, "0")}-${seq}`;
}

/**
 * Generate a temporary muzakki NIK for manual entries. Format: 7571 +
 * last 12 digits of the epoch timestamp.
 */
export function generateManualNik(): string {
  return `7571${Date.now().toString().slice(-12)}`;
}
