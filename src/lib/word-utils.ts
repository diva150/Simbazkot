import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  Footer,
  PageNumber,
  LineRuleType,
} from "docx";

// BAZNAS official colors (Office 2021 / Word 2021 standard)
const BAZNAS_GREEN = "016836";   // primary brand color
const BAZNAS_GOLD = "F59E0B";    // accent (for badges, decorative only)
const TEXT_DARK = "1A1A1A";
const TEXT_MUTED = "555555";

export interface WordLetterData {
  nomorSurat: string;
  sifat?: string;
  lampiran?: string;
  perihal: string;
  tanggalSurat: string;
  tujuanSurat: string;
  lokasiTujuan?: string;
  isiPembuka: string;
  isiUtama: string;
  isiPenutup: string;
  jabatanPenandatangan: string;
  namaPenandatangan: string;
  tembusan?: string[];
  // Optional: BAZNAS branch info (customizable per cabang)
  kopBaris1?: string; // Default: "BADAN AMIL ZAKAT NASIONAL"
  kopBaris2?: string; // Default: "KANTOR PERWAKILAN BAZNAS DAERAH"
  kopAlamat?: string; // Default: official BAZNAS address
}

const DEFAULT_KOP_BARIS_1 = "BADAN AMIL ZAKAT NASIONAL";
const DEFAULT_KOP_BARIS_2 = "KANTOR PERWAKILAN BAZNAS DAERAH";
const DEFAULT_KOP_ALAMAT =
  "Alamat: Jl. Nani Wartabone No. 88, Kota Gorontalo • Telp: (0435) 826789 • WA: 0812-4567-8901\nEmail: layanan@baznas.go.id • Website: https://baznas.go.id";

// ── Borderless cell helper ────────────────────────────────────────────
const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function borderlessCell(
  children: Paragraph[],
  widthPct: number,
  options: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; vAlign?: "top" | "center" | "bottom" } = {}
): TableCell {
  return new TableCell({
    children,
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: noBorder,
    verticalAlign: options.vAlign ?? "top",
  });
}

// ── Build a single paragraph with optional indentation ─────────────────
function p(text: string, options: {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number; // half-points: 24 = 12pt
  color?: string;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  indentFirstLine?: number; // twips (1cm = 567 twips)
  spacingAfter?: number;
  spacingBefore?: number;
  font?: string;
} = {}): Paragraph {
  return new Paragraph({
    alignment: options.align,
    spacing: {
      after: options.spacingAfter,
      before: options.spacingBefore,
      line: 276, // 1.15 line spacing (240 = single, 276 = 1.15x, 360 = 1.5x)
      lineRule: LineRuleType.AUTO,
    },
    indent: options.indentFirstLine
      ? { firstLine: options.indentFirstLine }
      : undefined,
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italic,
        underline: options.underline ? {} : undefined,
        size: options.size ?? 24, // 12pt default
        color: options.color ?? TEXT_DARK,
        font: options.font ?? "Times New Roman",
      }),
    ],
  });
}

function emptyParagraph(spacingAfter = 0): Paragraph {
  return new Paragraph({
    spacing: { after: spacingAfter, line: 276, lineRule: LineRuleType.AUTO },
    children: [new TextRun({ text: "", size: 24, font: "Times New Roman" })],
  });
}

