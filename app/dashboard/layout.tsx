'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'petugas') router.push('/');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      {/* MAIN */}
      <main className="flex-1 lg:ml-60 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}