'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, PlusCircle, Folder, MapPin, Tag, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  nama: string;
  warna: string;
}

interface Location {
  id: string;
  nama: string;
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCat, setSavingCat] = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);

  const [catForm, setCatForm] = useState({ nama: '', warna: '#22c55e' });
  const [locForm, setLocForm] = useState({ nama: '' });

  // ── LOAD ──────────────────────────────────────────────────────
  const loadData = async () => {
    const [catSnap, locSnap] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'locations')),
    ]);
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setLocations(locSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ── CATEGORY ACTIONS ──────────────────────────────────────────
  const addCategory = async () => {
    if (!catForm.nama.trim()) return;
    setSavingCat(true);
    await addDoc(collection(db, 'categories'), { nama: catForm.nama.trim(), warna: catForm.warna });
    setCatForm({ nama: '', warna: '#22c55e' });
    await loadData();
    setSavingCat(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    await deleteDoc(doc(db, 'categories', id));
    loadData();
  };

  // ── LOCATION ACTIONS ──────────────────────────────────────────
  const addLocation = async () => {
    if (!locForm.nama.trim()) return;
    setSavingLoc(true);
    await addDoc(collection(db, 'locations'), { nama: locForm.nama.trim() });
    setLocForm({ nama: '' });
    await loadData();
    setSavingLoc(false);
  };

  const deleteLocation = async (id: string) => {
    if (!confirm('Hapus lokasi ini?')) return;
    await deleteDoc(doc(db, 'locations', id));
    loadData();
  };

  return (
    <>
      <style>{`
        @keyframes adm-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adm-card { animation: adm-in 0.5s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── TOP BANNER ───────────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-10">
            <p className="text-emerald-400 text-sm font-medium mb-1">Manajemen Data</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              Kategori & Lokasi
            </h1>
            <p className="text-slate-400 text-sm">
              Kelola kategori laporan dan daftar lokasi yang tersedia
            </p>

            {/* Summary pills */}
            {!loading && (
              <div className="flex items-center gap-3 mt-4">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span className="text-[12px] font-bold text-emerald-300">
                    {categories.length} Kategori
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span className="text-[12px] font-bold text-blue-300">
                    {locations.length} Lokasi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pb-10 mt-6 space-y-6">

          {/* ── KATEGORI CARD ─────────────────────────────── */}
          <div
            className="adm-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            style={{ animationDelay: '0ms' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Kategori Laporan</h2>
                  <p className="text-[11px] text-slate-400">{categories.length} kategori tersimpan</p>
                </div>
              </div>
            </div>

            {/* Form tambah */}
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Tambah Kategori Baru
              </p>
              <div className="flex gap-3 items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={catForm.nama}
                  onChange={e => setCatForm({ ...catForm, nama: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-slate-200
                             text-sm text-slate-800 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                             bg-white transition-all duration-200"
                />

                {/* Color picker */}
                <div className="relative flex items-center gap-2 bg-white border border-slate-200
                                rounded-xl px-3 py-2 cursor-pointer hover:border-emerald-300 transition-colors">
                  <div
                    className="w-5 h-5 rounded-lg border border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: catForm.warna }}
                  />
                  <span className="text-xs text-slate-500 font-mono">{catForm.warna}</span>
                  <input
                    type="color"
                    value={catForm.warna}
                    onChange={e => setCatForm({ ...catForm, warna: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <button
                  onClick={addCategory}
                  disabled={savingCat || !catForm.nama.trim()}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                             disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                             text-white text-sm font-bold px-5 py-2.5 rounded-xl
                             shadow-sm shadow-emerald-500/20 transition-all duration-200"
                >
                  {savingCat
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <PlusCircle className="w-4 h-4" />
                  }
                  Tambah
                </button>
              </div>
            </div>

            {/* List kategori */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Memuat...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                    <Tag className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Belum ada kategori</p>
                  <p className="text-xs text-slate-400 mt-1">Tambahkan kategori menggunakan form di atas</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {categories.map((cat, i) => (
                    <div
                      key={cat.id}
                      className="group flex items-center justify-between p-4 rounded-xl
                                 border bg-white hover:shadow-md transition-all duration-200"
                      style={{
                        borderColor: cat.warna + '55',
                        backgroundColor: cat.warna + '08',
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: cat.warna + '25', border: `1.5px solid ${cat.warna}55` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.warna }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {cat.nama}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2
                                   w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100
                                   flex items-center justify-center transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── LOKASI CARD ───────────────────────────────── */}
          <div
            className="adm-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            style={{ animationDelay: '100ms' }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Lokasi Laporan</h2>
                  <p className="text-[11px] text-slate-400">{locations.length} lokasi tersimpan</p>
                </div>
              </div>
            </div>

            {/* Form tambah */}
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Tambah Lokasi Baru
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Contoh: Kelas X RPL 1"
                  value={locForm.nama}
                  onChange={e => setLocForm({ nama: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addLocation()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200
                             text-sm text-slate-800 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                             bg-white transition-all duration-200"
                />

                <button
                  onClick={addLocation}
                  disabled={savingLoc || !locForm.nama.trim()}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400
                             disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                             text-white text-sm font-bold px-5 py-2.5 rounded-xl
                             shadow-sm shadow-blue-500/20 transition-all duration-200"
                >
                  {savingLoc
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <PlusCircle className="w-4 h-4" />
                  }
                  Tambah
                </button>
              </div>
            </div>

            {/* List lokasi */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Memuat...</span>
                </div>
              ) : locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Belum ada lokasi</p>
                  <p className="text-xs text-slate-400 mt-1">Tambahkan lokasi menggunakan form di atas</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {locations.map((loc, i) => (
                    <div
                      key={loc.id}
                      className="group flex items-center justify-between p-4 rounded-xl
                                 border border-slate-100 bg-slate-50/50
                                 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm
                                 transition-all duration-200"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {loc.nama}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteLocation(loc.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2
                                   w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100
                                   flex items-center justify-center transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}