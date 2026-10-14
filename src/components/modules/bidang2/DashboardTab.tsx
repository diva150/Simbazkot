"use client";

import React from "react";
import { Mustahik } from "@/lib/types";
import { GraduationCap, Briefcase } from "lucide-react";

/**
 * DashboardTab — landing summary for Bidang II.
 *
 * 4 stat tiles (total mustahik, desil 1, distribusi, dayagunaan) +
 * 2 quick-cards that jump to the program tabs.
 *
 * Pure presentational — no state. Receives `mustahikList` from parent.
 */

interface DashboardTabProps {
  mustahikList: Mustahik[];
  onNavigate: (tab: "pendistribusian" | "pendayagunaan") => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  mustahikList,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-baznas-ink-8 bg-white p-5">
          <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
            Mustahik Terdata
          </span>
          <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
            {mustahikList.length}{" "}
            <span className="text-sm font-normal text-baznas-ink/55">Jiwa / KK</span>
          </p>
          <p className="text-[11px] text-baznas-green-900 mt-1">Terverifikasi Asnaf &amp; SKTM</p>
        </div>

        <div className="border border-baznas-ink-8 bg-white p-5">
          <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
            Desil 1 (Kemiskinan Ekstrem)
          </span>
          <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
            {mustahikList.filter((m) => m.desil === "Desil 1").length}{" "}
            <span className="text-sm font-normal text-baznas-ink/55">Penerima</span>
          </p>
          <p className="text-[11px] text-baznas-ink/55 mt-1">Prioritas Penyaluran Utama</p>
        </div>

        <div className="border border-baznas-ink-8 bg-white p-5">
          <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
            Program Pendistribusian
          </span>
          <p className="text-2xl font-bold text-baznas-ink font-poppins mt-2">
            {mustahikList.filter((m) => m.kategoriBesar === "pendistribusian").length}{" "}
            <span className="text-sm font-normal text-baznas-ink/55">Mustahik</span>
          </p>
          <p className="text-[11px] text-baznas-ink mt-1">Pendidikan, Kesehatan, Dakwah/Advokasi</p>
        </div>

        <div className="border border-baznas-ink-8 bg-white p-5">
          <span className="text-xs font-semibold text-baznas-ink/45 uppercase tracking-wider">
            Program Pendayagunaan
          </span>
          <p className="text-2xl font-bold text-baznas-green-900 font-poppins mt-2">
            {mustahikList.filter((m) => m.kategoriBesar === "pendayagunaan").length}{" "}
            <span className="text-sm font-normal text-baznas-ink/55">Mustahik</span>
          </p>
          <p className="text-[11px] text-baznas-green-900 mt-1">Ekonomi, Pendidikan Sebagian, Sanitasi</p>
        </div>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate("pendistribusian")}
          className="cursor-pointer border border-baznas-ink-8 bg-baznas-paper/40 p-8 hover:bg-baznas-paper/40 transition-colors"
        >
          <GraduationCap className="h-6 w-6 text-baznas-ink mb-2" />
          <h3 className="text-sm font-bold text-baznas-ink font-poppins">Program Pendistribusian</h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Penyaluran konsumtif darurat: Pendidikan, Kesehatan, Dakwah dan Advokasi.
          </p>
        </div>

        <div
          onClick={() => onNavigate("pendayagunaan")}
          className="cursor-pointer border border-baznas-ink-8 bg-baznas-paper/40 p-8 hover:bg-baznas-paper/40 transition-colors"
        >
          <Briefcase className="h-6 w-6 text-baznas-green-900 mb-2" />
          <h3 className="text-sm font-bold text-baznas-ink font-poppins">Program Pendayagunaan</h3>
          <p className="text-xs text-baznas-ink/55 mt-1">
            Transformasi produktif: Modal Usaha Z-Mart, Vokasi, dan Sanitasi Sehat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
