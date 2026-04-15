'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
  User, Phone, MapPin, Mail, BookOpen,
  IdCard, Camera, CheckCircle2, Loader2,
  ChevronLeft, X, Save, AlertCircle,
} from 'lucide-react';

// ── FIELD ──────────────────────────────────────────────────────
function Field({
  icon: Icon, label, name, value, onChange,
  placeholder, disabled, error, type = 'text',
}: {
  icon: React.ElementType; label: string; name?: string;
  value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; disabled?: boolean; error?: string;
  type?: string;
}) {
  const filled = !!value && !disabled;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {filled && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
        <label className={`text-xs font-bold uppercase tracking-wider transition-colors
                           ${filled ? 'text-emerald-600' : 'text-slate-500'}`}>
          {label}
        </label>
        {disabled && (
          <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
            Tidak bisa diubah
          </span>
        )}
      </div>
      <div className="relative">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                          transition-colors ${filled ? 'text-emerald-500' : disabled ? 'text-slate-300' : 'text-slate-400'}`} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 text-sm transition-all duration-200
                      focus:outline-none
                      ${disabled
                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                        : filled
                        ? 'bg-emerald-50/30 border-emerald-300 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20'
                        : error
                        ? 'bg-white border-red-300 text-slate-800 focus:ring-2 focus:ring-red-500/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
        />
        {filled && !disabled && (
          <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

// ── DIVIDER ────────────────────────────────────────────────────
function SectionDivider({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function ProfilPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [form, setForm] = useState({
    nama: '', nis: '', kelas: '', email: '', telp: '', alamat: '', foto: '',
  });
  const [preview,  setPreview]  = useState('');
  const [file,     setFile]     = useState<File | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [submitErr, setSubmitErr] = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data() as any;
          setForm({ nama: d.nama||'', nis: d.nis||'', kelas: d.kelas||'',
                    email: d.email||'', telp: d.telp||'', alamat: d.alamat||'', foto: d.foto||'' });
          setPreview(d.foto || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setSuccess(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  };

  const uploadToCloudinary = async (f: File) => {
    const fd = new FormData();
    fd.append('file', f);
    fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: fd }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Upload gagal');
    return data.secure_url as string;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.telp && form.telp.length < 10) errs.telp = 'Minimal 10 digit';
    if (form.telp && !/^\d+$/.test(form.telp)) errs.telp = 'Hanya angka';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setSaving(true); setSubmitErr('');
    try {
      let fotoUrl = form.foto;
      if (file) fotoUrl = await uploadToCloudinary(file);
      await updateDoc(doc(db, 'users', user.uid), {
        telp: form.telp || '',
        alamat: form.alamat || '',
        foto: fotoUrl,
        updatedAt: new Date(),
      });
      setForm(p => ({ ...p, foto: fotoUrl }));
      setFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      setSubmitErr('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Completion
  const editableFields = [form.telp, form.alamat, preview];
  const filledEditable  = editableFields.filter(Boolean).length;
  const pct = Math.round((filledEditable / editableFields.length) * 100);

  const initials = form.nama
    ? form.nama.trim().split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : 'S';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat profil...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.45s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── HERO ─────────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden pt-20">
          <div className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/images/hero-bg.web.jpeg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900" />
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-20">
            <button onClick={() => router.push('/siswa')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white
                         text-xs font-medium mb-6 transition-colors duration-200">
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1">Akun Siswa</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                  Edit Profil
                </h1>
                <p className="text-slate-400 text-sm">
                  Lengkapi data kontakmu agar mudah dihubungi.
                </p>
              </div>

              {/* Progress ring */}
              {pct > 0 && (
                <div className="flex items-center gap-3 bg-white/8 border border-white/10
                                rounded-2xl px-4 py-3 self-start sm:self-auto flex-shrink-0">
                  <div className="relative w-9 h-9">
                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray={`${pct * 0.88} 88`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center
                                     text-[10px] font-black text-white">{pct}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {filledEditable}/{editableFields.length} dilengkapi
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {pct === 100 ? 'Profil lengkap 🎉' : 'Lengkapi profilmu'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-24 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ── LEFT: FOTO + INFO ── */}
            <div className="fade-up flex flex-col gap-5" style={{ animationDelay: '0ms' }}>

              {/* Foto card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
                <div className="flex flex-col items-center gap-4">

                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      {preview
                        ? <img src={preview} alt="foto profil" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500
                                          flex items-center justify-center">
                            <span className="text-3xl font-black text-white">{initials}</span>
                          </div>
                      }
                    </div>

                    {/* Upload overlay */}
                    <label className="absolute inset-0 flex items-center justify-center
                                      rounded-3xl bg-black/0 group-hover:bg-black/40
                                      cursor-pointer transition-all duration-200">
                      <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center
                                      gap-1 transition-opacity duration-200">
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-[10px] text-white font-bold">Ganti foto</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>

                    {/* Changed indicator */}
                    {file && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500
                                      border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-black text-slate-900 text-lg">{form.nama || '—'}</p>
                    {form.kelas && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold
                                       text-emerald-700 bg-emerald-50 border border-emerald-100
                                       px-3 py-1 rounded-full mt-1">
                        <BookOpen className="w-3 h-3" /> {form.kelas}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Klik foto untuk mengganti
                    </p>
                  </div>
                </div>
              </div>

              {/* Info readonly card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4">
                <SectionDivider label="Info Akun" icon={IdCard} />
                <div className="space-y-3">
                  {[
                    { icon: User,     label: 'Nama Lengkap', value: form.nama  },
                    { icon: IdCard,   label: 'NIS',          value: form.nis   },
                    { icon: BookOpen, label: 'Kelas',        value: form.kelas },
                    { icon: Mail,     label: 'Email',        value: form.email },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2
                                                border-b border-slate-50 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {value || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: EDITABLE FORM ── */}
            <div className="lg:col-span-2 fade-up" style={{ animationDelay: '80ms' }}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

                {/* Card header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-50">
                  <h2 className="text-base font-black text-slate-800">Informasi Kontak</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Nomor HP dan alamat bisa kamu ubah kapan saja.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-5">

                  <SectionDivider label="Kontak" icon={Phone} />

                  <Field
                    icon={Phone} label="Nomor HP" name="telp"
                    value={form.telp} onChange={handleChange}
                    placeholder="Contoh: 08123456789" type="tel"
                    error={errors.telp}
                  />

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <SectionDivider label="Alamat" icon={MapPin} />

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      {form.alamat && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                      <label className={`text-xs font-bold uppercase tracking-wider transition-colors
                                         ${form.alamat ? 'text-emerald-600' : 'text-slate-500'}`}>
                        Alamat Rumah
                      </label>
                    </div>
                    <div className="relative">
                      <MapPin className={`absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none transition-colors
                                          ${form.alamat ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <textarea
                        name="alamat"
                        value={form.alamat}
                        onChange={(e: any) => {
                          setForm(p => ({ ...p, alamat: e.target.value }));
                          setSuccess(false);
                        }}
                        rows={4}
                        placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan..."
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 text-sm text-slate-800
                                    placeholder-slate-400 bg-white resize-none focus:outline-none
                                    leading-relaxed transition-all duration-200
                                    ${form.alamat
                                      ? 'border-emerald-300 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                                      : 'border-slate-200 hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                                    }`}
                      />
                    </div>
                  </div>

                  {/* Status messages */}
                  {submitErr && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{submitErr}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm font-semibold text-emerald-700">Profil berhasil diperbarui!</p>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5
                               bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200
                               disabled:text-slate-400 disabled:cursor-not-allowed
                               text-white font-bold text-sm rounded-2xl
                               shadow-lg shadow-emerald-500/20 hover:scale-[1.01]
                               transition-all duration-200"
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                      : <><Save className="w-4 h-4" /> Simpan Perubahan</>
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}