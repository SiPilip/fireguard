import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Halaman publik yang tidak memerlukan login
  const publicPaths = ['/login', '/login/verify', '/operator/login'];

  // Izinkan akses ke API, file Next.js, dan halaman publik
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Jika tidak ada token, redirect ke halaman login yang sesuai
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith('/operator') ? '/operator/login' : '/login';
    return NextResponse.redirect(url);
  }

  // Jika ada token, verifikasi
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    const isOperator = payload.isOperator === true;

    // Jika mencoba mengakses rute operator
    if (pathname.startsWith('/operator')) {
      if (isOperator) {
        return NextResponse.next(); // Akses diizinkan untuk operator
      } else {
        // Jika pengguna biasa mencoba akses, redirect ke halaman utama mereka
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Jika mencoba mengakses rute pengguna biasa
    if (isOperator) {
      // Jika operator mencoba akses, redirect ke dasbor mereka
      return NextResponse.redirect(new URL('/operator/dashboard', request.url));
    } else {
      return NextResponse.next(); // Akses diizinkan untuk pengguna biasa
    }

  } catch (error) {
    // Jika token tidak valid, hapus dan redirect ke login
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith('/operator') ? '/operator/login' : '/login';
    const response = NextResponse.redirect(url);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

// Tentukan path mana saja yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path KECUALI yang dimulai dengan:
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file ikon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
