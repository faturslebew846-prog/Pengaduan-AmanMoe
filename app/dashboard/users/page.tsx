'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  UserPlus, Trash2, Search, Users, Shield,
  UserCheck, UserCog, ChevronRight,
} from 'lucide-react';

// ─── types ───────────────────────────────────────────────────
interface UserData {
  id: string;
  nama: string;
  username: string;
  role: 'admin' | 'petugas';
  createdAt?: any;
}

// ─── helpers ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['bg-emerald-500/15 text-emerald-500', 'bg-emerald-500'],
  ['bg-blue-500/15 text-blue-500',       'bg-blue-500'   ],
  ['bg-violet-500/15 text-violet-500',   'bg-violet-500' ],
  ['bg-amber-500/15 text-amber-500',     'bg-amber-500'  ],
  ['bg-pink-500/15 text-pink-500',       'bg-pink-500'   ],
  ['bg-cyan-500/15 text-cyan-500',       'bg-cyan-500'   ],
];
function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function getInitials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}
function fmtDate(d: any) {
  if (!d) return '–';
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── stat card ───────────────────────────────────────────────
function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 min-w-[90px]">
      <p className="text-xl font-black text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── main ────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]       = useState<UserData[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [submitting, setSubmit] = useState(false);
  const [toast, setToast]       = useState('');

  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'petugas' });

  // toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  // load
  const loadUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  };
  useEffect(() => { loadUsers(); }, []);

  // stats
  const stats = useMemo(() => ({
    total:   users.length,
    admin:   users.filter(u => u.role === 'admin').length,
    petugas: users.filter(u => u.role === 'petugas').length,
  }), [users]);

  // filtered
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(u =>
      u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
  }, [users, query]);

  // add
  const handleAdd = async () => {
    if (!form.nama || !form.username || !form.password) {
      return showToast('⚠ Semua field wajib diisi');
    }
    if (form.password.length < 6) return showToast('⚠ Password minimal 6 karakter');
    if (users.find(u => u.username === form.username))
      return showToast('⚠ Username sudah digunakan');

    try {
      setSubmit(true);
      await addDoc(collection(db, 'users'), {
        ...form, createdAt: new Date(),
      });
      setForm({ nama: '', username: '', password: '', role: 'petugas' });
      await loadUsers();
      showToast(`User ${form.nama} berhasil ditambahkan`);
    } catch { showToast('Gagal menambahkan user'); }
    finally { setSubmit(false); }
  };

  // delete
  const handleDelete = async (u: UserData) => {
    if (!confirm(`Yakin hapus user "${u.nama}"?`)) return;
    await deleteDoc(doc(db, 'users', u.id));
    await loadUsers();
    showToast(`User ${u.nama} dihapus`);
  };

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium
                        px-4 py-2.5 rounded-xl border-l-2 border-emerald-500 shadow-2xl
                        animate-fade-in-up">
          {toast}
        </div>
      )}

      <div className="min-h-screen bg-slate-50">

        {/* ── BANNER ─────────────────────────────────── */}
        <div className="relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-10">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Manajemen
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              Data User
            </h1>
            <p className="text-slate-400 text-sm">
              Kelola akun admin &amp; petugas sistem AmanMoe
            </p>

            <div className="flex gap-3 mt-5 flex-wrap">
              <StatCard value={stats.total}   label="Total User" />
              <StatCard value={stats.admin}   label="Admin" />
              <StatCard value={stats.petugas} label="Petugas" />
            </div>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pb-10 -mt-5 space-y-5">

          {/* FORM CARD */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Tambah User Baru</p>
                <p className="text-[11px] text-slate-400">Isi semua field untuk mendaftarkan akun</p>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'nama',     label: 'Nama Lengkap', type: 'text',     ph: 'cth. Budi Santoso' },
                  { id: 'username', label: 'Username',     type: 'text',     ph: 'cth. budi123'       },
                  { id: 'password', label: 'Password',     type: 'password', ph: 'Min. 6 karakter'    },
                ].map(f => (
                  <div key={f.id} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      value={(form as any)[f.id]}
                      onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                      className="h-9 rounded-xl border border-slate-200 px-3 text-sm
                                 text-slate-800 bg-slate-50 outline-none
                                 focus:border-emerald-400 focus:bg-white focus:ring-2
                                 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm
                               text-slate-800 bg-slate-50 outline-none appearance-none
                               focus:border-emerald-400 focus:bg-white focus:ring-2
                               focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="petugas">Petugas</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={submitting}
                className="mt-4 h-9 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                           text-white text-sm font-bold rounded-xl flex items-center gap-2
                           transition-colors duration-150"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'Menyimpan...' : 'Tambah User'}
              </button>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50
                            flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-800">Daftar User</span>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200
                                 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {filtered.length} user
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input
                  type="text"
                  placeholder="Cari user..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="h-8 w-44 rounded-xl border border-slate-200 pl-8 pr-3 text-xs
                             text-slate-800 bg-slate-50 outline-none
                             focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    {['#', 'Pengguna', 'Username', 'Role', 'Bergabung', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold
                                             text-slate-400 uppercase tracking-wider
                                             border-b border-slate-100 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          Memuat data...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        {query ? 'User tidak ditemukan' : 'Belum ada user'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => {
                      const [avBg] = getAvatarColor(u.nama);
                      return (
                        <tr key={u.id}
                          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 text-xs text-slate-300 font-medium tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                              text-[13px] font-black flex-shrink-0 ${avBg}`}>
                                {getInitials(u.nama)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm leading-tight">
                                  {u.nama}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  @{u.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-slate-400 font-mono">
                            @{u.username}
                          </td>
                          <td className="px-4 py-3.5">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50
                                               text-emerald-700 border border-emerald-200
                                               text-[11px] font-bold px-2.5 py-1 rounded-full">
                                <Shield className="w-3 h-3" />
                                Administrator
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-blue-50
                                               text-blue-700 border border-blue-200
                                               text-[11px] font-bold px-2.5 py-1 rounded-full">
                                <UserCheck className="w-3 h-3" />
                                Petugas
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-slate-400 whitespace-nowrap">
                            {fmtDate(u.createdAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleDelete(u)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold
                                         text-red-400 border border-red-100 px-3 py-1.5 rounded-lg
                                         hover:bg-red-50 hover:border-red-200 hover:text-red-500
                                         transition-all duration-150"
                            >
                              <Trash2 className="w-3 h-3" />
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}