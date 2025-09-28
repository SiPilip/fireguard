import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOtp } from '@/lib/auth';
import * as jose from 'jose';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ message: 'Nomor telepon dan OTP diperlukan.' }, { status: 400 });
    }

    // 1. Ambil percobaan OTP terbaru dari database
    const stmt = db.prepare(
      'SELECT otp_hash, expires_at FROM otp_attempts WHERE phone_number = ? ORDER BY id DESC LIMIT 1'
    );
    const attempt = stmt.get(phoneNumber) as { otp_hash: string; expires_at: string } | undefined;

    if (!attempt) {
      return NextResponse.json({ message: 'OTP tidak ditemukan atau sudah kedaluwarsa.' }, { status: 400 });
    }

    // 2. Cek apakah OTP sudah kedaluwarsa
    if (new Date() > new Date(attempt.expires_at)) {
      return NextResponse.json({ message: 'OTP sudah kedaluwarsa.' }, { status: 400 });
    }

    // 3. Verifikasi OTP
    const isValid = verifyOtp(otp, attempt.otp_hash);
    if (!isValid) {
      return NextResponse.json({ message: 'Kode OTP salah.' }, { status: 400 });
    }

    // 4. Hapus OTP yang sudah terpakai
    db.prepare('DELETE FROM otp_attempts WHERE phone_number = ?').run(phoneNumber);

    // 5. Cari atau buat pengguna baru
    let user = db.prepare('SELECT id, phone_number FROM users WHERE phone_number = ?').get(phoneNumber) as { id: number; phone_number: string } | undefined;
    if (!user) {
      const result = db.prepare('INSERT INTO users (phone_number) VALUES (?)').run(phoneNumber);
      user = { id: result.lastInsertRowid as number, phone_number: phoneNumber };
    }

    // 6. Buat JWT (JSON Web Token) menggunakan jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, phone: user.phone_number })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // 7. Atur cookie di browser
    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return new NextResponse(JSON.stringify({ message: 'Login berhasil!' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    console.error('[API Verify OTP] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
