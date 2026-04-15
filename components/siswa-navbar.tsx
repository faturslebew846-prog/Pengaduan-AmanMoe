'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Bell } from 'lucide-react';

// ================= HELPER =================
function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function SiswaNavbar() {
  const router = useRouter();
  const { user } = useAuth();

  const [openProfile, setOpenProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // ================= SCROLL =================
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClick = (e: any) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* NAVBAR */}
        <div
          className={`flex items-center justify-between h-16 px-5 rounded-2xl border transition-all duration-300
            ${
              scrolled
                ? 'bg-slate-900/90 backdrop-blur-xl border-white/10 shadow-xl'
                : 'bg-white/60 backdrop-blur-xl border-white/40 shadow-lg'
            }
          `}
        >

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/smkm4-new-revisi.png"
              alt="logo"
              width={40}
              height={40}
            />

            <p className={`font-bold transition ${
              scrolled ? 'text-white' : 'text-slate-800'
            }`}>
              AmanMoe
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* NOTIF */}
            <Bell
              className={`w-6 h-6 cursor-pointer transition ${
                scrolled ? 'text-white/80' : 'text-gray-600'
              }`}
            />

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-2"
              >
                {/* FOTO */}
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt="profile"
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {getInitials(user?.nama)}
                  </div>
                )}

                <span className={`hidden sm:block text-sm font-medium ${
                  scrolled ? 'text-white' : 'text-slate-700'
                }`}>
                  {user?.nama}
                </span>
              </button>

              {/* DROPDOWN */}
              {openProfile && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border overflow-hidden animate-fade-in">

                  <button
                    onClick={() => router.push('/siswa/profil')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    Edit Profil
                  </button>

                  <button
                    onClick={() => router.push('/siswa/laporan-saya')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    Laporan Saya
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 text-sm"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}