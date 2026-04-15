import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // halaman publik
  const publicRoutes = ['/login', '/register'];

  // biarkan halaman publik lewat
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // JANGAN redirect dashboard lagi
  // role protection sudah ditangani di layout dashboard + auth-context

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
