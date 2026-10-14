"use client";

import React, { useState } from "react";
import { LaporanPSAK } from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, Printer, FileText } from "lucide-react";

interface LaporanPSAKTabProps {
  laporanList: LaporanPSAK[];
  currentUserName: string;
  onAdd: (e: LaporanPSAK) => void;
  onUpdate: (e: LaporanPSAK) => void;
  onDelete: (id: string) => void;
  onOpenLaporanPrint: () => void;
}

const emptyForm: Omit<LaporanPSAK, "id"> = {
  judul: "",
  periode: "",
  tanggalTerbit: getLocalDateString(),
  status: "draft",
  totalAset: 0,
  totalKewajiban: 0,
  totalDana: 0,
  totalPenerimaan: 0,
  totalPenyaluran: 0,
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-baznas-paper text-baznas-ink/70 border border-baznas-ink-8",
  diajukan: "bg-baznas-paper border border-baznas-gold-display text-baznas-ink",
  disetujui: "bg-baznas-paper text-baznas-green-900 border border-baznas-green-800",
  diaudit: "bg-baznas-ink text-white border border-baznas-ink",
};

export const LaporanPSAKTab: React.FC<LaporanPSAKTabProps> = ({
  laporanList,
  currentUserName,
  onAdd,
  onUpdate,
  onDelete,
  onOpenLaporanPrint,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LaporanPSAK, "id">>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<LaporanPSAK | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: LaporanPSAK) => {
    setEditingId(e.id);
    setForm({
      judul: e.judul,
      periode: e.periode,
      tanggalTerbit: e.tanggalTerbit,
      status: e.status,
      totalAset: e.totalAset,
      totalKewajiban: e.totalKewajiban,
      totalDana: e.totalDana,
      totalPenerimaan: e.totalPenerimaan,
      totalPenyaluran: e.totalPenyaluran,
      auditedBy: e.auditedBy || "",
      catatan: e.catatan || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.periode.trim()) return;
    const cleaned: Omit<LaporanPSAK, "id"> = {
      ...form,
      auditedBy: form.auditedBy?.trim() || undefined,
      catatan: form.catatan?.trim() || undefined,
    };
    if (editingId) {
      onUpdate({ ...cleaned, id: editingId });
    } else {
      onAdd({ ...cleaned, id: `lap-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Laporan Keuangan Standar Akuntansi Zakat (PSAK 109)
          </h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Laporan Posisi Keuangan, Perubahan Dana, dan Arus Kas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
          >
            <Plus className="h-4 w-4" />
            Tambah Laporan
          </button>
          <button
            onClick={onOpenLaporanPrint}
            className="inline-flex items-center gap-2 border border-baznas-ink-20 bg-white hover:bg-baznas-paper px-4 py-2.5 text-xs font-bold text-baznas-ink/80 transition-colors min-h-t-target"
          >
            <Printer className="h-4 w-4" />
            Cetak Dokumen Resmi
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {laporanList.length === 0 ? (
          <div className="border-2 border-dashed border-baznas-ink-8 bg-baznas-paper/20 p-10 text-center">
            <FileText className="h-10 w-10 text-baznas-ink/30 mx-auto mb-3" />
            <p className="text-baznas-ink/65 text-sm font-semibold">Belum ada Laporan PSAK 109 tersimpan</p>
            <p className="text-baznas-ink/45 text-xs mt-1">Klik "Tambah Laporan" untuk membuat draf laporan keuangan baru</p>
          </div>
        ) : (
          laporanList.map((e) => (
            <div key={e.id} className="border border-baznas-ink-8 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="font-bold text-baznas-ink">{e.judul}</h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-baznas-ink/55">Periode: </span>
                      <span className="font-semibold text-baznas-ink/80">{e.periode}</span>
                    </div>
                    <div>
                      <span className="text-baznas-ink/55">Terbit: </span>
                      <span className="font-mono text-baznas-ink/80">{e.tanggalTerbit}</span>
                    </div>
                    <div>
                      <span className="text-baznas-ink/55">Auditor: </span>
                      <span className="text-baznas-ink/80">{e.auditedBy || "—"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 pt-3 border-t border-baznas-ink-8 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Aset</p>
                      <p className="font-bold text-baznas-ink editorial-num">{formatRupiah(e.totalAset)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Kewajiban</p>
                      <p className="font-bold text-baznas-ink editorial-num">{formatRupiah(e.totalKewajiban)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Dana</p>
                      <p className="font-bold text-baznas-green-900 editorial-num">{formatRupiah(e.totalDana)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Penerimaan</p>
                      <p className="font-bold text-baznas-ink editorial-num">{formatRupiah(e.totalPenerimaan)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-baznas-ink/55 font-bold">Penyaluran</p>
                      <p className="font-bold text-baznas-ink editorial-num">{formatRupiah(e.totalPenyaluran)}</p>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(e)}
                    className="inline-flex items-center justify-center h-8 w-8 text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                    aria-label={`Edit ${e.judul}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(e)}
                    className="inline-flex items-center justify-center h-8 w-8 text-baznas-ink/55 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    aria-label={`Hapus ${e.judul}`}
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
        title={editingId ? "Edit Laporan PSAK 109" : "Tambah Laporan PSAK 109"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lap-judul" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Judul Laporan *
              </label>
              <input
                id="lap-judul"
                type="text"
                required
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="mis. Laporan PSAK 109 Triwulan III 2026"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="lap-periode" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Periode *
              </label>
              <input
                id="lap-periode"
                type="text"
                required
                value={form.periode}
                onChange={(e) => setForm({ ...form, periode: e.target.value })}
                placeholder="mis. Triwulan III 2026"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="lap-tanggal" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Tanggal Terbit *
              </label>
              <input
                id="lap-tanggal"
                type="date"
                required
                value={form.tanggalTerbit}
                onChange={(e) => setForm({ ...form, tanggalTerbit: e.target.value })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="lap-status" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Status *
              </label>
              <select
                id="lap-status"
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LaporanPSAK["status"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="draft">Draft</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="diaudit">Diaudit</option>
              </select>
            </div>
            <div>
              <label htmlFor="lap-auditor" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Diperiksa / Diaudit Oleh
              </label>
              <input
                id="lap-auditor"
                type="text"
                value={form.auditedBy || ""}
                onChange={(e) => setForm({ ...form, auditedBy: e.target.value })}
                placeholder="mis. KAP Tanudiredja"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lap-aset" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Total Aset (Rp) *</label>
              <input id="lap-aset" type="number" required min={0} value={form.totalAset}
                onChange={(e) => setForm({ ...form, totalAset: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target" />
            </div>
            <div>
              <label htmlFor="lap-kewajiban" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Total Kewajiban (Rp) *</label>
              <input id="lap-kewajiban" type="number" required min={0} value={form.totalKewajiban}
                onChange={(e) => setForm({ ...form, totalKewajiban: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target" />
            </div>
            <div>
              <label htmlFor="lap-dana" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Total Dana (Rp) *</label>
              <input id="lap-dana" type="number" required min={0} value={form.totalDana}
                onChange={(e) => setForm({ ...form, totalDana: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target" />
            </div>
            <div>
              <label htmlFor="lap-penerimaan" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Total Penerimaan (Rp) *</label>
              <input id="lap-penerimaan" type="number" required min={0} value={form.totalPenerimaan}
                onChange={(e) => setForm({ ...form, totalPenerimaan: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target" />
            </div>
            <div className="col-span-2">
              <label htmlFor="lap-penyaluran" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">Total Penyaluran (Rp) *</label>
              <input id="lap-penyaluran" type="number" required min={0} value={form.totalPenyaluran}
                onChange={(e) => setForm({ ...form, totalPenyaluran: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target" />
            </div>
          </div>
          <div>
            <label htmlFor="lap-catatan" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Catatan (opsional)
            </label>
            <textarea
              id="lap-catatan"
              rows={2}
              value={form.catatan || ""}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan tambahan untuk laporan ini..."
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800"
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
              {editingId ? "Simpan Perubahan" : "Tambah Laporan"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus Laporan PSAK?"
        message={`Laporan "${pendingDelete?.judul}" akan dihapus permanen.`}
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

export default LaporanPSAKTab;
