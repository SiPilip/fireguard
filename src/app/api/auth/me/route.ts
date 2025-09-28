import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

export async function GET(request: NextRequest) {
  // Middleware sudah melindungi rute API, tapi kita verifikasi lagi di sini
  // untuk mendapatkan payload token.
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Token tidak ditemukan.' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Kirim kembali payload yang berisi data pengguna/operator
    return NextResponse.json(payload);
    
  } catch (error) {
    return NextResponse.json({ message: 'Token tidak valid atau kedaluwarsa.' }, { status: 401 });
  }
}
