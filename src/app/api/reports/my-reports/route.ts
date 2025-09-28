import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

// Fungsi helper untuk mendapatkan payload dari token
async function getAuthPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    throw new Error('Token autentikasi tidak ditemukan.');
  }
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as { id: number; phone: string, isOperator?: boolean };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi sesi dan dapatkan ID pengguna
    const user = await getAuthPayload(request);

    // Pastikan ini bukan operator
    if (user.isOperator) {
        return NextResponse.json({ message: 'Endpoint ini hanya untuk pengguna biasa.' }, { status: 403 });
    }

    // 2. Ambil semua laporan dari database yang cocok dengan user_id
    const stmt = db.prepare(
      'SELECT id, status, created_at, media_url FROM reports WHERE user_id = ? ORDER BY created_at DESC'
    );
    const reports = stmt.all(user.id);

    return NextResponse.json(reports);

  } catch (error: any) {
    if (error.message.includes('autentikasi')) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
    }
    console.error('[API Get My Reports] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
