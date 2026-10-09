/**
 * Utilitas Export & Import Excel / CSV untuk BAZNAS
 */

// Format baris untuk CSV dengan escaping aman
function formatCSVRow(row: (string | number | undefined | null)[]): string {
  return row
    .map((val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    })
    .join(";"); // Pemisah titik koma standar Excel di Windows regional Indonesia
}

/**
 * Mengunduh berkas spreadsheet CSV/Excel langsung di browser
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  // Tambahkan BOM UTF-8 (\uFEFF) agar Microsoft Excel membuka aksen dan karakter huruf secara benar
  const csvContent =
    "\uFEFF" +
    formatCSVRow(headers) +
    "\r\n" +
    rows.map((row) => formatCSVRow(row)).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse teks CSV menjadi array objek
 */
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r\n|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  // Deteksi pemisah (titik koma ';' atau koma ',')
  const delimiter = lines[0].includes(";") ? ";" : ",";

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ""));
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

/**
 * Template unduh format Excel untuk Muzakki
 */
export function downloadTemplateMuzakki() {
  const headers = ["Nama Lengkap", "NIK", "NPWZ", "No WhatsApp", "Alamat", "Instansi / OPD"];
  const sampleRows = [
    [
      "Drs. H. Ahmad Sanusi, M.Pd",
      "7171012304750001",
      "WZ-7171-2024-0012",
      "081234567890",
      "Jl. Diponegoro No. 12",
      "Dinas Pendidikan Daerah",
    ],
    [
      "Hj. Fatimah Zahra, S.E",
      "7171094508820002",
      "WZ-7171-2024-0013",
      "081398765432",
      "Kel. Sario Lingkungan II",
      "Bank Sulutgo Cabang Utama",
    ],
  ];
  exportToExcel("Template_Import_Muzakki_BAZNAS", headers, sampleRows);
}

/**
 * Template unduh format Excel untuk Mustahik
 */
export function downloadTemplateMustahik() {
  const headers = [
    "Nama Lengkap",
    "NIK",
    "Kategori Asnaf",
    "Tingkat Desil",
    "Program Bantuan",
    "Alamat",
    "Kondisi / Kelayakan",
  ];
  const sampleRows = [
    [
      "Ibu Rosdiana (Janda Lansia)",
      "7171034401500001",
      "Fakir",
      "Desil 1",
      "kesehatan",
      "Kel. Sindulang Satu",
      "Lansia sebatang kara, sakit menahun butuh biaya berobat",
    ],
    [
      "Ahmad Fauzan (Santri Yatim)",
      "7171051509120003",
      "Miskin",
      "Desil 2",
      "pendidikan",
      "Komp. Pesantren Baitul Makmur",
      "Santri yatim piatu berprestasi terkendala biaya SPP",
    ],
  ];
  exportToExcel("Template_Import_Mustahik_BAZNAS", headers, sampleRows);
}
