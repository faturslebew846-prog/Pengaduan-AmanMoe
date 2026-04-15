'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReportsByUserId } from '@/lib/firestore-service';
import { Report } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  MapPin, Plus, ChevronRight, Bell, TrendingUp,
  XCircle, ArrowRight, Sparkles,
} from 'lucide-react';

// ── STATUS CONFIG ──────────────────────────────────────────────
const STATUS = {
  menunggu: { label: 'Menunggu',    pill: 'bg-amber-100 text-amber-800 border border-amber-200',      dot: 'bg-amber-500'   },
  diproses: { label: 'Diproses',    pill: 'bg-blue-100 text-blue-800 border border-blue-200',          dot: 'bg-blue-500'    },
  selesai:  { label: 'Selesai',     pill: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  palsu:    { label: 'Tidak Valid', pill: 'bg-red-100 text-red-700 border border-red-200',              dot: 'bg-red-500'     },
} as const;

function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── STAT CARD ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType; label: string; value: number; color: string; delay: number;
}) {
  return (
    <div style={{ animationDelay: `${delay}ms` }}
      className="dash-card group relative bg-white border border-slate-100 rounded-2xl p-5
                 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
      <div className="absolute bottom-0 left-5 right-5 h-px bg-emerald-400/0
                      group-hover:bg-emerald-400/40 transition-all duration-500" />
    </div>
  );
}

