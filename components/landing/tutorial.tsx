'use client';

import { useEffect, useRef } from 'react';
import { LogIn, FileText, Bell, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: LogIn,
    title: 'Login Akun',
    desc: 'Masuk menggunakan akun siswa yang sudah terdaftar di sistem sekolah.',
    num: '01',
  },
  {
    icon: FileText,
    title: 'Buat Laporan',
    desc: 'Isi formulir laporan dengan jelas — tambahkan foto sebagai bukti jika perlu.',
    num: '02',
  },
  {
    icon: Bell,
    title: 'Tunggu Respon',
    desc: 'Petugas memproses laporanmu dan mengirim notifikasi perkembangan secara real-time.',
    num: '03',
  },
  {
    icon: CheckCircle2,
    title: 'Masalah Selesai',
    desc: 'Laporan ditindaklanjuti hingga tuntas. Kamu menerima konfirmasi penyelesaian.',
    num: '04',
  },
];

export default function Tutorial() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, i * 110);
            obs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      id="cara-kerja"
      className="relative bg-white rounded-t-[2.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]
                 px-6 sm:px-10 lg:px-20 pt-16 pb-24"
    >
      {/* pull handle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-200" />

      {/* label */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600">
          Cara kerja
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-3">
        Empat langkah,
        <span className="text-emerald-600"> satu tujuan.</span>
      </h2>
      <p className="text-slate-500 text-base sm:text-lg mb-14 max-w-xl">
        Proses pelaporan dirancang sesederhana mungkin agar tidak ada hambatan untuk melapor.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                opacity: 0,
                transform: 'translateY(32px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
              className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-6
                         hover:shadow-md hover:-translate-y-1 hover:border-emerald-200
                         transition-all duration-300"
            >
              {/* nomor dekoratif */}
              <span className="absolute top-4 right-5 text-[64px] font-black leading-none
                               text-slate-100 select-none group-hover:text-emerald-50 transition-colors">
                {step.num}
              </span>

              {/* icon */}
              <div className="relative w-11 h-11 rounded-xl bg-emerald-600 flex items-center
                              justify-center mb-5 shadow-sm group-hover:bg-emerald-500
                              transition-colors duration-300">
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}