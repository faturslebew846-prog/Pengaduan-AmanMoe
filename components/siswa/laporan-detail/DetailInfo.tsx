'use client';

import React, { useState } from 'react';
import { Report } from '@/lib/types';
import { FileText, MapPin, Tag, ZoomIn, X, Clock, ImageIcon } from 'lucide-react';

function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function PhotoPreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 border border-white/20
                   flex items-center justify-center text-white hover:bg-red-500/30 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <img src={src} alt="Preview" onClick={e => e.stopPropagation()}
        className="max-h-[88vh] max-w-full rounded-2xl shadow-2xl" />
    </div>
  );
}

interface Props { report: Report }

export default function DetailInfo({ report }: Props) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-4">

      {/* Isi laporan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-50">
          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-700">Isi Laporan</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {report.isi || report.deskripsi || '—'}
          </p>
        </div>
      </div>

      {/* Foto laporan */}
      {report.foto ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="text-sm font-bold text-slate-700">Foto Laporan</span>
            </div>
            <div className="p-4">
              <div onClick={() => setPreview(true)}
                className="relative rounded-xl overflow-hidden cursor-pointer group border border-slate-100">
                <img src={report.foto} alt="Foto laporan"
                  className="w-full max-h-72 object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors
                                flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 w-12 h-12 rounded-full bg-white/90
                                  flex items-center justify-center transition-all duration-200 scale-75 group-hover:scale-100">
                    <ZoomIn className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 h-16
                                bg-gradient-to-t from-black/50 to-transparent
                                flex items-end px-4 py-3">
                  <span className="text-xs text-white/80 flex items-center gap-1.5">
                    <ZoomIn className="w-3 h-3" /> Tap untuk perbesar
                  </span>
                </div>
              </div>
            </div>
          </div>
          {preview && <PhotoPreview src={report.foto} onClose={() => setPreview(false)} />}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm p-8
                        flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs text-slate-400">Tidak ada foto dilampirkan</p>
        </div>
      )}

      {/* Metadata card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {[
            { icon: Tag,    label: 'Kategori', value: report.kategori },
            { icon: MapPin, label: 'Lokasi',   value: report.lokasi   },
            { icon: Clock,  label: 'Dikirim',  value: fmtDate(report.createdAt) },
          ].map(({ icon: Icon, label, value }) => value ? (
            <div key={label} className="flex items-center gap-3.5 px-5 py-3.5">
              <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100
                              flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
              </div>
            </div>
          ) : null)}
        </div>
      </div>

    </div>
  );
}