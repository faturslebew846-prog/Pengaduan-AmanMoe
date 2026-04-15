'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { PieChartIcon, LayoutGrid } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  selesai:  '#10b981',
  menunggu: '#f59e0b',
  diproses: '#3b82f6',
  palsu:    '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  selesai: 'Selesai', menunggu: 'Menunggu', diproses: 'Diproses', palsu: 'Tidak Valid',
};
const CAT_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#64748b','#ec4899','#06b6d4'];

interface StatusPieProps {
  data: { name: string; value: number }[];
  total: number;
}

export function StatusPieChart({ data, total }: StatusPieProps) {
  const enriched = data.map(d => ({
    ...d,
    color: STATUS_COLORS[d.name] ?? '#94a3b8',
    label: STATUS_LABELS[d.name] ?? d.name,
    pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
  }));

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
        <PieChartIcon className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">Distribusi Status</h3>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-3 mb-4">
          {enriched.map(d => (
            <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              {d.label} {d.pct}%
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={enriched}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
            >
              {enriched.map((e, i) => (
                <Cell key={i} fill={e.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number, name: string) => [`${val} laporan`, name]}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface CategoryBarProps {
  data: { name: string; total: number }[];
}

export function CategoryBarChart({ data }: CategoryBarProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
        <LayoutGrid className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">Laporan per Kategori</h3>
      </div>
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}