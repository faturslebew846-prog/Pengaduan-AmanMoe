'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

interface StatData {
  total: number;
  diproses: number;
  selesai: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
  triggered,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  delay: number;
  triggered: boolean;
}) {
  const count = useCountUp(value, 1600, triggered);
  return (
    <div
      style={{
        opacity: triggered ? 1 : 0,
        transform: triggered ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
      className="group relative bg-white/[0.06] border border-white/10 rounded-2xl p-6 lg:p-7
                 hover:bg-white/[0.10] hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20
                      flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="text-4xl sm:text-5xl font-black text-white tabular-nums mb-1">
        {count.toLocaleString('id-ID')}
      </div>
      <div className="text-white font-semibold text-sm mb-0.5">{label}</div>
      <div className="text-slate-500 text-xs">{sub}</div>

      {/* bottom accent line */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r
                      from-emerald-500/0 via-emerald-400/50 to-emerald-500/0
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
    </div>
  );
}

export default function Statistics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [data, setData] = useState<StatData>({ total: 0, diproses: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch data real dari Firestore
  useEffect(() => {
    const loadStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pengaduan'));
        const reports = snapshot.docs.map((doc) => doc.data());
        setData({
          total: reports.length,
          diproses: reports.filter((r) => r.status === 'diproses').length,
          selesai: reports.filter((r) => r.status === 'selesai').length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Trigger count-up saat masuk viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const pctSelesai =
    data.total > 0 ? Math.round((data.selesai / data.total) * 100) : 0;

  return (
    <section
      ref={sectionRef}
      className="relative bg-slate-900 px-6 sm:px-10 lg:px-20 py-24 overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400">
            Data real-time
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              Angka nyata dari
              <br />
              <span className="text-emerald-400">laporan siswa.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Semua data diambil langsung dari database sekolah — tidak ada angka rekayasa.
            </p>
          </div>

          {/* Info cards kanan */}
          <div className="flex flex-col gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3
                            flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-white text-sm font-semibold">
                  {loading ? '—' : `${pctSelesai}%`}
                </span>
                <span className="text-slate-400 text-sm"> laporan berhasil diselesaikan</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3
                            flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-slate-400 text-sm">
                Rata-rata respon{' '}
                <span className="text-white font-semibold">kurang dari 24 jam</span>{' '}
                untuk kasus mendesak.
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className="text-sm">Memuat data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={FileText}
              label="Total Laporan"
              value={data.total}
              sub="sejak sistem aktif"
              delay={0}
              triggered={triggered}
            />
            <StatCard
              icon={Clock}
              label="Sedang Diproses"
              value={data.diproses}
              sub="menunggu tindak lanjut"
              delay={120}
              triggered={triggered}
            />
            <StatCard
              icon={CheckCircle2}
              label="Selesai Ditangani"
              value={data.selesai}
              sub="terkonfirmasi tuntas"
              delay={240}
              triggered={triggered}
            />
          </div>
        )}
      </div>
    </section>
  );
}