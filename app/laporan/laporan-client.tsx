'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReportsByUserId } from '@/lib/firestore-service';
import { Report } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  ArrowLeft
} from 'lucide-react';

export default function LaporanSayaClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    palsu: 0,
  });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const loadReports = async () => {
      try {
        const data = await getReportsByUserId(user.uid);

        setReports(data);

        const statistik = {
          total: data.length,
          menunggu: data.filter(r => r.status === 'menunggu').length,
          diproses: data.filter(r => r.status === 'diproses').length,
          selesai: data.filter(r => r.status === 'selesai').length,
          palsu: data.filter(r => r.status === 'palsu').length,
        };

        setStats(statistik);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    loadReports();
  }, [user, loading, router]);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-6 text-green-700 hover:text-green-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>

        {/* HEADER HERO */}
        <div className="relative mb-10 rounded-3xl overflow-hidden bg-gradient-to-r from-green-700 to-emerald-600 text-white p-8 shadow-xl">

          {/* glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl" />

          <h1 className="text-3xl font-bold mb-2">
            Dashboard Laporan Saya
          </h1>
          <p className="text-green-100">
            Pantau semua laporan yang telah kamu kirim secara real-time
          </p>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {[
            { label: 'Total', value: stats.total, icon: <FileText />, color: 'text-green-700' },
            { label: 'Menunggu', value: stats.menunggu, icon: <Clock />, color: 'text-yellow-600' },
            { label: 'Diproses', value: stats.diproses, icon: <AlertCircle />, color: 'text-blue-600' },
            { label: 'Selesai', value: stats.selesai, icon: <CheckCircle />, color: 'text-green-600' },
            { label: 'Palsu', value: stats.palsu, icon: <AlertCircle />, color: 'text-red-600' },
          ].map((item, i) => (
            <Card
              key={i}
              className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-md hover:shadow-xl transition hover:-translate-y-1"
            >
              <div className={`mb-2 ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </Card>
          ))}
        </div>

        {/* LIST HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-green-900">
            Laporan Saya
          </h2>

          <button
            onClick={() => router.push('/#report-form-section')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow transition"
          >
            + Buat Laporan
          </button>
        </div>

        {/* LIST */}
        {reports.length === 0 ? (
          <div className="text-center py-16 bg-white/70 rounded-2xl border border-gray-200 shadow">
            <p className="text-gray-500 mb-4">
              Kamu belum membuat laporan
            </p>
            <button
              onClick={() => router.push('/#report-form-section')}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Buat Laporan Pertama
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => router.push(`/laporan/${report.id}`)}
                className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer flex flex-col"
              >

                {/* IMAGE */}
                {report.foto && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={report.foto}
                      alt="foto"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}

                {/* CONTENT */}
                <div className="p-4 flex flex-col gap-2">

                  {/* STATUS */}
                  <span
                    className={`w-fit px-3 py-1 text-xs rounded-full font-medium
                    ${
                      report.status === 'menunggu'
                        ? 'bg-yellow-100 text-yellow-700'
                        : report.status === 'diproses'
                        ? 'bg-blue-100 text-blue-700'
                        : report.status === 'selesai'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {report.status}
                  </span>

                  {/* TITLE */}
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {report.judul}
                  </h3>

                  {/* DESC */}
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {report.isi}
                  </p>

                  {/* LOCATION */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {report.lokasi}
                  </div>

                  {/* DATE */}
                  <p className="text-xs text-gray-400 mt-auto">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}