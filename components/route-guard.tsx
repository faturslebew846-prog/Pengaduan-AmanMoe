'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';

interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  allowedRoles,
  children,
  fallback,
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // belum login
    if (!user) {
      router.push('/login');
      return;
    }

    // role tidak diizinkan
    if (!allowedRoles.includes(user.role)) {
      router.push('/');
      return;
    }
  }, [user, loading, router, allowedRoles]);

  // loading auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Spinner />
      </div>
    );
  }

  // belum login
  if (!user) {
    return null;
  }

  // role tidak diizinkan
  if (!allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-slate-400 mb-6">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}