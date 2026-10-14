/**
 * Utilitas Export & Import Excel untuk BAZNAS
 *
 * Menghasilkan file .xlsx (Office Open XML) yang siap dibuka di Microsoft Excel
 * 2021, LibreOffice Calc, dan Google Sheets dengan formatting rapi:
 *   - Header baris dengan BAZNAS green background, font putih, bold
 *   - Auto-width kolom
 *   - Format angka Rupiah untuk kolom nominal
 *   - Format tanggal ISO untuk kolom tanggal
 *   - Multi-sheet workbook untuk template import (instruksi + data)
 */

import * as XLSX from "xlsx";
import { getLocalDateString } from "./utils";

// BAZNAS brand colors (hex without #)
const BAZNAS_GREEN = "0F5132";
const HEADER_TEXT = "FFFFFF";
const ZEBRA_LIGHT = "F8FAFC";
const LEGEND_BG = "FEF3C7";
const META_BG = "E8F5E9";

// ── Cell types accepted by the export ─────────────────────────────────
export type CellValue = string | number | Date | null | undefined;

// Format Rupiah string (e.g. "Rp 1.500.000" -> 1500000 for Excel number)
function parseRupiahToNumber(value: CellValue): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (value instanceof Date) return null;
  const cleaned = value.replace(/[^0-9,-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Detect if a column likely contains currency based on its header
function isCurrencyHeader(header: string): boolean {
  const lower = header.toLowerCase();
  return (
    lower.includes("nominal") ||
    lower.includes("rupiah") ||
    lower.includes("pagu") ||
    lower.includes("realisasi") ||
    lower.includes("sisa") ||
    lower.includes("saldo") ||
    lower.includes("nilai") ||
    lower.includes("harga")
  );
}

// Detect if a column likely contains dates
function isDateHeader(header: string): boolean {
  const lower = header.toLowerCase();
  return lower.includes("tanggal") || lower === "tgl" || lower.endsWith(" tgl");
}

// Auto-detect if a string looks like an ISO date (YYYY-MM-DD)
function isISODateString(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// ── Style helpers ─────────────────────────────────────────────────────

interface CellStyle {
  font?: { bold?: boolean; italic?: boolean; color?: string; sz?: number };
  fill?: { fgColor?: { rgb: string } };
  alignment?: { horizontal?: "left" | "center" | "right" | "fill" | "wrap"; vertical?: "top" | "center" | "bottom"; wrapText?: boolean };
  numFmt?: string;
  border?: {
    top?: { style: "thin" | "medium" | "thick"; color?: string };
    bottom?: { style: "thin" | "medium" | "thick"; color?: string };
    left?: { style: "thin" | "medium" | "thick"; color?: string };
    right?: { style: "thin" | "medium" | "thick"; color?: string };
  };
}

function headerCellStyle(): CellStyle {
  return {
    font: { bold: true, color: HEADER_TEXT, sz: 11 },
    fill: { fgColor: { rgb: BAZNAS_GREEN } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: BAZNAS_GREEN },
      bottom: { style: "medium", color: BAZNAS_GREEN },
      left: { style: "thin", color: BAZNAS_GREEN },
      right: { style: "thin", color: BAZNAS_GREEN },
    },
  };
}

function zebraRowStyle(rowIndex: number): CellStyle {
  const isAlt = rowIndex % 2 === 1;
  return {
    fill: isAlt ? { fgColor: { rgb: ZEBRA_LIGHT } } : undefined,
    border: {
      top: { style: "thin", color: "E2E8F0" },
      bottom: { style: "thin", color: "E2E8F0" },
      left: { style: "thin", color: "E2E8F0" },
      right: { style: "thin", color: "E2E8F0" },
    },
  };
}

function metaCellStyle(): CellStyle {
  return {
    font: { italic: true, sz: 10, color: "475569" },
    fill: { fgColor: { rgb: META_BG } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
  };
}

function legendCellStyle(): CellStyle {
  return {
    font: { bold: true, sz: 11, color: "92400E" },
    fill: { fgColor: { rgb: LEGEND_BG } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
  };
}

// ── Worksheet from rows + headers with BAZNAS styling ────────────────
function buildStyledSheet(
  aoa: CellValue[][],
  options: { currencyColumns?: Set<number>; dateColumns?: Set<number> } = {}
): XLSX.WorkSheet {
  if (aoa.length === 0) return XLSX.utils.aoa_to_sheet([[]]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  // Default column format based on header
  const headerRow = aoa[0] || [];
  const currencyCols = options.currencyColumns ?? new Set(
    headerRow
      .map((h, i) => (typeof h === "string" && isCurrencyHeader(h) ? i : -1))
      .filter((i) => i >= 0)
  );
  const dateCols = options.dateColumns ?? new Set(
    headerRow
      .map((h, i) => (typeof h === "string" && isDateHeader(h) ? i : -1))
      .filter((i) => i >= 0)
  );

  // Build cell-style map
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) continue;

      if (R === 0) {
        // Header row
        cell.s = headerCellStyle();
      } else {
        // Data row
        const baseStyle = zebraRowStyle(R);
        cell.s = baseStyle;

        // Apply number format
        if (currencyCols.has(C)) {
          // If the cell value is a string like "Rp 1.500.000", convert to number
          if (typeof cell.v === "string" && cell.v.includes("Rp")) {
            const n = parseRupiahToNumber(cell.v);
            if (n !== null) {
              cell.v = n;
              cell.t = "n";
            }
          }
          cell.s = { ...cell.s, numFmt: "#,##0", alignment: { horizontal: "right" } };
        } else if (dateCols.has(C)) {
          if (isISODateString(cell.v)) {
            // Convert ISO string to a Date object so Excel shows it as a date
            const d = new Date(cell.v as string);
            if (!isNaN(d.getTime())) {
              cell.v = d;
              cell.t = "d";
              cell.s = { ...cell.s, numFmt: "dd mmm yyyy", alignment: { horizontal: "center" } };
            }
          } else {
            cell.s = { ...cell.s, alignment: { horizontal: "center" } };
          }
        }
      }
    }
  }

  // Set column widths (auto-sized heuristic)
  const colWidths: { wch: number }[] = [];
  for (let C = 0; C <= range.e.c; C++) {
    let maxLen = 10;
    for (let R = 0; R <= range.e.r; R++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v !== null && cell.v !== undefined) {
        const len = String(cell.v).length;
        if (len > maxLen) maxLen = len;
      }
    }
    colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 12), 50) });
  }
  ws["!cols"] = colWidths;

  // Set row heights for header (taller for wrapped text)
  ws["!rows"] = aoa.map((_, i) =>
    i === 0 ? { hpt: 32 } : { hpt: 18 }
  );

  // Freeze the header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  return ws;
}

