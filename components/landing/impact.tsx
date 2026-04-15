'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 120, suffix: '+', label: 'Laporan masuk', sub: 'sejak diluncurkan' },
  { value: 98, suffix: '%', label: 'Terselesaikan', sub: 'rata-rata dalam 24 jam' },
  { value: 4, suffix: ' menit', label: 'Waktu lapor', sub: 'dari buka hingga terkirim' },
  { value: 300, suffix: '+', label: 'Siswa aktif', sub: 'sudah menggunakan Amanmoe' },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatCard({ value, suffix, label, sub, delay, triggerCount }: any) {
  const count = useCountUp(value, 1600, triggerCount);
  return (
    <div
      style={{
        opacity: triggerCount ? 1 : 0,
        transform: triggerCount ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
      className="relative bg-white/[0.06] border border-white/10 rounded-2xl p-6 lg:p-8
                 hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 group"
    >
      <div className="text-4xl sm:text-5xl font-black text-white mb-1 tabular-nums">
        {count}
        <span className="text-emerald-400">{suffix}</span>
      </div>
      <div className="text-white font-semibold text-base mb-1">{label}</div>
      <div className="text-slate-400 text-sm">{sub}</div>
      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-400/60 to-emerald-500/0
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
    </div>
  );
}

export default function Impact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-slate-900 px-6 sm:px-10 lg:px-20 py-24 overflow-hidden"
    >
      {/* Background decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
        {/* Grid dots */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400">
            Dampak nyata
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              Angka yang bicara<br />
              <span className="text-emerald-400">lebih keras</span> dari kata-kata.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Amanmoe bukan sekadar form laporan — ini infrastruktur kepercayaan
              antara siswa dan manajemen sekolah.
            </p>
          </div>

          <div className="flex lg:justify-end items-start pt-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 max-w-xs">
              <p className="text-emerald-300 text-sm italic leading-relaxed">
                "Laporan saya tentang keran rusak di toilet lantai 2 selesai diperbaiki
                keesokan harinya. Saya tidak menyangka secepat itu."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <span className="text-slate-300 text-xs font-medium">Siswa kelas XI — anonim</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 100} triggerCount={triggered} />
          ))}
        </div>
      </div>
    </section>
  );
}