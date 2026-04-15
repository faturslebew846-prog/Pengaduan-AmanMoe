'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, updateDoc, collection,
  getDocs, deleteDoc, query, orderBy,
} from 'firebase/firestore';
import {
  Users, UserPlus, Search, Filter, Phone, MapPin,
  Mail, CreditCard, Pencil, Trash2, Info, X,
  CheckCircle2, User, BookOpen, Clock,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────
interface Student {
  nis: string;
  nama: string;
  kelas: string;
  alamat?: string;
  telp?: string;
  email?: string;
  foto?: string;
  createdAt?: any;
  uid?: string;
}

// ─── helpers ──────────────────────────────────────────────────
const AV_COLORS = [
  { bg: 'rgba(16,185,129,.15)',  text: '#059669', border: '#a7f3d0' },
  { bg: 'rgba(59,130,246,.15)',  text: '#2563eb', border: '#bfdbfe' },
  { bg: 'rgba(245,158,11,.15)',  text: '#d97706', border: '#fde68a' },
  { bg: 'rgba(168,85,247,.15)',  text: '#9333ea', border: '#e9d5ff' },
  { bg: 'rgba(239,68,68,.15)',   text: '#dc2626', border: '#fecaca' },
  { bg: 'rgba(20,184,166,.15)',  text: '#0d9488', border: '#99f6e4' },
];
function avc(nis: string) {
  let h = 0;
  for (const c of nis) h = (h * 31 + c.charCodeAt(0)) % AV_COLORS.length;
  return AV_COLORS[h];
}
function inits(nama: string) {
  return nama.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}
function fmtDate(d: any) {
  if (!d) return '—';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── sub: avatar ──────────────────────────────────────────────
function StudentAvatar({ s, size = 44, rounded = 'rounded-xl' }: {
  s: Student; size?: number; rounded?: string;
}) {
  const c = avc(s.nis);
  const sz = `${size}px`;
  if (s.foto) return (
    <img src={s.foto} alt={s.nama}
      className={`object-cover flex-shrink-0 ${rounded}`}
      style={{ width: sz, height: sz }} />
  );
  return (
    <div
      className={`flex items-center justify-center font-black flex-shrink-0 ${rounded}`}
      style={{ width: sz, height: sz, background: c.bg, color: c.text, border: `3px solid #fff`, fontSize: size * 0.32 }}
    >
      {inits(s.nama)}
    </div>
  );
}

// ─── sub: student card ────────────────────────────────────────
function StudentCard({
  s, onView, onEdit, onDelete,
}: {
  s: Student;
  onView: (s: Student) => void;
  onEdit: (s: Student) => void;
  onDelete: (nis: string) => void;
}) {
  const c = avc(s.nis);
  return (
    <div
      onClick={() => onView(s)}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden
                 cursor-pointer transition-all duration-200
                 hover:border-emerald-300 hover:-translate-y-0.5"
    >
      {/* colour strip header */}
      <div className="h-12 bg-slate-50 relative">
        <div className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, ${c.bg}, transparent)` }} />
      </div>

      {/* avatar overlapping strip */}
      <div className="px-4 -mt-5 pb-3">
        <StudentAvatar s={s} size={44} rounded="rounded-xl" />

        <div className="mt-2.5">
          <p className="text-sm font-black text-slate-800 truncate
                        group-hover:text-emerald-600 transition-colors">
            {s.nama}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.nis}</p>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ background: c.bg, color: c.text, borderColor: c.border }}
          >
            {s.kelas}
          </span>
          {s.uid && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold
                             bg-emerald-50 text-emerald-700 border border-emerald-200
                             px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Akun Aktif
            </span>
          )}
        </div>

        <div className="mt-2.5 space-y-1.5">
          {[
            { Icon: Phone,  val: s.telp   || '—' },
            { Icon: MapPin, val: s.alamat || 'Belum diisi' },
            { Icon: Mail,   val: s.email  || 'Belum punya akun' },
          ].map(({ Icon, val }) => (
            <div key={val} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Icon className="w-3 h-3 flex-shrink-0 text-slate-300" />
              <span className="truncate">{val}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-300">{fmtDate(s.createdAt)}</span>
          <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
            {[
              { Icon: Info,   title: 'Detail',  fn: () => onView(s),          cls: '' },
              { Icon: Pencil, title: 'Edit',    fn: () => onEdit(s),          cls: '' },
              { Icon: Trash2, title: 'Hapus',   fn: () => onDelete(s.nis),    cls: 'del' },
            ].map(({ Icon, title, fn, cls }) => (
              <button
                key={title}
                title={title}
                onClick={fn}
                className={`w-6 h-6 rounded-lg border border-slate-200 bg-slate-50
                            flex items-center justify-center transition-all
                            ${cls === 'del'
                              ? 'hover:border-red-200 hover:bg-red-50'
                              : 'hover:border-emerald-200 hover:bg-emerald-50'}`}
              >
                <Icon className={`w-3 h-3 ${cls === 'del' ? 'text-slate-300 hover:text-red-400' : 'text-slate-300 hover:text-emerald-500'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── sub: detail modal ────────────────────────────────────────
function DetailModal({ s, onClose, onEdit }: {
  s: Student; onClose: () => void; onEdit: (s: Student) => void;
}) {
  const c = avc(s.nis);
  const rows: [string, string, boolean][] = [
    ['NIS',       s.nis,             false],
    ['Email',     s.email  || '—',   !!s.email],
    ['No. HP',    s.telp   || '—',   false],
    ['Alamat',    s.alamat || '—',   false],
    ['Status',    s.uid ? 'Akun Aktif' : 'Belum punya akun', !!s.uid],
    ['Bergabung', fmtDate(s.createdAt),                      false],
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        {/* dark header */}
        <div className="relative bg-slate-900 px-5 py-4 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="relative text-sm font-bold text-white z-10">Profil Siswa</span>
          <button onClick={onClose}
            className="relative z-10 w-7 h-7 rounded-xl bg-white/7 border border-white/10
                       flex items-center justify-center text-slate-400
                       hover:bg-red-500/20 hover:text-red-400 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* avatar centre */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5">
          <StudentAvatar s={s} size={72} rounded="rounded-2xl" />
          <p className="mt-3 text-base font-black text-slate-800">{s.nama}</p>
          <span
            className="mt-2 text-[11px] font-bold px-3 py-1 rounded-full border"
            style={{ background: c.bg, color: c.text, borderColor: c.border }}
          >
            {s.kelas}
          </span>
          {s.uid && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold
                             bg-emerald-50 text-emerald-700 border border-emerald-200
                             px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Akun Aktif
            </span>
          )}
        </div>

        {/* rows */}
        <div className="divide-y divide-slate-50 px-5">
          {rows.map(([k, v, green]) => (
            <div key={k} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-slate-400 font-medium">{k}</span>
              <span className={`text-xs font-bold text-right max-w-[58%] truncate
                               ${green ? 'text-emerald-600' : 'text-slate-700'}`}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 pt-3">
          <button
            onClick={() => { onClose(); onEdit(s); }}
            className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white
                       text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profil Siswa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── sub: edit modal ──────────────────────────────────────────
function EditModal({ s, onClose, onSaved }: {
  s: Student; onClose: () => void; onSaved: () => void;
}) {
  const [form,    setForm]    = useState({ telp: s.telp || '', alamat: s.alamat || '' });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'students', s.nis), {
        telp: form.telp, alamat: form.alamat, updatedAt: new Date(),
      });
      setMsg('ok');
      setTimeout(() => { onSaved(); onClose(); }, 700);
    } catch (e: any) {
      setMsg('Gagal: ' + e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative bg-slate-900 px-5 py-4 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
          <span className="relative text-sm font-bold text-white z-10">Edit — {s.nama}</span>
          <button onClick={onClose}
            className="relative z-10 w-7 h-7 rounded-xl bg-white/7 border border-white/10
                       flex items-center justify-center text-slate-400
                       hover:bg-red-500/20 hover:text-red-400 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* readonly fields */}
          {[
            { label: 'Nama',  val: s.nama  },
            { label: 'NIS',   val: s.nis   },
            { label: 'Kelas', val: s.kelas },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {label}
              </label>
              <input value={val} disabled
                className="h-9 rounded-xl border border-slate-100 px-3 text-sm
                           text-slate-400 bg-slate-50 cursor-not-allowed" />
            </div>
          ))}

          {/* editable */}
          {[
            { label: 'Nomor HP', key: 'telp',   ph: '08xxxxxxxxxx' },
            { label: 'Alamat',   key: 'alamat',  ph: 'Jl. ...' },
          ].map(({ label, key, ph }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {label}
              </label>
              <input
                value={(form as any)[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={ph}
                className="h-9 rounded-xl border border-slate-200 px-3 text-sm text-slate-800
                           bg-slate-50 outline-none focus:border-emerald-400 focus:bg-white
                           focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          ))}

          {msg && msg !== 'ok' && <p className="text-xs text-red-400 text-center">{msg}</p>}
          {msg === 'ok' && (
            <p className="text-xs text-emerald-500 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil disimpan
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                       text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function StudentsPage() {
  const [students,     setStudents]    = useState<Student[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [form,         setForm]        = useState({ nama: '', nis: '', kelas: '' });
  const [saving,       setSaving]      = useState(false);
  const [msg,          setMsg]         = useState('');
  const [search,       setSearch]      = useState('');
  const [filterKelas,  setFilterKelas] = useState('');
  const [viewStudent,  setView]        = useState<Student | null>(null);
  const [editStudent,  setEdit]        = useState<Student | null>(null);

  const fetchStudents = async () => {
    const snap = await getDocs(query(collection(db, 'students'), orderBy('createdAt', 'desc')));
    setStudents(snap.docs.map(d => ({ nis: d.id, ...d.data() }) as Student));
  };

  useEffect(() => { fetchStudents().finally(() => setLoading(false)); }, []);

  const kelasList = useMemo(() =>
    [...new Set(students.map(s => s.kelas))].sort(), [students]);

  const filtered = useMemo(() =>
    students.filter(s => {
      const q = search.toLowerCase();
      return (!q || s.nama.toLowerCase().includes(q) || s.nis.includes(q))
        && (!filterKelas || s.kelas === filterKelas);
    }), [students, search, filterKelas]);

  const now = new Date();
  const stats = useMemo(() => ({
    total:    students.length,
    kelas:    kelasList.length,
    akunAktif: students.filter(s => s.uid).length,
    bulanIni:  students.filter(s => {
      const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt ?? 0);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  }), [students, kelasList]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (!form.nama || !form.nis || !form.kelas) { setMsg('err:Semua field wajib diisi'); return; }
    if (students.find(s => s.nis === form.nis)) { setMsg('err:NIS sudah terdaftar'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'students', form.nis), {
        nama: form.nama, nis: form.nis, kelas: form.kelas,
        alamat: '', telp: '', createdAt: new Date(),
      });
      setMsg('ok');
      setForm({ nama: '', nis: '', kelas: '' });
      await fetchStudents();
    } catch (e: any) {
      setMsg('err:' + e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (nis: string) => {
    if (!confirm('Hapus siswa ini? Tindakan tidak dapat dibatalkan.')) return;
    await deleteDoc(doc(db, 'students', nis));
    await fetchStudents();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2.5 text-slate-400">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm">Memuat data siswa...</span>
      </div>
    </div>
  );

  const STAT_CARDS = [
    { icon: Users,        label: 'Total Siswa',  val: stats.total,     iconCls: 'bg-emerald-50 text-emerald-500', valCls: 'text-slate-800' },
    { icon: BookOpen,     label: 'Kelas Aktif',  val: stats.kelas,     iconCls: 'bg-blue-50 text-blue-500',      valCls: 'text-blue-600' },
    { icon: CheckCircle2, label: 'Punya Akun',   val: stats.akunAktif, iconCls: 'bg-amber-50 text-amber-500',    valCls: 'text-amber-600' },
    { icon: Clock,        label: 'Baru Bulan Ini', val: stats.bulanIni, iconCls: 'bg-violet-50 text-violet-500', valCls: 'text-violet-600' },
  ];

  return (
    <>
      {viewStudent && (
        <DetailModal s={viewStudent} onClose={() => setView(null)}
          onEdit={s => { setView(null); setEdit(s); }} />
      )}
      {editStudent && (
        <EditModal s={editStudent} onClose={() => setEdit(null)} onSaved={fetchStudents} />
      )}

      <div className="min-h-screen bg-slate-50">

        {/* ── BANNER ─────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-12">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[11px] font-semibold uppercase tracking-widest">
                Data Akademik
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              Data Siswa
            </h1>
            <p className="text-slate-400 text-sm">
              Manajemen database siswa SMK Muh. 4 YK
            </p>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pb-10 -mt-5 space-y-5">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAT_CARDS.map(({ icon: Icon, label, val, iconCls, valCls }) => (
              <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${iconCls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`text-2xl font-black tabular-nums leading-none mb-1 ${valCls}`}>{val}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* ADD FORM */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-800">Tambah Siswa Baru</p>
            </div>
            <form onSubmit={handleAdd} className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {[
                  { name: 'nama',  Icon: User,       ph: 'Nama lengkap' },
                  { name: 'nis',   Icon: CreditCard, ph: 'Nomor Induk Siswa' },
                  { name: 'kelas', Icon: BookOpen,   ph: 'Kelas (mis. XII RPL 1)' },
                ].map(({ name, Icon, ph }) => (
                  <div key={name} className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                    <input
                      value={(form as any)[name]}
                      onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                      placeholder={ph}
                      className="w-full h-9 rounded-xl border border-slate-200 pl-9 pr-3 text-sm
                                 text-slate-800 bg-slate-50 outline-none
                                 focus:border-emerald-400 focus:bg-white focus:ring-2
                                 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                ))}
              </div>

              {msg && msg !== 'ok' && (
                <p className="text-xs text-red-400 mb-3">{msg.replace('err:', '')}</p>
              )}
              {msg === 'ok' && (
                <p className="text-xs text-emerald-500 mb-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Siswa berhasil ditambahkan
                </p>
              )}

              <button type="submit" disabled={saving}
                className="h-9 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                           text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors">
                {saving ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                ) : (
                  <><UserPlus className="w-3.5 h-3.5" />Tambah Siswa</>
                )}
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            {/* toolbar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-50 flex-wrap">
              <div className="relative min-w-40 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                <input
                  placeholder="Cari nama atau NIS..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-8 rounded-xl border border-slate-200 pl-8 pr-3 text-xs
                             text-slate-800 bg-slate-50 outline-none focus:border-emerald-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterKelas('')}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all
                    ${!filterKelas
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <Filter className="w-3 h-3 inline mr-1" />Semua
                </button>
                {kelasList.map(k => (
                  <button key={k} onClick={() => setFilterKelas(k === filterKelas ? '' : k)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all
                      ${filterKelas === k
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {k}
                  </button>
                ))}
              </div>

              <span className="ml-auto text-[11px] font-bold bg-emerald-50 text-emerald-600
                               border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {filtered.length} siswa
              </span>
            </div>

            {/* grid */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                {search || filterKelas ? 'Tidak ada siswa yang cocok' : 'Belum ada data siswa'}
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(s => (
                  <StudentCard
                    key={s.nis}
                    s={s}
                    onView={setView}
                    onEdit={setEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}