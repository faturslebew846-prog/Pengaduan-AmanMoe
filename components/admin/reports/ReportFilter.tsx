'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, SlidersHorizontal, Image, ImageOff,
  Clock, Zap, CheckCircle2, XCircle, LayoutGrid,
  MapPin, Tag, User, ChevronDown, X, LayoutList,
} from 'lucide-react';
import { Report } from '@/lib/types';

interface ReportFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  photoFilter: string;
  setPhotoFilter: (val: string) => void;
  kategoriFilter: string;
  setKategoriFilter: (val: string) => void;
  lokasiFilter: string;
  setLokasiFilter: (val: string) => void;
  pelaporFilter: string;
  setPelaporFilter: (val: string) => void;
  reports: Report[];
  viewMode: 'grid' | 'table';
  setViewMode: (val: 'grid' | 'table') => void;
}

const STATUS_OPTIONS = [
  { value: 'all',      label: 'Semua Status',  icon: LayoutGrid,   color: 'text-slate-500'   },
  { value: 'menunggu', label: 'Menunggu',       icon: Clock,        color: 'text-amber-500'   },
  { value: 'diproses', label: 'Diproses',       icon: Zap,          color: 'text-blue-500'    },
  { value: 'selesai',  label: 'Selesai',        icon: CheckCircle2, color: 'text-emerald-500' },
  { value: 'palsu',    label: 'Tidak Valid',    icon: XCircle,      color: 'text-red-500'     },
];

const PHOTO_OPTIONS = [
  { value: 'all',     label: 'Semua Foto',  icon: LayoutGrid },
  { value: 'with',    label: 'Ada Foto',    icon: Image      },
  { value: 'without', label: 'Tanpa Foto',  icon: ImageOff   },
];

