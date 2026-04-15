'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, MapPin, Clock, Tag,
  Pencil, Trash2, AlertTriangle,
} from 'lucide-react';
import { Report } from '@/lib/types';

// ── STATUS CONFIG ──────────────────────────────────────────────
export const STATUS_CONFIG = {
  menunggu: {
    label: 'Menunggu',
    pill:  'bg-amber-100 text-amber-800 border border-amber-200',
    hero:  'bg-amber-500/15 border-amber-500/25 text-amber-300',
    dot:   'bg-amber-500',
    glow:  'bg-amber-500/10',
  },
  diproses: {
    label: 'Diproses',
    pill:  'bg-blue-100 text-blue-800 border border-blue-200',
    hero:  'bg-blue-500/15 border-blue-500/25 text-blue-300',
    dot:   'bg-blue-500',
    glow:  'bg-blue-500/10',
  },
  selesai: {
    label: 'Selesai',
    pill:  'bg-emerald-100 text-emerald-800 border border-emerald-200',
    hero:  'bg-emerald-500/15 border-emerald-500/25 text-emerald-300',
    dot:   'bg-emerald-500',
    glow:  'bg-emerald-500/10',
  },
  palsu: {
    label: 'Tidak Valid',
    pill:  'bg-red-100 text-red-700 border border-red-200',
    hero:  'bg-red-500/15 border-red-500/25 text-red-300',
    dot:   'bg-red-500',
    glow:  'bg-red-500/10',
  },
} as const;

function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  report: Report;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function DetailHeader({ report, onEdit, onDelete, deleting }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const st = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.menunggu;
  const canEdit = report.status === 'menunggu';

  return (
    <div className="relative bg-slate-900 overflow-hidden pt-20">
      {/* Background */}
      {report.foto && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${report.foto})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900" />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
      {/* Glow sesuai status */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${st.glow} rounded-full blur-3xl pointer-events-none`} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white
                     text-xs font-medium mb-6 transition-colors duration-200">
          <ChevronLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

          {/* Info kiri */}
          <div className="flex-1 min-w-0">
            {/* Status badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border
                               text-xs font-bold ${st.hero}`}>
                <span className={`w-2 h-2 rounded-full ${st.dot} animate-pulse`} />
                {st.label}
              </span>

              {report.kategori && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                 bg-white/8 border border-white/10 text-xs font-medium text-slate-300">
                  <Tag className="w-3 h-3" />
                  {report.kategori}
                </span>
              )}
            </div>

            {/* Judul */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-3">
              {report.judul}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {report.lokasi && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {report.lokasi}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" /> {fmtDate(report.createdAt)}
              </span>
            </div>
          </div>

          {/* Action buttons — hanya saat menunggu */}
          {canEdit && (
            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:pt-1">
              {/* Edit */}
              <button onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-white/8 border border-white/10 text-white text-sm font-semibold
                           hover:bg-white/15 hover:border-white/20 transition-all duration-200">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>

              {/* Delete */}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                             bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold
                             hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/25
                                rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-300 font-medium">Yakin hapus?</span>
                  <button onClick={onDelete} disabled={deleting}
                    className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs
                               font-bold rounded-lg transition-colors disabled:opacity-60">
                    {deleting ? '...' : 'Ya'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs
                               font-bold rounded-lg transition-colors">
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status info jika sudah diproses */}
        {!canEdit && (
          <div className="mt-5 flex items-center gap-2.5 px-4 py-3 bg-white/5 border border-white/8
                          rounded-xl w-fit">
            <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Laporan ini sudah <span className="font-bold text-slate-400">{st.label.toLowerCase()}</span> dan tidak dapat diedit atau dihapus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}