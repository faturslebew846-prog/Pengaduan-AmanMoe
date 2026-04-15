'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllReports } from '@/lib/firestore-service';
import { Report } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  TrendingUp, ArrowRight, MapPin, ChevronRight,
  Activity, Zap, ShieldAlert, BarChart3,
} from 'lucide-react';

// ── HELPERS ───────────────────────────────────────────────────
function fmtDate(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function fmtTime(d: any) {
  if (!d) return '';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG = {
  menunggu: { label: 'Menunggu',  pill: 'bg-amber-100 text-amber-800 border-amber-200',  dot: 'bg-amber-500' },
  diproses: { label: 'Diproses',  pill: 'bg-blue-100 text-blue-800 border-blue-200',      dot: 'bg-blue-500' },
  selesai:  { label: 'Selesai',   pill: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  palsu:    { label: 'Tdk Valid', pill: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500' },
} as const;

// ── STAT CARD ─────────────────────────────────────────────────
function BigStat({
  label, value, sub, icon: Icon, from, to, textColor, delay,
}: {
  label: string; value: number; sub: string;
  icon: React.ElementType; from: string; to: string; textColor: string; delay: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`adm-card relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${from} ${to} text-white`}
    >
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-1 -bottom-1 w-14 h-14 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-3xl font-black tabular-nums mb-0.5">{value}</p>
        <p className="text-sm font-semibold opacity-90">{label}</p>
        <p className="text-xs opacity-60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── MINI STAT ─────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <span className="text-xs font-bold text-slate-800 tabular-nums">{value}</span>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user } = useAuth();
  const router   = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    total:    reports.length,
    menunggu: reports.filter(r => r.status === 'menunggu').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai:  reports.filter(r => r.status === 'selesai').length,
    palsu:    reports.filter(r => r.status === 'palsu').length,
  };

  const pct        = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;
  const urgentPct  = stats.total > 0 ? Math.round((stats.menunggu / stats.total) * 100) : 0;

  const latest = [...reports]
    .sort((a, b) => {
      const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
      const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
      return tb.getTime() - ta.getTime();
    })
    .slice(0, 8);

  useEffect(() => {
    getAllReports()
      .then(data => setReports(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat data...</span>
        </div>
      </div>
    );
  }

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';
  const firstName = (user?.nama ?? 'Admin').split(' ')[0];

  return (
    <>
      <style>{`
        @keyframes adm-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adm-card { animation: adm-in 0.5s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── TOP BANNER ───────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-10">
            <p className="text-emerald-400 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              {firstName} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              {stats.total === 0
                ? 'Belum ada laporan masuk hari ini.'
                : `${stats.total} laporan total · ${stats.menunggu} menunggu tindakan · ${pct}% selesai`}
            </p>

            {/* Progress */}
            {stats.total > 0 && (
              <div className="mt-5 max-w-md">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Tingkat penyelesaian
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pb-10 -mt-5">

          {/* BIG STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <BigStat
              icon={FileText} label="Total Laporan" value={stats.total}
              sub="semua status" from="from-slate-700" to="to-slate-900"
              textColor="text-white" delay={0}
            />
            <BigStat
              icon={Clock} label="Menunggu" value={stats.menunggu}
              sub={`${urgentPct}% dari total`} from="from-amber-500" to="to-orange-600"
              textColor="text-white" delay={80}
            />
            <BigStat
              icon={Zap} label="Diproses" value={stats.diproses}
              sub="sedang ditangani" from="from-blue-500" to="to-blue-700"
              textColor="text-white" delay={160}
            />
            <BigStat
              icon={CheckCircle2} label="Selesai" value={stats.selesai}
              sub={`${pct}% berhasil`} from="from-emerald-500" to="to-teal-600"
              textColor="text-white" delay={240}
            />
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LAPORAN TERBARU — 2/3 */}
            <div className="lg:col-span-2 adm-card bg-white rounded-2xl border border-slate-100
                            shadow-sm overflow-hidden" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Laporan Terbaru
                </h2>
                <button
                  onClick={() => router.push('/dashboard/all-reports')}
                  className="text-[11px] text-emerald-600 hover:text-emerald-500
                             flex items-center gap-1 font-semibold"
                >
                  Lihat semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-50">
                {latest.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Belum ada laporan
                  </div>
                ) : latest.map((r, i) => {
                  const st = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.menunggu;
                  return (
                    <div
                      key={r.id}
                      onClick={() => router.push('/dashboard/all-reports')}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50
                                 cursor-pointer transition-colors duration-150 group"
                      style={{ animationDelay: `${300 + i * 40}ms` }}
                    >
                      {/* Dot status */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate
                                      group-hover:text-emerald-700 transition-colors">
                          {r.judul}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{r.lokasi}</span>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.pill}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-300">{fmtDate(r.createdAt)}</span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400
                                            transition-colors flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SIDEBAR KANAN — 1/3 */}
            <div className="flex flex-col gap-4">

              {/* Ringkasan status */}
              <div className="adm-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                style={{ animationDelay: '360ms' }}>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Ringkasan Status
                </h3>
                <MiniStat label="Menunggu"   value={stats.menunggu} color="bg-amber-500" />
                <MiniStat label="Diproses"   value={stats.diproses} color="bg-blue-500" />
                <MiniStat label="Selesai"    value={stats.selesai}  color="bg-emerald-500" />
                <MiniStat label="Tidak Valid" value={stats.palsu}    color="bg-red-400" />

                {/* Bar visual */}
                {stats.total > 0 && (
                  <div className="mt-3 h-2 rounded-full overflow-hidden flex gap-0.5">
                    {[
                      { w: (stats.selesai  / stats.total) * 100, color: 'bg-emerald-500' },
                      { w: (stats.diproses / stats.total) * 100, color: 'bg-blue-500' },
                      { w: (stats.menunggu / stats.total) * 100, color: 'bg-amber-500' },
                      { w: (stats.palsu    / stats.total) * 100, color: 'bg-red-400' },
                    ].filter(s => s.w > 0).map((s, i) => (
                      <div key={i} className={`h-full rounded-full ${s.color} transition-all duration-700`}
                        style={{ width: `${s.w}%` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Perlu perhatian */}
              {stats.menunggu > 0 && (
                <div className="adm-card rounded-2xl p-5 bg-amber-50 border border-amber-200"
                  style={{ animationDelay: '420ms' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">Perlu Tindakan</span>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed mb-3">
                    Ada <span className="font-black">{stats.menunggu}</span> laporan yang belum
                    ditangani dan menunggu responmu.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard/all-reports')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-white text-xs
                               font-bold py-2 rounded-lg transition-colors duration-200"
                  >
                    Tangani Sekarang →
                  </button>
                </div>
              )}

              {/* Sistem info */}
              <div className="adm-card bg-slate-900 rounded-2xl p-5"
                style={{ animationDelay: '480ms' }}>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Info Sistem
                </h3>
                {[
                  ['Platform', 'Next.js + Firebase'],
                  ['Storage',  'Cloudinary'],
                  ['Sekolah',  'SMK Muh. 4 YK'],
                  ['Versi',    'AmanMoe v1.0'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5
                                         border-b border-white/5 last:border-0">
                    <span className="text-[11px] text-slate-500">{k}</span>
                    <span className="text-[11px] font-medium text-slate-300">{v}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}