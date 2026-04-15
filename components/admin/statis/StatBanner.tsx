'use client';

import { Download, FileSpreadsheet } from 'lucide-react';

interface StatBannerProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export function StatBanner({ onExportPDF, onExportExcel }: StatBannerProps) {
  return (
    <div className="relative bg-slate-900 overflow-hidden px-6 sm:px-8 lg:px-10 pt-8 pb-12">
      {/* dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-emerald-400 text-[11px] font-semibold uppercase tracking-widest mb-1">
            Analytics
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Dashboard Statistik
          </h1>
          <p className="text-slate-400 text-sm">
            Analisis laporan AmanMoe · SMK Muh. 4 YK
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl
                       bg-white/6 border border-white/10 text-slate-300 text-xs font-semibold
                       hover:bg-white/12 hover:text-white transition-all duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF Rekap
          </button>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl
                       bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold
                       hover:bg-emerald-500/25 transition-all duration-150"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}