// ── RECENT ROW ─────────────────────────────────────────────────
function RecentRow({ report, onClick }: { report: Report; onClick: () => void }) {
  const st = STATUS[report.status as keyof typeof STATUS] ?? STATUS.menunggu;
  return (
    <div onClick={onClick}
      className="group flex items-center gap-3 px-5 py-3.5 border-b border-slate-50
                 last:border-0 hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
      {report.foto
        ? <img src={report.foto} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
        : <div className="w-9 h-9 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
            <FileText className="w-4 h-4 text-slate-300" />
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate
                      group-hover:text-emerald-700 transition-colors">{report.judul}</p>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{report.lokasi}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.pill}`}>{st.label}</span>
        <span className="text-[10px] text-slate-300">{fmtDate(report.createdAt)}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function SiswaDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  const stats = {
    total:    reports.length,
    menunggu: reports.filter(r => r.status === 'menunggu').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai:  reports.filter(r => r.status === 'selesai').length,
    palsu:    reports.filter(r => r.status === 'palsu').length,
  };
  const pct = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;
  const recent = reports.slice(0, 5);

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
          <span className="text-sm">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  const firstName = (user as any)?.nama?.split(' ')[0] ?? 'Siswa';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';

  return (
    <>
      <style>{`
        @keyframes dash-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-card { animation: dash-in 0.5s ease-out both; }
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1">{greeting},</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                  {firstName} 👋
                </h1>
                <p className="text-slate-400 text-sm">
                  {stats.total === 0
                    ? 'Belum ada laporan. Yuk buat laporan pertamamu!'
                    : `Kamu punya ${stats.total} laporan · ${pct}% sudah selesai`}
                </p>
              </div>
              <button
                onClick={() => router.push('/siswa/laporan')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                           text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25
                           hover:scale-105 transition-all duration-200 whitespace-nowrap self-start sm:self-auto"
              >
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

          {/* STAT CARDS — overlap hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 -mt-8 mb-8">
            {[
              { icon: FileText,     label: 'Total',       value: stats.total,    color: 'bg-slate-100 text-slate-600',     delay: 0   },
              { icon: Clock,        label: 'Menunggu',    value: stats.menunggu, color: 'bg-amber-100 text-amber-600',     delay: 80  },
              { icon: AlertCircle,  label: 'Diproses',    value: stats.diproses, color: 'bg-blue-100 text-blue-600',       delay: 160 },
              { icon: CheckCircle2, label: 'Selesai',     value: stats.selesai,  color: 'bg-teal-100 text-teal-600',       delay: 240 },
              { icon: XCircle,      label: 'Tidak Valid', value: stats.palsu,    color: 'bg-red-100 text-red-500',         delay: 320 },
            ].map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* TWO-COLUMN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* RECENT LAPORAN — 2/3 */}
            <div className="lg:col-span-2 dash-card bg-white rounded-2xl border border-slate-100
                            shadow-sm overflow-hidden" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Laporan Terbaru
                </h2>
                <button onClick={() => router.push('/siswa/laporan-saya')}
                  className="text-[11px] text-emerald-600 hover:text-emerald-500
                             flex items-center gap-1 font-semibold">
                  Lihat semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {recent.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold text-sm">Belum ada laporan</p>
                    <p className="text-slate-400 text-xs mt-1">Buat laporan pertamamu sekarang</p>
                  </div>
                  <button onClick={() => router.push('/siswa/laporan')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs
                               font-bold px-5 py-2 rounded-xl transition-all duration-200">
                    Buat Laporan
                  </button>
                </div>
              ) : (
                <div>
                  {recent.map(r => (
                    <RecentRow key={r.id} report={r} onClick={() => router.push(`/laporan/${r.id}`)} />
                  ))}
                  {reports.length > 5 && (
                    <div className="px-5 py-3 border-t border-slate-50">
                      <button onClick={() => router.push('/siswa/laporan-saya')}
                        className="w-full flex items-center justify-center gap-2 text-xs
                                   text-emerald-600 font-semibold hover:text-emerald-500
                                   py-2 rounded-xl hover:bg-emerald-50 transition-all duration-200">
                        Lihat {reports.length - 5} laporan lainnya <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR — 1/3 */}
            <div className="flex flex-col gap-4">

              {/* CTA card */}
              <div className="dash-card bg-slate-900 rounded-2xl p-5 relative overflow-hidden"
                style={{ animationDelay: '400ms' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30
                                  flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-black text-white mb-1">Ada yang ingin dilaporkan?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Laporkan masalah di lingkungan sekolahmu agar segera ditindaklanjuti.
                  </p>
                  <button onClick={() => router.push('/siswa/laporan')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm
                               font-bold py-2.5 rounded-xl transition-all duration-200
                               flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Buat Laporan
                  </button>
                </div>
              </div>

              {/* Status summary */}
              <div className="dash-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                style={{ animationDelay: '450ms' }}>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Ringkasan Status</h3>
                {[
                  { label: 'Menunggu',    value: stats.menunggu, dot: 'bg-amber-500'   },
                  { label: 'Diproses',    value: stats.diproses, dot: 'bg-blue-500'    },
                  { label: 'Selesai',     value: stats.selesai,  dot: 'bg-emerald-500' },
                  { label: 'Tidak Valid', value: stats.palsu,    dot: 'bg-red-500'     },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-xs text-slate-600">{s.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{s.value}</span>
                  </div>
                ))}

                {stats.total > 0 && (
                  <div className="mt-3 h-2 rounded-full overflow-hidden flex gap-0.5">
                    {[
                      { w: (stats.selesai  / stats.total) * 100, color: 'bg-emerald-500' },
                      { w: (stats.diproses / stats.total) * 100, color: 'bg-blue-500'    },
                      { w: (stats.menunggu / stats.total) * 100, color: 'bg-amber-500'   },
                      { w: (stats.palsu    / stats.total) * 100, color: 'bg-red-400'     },
                    ].filter(s => s.w > 0).map((s, i) => (
                      <div key={i} className={`h-full rounded-full ${s.color} transition-all duration-700`}
                        style={{ width: `${s.w}%` }} />
                    ))}
                  </div>
                )}

                <button onClick={() => router.push('/siswa/laporan-saya')}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-xs
                             text-emerald-600 font-semibold hover:text-emerald-500
                             py-2 rounded-xl hover:bg-emerald-50 border border-emerald-100
                             transition-all duration-200">
                  Lihat Semua Laporan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}