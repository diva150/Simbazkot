"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Plus,
  X,
  XCircle,
} from "lucide-react";
import { PermohonanPencairan, KategoriPilarBidang2, SubProgramPendayagunaan, SubProgramPendistribusian } from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { generateSpkNumber } from "@/lib/id";
import { Dialog } from "@/components/common";
import { SUB_PROGRAM_DISTRIBUSI, SUB_PROGRAM_DAYAGUNAAN } from "./types";

/**
 * PencairanTab — 2-stage SPK (Surat Perintah Kerja) approval workflow.
 *
 *   Pengajuan Bidang II → Disetujui Ketua → Dikonfirmasi Bidang II → Cair ke Bidang III
 *
 * Tab-local state: the "new SPK" modal (showModalNew + form fields).
 * Status changes flow up to the parent via onApprove/onReject/onConfirm callbacks.
 */
interface PencairanTabProps {
  pencairanList: PermohonanPencairan[];
  onConfirmPencairan?: (id: string) => void;
  onAddPencairan: (p: PermohonanPencairan) => void;
  onRejectPencairan: (id: string, reason: string) => void;
}

export const PencairanTab: React.FC<PencairanTabProps> = ({
  pencairanList,
  onConfirmPencairan,
  onAddPencairan,
  onRejectPencairan,
}) => {
  const [showModalNew, setShowModalNew] = useState(false);
  const [namaProgram, setNamaProgram] = useState("");
  const [kategoriBesar, setKategoriBesar] = useState<KategoriPilarBidang2>("pendistribusian");
  const [subProgram, setSubProgram] = useState<SubProgramPendistribusian | SubProgramPendayagunaan>("Pendidikan");
  const [nominal, setNominal] = useState(5_000_000);
  const [jumlahMustahik, setJumlahMustahik] = useState(5);
  const [keterangan, setKeterangan] = useState("");
  // Double-submit guard (mirror of pattern from Phase 5).
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKategoriBesarChange = (newKat: KategoriPilarBidang2) => {
    setKategoriBesar(newKat);
    setSubProgram(
      newKat === "pendistribusian"
        ? SUB_PROGRAM_DISTRIBUSI[0]
        : SUB_PROGRAM_DAYAGUNAAN[0]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!namaProgram.trim()) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const newP: PermohonanPencairan = {
      id: `penc-${Date.now()}`,
      nomorSPK: generateSpkNumber(),
      namaProgram: namaProgram.trim(),
      kategoriBesar,
      namaSubProgram: subProgram,
      nominal,
      jumlahMustahik,
      pemohon: "Amil Bidang II",
      status: "diajukan",
      tanggal: getLocalDateString(),
      keterangan: keterangan.trim(),
    };
    onAddPencairan(newP);
    setShowModalNew(false);
    setNamaProgram("");
    setKeterangan("");
    setTimeout(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }, 0);
  };

  return (
    <>
      <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-baznas-ink font-poppins">
              Alur Persetujuan Pencairan Dana Bantuan (SPK)
            </h3>
            <p className="text-xs text-baznas-ink/55">
              Alur resmi 2 tahap: Pengajuan Bidang II ➔ Disetujui Ketua BAZNAS ➔ Dikonfirmasi Kembali oleh Bidang II ➔ Diteruskan ke Kas Bidang III
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModalNew(true)}
            className="flex items-center gap-1.5 rounded-xl bg-baznas-error-700 px-4 py-2.5 text-xs font-semibold text-white shadow-rest hover:bg-baznas-error-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Buat Pengajuan Baru (SPK)
          </button>
        </div>

        {/* Diagram Alur SPK */}
        <div className="rounded-md border border-baznas-ink-8 bg-baznas-paper/30 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-baznas-ink/45 block mb-2">
            Siklus Alur Otorisasi SPK:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-md border border-baznas-ink-8">
              <span className="font-bold text-baznas-warning-700 block">1. Diajukan</span>
              <span className="text-[10px] text-baznas-ink/55">Oleh Amil Bidang II</span>
            </div>
            <div className="bg-white p-2.5 rounded-md border border-baznas-ink-12">
              <span className="font-bold text-baznas-ink block">2. Disetujui Ketua</span>
              <span className="text-[10px] text-baznas-ink/55">Ketua Mohamad Husain Rauf</span>
            </div>
            <div className="bg-white p-2.5 rounded-md border border-baznas-green-200">
              <span className="font-bold text-baznas-green-800 block">3. Dikonfirmasi Bidang II</span>
              <span className="text-[10px] text-baznas-ink/55">Verifikasi Berkas Akhir</span>
            </div>
            <div className="bg-white p-2.5 rounded-md border border-baznas-ink-8">
              <span className="font-bold text-baznas-ink block">4. Cair ke Bidang III</span>
              <span className="text-[10px] text-baznas-ink/55">Transfer Kas Bendahara</span>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-2">
          {pencairanList.map((p) => {
            const isPendingKetua = p.status === "diajukan";
            const isApprovedKetua = p.status === "disetujui_ketua";
            const isConfirmedBidang2 = p.status === "dikonfirmasi_bidang2";
            const isRejected = p.status === "ditolak";

            return (
              <div
                key={p.id}
                className={`rounded-md border p-8 transition-all ${
                  isPendingKetua
                    ? "border border-baznas-ink-20 bg-baznas-paper/30"
                    : isApprovedKetua
                    ? "border border-baznas-ink-20 bg-baznas-paper/30"
                    : isConfirmedBidang2
                    ? "border border-baznas-ink-20 bg-baznas-paper/30"
                    : "border-baznas-error-200 bg-baznas-paper/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-baznas-ink/80">
                        {p.nomorSPK}
                      </span>

                      {isPendingKetua && (
                        <span className="inline-block bg-baznas-paper border border-baznas-warning-300 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Menunggu Persetujuan Ketua BAZNAS
                        </span>
                      )}

                      {isApprovedKetua && (
                        <span className="inline-block bg-baznas-paper border border-baznas-ink-20 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Disetujui Ketua — Siap Dikonfirmasi Bidang II
                        </span>
                      )}

                      {isConfirmedBidang2 && (
                        <span className="inline-block bg-baznas-paper border border-baznas-green-300 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Dikonfirmasi Bidang II (Siap Diberikan)
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-block bg-baznas-paper border border-baznas-error-300 text-baznas-ink px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Ditolak
                        </span>
                      )}

                      <span className="inline-block bg-baznas-paper/40 px-2 py-0.5 text-[10px] font-bold text-baznas-ink/80 uppercase">
                        {p.kategoriBesar === "pendistribusian" ? "Pendistribusian" : "Pendayagunaan"} • {p.namaSubProgram}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-baznas-ink font-poppins">
                      {p.namaProgram}
                    </h4>
                    <p className="text-xs text-baznas-ink/65">{p.keterangan}</p>

                    <p className="text-[11px] text-baznas-ink/55">
                      Target: <strong>{p.jumlahMustahik} Mustahik</strong> • Tanggal: {p.tanggal}
                      {p.approver && ` • Disetujui oleh: ${p.approver}`}
                      {p.catatanPenolakan && (
                        <span className="text-baznas-ink font-semibold block mt-0.5">
                          Alasan Penolakan: {p.catatanPenolakan}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3">
                    <span className="text-base font-bold text-baznas-green-900 font-poppins">
                      {formatRupiah(p.nominal)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isPendingKetua && (
                        <button
                          type="button"
                          onClick={() => onRejectPencairan(p.id, "")}
                          className="text-[11px] text-baznas-error-700 bg-baznas-paper border border-baznas-error-300 px-2.5 py-1 hover:bg-baznas-error-50"
                        >
                          Tarik Pengajuan
                        </button>
                      )}

                      {isApprovedKetua && onConfirmPencairan && (
                        <button
                          type="button"
                          onClick={() => onConfirmPencairan(p.id)}
                          className="flex items-center gap-1.5 rounded-md bg-baznas-ink hover:bg-baznas-ink/90 px-3.5 py-2.5 text-xs font-bold text-white transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Konfirmasi Pencairan Dana
                        </button>
                      )}

                      {isConfirmedBidang2 && (
                        <span className="text-[11px] font-bold text-baznas-green-900 bg-baznas-paper border border-baznas-ink-12 px-2.5 py-1">
                          Terkonfirmasi Lengkap
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New SPK Modal */}
      {showModalNew && (
        <Dialog
          open={showModalNew}
          onClose={() => setShowModalNew(false)}
          title="Formulir Pengajuan SPK Pencairan Baru"
          size="lg"
          showCloseButton={false}
          panelClassName="max-w-lg bg-white border border-baznas-ink-8 shadow-lift"
        >
          <div className="flex items-center justify-between border-b border-baznas-ink-8 bg-baznas-green-900 px-6 py-4">
            <h3 className="text-base font-bold font-poppins text-white">
              Formulir Pengajuan SPK Pencairan Baru
            </h3>
            <button
              type="button"
              onClick={() => setShowModalNew(false)}
              className="inline-flex h-t-target w-t-target items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8 text-xs">
            <div>
              <label className="block font-bold text-baznas-ink/80 mb-1">
                Nama Program Kerja Penyaluran *
              </label>
              <input
                type="text"
                required
                value={namaProgram}
                onChange={(e) => setNamaProgram(e.target.value)}
                className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                placeholder="Contoh: Beasiswa Santri Yatim 2026"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">
                  Kategori Besar *
                </label>
                <select
                  value={kategoriBesar}
                  onChange={(e) => handleKategoriBesarChange(e.target.value as KategoriPilarBidang2)}
                  className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                >
                  <option value="pendistribusian">Pendistribusian (Konsumtif)</option>
                  <option value="pendayagunaan">Pendayagunaan (Produktif)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">
                  Sub Program *
                </label>
                <select
                  value={subProgram}
                  onChange={(e) => setSubProgram(e.target.value as SubProgramPendistribusian | SubProgramPendayagunaan)}
                  className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                >
                  {(kategoriBesar === "pendistribusian" ? SUB_PROGRAM_DISTRIBUSI : SUB_PROGRAM_DAYAGUNAAN).map((sp) => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">
                  Nominal Dana (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min={100_000}
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>

              <div>
                <label className="block font-bold text-baznas-ink/80 mb-1">
                  Jumlah Mustahik *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={jumlahMustahik}
                  onChange={(e) => setJumlahMustahik(Number(e.target.value))}
                  className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-baznas-ink/80 mb-1">
                Keterangan / Justifikasi
              </label>
              <textarea
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full rounded-md border border-baznas-ink-8 bg-white p-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
                placeholder="Penjelasan singkat program..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-baznas-ink-8">
              <button
                type="button"
                onClick={() => setShowModalNew(false)}
                className="px-4 py-2.5 text-xs font-semibold text-baznas-ink/80 hover:text-baznas-ink"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-baznas-error-700 hover:bg-baznas-error-800 px-5 py-2.5 text-xs font-bold text-white shadow-rest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim Pengajuan ke Ketua
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
};

export default PencairanTab;