// ── Main export: styled .xlsx with BAZNAS branding ────────────────────
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: CellValue[][]
): void {
  const aoa: CellValue[][] = [headers, ...rows];

  const wb = XLSX.utils.book_new();
  const ws = buildStyledSheet(aoa);

  // Use a safe sheet name (max 31 chars, no special chars)
  const sheetName = filename
    .replace(/[\\/?*[\]:]/g, "")
    .substring(0, 31) || "Data";

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Set workbook properties
  wb.Props = {
    Title: filename,
    Subject: "BAZNAS Sistem Informasi",
    Author: "BAZNAS",
    Company: "Badan Amil Zakat Nasional (BAZNAS)",
    CreatedDate: new Date(),
  };

  const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const datedFilename = `${cleanFilename}_${getLocalDateString()}.xlsx`;
  XLSX.writeFile(wb, datedFilename);
}

// ── Multi-sheet export: data + summary in one workbook ────────────────
export function exportMultiSheetToExcel(
  filename: string,
  sheets: Array<{
    name: string;
    headers: string[];
    rows: CellValue[][];
  }>
): void {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, headers, rows }) => {
    const aoa: CellValue[][] = [headers, ...rows];
    const ws = buildStyledSheet(aoa);

    // Safe sheet name: max 31 chars, no special chars
    const safeName = name.replace(/[\\/?*[\]:]/g, "").substring(0, 31) || "Sheet";
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  });

  wb.Props = {
    Title: filename,
    Subject: "BAZNAS Sistem Informasi",
    Author: "BAZNAS",
    Company: "Badan Amil Zakat Nasional (BAZNAS)",
    CreatedDate: new Date(),
  };

  const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const datedFilename = `${cleanFilename}_${getLocalDateString()}.xlsx`;
  XLSX.writeFile(wb, datedFilename);
}