const PILL_COLORS: Record<string, string> = {
  slate:   'bg-slate-100 text-slate-600 border-slate-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
  teal:    'bg-teal-50 text-teal-700 border-teal-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function Pill({ label, color, onRemove, icon }: {
  label: string; color: string; onRemove: () => void; icon?: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border
                      text-[11px] font-semibold ${PILL_COLORS[color] ?? PILL_COLORS.slate}`}>
      {icon}{label}
      <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── DROPDOWN PAKAI PORTAL ──────────────────────────────────────
// Dirender langsung ke document.body, bebas dari overflow/z-index parent manapun
function FilterSelect({
  value, onChange, options, placeholder, icon: HeaderIcon,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: React.ElementType; color?: string }[];
  placeholder: string;
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(o => o.value === value);

  // Tutup saat scroll atau resize agar posisi tidak salah
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(prev => !prev);
  };

  // Portal: dropdown dirender di luar DOM tree komponen ini
  const dropdown = open && rect ? createPortal(
    <>
      {/* Backdrop transparan — klik di luar = tutup */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
      />
      {/* Dropdown muncul tepat di bawah tombol trigger */}
      <div
        style={{
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 180),
          zIndex: 99999,
        }}
        className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/40
                   overflow-hidden py-1"
      >
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left
                           transition-colors duration-150
                           ${isActive
                             ? 'bg-emerald-50 text-emerald-700 font-semibold'
                             : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {Icon && (
                <Icon className={`w-4 h-4 flex-shrink-0
                                  ${isActive ? 'text-emerald-500' : opt.color ?? 'text-slate-400'}`} />
              )}
              <span className="flex-1">{opt.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 px-3.5 py-2.5 bg-white border rounded-xl
                    text-sm transition-all duration-200 hover:border-slate-300
                    ${open ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200'}`}
      >
        <HeaderIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className={`flex-1 text-left truncate
                          ${value === 'all' ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200
                                 ${open ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export function ReportFilters({
  search, setSearch,
  statusFilter, setStatusFilter,
  photoFilter, setPhotoFilter,
  kategoriFilter, setKategoriFilter,
  lokasiFilter, setLokasiFilter,
  pelaporFilter, setPelaporFilter,
  reports,
  viewMode, setViewMode,
}: ReportFiltersProps) {

  const kategoriOptions = useMemo(() => {
    const vals = [...new Set(reports.map(r => (r as any).kategori).filter(Boolean))];
    return [
      { value: 'all', label: 'Semua Kategori', icon: Tag },
      ...vals.map(v => ({ value: v, label: v, icon: Tag })),
    ];
  }, [reports]);

  const lokasiOptions = useMemo(() => {
    const vals = [...new Set(reports.map(r => r.lokasi).filter(Boolean))];
    return [
      { value: 'all', label: 'Semua Lokasi', icon: MapPin },
      ...vals.map(v => ({ value: v, label: v, icon: MapPin })),
    ];
  }, [reports]);

  const pelaporOptions = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach(r => {
      if (r.userId && !map.has(r.userId)) {
        map.set(r.userId, (r as any).namaPelapor ?? r.userId.slice(0, 8));
      }
    });
    return [
      { value: 'all', label: 'Semua Pelapor', icon: User },
      ...[...map.entries()].map(([uid, nama]) => ({ value: uid, label: nama, icon: User })),
    ];
  }, [reports]);

  const activeCount = [
    statusFilter !== 'all', photoFilter !== 'all',
    kategoriFilter !== 'all', lokasiFilter !== 'all',
    pelaporFilter !== 'all', search.trim() !== '',
  ].filter(Boolean).length;

  const resetAll = () => {
    setSearch(''); setStatusFilter('all'); setPhotoFilter('all');
    setKategoriFilter('all'); setLokasiFilter('all'); setPelaporFilter('all');
  };

  return (
    // overflow-visible tidak lagi diperlukan karena dropdown pakai portal
    <div className="adm-card bg-white rounded-2xl border border-slate-100 shadow-sm"
      style={{ animationDelay: '0ms' }}>

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">Filter & Pencarian</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                             bg-emerald-500 text-white text-[10px] font-black">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {activeCount > 0 && (
            <button onClick={resetAll}
              className="flex items-center gap-1 text-xs text-slate-400
                         hover:text-red-500 transition-colors duration-200 font-medium">
              <X className="w-3 h-3" /> Reset
            </button>
          )}

          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid"
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                          ${viewMode === 'grid'
                            ? 'bg-white shadow-sm text-slate-700'
                            : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Tabel"
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                          ${viewMode === 'table'
                            ? 'bg-white shadow-sm text-slate-700'
                            : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="p-4 space-y-3">

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                             text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari judul laporan atau nama pelapor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm
                       text-slate-800 placeholder-slate-400 bg-white
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                       transition-all duration-200"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300
                         hover:text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FILTER DROPDOWNS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <FilterSelect value={statusFilter}   onChange={setStatusFilter}   options={STATUS_OPTIONS}   placeholder="Status"    icon={LayoutGrid} />
          <FilterSelect value={photoFilter}    onChange={setPhotoFilter}    options={PHOTO_OPTIONS}    placeholder="Foto"      icon={Image}      />
          <FilterSelect value={kategoriFilter} onChange={setKategoriFilter} options={kategoriOptions}  placeholder="Kategori"  icon={Tag}        />
          <FilterSelect value={lokasiFilter}   onChange={setLokasiFilter}   options={lokasiOptions}    placeholder="Lokasi"    icon={MapPin}     />
          <FilterSelect value={pelaporFilter}  onChange={setPelaporFilter}  options={pelaporOptions}   placeholder="Pelapor"   icon={User}       />
        </div>

        {/* ACTIVE PILLS */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Aktif:</span>
            {search && <Pill label={`"${search}"`} color="slate" onRemove={() => setSearch('')} />}
            {statusFilter !== 'all' && (
              <Pill label={STATUS_OPTIONS.find(o => o.value === statusFilter)?.label ?? ''}
                color="amber" onRemove={() => setStatusFilter('all')} />
            )}
            {photoFilter !== 'all' && (
              <Pill label={PHOTO_OPTIONS.find(o => o.value === photoFilter)?.label ?? ''}
                color="blue" onRemove={() => setPhotoFilter('all')} />
            )}
            {kategoriFilter !== 'all' && (
              <Pill label={kategoriFilter} color="purple" onRemove={() => setKategoriFilter('all')}
                icon={<Tag className="w-3 h-3" />} />
            )}
            {lokasiFilter !== 'all' && (
              <Pill label={lokasiFilter} color="teal" onRemove={() => setLokasiFilter('all')}
                icon={<MapPin className="w-3 h-3" />} />
            )}
            {pelaporFilter !== 'all' && (
              <Pill
                label={pelaporOptions.find(o => o.value === pelaporFilter)?.label ?? pelaporFilter.slice(0, 8)}
                color="emerald" onRemove={() => setPelaporFilter('all')}
                icon={<User className="w-3 h-3" />}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}