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
}

export function exportLetterToWord(filename: string, data: WordLetterData): void {
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
          size: 21.0cm 29.7cm; /* A4 */
          margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000000;
        }
        .header-kop {
          text-align: center;
          margin-bottom: 5px;
        }
        .kop-logo-title {
          font-size: 16pt;
          font-weight: bold;
          color: #016836;
          letter-spacing: 1px;
          margin: 0;
          padding: 0;
          text-transform: uppercase;
        }
        .kop-sub {
          font-size: 12pt;
          font-weight: bold;
          margin: 2px 0;
          color: #1a1a1a;
          text-transform: uppercase;
        }
        .kop-address {
          font-size: 9pt;
          color: #444444;
          margin: 0;
          line-height: 1.3;
        }
        .kop-divider-double {
          border-top: 3px solid #000000;
          border-bottom: 1px solid #000000;
          height: 3px;
          margin-top: 8px;
          margin-bottom: 20px;
        }
        table.meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11pt;
        }
        table.meta-table td {
          vertical-align: top;
          padding: 2px 0;
        }
        .content-body {
          text-align: justify;
          text-justify: inter-word;
          margin-bottom: 15px;
          line-height: 1.6;
          font-size: 12pt;
        }
        .content-body p {
          margin: 0 0 10px 0;
          text-indent: 35px;
        }
        .content-body p.no-indent {
          text-indent: 0;
        }
        .signature-table {
          width: 100%;
          margin-top: 30px;
          border-collapse: collapse;
        }
        .signature-table td {
          vertical-align: top;
          text-align: center;
        }
        .sig-name {
          font-weight: bold;
          text-decoration: underline;
          margin-top: 70px;
          display: block;
        }
        .sig-title {
          font-size: 11pt;
        }
        .tembusan {
          margin-top: 30px;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <!-- KOP SURAT RESMI BAZNAS -->
      <div class="header-kop">
        <h1 class="kop-logo-title">BADAN AMIL ZAKAT NASIONAL</h1>
        <div class="kop-sub">KANTOR PERWAKILAN BAZNAS DAERAH</div>
        <p class="kop-address">
          Alamat: Jl. Raya Trans BAZNAS No. 123 • Telp: (0431) 889900 • WA: 0812-4567-8901<br>
          Email: layanan@baznas.go.id • Website: https://baznas.go.id
        </p>
        <div class="kop-divider-double"></div>
      </div>

      <!-- KETERANGAN NOMOR & TUJUAN -->
      <table class="meta-table">
        <tr>
          <td style="width: 12%;">Nomor</td>
          <td style="width: 3%;">:</td>
          <td style="width: 45%; font-weight: bold;">${data.nomorSurat}</td>
          <td style="width: 40%; text-align: right;">${data.tanggalSurat}</td>
        </tr>
        <tr>
          <td>Sifat</td>
          <td>:</td>
          <td>${data.sifat || "Penting / Segera"}</td>
          <td></td>
        </tr>
        <tr>
          <td>Lampiran</td>
          <td>:</td>
          <td>${data.lampiran || "1 (Satu) Berkas"}</td>
          <td></td>
        </tr>
        <tr>
          <td>Perihal</td>
          <td>:</td>
          <td><strong>${data.perihal}</strong></td>
          <td></td>
        </tr>
      </table>

      <!-- TUJUAN SURAT -->
      <div style="margin-bottom: 20px; font-size: 11pt;">
        Kepada Yth.<br>
        <strong>${data.tujuanSurat}</strong><br>
        di -<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<u>${data.lokasiTujuan || "Tempat"}</u>
      </div>

      <!-- ISI SURAT -->
      <div class="content-body">
        <p class="no-indent"><strong><em>Assalamu'alaikum Warahmatullahi Wabarakatuh,</em></strong></p>
        
        <p>${data.isiPembuka}</p>
        
        <p>${data.isiUtama}</p>
        
        <p>${data.isiPenutup}</p>

        <p class="no-indent">Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik diucapkan terima kasih.</p>
        
        <p class="no-indent"><strong><em>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</em></strong></p>
      </div>

      <!-- TANDA TANGAN -->
      <table class="signature-table">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%;">
            <div>BADAN AMIL ZAKAT NASIONAL (BAZNAS)</div>
            <div class="sig-title"><strong>${data.jabatanPenandatangan}</strong></div>
            <br><br><br>
            <span class="sig-name">${data.namaPenandatangan}</span>
            <div style="font-size: 10pt; color: #555;">NIP / SK Resmi BAZNAS</div>
          </td>
        </tr>
      </table>

      <!-- TEMBUSAN -->
      ${
        data.tembusan && data.tembusan.length > 0
          ? `
        <div class="tembusan">
          <strong><u>Tembusan disampaikan kepada:</u></strong>
          <ol style="margin-top: 3px; padding-left: 20px;">
            ${data.tembusan.map((t) => `<li>${t}</li>`).join("")}
          </ol>
        </div>
      `
          : `
        <div class="tembusan">
          <small><u>Tembusan:</u> 1. Arsip Sekretariat BAZNAS</small>
        </div>
      `
      }
    </body>
    </html>
  `;

  // Create Blob with Word MIME type and download
  const blob = new Blob(["\ufeff", htmlContent], {
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
