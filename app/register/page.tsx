'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  ShieldCheck, CreditCard, User, Users, Mail,
  Lock, AlertCircle, CheckCircle2, UserPlus, ArrowLeft, Info,
} from 'lucide-react';

const STEPS = ['Verifikasi NIS', 'Info Akun', 'Selesai'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nis:'', nama:'', kelas:'', email:'', password:'', confirmPassword:'' });
  const [nisValid, setNisValid] = useState(false);
  const [nisChecking, setNisChecking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const step = !nisValid ? 0 : form.email && form.password ? 1 : 1;

  const checkNIS = async (nis: string) => {
    if (!nis || nis.length < 5) return;
    setNisChecking(true);
    try {
      const snap = await getDoc(doc(db, 'students', nis.trim()));
      if (!snap.exists()) {
        setForm(p => ({ ...p, nama:'', kelas:'' }));
        setNisValid(false);
        setError('❌ NIS tidak ditemukan di database sekolah');
        return;
      }
      const d = snap.data();
      setForm(p => ({ ...p, nama: d.nama || '', kelas: d.kelas || '' }));
      setNisValid(true);
      setError('');
    } catch { setError('Gagal mengambil data siswa'); }
    finally { setNisChecking(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'nis') { setNisValid(false); checkNIS(value); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nisValid) { setError('NIS belum valid'); return; }
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid, nis: form.nis, nama: form.nama,
        kelas: form.kelas, email: form.email, role: 'siswa', createdAt: new Date(),
      });
      router.push('/login');
    } catch (err: any) {
      setError(
        err.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar' :
        err.code === 'auth/weak-password' ? 'Password terlalu lemah' : err.message
      );
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .reg-card { animation: fadeUp 0.5s ease-out both; }
        .inp { width:100%; height:42px; background:rgba(255,255,255,0.04); border:0.5px solid rgba(255,255,255,0.1);
          border-radius:10px; color:#e2e8f0; font-size:14px; padding:0 14px 0 38px;
          transition:border-color 0.2s,background 0.2s; outline:none; }
        .inp::placeholder { color:#334155; }
        .inp:focus { border-color:rgba(16,185,129,0.45); background:rgba(255,255,255,0.06); }
        .inp:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10"
        style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'22px 22px' }}>

        <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:'rgba(16,185,129,0.07)', filter:'blur(80px)' }} />

        <button onClick={() => router.push('/')}
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="reg-card w-full max-w-md">

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

          <div className="rounded-2xl border p-7"
            style={{ background:'rgba(15,23,42,0.8)', borderColor:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)' }}>

            {/* step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                      i < step ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                      i === step ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' :
                      'border-white/10 text-slate-600'
                    }`}>
                      {i < step
                        ? <CheckCircle2 className="w-3 h-3" />
                        : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${i === step ? 'text-slate-400' : 'text-slate-600'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-white/5" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border"
              style={{ background:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Pendaftaran Siswa</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Buat akun baru</h1>
            <p className="text-sm text-slate-500 mb-6">Data otomatis dari database sekolah via NIS</p>

            <form onSubmit={handleRegister} className="space-y-4">

              {/* NIS */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nomor Induk Siswa (NIS)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input className="inp" name="nis" placeholder="Contoh: 12345678"
                    value={form.nis} onChange={handleChange} required />
                  {nisChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                  )}
                </div>
                {nisValid && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> NIS valid · Data ditemukan
                  </div>
                )}
              </div>

              {/* nama + kelas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Nama Siswa</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input className="inp" value={form.nama} placeholder="Otomatis" disabled />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Kelas</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input className="inp" value={form.kelas} placeholder="Otomatis" disabled />
                  </div>
                </div>
              </div>

              {/* email */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input className="inp" type="email" name="email" placeholder="email@aktif.com"
                    value={form.email} onChange={handleChange} required />
                </div>
              </div>

              {/* password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input className="inp" type="password" name="password" placeholder="Min. 6 karakter"
                      value={form.password} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Konfirmasi</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input className="inp" type="password" name="confirmPassword" placeholder="Ulangi"
                      value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* info */}
              <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 border text-xs text-slate-500"
                style={{ background:'rgba(16,185,129,0.05)', borderColor:'rgba(16,185,129,0.15)' }}>
                <Info className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><span className="text-emerald-400 font-medium">Nama & Kelas</span> diambil otomatis dari database sekolah — tidak dapat diubah manual.</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading || !nisValid}
                className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Membuat akun...</>
                  : <><UserPlus className="w-4 h-4" /> Buat Akun Sekarang</>}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-white/5" />
              <span className="text-xs text-slate-600">atau</span>
              <div className="flex-1 border-t border-white/5" />
            </div>

            <p className="text-xs text-slate-500 text-center">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}