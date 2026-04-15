'use client';

import React from 'react';
import { Report } from '@/lib/types';
import {
  MapPin, Clock, ImageIcon, ChevronRight,
  FileX, Eye, Tag, User,
} from 'lucide-react';

// ── STATUS CONFIG ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string; row: string }> = {
  menunggu: {
    label: 'Menunggu',
    pill: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot:  'bg-amber-500',
    row:  'border-l-amber-400',
  },
  diproses: {
    label: 'Diproses',
    pill: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot:  'bg-blue-500',
    row:  'border-l-blue-400',
  },
  selesai: {
    label: 'Selesai',
    pill: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dot:  'bg-emerald-500',
    row:  'border-l-emerald-400',
  },
  palsu: {
    label: 'Tidak Valid',
    pill: 'bg-red-100 text-red-700 border border-red-200',
    dot:  'bg-red-500',
    row:  'border-l-red-400',
  },
};

function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── SKELETON ───────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-slate-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="h-6 w-20 bg-slate-100 rounded-full" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
  );
}

// ── GRID CARD ──────────────────────────────────────────────────
function ReportGridCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const st = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.menunggu;
  const namaPelapor = (report as any).namaPelapor;
  const kategori    = (report as any).kategori;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden
                 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {report.foto ? (
        <div className="h-36 overflow-hidden relative">
          <img src={report.foto} alt="foto laporan"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-1 rounded-full ${st.pill}`}>
            {st.label}
          </span>
        </div>
      ) : (
        <div className="h-20 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-200" />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {!report.foto && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.pill}`}>
              {st.label}
            </span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" /> {fmtDate(report.createdAt)}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2
                       group-hover:text-emerald-700 transition-colors duration-200">
          {report.judul}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {report.isi || report.deskripsi}
        </p>

        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{report.lokasi}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-emerald-400
                                   transition-colors duration-200 flex-shrink-0" />
        </div>

        {(namaPelapor || kategori) && (
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {namaPelapor && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                               px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                <User className="w-2.5 h-2.5" /> {namaPelapor}
              </span>
            )}
            {kategori && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                               px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Tag className="w-2.5 h-2.5" /> {kategori}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TABLE ROW ──────────────────────────────────────────────────
function ReportTableRow({ report, onClick, index }: { report: Report; onClick: () => void; index: number }) {
  const st = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.menunggu;
  const namaPelapor = (report as any).namaPelapor;
  const kategori    = (report as any).kategori;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 border-b border-slate-50
                  border-l-2 ${st.row}
                  hover:bg-emerald-50/40 transition-all duration-200 cursor-pointer`}
    >
      {/* No */}
      <span className="text-[11px] text-slate-300 font-mono w-5 flex-shrink-0 text-right">
        {index + 1}
      </span>

      {/* Thumbnail foto kecil */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
        {report.foto
          ? <img src={report.foto} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-slate-300" />
            </div>
        }
      </div>

      {/* Judul + deskripsi singkat */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate
                      group-hover:text-emerald-700 transition-colors duration-200">
          {report.judul}
        </p>
        <p className="text-[11px] text-slate-400 truncate leading-relaxed">
          {report.isi || report.deskripsi}
        </p>
      </div>

      {/* Pelapor */}
      {namaPelapor && (
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500
                        bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0 max-w-[120px]">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{namaPelapor}</span>
        </div>
      )}

      {/* Kategori */}
      {kategori && (
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-600
                        bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg
                        flex-shrink-0 max-w-[120px]">
          <Tag className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{kategori}</span>
        </div>
      )}

      {/* Lokasi */}
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0 max-w-[130px]">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{report.lokasi}</span>
      </div>

      {/* Status */}
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${st.pill}`}>
        {st.label}
      </span>

      {/* Tanggal */}
      <span className="text-[11px] text-slate-400 flex-shrink-0 hidden sm:block">
        {fmtDate(report.createdAt)}
      </span>

      {/* Action */}
      <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex-shrink-0
                         flex items-center justify-center text-slate-400
                         group-hover:border-emerald-300 group-hover:text-emerald-500
                         transition-all duration-200 opacity-0 group-hover:opacity-100">
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
interface ReportListProps {
  loading: boolean;
  filteredReports: Report[];
  openDetail: (report: Report) => void;
  totalReports?: number;
  viewMode?: 'grid' | 'table';
}

export function ReportList({
  loading, filteredReports, openDetail, totalReports, viewMode = 'grid',
}: ReportListProps) {

  if (loading) {
    return viewMode === 'table' ? (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table header skeleton */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="h-3.5 bg-slate-200 rounded w-40 animate-pulse" />
        </div>
        {[1,2,3,4,5].map(i => <RowSkeleton key={i} />)}
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (filteredReports.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl py-16
                      flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100
                        flex items-center justify-center">
          <FileX className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-sm mb-1">Tidak ada laporan ditemukan</p>
          <p className="text-slate-400 text-xs">Coba ubah atau reset filter pencarian</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Result count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Menampilkan{' '}
          <span className="font-bold text-slate-700">{filteredReports.length}</span>
          {totalReports && totalReports !== filteredReports.length
            ? ` dari ${totalReports}`
            : ''}{' '}
          laporan
        </p>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report, i) => (
            <div key={report.id} className="adm-card" style={{ animationDelay: `${i * 40}ms` }}>
              <ReportGridCard report={report} onClick={() => openDetail(report)} />
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <span className="w-5 flex-shrink-0" />
            <span className="w-10 flex-shrink-0" />
            <span className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Judul Laporan
            </span>
            <span className="hidden md:block w-28 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Pelapor
            </span>
            <span className="hidden lg:block w-28 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Kategori
            </span>
            <span className="hidden sm:block w-32 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Lokasi
            </span>
            <span className="w-20 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Status
            </span>
            <span className="hidden sm:block w-24 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Tanggal
            </span>
            <span className="w-7 flex-shrink-0" />
          </div>

          {/* Rows */}
          <div>
            {filteredReports.map((report, i) => (
              <ReportTableRow
                key={report.id}
                report={report}
                index={i}
                onClick={() => openDetail(report)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}