// ── Main exporter ─────────────────────────────────────────────────────
export async function exportLetterToWord(
  filename: string,
  data: WordLetterData
): Promise<void> {
  const cleanFilename = filename.endsWith(".docx")
    ? filename
    : filename.replace(/\.doc$/, "") + ".docx";

  // Build document sections
  const sections: Paragraph[] = [];

  // ── KOP SURAT ─────────────────────────────────────────────────────
  sections.push(
    p(data.kopBaris1 ?? DEFAULT_KOP_BARIS_1, {
      bold: true,
      size: 32, // 16pt
      color: BAZNAS_GREEN,
      align: AlignmentType.CENTER,
      spacingAfter: 40,
      spacingBefore: 0,
    })
  );
  sections.push(
    p(data.kopBaris2 ?? DEFAULT_KOP_BARIS_2, {
      bold: true,
      size: 24, // 12pt
      align: AlignmentType.CENTER,
      spacingAfter: 60,
    })
  );

  // Kop address (multi-line: split by \n)
  const addressLines = (data.kopAlamat ?? DEFAULT_KOP_ALAMAT).split("\n");
  addressLines.forEach((line, i) => {
    sections.push(
      p(line, {
        size: 18, // 9pt
        color: TEXT_MUTED,
        align: AlignmentType.CENTER,
        spacingAfter: i === addressLines.length - 1 ? 80 : 20,
      })
    );
  });

  // Kop double-line divider (simulated using paragraph border)
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: 80, lineRule: LineRuleType.EXACT },
      border: {
        top: { style: BorderStyle.SINGLE, size: 18, color: TEXT_DARK }, // 3pt
      },
      children: [new TextRun({ text: "", size: 4, font: "Times New Roman" })],
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240, line: 40, lineRule: LineRuleType.EXACT },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: TEXT_DARK }, // 1pt
      },
      children: [new TextRun({ text: "", size: 4, font: "Times New Roman" })],
    })
  );

  // ── META TABLE (Nomor, Sifat, Lampiran, Perihal, Tanggal) ─────────
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        borderlessCell([p("Nomor", { size: 22 })], 12),
        borderlessCell([p(":", { size: 22 })], 3),
        borderlessCell([p(data.nomorSurat, { bold: true, size: 22 })], 45),
        borderlessCell([p(data.tanggalSurat, { size: 22, align: AlignmentType.RIGHT })], 40),
      ],
    }),
    new TableRow({
      children: [
        borderlessCell([p("Sifat", { size: 22 })], 12),
        borderlessCell([p(":", { size: 22 })], 3),
        borderlessCell([p(data.sifat ?? "Penting / Segera", { size: 22 })], 85),
      ],
    }),
    new TableRow({
      children: [
        borderlessCell([p("Lampiran", { size: 22 })], 12),
        borderlessCell([p(":", { size: 22 })], 3),
        borderlessCell([p(data.lampiran ?? "1 (Satu) Berkas", { size: 22 })], 85),
      ],
    }),
    new TableRow({
      children: [
        borderlessCell([p("Perihal", { size: 22 })], 12),
        borderlessCell([p(":", { size: 22 })], 3),
        borderlessCell([p(data.perihal, { bold: true, size: 22 })], 85),
      ],
    }),
  ];

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: metaRows,
  });

  sections.push(metaTable as unknown as Paragraph);
  sections.push(emptyParagraph(200));

  // ── TUJUAN SURAT ──────────────────────────────────────────────────
  sections.push(p("Kepada Yth.", { size: 22, spacingAfter: 0 }));
  sections.push(
    p(data.tujuanSurat, { bold: true, size: 22, spacingAfter: 0 })
  );
  sections.push(p("di -", { size: 22, spacingAfter: 0 }));
  sections.push(
    p(data.lokasiTujuan ?? "Tempat", {
      size: 22,
      underline: true,
      spacingAfter: 240,
    })
  );

  // ── ISI SURAT ─────────────────────────────────────────────────────
  // Opening salam
  sections.push(
    p("Assalamu'alaikum Warahmatullahi Wabarakatuh,", {
      bold: true,
      italic: true,
      size: 24,
      spacingAfter: 200,
    })
  );

  // Body paragraphs (each with first-line indent for surat resmi style)
  sections.push(
    p(data.isiPembuka, { size: 24, indentFirstLine: 850, align: AlignmentType.JUSTIFIED })
  );
  sections.push(
    p(data.isiUtama, { size: 24, indentFirstLine: 850, align: AlignmentType.JUSTIFIED })
  );
  sections.push(
    p(data.isiPenutup, { size: 24, indentFirstLine: 850, align: AlignmentType.JUSTIFIED })
  );

  // Standard closing
  sections.push(
    p(
      "Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik diucapkan terima kasih.",
      { size: 24, align: AlignmentType.JUSTIFIED, spacingAfter: 200 }
    )
  );
  sections.push(
    p("Wassalamu'alaikum Warahmatullahi Wabarakatuh.", {
      bold: true,
      italic: true,
      size: 24,
      spacingAfter: 240,
    })
  );

  // ── TANDA TANGAN ──────────────────────────────────────────────────
  // Right-aligned signature block with fixed positioning
  const sigCell = borderlessCell(
    [
      p("BADAN AMIL ZAKAT NASIONAL (BAZNAS)", { size: 22, align: AlignmentType.CENTER }),
      p(data.jabatanPenandatangan, { bold: true, size: 22, align: AlignmentType.CENTER }),
      emptyParagraph(),
      emptyParagraph(),
      emptyParagraph(),
      p(data.namaPenandatangan, { bold: true, underline: true, size: 24, align: AlignmentType.CENTER }),
      p("NIP / SK Resmi BAZNAS", { size: 18, color: TEXT_MUTED, align: AlignmentType.CENTER }),
    ],
    100,
    { vAlign: "top" }
  );

  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          borderlessCell([], 50),
          sigCell,
        ],
      }),
    ],
  });

  sections.push(sigTable as unknown as Paragraph);
  sections.push(emptyParagraph(400));

  // ── TEMBUSAN ──────────────────────────────────────────────────────
  sections.push(
    p("Tembusan disampaikan kepada:", { bold: true, underline: true, size: 20, spacingAfter: 60 })
  );

  const tembusanList =
    data.tembusan && data.tembusan.length > 0
      ? data.tembusan
      : ["Arsip Sekretariat BAZNAS"];

  tembusanList.forEach((t) => {
    sections.push(p(`${t}`, { size: 20, indentFirstLine: 200, spacingAfter: 30 }));
  });

  // ── BUILD DOCUMENT ────────────────────────────────────────────────
  const doc = new Document({
    creator: "BAZNAS Sistem Informasi",
    title: data.perihal,
    description: `Surat resmi BAZNAS - ${data.nomorSurat}`,
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
            color: TEXT_DARK,
          },
        },
        heading1: {
          run: { font: "Times New Roman", size: 32, bold: true, color: BAZNAS_GREEN },
        },
        heading2: {
          run: { font: "Times New Roman", size: 28, bold: true, color: BAZNAS_GREEN },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips (21cm)
              height: 16838, // A4 height in twips (29.7cm)
              orientation: "portrait",
            },
            margin: {
              top: convertInchesToTwip(1.0),      // 2.54cm (Indonesian letter standard)
              right: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.0),
              header: convertInchesToTwip(0.5),
              footer: convertInchesToTwip(0.5),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: ["Halaman ", PageNumber.CURRENT, " dari ", PageNumber.TOTAL_PAGES],
                    size: 16, // 8pt
                    color: TEXT_MUTED,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  });

  // Generate and download the .docx file
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Synchronous fallback: use the HTML-based approach for older browsers
// This is kept for compatibility but the new async path is preferred.
export function exportLetterToWordLegacy(
  filename: string,
  data: WordLetterData
): void {
  const cleanFilename = filename.endsWith(".doc") ? filename : `${filename}.doc`;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.perihal}</title>
      <style>
        @page {
          size: 21.0cm 29.7cm;
          margin: 2.54cm 2.54cm 2.54cm 2.54cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000000;
        }
        .header-kop { text-align: center; margin-bottom: 5px; }
        .kop-logo-title {
          font-size: 16pt;
          font-weight: bold;
          color: ${BAZNAS_GREEN};
          letter-spacing: 1px;
          margin: 0;
          padding: 0;
          text-transform: uppercase;
        }
        .kop-sub { font-size: 12pt; font-weight: bold; margin: 2px 0; text-transform: uppercase; }
        .kop-address { font-size: 9pt; color: #444; margin: 0; line-height: 1.3; }
        .kop-divider-double {
          border-top: 3px solid #000;
          border-bottom: 1px solid #000;
          height: 3px;
          margin-top: 8px;
          margin-bottom: 20px;
        }
        table.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.meta-table td { vertical-align: top; padding: 2px 0; }
        .content-body { text-align: justify; margin-bottom: 15px; line-height: 1.6; }
        .content-body p { margin: 0 0 10px 0; text-indent: 35px; }
        .content-body p.no-indent { text-indent: 0; }
        .signature-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
        .signature-table td { vertical-align: top; text-align: center; }
        .sig-name { font-weight: bold; text-decoration: underline; margin-top: 70px; display: block; }
        .tembusan { margin-top: 30px; font-size: 10pt; }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <h1 class="kop-logo-title">${data.kopBaris1 ?? DEFAULT_KOP_BARIS_1}</h1>
        <div class="kop-sub">${data.kopBaris2 ?? DEFAULT_KOP_BARIS_2}</div>
        <p class="kop-address">${(data.kopAlamat ?? DEFAULT_KOP_ALAMAT).replace(/\n/g, "<br>")}</p>
        <div class="kop-divider-double"></div>
      </div>
      <table class="meta-table">
        <tr>
          <td style="width: 12%;">Nomor</td>
          <td style="width: 3%;">:</td>
          <td style="width: 45%; font-weight: bold;">${data.nomorSurat}</td>
          <td style="width: 40%; text-align: right;">${data.tanggalSurat}</td>
        </tr>
        <tr><td>Sifat</td><td>:</td><td>${data.sifat || "Penting / Segera"}</td><td></td></tr>
        <tr><td>Lampiran</td><td>:</td><td>${data.lampiran || "1 (Satu) Berkas"}</td><td></td></tr>
        <tr><td>Perihal</td><td>:</td><td><strong>${data.perihal}</strong></td><td></td></tr>
      </table>
      <div style="margin-bottom: 20px;">
        Kepada Yth.<br>
        <strong>${data.tujuanSurat}</strong><br>
        di -<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<u>${data.lokasiTujuan || "Tempat"}</u>
      </div>
      <div class="content-body">
        <p class="no-indent"><strong><em>Assalamu'alaikum Warahmatullahi Wabarakatuh,</em></strong></p>
        <p>${data.isiPembuka}</p>
        <p>${data.isiUtama}</p>
        <p>${data.isiPenutup}</p>
        <p class="no-indent">Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik diucapkan terima kasih.</p>
        <p class="no-indent"><strong><em>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</em></strong></p>
      </div>
      <table class="signature-table">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%;">
            <div>BADAN AMIL ZAKAT NASIONAL (BAZNAS)</div>
            <div><strong>${data.jabatanPenandatangan}</strong></div>
            <br><br><br>
            <span class="sig-name">${data.namaPenandatangan}</span>
            <div style="font-size: 10pt; color: #555;">NIP / SK Resmi BAZNAS</div>
          </td>
        </tr>
      </table>
      ${
        data.tembusan && data.tembusan.length > 0
          ? `<div class="tembusan"><strong><u>Tembusan:</u></strong><ol>${data.tembusan.map((t) => `<li>${t}</li>`).join("")}</ol></div>`
          : `<div class="tembusan"><small><u>Tembusan:</u> 1. Arsip Sekretariat BAZNAS</small></div>`
      }
    </body>
  </html>`;

  const blob = new Blob(["﻿", htmlContent], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
