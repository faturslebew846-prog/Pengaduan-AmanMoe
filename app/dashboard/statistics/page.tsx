'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getReportStatistics, getReportsTimeSeries } from '@/lib/firestore-service';

import { StatBanner }      from '@/components/admin/statis/StatBanner';
import { StatCards, InsightBar } from '@/components/admin/statis/StatCards';
import { StatusPieChart, CategoryBarChart } from '@/components/admin/statis/StatCharts';
import { TopStudents }     from '@/components/admin/statis/TopStudents';
import { MonthlyTrend, MonthlyDataPoint } from '@/components/admin/statis/MonthlyTrend';
import { exportFullPDF, exportExcel } from '@/components/admin/statis/exportUtils';

export default function StatisticsPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [stats,       setStats]       = useState<any>(null);
  const [timeSeries,  setTimeSeries]  = useState<MonthlyDataPoint[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [allReports,  setAllReports]  = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard/all-reports');
      return;
    }
    if (!user) return;

    const load = async () => {
      try {
        // ── all reports (for export + top students)
        const snap = await getDocs(collection(db, 'pengaduan'));
        const reports: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllReports(reports);

        // ── top students
        const countMap: Record<string, number> = {};
        reports.forEach(r => { if (r.userId) countMap[r.userId] = (countMap[r.userId] ?? 0) + 1; });
        const usersSnap = await getDocs(collection(db, 'users'));
        const userMap: Record<string, any> = {};
        usersSnap.forEach(d => { userMap[d.id] = d.data(); });
        const topRaw = Object.entries(countMap)
          .map(([uid, total]) => ({ uid, total, ...userMap[uid] }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setTopStudents(topRaw);

        // ── stats & time series
        const [s, ts] = await Promise.all([
          getReportStatistics(),
          getReportsTimeSeries(),
        ]);
        setStats(s);

        // enrich time series with full breakdown per month
        const enriched: MonthlyDataPoint[] = ts.map((point: any) => {
          const [year, mon] = (point.monthKey ?? point.month ?? '').split('-');
          const monthReports = reports.filter(r => {
            const d = r.createdAt?.toDate?.() ?? new Date(r.createdAt);
            return d.getFullYear() === Number(year) && (d.getMonth() + 1) === Number(mon);
          });
          return {
            month:    point.month,
            monthKey: point.monthKey ?? point.month,
            total:    point.total,
            selesai:  monthReports.filter(r => r.status === 'selesai').length,
            menunggu: monthReports.filter(r => r.status === 'menunggu').length,
            diproses: monthReports.filter(r => r.status === 'diproses').length,
            palsu:    monthReports.filter(r => r.status === 'palsu').length,
            reports:  monthReports,
          };
        });
        setTimeSeries(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat statistik...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-sm text-red-400">Gagal memuat data statistik.</p>
      </div>
    );
  }

  const statusData = [
    { name: 'selesai',  value: stats.selesai  },
    { name: 'menunggu', value: stats.menunggu },
    { name: 'diproses', value: stats.diproses },
    { name: 'palsu',    value: stats.palsu    },
  ].filter(d => d.value > 0);

  const categoryData = Object.entries(stats.byCategory as Record<string, number>)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const handleExportPDF = () =>
    exportFullPDF(stats, topStudents, timeSeries, allReports);

  const handleExportExcel = () =>
    exportExcel(stats, topStudents, timeSeries, allReports);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* BANNER */}
      <StatBanner onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />

      {/* BODY */}
      <div className="px-6 sm:px-8 lg:px-10 pb-10 -mt-5 space-y-5">

        {/* STAT CARDS */}
        <StatCards
          total={stats.total}
          menunggu={stats.menunggu}
          diproses={stats.diproses}
          selesai={stats.selesai}
          palsu={stats.palsu}
        />

        {/* INSIGHT BAR */}
        <InsightBar
          total={stats.total}
          selesai={stats.selesai}
          avgDays={stats.avgResponseDays ?? 1.4}
        />

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <StatusPieChart data={statusData} total={stats.total} />
          <CategoryBarChart data={categoryData} />
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopStudents students={topStudents} />
          <MonthlyTrend data={timeSeries} />
        </div>

      </div>
    </div>
  );
}