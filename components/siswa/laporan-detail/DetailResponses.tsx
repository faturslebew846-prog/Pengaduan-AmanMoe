'use client';

import React, { useEffect, useState } from 'react';
import { ReportResponse } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, ZoomIn, X, Camera } from 'lucide-react';

interface UserProfile { nama: string; foto?: string; role?: string }

function fmtShort(d: any) {
  if (!d) return '';
  const dt = d?.toDate ? d.toDate() : new Date(d);
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Avatar
const COLORS = [
  'bg-emerald-500/15 text-emerald-600',
  'bg-blue-500/15 text-blue-600',
  'bg-violet-500/15 text-violet-600',
  'bg-amber-500/15 text-amber-600',
];
function avatarColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}
function initials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function Avatar({ foto, nama, size }: { foto?: string; nama: string; size: number }) {
  if (foto) return (
    <img src={foto} alt={nama} className="rounded-xl object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className={`rounded-xl flex items-center justify-center font-black flex-shrink-0 ${avatarColor(nama)}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials(nama)}
    </div>
  );
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

// ── Bubble ─────────────────────────────────────────────────────
function ResponseBubble({ resp }: {
  resp: ReportResponse & { _profile?: UserProfile }
}) {
  const [preview, setPreview] = useState(false);
  const nama = resp._profile?.nama ?? 'Petugas';

  return (
    <div className="flex flex-col gap-2">
      {/* Header bubble */}
      <div className="flex items-center gap-2">
        <Avatar foto={resp._profile?.foto} nama={nama} size={32} />
        <div>
          <p className="text-xs font-bold text-slate-700 leading-tight">{nama}</p>
          <p className="text-[10px] text-slate-400">{fmtShort(resp.createdAt)}</p>
        </div>
        {/* Role badge */}
        <span className="ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full
                         bg-emerald-50 text-emerald-600 border border-emerald-100">
          Tim Sekolah
        </span>
      </div>

      {/* Bubble body */}
      <div className="ml-10 bg-emerald-50 border border-emerald-200 rounded-2xl rounded-tl-sm
                      px-4 py-3.5 space-y-3">
        <p className="text-sm text-slate-700 leading-relaxed">{resp.tanggapan}</p>

        {/* Foto bukti */}
        {resp.foto && (
          <>
            <div className="relative rounded-xl overflow-hidden cursor-pointer group border border-emerald-200"
              onClick={() => setPreview(true)}>
              <img src={resp.foto} alt="Foto bukti"
                className="w-full max-h-52 object-cover transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors
                              flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 w-9 h-9 rounded-full bg-white/90
                                flex items-center justify-center transition-all duration-200">
                  <ZoomIn className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              {/* Label foto */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent
                              px-3 py-2 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-white/80" />
                <span className="text-[10px] text-white/80 font-medium">Foto bukti penanganan</span>
              </div>
            </div>
            {preview && <PhotoPreview src={resp.foto} onClose={() => setPreview(false)} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
interface Props { responses: ReportResponse[] }

export default function DetailResponses({ responses }: Props) {
  const [enriched, setEnriched] = useState<(ReportResponse & { _profile?: UserProfile })[]>([]);

  useEffect(() => {
    Promise.all(responses.map(async r => {
      if (!r.petugasId) return r;
      const s = await getDoc(doc(db, 'users', r.petugasId));
      return { ...r, _profile: s.exists() ? (s.data() as UserProfile) : undefined };
    })).then(setEnriched);
  }, [responses]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100
                          flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-sm font-bold text-slate-700">Tanggapan Tim Sekolah</span>
        </div>
        {enriched.length > 0 && (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {enriched.length} tanggapan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {enriched.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100
                            flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-slate-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Belum ada tanggapan</p>
              <p className="text-xs text-slate-400 mt-1">
                Tim sekolah akan segera merespons laporanmu
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {enriched.map((r, i) => (
              <div key={r.id}>
                <ResponseBubble resp={r} />
                {i < enriched.length - 1 && (
                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}