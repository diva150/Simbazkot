"use client";

import React, { useState, useMemo } from "react";
import { ItemRKAT } from "@/lib/types";
import { formatRupiah, getLocalDateString } from "@/lib/utils";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, Download, Search, Filter } from "lucide-react";

interface RkatTabProps {
  rkatList: ItemRKAT[];
  onAdd: (r: ItemRKAT) => void;
  onUpdate: (r: ItemRKAT) => void;
  onDelete: (id: string) => void;
}

const emptyForm: Omit<ItemRKAT, "id"> = {
  kodeAkun: "",
  bidang: "Bidang III",
  namaProgram: "",
  paguAnggaran: 0,
  realisasi: 0,
  tahun: 2026,
};

export const RkatTab: React.FC<RkatTabProps> = ({ rkatList, onAdd, onUpdate, onDelete }) => {
  const [filterBidang, setFilterBidang] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ItemRKAT, "id">>(emptyForm);

  const [pendingDelete, setPendingDelete] = useState<ItemRKAT | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rkatList.filter((item) => {
      if (filterBidang !== "all" && item.bidang !== filterBidang) return false;
      if (q && !item.namaProgram.toLowerCase().includes(q) && !item.kodeAkun.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [rkatList, filterBidang, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (r: ItemRKAT) => {
    setEditingId(r.id);
    setForm({
      kodeAkun: r.kodeAkun,
      bidang: r.bidang,
      namaProgram: r.namaProgram,
      paguAnggaran: r.paguAnggaran,
      realisasi: r.realisasi,
      tahun: r.tahun,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kodeAkun.trim() || !form.namaProgram.trim()) return;
    if (editingId) {
      onUpdate({ ...form, id: editingId });
    } else {
      onAdd({ ...form, id: `rkat-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  const handleExport = async () => {
    const { exportToExcel } = await import("@/lib/excel-utils");
    const headers = [
      "Kode Akun", "Nama Program", "Bidang Penanggung Jawab",
      "Pagu Anggaran (Rp)", "Realisasi Terserap (Rp)", "Sisa Pagu (Rp)", "Persentase (%)",
    ];
    const rows = filtered.map((item) => [
      item.kodeAkun, item.namaProgram, item.bidang,
      item.paguAnggaran, item.realisasi,
      item.paguAnggaran - item.realisasi,
      `${Math.round((item.realisasi / item.paguAnggaran) * 100)}%`,
    ]);
    exportToExcel("Laporan_Realisasi_RKAT_BAZNAS", headers, rows);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-baznas-ink font-poppins">
            Matriks Realisasi Program Kerja RKAT 2026
          </h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Laporan penyerapan dana program per bidang tugas BAZNAS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 border border-baznas-ink-20 bg-white hover:bg-baznas-paper hover:border-baznas-ink-40 px-3.5 py-2.5 text-xs font-semibold text-baznas-ink/80 transition-colors min-h-t-target"
          >
            <Download className="h-3.5 w-3.5 text-baznas-gold-display" />
            Export Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-baznas-ink hover:bg-baznas-ink/90 px-4 py-2.5 text-xs font-bold text-white transition-colors min-h-t-target"
          >
            <Plus className="h-4 w-4" />
            Tambah RKAT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode akun atau nama program..."
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink placeholder:text-baznas-ink/35 focus:outline-none focus:border-baznas-green-800 min-h-t-target"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45 pointer-events-none" />
          <select
            value={filterBidang}
            onChange={(e) => setFilterBidang(e.target.value)}
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
          >
            <option value="all">Semua Bidang (I–IV)</option>
            <option value="Bidang I">Bidang I (Pengumpulan)</option>
            <option value="Bidang II">Bidang II (Pendistribusian)</option>
            <option value="Bidang III">Bidang III (Keuangan)</option>
            <option value="Bidang IV">Bidang IV (Administrasi)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-baznas-ink-8">
        <table className="w-full min-w-[600px] text-xs text-left">
          <thead className="bg-baznas-paper text-[11px] font-bold text-baznas-ink/70 uppercase tracking-wider border-b border-baznas-ink-8">
            <tr>
              <th className="px-4 py-3">Kode &amp; Bidang</th>
              <th className="px-4 py-3">Nama Program Kerja</th>
              <th className="px-4 py-3 text-right">Pagu RKAT</th>
              <th className="px-4 py-3 text-right">Realisasi</th>
              <th className="px-4 py-3 text-right">Sisa Anggaran</th>
              <th className="px-4 py-3 text-center w-28">Serapan (%)</th>
              <th className="px-4 py-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baznas-ink-8">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-baznas-ink/55">
                  Tidak ada data RKAT yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const sisa = item.paguAnggaran - item.realisasi;
                const pct = Math.round((item.realisasi / item.paguAnggaran) * 100);
                return (
                  <tr key={item.id} className="hover:bg-baznas-paper/30 transition-colors">
                    <td className="px-4 py-4 font-mono font-bold text-baznas-ink">
                      {item.kodeAkun}
                      <span className="block text-[10px] text-baznas-ink/45 font-normal">{item.bidang}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-baznas-ink">{item.namaProgram}</td>
                    <td className="px-4 py-4 text-right text-baznas-ink/80">{formatRupiah(item.paguAnggaran)}</td>
                    <td className="px-4 py-4 text-right font-bold text-baznas-green-900">{formatRupiah(item.realisasi)}</td>
                    <td className="px-4 py-4 text-right text-baznas-ink/55">{formatRupiah(sisa)}</td>
                    <td className="px-4 py-4 text-center font-bold text-baznas-ink">{pct}%</td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                          aria-label={`Edit ${item.namaProgram}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-error-700 hover:bg-baznas-error-50 transition-colors"
                          aria-label={`Hapus ${item.namaProgram}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal (Tambah / Edit) */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit RKAT" : "Tambah RKAT"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rkat-kode" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Kode Akun *
              </label>
              <input
                id="rkat-kode"
                type="text"
                required
                value={form.kodeAkun}
                onChange={(e) => setForm({ ...form, kodeAkun: e.target.value })}
                placeholder="mis. 1.01"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="rkat-bidang" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Bidang *
              </label>
              <select
                id="rkat-bidang"
                required
                value={form.bidang}
                onChange={(e) => setForm({ ...form, bidang: e.target.value as ItemRKAT["bidang"] })}
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
            <label htmlFor="rkat-nama" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Nama Program *
            </label>
            <input
              id="rkat-nama"
              type="text"
              required
              value={form.namaProgram}
              onChange={(e) => setForm({ ...form, namaProgram: e.target.value })}
              placeholder="mis. Penyusunan RKAT 2027"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="rkat-pagu" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Pagu Anggaran (Rp) *
              </label>
              <input
                id="rkat-pagu"
                type="number"
                required
                min={0}
                value={form.paguAnggaran}
                onChange={(e) => setForm({ ...form, paguAnggaran: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="rkat-realisasi" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Realisasi (Rp) *
              </label>
              <input
                id="rkat-realisasi"
                type="number"
                required
                min={0}
                value={form.realisasi}
                onChange={(e) => setForm({ ...form, realisasi: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="rkat-tahun" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Tahun Anggaran *
              </label>
              <input
                id="rkat-tahun"
                type="number"
                required
                min={2020}
                max={2100}
                value={form.tahun}
                onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
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
              {editingId ? "Simpan Perubahan" : "Tambah RKAT"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus RKAT?"
        message={`Entri "${pendingDelete?.namaProgram}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
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

export default RkatTab;