// ── Parser: accepts only .xlsx files (CSV uploads no longer supported) ─
// CSV was removed because:
//   1. The exported .xlsx files include BAZNAS branding (green headers, zebra rows,
//      currency/date formatting) that a plain CSV cannot preserve.
//   2. The template workbooks include a "Petunjuk" instructions sheet that
//      users can reference without having to remember column positions.
//   3. To re-import a previously-exported file, the user should keep it in .xlsx
//      format. Re-exporting from the BAZNAS app always produces .xlsx.
export interface ParsedSheet {
  headers: string[];
  rows: string[][];
  source: "xlsx";
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const name = file.name.toLowerCase();
  const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");

  if (!isExcel) {
    throw new Error(
      "Format file tidak didukung. Silakan unggah file Microsoft Excel (.xlsx) yang diunduh dari template resmi BAZNAS."
    );
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });

  // Use the first non-empty sheet
  const sheetName =
    wb.SheetNames.find((n) => {
      const s = wb.Sheets[n];
      return s && s["!ref"];
    }) || wb.SheetNames[0];

  if (!sheetName) {
    throw new Error("File Excel tidak memiliki sheet yang dapat dibaca.");
  }

  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<CellValue[]>(ws, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false, // formatted strings (e.g. "Rp 1.500.000" stays as-is)
  });

  if (aoa.length === 0) {
    return { headers: [], rows: [], source: "xlsx" };
  }

  const [headers, ...rows] = aoa;
  return {
    headers: (headers || []).map((h) => String(h ?? "").trim()),
    rows: rows.map((r) => (r || []).map((c) => String(c ?? "").trim())),
    source: "xlsx",
  };
}

// ── Quick stats for an exported sheet (for summary rows) ──────────────
export function sumColumn(
  rows: CellValue[][],
  headerIndex: number
): number {
  let total = 0;
  for (const row of rows) {
    const cell = row[headerIndex];
    if (cell === null || cell === undefined) continue;
    if (typeof cell === "number") {
      total += cell;
    } else if (typeof cell === "string") {
      const n = parseRupiahToNumber(cell);
      if (n !== null) total += n;
    }
  }
  return total;
}

// ── Template builders ─────────────────────────────────────────────────
// Each template creates a 2-sheet workbook: "Petunjuk" (instructions)
// + "Data" (the actual data table with sample rows).

interface ImportTemplate {
  namaFile: string;
  judul: string;
  deskripsi: string;
  urutanKolom: string[];
  contohBaris: CellValue[][];
  catatan?: string[];
  validasi?: string[];
}

