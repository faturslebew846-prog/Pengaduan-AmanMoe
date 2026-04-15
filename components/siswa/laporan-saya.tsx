'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReportsByUserId } from '@/lib/firestore-service';
import { Report } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  MapPin, Plus, Bell, TrendingUp, XCircle,
  Search, SlidersHorizontal, X, Tag,
  ChevronLeft,
} from 'lucide-react';

// ── STATUS CONFIG ──────────────────────────────────────────────
const STATUS = {
  menunggu: { label: 'Menunggu',    pill: 'bg-amber-100 text-amber-800 border border-amber-200',      dot: 'bg-amber-500'   },
  diproses: { label: 'Diproses',    pill: 'bg-blue-100 text-blue-800 border border-blue-200',          dot: 'bg-blue-500'    },
  selesai:  { label: 'Selesai',     pill: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  palsu:    { label: 'Tidak Valid', pill: 'bg-red-100 text-red-700 border border-red-200',              dot: 'bg-red-500'     },
} as const;

const FILTER_TABS = [
  { key: 'semua',    label: 'Semua'        },
  { key: 'menunggu', label: 'Menunggu'     },
  { key: 'diproses', label: 'Diproses'     },
  { key: 'selesai',  label: 'Selesai'      },
  { key: 'palsu',    label: 'Tidak Valid'  },
];

function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── REPORT CARD ────────────────────────────────────────────────
function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const st = STATUS[report.status as keyof typeof STATUS] ?? STATUS.menunggu;
  const kategori = (report as any).kategori;

  return (
    <div onClick={onClick}
      className="lap-card group bg-white border border-slate-100 rounded-2xl overflow-hidden
                 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
      {report.foto && (
        <div className="h-36 overflow-hidden relative">
          <img src={report.foto} alt="foto laporan"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-1 rounded-full ${st.pill}`}>
            {st.label}
          </span>
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {!report.foto && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.pill}`}>
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
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{report.lokasi}</span>
          </div>
          {kategori && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                             px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Tag className="w-2.5 h-2.5" /> {kategori}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function LaporanSayaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [reports, setReports]       = useState<Report[]>([]);
  const [fetching, setFetching]     = useState(true);
  const [statusFilter, setStatus]   = useState('semua');
  const [kategoriFilter, setKategori] = useState('semua');
  const [search, setSearch]         = useState('');

  const stats = {
    total:    reports.length,
    menunggu: reports.filter(r => r.status === 'menunggu').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai:  reports.filter(r => r.status === 'selesai').length,
    palsu:    reports.filter(r => r.status === 'palsu').length,
  };
  const pct = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  // Derive kategori list from real data
  const kategoriList = useMemo(() => {
    const vals = [...new Set(reports.map(r => (r as any).kategori).filter(Boolean))];
    return vals;
  }, [reports]);

  const filtered = reports
    .filter(r => statusFilter === 'semua' || r.status === statusFilter)
    .filter(r => kategoriFilter === 'semua' || (r as any).kategori === kategoriFilter)
    .filter(r =>
      !search.trim() ||
      r.judul?.toLowerCase().includes(search.toLowerCase()) ||
      r.lokasi?.toLowerCase().includes(search.toLowerCase())
    );

  const activeFilterCount = [
    statusFilter !== 'semua',
    kategoriFilter !== 'semua',
    search.trim() !== '',
  ].filter(Boolean).length;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/'); return; }
    getReportsByUserId(user.uid)
      .then(data => setReports(
        data.sort((a, b) => {
          const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
          const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
          return tb.getTime() - ta.getTime();
        })
      ))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user, loading]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat laporan...</span>
        </div>
      </div>
    );
  }

  const filterLabel = () => {
    if (statusFilter === 'semua') return 'Semua Laporan';
    if (statusFilter === 'palsu') return 'Laporan Tidak Valid';
    return `Laporan ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`;
  };

  return (
    <>
      <style>{`
        @keyframes lap-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lap-card { animation: lap-in 0.5s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── HERO ───────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-slate-900 pt-20">
          <div className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/images/hero-bg.web.jpeg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900" />
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-20">
            {/* Back button */}
            <button onClick={() => router.push('/siswa')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs
                         font-medium mb-5 transition-colors duration-200">
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1">Riwayat</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                  Laporan Saya
                </h1>
                <p className="text-slate-400 text-sm">
                  {stats.total === 0
                    ? 'Belum ada laporan.'
                    : `${stats.total} laporan · ${pct}% sudah selesai`}
                </p>
              </div>
              <button onClick={() => router.push('/siswa/laporan')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                           text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25
                           hover:scale-105 transition-all duration-200 whitespace-nowrap self-start sm:self-auto">
                <Plus className="w-4 h-4" /> Buat Laporan
              </button>
            </div>

            {stats.total > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Tingkat penyelesaian
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 -mt-8 mb-6">
            {[
              { icon: FileText,     label: 'Total',       value: stats.total,    color: 'bg-slate-100 text-slate-600', delay: 0   },
              { icon: Clock,        label: 'Menunggu',    value: stats.menunggu, color: 'bg-amber-100 text-amber-600', delay: 60  },
              { icon: AlertCircle,  label: 'Diproses',    value: stats.diproses, color: 'bg-blue-100 text-blue-600',   delay: 120 },
              { icon: CheckCircle2, label: 'Selesai',     value: stats.selesai,  color: 'bg-teal-100 text-teal-600',   delay: 180 },
              { icon: XCircle,      label: 'Tidak Valid', value: stats.palsu,    color: 'bg-red-100 text-red-500',     delay: 240 },
            ].map(s => (
              <div key={s.label} style={{ animationDelay: `${s.delay}ms` }}
                className="lap-card group relative bg-white border border-slate-100 rounded-2xl p-4
                           hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${s.color}`}>
                  <s.icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xl font-black text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-visible">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                                   bg-emerald-500 text-white text-[10px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={() => { setStatus('semua'); setKategori('semua'); setSearch(''); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Cari judul atau lokasi laporan..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm
                             text-slate-800 placeholder-slate-400 bg-white
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                             transition-all duration-200" />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_TABS.map(f => (
                  <button key={f.key} onClick={() => setStatus(f.key)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                                transition-all duration-200
                                ${statusFilter === f.key
                                  ? f.key === 'palsu'
                                    ? 'bg-red-600 text-white shadow'
                                    : 'bg-slate-900 text-white shadow'
                                  : f.key === 'palsu'
                                    ? 'bg-white text-red-500 border border-red-100 hover:border-red-300'
                                    : 'bg-white text-slate-500 border border-slate-100 hover:border-emerald-200'
                                }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Kategori tabs — hanya tampil jika ada data */}
              {kategoriList.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="flex-shrink-0 text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Kategori:
                  </span>
                  {[{ key: 'semua', label: 'Semua' }, ...kategoriList.map(k => ({ key: k, label: k }))].map(k => (
                    <button key={k.key} onClick={() => setKategori(k.key)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200
                                  ${kategoriFilter === k.key
                                    ? 'bg-emerald-500 text-white shadow'
                                    : 'bg-white text-slate-500 border border-slate-100 hover:border-emerald-200'
                                  }`}>
                      {k.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── HEADER LIST ─────────────────────────────── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">
              {filterLabel()}
              <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
            </h2>
          </div>

          {/* ── LIST ────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl py-16
                            flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-slate-700 font-semibold text-sm mb-1">
                  {stats.total === 0 ? 'Belum ada laporan' : 'Tidak ada laporan ditemukan'}
                </p>
                <p className="text-slate-400 text-xs">
                  {stats.total === 0 ? 'Buat laporan pertamamu sekarang' : 'Coba ubah atau reset filter'}
                </p>
              </div>
              {stats.total === 0 && (
                <button onClick={() => router.push('/siswa/laporan')}
                  className="mt-1 bg-emerald-500 hover:bg-emerald-400 text-white
                             text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200">
                  Buat Laporan
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r, i) => (
                <div key={r.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <ReportCard report={r} onClick={() => router.push(`/laporan/${r.id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}