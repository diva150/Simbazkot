"use client";

import React, { useState, useMemo } from "react";
import { AkunAkuntansi } from "@/lib/types";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react";

interface PengaturanTabProps {
  akunList: AkunAkuntansi[];
  onAdd: (a: AkunAkuntansi) => void;
  onUpdate: (a: AkunAkuntansi) => void;
  onDelete: (id: string) => void;
}

const emptyForm: Omit<AkunAkuntansi, "id"> = {
  kodeAkun: "",
  namaAkun: "",
  kategori: "Aset",
  saldoNormal: "Debit",
  parentId: "",
  aktif: true,
};

const KATEGORI_BADGE: Record<string, string> = {
  Aset: "bg-baznas-paper text-baznas-green-900 border border-baznas-ink-8",
  Kewajiban: "bg-baznas-paper border border-baznas-gold-display text-baznas-ink",
  Dana: "bg-baznas-paper text-baznas-ink border border-baznas-ink-8",
  Penerimaan: "bg-baznas-paper text-baznas-green-900 border border-baznas-green-800",
  Penyaluran: "bg-baznas-paper border border-baznas-error-700 text-baznas-ink",
  Beban: "bg-baznas-paper text-baznas-ink/65 border border-baznas-ink-8",
};

export const PengaturanTab: React.FC<PengaturanTabProps> = ({
  akunList,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AkunAkuntansi, "id">>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<AkunAkuntansi | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return akunList.filter((a) => {
      if (filterKategori !== "all" && a.kategori !== filterKategori) return false;
      if (q && !a.kodeAkun.toLowerCase().includes(q) && !a.namaAkun.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [akunList, searchQuery, filterKategori]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (a: AkunAkuntansi) => {
    setEditingId(a.id);
    setForm({
      kodeAkun: a.kodeAkun,
      namaAkun: a.namaAkun,
      kategori: a.kategori,
      saldoNormal: a.saldoNormal,
      parentId: a.parentId || "",
      aktif: a.aktif,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kodeAkun.trim() || !form.namaAkun.trim()) return;
    const cleaned: Omit<AkunAkuntansi, "id"> = {
      ...form,
      parentId: form.parentId?.trim() || undefined,
    };
    if (editingId) {
      onUpdate({ ...cleaned, id: editingId });
    } else {
      onAdd({ ...cleaned, id: `akun-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Pengaturan Akun &amp; Kode Rekening Akuntansi
          </h3>
          <p className="text-xs text-baznas-ink/65 mt-1">
            Konfigurasi Bagan Akun Standar (Chart of Accounts) BAZNAS RI.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama akun..."
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink placeholder:text-baznas-ink/35 focus:outline-none focus:border-baznas-green-800 min-h-t-target"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45 pointer-events-none" />
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
          >
            <option value="all">Semua Kategori</option>
            <option value="Aset">Aset</option>
            <option value="Kewajiban">Kewajiban</option>
            <option value="Dana">Dana</option>
            <option value="Penerimaan">Penerimaan</option>
            <option value="Penyaluran">Penyaluran</option>
            <option value="Beban">Beban</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-baznas-ink-8 text-xs">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-baznas-paper text-baznas-ink/70 font-bold text-[11px] uppercase tracking-wider border-b border-baznas-ink-8">
            <tr>
              <th className="p-3">Kode Akun</th>
              <th className="p-3">Nama Akun</th>
              <th className="p-3">Kategori</th>
              <th className="p-3 text-center">Saldo Normal</th>
              <th className="p-3">Parent</th>
              <th className="p-3 text-center">Aktif</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baznas-ink-8">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-baznas-ink/55">
                  Tidak ada akun. Klik "Tambah Akun" untuk membuat entri baru.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-baznas-paper/30">
                  <td className="p-3 font-mono font-bold text-baznas-ink">{a.kodeAkun}</td>
                  <td className="p-3 text-baznas-ink">{a.namaAkun}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KATEGORI_BADGE[a.kategori]}`}>
                      {a.kategori}
                    </span>
                  </td>
                  <td className="p-3 text-center text-baznas-ink/80">{a.saldoNormal}</td>
                  <td className="p-3 font-mono text-baznas-ink/65">{a.parentId || "—"}</td>
                  <td className="p-3 text-center">
                    {a.aktif ? (
                      <span className="text-baznas-green-900 font-bold text-[10px] uppercase">Aktif</span>
                    ) : (
                      <span className="text-baznas-ink/45 font-bold text-[10px] uppercase">Non-Aktif</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(a)}
                        className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                        aria-label={`Edit akun ${a.kodeAkun}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(a)}
                        className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-error-700 hover:bg-baznas-error-50 transition-colors"
                        aria-label={`Hapus akun ${a.kodeAkun}`}
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
        title={editingId ? "Edit Akun" : "Tambah Akun"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ak-kode" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Kode Akun *
              </label>
              <input
                id="ak-kode"
                type="text"
                required
                value={form.kodeAkun}
                onChange={(e) => setForm({ ...form, kodeAkun: e.target.value })}
                placeholder="mis. 1101"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="ak-kategori" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Kategori *
              </label>
              <select
                id="ak-kategori"
                required
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value as AkunAkuntansi["kategori"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="Aset">Aset</option>
                <option value="Kewajiban">Kewajiban</option>
                <option value="Dana">Dana</option>
                <option value="Penerimaan">Penerimaan</option>
                <option value="Penyaluran">Penyaluran</option>
                <option value="Beban">Beban</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ak-nama" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Nama Akun *
            </label>
            <input
              id="ak-nama"
              type="text"
              required
              value={form.namaAkun}
              onChange={(e) => setForm({ ...form, namaAkun: e.target.value })}
              placeholder="mis. Kas di Bank Sulutgo"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ak-saldo" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Saldo Normal *
              </label>
              <select
                id="ak-saldo"
                required
                value={form.saldoNormal}
                onChange={(e) => setForm({ ...form, saldoNormal: e.target.value as AkunAkuntansi["saldoNormal"] })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              >
                <option value="Debit">Debit</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>
            <div>
              <label htmlFor="ak-parent" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Parent Account (opsional)
              </label>
              <input
                id="ak-parent"
                type="text"
                value={form.parentId || ""}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                placeholder="Kode akun parent, mis. 1100"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold text-baznas-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                className="h-4 w-4 accent-baznas-green-800"
              />
              Akun Aktif (dapat digunakan dalam transaksi)
            </label>
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
              {editingId ? "Simpan Perubahan" : "Tambah Akun"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus Akun?"
        message={`Akun "${pendingDelete?.kodeAkun} - ${pendingDelete?.namaAkun}" akan dihapus permanen.`}
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

export default PengaturanTab;
