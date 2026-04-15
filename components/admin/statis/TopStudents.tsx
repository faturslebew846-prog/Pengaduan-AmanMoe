'use client';

import { Users } from 'lucide-react';

interface Student {
  uid: string;
  nama?: string;
  kelas?: string;
  foto?: string;
  total: number;
}

const AVATAR_COLORS = [
  'bg-emerald-500/12 text-emerald-600',
  'bg-blue-500/12 text-blue-600',
  'bg-violet-500/12 text-violet-600',
  'bg-amber-500/12 text-amber-600',
  'bg-pink-500/12 text-pink-600',
];
const RANK_STYLES = [
  'bg-amber-50 text-amber-800 border border-amber-200',
  'bg-slate-100 text-slate-600',
  'bg-red-50 text-red-700 border border-red-100',
  'bg-slate-50 text-slate-400',
  'bg-slate-50 text-slate-400',
];
const RANK_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

function getInitials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

export function TopStudents({ students }: { students: Student[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
        <Users className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">Siswa Paling Aktif</h3>
        <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
          Top {students.length}
        </span>
      </div>

      <div className="divide-y divide-slate-50 px-5">
        {students.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Belum ada data</p>
        ) : (
          students.map((s, i) => {
            const nama = s.nama ?? 'Tanpa Nama';
            const avCls = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div key={s.uid} className="flex items-center gap-3 py-3">
                {/* rank */}
                <div className={`w-9 h-7 rounded-lg flex items-center justify-center text-[10px]
                                  font-black flex-shrink-0 ${RANK_STYLES[i] ?? RANK_STYLES[4]}`}>
                  {RANK_LABELS[i] ?? `${i + 1}`}
                </div>

                {/* avatar */}
                {s.foto ? (
                  <img src={s.foto} alt={nama}
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                   text-xs font-black flex-shrink-0 ${avCls}`}>
                    {getInitials(nama)}
                  </div>
                )}

                {/* info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{nama}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.kelas ?? '—'}</p>
                </div>

                {/* count */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-emerald-500 tabular-nums">{s.total}</p>
                  <p className="text-[10px] text-slate-400">laporan</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}