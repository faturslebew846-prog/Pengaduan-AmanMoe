'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getReportsByUserId } from '@/lib/firestore-service';
import { Report } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function SiswaDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    palsu: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const load = async () => {
      const data = await getReportsByUserId(user.uid);

      setReports(data);

      setStats({
        total: data.length,
        menunggu: data.filter(r => r.status === 'menunggu').length,
        diproses: data.filter(r => r.status === 'diproses').length,
        selesai: data.filter(r => r.status === 'selesai').length,
        palsu: data.filter(r => r.status === 'palsu').length,
      });
    };

    load();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="bg-white">

      {/* ================= HERO ================= */}
      <section className="h-screen relative flex items-center justify-center text-white">

        {/* background image */}
        <div className="absolute inset-0">
          <img
            src="/images/smkm4-new-revisi.png"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* content */}
        <div className="relative z-10 text-center px-6">

          <h1 className="text-5xl font-bold mb-4">
            Selamat Datang, {user?.nama}
          </h1>

          <p className="text-lg opacity-90 mb-6">
            Dashboard pelaporan siswa SMK Muhammadiyah 4 Yogyakarta
          </p>

          <Button
            onClick={() =>
              document
                .getElementById('dashboard')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-green-600 hover:bg-green-700"
          >
            Lihat Dashboard
          </Button>

        </div>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30"
        >
          Logout
        </button>
      </section>

      {/* ================= DASHBOARD ================= */}
      <section
        id="dashboard"
        className="py-16 px-4 bg-gradient-to-b from-green-50 to-white"
      >
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold mb-8">
            Dashboard Laporan
          </h2>

          {/* STAT */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">

            <StatCard label="Total" value={stats.total} color="bg-gray-200" />
            <StatCard label="Menunggu" value={stats.menunggu} color="bg-yellow-400" />
            <StatCard label="Diproses" value={stats.diproses} color="bg-blue-500" />
            <StatCard label="Selesai" value={stats.selesai} color="bg-green-500" />
            <StatCard label="Palsu" value={stats.palsu} color="bg-red-500" />

          </div>

        </div>
      </section>

      {/* ================= LAPORAN ================= */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold mb-8">
            Laporan Saya
          </h2>

          {reports.length === 0 ? (
            <p className="text-gray-500">
              Belum ada laporan
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">

              {reports.map((r) => (
                <Card
                  key={r.id}
                  className="p-4 hover:shadow-xl transition cursor-pointer"
                  onClick={() => router.push(`/laporan/${r.id}`)}
                >
                  <h3 className="font-bold text-lg mb-2">
                    {r.judul}
                  </h3>

                  <p className="text-sm text-gray-500 mb-2">
                    {r.isi?.substring(0, 80)}...
                  </p>

                  <span
                    className={`px-3 py-1 text-xs rounded-full
                      ${
                        r.status === 'menunggu'
                          ? 'bg-yellow-400'
                          : r.status === 'diproses'
                          ? 'bg-blue-500 text-white'
                          : r.status === 'selesai'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                  >
                    {r.status}
                  </span>
                </Card>
              ))}

            </div>
          )}

        </div>
      </section>

    </div>
  );
}


// ================= COMPONENT =================

function StatCard({ label, value, color }: any) {
  return (
    <div className={`${color} p-6 rounded-xl text-center shadow`}>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}