'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, Zap, CheckCircle2, Lock, MapPin, Heart } from 'lucide-react';

const keunggulan = [
  {
    icon: ShieldCheck,
    title: 'Aman & Terpercaya',
    desc: 'Data laporan dilindungi penuh. Tidak ada akses tidak sah ke informasi pribadimu.',
  },
  {
    icon: Zap,
    title: 'Respon Cepat',
    desc: 'Petugas mendapat notifikasi seketika. Tidak ada laporan yang tenggelam.',
  },
  {
    icon: CheckCircle2,
    title: 'Tindak Lanjut Nyata',
    desc: 'Setiap laporan diproses serius hingga mendapat solusi yang bisa diverifikasi.',
  },
  {
    icon: Lock,
    title: 'Privasi Terjaga',
    desc: 'Identitasmu bisa dirahasiakan sepenuhnya. Lapor tanpa rasa takut.',
  },
];

export default function About() {
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
            }, i * 100);
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
      id="about-section"
      className="relative bg-white px-6 sm:px-10 lg:px-20 py-24 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600">
            Tentang kami
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div
          ref={contentRef}
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
              Amanmoe lahir dari
              <span className="text-emerald-600"> kepedulian nyata.</span>
            </h2>
            <div className="space-y-4 text-slate-500 text-base leading-relaxed">
              <p>
                <span className="text-slate-800 font-semibold">SMK Muhammadiyah 4 Yogyakarta</span> adalah
                sekolah kejuruan yang berkomitmen menciptakan lingkungan belajar terbaik bagi siswanya.
              </p>
              <p>
                Amanmoe hadir sebagai jembatan digital antara siswa dan manajemen sekolah.
                Kami percaya setiap keluhan berhak didengar dan setiap masalah berhak diselesaikan.
              </p>
              <p>
                Platform ini dikelola langsung oleh tim TKJ sekolah dan terus berkembang
                berdasarkan masukan pengguna nyata.
              </p>
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
              <span>Jl. Suryodiningratan No.862, Mantrijeron, Yogyakarta</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
              <img
                src="/images/hero-bg.web.jpeg"
                alt="SMK Muhammadiyah 4 Yogyakarta"
                className="w-full h-64 sm:h-72 object-cover"
                style={{ filter: 'brightness(0.88) saturate(1.1)' }}
              />
              <div className="absolute bottom-0 left-0 right-0
                              bg-gradient-to-t from-slate-900/80 to-transparent px-5 py-4">
                <p className="text-white text-sm font-semibold">SMK Muhammadiyah 4 Yogyakarta</p>
                <p className="text-emerald-300 text-xs">Suryodiningratan, Yogyakarta</p>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white
                            px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/30">
              Est. 1964
            </div>
          </div>
        </div>

        {/* Keunggulan */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-6">
            Keunggulan Amanmoe
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keunggulan.map((k, i) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.title}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    transition: 'opacity 0.55s ease, transform 0.55s ease',
                  }}
                  className="group flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100
                             hover:border-emerald-200 hover:bg-emerald-50/50
                             hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200
                                  flex items-center justify-center flex-shrink-0
                                  group-hover:bg-emerald-500 group-hover:border-emerald-500
                                  transition-all duration-300">
                    <Icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{k.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{k.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info sekolah */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-7 flex flex-col sm:flex-row
                        items-center gap-5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30
                          flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-0.5">Dikelola secara resmi oleh</p>
            <p className="text-white font-bold text-base">SMK Muhammadiyah 4 Yogyakarta</p>
            <p className="text-slate-500 text-sm mt-1">
              Berkomitmen menciptakan lingkungan sekolah yang aman, nyaman, dan responsif.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}