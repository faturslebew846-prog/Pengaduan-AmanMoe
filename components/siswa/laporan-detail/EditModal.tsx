'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Report } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  X, Tag, FileText, AlignLeft, MapPin,
  CheckCircle2, ChevronDown, Camera,
  Loader2, Save, ImageIcon, Trash2,
} from 'lucide-react';

// ── Inline Select ──────────────────────────────────────────────
function InlineSelect({
  value, onChange, options, placeholder, icon: Icon,
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filled = !!value;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-sm
                    transition-all duration-200 bg-white
                    ${filled
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : open
                      ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${filled ? 'text-emerald-500' : 'text-slate-400'}`} />
        <span className={`flex-1 text-left truncate ${filled ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        {filled
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          : <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200
                        rounded-2xl shadow-2xl overflow-hidden py-1.5" style={{ zIndex: 60 }}>
          {options.length === 0
            ? <div className="px-4 py-3 text-sm text-slate-400 text-center">Belum ada data</div>
            : options.map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors
                             ${value === opt ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className={`w-3.5 h-3.5 ${value === opt ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="flex-1">{opt}</span>
                {value === opt && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────
function Field({ label, filled, hint, error, children }: {
  label: string; filled?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {filled && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          <label className={`text-xs font-bold uppercase tracking-wider
                             ${filled ? 'text-emerald-600' : 'text-slate-500'}`}>
            {label}
          </label>
        </div>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
  report: Report;
  onClose: () => void;
  onSave: (data: {
    judul: string; deskripsi: string; kategori: string; lokasi: string;
    foto?: string; newImage?: File;
  }) => Promise<void>;
}

// ── Main ───────────────────────────────────────────────────────
export default function EditModal({ report, onClose, onSave }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [locations,  setLocations]  = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    judul:     report.judul     || '',
    deskripsi: report.deskripsi || report.isi || '',
    kategori:  report.kategori  || '',
    lokasi:    report.lokasi    || '',
  });

  // Foto
  const [fotoFile,    setFotoFile]    = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(report.foto || '');
  const [removeFoto,  setRemoveFoto]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const set = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
    setRemoveFoto(false);
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview('');
    setRemoveFoto(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.judul.trim()) errs.judul = 'Judul wajib diisi';
    else if (form.judul.length < 5) errs.judul = 'Terlalu singkat';
    if (!form.deskripsi.trim()) errs.deskripsi = 'Deskripsi wajib diisi';
    if (!form.kategori) errs.kategori = 'Pilih kategori';
    if (!form.lokasi)   errs.lokasi   = 'Pilih lokasi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        foto:     removeFoto ? '' : (fotoFile ? undefined : report.foto || ''),
        newImage: fotoFile ?? undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl
                      border border-slate-100 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="relative bg-slate-900 px-6 py-5 flex items-center justify-between flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25
                            flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Edit Laporan</p>
              <p className="text-[10px] text-slate-500">Perubahan berlaku setelah disimpan</p>
            </div>
          </div>
          <button onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-xl bg-white/6 border border-white/8
                       flex items-center justify-center text-slate-400
                       hover:bg-red-500/20 hover:text-red-400 transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Kategori */}
          <Field label="Kategori" filled={!!form.kategori} error={errors.kategori}>
            <InlineSelect value={form.kategori} onChange={v => set('kategori', v)}
              options={categories} placeholder="Pilih kategori..." icon={Tag} />
          </Field>

          {/* Judul */}
          <Field label="Judul" filled={form.judul.length >= 5}
            hint={`${form.judul.length}/80`} error={errors.judul}>
            <div className="relative">
              <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                    ${form.judul.length >= 5 ? 'text-emerald-500' : 'text-slate-400'}`} />
              <input type="text" value={form.judul} maxLength={80}
                onChange={e => set('judul', e.target.value)}
                placeholder="Judul laporan..."
                className={`w-full pl-11 pr-10 py-3.5 border-2 rounded-2xl text-sm text-slate-800
                            placeholder-slate-400 focus:outline-none transition-all duration-200
                            ${form.judul.length >= 5
                              ? 'border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                              : errors.judul
                              ? 'border-red-300'
                              : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                            }`} />
              {form.judul.length >= 5 && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              )}
            </div>
          </Field>

          {/* Deskripsi */}
          <Field label="Deskripsi" filled={form.deskripsi.length >= 10}
            hint={`${form.deskripsi.length} karakter`} error={errors.deskripsi}>
            <div className="relative">
              <AlignLeft className={`absolute left-4 top-4 w-4 h-4 pointer-events-none
                                     ${form.deskripsi.length >= 10 ? 'text-emerald-500' : 'text-slate-400'}`} />
              <textarea value={form.deskripsi} rows={5}
                onChange={e => set('deskripsi', e.target.value)}
                placeholder="Jelaskan masalah secara detail..."
                className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-2xl text-sm text-slate-800
                            placeholder-slate-400 resize-none focus:outline-none leading-relaxed
                            transition-all duration-200
                            ${form.deskripsi.length >= 10
                              ? 'border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                              : errors.deskripsi
                              ? 'border-red-300'
                              : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                            }`} />
            </div>
          </Field>

          {/* Lokasi */}
          <Field label="Lokasi" filled={!!form.lokasi} error={errors.lokasi}>
            <InlineSelect value={form.lokasi} onChange={v => set('lokasi', v)}
              options={locations} placeholder="Pilih lokasi..." icon={MapPin} />
          </Field>

          {/* Foto */}
          <Field label="Foto Bukti" hint="Opsional">
            {fotoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300">
                <img src={fotoPreview} alt="preview" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <button type="button" onClick={handleRemoveFoto}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm
                             flex items-center justify-center text-white hover:bg-red-500/80 transition-colors z-10">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/50
                                backdrop-blur-sm rounded-lg px-2.5 py-1">
                  <ImageIcon className="w-3 h-3 text-white/70" />
                  <span className="text-[10px] text-white/70">
                    {fotoFile ? fotoFile.name : 'Foto saat ini'}
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed
                                border-slate-200 rounded-2xl py-8 cursor-pointer group
                                hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-100
                                flex items-center justify-center mb-2 transition-colors">
                  <Camera className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">
                  {report.foto && removeFoto ? 'Foto dihapus — klik untuk upload baru' : 'Klik untuk upload foto'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </label>
            )}
          </Field>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200
                       text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200">
            <X className="w-4 h-4" /> Batal
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2
                       bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400
                       text-white font-bold py-3 rounded-2xl shadow-lg shadow-emerald-500/20
                       hover:scale-[1.01] transition-all duration-200">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : <><Save className="w-4 h-4" /> Simpan Perubahan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}