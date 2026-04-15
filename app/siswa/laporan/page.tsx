'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createReport, uploadImage } from '@/lib/firestore-service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ChevronLeft, Tag, MapPin, FileText,
  AlignLeft, CheckCircle2, Loader2, X,
  Camera, ImageIcon, Send, ChevronDown,
} from 'lucide-react';

// ── INLINE SELECT — no portal, simple absolute inside relative wrapper ──
function InlineSelect({
  value, onChange, options, placeholder, icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filled = !!value;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-sm
                    transition-all duration-200 bg-white text-left
                    ${filled
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : open
                      ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${filled ? 'text-emerald-500' : 'text-slate-400'}`} />
        <span className={`flex-1 truncate ${filled ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        {filled
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          : <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {/* Dropdown — absolute, inside the relative wrapper, high z-index */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200
                        rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden py-1.5"
          style={{ zIndex: 50 }}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">Belum ada data</div>
          ) : (
            options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                             transition-colors duration-150
                             ${value === opt
                               ? 'bg-emerald-50 text-emerald-700 font-semibold'
                               : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${value === opt ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="flex-1">{opt}</span>
                {value === opt && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── FIELD WRAPPER ──────────────────────────────────────────────
function Field({ label, required, hint, filled, children }: {
  label: string; required?: boolean; hint?: string;
  filled?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
          <label className={`text-sm font-bold transition-colors duration-200
                             ${filled ? 'text-emerald-700' : 'text-slate-700'}`}>
            {label} {required && !filled && <span className="text-red-400">*</span>}
          </label>
        </div>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── DIVIDER ────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function ReportForm() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [categories, setCategories] = useState<string[]>([]);
  const [locations,  setLocations]  = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    kategori:  '',
    judul:     '',
    deskripsi: '',
    lokasi:    '',
    image:     null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Partial<Record<keyof typeof form, string>>>({});

  useEffect(() => {
    const load = async () => {
      const [catSnap, locSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'locations')),
      ]);
      setCategories(catSnap.docs.map(d => d.data().nama));
      setLocations(locSnap.docs.map(d => d.data().nama));
    };
    load();
  }, []);

  const set = (key: keyof typeof form, val: any) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: undefined }));
    setSubmitError('');
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('image', file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { set('image', null); setPreview(null); };

  // Completion percentage
  const fields = [form.kategori, form.judul, form.deskripsi, form.lokasi];
  const filledCount = fields.filter(Boolean).length;
  const pct = Math.round((filledCount / fields.length) * 100);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.kategori)        errs.kategori  = 'Pilih kategori';
    if (!form.judul.trim())    errs.judul     = 'Judul wajib diisi';
    else if (form.judul.length < 5) errs.judul = 'Judul terlalu singkat';
    if (!form.deskripsi.trim()) errs.deskripsi = 'Deskripsi wajib diisi';
    else if (form.deskripsi.length < 10) errs.deskripsi = 'Deskripsi terlalu singkat';
    if (!form.lokasi)          errs.lokasi    = 'Pilih lokasi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (loading || !user) return;
    try {
      setSending(true);
      let imageUrl = '';
      if (form.image) imageUrl = await uploadImage(form.image);
      await createReport({
        userId:   user.uid,
        kategori: form.kategori as any,
        judul:    form.judul,
        deskripsi: form.deskripsi,
        lokasi:   form.lokasi,
        foto: imageUrl || undefined,
        status:   'menunggu',
        prioritas: 'normal',
      });
      setDone(true);
    } catch (e) {
      console.error(e);
      setSubmitError('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setSending(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100
                          flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Laporanmu sudah kami terima dan akan segera ditindaklanjuti. Terima kasih 🙏
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/siswa/laporan-saya')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold
                         py-3 rounded-2xl transition-all duration-200">
              Lihat Laporan Saya
            </button>
            <button onClick={() => {
              setDone(false);
              setForm({ kategori: '', judul: '', deskripsi: '', lokasi: '', image: null });
              setPreview(null);
            }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold
                         py-3 rounded-2xl transition-all duration-200 text-sm">
              Buat Laporan Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.5s ease-out both; }
        textarea { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden pt-20">
          {/* Background sekolah */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/images/hero-bg.web.jpeg')" }} />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900" />
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
          {/* Emerald glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-20">
            {/* Back */}
            <button onClick={() => router.push('/siswa')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white
                         text-xs font-medium mb-6 transition-colors duration-200">
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1">Formulir Pelaporan</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                  Buat Laporan Baru
                </h1>
                <p className="text-slate-400 text-sm">
                  Laporkan masalah fasilitas, kebersihan, atau pelanggaran di sekolah.
                </p>
              </div>

              {/* Completion pill */}
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
                      {filledCount}/{fields.length} diisi
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {pct === 100 ? 'Siap dikirim 🎉' : 'Lengkapi form'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full
                                transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-24 -mt-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

              {/* ── LEFT / MAIN ── */}
              <div className="lg:col-span-2 fade-up space-y-0 bg-white rounded-3xl
                              border border-slate-100 shadow-xl overflow-visible"
                style={{ animationDelay: '0ms' }}>

                {/* Section: Identitas */}
                <div className="px-7 pt-7 pb-6 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100
                                    flex items-center justify-center flex-shrink-0">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Identitas Laporan
                    </h2>
                  </div>

                  {/* Kategori */}
                  <Field label="Kategori" required filled={!!form.kategori}>
                    <InlineSelect
                      value={form.kategori} onChange={v => set('kategori', v)}
                      options={categories} placeholder="Pilih kategori laporan..." icon={Tag}
                    />
                    {errors.kategori && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="w-3 h-3" />{errors.kategori}
                      </p>
                    )}
                    {/* Quick pick chips */}
                    {!form.kategori && categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {categories.slice(0, 5).map(cat => (
                          <button key={cat} type="button" onClick={() => set('kategori', cat)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200
                                       text-xs font-semibold text-slate-600
                                       hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700
                                       transition-all duration-150">
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </Field>

                  {/* Judul */}
                  <Field label="Judul Laporan" required filled={form.judul.length >= 5}
                    hint={`${form.judul.length}/80`}>
                    <div className="relative">
                      <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                            transition-colors ${form.judul.length >= 5 ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <input
                        type="text" value={form.judul} maxLength={80}
                        onChange={e => set('judul', e.target.value)}
                        placeholder="Contoh: Lampu kelas mati sejak pagi..."
                        className={`w-full pl-11 pr-10 py-4 border-2 rounded-2xl text-sm text-slate-800
                                    placeholder-slate-400 bg-white focus:outline-none
                                    transition-all duration-200
                                    ${form.judul.length >= 5
                                      ? 'border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                                      : errors.judul
                                      ? 'border-red-300 focus:ring-2 focus:ring-red-500/20'
                                      : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                                    }`}
                      />
                      {form.judul.length >= 5 && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                      )}
                    </div>
                    {errors.judul && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="w-3 h-3" />{errors.judul}
                      </p>
                    )}
                  </Field>
                </div>

                {/* Divider */}
                <div className="px-7">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                {/* Section: Deskripsi */}
                <div className="px-7 py-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100
                                    flex items-center justify-center flex-shrink-0">
                      <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Detail Kejadian
                    </h2>
                  </div>

                  <Field label="Deskripsi Lengkap" required filled={form.deskripsi.length >= 10}
                    hint={`${form.deskripsi.length} karakter`}>
                    <textarea
                      value={form.deskripsi} rows={6}
                      onChange={e => set('deskripsi', e.target.value)}
                      placeholder="Jelaskan masalah secara detail — kapan terjadi, apa dampaknya, dan informasi relevan lainnya..."
                      className={`w-full px-4 py-4 border-2 rounded-2xl text-sm text-slate-800
                                  placeholder-slate-400 bg-white resize-none focus:outline-none
                                  leading-relaxed transition-all duration-200
                                  ${form.deskripsi.length >= 10
                                    ? 'border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                                    : errors.deskripsi
                                    ? 'border-red-300 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                                  }`}
                    />
                    {errors.deskripsi && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="w-3 h-3" />{errors.deskripsi}
                      </p>
                    )}
                  </Field>
                </div>

                {/* Divider */}
                <div className="px-7">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                {/* Section: Lokasi */}
                <div className="px-7 py-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-100
                                    flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Lokasi Kejadian
                    </h2>
                  </div>

                  <Field label="Lokasi" required filled={!!form.lokasi}>
                    <InlineSelect
                      value={form.lokasi} onChange={v => set('lokasi', v)}
                      options={locations} placeholder="Pilih lokasi kejadian..." icon={MapPin}
                    />
                    {errors.lokasi && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <X className="w-3 h-3" />{errors.lokasi}
                      </p>
                    )}
                  </Field>
                </div>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="flex flex-col gap-5">

                {/* Foto upload card */}
                <div className="fade-up bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4"
                  style={{ animationDelay: '80ms' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 border border-purple-100
                                    flex items-center justify-center flex-shrink-0">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Foto Bukti
                    </h2>
                    <span className="ml-auto text-[11px] text-slate-400 font-medium">Opsional</span>
                  </div>

                  {!preview ? (
                    <label className="flex flex-col items-center justify-center
                                      border-2 border-dashed border-slate-200 rounded-2xl
                                      py-8 cursor-pointer group
                                      hover:border-emerald-300 hover:bg-emerald-50/30
                                      transition-all duration-200">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100
                                      flex items-center justify-center mb-3
                                      transition-colors duration-200">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">
                        Klik untuk upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP · Maks 10MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300">
                      <img src={preview} alt="preview" className="w-full h-44 object-cover" />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <button type="button" onClick={removeImage}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/50
                                   backdrop-blur-sm flex items-center justify-center text-white
                                   hover:bg-red-500/80 transition-colors duration-200 z-10">
                        <X className="w-4 h-4" />
                      </button>
                      {/* Filename */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5
                                      bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                        <ImageIcon className="w-3 h-3 text-white flex-shrink-0" />
                        <span className="text-[11px] text-white truncate">{form.image?.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 ml-auto" />
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">💡 Tips foto</p>
                    {['Ambil dari sudut yang jelas', 'Pastikan pencahayaan cukup', 'Foto dari dekat objek masalah'].map(t => (
                      <div key={t} className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-400">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary + Submit card */}
                <div className="fade-up bg-slate-900 rounded-3xl p-6 space-y-4 relative overflow-hidden"
                  style={{ animationDelay: '140ms' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-4">

                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Ringkasan
                    </h2>

                    {/* Summary rows */}
                    <div className="space-y-2">
                      {[
                        { icon: Tag,      label: 'Kategori', value: form.kategori },
                        { icon: FileText, label: 'Judul',    value: form.judul    },
                        { icon: MapPin,   label: 'Lokasi',   value: form.lokasi   },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label}
                          className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${value ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className="text-[11px] text-slate-500 flex-shrink-0 w-14">{label}</span>
                          <span className={`text-xs truncate font-medium ${value ? 'text-slate-200' : 'text-slate-600 italic'}`}>
                            {value || '—'}
                          </span>
                          {value && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-auto" />}
                        </div>
                      ))}
                    </div>

                    {/* Progress ring + label */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold flex-shrink-0 transition-colors ${pct === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {pct}%
                      </span>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-400">{submitError}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={sending || loading || !user}
                      className={`w-full flex items-center justify-center gap-2.5 py-3.5
                                  font-bold text-sm rounded-2xl transition-all duration-200
                                  ${pct === 100
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                                    : 'bg-white/8 text-slate-500 cursor-not-allowed'
                                  }
                                  disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed`}
                    >
                      {sending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                        : pct === 100
                        ? <><Send className="w-4 h-4" /> Kirim Laporan</>
                        : <>Lengkapi form dulu ({pct}%)</>
                      }
                    </button>

                    {!user && (
                      <p className="text-[11px] text-slate-500 text-center">
                        Kamu harus login untuk mengirim laporan
                      </p>
                    )}
                  </div>
                </div>

              </div>{/* end right sidebar */}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}