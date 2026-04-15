'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getAllReports,
  getResponsesByReportId,
} from '@/lib/firestore-service';
import { Report, ReportResponse } from '@/lib/types';
import { ReportFilters } from '@/components/admin/reports/ReportFilter';
import { ReportList } from '@/components/admin/reports/ReportList';
import { ReportDetailModal } from '@/components/admin/reports/ReportDetailModal';
import { FileText, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AllReportsPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter,   setStatusFilter]   = useState('all');
  const [photoFilter,    setPhotoFilter]     = useState('all');
  const [search,         setSearch]          = useState('');
  const [kategoriFilter, setKategoriFilter]  = useState('all');
  const [lokasiFilter,   setLokasiFilter]    = useState('all');
  const [pelaporFilter,  setPelaporFilter]   = useState('all');
  const [viewMode,       setViewMode]        = useState<'grid' | 'table'>('grid');

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [responses,      setResponses]      = useState<ReportResponse[]>([]);
  const [responseText,   setResponseText]   = useState('');

  useEffect(() => {
    getAllReports()
      .then(data => setReports(
        data.sort((a, b) => {
                const ta = new Date(a.createdAt);
                const tb = new Date(b.createdAt);
          return tb.getTime() - ta.getTime();
        })
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:    reports.length,
    menunggu: reports.filter(r => r.status === 'menunggu').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai:  reports.filter(r => r.status === 'selesai').length,
    palsu:    reports.filter(r => r.status === 'palsu').length,
  };

  const filteredReports = reports
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r =>
      r.judul?.toLowerCase().includes(search.toLowerCase()) ||
      (r as any).namaPelapor?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(r =>
      photoFilter === 'with' ? !!r.foto : photoFilter === 'without' ? !r.foto : true
    )
    .filter(r => kategoriFilter === 'all' || (r as any).kategori === kategoriFilter)
    .filter(r => lokasiFilter   === 'all' || r.lokasi            === lokasiFilter)
    .filter(r => pelaporFilter  === 'all' || r.userId            === pelaporFilter);

  const openDetail = async (report: Report) => {
    setSelectedReport(report);
    const res = await getResponsesByReportId(report.id);
    setResponses(res);
  };

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

        {/* ── BANNER ─────────────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-10">
            <p className="text-emerald-400 text-sm font-medium mb-1">Manajemen</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              Semua Laporan
            </h1>
            <p className="text-slate-400 text-sm">
              {stats.total} laporan total · {stats.menunggu} menunggu tindakan
            </p>

            {!loading && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {[
                  { label: 'Total',       value: stats.total,    icon: FileText,     color: 'bg-slate-700 text-slate-300 border-slate-600' },
                  { label: 'Menunggu',    value: stats.menunggu, icon: Clock,        color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  { label: 'Diproses',    value: stats.diproses, icon: AlertCircle,  color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                  { label: 'Selesai',     value: stats.selesai,  icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                  { label: 'Tidak Valid', value: stats.palsu,    icon: XCircle,      color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border
                                text-[12px] font-bold ${color}`}>
                    <Icon className="w-3 h-3" />
                    {value} {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pb-10 mt-6 space-y-5">

          <ReportFilters
            search={search}               setSearch={setSearch}
            statusFilter={statusFilter}   setStatusFilter={setStatusFilter}
            photoFilter={photoFilter}     setPhotoFilter={setPhotoFilter}
            kategoriFilter={kategoriFilter} setKategoriFilter={setKategoriFilter}
            lokasiFilter={lokasiFilter}   setLokasiFilter={setLokasiFilter}
            pelaporFilter={pelaporFilter} setPelaporFilter={setPelaporFilter}
            reports={reports}
            viewMode={viewMode}           setViewMode={setViewMode}
          />

          <ReportList
            loading={loading}
            filteredReports={filteredReports}
            openDetail={openDetail}
            totalReports={stats.total}
            viewMode={viewMode}
          />
        </div>
      </div>

      {selectedReport && (
        <ReportDetailModal
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
          responses={responses}
          responseText={responseText}
          setResponseText={setResponseText}
          userId={user!.uid}
        />
      )}
    </>
  );
}