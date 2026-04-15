'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/navbar';
import Hero from '@/components/landing/hero';
import Tutorial from '@/components/landing/tutorial';
import Statistics from '@/components/landing/statistics';
import About from '@/components/landing/about';
import Testimonials from '@/components/landing/testimonials';
import Footer from '@/components/landing/footer';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/siswa');
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Navbar />

      <div className="fixed inset-0 z-0">
        <Hero />
      </div>

      <div className="h-screen" />

      <main className="relative z-10">
        <Tutorial />
        <Statistics />
        <About />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}