"use client";

import React, { useState, useMemo } from "react";
import { ProgramLintasBidang } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Dialog, ConfirmDialog } from "@/components/common";
import { Edit, Trash2, Plus, Download, Search, Filter } from "lucide-react";

interface LaporanProgramTabProps {
  programList: ProgramLintasBidang[];
  onAdd: (p: ProgramLintasBidang) => void;
  onUpdate: (p: ProgramLintasBidang) => void;
  onDelete: (id: string) => void;
}

const emptyForm: Omit<ProgramLintasBidang, "id"> = {
  kodeProgram: "",
  bidang: "Bidang I",
  namaBidang: "",
  namaProgram: "",
  paguAnggaran: 0,
  realisasi: 0,
  targetVolume: "",
  status: "Berjalan Baik",
};

const STATUS_BADGE: Record<string, string> = {
  "Berjalan Baik": "bg-baznas-paper text-baznas-green-900 border border-baznas-ink-8",
  "Selesai": "bg-baznas-paper text-baznas-ink border border-baznas-ink-8",
  "Perlu Percepatan": "bg-baznas-paper border border-baznas-gold-display text-baznas-ink",
};

export const LaporanProgramTab: React.FC<LaporanProgramTabProps> = ({
  programList,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBidang, setFilterBidang] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ProgramLintasBidang, "id">>(emptyForm);

  const [pendingDelete, setPendingDelete] = useState<ProgramLintasBidang | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return programList.filter((p) => {
      if (filterBidang !== "all" && p.bidang !== filterBidang) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (q && !p.namaProgram.toLowerCase().includes(q) && !p.kodeProgram.toLowerCase().includes(q) && !p.namaBidang.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [programList, searchQuery, filterBidang, filterStatus]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: ProgramLintasBidang) => {
    setEditingId(p.id);
    setForm({
      kodeProgram: p.kodeProgram,
      bidang: p.bidang,
      namaBidang: p.namaBidang,
      namaProgram: p.namaProgram,
      paguAnggaran: p.paguAnggaran,
      realisasi: p.realisasi,
      targetVolume: p.targetVolume,
      status: p.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kodeProgram.trim() || !form.namaProgram.trim() || !form.namaBidang.trim()) return;
    if (editingId) {
      onUpdate({ ...form, id: editingId });
    } else {
      onAdd({ ...form, id: `prog-${crypto.randomUUID().slice(0, 8)}` });
    }
    setIsFormOpen(false);
  };

  const handleExport = async () => {
    const { exportToExcel } = await import("@/lib/excel-utils");
    const headers = [
      "Kode Program", "Bidang Kerja", "Kategori / Unit", "Nama Program Kerja",
      "Pagu Anggaran (Rp)", "Realisasi Kas (Rp)", "Sisa Anggaran (Rp)",
      "Capaian Serapan (%)", "Target / Volume Capaian", "Status",
    ];
    const rows = filtered.map((p) => [
      p.kodeProgram, p.bidang, p.namaBidang, p.namaProgram,
      p.paguAnggaran, p.realisasi,
      p.paguAnggaran - p.realisasi,
      `${Math.round((p.realisasi / p.paguAnggaran) * 100)}%`,
      p.targetVolume, p.status,
    ]);
    exportToExcel("Laporan_Per_Program_Lintas_Bidang_BAZNAS", headers, rows);
  };

  return (
    <div className="border border-baznas-ink-8 bg-white p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-baznas-ink-8 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-baznas-ink font-poppins">
              Laporan Realisasi &amp; Kinerja per Program Tiap Bidang
            </h3>
            <span className="bg-baznas-paper border border-baznas-ink-8 text-baznas-ink text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider">
              {filtered.length} Program
            </span>
          </div>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Monitoring menyeluruh per program kerja dari Bidang 1, 2, 3, dan 4 beserta pagu, realisasi dan target penerima
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
            Tambah Program
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Kode atau Nama Program..."
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
            <option value="all">Semua Bidang (I s/d IV)</option>
            <option value="Bidang I">Bidang I — Pengumpulan</option>
            <option value="Bidang II">Bidang II — Pendistribusian &amp; Pendayagunaan</option>
            <option value="Bidang III">Bidang III — Keuangan</option>
            <option value="Bidang IV">Bidang IV — Administrasi &amp; SDM</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baznas-ink/45 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-baznas-ink-20 bg-white pl-9 pr-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 font-semibold min-h-t-target"
          >
            <option value="all">Semua Status Evaluasi</option>
            <option value="Berjalan Baik">Berjalan Baik</option>
            <option value="Perlu Percepatan">Perlu Percepatan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-baznas-ink-8">
        <table className="w-full min-w-[600px] text-left text-xs text-baznas-ink/80">
          <thead className="bg-baznas-paper text-[11px] font-bold text-baznas-ink/70 uppercase tracking-wider border-b border-baznas-ink-8">
            <tr>
              <th className="py-3 px-4">Kode &amp; Bidang</th>
              <th className="py-3 px-4">Nama Program Kerja</th>
              <th className="py-3 px-4">Target / Volume</th>
              <th className="py-3 px-4 text-right">Pagu (Rp)</th>
              <th className="py-3 px-4 text-right">Realisasi (Rp)</th>
              <th className="py-3 px-4 text-right">Sisa (Rp)</th>
              <th className="py-3 px-4 text-center">Serapan (%)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baznas-ink-8">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-baznas-ink/55">
                  Tidak ada program yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((prog) => {
                const sisa = prog.paguAnggaran - prog.realisasi;
                const pct = Math.round((prog.realisasi / prog.paguAnggaran) * 100);
                return (
                  <tr key={prog.id} className="hover:bg-baznas-paper/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-baznas-ink block">{prog.kodeProgram}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 inline-block mt-0.5 ${STATUS_BADGE[prog.bidang]}`}>
                        {prog.bidang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-baznas-ink block">{prog.namaProgram}</span>
                      <span className="text-[11px] text-baznas-ink/45">{prog.namaBidang}</span>
                    </td>
                    <td className="py-3.5 px-4 text-baznas-ink/80 font-medium">{prog.targetVolume}</td>
                    <td className="py-3.5 px-4 text-right text-baznas-ink/80">{formatRupiah(prog.paguAnggaran)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-baznas-green-900">{formatRupiah(prog.realisasi)}</td>
                    <td className="py-3.5 px-4 text-right text-baznas-ink/55">{formatRupiah(sisa)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-baznas-ink editorial-num">{pct}%</span>
                        <div className="w-16 bg-baznas-paper h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              pct >= 80 ? "bg-baznas-green-800" : pct >= 50 ? "bg-baznas-gold-display" : "bg-baznas-ink/40"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[prog.status]}`}>
                        {prog.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prog)}
                          className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-green-900 hover:bg-baznas-green-100/40 transition-colors"
                          aria-label={`Edit ${prog.namaProgram}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(prog)}
                          className="inline-flex items-center justify-center h-t-target w-t-target text-baznas-ink/55 hover:text-baznas-error-700 hover:bg-baznas-error-50 transition-colors"
                          aria-label={`Hapus ${prog.namaProgram}`}
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

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Program" : "Tambah Program"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prog-kode" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Kode Program *
              </label>
              <input
                id="prog-kode"
                type="text"
                required
                value={form.kodeProgram}
                onChange={(e) => setForm({ ...form, kodeProgram: e.target.value })}
                placeholder="mis. PRG-B3-04"
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="prog-bidang" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Bidang *
              </label>
              <select
                id="prog-bidang"
                required
                value={form.bidang}
                onChange={(e) => setForm({ ...form, bidang: e.target.value as ProgramLintasBidang["bidang"] })}
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
            <label htmlFor="prog-namabidang" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Nama Bidang / Unit *
            </label>
            <input
              id="prog-namabidang"
              type="text"
              required
              value={form.namaBidang}
              onChange={(e) => setForm({ ...form, namaBidang: e.target.value })}
              placeholder="mis. Keuangan & RKAT"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div>
            <label htmlFor="prog-nama" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Nama Program *
            </label>
            <input
              id="prog-nama"
              type="text"
              required
              value={form.namaProgram}
              onChange={(e) => setForm({ ...form, namaProgram: e.target.value })}
              placeholder="mis. Penyusunan Laporan Keuangan PSAK 109"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prog-pagu" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Pagu Anggaran (Rp) *
              </label>
              <input
                id="prog-pagu"
                type="number"
                required
                min={0}
                value={form.paguAnggaran}
                onChange={(e) => setForm({ ...form, paguAnggaran: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
            <div>
              <label htmlFor="prog-realisasi" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
                Realisasi (Rp) *
              </label>
              <input
                id="prog-realisasi"
                type="number"
                required
                min={0}
                value={form.realisasi}
                onChange={(e) => setForm({ ...form, realisasi: Number(e.target.value) })}
                className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs font-mono text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
              />
            </div>
          </div>
          <div>
            <label htmlFor="prog-target" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Target / Volume *
            </label>
            <input
              id="prog-target"
              type="text"
              required
              value={form.targetVolume}
              onChange={(e) => setForm({ ...form, targetVolume: e.target.value })}
              placeholder="mis. 1 Laporan Audit Keuangan"
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-target"
            />
          </div>
          <div>
            <label htmlFor="prog-status" className="block text-[11px] font-bold text-baznas-ink/80 mb-1.5">
              Status *
            </label>
            <select
              id="prog-status"
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProgramLintasBidang["status"] })}
              className="w-full border border-baznas-ink-20 bg-white px-3 py-2.5 text-xs text-baznas-ink focus:outline-none focus:border-baznas-green-800 min-h-t-target"
            >
              <option value="Berjalan Baik">Berjalan Baik</option>
              <option value="Perlu Percepatan">Perlu Percepatan</option>
              <option value="Selesai">Selesai</option>
            </select>
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
              {editingId ? "Simpan Perubahan" : "Tambah Program"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        severity="danger"
        title="Hapus Program?"
        message={`Program "${pendingDelete?.namaProgram}" akan dihapus permanen.`}
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

export default LaporanProgramTab;
