"use client";

import React, { useState, useMemo } from "react";
import { BukuKasEntry } from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react";

interface BukuKasTabProps {
  bukuKasList: BukuKasEntry[];
  onAdd: (e: BukuKasEntry) => void;
  onUpdate: (e: BukuKasEntry) => void;
  onDelete: (id: string) => void;
}

const emptyForm: Omit<BukuKasEntry, "id"> = {
  tanggal: getLocalDateString(),
  uraian: "",
  jenis: "penerimaan",
  nominal: 0,
  saldo: 0,
  bankRekening: "",
  referensi: "",
  petugasAmil: "",
};

export const BukuKasTab: React.FC<BukuKasTabProps> = ({
  bukuKasList,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BukuKasEntry, "id">>(emptyForm);

  const [pendingDelete, setPendingDelete] = useState<BukuKasEntry | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bukuKasList.filter((e) => {
      if (filterJenis !== "all" && e.jenis !== filterJenis) return false;
      if (q && !e.uraian.toLowerCase().includes(q) && !(e.referensi || "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [bukuKasList, searchQuery, filterJenis]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: BukuKasEntry) => {
    setEditingId(e.id);
    setForm({
      tanggal: e.tanggal,
      uraian: e.uraian,
      jenis: e.jenis,
      nominal: e.nominal,
      saldo: e.saldo,
      bankRekening: e.bankRekening || "",
      referensi: e.referensi || "",
      petugasAmil: e.petugasAmil,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.uraian.trim() || !form.petugasAmil.trim()) return;
    if (editingId) {
      onUpdate({ ...form, id: editingId });
    } else {
      onAdd({ ...form, id: `bku-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Buku Kas Umum (BKU) Penerimaan &amp; Pengeluaran
          </h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Pencatatan mutasi kas harian loket dan rekening bank BAZNAS
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
        >
          <Plus className="h-4 w-4" />
          Tambah Entri
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari uraian atau referensi..."
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink placeholder:text-baznas-ink/35 focus:outline-none focus:border-baznas-green-800 min-h-t-target"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45 pointer-events-none" />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
          >
            <option value="all">Semua Jenis</option>
            <option value="penerimaan">Penerimaan (Debet)</option>
            <option value="penyaluran">Penyaluran (Kredit)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-baznas-ink-8 text-xs">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-baznas-paper text-baznas-ink/70 font-bold text-[11px] uppercase tracking-wider border-b border-baznas-ink-8">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Uraian Transaksi</th>
              <th className="p-3 text-right text-baznas-green-900">Penerimaan (Debet)</th>
              <th className="p-3 text-right text-baznas-error-700">Penyaluran (Kredit)</th>
              <th className="p-3 text-right">Saldo Kas</th>
              <th className="p-3">Bank</th>
              <th className="p-3">Amil</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baznas-ink-8">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-baznas-ink/55">
                  Tidak ada entri buku kas.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-baznas-paper/30">
                  <td className="p-3 text-baznas-ink/80 font-mono">{e.tanggal}</td>
                  <td className="p-3 text-baznas-ink">
                    <div>{e.uraian}</div>
                    {e.referensi && <div className="text-[10px] text-baznas-ink/55 font-mono">{e.referensi}</div>}
                  </td>
                  <td className="p-3 text-right font-bold text-baznas-green-900">
                    {e.jenis === "penerimaan" ? `+ ${formatRupiah(e.nominal)}` : <span className="text-baznas-ink/35">-</span>}
                  </td>
                  <td className="p-3 text-right font-bold text-baznas-error-700">
                    {e.jenis === "penyaluran" ? `- ${formatRupiah(e.nominal)}` : <span className="text-baznas-ink/35">-</span>}
                  </td>
                  <td className="p-3 text-right font-bold text-baznas-ink editorial-num">{formatRupiah(e.saldo)}</td>
                  <td className="p-3 text-baznas-ink/70 text-[11px]">{e.bankRekening || "-"}</td>
                  <td className="p-3 text-baznas-ink/70 text-[11px]">{e.petugasAmil}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(e)}
                        className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                        aria-label={`Edit entri ${e.uraian}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(e)}
                        className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-error-700 hover:bg-baznas-error-50 transition-colors"
                        aria-label={`Hapus entri ${e.uraian}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Entri Buku Kas" : "Tambah Entri Buku Kas"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bk-tanggal" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Tanggal *
              </label>
              <input
                id="bk-tanggal"
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="bk-jenis" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Jenis Transaksi *
              </label>
              <select
                id="bk-jenis"
                required
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value as BukuKasEntry["jenis"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="penerimaan">Penerimaan (Debet)</option>
                <option value="penyaluran">Penyaluran (Kredit)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="bk-uraian" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Uraian Transaksi *
            </label>
            <input
              id="bk-uraian"
              type="text"
              required
              value={form.uraian}
              onChange={(e) => setForm({ ...form, uraian: e.target.value })}
              placeholder="mis. Penyaluran Beasiswa Santri Yatim"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bk-nominal" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Nominal (Rp) *
              </label>
              <input
                id="bk-nominal"
                type="number"
                required
                min={0}
                value={form.nominal}
                onChange={(e) => setForm({ ...form, nominal: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="bk-saldo" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Saldo Setelah Transaksi (Rp) *
              </label>
              <input
                id="bk-saldo"
                type="number"
                required
                min={0}
                value={form.saldo}
                onChange={(e) => setForm({ ...form, saldo: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bk-bank" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Bank / Rekening
              </label>
              <select
                id="bk-bank"
                value={form.bankRekening || ""}
                onChange={(e) => setForm({ ...form, bankRekening: e.target.value as BukuKasEntry["bankRekening"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="">— Pilih bank —</option>
                <option value="Giro Sulutgo">Giro Sulutgo</option>
                <option value="Bank Muamalat">Bank Muamalat</option>
                <option value="Bank BTN Syariah">Bank BTN Syariah</option>
              </select>
            </div>
            <div>
              <label htmlFor="bk-referensi" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Referensi (No Bukti / SPK)
              </label>
              <input
                id="bk-referensi"
                type="text"
                value={form.referensi || ""}
                onChange={(e) => setForm({ ...form, referensi: e.target.value })}
                placeholder="mis. BZ-202609-00142"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bk-amil" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Petugas Amil *
            </label>
            <input
              id="bk-amil"
              type="text"
              required
              value={form.petugasAmil}
              onChange={(e) => setForm({ ...form, petugasAmil: e.target.value })}
              placeholder="mis. Minarti Alhabsyi"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
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
              {editingId ? "Simpan Perubahan" : "Tambah Entri"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus Entri Buku Kas?"
        message={`Entri "${pendingDelete?.uraian}" akan dihapus permanen.`}
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

export default BukuKasTab;
