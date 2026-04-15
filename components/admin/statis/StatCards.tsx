'use client';

import { FileText, Clock, Zap, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  total: number;
  menunggu: number;
  diproses: number;
  selesai: number;
  palsu: number;
}

interface CardDef {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  iconCls: string;
  valCls: string;
  subCls: string;
}

export function StatCards({ total, menunggu, diproses, selesai, palsu }: StatCardsProps) {
  const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
  const mPct = total > 0 ? Math.round((menunggu / total) * 100) : 0;

  const cards: CardDef[] = [
    {
      label: 'Total Laporan',
      value: total,
      sub: 'semua waktu',
      icon: FileText,
      iconCls: 'bg-slate-100 text-slate-500',
      valCls: 'text-slate-800',
      subCls: 'text-slate-400',
    },
    {
      label: 'Menunggu',
      value: menunggu,
      sub: `${mPct}% dari total`,
      icon: Clock,
      iconCls: 'bg-amber-50 text-amber-500',
      valCls: 'text-amber-600',
      subCls: 'text-amber-400',
    },
    {
      label: 'Diproses',
      value: diproses,
      sub: 'sedang ditangani',
      icon: Zap,
      iconCls: 'bg-blue-50 text-blue-500',
      valCls: 'text-blue-600',
      subCls: 'text-blue-400',
    },
    {
      label: 'Selesai',
      value: selesai,
      sub: `${pct}% berhasil`,
      icon: CheckCircle2,
      iconCls: 'bg-emerald-50 text-emerald-500',
      valCls: 'text-emerald-600',
      subCls: 'text-emerald-400',
    },
    {
      label: 'Tidak Valid',
      value: palsu,
      sub: `${total > 0 ? Math.round((palsu / total) * 100) : 0}% ditolak`,
      icon: XCircle,
      iconCls: 'bg-red-50 text-red-500',
      valCls: 'text-red-500',
      subCls: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, sub, icon: Icon, iconCls, valCls, subCls }) => (
        <div
          key={label}
          className="bg-white border border-slate-100 rounded-2xl p-4 overflow-hidden relative"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${iconCls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className={`text-2xl font-black tabular-nums leading-none mb-1 ${valCls}`}>
            {value}
          </p>
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <p className={`text-[10px] mt-0.5 ${subCls}`}>{sub}</p>
        </div>
      ))}
    </div>
  );
}

export function InsightBar({ total, selesai, avgDays }: { total: number; selesai: number; avgDays: number }) {
  const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-6 flex-wrap">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
          Tingkat penyelesaian
        </p>
        <p className="text-3xl font-black text-emerald-500">{pct}%</p>
      </div>
      <div className="flex-1 min-w-[140px]">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {selesai} dari {total} laporan diselesaikan
        </p>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-slate-300" />
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Resp. time rata-rata</p>
          <p className="text-lg font-black text-slate-800">
            {avgDays.toFixed(1)}{' '}
            <span className="text-xs font-medium text-slate-400">hari</span>
          </p>
        </div>
      </div>
    </div>
  );
}