function buildTemplateWorkbook(t: ImportTemplate): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Petunjuk Penggunaan ──────────────────────────────────
  const instructionsAOA: CellValue[][] = [
    ["TEMPLATE IMPORT DATA BAZNAS"],
    [`Judul: ${t.judul}`],
    [`Deskripsi: ${t.deskripsi}`],
    [],
    ["INSTRUKSI PENGGUNAAN"],
    ["1. Isi data pada sheet 'Data' mulai dari baris ke-2 (baris pertama adalah header)"],
    ["2. Jangan mengubah nama kolom di baris header (baris 1 di sheet 'Data')"],
    ["3. Hapus baris contoh sebelum mengimpor data Anda sendiri"],
    ["4. Simpan file dalam format .xlsx sebelum diimpor ke sistem BAZNAS"],
    ["5. Pastikan semua kolom wajib (*) telah diisi"],
    [],
  ];

  if (t.catatan && t.catatan.length > 0) {
    instructionsAOA.push(["CATATAN PENTING"]);
    t.catatan.forEach((c) => instructionsAOA.push([c]));
    instructionsAOA.push([]);
  }

  if (t.validasi && t.validasi.length > 0) {
    instructionsAOA.push(["VALIDASI FIELD"]);
    t.validasi.forEach((v) => instructionsAOA.push([v]));
    instructionsAOA.push([]);
  }

  const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsAOA);

  // Style the title row
  const titleCell = instructionsWS["A1"];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 16, color: HEADER_TEXT },
      fill: { fgColor: { rgb: BAZNAS_GREEN } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Style subtitle rows
  for (let i = 2; i <= 3; i++) {
    const cell = instructionsWS[`A${i}`];
    if (cell) cell.s = metaCellStyle();
  }

  // Style section headers (e.g. "INSTRUKSI PENGGUNAAN", "CATATAN PENTING", etc.)
  let row = 5;
  for (let i = 5; i < instructionsAOA.length; i++) {
    const cell = instructionsWS[`A${i}`];
    const text = instructionsAOA[i][0];
    if (typeof text === "string" && text === text.toUpperCase() && !text.startsWith("1.") && !text.startsWith("2.") && !text.startsWith("3.") && !text.startsWith("4.") && !text.startsWith("5.") && !text.startsWith("Judul") && !text.startsWith("Deskripsi")) {
      // Section header
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 12, color: BAZNAS_GREEN },
          fill: { fgColor: { rgb: META_BG } },
          alignment: { horizontal: "left", vertical: "center" },
        };
      }
    } else if (cell) {
      cell.s = {
        alignment: { wrapText: true, vertical: "top" },
        font: { sz: 10 },
      };
    }
    row++;
  }

  instructionsWS["!cols"] = [{ wch: 100 }];
  instructionsWS["!rows"] = instructionsAOA.map(() => ({ hpt: 20 }));
  instructionsWS["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, // title row 1
  ];

  XLSX.utils.book_append_sheet(wb, instructionsWS, "Petunjuk");

  // ── Sheet 2: Data ──────────────────────────────────────────────────
  const dataAOA: CellValue[][] = [t.urutanKolom, ...t.contohBaris];
  const dataWS = buildStyledSheet(dataAOA);

  XLSX.utils.book_append_sheet(wb, dataWS, "Data");

  wb.Props = {
    Title: t.judul,
    Subject: "Template Import BAZNAS",
    Author: "BAZNAS",
    Company: "Badan Amil Zakat Nasional (BAZNAS)",
    CreatedDate: new Date(),
  };

  return wb;
}

function writeTemplateWorkbook(wb: XLSX.WorkBook, filename: string): void {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const datedFilename = `${cleanFilename}_${getLocalDateString()}.xlsx`;
  XLSX.writeFile(wb, datedFilename);
}

// ── Template Import Muzakki ──────────────────────────────────────────
export function downloadTemplateMuzakki(): void {
  const wb = buildTemplateWorkbook({
    namaFile: "Template_Import_Muzakki_BAZNAS",
    judul: "Template Import Data Muzakki (Pemberi Zakat)",
    deskripsi:
      "Gunakan template ini untuk menambahkan data Muzakki (perorangan atau instansi) secara批量 melalui fitur Import Excel di Bidang I.",
    urutanKolom: [
      "Nama Lengkap *",
      "NIK *",
      "NPWZ",
      "No WhatsApp *",
      "Alamat *",
      "Instansi / OPD *",
      "Tingkat Desil *",
    ],
    contohBaris: [
      [
        "Drs. H. Ahmad Sanusi, M.Pd",
        "7571012304750001",
        "WZ-7571-2024-0012",
        "081234567890",
        "Jl. Jend. Sudirman No. 28, Kota Gorontalo",
        "Dinas Pendidikan Daerah",
        "Desil 7",
      ],
      [
        "Hj. Fatimah Zahra, S.E",
        "7571094508820002",
        "WZ-7571-2024-0013",
        "081398765432",
        "Kel. Limba B, Kota Gorontalo",
        "Bank Sulutgo Cabang Gorontalo",
        "Desil 8",
      ],
      [
        "PT Bank Sulutgo (Perseroda)",
        "7571000000010004",
        "WZ-OPD-7571-004",
        "0435-888999",
        "Jl. Jend. Sudirman No. 102, Kota Gorontalo",
        "Bank Sulutgo Cabang Gorontalo",
        "Desil 10",
      ],
    ],
    catatan: [
      "Kolom bertanda * WAJIB diisi",
      "NIK harus berupa 16 digit angka (sesuai KTP/KK)",
      "NPWZ bersifat opsional, akan dibuat otomatis oleh sistem jika kosong",
      "Untuk Muzakki Instansi/OPD, gunakan nama resmi instansi pada kolom Nama Lengkap dan NIK dummy sesuai format 16 digit",
      "Tingkat Desil Muzakki: gunakan nilai Desil 6 sampai Desil 10 (Muzakki adalah pemberi zakat)",
    ],
    validasi: [
      "Nama Lengkap: teks minimal 3 karakter",
      "NIK: tepat 16 digit angka, tidak boleh ada huruf atau karakter lain",
      "No WhatsApp: angka 10-15 digit, boleh menggunakan awalan 08 atau 62",
      "Instansi/OPD: harus sesuai dengan nama instansi yang sudah terdaftar",
      "Tingkat Desil: salah satu dari (Desil 6, Desil 7, Desil 8, Desil 9, Desil 10) — Muzakki wajib Desil 6–10",
    ],
  });
  writeTemplateWorkbook(wb, "Template_Import_Muzakki_BAZNAS");
}

