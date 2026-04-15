'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, BarChart3, LogOut,
  Menu, X, Folder, Users, GraduationCap,
  ChevronRight, Shield,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard, roles: ['admin', 'petugas'] },
  { label: 'Semua Laporan', href: '/dashboard/all-reports', icon: FileText,         roles: ['admin', 'petugas'] },
  { label: 'Statistik',   href: '/dashboard/statistics',   icon: BarChart3,        roles: ['admin'] },
  { label: 'Kategori',    href: '/dashboard/kategori',     icon: Folder,           roles: ['admin'] },
  { label: 'Data User',   href: '/dashboard/users',        icon: Users,            roles: ['admin'] },
  { label: 'Data Siswa',  href: '/dashboard/students',     icon: GraduationCap,    roles: ['admin'] },
];

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const filtered = NAV_ITEMS.filter(i => i.roles.includes(user?.role ?? ''));
  const initials = (user?.nama ?? 'A').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const NavContent = (
    <div className="flex flex-col h-full">

      {/* LOGO */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <img src="/images/smkm4-new-revisi.png" alt="logo"
            className="w-9 h-9 object-contain rounded-lg" />
          <div>
            <p className="text-sm font-black text-white leading-tight">AmanMoe</p>
            <p className="text-[10px] text-slate-400 leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* ROLE BADGE */}
      <div className="px-5 py-3 border-b border-white/8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25
                        px-2.5 py-1 rounded-lg">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
            {user?.role === 'admin' ? 'Administrator' : 'Petugas'}
          </span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filtered.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
                <span>{label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* USER + LOGOUT */}
      <div className="px-3 py-4 border-t border-white/8 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-black text-emerald-400">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.nama}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-slate-800
                   border border-white/10 flex items-center justify-center text-white shadow-lg"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex w-60 h-screen bg-slate-900 border-r border-white/8
                      flex-col fixed left-0 top-0">
        {NavContent}
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}>
          <div className="w-60 h-full bg-slate-900 border-r border-white/8 flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {NavContent}
          </div>
        </div>
      )}
    </>
  );
}