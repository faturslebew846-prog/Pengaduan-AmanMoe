'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, School, FileText, Info, ShieldCheck, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const scrollToAbout = () => {
    const el = document.getElementById('about-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollDown = () => {
    const el = document.getElementById('cara-kerja');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-fade-right {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-anim-left  { animation: hero-fade-up   0.9s ease-out forwards; }
        .hero-anim-right { animation: hero-fade-right 1.1s ease-out 0.2s both; }
      `}</style>

      <div className="relative w-full min-h-screen overflow-hidden flex items-center py-16 lg:py-0">

        {/* ── BACKGROUND ── */}
        <div className="absolute inset-0">

          {/* Foto: mobile → kanan (gedung kelihatan), desktop → center */}
          <div
            className="w-full h-full bg-cover bg-no-repeat bg-right sm:bg-center"
            style={{
              backgroundImage: "url('/images/hero-bg.web.jpeg')",
              filter: 'brightness(0.55) contrast(1.1) saturate(1.05)',
            }}
          />

          {/* Overlay kiri: hijau tua solid → transparan ke kanan */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/98 via-green-900/75 to-green-800/20" />

          {/* Overlay atas: navbar area */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />

          {/*
            BAWAH HERO: tetap gelap — TIDAK ada fade putih.
            Section Tutorial yang akan naik dan menutup dari bawah.
          */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-950/80 to-transparent" />

          {/* Glow kanan dekoratif */}
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-green-400/8 rounded-full blur-3xl" />
        </div>

        {/* ── CONTENT ── */}
        <div
          className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-16
                     grid grid-cols-1 lg:grid-cols-5 gap-10 items-center
                     min-h-screen py-24"
        >
          {/* LEFT */}
          <div className="lg:col-span-3 flex flex-col justify-center hero-anim-left">

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20
                            border border-green-400/40 rounded-full text-green-200
                            text-xs sm:text-sm w-fit mb-6 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Sistem Resmi · SMK Muhammadiyah 4 Yogyakarta</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white
                           leading-[1.1] tracking-tight mb-5 drop-shadow-lg">
              Suarakan
              <span className="text-green-400"> Masalahmu,</span>
              <br />
              <span className="text-white/90">Jaga Sekolahmu.</span>
            </h1>

            <p className="text-green-100/90 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              Wadah resmi untuk melaporkan kerusakan fasilitas, kebersihan, hingga gangguan ketertiban.
              <span className="text-green-300 font-semibold"> Cepat, anonim, dan tuntas.</span>
            </p>

            {/* Stats */}
            <div className="flex gap-6 mb-8">
              {[
                { label: 'Laporan Masuk',   value: '120+' },
                { label: 'Selesai Ditangani', value: '98%' },
                { label: 'Respon Cepat',    value: '< 24 jam' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-white font-bold text-xl sm:text-2xl">{s.value}</span>
                  <span className="text-green-300/80 text-xs sm:text-sm">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full bg-green-500 hover:bg-green-400 text-white
                                   px-8 py-6 text-sm sm:text-base font-bold rounded-xl
                                   shadow-lg shadow-green-900/40 hover:scale-105
                                   transition-all duration-200">
                  <LogIn className="mr-2 w-5 h-5" />
                  Login &amp; Buat Laporan
                </Button>
              </Link>

              <Button
                onClick={scrollToAbout}
                variant="outline"
                className="w-full sm:w-auto border-white/30 bg-white/10 text-white
                           hover:bg-white/20 px-8 py-6 text-sm sm:text-base font-semibold
                           rounded-xl backdrop-blur-lg hover:scale-105 transition-all duration-200"
              >
                <Info className="mr-2 w-5 h-5" />
                Tentang Amanmoe
              </Button>
            </div>
          </div>

          {/* RIGHT — desktop only */}
          <div className="hidden lg:flex lg:col-span-2 justify-end items-center hero-anim-right">
            <div className="relative">
              <div className="w-72 xl:w-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <img
                  src="/images/hero-bg.web.jpeg"
                  alt="SMK Muhammadiyah 4 Yogyakarta"
                  className="w-full h-64 object-cover object-center"
                  style={{ filter: 'brightness(0.88) saturate(1.1)' }}
                />
                <div className="bg-green-950/90 backdrop-blur-sm px-4 py-3 border-t border-green-800/50">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold leading-tight">
                        SMK Muhammadiyah 4 Yogyakarta
                      </p>
                      <p className="text-green-400 text-[11px]">Suryodiningratan, Yogyakarta</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-xl
                              px-4 py-2 flex items-center gap-2 border border-green-100">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">Sistem Aktif</span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-xl
                              shadow-xl shadow-green-500/30 px-4 py-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">100% Anonim</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLL INDICATOR — tetap hijau karena bg masih gelap ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={scrollDown}
            className="flex flex-col items-center gap-1.5 text-green-300/70
                       hover:text-green-200 transition-colors duration-200 hover:scale-110"
          >
            <span className="text-[11px] tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>

      </div>
    </>
  );
}