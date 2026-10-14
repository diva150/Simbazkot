"use client";

import React, { useState } from "react";
import { LPJEntry } from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, FileText } from "lucide-react";

interface LPJTabProps {
  lpjList: LPJEntry[];
  onAdd: (e: LPJEntry) => void;
  onUpdate: (e: LPJEntry) => void;
  onDelete: (id: string) => void;
}

const emptyForm: Omit<LPJEntry, "id"> = {
  nomorLPJ: "",
  programNama: "",
  bidang: "Bidang III",
  tanggalLPJ: getLocalDateString(),
  totalPenyaluran: 0,
  totalPenerimaan: 0,
  status: "draft",
  keterangan: "",
  lampiranUrl: "",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-baznas-paper text-baznas-ink/70 border border-baznas-ink-8",
  diajukan: "bg-baznas-paper border border-baznas-gold-display text-baznas-ink",
  disetujui: "bg-baznas-paper text-baznas-green-900 border border-baznas-green-800",
  ditolak: "bg-baznas-error-50 text-baznas-error-900 border border-baznas-error-700",
};

export const LPJTab: React.FC<LPJTabProps> = ({ lpjList, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LPJEntry, "id">>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<LPJEntry | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: LPJEntry) => {
    setEditingId(e.id);
    setForm({
      nomorLPJ: e.nomorLPJ,
      programNama: e.programNama,
      bidang: e.bidang,
      tanggalLPJ: e.tanggalLPJ,
      totalPenyaluran: e.totalPenyaluran,
      totalPenerimaan: e.totalPenerimaan,
      status: e.status,
      keterangan: e.keterangan,
      lampiranUrl: e.lampiranUrl || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomorLPJ.trim() || !form.programNama.trim()) return;
    const cleaned: Omit<LPJEntry, "id"> = {
      ...form,
      lampiranUrl: form.lampiranUrl?.trim() || undefined,
    };
    if (editingId) {
      onUpdate({ ...cleaned, id: editingId });
    } else {
      onAdd({ ...cleaned, id: `lpj-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Laporan Pertanggungjawaban (LPJ) Program Penyaluran
          </h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Seluruh LPJ terdokumentasi dan siap diaudit oleh Kantor Akuntan Publik (KAP) independen.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
        >
          <Plus className="h-4 w-4" />
          Tambah LPJ
        </button>
      </div>

      <div className="space-y-3">
        {lpjList.length === 0 ? (
          <div className="border-2 border-dashed border-baznas-ink-8 bg-baznas-paper/20 p-10 text-center">
            <FileText className="h-10 w-10 text-baznas-ink/30 mx-auto mb-3" />
            <p className="text-baznas-ink/65 text-sm font-semibold">Belum ada LPJ tersimpan</p>
            <p className="text-baznas-ink/45 text-xs mt-1">Klik "Tambah LPJ" untuk membuat laporan pertanggungjawaban program baru</p>
          </div>
        ) : (
          lpjList.map((e) => (
            <div key={e.id} className="border border-baznas-ink-8 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-mono font-bold text-baznas-ink">{e.nomorLPJ}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="font-semibold text-baznas-ink">{e.programNama}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-baznas-ink-8 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Bidang</p>
                      <p className="text-baznas-ink/80">{e.bidang}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Tanggal</p>
                      <p className="font-mono text-baznas-ink/80">{e.tanggalLPJ}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Total Penyaluran</p>
                      <p className="font-bold text-baznas-green-900 editorial-num">{formatRupiah(e.totalPenyaluran)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Total Penerimaan</p>
                      <p className="font-bold text-baznas-ink editorial-num">{formatRupiah(e.totalPenerimaan)}</p>
                    </div>
                  </div>
                  {e.keterangan && (
                    <p className="text-xs text-baznas-ink/65 mt-3 italic">"{e.keterangan}"</p>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(e)}
                    className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                    aria-label={`Edit LPJ ${e.nomorLPJ}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(e)}
                    className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-error-700 hover:bg-baznas-error-50 transition-colors"
                    aria-label={`Hapus LPJ ${e.nomorLPJ}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit LPJ" : "Tambah LPJ"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lpj-nomor" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Nomor LPJ *
              </label>
              <input
                id="lpj-nomor"
                type="text"
                required
                value={form.nomorLPJ}
                onChange={(e) => setForm({ ...form, nomorLPJ: e.target.value })}
                placeholder="mis. LPJ/B3/IX/2026/001"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="lpj-bidang" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Bidang *
              </label>
              <select
                id="lpj-bidang"
                required
                value={form.bidang}
                onChange={(e) => setForm({ ...form, bidang: e.target.value as LPJEntry["bidang"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="Bidang I">Bidang I</option>
                <option value="Bidang II">Bidang II</option>
                <option value="Bidang III">Bidang III</option>
                <option value="Bidang IV">Bidang IV</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="lpj-program" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Nama Program *
            </label>
            <input
              id="lpj-program"
              type="text"
              required
              value={form.programNama}
              onChange={(e) => setForm({ ...form, programNama: e.target.value })}
              placeholder="mis. BAZNAS Sehat — Bantuan Obat & Ambulans Dhuafa"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="lpj-tanggal" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Tanggal LPJ *
              </label>
              <input
                id="lpj-tanggal"
                type="date"
                required
                value={form.tanggalLPJ}
                onChange={(e) => setForm({ ...form, tanggalLPJ: e.target.value })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="lpj-penyaluran" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Total Penyaluran (Rp) *
              </label>
              <input
                id="lpj-penyaluran"
                type="number"
                required
                min={0}
                value={form.totalPenyaluran}
                onChange={(e) => setForm({ ...form, totalPenyaluran: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="lpj-penerimaan" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Total Penerimaan (Rp) *
              </label>
              <input
                id="lpj-penerimaan"
                type="number"
                required
                min={0}
                value={form.totalPenerimaan}
                onChange={(e) => setForm({ ...form, totalPenerimaan: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div>
            <label htmlFor="lpj-status" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Status *
            </label>
            <select
              id="lpj-status"
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LPJEntry["status"] })}
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="draft">Draft</option>
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div>
            <label htmlFor="lpj-ket" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Keterangan *
            </label>
            <textarea
              id="lpj-ket"
              required
              rows={3}
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="mis. LPJ mencakup penyaluran tahap I, penerima 210 pasien SKTM..."
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
            />
          </div>
          <div>
            <label htmlFor="lpj-lampiran" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Lampiran URL (opsional)
            </label>
            <input
              id="lpj-lampiran"
              type="url"
              value={form.lampiranUrl || ""}
              onChange={(e) => setForm({ ...form, lampiranUrl: e.target.value })}
              placeholder="https://..."
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-baznas-ink-8 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="border border-baznas-ink-20 bg-white hover:bg-baznas-paper px-4 py-2.5 text-xs font-semibold text-baznas-ink/80 transition-colors min-h-t-target"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-baznas-ink hover:bg-baznas-ink/90 px-5 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
            >
              {editingId ? "Simpan Perubahan" : "Tambah LPJ"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus LPJ?"
        message={`LPJ "${pendingDelete?.nomorLPJ}" akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};

export default LPJTab;
