'use client';

import React from 'react';
import Image from 'next/image';
import {
  Phone, Mail, MapPin,
  Facebook, Instagram, Youtube, Globe,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">

      {/* Decorative glow — emerald, konsisten dengan tema */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-8">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/smkm4-new-revisi.png"
                alt="AmanMoe"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-base font-bold text-white">AmanMoe</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Wadah resmi pelaporan siswa SMK Muhammadiyah 4 Yogyakarta — cepat, anonim, dan tuntas.
            </p>
            {/* Sosmed */}
            <div className="flex gap-2">
              {[
                { href: 'https://www.facebook.com/SMKMUPATYO#', Icon: Facebook },
                { href: 'https://www.instagram.com/smkmupatyo/', Icon: Instagram },
                { href: 'https://www.youtube.com/channel/UCLORXm10gGxUBZa5THSSi0w', Icon: Youtube },
                { href: 'https://smkmuh4-yog.sch.id/', Icon: Globe },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10
                             hover:bg-emerald-500/20 hover:border-emerald-500/30
                             flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGASI */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {[
                { label: 'Beranda', href: '#' },
                { label: 'Buat Laporan', href: '#report-form-section' },
                { label: 'Tentang Amanmoe', href: '#about-section' },
                { label: 'Masuk', href: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* KONTAK */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-4">
              Kontak Sekolah
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href="tel:0274384992"
                  className="flex items-start gap-2.5 hover:text-emerald-400 transition-colors duration-200"
                >
                  <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  (0274) 384992
                </a>
              </li>
              <li>
                <a
                  href="mailto:smkmuh4yk@gmail.com"
                  className="flex items-start gap-2.5 hover:text-emerald-400 transition-colors duration-200"
                >
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  smkmuh4yk@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                <span>Jl. Suryodiningratan No.862, Yogyakarta</span>
              </li>
              <li className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500">Buka · Tutup pukul 15.30</span>
              </li>
            </ul>
          </div>

          {/* TENTANG SEKOLAH */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-4">
              Sekolah
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {[
                { label: 'Website Resmi', href: 'https://smkmuh4-yog.sch.id/' },
                { label: 'Instagram', href: 'https://www.instagram.com/smkmupatyo/' },
                { label: 'Facebook', href: 'https://www.facebook.com/SMKMUPATYO#' },
                { label: 'Youtube', href: 'https://www.youtube.com/channel/UCLORXm10gGxUBZa5THSSi0w' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between
                        items-center gap-3 text-xs text-slate-600">
          <p>© 2026 AmanMoe · SMK Muhammadiyah 4 Yogyakarta. Hak cipta dilindungi.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-400 transition-colors duration-200">Privasi</a>
            <a href="#" className="hover:text-slate-400 transition-colors duration-200">Ketentuan</a>
            <a href="#" className="hover:text-slate-400 transition-colors duration-200">Aksesibilitas</a>
          </div>
        </div>

      </div>
    </footer>
  );
}