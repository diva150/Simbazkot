"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onDownloadTemplate: () => void;
  onImportData: (parsedRows: string[][]) => void;
  sampleHeaders: string[];
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  title,
  onDownloadTemplate,
  onImportData,
  sampleHeaders,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setParsedHeaders([]);
    setParsedRows([]);
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsParsing(true);

    try {
      const { parseSpreadsheet } = await import("@/lib/excel-utils");
      const result = await parseSpreadsheet(selected);
      if (result.headers.length === 0 || result.rows.length === 0) {
        setErrorMsg("File tidak memiliki baris data yang valid.");
        return;
      }
      setParsedHeaders(result.headers);
      setParsedRows(result.rows);
    } catch (err) {
      // The error is surfaced to the user via setErrorMsg below — no need
      // to also log to the console.
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal membaca berkas. Pastikan format file adalah .xlsx yang valid."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportData(parsedRows);
    onClose();
    setFile(null);
    setParsedRows([]);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={title}
      size="full"
      showCloseButton={false}
      panelClassName="max-w-2xl bg-white border border-baznas-ink-8 shadow-lift"
    >
        {/* Header Modal — paper, no gradient, no rounded */}
        <div className="flex items-center justify-between border-b border-baznas-ink-8 bg-baznas-paper px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="border border-baznas-gold-display p-2 text-baznas-green-900">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-baznas-ink font-poppins">{title}</h3>
              <p className="text-[11px] text-baznas-ink/55 mt-0.5">
                Unggah berkas Microsoft Excel (.xlsx) dari template resmi BAZNAS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center text-baznas-ink/45 hover:text-baznas-ink hover:bg-baznas-ink-8 h-t-target w-t-target transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Download Template Box — gold accent, no amber pastel */}
          <div className="flex items-center justify-between bg-baznas-paper/60 border-l-4 border-baznas-gold-display p-4">
            <div>
              <p className="text-[11px] font-bold text-baznas-ink uppercase tracking-wider font-poppins">
                Gunakan Template Standar
              </p>
              <p className="text-[11px] text-baznas-ink/65 mt-0.5">
                Unduh format template resmi agar susunan kolom sesuai dengan sistem BAZNAS.
              </p>
            </div>
            <Button
              onClick={onDownloadTemplate}
              variant="secondary"
              size="md"
              icon={<Download className="h-3.5 w-3.5" />}
            >
              Template Excel
            </Button>
          </div>

          {/* Upload Drop Area — border-2 dashed, calm */}
          <div className="relative border-2 border-dashed border-baznas-ink-20 bg-baznas-paper/30 p-6 text-center hover:border-baznas-green-800 transition-colors">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Pilih file Excel untuk diimpor"
            />
            <UploadCloud className="mx-auto h-10 w-10 text-baznas-green-800 mb-2" />
            <p className="text-sm font-bold text-baznas-ink">
              {isParsing
                ? "Membaca file..."
                : file
                ? file.name
                : "Klik atau seret file .xlsx ke sini"}
            </p>
            <p className="text-[11px] text-baznas-ink/45 mt-1">
              Hanya mendukung format Microsoft Excel (.xlsx) dari template resmi
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2 border-l-4 border-baznas-error-700 bg-baznas-error-50 p-3 text-xs text-baznas-error-900">
              <AlertCircle className="h-4 w-4 shrink-0 text-baznas-error-700 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-baznas-ink uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-baznas-green-800" />
                  Pratinjau Data ({parsedRows.length} baris terdeteksi)
                </span>
              </div>
              <div className="max-h-48 overflow-auto border border-baznas-ink-8 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-baznas-paper text-baznas-ink/70 sticky top-0 font-bold text-[11px] uppercase tracking-wider border-b border-baznas-ink-8">
                    <tr>
                      <th className="p-2 w-8 text-center">No</th>
                      {(parsedHeaders.length > 0 ? parsedHeaders : sampleHeaders).map((h, i) => (
                        <th key={i} className="p-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-baznas-ink-8">
                    {parsedRows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-baznas-paper/30">
                        <td className="p-2 text-center text-baznas-ink/40">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap text-baznas-ink">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-[11px] text-baznas-ink/45 text-right italic">
                  *Menampilkan 5 dari {parsedRows.length} baris data.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-baznas-ink-8 bg-baznas-paper/40 px-6 py-3">
          <Button onClick={onClose} variant="secondary" size="md">
            Batal
          </Button>
          <Button
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            Import {parsedRows.length} Baris Data
          </Button>
        </div>
    </Dialog>
  );
};

export default ImportExcelModal;