// ── Template Import Mustahik ─────────────────────────────────────────
export function downloadTemplateMustahik(): void {
  const wb = buildTemplateWorkbook({
    namaFile: "Template_Import_Mustahik_BAZNAS",
    judul: "Template Import Data Mustahik (Penerima Manfaat)",
    deskripsi:
      "Gunakan template ini untuk menambahkan data Mustahik (calon penerima zakat) secara批量 melalui fitur Import Excel di Bidang II.",
    urutanKolom: [
      "Nama Lengkap *",
      "NIK *",
      "Kategori Asnaf *",
      "Tingkat Desil *",
      "Program Bantuan *",
      "Alamat *",
      "Kondisi / Kelayakan *",
    ],
    contohBaris: [
      [
        "Ibu Rosdiana (Janda Lansia)",
        "7571034401500001",
        "Fakir",
        "Desil 1",
        "Kesehatan",
        "Kel. Ipilo, Kota Gorontalo",
        "Lansia sebatang kara, sakit menahun butuh biaya berobat",
      ],
      [
        "Ahmad Fauzan (Santri Yatim)",
        "7571051509120003",
        "Miskin",
        "Desil 2",
        "Pendidikan",
        "Komp. Pesantren Baitul Makmur, Kota Gorontalo",
        "Santri yatim piatu berprestasi terkendala biaya SPP",
      ],
      [
        "Bpk. Abdullah Rauf (Pedagang)",
        "7571071012780004",
        "Miskin",
        "Desil 5",
        "Ekonomi",
        "Komp. Pasar Sentral, Kota Gorontalo",
        "Pedagang asongan, gerobak rusak, butuh permodalan usaha Z-Mart",
      ],
    ],
    catatan: [
      "Kolom bertanda * WAJIB diisi",
      "NIK harus berupa 16 digit angka (sesuai KTP/KK)",
      "Status kelayakan default adalah 'aktif' — ubah manual setelah verifikasi lapangan jika perlu",
    ],
    validasi: [
      "Kategori Asnaf: salah satu dari (Fakir, Miskin, Amil, Mualaf, Riqab, Gharimin, Fisabilillah, Ibnu Sabil)",
      "Tingkat Desil: salah satu dari (Desil 1, Desil 2, Desil 3, Desil 4, Desil 5) — Mustahik wajib Desil 1–5",
      "Program Bantuan: salah satu dari (Pendidikan, Kesehatan, Dakwah dan Advokasi, Ekonomi, Pendidikan Sebagian)",
      "Kondisi / Kelayakan: deskripsi singkat kondisi mustahik (50-500 karakter)",
    ],
  });
  writeTemplateWorkbook(wb, "Template_Import_Mustahik_BAZNAS");
}
