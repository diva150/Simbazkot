"use client";

import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle } from "lucide-react";
import { parseCSV } from "@/lib/excel-utils";

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

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const { headers, rows } = parseCSV(text);
        if (headers.length === 0 || rows.length === 0) {
          setErrorMsg("File tidak memiliki baris data yang valid.");
          return;
        }
        setParsedHeaders(headers);
        setParsedRows(rows);
      } catch (err) {
        setErrorMsg("Gagal membaca berkas CSV/Excel. Pastikan format file sesuai.");
      }
    };
    reader.readAsText(selected);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportData(parsedRows);
    onClose();
    setFile(null);
    setParsedRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-100 p-2 text-baznas-green-800">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins">{title}</h3>
              <p className="text-xs text-slate-500">Unggah berkas spreadsheet CSV atau Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Download Template Box */}
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div>
              <p className="text-xs font-bold text-amber-900 font-poppins">Gunakan Template Standar</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Unduh format template resmi agar susunan kolom sesuai dengan sistem BAZNAS.
              </p>
            </div>
            <button
              onClick={onDownloadTemplate}
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Template Excel
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition-colors">
            <input
              type="file"
              accept=".csv, .txt, .xls, .xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="mx-auto h-10 w-10 text-baznas-green-700 mb-2" />
            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : "Klik atau seret file CSV / Excel ke sini"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Mendukung format .csv atau .xlsx</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table Data Terbaca */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Pratinjau Data ({parsedRows.length} baris terdeteksi)
                </span>
              </div>
              <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-8 text-center">No</th>
                      {(parsedHeaders.length > 0 ? parsedHeaders : sampleHeaders).map((h, i) => (
                        <th key={i} className="p-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap text-slate-800">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-[11px] text-slate-400 text-right italic">
                  *Menampilkan 5 dari {parsedRows.length} baris data.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            type="button"
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors ${
              parsedRows.length === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-baznas-green-800 hover:bg-baznas-green-700 shadow-baznas-green-800/20"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Import {parsedRows.length} Baris Data
          </button>
        </div>
      </div>
    </div>
  );
};
