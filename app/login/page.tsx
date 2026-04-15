'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  ShieldCheck, Mail, Lock, LogIn,
  AlertCircle, ArrowLeft, Clock,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) { setError('Data user tidak ditemukan'); return; }
      const role = userDoc.data().role;
      if (role === 'admin' || role === 'petugas') router.replace('/dashboard');
      else if (role === 'siswa') router.replace('/siswa');
      else setError('Role tidak dikenali');
    } catch (err: any) {
      setError(
        err.code === 'auth/user-not-found' ? 'Email tidak ditemukan' :
        err.code === 'auth/wrong-password' ? 'Password salah' : 'Gagal login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .login-card { animation: fadeUp 0.5s ease-out both; }
        .inp { width:100%; height:42px; background:rgba(255,255,255,0.04); border:0.5px solid rgba(255,255,255,0.1);
          border-radius:10px; color:#e2e8f0; font-size:14px; padding:0 14px 0 38px;
          transition:border-color 0.2s,background 0.2s; outline:none; }
        .inp::placeholder { color:#334155; }
        .inp:focus { border-color:rgba(16,185,129,0.45); background:rgba(255,255,255,0.06); }
      `}</style>

      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"
        style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'22px 22px' }}>

        {/* glow */}
        <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:'rgba(16,185,129,0.07)', filter:'blur(80px)' }} />
        <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background:'rgba(20,184,166,0.05)', filter:'blur(60px)' }} />

        {/* back btn */}
        <button onClick={() => router.push('/')}
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="login-card w-full max-w-sm">

          {/* logo */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">AmanMoe</p>
              <p className="text-slate-600 text-xs mt-0.5">SMK Muh. 4 YK · v1.0</p>
            </div>
          </div>

          {/* card */}
          <div className="rounded-2xl border p-7"
            style={{ background:'rgba(15,23,42,0.8)', borderColor:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)' }}>

            {/* chip */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border"
              style={{ background:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Sistem Aktif</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Selamat datang kembali 👋</h1>
            <p className="text-sm text-slate-500 mb-6">Masuk untuk mengakses dashboard pelaporan</p>

            <form onSubmit={handleLogin} className="space-y-4">

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                <input className="inp" type="email" placeholder="email@smk.sch.id"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input className="inp" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="flex justify-end mt-1.5">
                  <span className="text-xs text-emerald-500 cursor-pointer hover:text-emerald-400">Lupa password?</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memuat...</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Masuk ke Dashboard</>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-white/5" />
              <span className="text-xs text-slate-600">atau</span>
              <div className="flex-1 border-t border-white/5" />
            </div>

            <p className="text-xs text-slate-500 text-center">
              Belum punya akun?{' '}
              <Link href="/register" className="text-emerald-400 font-medium hover:text-emerald-300">Daftar di sini</Link>
            </p>
          </div>

          {/* trust badges */}
          <div className="flex justify-center gap-5 mt-5">
            {[
              { icon: ShieldCheck, label: 'Terenkripsi SSL' },
              { icon: Clock, label: 'Sesi aman 24 jam' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-700 text-xs">
                <Icon className="w-3 h-3" /> {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}