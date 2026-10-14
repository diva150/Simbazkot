/**
 * Format a number as Indonesian Rupiah currency.
 * Hoists the Intl.NumberFormat to module scope so it's constructed once
 * at import time, not on every call. Called from 30+ components in tables,
 * dashboard stats, and print views — hundreds of calls per render before,
 * one constant now.
 */
const RUPIAH_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return RUPIAH_FORMATTER.format(amount);
}

export function terbilang(n: number): string {
  const bilangan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  if (n < 12) return bilangan[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  if (n < 200) return "Seratus " + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  if (n < 2000) return "Seribu " + terbilang(n - 1000);
  if (n < 1000000) return Math.floor(n / 1000) + " Ribu " + (n % 1000);
  if (n < 1000000000) return Math.floor(n / 1000000) + " Juta " + (n % 1000000);
  if (n < 1000000000000) return Math.floor(n / 1000000000) + " Miliar " + (n % 1000000000);
  return Math.floor(n / 1000000000000) + " Triliun " + (n % 1000000000000);
}

export function getTerbilangRupiah(amount: number): string {
  const hasil = terbilang(amount).trim();
  return (hasil ? hasil : "Nol") + " Rupiah";
}

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatIndonesianLongDate(date: Date): string {
  return `${INDONESIAN_DAYS[date.getDay()]}, ${date.getDate()} ${INDONESIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a Date as YYYY-MM-DD using the LOCAL timezone (not UTC).
 * Use this for transaction dates, audit timestamps, and filename suffixes
 * that represent a calendar day in WITA/WIB/WIT — `toISOString().split("T")[0]`
 * gives the UTC date and can stamp early-morning transactions on the previous day.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Approximate Hijriah date from Gregorian (good enough for display purposes).
// For a system that requires exact Islamic calendar dates, integrate a proper
// library such as `hijri-converter` or `moment-hijri`. The approximation here
// stays within ±2 days of the true Hijri date across recent years.
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awwal",
  "Rabiul Akhir",
  "Jumadil Awwal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawwal",
  "Dzulqaidah",
  "Dzulhijjah",
];

const HIJRI_EPOCH = new Date(622, 6, 16).getTime(); // 16 July 622 CE (Julian)
const HIJRI_YEAR_DAYS = 354.367;

export function formatHijriahDate(date: Date): string {
  const daysSinceEpoch = Math.floor(
    (date.getTime() - HIJRI_EPOCH) / (24 * 60 * 60 * 1000)
  );
  const hijriYear = Math.floor(daysSinceEpoch / HIJRI_YEAR_DAYS) + 1;
  const dayOfYear = Math.floor(daysSinceEpoch % HIJRI_YEAR_DAYS);
  const hijriMonth = Math.floor(dayOfYear / 29.5) % 12;
  const dayOfMonth = Math.floor(dayOfYear % 29.5) + 1;
  return `${dayOfMonth} ${HIJRI_MONTHS[hijriMonth]} ${hijriYear} H`;
}
