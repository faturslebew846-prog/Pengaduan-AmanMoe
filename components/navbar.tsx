'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">

        <div
          className={`flex items-center justify-between h-16 md:h-18 px-5 rounded-2xl border transition-all duration-300
            ${scrolled
              ? 'bg-slate-900/90 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20'
              : 'bg-white/10 backdrop-blur-xl border-white/20 shadow-lg'
            }`}
        >

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/smkm4-new-revisi.png"
              alt="AmanMoe"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <p className="text-base font-bold text-white leading-tight">AmanMoe</p>
              <p className="text-[11px] text-white/60 leading-tight">Sistem Pelaporan Siswa</p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Fitur', id: 'fitur-section' },
              { label: 'Cara Kerja', id: 'cara-kerja' },
              { label: 'Tentang', id: 'about-section' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* AUTH BUTTONS */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-white/80 hover:text-white border border-white/20
                         rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg
                         bg-emerald-500 hover:bg-emerald-400 transition-all duration-200
                         shadow-lg shadow-emerald-500/20"
            >
              Daftar
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed top-0 right-0 h-full w-72 bg-slate-900 border-l border-white/10
                       p-6 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">

            {/* Header drawer */}
            <div className="flex justify-between items-center mb-10">
              <span className="text-white font-bold">Menu</span>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-1">
              {[
                { label: 'Fitur', id: 'fitur-section' },
                { label: 'Cara Kerja', id: 'cara-kerja' },
                { label: 'Tentang', id: 'about-section' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left px-4 py-3 text-white/70 hover:text-white hover:bg-white/5
                             rounded-lg transition-colors duration-200 text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="border border-white/20 py-2.5 rounded-lg text-center text-sm
                           text-white/80 hover:bg-white/10 transition-colors duration-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-500 hover:bg-emerald-400 py-2.5 rounded-lg text-center
                           text-sm font-semibold text-white transition-colors duration-200"
              >
                Daftar
              </Link>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}