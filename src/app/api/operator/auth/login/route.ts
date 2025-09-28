import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import * as jose from 'jose';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username dan password diperlukan.' }, { status: 400 });
    }

    // 1. Cari operator berdasarkan username
    const stmt = db.prepare('SELECT id, username, password_hash FROM operators WHERE username = ?');
    const operator = stmt.get(username) as { id: number; username: string; password_hash: string } | undefined;

    if (!operator) {
      return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
    }

    // 2. Verifikasi password
    const isPasswordValid = await verifyPassword(password, operator.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
    }

    // 3. Buat JWT dengan klaim khusus operator
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({
      id: operator.id,
      username: operator.username,
      isOperator: true, // Klaim pembeda antara operator dan pengguna biasa
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d') // Sesi operator berlaku 1 hari
      .sign(secret);

    // 4. Atur cookie
    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 1, // 1 hari
    });

    return new NextResponse(JSON.stringify({ message: 'Login berhasil!' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    console.error('[API Operator Login] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
